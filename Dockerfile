FROM node

ENV REMOTE_HOST http://localhost
ENV REMOTE_PORT 2376
ENV EXPOSED_PORT 8080
ENV COMPOSE_PROJECT_NAME dev
ENV COMPOSE_SERVICE_NAME site

ADD . /
ADD docker/entrypoint.sh /entrypoint.sh
ADD docker/config.json /config/config.json

RUN npm install && \
    chmod 777 /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]
