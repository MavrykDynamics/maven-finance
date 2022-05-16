#!/bin/bash

set -e
set -o pipefail

PRJT_ROOT="$( cd "$(dirname "$0")" >/dev/null 2>&1 || exit 1 ; pwd -P | grep -o '^.*/' )"

# Install yarn if needed
if ! command -v yarn > /dev/null 2>&1
then
    npm i -g yarn
fi

# Install nx if needed
if ! command -v nx > /dev/null 2>&1
then
    npm i -g nx
fi

yarn
nx build
