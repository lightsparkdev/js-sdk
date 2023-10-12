#! /bin/bash

if [ "$1" == "test" ]; then
  TEST_CMD="node --experimental-vm-modules $(yarn bin jest) --no-cache --runInBand --bail"
elif [ "$1" == "start" ]; then
  TEST_CMD="yarn start"
else
  exit 1
fi
