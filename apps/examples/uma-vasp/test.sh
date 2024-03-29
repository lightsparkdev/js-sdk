#! /bin/bash

LIGHTSPARK_UMA_RECEIVER_USER="bob"
LIGHTSPARK_UMA_ENCRYPTION_PUBKEY="04b8555255fe93431754a6a69d370aa3ecbfc1a71e7f740f1f98c082af35e1d565a1e30b342009146778f4da28f186fd2e0ddca13a12b925a30b96a0c5c0c34126"
LIGHTSPARK_UMA_ENCRYPTION_PRIVKEY="b832d0e6a72dc3948b71bf4aa2c789aa0714f6632b0d717eff6423955bb039ce"
LIGHTSPARK_UMA_SIGNING_PUBKEY="04b8555255fe93431754a6a69d370aa3ecbfc1a71e7f740f1f98c082af35e1d565a1e30b342009146778f4da28f186fd2e0ddca13a12b925a30b96a0c5c0c34126"
LIGHTSPARK_UMA_SIGNING_PRIVKEY="b832d0e6a72dc3948b71bf4aa2c789aa0714f6632b0d717eff6423955bb039ce"

if [ "$1" == "test" ]; then
  TEST_CMD="node --experimental-vm-modules $(yarn bin jest) --no-cache --runInBand --bail"
elif [ "$1" == "start" ]; then
  TEST_CMD="yarn start"
else
  exit 1
fi

# Run tests or start test server with test secrets
LIGHTSPARK_API_TOKEN_CLIENT_ID=$LIGHTSPARK_API_TOKEN_CLIENT_ID \
LIGHTSPARK_API_TOKEN_CLIENT_SECRET=$LIGHTSPARK_API_TOKEN_CLIENT_SECRET \
LIGHTSPARK_UMA_NODE_ID=$LIGHTSPARK_UMA_NODE_ID \
LIGHTSPARK_UMA_RECEIVER_USER=$LIGHTSPARK_UMA_RECEIVER_USER \
LIGHTSPARK_UMA_ENCRYPTION_PUBKEY=$LIGHTSPARK_UMA_ENCRYPTION_PUBKEY \
LIGHTSPARK_UMA_ENCRYPTION_PRIVKEY=$LIGHTSPARK_UMA_ENCRYPTION_PRIVKEY \
LIGHTSPARK_UMA_SIGNING_PUBKEY=$LIGHTSPARK_UMA_SIGNING_PUBKEY \
LIGHTSPARK_UMA_SIGNING_PRIVKEY=$LIGHTSPARK_UMA_SIGNING_PRIVKEY \
LIGHTSPARK_EXAMPLE_BASE_URL=$LIGHTSPARK_EXAMPLE_BASE_URL \
$TEST_CMD
