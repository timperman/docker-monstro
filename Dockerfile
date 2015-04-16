FROM node

MAINTAINER Brett Timperman <brett.timperman@gmail.com>

ENV MONSTRO_CONFIG_PATH /config/config.json

ADD package.json /package.json
ADD server.js /server.js
ADD config.json /config/config.json
ADD lib /lib

RUN npm install

ENTRYPOINT [ "node", "server.js" ]