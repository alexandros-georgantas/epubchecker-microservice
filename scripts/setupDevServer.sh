#!/bin/sh
set -x
echo 'hhhhhhh'
# This is run through docker. Its CWD will be the root folder.
node_modules/.bin/pubsweet migrate
node scripts/seeds/createClient.js

exec "$@"
