const { alice, bob, eve, mallory } = require("./scripts/sandbox/accounts");

module.exports = {
  confirmationPollingTimeoutSecond: 500000,

  // test config

  syncInterval: 0,
  confirmTimeout: 90000,

  // testnet deployment config

  // syncInterval: 5000,
  // confirmTimeout: 1800000,

  buildDir: "build",
  michelsonBuildDir : "contracts/compiled",
  migrationsDir: "migrations",
  michelsonBuildDir : "contracts/compiled",
  contractsDir: "contracts/main",
  contractLambdasDir: "contracts/partials/contractLambdas",
  ligoVersion: "0.60.0",
  network: "development",
  networks: {
    development: {
      rpc: "http://localhost:8732",
      network_id: "*",
      secretKey: bob.sk,
      port: 8732,
    },
    atlasnet: {
      rpc: "https://rpc.mavryk.network/atlasnet",
      network_id: "*",
      secretKey: bob.sk,
      port: 443,
    },
    basenet: {
      rpc: "https://rpc.mavryk.network/basenet",
      network_id: "*",
      secretKey: bob.sk,
      port: 443,
    },
    mainnet: {
      rpc: "https://rpc.mavryk.network/mainnet",
      port: 443,
      network_id: "*",
      secretKey: bob.sk,
    },
  },
};