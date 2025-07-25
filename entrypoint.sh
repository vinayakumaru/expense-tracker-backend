#!/bin/sh

cd build

node ace migration:run --force

node ace db:seed --force

npm ci --omit="dev"

node bin/server.js