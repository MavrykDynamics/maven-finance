#!/bin/bash

cd vendors/taquito
npm install
npm run build-all
cd ../..
npm install
