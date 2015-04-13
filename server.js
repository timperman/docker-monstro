var nconf = require('nconf'),
    drone = require('./lib/index');

nconf.env().argv().file('config.json');
drone({ swarm: nconf.get('swarm'), servers: nconf.get('servers') }).start();
