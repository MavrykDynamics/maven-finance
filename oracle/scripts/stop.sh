#!/bin/bash

set -e
set -o pipefail

docker-compose down -v --remove-orphans
