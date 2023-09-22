#!/bin/bash

kubectl patch statefulset mavryk-baking-node -n mavryk-basenet --type='json' -p='[{"op": "add", "path": "/spec/template/spec/imagePullSecrets", "value": [{"name": "docker-pull-credentials"}]}]'
kubectl patch statefulset rolling-node -n mavryk-basenet --type='json' -p='[{"op": "add", "path": "/spec/template/spec/imagePullSecrets", "value": [{"name": "docker-pull-credentials"}]}]'
