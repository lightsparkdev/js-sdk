#! /bin/bash

# Test secrets:
RK_WEBHOOK_SECRET="39kyJO140v7fYkwHnR7jz8Y3UphqVeNYQk44Xx049ws"
RK_MASTER_SEED_HEX="1a6deac8f74fb2e332677e3f4833b5e962f80d153fb368b8ee322a9caca4113d56cccd88f1c6a74e152669d8cd373fee2f27e3645d80de27640177a8c71395f8"

if [ "$1" == "test" ]; then
  TEST_CMD="node --experimental-vm-modules $(yarn bin jest) --no-cache --runInBand --bail"
elif [ "$1" == "start" ]; then
  TEST_CMD="yarn start"
else
  exit 1
fi

# Run tests or start test server with test secrets
RK_WEBHOOK_SECRET=$RK_WEBHOOK_SECRET RK_MASTER_SEED_HEX=$RK_MASTER_SEED_HEX $TEST_CMD
