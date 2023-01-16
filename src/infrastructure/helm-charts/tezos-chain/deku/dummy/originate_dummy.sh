#!/bin/bash

echo "Deploying new Dummy Ticket contract"

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

contract=$(docker run --rm -v "$PWD":"$PWD" -w "$PWD" ligolang/ligo:0.57.0 compile contract "$SCRIPT_DIR/dummy_ticket.mligo")

kubectl exec -it tezos-baking-archive-node-0 -c octez-node -- tezos-client \
    --wait 1 \
    originate contract DummyTicket \
    transferring 0 from mavryk \
    running "$contract" \
    --burn-cap 2 \
    --force
