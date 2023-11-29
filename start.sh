#! /bin/bash

# Need an initial build since the next command executes in any order
build_cmd="turbo run build"
start_cmd="turbo run build:watch start types:watch lint:watch --parallel --concurrency 200"

# Predefined filters
examples_filters="--filter=...{./apps/examples/*}"
private_filters="--filter=...{./apps/private/*}"

use_examples_filters=0
use_private_filters=0

# Check if special arguments are present
for arg in "$@"; do
  if [ "$arg" == "examples" ]; then
    use_examples_filters=1
  elif [ "$arg" == "private" ]; then
    use_private_filters=1
  fi
done

if [ "$use_examples_filters" -eq 1 ]; then
  build_cmd+=" $examples_filters"
  start_cmd+=" $examples_filters"
elif [ "$use_private_filters" -eq 1 ]; then
  build_cmd+=" $private_filters"
  start_cmd+=" $private_filters"
elif [ $# -gt 0 ]; then
  # Process regular arguments if no special arguments are found
  for arg in "$@"; do
    build_cmd+=" --filter=@lightsparkdev/$arg"
    start_cmd+=" --filter=@lightsparkdev/$arg"
  done
else
  build_cmd+=" $private_filters --filter=@lightsparkdev/ui"
  start_cmd+=" $private_filters --filter=@lightsparkdev/ui"
fi

echo $build_cmd && eval $build_cmd && echo $start_cmd && eval $start_cmd
