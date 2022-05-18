## Oracles

The Mavryk system relies on Satellites to provide accurate and reliable pricing information for its collateral asset
classes.

Satellites are incentivized to provide correct data by rewarding them MVK for each price they send on the blockchain.

Satellites are part of an oracle network. Their purpose is to provide price feed on the Tezos blockchain in exchange for
MVK reward. Prices are then aggregated on the blockchain.

### How to be an oracle

New oracles can be added using the Maveryk governance system.

You have to send a propostion to the governance smart contract adding you as an oracle to the aggregator smart contracts

You have to deploy an oracle, for now in the cloud, but later raspberry pi

## How it works

Price feed are organised in rounds.
A round goal is to update a pair (for example: USD/XTZ) price on the blockchain.
It can be triggerred either by the maintainer or an oracle in the case of a deviation round.

Once a round is started, every oracle send their observation of the price to aggregator smart contract though a commit /
reveal scheme in exchange of a reward.
Then, once enough oracles sent their observation, the smart contract aggregate the multiple oracle observation by
computing the median and store the result for client usage.

## Usage

There is an example of a smart contract reading the price

- smart contract example

## How to deploy an oracle

Prerequisite: Docker

Create env file:

For maintainer:

```dotenv
RPC_URL=https://ithacanet.ecadinfra.com
ADMIN_PKH=edskRkawwQimT7qNaw4g99dKh3ExUt3corurNLUwvYo2vwwAGdy6NK4At1QLEy9Km24TuwCFfr5k97wvDxKBn5iQqTxdvvpdjt # Alice
ROUND_DURATION_MINUTES=60 # Every hour
DEVIATION_TRIGGER_CRON_STRING=0,30 * * * * *
ENABLE_MAINTAINER_MODE=true
ORACLE_PKH=edskRpPWgoNUfJgZRiycPg9539KMX6Ksw5yNVDw2ukds8VEgqXLLuBDrB6dr6m7fgsAZrLMDpPkxN7kRpcNyRzwkPYhoWsBJsZ # Bob
ORACLE_WITHDRAW_ADDRESS=tz1MBNfBnNn8fZCJVrrXV95FSgyuUxbmt3Mm # Bob
ORACLE_WITHDRAW_CRON_STRING=0 */12 * * * # Every 12 hour
CONFIRMATION_POLLING_INTERVAL_SECOND=2
AGGREGATOR_FACTORY_SMART_CONTRACT_ADDRESS=KT1TCG1b87Y5SaRTnn8k9TamvJwmh3wmRi9p

```

For oracles:

```dotenv
RPC_URL=https://ithacanet.ecadinfra.com
ORACLE_PKH=
ORACLE_WITHDRAW_ADDRESS=tz1PSmvRd3ySbh5aviFEMYGD6542LL5QnrMk # Eve
ORACLE_WITHDRAW_CRON_STRING=0 */12 * * * # Every 12 hour
DEVIATION_TRIGGER_CRON_STRING=10,40 * * * * *
CONFIRMATION_POLLING_INTERVAL_SECOND=2

AGGREGATOR_FACTORY_SMART_CONTRACT_ADDRESS=KT1TCG1b87Y5SaRTnn8k9TamvJwmh3wmRi9p
```

### Oracle configuration

| Configuration key                         | Description | Default |
|-------------------------------------------|-------------|---------|
| RPC_URL                                   |             |         |
| ORACLE_PKH                                |             |         |
| ORACLE_WITHDRAW_ADDRESS                   |             |         |
| ORACLE_WITHDRAW_CRON_STRING               |             |         |
| DEVIATION_TRIGGER_CRON_STRING             |             |         |
| CONFIRMATION_POLLING_INTERVAL_SECOND      |             |         |
| AGGREGATOR_FACTORY_SMART_CONTRACT_ADDRESS |             |         |

Admin config


| Configuration key      | Description | Default |
|------------------------|-------------|---------|
| ADMIN_PKH              |             |         |
| ROUND_DURATION_MINUTES |             |         |
| ENABLE_MAINTAINER_MODE |             |         |
