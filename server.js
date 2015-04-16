var nconf = require('nconf'),
    monstro = require('./lib/index');

nconf.env().argv().file(process.env.MONSTRO_CONFIG_PATH || 'config.json');
monstro(nconf.get()).start();