var express = require('express');

module.exports = function(dockerMonitor) {
	var api = express(),
	    router = express.Router(),
	    allowKill = false;

	router.get('/containers', function(req, res) {
		res.json(dockerMonitor.getContainers());
	});

	router.get('/reload', function(req, res) {
		dockerMonitor.reloadContainers();
		res.json({ success: true });
	});

	router.get('/kill', function(req, res) {
		res.json({ killAllowed: allowKill });
		if ( allowKill ) {
			console.log("Kill signal received from API, shutting down...");
			process.exit();
		}
	});

	api.use('/api', router);

	return {
		allowRemoteKill: function(flag) {
			allowKill = flag;
		},

		listen: function(port) {
			api.listen(port);
		}
	};
};