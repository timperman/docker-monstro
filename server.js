var nconf = require('nconf'),
    monstro = require('./lib/index');

nconf.env().argv().file('config.json');
monstro({ swarm: nconf.get('swarm'), servers: nconf.get('servers') }).start();
