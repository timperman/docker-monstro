var _ = require('underscore'),
    url = require('url');

module.exports = {
	resolvePath: function(server, request) {
		var requestUrl = url.parse(request.url);
		var pathname = (requestUrl.pathname) ? requestUrl.pathname : "/";

		var path = _.find(_.keys(_.omit(server.paths, "/")), function(pathKey) {
			var key = ( pathKey.indexOf("/", pathKey.length - 1) !== -1 ) ? pathKey : pathKey + "/";
			key = ( key.lastIndexOf("/", 0) === 0 ) ? key : "/" + key;
      return ( pathname.lastIndexOf(key, 0) === 0 || pathname === pathKey );
		});

		return ( server.paths ) ? ( path ? server.paths[path] : server.paths["/"] ) : undefined;
	}
};
