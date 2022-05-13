#!/bin/bash

# for contract in ../contracts/deployments/*.json ; do
#     # Get contact address
#     contract_address=$(cat "$contract" | jq -r '.address')

#     # Get contract name
#     variable_name_path="${contract##*/}"
#     variable_name_extension=${variable_name_path%%.*}
#     variable_name_upper="$(echo "$variable_name_extension" | tr a-z A-Z)"
#     echo $variable_name_upper

#     # Export variable
#     export $variable_name_upper=$contract_address
# done

# TZKT URL
export TZKT_URL=https://api.ithacanet.tzkt.io
export POSTGRES_PASSWORD=dipdup12345
export ADMIN_SECRET=hasura12345
