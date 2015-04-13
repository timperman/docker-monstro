var filters = require('./filters'),
    monitor = require('./docker-monitor'),
    _ = require('underscore'),
    http = require('http'),
    httpProxy = require('http-proxy'),
    url = require('url');

var resolvePath = function(server, request) {
  var requestUrl = url.parse(request.url);
  return ( _.has(server.paths, 'pathname') )
    ? server.paths[requestUrl.pathname]
    : undefined;
}

var init = function(configuration) {
  var swarm = configuration.swarm;
  var servers = configuration.servers;

  var dockerMonitor = monitor(swarm);
   
  var proxy = httpProxy.createProxyServer({});

  return {
    start: function() {
      _.each(servers, function(server) {
        var proxyServer = http.createServer(function(req, res) {
          var path = resolvePath(server, req);
          var proxyTarget = dockerMonitor.getProxyTarget();
          if ( _.has(path, 'headers') ) {
            _.each(path.headers, function(value, key) {
              req.headers[key] = value;
            });
          }
          proxy.web(req, res, { target: proxyTarget });
        });
        
        proxyServer.listen(server.port);
      });
    }
  };
};

module.exports = init;