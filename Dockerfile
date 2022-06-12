FROM alpine:3.10

RUN apk add --no-cache \
  build-base \
  nodejs \
  npm \
  python2

WORKDIR /code

COPY package.json .

RUN npm install
