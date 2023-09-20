#!/bin/bash

# Build Taquito
cd vendors/taquito
npm install
npm run build-all
cd ../..

# Build create-lambda-bytes
cd vendors/create-lambda-bytes
npm install
npm run build
cd ../..

# Install updated deps
npm install
