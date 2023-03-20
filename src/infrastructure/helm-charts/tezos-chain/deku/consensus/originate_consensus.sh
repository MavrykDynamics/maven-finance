#!/bin/bash

echo "Deploying new Consensus contract"

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

storage=$(docker run --rm -v "$PWD":"$PWD" -w "$PWD" mavrykdynamics/ligo:0.60.0 compile storage "$SCRIPT_DIR/consensus.mligo" "$(cat $SCRIPT_DIR/consensus_storage.mligo)")
contract=$(docker run --rm -v "$PWD":"$PWD" -w "$PWD" mavrykdynamics/ligo:0.60.0 compile contract "$SCRIPT_DIR/consensus.mligo")

kubectl exec -it tezos-baking-archive-node-0 -c octez-node -- tezos-client \
    --wait 1 \
    originate contract Consensus \
    transferring 0 from mavryk \
    running "$contract" \
    --init "$storage" \
    --burn-cap 2 \
    --force
