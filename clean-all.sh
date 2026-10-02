#! /bin/bash
set -euo pipefail

# Keep deleting when a step fails: a broken install is why this gets run.
yarn clean || true
find . -type d -name "node_modules" -exec rm -rf {} + || true
find . -type d -name ".turbo" -exec rm -rf {} + || true
find . -type f -name "install-state.gz" -exec rm -rf {} +