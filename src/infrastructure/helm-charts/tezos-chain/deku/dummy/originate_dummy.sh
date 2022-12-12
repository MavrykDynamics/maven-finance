#!/bin/bash

echo "Deploying new Dummy Ticket contract"

contract=$(ligo compile contract "dummy_ticket.mligo")

kubectl exec -it tezos-baking-archive-node-0 -c octez-node -- tezos-client \
    --wait 1 \
    originate contract DummyTicket \
    transferring 0 from mavryk \
    running "$contract" \
    --burn-cap 2 \
    --force
