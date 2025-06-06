#! /bin/bash

LIGHTSPARK_UMA_RECEIVER_USER="bob"

if [ "$1" == "test" ]; then
  TEST_CMD="node --experimental-vm-modules $(yarn bin jest) --no-cache --runInBand --bail"
elif [ "$1" == "start" ]; then
  TEST_CMD="yarn start"
else
  exit 1
fi

# Run tests or start test server with test secrets
LIGHTSPARK_UMA_RECEIVER_USER=$LIGHTSPARK_UMA_RECEIVER_USER \
LIGHTSPARK_EXAMPLE_BASE_URL=$LIGHTSPARK_EXAMPLE_BASE_URL \
$TEST_CMD
