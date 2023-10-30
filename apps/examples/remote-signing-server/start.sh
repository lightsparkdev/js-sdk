#!/bin/bash

# See https://github.com/TypeStrong/ts-node/issues/1997#issuecomment-1774047586
# ts-node has a known issue with es modules in Node.js 20 and above so we need to
# run with a different command to workaround with a warning:

# Get the Node.js version and remove the 'v' prefix
NODE_VERSION=$(node -v | cut -c 2-)

# Split the version string into major, minor, and patch numbers
IFS='.' read -ra VERSION_PARTS <<< "$NODE_VERSION"

if (( ${VERSION_PARTS[0]} >= 20 )); then
  CMD="node --loader ts-node/esm"
elif (( ${VERSION_PARTS[0]} == 18 )); then
  CMD="ts-node"
else
  echo "Only Node.js versions 18 and above are supported"
fi

yarn nodemon --watch 'src/*.ts' --exec $CMD src/startServer.ts
