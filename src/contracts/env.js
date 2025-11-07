const { bob } = require("./scripts/sandbox/accounts");

module.exports = {
  confirmationPollingTimeoutSecond: 500000,

  syncInterval: 0,
  confirmTimeout: 90000,

  contracts : {

    mainnet : {
      aggregator                : "",
      aggregatorFactory         : "",
      breakGlass                : "",
      
      council                   : "",
      delegation                : "",
      doorman                   : "",

      emergencyGovevrnance      : "",
      farm                      : "",

      farmFactory               : "",
      farmMToken                : "",
      governance                : "",

      governanceFinancial       : "",
      governanceProxy           : "",
      governanceSatellite       : "",
      governanceProxy           : "",

      lendingController         : "",
      lendingControllerMockTime : "",
      mavenFa2Token             : "",
      mavenFa12Token            : "",
      mavenLite                 : "",

      mToken                    : "",
      mvnFacuet                 : "",
      mvnToken                  : "",

      treasury                  : "",
      treasuryFactory           : "",
      vault                     : "",
      vaultFactory              : "",
      vaultRwa                  : "",

      vesting                   : ""
    },
    atlasnet : {
      aggregator                : "",
      aggregatorFactory         : "",
      breakGlass                : "",
      
      council                   : "",
      delegation                : "",
      doorman                   : "",

      emergencyGovevrnance      : "",
      farm                      : "",

      farmFactory               : "",
      farmMToken                : "",
      governance                : "",

      governanceFinancial       : "",
      governanceProxy           : "",
      governanceSatellite       : "",
      governanceProxy           : "",

      lendingController         : "",
      lendingControllerMockTime : "",
      mavenFa2Token             : "",
      mavenFa12Token            : "",
      mavenLite                 : "",

      mToken                    : "",
      mvnFacuet                 : "",
      mvnToken                  : "",

      treasury                  : "",
      treasuryFactory           : "",
      vault                     : "",
      vaultFactory              : "",
      vaultRwa                  : "",

      vesting                   : ""
    },
    local: {
      aggregator                : "",
      aggregatorFactory         : "",
      breakGlass                : "",
      
      council                   : "",
      delegation                : "",
      doorman                   : "",

      emergencyGovevrnance      : "",
      farm                      : "",

      farmFactory               : "",
      farmMToken                : "",
      governance                : "",

      governanceFinancial       : "",
      governanceProxy           : "",
      governanceSatellite       : "",
      governanceProxy           : "",

      lendingController         : "",
      lendingControllerMockTime : "",
      mavenFa2Token             : "",
      mavenFa12Token            : "",
      mavenLite                 : "",

      mToken                    : "",
      mvnFacuet                 : "",
      mvnToken                  : "",

      treasury                  : "",
      treasuryFactory           : "",
      vault                     : "",
      vaultFactory              : "",
      vaultRwa                  : "",

      vesting                   : ""
    }
  },

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
      rpc: "https://atlasnet.rpc.mavryk.network",
      network_id: "*",
      secretKey: bob.sk,
      port: 443,
    },
    basenet: {
      rpc: "https://basenet.rpc.mavryk.network",
      network_id: "*",
      secretKey: bob.sk,
      port: 443,
    },
    mainnet: {
      rpc: "https://mainnet.rpc.mavryk.network",
      port: 443,
      network_id: "*",
      secretKey: bob.sk,
    },
  },
};