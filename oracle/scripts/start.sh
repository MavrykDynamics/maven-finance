#!/bin/bash

set -e
set -o pipefail

PRJT_ROOT="$( cd "$(dirname "$0")" >/dev/null 2>&1 || exit 1 ; pwd -P | grep -o '^.*/' )"


# Create api keys env file if not exist
apiKeysExample=$PRJT_ROOT/.api-keys.env.example
apiKeys=$PRJT_ROOT/.api-keys.env
if [ ! -f "$apiKeys" ]
then
    cp "$apiKeysExample" "$apiKeys"
fi



docker-compose up -d flextesa

sleep 10 # Wait for flextesa to be up

(cd $PRJT_ROOT/../src/contracts/ && yarn migrate)

cat $PRJT_ROOT/../src/contracts/deployments/aggregatorFactoryAddress.json \
  |  python -c "import sys, json; print 'AGGREGATOR_FACTORY_SMART_CONTRACT_ADDRESS=' + json.load(sys.stdin)['address']" \
  > $PRJT_ROOT/.contracts.env

docker-compose up -d
