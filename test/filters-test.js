var expect = require("chai").expect,
    filters = require("../lib/filters.js"),
    _ = require("underscore"),
    os = require("os");
 
describe("Filters", function(){
    describe("exposedPort()", function(){
        it("should filter containers with the port exposed", function(){
			var containers = [
				{ ID: 1, Config: { ExposedPorts: { "80/tcp": {}, "8081/tcp": {} } } },
				{ ID: 2, Config: { ExposedPorts: { "80/tcp": {}, "8080/tcp": {} } } }
			];

			var filterFn = 
			expect(_.filter(containers, filters.filterFunction("exposedPort", 8080)).length).to.be.eq(1);
			expect(_.filter(containers, filters.filterFunction("exposedPort", 80)).length).to.be.eq(2);
		 	expect(_.filter(containers, filters.filterFunction("exposedPort", 9080)).length).to.be.eq(0);
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
       	 
			expect(_.filter(containers, filters.filterFunction("compose", { project: "dev", service: "site" })).length).to.be.eq(2);
			expect(_.filter(containers, filters.filterFunction("compose", { project: "test", service: "site" })).length).to.be.eq(1);
			expect(_.filter(containers, filters.filterFunction("compose", { project: "test", service: "db" })).length).to.be.eq(0);
        });
    });

    describe("image()", function(){
        it("should filter containers with the image name", function(){
        	var containers = [
				{ ID: 1, Config: { Image: "ubuntu:latest" } },
				{ ID: 2, Config: { Image: "redis:latest" } },
				{ ID: 3, Config: { Image: "custom/container:latest" } },
				{ ID: 4, Config: { Image: "custom/container:v1" } },
				{ ID: 5, Config: { Image: "custom/container:v1" } }
			];
       	 
			expect(_.filter(containers, filters.filterFunction("image", "redis:latest")).length).to.be.eq(1);
			expect(_.filter(containers, filters.filterFunction("image", "custom/container:latest")).length).to.be.eq(1);
			expect(_.filter(containers, filters.filterFunction("image", "custom/container:v1")).length).to.be.eq(2);
			expect(_.filter(containers, filters.filterFunction("image", "custom/container:v2")).length).to.be.eq(0);
			

			expect(_.filter(containers, filters.filterFunction("image", { name: "redis" })).length).to.be.eq(1);
			expect(_.filter(containers, filters.filterFunction("image", { name: "custom/container" })).length).to.be.eq(1);
			expect(_.filter(containers, filters.filterFunction("image", { name: "custom/container", tag: "v1" })).length).to.be.eq(2);
			expect(_.filter(containers, filters.filterFunction("image", { name: "custom/container", tag: "v2" })).length).to.be.eq(0);
        });
    });

    describe("transformValues()", function(){
        it("should replace environment values in configuration", function(){
        	var containers = [{ ID: 1, Image: "ubuntu", Name: "/" + process.env.USER_ID + "_site_1", Config: { ExposedPorts: { "80/tcp": {}, "8081/tcp": {} } } },
        		{ ID: 2, Image: "ubuntu", Name: "/" + os.hostname() + "_site_1", Config: { ExposedPorts: { "80/tcp": {}, "8081/tcp": {} } } }];
       	 
			var filtered = _.filter(containers, filters.filterFunction("compose", { "project": "$USER_ID", "service": "site" }));
			expect(filtered.length).to.eq(1);
			expect(filtered[0].ID).to.eq(1);
        });
    });

    describe("transformValues()", function(){
        it("should look up reserved variable values in configuration", function(){
        	var containers = [{ ID: 1, Image: "ubuntu", Name: "/" + process.env.USER_ID + "_site_1", Config: { ExposedPorts: { "80/tcp": {}, "8081/tcp": {} } } },
        		{ ID: 2, Image: "ubuntu", Name: "/" + os.hostname() + "_site_1", Config: { ExposedPorts: { "80/tcp": {}, "8081/tcp": {} } } }];
       	 
			var filtered = _.filter(containers, filters.filterFunction("compose", { "project": "%HOSTNAME", "service": "site" }));
			expect(filtered.length).to.eq(1);
			expect(filtered[0].ID).to.eq(2);
        });
    });
});