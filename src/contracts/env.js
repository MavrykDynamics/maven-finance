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
  contractsDir: "contracts/main",
  ligoVersion: "0.47.0",
  network: "development",
  networks: {
    development: {
      rpc: "http://localhost:8732",
      network_id: "*",
      secretKey: bob.sk,
      port: 8732,
    },
    ghostnet: {
      rpc: "https://ghostnet.smartpy.io",
      port: 443,
      network_id: "*",
      secretKey: bob.sk,
    },
    jakartanet: {
      rpc: "https://jakartanet.ecadinfra.com",
      port: 443,
      network_id: "*",
      secretKey: bob.sk,
    },
    ithacanet: {
      rpc: "https://ithacanet.ecadinfra.com",
      port: 443,
      network_id: "*",
      secretKey: bob.sk,
    },
    hangzhounet: {
      rpc: "https://hangzhounet.api.tez.ie/",
      port: 443,
      network_id: "*",
      secretKey: bob.sk,
    },
    mainnet: {
      rpc: "https://mainnet.api.tez.ie",
      port: 443,
      network_id: "*",
      secretKey: bob.sk,
    },
  },
};
