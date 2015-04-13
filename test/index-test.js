var expect = require("chai").expect,
	sinon = require("sinon"),
	http = require("http"),
    rewire = require("rewire");

var drone = rewire("../lib/index.js"),
	mockMonitor = sinon.stub(),
	mockDockerMonitor = { getProxyTarget: sinon.stub() },
	mockHttp = { createServer: sinon.stub() },
	mockHttpProxy = { createProxyServer: sinon.stub() },
	mockProxy = { web: sinon.spy() },
	mockServer = { listen: sinon.spy() };

before(function() {
	mockMonitor.returns(mockDockerMonitor);
	mockHttp.createServer.returns(mockServer);
	mockHttpProxy.createProxyServer.returns(mockProxy);
	drone.__set__("monitor", mockMonitor);
	drone.__set__("http", mockHttp);
	drone.__set__("httpProxy", mockHttpProxy);
});

describe("Drone", function(){
	describe("start()", function(){
        it("should invoke the monitor on init", function(){
        	var testDrone = drone({});
        	expect(mockMonitor).to.have.been.called;
        });

        it("should listen to all ports in the configuration", function(){
        	var testDrone = drone({ servers: [ { port: 8080 }, { port: 9080 } ]});
        	testDrone.start();
        	sinon.assert.calledWith(mockServer.listen, 8080);
        	sinon.assert.calledWith(mockServer.listen, 9080);
        });

        it("should proxy with result of monitor.getProxyTarget", function(){
        	var mockRequest = { url: "/", headers: {} };
        	var mockResponse = {};
        	var testDrone = drone({ servers: [ { paths: { "/": {} } } ] });
        	mockDockerMonitor.getProxyTarget.returns("google.com");
        	testDrone.start();
        	mockHttp.createServer.args[0][0](mockRequest, mockResponse);
        	sinon.assert.calledWith(mockProxy.web, mockRequest, mockResponse, { target: "google.com" });
        });
    });
});