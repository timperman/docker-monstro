FROM node

MAINTAINER Brett Timperman <brett.timperman@gmail.com>

ENV MONSTRO_CONFIG_PATH /monstro/config/config.json

ADD . /monstro

WORKDIR /monstro
RUN mkdir -p /monstro/config && \
    mv /monstro/config.json /monstro/config/config.json && \
    npm install

ENTRYPOINT [ "node", "server.js" ]
