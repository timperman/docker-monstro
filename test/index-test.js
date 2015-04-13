var expect = require("chai").expect,
	sinon = require("sinon"),
	http = require("http"),
    rewire = require("rewire");

var monstro = rewire("../lib/index.js"),
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
	monstro.__set__("monitor", mockMonitor);
	monstro.__set__("http", mockHttp);
	monstro.__set__("httpProxy", mockHttpProxy);
});

describe("Monstro", function(){
	describe("start()", function(){
        it("should invoke the monitor on init", function(){
        	var testMonstro = monstro({});
        	expect(mockMonitor).to.have.been.called;
        });

        it("should listen to all ports in the configuration", function(){
        	var testMonstro = monstro({ servers: [ { port: 8080 }, { port: 9080 } ]});
        	testMonstro.start();
        	sinon.assert.calledWith(mockServer.listen, 8080);
        	sinon.assert.calledWith(mockServer.listen, 9080);
        });

        it("should proxy with result of monitor.getProxyTarget", function(){
        	var mockRequest = { url: "/", headers: {} };
        	var mockResponse = {};
        	var testMonstro = monstro({ servers: [ { paths: { "/": {} } } ] });
        	mockDockerMonitor.getProxyTarget.returns("google.com");
        	testMonstro.start();
        	mockHttp.createServer.args[0][0](mockRequest, mockResponse);
        	sinon.assert.calledWith(mockProxy.web, mockRequest, mockResponse, { target: "google.com" });
        });
    });
});