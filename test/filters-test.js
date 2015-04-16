var expect = require("chai").expect;
var filters = require("../lib/filters.js");
var _ = require("underscore");
 
describe("Filters", function(){
    describe("exposedPort()", function(){
        it("should filter containers with the port exposed", function(){
			var containers = [
				{ ID: 1, Config: { ExposedPorts: { "80/tcp": {}, "8081/tcp": {} } } },
				{ ID: 2, Config: { ExposedPorts: { "80/tcp": {}, "8080/tcp": {} } } }
			];

			expect(_.filter(containers, filters.exposedPort(8080)).length).to.be.eq(1);
			expect(_.filter(containers, filters.exposedPort(80)).length).to.be.eq(2);
		 	expect(_.filter(containers, filters.exposedPort(9080)).length).to.be.eq(0);
        });
    });

    describe("compose()", function(){
        it("should filter containers with the compose project and service name", function(){
			var containers = [
				{ ID: 1, Name: "/randomly-assigned" },
				{ ID: 2, Name: "/dev_site_1" },
				{ ID: 3, Name: "/dev_site_2" },
				{ ID: 4, Name: "/test_site_1" },
				{ ID: 5, Name: "/dev_db_1" }
			];
       	 
			expect(_.filter(containers, filters.compose({ project: "dev", service: "site" })).length).to.be.eq(2);
			expect(_.filter(containers, filters.compose({ project: "test", service: "site" })).length).to.be.eq(1);
			expect(_.filter(containers, filters.compose({ project: "test", service: "db" })).length).to.be.eq(0);
        });
    });

    describe("image()", function(){
        it("should filter containers with the image name", function(){
        	var containers = [
				{ ID: 1, Image: "ubuntu" },
				{ ID: 2, Image: "redis" },
				{ ID: 3, Image: "custom/container" },
				{ ID: 4, Image: "custom/container:v1" },
				{ ID: 5, Image: "custom/container:v1" }
			];
       	 
			expect(_.filter(containers, filters.image("redis")).length).to.be.eq(1);
			expect(_.filter(containers, filters.image("custom/container")).length).to.be.eq(1);
			expect(_.filter(containers, filters.image("custom/container:v1")).length).to.be.eq(2);
			expect(_.filter(containers, filters.image("custom/container:v2")).length).to.be.eq(0);
			
        });
    });
});