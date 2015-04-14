var Rx = require('rx');

module.exports = {

	create: function() {
		var _observer;

		return {
			observable: Rx.Observable.create(function(observer) { _observer = observer; }),

			attach: function(err, stream) {
				if (err) {
					_observer.onError(err);
					_observer.onCompleted();
				}
				else {
					console.log("Attached to Docker event stream");
					
					stream.on('data', function(buffer) {
					  _observer.onNext(JSON.parse(buffer.toString('utf8')));
					});

					stream.on('error', function(e) { _observer.onError(e); });

					stream.on('close', function() { _observer.onCompleted(); });

					stream.on('end', function() { _observer.onCompleted(); });
				}
			}
		};
	}
};