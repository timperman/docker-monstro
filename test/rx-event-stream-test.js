var rxEventStream = require('../lib/rx-event-stream'),
	expect = require("chai").expect,
	sinon = require("sinon"),
	EventEmitter = require("events").EventEmitter,
	mockStream = new EventEmitter();
 
describe("Rx Event Stream", function(){
    describe("create()", function(){
        it("should wrap event stream in observable", function(done){
			var stream = rxEventStream.create();

			stream.observable.subscribe(
				function(e) { done(); }
			);

			stream.attach(undefined, mockStream);

			mockStream.emit('data', new Buffer("{}"));
        });

        it("should invoke observable on error", function(){
			var stream = rxEventStream.create(),
			    nextHandler = sinon.spy(),
			    errorHandler = sinon.spy(),
			    completedHandler = sinon.spy();

			stream.observable.subscribe(
				nextHandler,
				errorHandler,
				completedHandler
			);

			stream.attach(undefined, mockStream);
			try {
				mockStream.emit('error', new Error());
			}
			catch (err) {
				// expected
			}

			expect(nextHandler).to.have.not.been.called;
			expect(errorHandler).to.have.been.called;
			expect(completedHandler).to.have.not.been.called;
        });

        it("should complete on initialization error", function(){
			var stream = rxEventStream.create(),
			    nextHandler = sinon.spy(),
			    errorHandler = sinon.spy(),
			    completedHandler = sinon.spy();

			stream.observable.subscribe(
				nextHandler,
				errorHandler,
				completedHandler
			);

			stream.attach("ERROR!!", mockStream);

			expect(nextHandler).to.have.not.been.called;
			expect(errorHandler).to.have.been.called;
			expect(completedHandler).to.have.been.called;
        });

        it("should invoke observable on close", function(){
			var stream = rxEventStream.create(),
			    nextHandler = sinon.spy(),
			    errorHandler = sinon.spy(),
			    completedHandler = sinon.spy();

			stream.observable.subscribe(
				nextHandler,
				errorHandler,
				completedHandler
			);

			stream.attach(undefined, mockStream);
			mockStream.emit('close');

			expect(nextHandler).to.have.not.been.called;
			expect(errorHandler).to.have.not.been.called;
			expect(completedHandler).to.have.been.called;
        });

        it("should invoke observable on end", function(){
			var stream = rxEventStream.create(),
			    nextHandler = sinon.spy(),
			    errorHandler = sinon.spy(),
			    completedHandler = sinon.spy();

			stream.observable.subscribe(
				nextHandler,
				errorHandler,
				completedHandler
			);

			stream.attach(undefined, mockStream);
			mockStream.emit('end');

			expect(nextHandler).to.have.not.been.called;
			expect(errorHandler).to.have.not.been.called;
			expect(completedHandler).to.have.been.called;
        });
    });
});