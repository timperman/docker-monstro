var express = require('express');

module.exports = function(dockerMonitor) {
	var api = express();
	var router = express.Router();

	router.get('/containers', function(req, res) {
		res.json(dockerMonitor.getContainers());
	});

	api.use('/api', router);

	return {
		listen: function(port) {
			api.listen(port);
		}
	};
};