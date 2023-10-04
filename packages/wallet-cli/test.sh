#!/bin/bash

# Validate that there are no CLI runtime errors. We've seen this happen with misconfigured module exports for example.

yarn cli help;

if [ $? -eq 0 ]; then
  echo "Verified that the CLI can run successfully";
  exit 0;
else
  echo "Error occurred";
  exit 1;
fi
