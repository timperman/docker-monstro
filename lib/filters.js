(function() {
    var _ = require('underscore');

	module.exports = {
		exposedPort: function(port) {
    		return function(container) {
    			return _.has(container.Config.ExposedPorts, port + "/tcp");
    		};
    	},

    	compose: function(composeConfig) {
    		return function(container) {
    			var namePrefix = composeConfig.project + "_" + composeConfig.service + "_";
    			return (container.Name.lastIndexOf(namePrefix, 0) === 0);
    		};
    	},

    	image: function(image) {
    		return function(container) { return container.Image == image; };
    	}
    };

}());