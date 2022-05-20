#!/bin/bash

set -e
set -o pipefail

nx run contracts:migrate

docker-compose restart oracle-maintainer oracle-1 oracle-2 oracle-3
