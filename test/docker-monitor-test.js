var expect = require("chai").expect,
	sinon = require("sinon"),
    rewire = require("rewire");

var monitor = rewire("../lib/docker-monitor.js"),
	mockFs = { readFileSync: sinon.stub() },
	mockRxEventStream = { observable: {}, attach: sinon.spy() },
	mockDocker = sinon.stub(),
	mockDockerNode = { listContainers: sinon.stub(), getContainer: function() {}, getEvents: sinon.stub() },
	mockRepository = { get: sinon.stub(), contains: sinon.stub(), add: sinon.spy(), remove: sinon.spy() };

var devConfig = {
    host: "192.168.99.101",
    port: 3376,
    protocol: "https",
    certPath: "/Users/user/.docker/machine/machines/swarm-master"
};

var testConfig = {
    host: "192.168.99.102",
    port: 2376
};

var mockObserver = {};

before(function() {
	mockFs.readFileSync.returns(new Buffer("file"));
	mockDocker.returns(mockDockerNode);

	sinon.stub(mockDockerNode, 'getContainer', function(c) {
		var obj = { inspect: function() {} };
		sinon.stub(obj, 'inspect', function(callback) {
			callback(undefined, { Id: c });
		});
		return obj;
	});
	mockRxEventStream.observable = {
		subscribe: function(onNextCallback, onErrorCallback, onCompletedCallback) {
			mockObserver.next = function(e) { onNextCallback(e); };
			mockObserver.error = function(e) { onErrorCallback(e); };
			mockObserver.completed = function(e) { onCompletedCallback(e); };
		}
	};

	monitor.__set__("fs", mockFs);
	monitor.__set__("Docker", mockDocker);
	monitor.__set__("containerRepository", { create: function() { return mockRepository; } });
	monitor.__set__("rxEventStream", { create: function() { return mockRxEventStream; } });
});

beforeEach(function() {
	mockDockerNode.listContainers.reset();
	mockRepository.add.reset();
});

describe("Docker monitor", function(){
	describe("init()", function(){
        it("should map swarm configuration", function(){
        	var dockerMonitor = monitor({ dev: devConfig, test: testConfig });
        	expect(mockDocker.args[0][0].host).to.eq("192.168.99.101");
        	expect(mockDocker.args[0][0].ca.toString()).to.eq("file");
        	expect(mockDocker.args[1][0].host).to.eq("192.168.99.102");
        	expect(mockDocker.args[1][0].ca).to.be.undefined;
        });

        it("should list current containers", function(){
			mockDockerNode.listContainers.yields(undefined, [ { Id: "00" }, { Id: "01" }, { Id: "02" } ]);
        	var dockerMonitor = monitor({ dev: devConfig });

        	sinon.assert.calledOnce(mockDockerNode.listContainers);
        	sinon.assert.calledThrice(mockRepository.add);
        	expect(mockRepository.add.args[0][0].Id).to.eq("00");
        	expect(mockRepository.add.args[1][0].Id).to.eq("01");
        	expect(mockRepository.add.args[2][0].Id).to.eq("02");
        });

        it("should attach to Docker event stream", function(){
			var mockStream = sinon.spy();
        	mockDockerNode.getEvents.yields(undefined, mockStream);
        	var dockerMonitor = monitor({ dev: devConfig, test: testConfig });

        	sinon.assert.calledWith(mockRxEventStream.attach, undefined, mockStream);
        });

        it("should react to observable start events", function(){
			var mockStream = sinon.spy();
        	mockDockerNode.getEvents.yields(undefined, mockStream);
        	mockRepository.contains.withArgs("00").returns(true);
        	var dockerMonitor = monitor({ dev: devConfig });

        	mockObserver.next({ status: "start", id: "04" });
        	mockObserver.next({ status: "start", id: "05" });
        	mockObserver.next({ status: "start", id: "00" });

        	expect(mockRepository.add.args[0][0].Id).to.eq("01");
        	expect(mockRepository.add.args[1][0].Id).to.eq("02");
        	expect(mockRepository.add.args[2][0].Id).to.eq("04");
        	expect(mockRepository.add.args[3][0].Id).to.eq("05");
        });

        it("should react to observable stop events", function(){
			var mockStream = sinon.spy();
        	mockDockerNode.getEvents.yields(undefined, mockStream);
        	var dockerMonitor = monitor({ dev: devConfig });

        	mockObserver.next({ status: "start", id: "04" });
        	mockObserver.next({ status: "stop", id: "01" });
        	mockObserver.next({ status: "stop", id: "04" });

        	sinon.assert.calledThrice(mockRepository.add);
        	expect(mockRepository.add.args[0][0].Id).to.eq("01");
        	expect(mockRepository.add.args[1][0].Id).to.eq("02");
        	expect(mockRepository.add.args[2][0].Id).to.eq("04");
        	sinon.assert.calledTwice(mockRepository.remove);
        	expect(mockRepository.remove.args[0][0]).to.eq("01");
        	expect(mockRepository.remove.args[1][0]).to.eq("04");
        });
    });

	describe("getProxyTarget", function() {
		it("should filter containers in repository", function() {
			var dockerMonitor = monitor({ dev: devConfig });
			var container1 = { Id: 1, Node: { IP: "1.1" }, Config: { ExposedPorts: { "8080/tcp": {} } }, NetworkSettings: { Ports: { "8080/tcp": [ { HostPort: 1234 } ] } } };
			var container2 = { Id: 2, Node: { IP: "1.2" }, Config: { ExposedPorts: { "9080/tcp": {} } }, NetworkSettings: { Ports: { "9080/tcp": [ { HostPort: 5678 } ] } } };

			mockRepository.get.returns([ container1, container2 ]);

			var target = dockerMonitor.getProxyTarget({ swarm: "dev", filters: { exposedPort: 8080 } });

			expect(target).to.eq("http://1.1:1234");
		});


		it("should match exposed port", function() {
			var dockerMonitor = monitor({ dev: devConfig });
			var container1 = { Node: { IP: "2.1" }, Config: { ExposedPorts: { "9080/tcp": {}, "8080/tcp": {} } },
				NetworkSettings: { Ports: { "9080/tcp": [ { HostPort: 9876 } ], "8080/tcp": [ { HostPort: 1234 }, { HostPort: 4567 } ] } } };

			mockRepository.get.returns([ container1 ]);
			var target = dockerMonitor.getProxyTarget({ swarm: "dev", filters: { exposedPort: 8080 } });
			expect(target).to.eq("http://2.1:1234");
		});
	});
});