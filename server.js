var nconf = require('nconf'),
    monstro = require('./lib/index');

nconf.env().argv().file(process.env.MONSTRO_CONFIG_PATH || 'config/config.json');
monstro(nconf.get()).start();
