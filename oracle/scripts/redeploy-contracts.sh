#!/bin/bash

set -e
set -o pipefail

PRJT_ROOT="$( cd "$(dirname "$0")" >/dev/null 2>&1 || exit 1 ; pwd -P | grep -o '^.*/' )"

(cd $PRJT_ROOT/../src/contracts/ && yarn migrate)

cat $PRJT_ROOT/../src/contracts/deployments/aggregatorFactoryAddress.json \
  |  python -c "import sys, json; print 'AGGREGATOR_FACTORY_SMART_CONTRACT_ADDRESS=' + json.load(sys.stdin)['address']" \
  > $PRJT_ROOT/.contracts.env

docker-compose up -d
