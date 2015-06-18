(function() {
    var _ = require('underscore'),
        os = require('os');
    var filters = {};
    var reservedVars = {
    	"HOSTNAME": os.hostname()
    };

    filters.exposedPort = function(port) {
		return function(container) {
			return _.has(container.Config.ExposedPorts, port + "/tcp");
		};
	};

	filters.compose = function(composeConfig) {
		return function(container) {
			if ( !container.Name ) return false;

			var namePrefix = "/" + composeConfig.project + "_" + composeConfig.service + "_";
			return (container.Name.lastIndexOf(namePrefix, 0) === 0);
		};
	};

	var getImageName = function(image) {
		if (_.isString(image)) return image;
		return (_.has(image, "tag")) ? image.name + ":" + image.tag : image.name + ":latest";
	}

	filters.image = function(image) {
		return function(container) { return container.Config.Image == getImageName(image); };
	};

	var transformConfig = function(config) {
		if ( _.isObject(config) ) {
		    return _.mapObject(config, function(value) {
		       return transformConfig(value);
		    });
		}

		if ( _.isString(config) ) {
			if ( config.lastIndexOf("$", 0) === 0 ) {
				return process.env[config.substr(1)];
			}

			if ( config.lastIndexOf("%", 0) === 0 ) {
				return reservedVars[config.substr(1)];
			}
		}

		return config;
	};

	module.exports = {
		filterFunction: function(name, config) {
    		if ( !_.has(filters, name) ) return function(input) { return true; };
    		var transformedConfig = transformConfig(config);

    		return function(input) {
    			return filters[name]
    			    .call(undefined, transformedConfig)
    			    .call(undefined, input);
    		};
		}
	};
}());
