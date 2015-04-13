FROM node

ADD . /

RUN npm install

ENTRYPOINT [ "node" ]
CMD [ "server.js" ]