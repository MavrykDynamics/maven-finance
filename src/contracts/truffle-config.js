const { mnemonic, secret, password, email } = require("./faucet.json");
const { alice, bob } = require('./scripts/sandbox/accounts');
module.exports = {
  // see <http://truffleframework.com/docs/advanced/configuration>
  // for more details on how to specify configuration options!
  contracts_directory: "./contracts/main",
  networks: {
    development: {
      host: "http://localhost",
      port: 8732,
      network_id: "*",
      secretKey: alice.sk,
      type: "tezos"
    },
    granadanet: {
      host: "https://granadanet.api.tez.ie", //, "https://api.tez.ie/rpc/granadanet", 'https://api.granadanet.tzkt.io'
      port: 443,
      network_id: "*",
      secretKey: alice.sk,
      // secret,
      // mnemonic,
      // password,
      // email,ß
      type: "tezos"
    },
    hangzhounet: {
      host: "https://hangzhounet.smartpy.io/",
      port: 443,
      network_id: "*",
      secretKey: alice.sk,
      // secret,
      // mnemonic,
      // password,
      // email,
      type: "tezos"
    },
  }
};

