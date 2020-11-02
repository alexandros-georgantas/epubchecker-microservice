FROM node:12-alpine

RUN apk update && apk add unzip openjdk11-jre-headless git

RUN mkdir -p /home/node/epub-checker/node_modules && chown -R node:node /home/node/epub-checker

WORKDIR /home/node/epub-checker

# Install JS dependencies
USER node
COPY --chown=node:node package.json ./package.json
COPY --chown=node:node yarn.lock ./yarn.lock


RUN yarn

COPY --chown=node:node . .
RUN chmod +x ./scripts/startServer.sh
RUN chmod +x ./scripts/wait-for-postgres.sh

ENTRYPOINT . scripts/startServer.sh