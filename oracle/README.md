<br/>
<p align="center">
<a href="https://mavryk.finance/" target="_blank">
<img src="https://mavryk.finance/logo.svg" width="225" alt="Chainlink logo">
</a>
</p>
<br/>

# Mavryk oracle node

# Description

Mavryk is a decentralized finance ecosystem designed for community governance and allow users to borrow, earn, and unlock the world from legacy financial systems.

This repository contains the decentralised oracle code. 

# Usage

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker compose](https://docs.docker.com/compose/install/)
- [Node 16](https://nodejs.org/en/download/)

## Install

```shell
git clone git@github.com:neofacto-fr/mavryk-oracle-node.git
cd mavryk-oracle-node

./scripts/install.sh
```

## Using data aggregator API keys

Edit the api key env file to set your api key of your data source

```shell
vi .api-keys.env
```

## Start

```shell
./scripts/start.sh
```

## Stop

```shell
./scripts/stop.sh
```

# License

[MIT](https://choosealicense.com/licenses/mit/)
