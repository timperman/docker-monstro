var filters = require('./filters'),
	rxEventStream = require('./rx-event-stream'),
	_ = require('underscore'),
	fs = require('fs'),
  	Docker = require('dockerode'),
  	containerRepository = require('./container-repository');

var init = function(swarm) {
	var monitor = {};

	var metaData = _.mapObject(
		swarm,
		function(swarmConfig, key) { 
			var repository = containerRepository.create();

			var apiConfig = _.extend(swarmConfig, !_.has(swarmConfig, 'certPath') ? {} :
				{
					"ca": fs.readFileSync(swarmConfig.certPath + "/ca.pem"),
					"cert": fs.readFileSync(swarmConfig.certPath + "/cert.pem"),
					"key": fs.readFileSync(swarmConfig.certPath + "/key.pem")
				});

			var swarmNode = new Docker(apiConfig);

		    var registerContainer = function(containerId) {
				if ( !repository.contains(containerId) ) {
					var dockerContainer = swarmNode.getContainer(containerId);
					dockerContainer.inspect(function (err, data) {
						if (err) throw err
						repository.add(data);
					});
				}	
		    };

			console.log("Retrieving list of containers");
			swarmNode.listContainers(function(err, containers) {
				if (err) throw err
				console.log(containers.length + " running containers on host");
				_.each(containers, function(c) {
					registerContainer(c.Id);
				});
			});

			console.log("Attaching to Docker event stream");
			var stream = rxEventStream.create();
			swarmNode.getEvents(stream.attach);

			stream.observable.subscribe(function(dockerEvent) {
				if ( dockerEvent.status == 'start' ) {
					registerContainer(dockerEvent.id);
				}
				else if ( dockerEvent.status == 'stop' ) {
					repository.remove(dockerEvent.id);
				}
			});

		    return repository;
	  	}
	);

	monitor.getProxyTarget = function(path) {
		if (!path) return undefined;
		var repository = metaData[path.swarm];
		if (!repository) return undefined;

		var eligibleContainers = _.filter(repository.get(), function(container) {
			return _.every(path.filters, function(filter, key) {
				if ( _.has(filters, key) && !filters[key].call(undefined, filter).call(undefined, container) ) {
					console.log('Filter ' + key + ' disqualified container ' + container.Id);
					return false;
				}
				return true;
			});
		});

		if (eligibleContainers.length > 0) {
			var electedContainer = _.sample(eligibleContainers);
			var port = ( _.has(path.filters, "exposedPort") )
				? _.first(electedContainer.NetworkSettings.Ports[path.filters.exposedPort + "/tcp"])
				: _.first(_.first(_.values(electedContainer.NetworkSettings.Ports)));
			
			return 'http://' + electedContainer.Node.IP + ':' + port.HostPort;
		}

		return undefined;
	};

	return monitor;
};

module.exports = init;