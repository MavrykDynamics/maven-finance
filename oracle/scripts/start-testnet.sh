#!/bin/bash

set -e
set -o pipefail

PRJT_ROOT="$( cd "$(dirname "$0")" >/dev/null 2>&1 || exit 1 ; pwd -P | grep -o '^.*/' )"


# Create api keys env file if not exist
apiKeysExample=$PRJT_ROOT/.api-keys.env.example
apiKeys=$PRJT_ROOT/.api-keys.testnet.env
if [ ! -f "$apiKeys" ]
then
    cp "$apiKeysExample" "$apiKeys"
fi



nx run contracts:migrate

docker-compose up -d
