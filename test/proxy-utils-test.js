var expect = require("chai").expect,
	sinon = require("sinon"),
	rewire = require("rewire");

var proxyUtils = rewire("../lib/proxy-utils"),
    mockUrl = { parse: sinon.stub() };

before(function() {
	proxyUtils.__set__("url", mockUrl);
});

describe("Proxy utils", function() {
	describe("resolvePath", function() {
		it("should match paths in configuration", function() {
			var serverConfig = {
				paths: {
					"/": { name: "default" },
					"api": { name: "api" },
					"/context1/": { name: "context1" },
					"/context2": { name: "context2" }
				}
			};

			mockUrl.parse.returns({ pathname: "/api/endpoint" });
			expect(proxyUtils.resolvePath(serverConfig, { url: "" }).name).to.eq("api");

			mockUrl.parse.returns({ pathname: "/unmatched/default" });
			expect(proxyUtils.resolvePath(serverConfig, { url: "" }).name).to.eq("default");

			mockUrl.parse.returns({ pathname: "/context12/endpoint" });
			expect(proxyUtils.resolvePath(serverConfig, { url: "" }).name).to.eq("default");

			mockUrl.parse.returns({ pathname: "/context1/endpoint" });
			expect(proxyUtils.resolvePath(serverConfig, { url: "" }).name).to.eq("context1");

			mockUrl.parse.returns({ pathname: "/context2" });
			expect(proxyUtils.resolvePath(serverConfig, { url: "" }).name).to.eq("context2");
		});
	});
});
