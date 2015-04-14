#!/bin/bash

sed -i 's/%REMOTE_HOST%/'$REMOTE_HOST'/' /config/config.json
sed -i 's/%REMOTE_PORT%/'$REMOTE_PORT'/' /config/config.json
sed -i 's/%EXPOSED_PORT%/'$EXPOSED_PORT'/' /config/config.json
sed -i 's/%COMPOSE_PROJECT_NAME%/'$COMPOSE_PROJECT_NAME'/' /config/config.json
sed -i 's/%COMPOSE_SERVICE_NAME%/'$COMPOSE_SERVICE_NAME'/' /config/config.json

node server.js
