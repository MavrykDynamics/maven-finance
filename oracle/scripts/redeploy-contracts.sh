#!/bin/bash

set -e
set -o pipefail

nx run contracts:migrate

docker-compose restart oracle-admin oracle-1 oracle-2
