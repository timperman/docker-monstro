var _ = require('underscore');

module.exports = {
	create: function() {
		var containers = [];

		var containsContainer = function(containerId) {
			return _.any(containers, function(c) { return c.Id == containerId });
		};

		return {
			get: function() {
				return containers;
			},

			contains: containsContainer,

			add: function(container) {
		        if ( !containsContainer(container.Id) ) {
					containers.push(container);
		  	    }
		    },

			remove: function(containerId) {
				containers = _.reject(containers, function(c) { return c.Id == containerId; });
			}
		};
	}
};