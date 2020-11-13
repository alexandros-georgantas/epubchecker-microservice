FROM node:12-alpine

RUN apk update && apk add --no-cache unzip openjdk11-jre-headless git

WORKDIR /home/node/epub-checker


COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

RUN yarn


COPY . .

RUN chown -R node:node /home/node/epub-checker

RUN chmod +x ./scripts/wait-for-it.sh
RUN chmod +x ./scripts/create-client-start-server.sh

USER node

ENTRYPOINT . scripts/startServer.sh
