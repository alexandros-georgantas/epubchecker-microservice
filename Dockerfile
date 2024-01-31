FROM node:20.0.0-alpine3.16

RUN apk update && apk add --no-cache git bash unzip openjdk11-jre-headless

WORKDIR /home/node/epub-checker

RUN chown -R node:node /home/node/epub-checker

USER node

COPY --chown=node:node package.json ./package.json
COPY --chown=node:node yarn.lock ./yarn.lock

RUN yarn

COPY --chown=node:node . .

ENTRYPOINT ["sh", "./scripts/setupProdServer.sh"]

CMD ["node", "./server/startServer.js"]