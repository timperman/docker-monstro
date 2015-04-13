Docker Monstro
=======

A configurable dynamic proxy for Docker Swarm clusters. Carrying containers in the belly of the whale.

```
var monstro = require('docker-monstro');

var config = {}; // load config somehow
monstro(config).start();
```

Requests are proxied based on a combination of path matching and filtering. Monstro will consider a container eligible for proxying if all the filters in the path configuration return true. If more than one container is eligible, monstro will randomly choose one, resulting in "load balancing" between the eligible containers.

Monstro can also transform the proxied request by adding static request headers as defined by "headers" in the path configuration.

```Configuration
{
    "swarm": {
            "dev": {
                "host": "192.168.99.101",
                "port": 3376,
                "protocol": "https",
                "certPath": "/Users/user/.docker/machine/machines/swarm-master"
            }
        },
    "servers": [
        {
            "port": 8081,
            "paths": {
                "/": { 
                    "swarm": "dev",
                    "filters": {
                        "compose": {
                            "project": "dev",
                            "service": "site"
                        },
                        "exposedPort": 8080
                    },
                    "headers": {
                        "CustomHeader": "value"
                    }
                },
                "/cms": { 
                    "swarm": "dev",
                    "filters": {
                        "image": "cms:latest"
                    }
                }
            }
        },
        {
            "port": 27017,
            "paths": {
                "/": { 
                    "swarm": "dev",
                    "filters": {
                        "exposedPort": 27017
                    }
                }
            }
        }]
}
```
