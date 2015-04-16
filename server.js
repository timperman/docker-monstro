var nconf = require('nconf'),
    monstro = require('./lib/index');

nconf.env().argv().file('/config/config.json');
monstro(nconf.get()).start();
