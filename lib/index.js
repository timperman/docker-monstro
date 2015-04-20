var filters = require('./filters'),
    monitor = require('./docker-monitor'),
    api = require('./rest-api'),
    proxyUtils = require('./proxy-utils'),
    _ = require('underscore'),
    http = require('http'),
    httpProxy = require('http-proxy');

var init = function(configuration) {
  var swarm = configuration.swarm;
  var servers = configuration.servers;

  var dockerMonitor = monitor(swarm);

  var proxy = httpProxy.createProxyServer({});

  return {
    start: function() {
      _.each(servers, function(server) {
        var proxyServer = http.createServer(function(req, res) {
          var path = proxyUtils.resolvePath(server, req);
          var proxyTarget = dockerMonitor.getProxyTarget(path);
          if (!proxyTarget) {
            if ( server.debug ) console.log('no eligible containers found for request', req);
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

            if ( server.debug ) console.log('proxying request to', proxyTarget);

            proxy.web(req, res, { target: proxyTarget }, function(e) {
              console.log('error proxying request', e);
              res.statusCode = 500;
              res.end();
            });
          }
        });
        
        console.log("Listening on", server.port);
        proxyServer.listen(server.port);
      });

      if (configuration.api) {
        var rest = api(dockerMonitor);
        rest.allowRemoteKill(configuration.api.allowRemoteKill);
        rest.listen(configuration.api.port);
      }
    }
  };
};

module.exports = init;