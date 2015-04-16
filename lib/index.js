var filters = require('./filters'),
    monitor = require('./docker-monitor'),
    api = require('./rest-api'),
    _ = require('underscore'),
    http = require('http'),
    httpProxy = require('http-proxy'),
    url = require('url');

var resolvePath = function(server, request) {
  var requestUrl = url.parse(request.url);
  var pathname = (request.pathname) ? request.pathname : "/";
  return ( _.has(server.paths, pathname) )
    ? server.paths[pathname]
    : undefined;
};

var init = function(configuration) {
  var swarm = configuration.swarm;
  var servers = configuration.servers;

  var dockerMonitor = monitor(swarm);

  var proxy = httpProxy.createProxyServer({});

  return {
    start: function() {
      if (configuration.api)
        api(dockerMonitor).listen(configuration.api.port);

      _.each(servers, function(server) {
        var proxyServer = http.createServer(function(req, res) {
          var path = resolvePath(server, req);
          var proxyTarget = dockerMonitor.getProxyTarget(path);
          if (!proxyTarget) {
            res.statusCode = 404;
            res.statusMessage = 'No eligible containers found.';
            res.end();
          }
          else {
            if ( _.has(path, 'headers') ) {
              _.each(path.headers, function(value, key) {
                req.headers[key] = value;
              });
            }
            proxy.web(req, res, { target: proxyTarget });
          }
        });
        
        proxyServer.listen(server.port);
      });
    }
  };
};

module.exports = init;