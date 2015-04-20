var containerRepository = require('../lib/container-repository'),
    expect = require("chai").expect;

describe("Container repository", function(){
	describe("create()", function(){
		it("should initialize an empty set", function() {
			var repository = containerRepository.create();
			expect(repository.get()).to.be.empty;
		});

		it("should add containers", function() {
			var repository = containerRepository.create();
			repository.add({ Id: "1a2b3c" });
			repository.add({ Id: "2a3b4c" });
			expect(repository.get()[0].Id).to.eq("1a2b3c");
			expect(repository.get()[1].Id).to.eq("2a3b4c");
		});

		it("should remove containers", function() {
			var repository = containerRepository.create();
			repository.add({ Id: "1a2b3c" });
			repository.add({ Id: "2a3b4c" });
			repository.add({ Id: "3a4b5c" });
			repository.remove("2a3b4c");
			expect(repository.get()[0].Id).to.eq("1a2b3c");
			expect(repository.get()[1].Id).to.eq("3a4b5c");

			repository.remove("4a5b6c");
			expect(repository.get().length).to.eq(2);
			
			repository.remove("1a2b3c");
			expect(repository.get()[0].Id).to.eq("3a4b5c");
		});

		it("should clear containers", function() {
			var repository = containerRepository.create();
			repository.add({ Id: "1a2b3c" });
			repository.add({ Id: "2a3b4c" });
			expect(repository.get()[0].Id).to.eq("1a2b3c");
			expect(repository.get()[1].Id).to.eq("2a3b4c");
			expect(repository.get().length).to.eq(2);
			
			repository.clear();
			expect(repository.get().length).to.eq(0);
			repository.add({ Id: "1a2b3c" });
			expect(repository.get()[0].Id).to.eq("1a2b3c");
			expect(repository.get().length).to.eq(1);
		});
	});
});