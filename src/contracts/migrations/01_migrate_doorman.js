const { TezosToolkit } = require("@taquito/taquito");
const { InMemorySigner } = require("@taquito/signer");

const { migrate } = require("../scripts/helpers");

const { alice, bob } = require("../scripts/sandbox/accounts");

const { doormanStorage } = require("../storage/doorman_storage");

const env = require("../env");

module.exports = async (tezos) => {
  const secretKey = env.network === "development" ? alice.sk : bob.sk;

  tezos = new TezosToolkit(tezos.rpc.url);

  tezos.setProvider({
    config: {
      confirmationPollingTimeoutSecond: env.confirmationPollingTimeoutSecond,
    },
    signer: await InMemorySigner.fromSecretKey(secretKey),
  });

  const doormanAddress = await migrate(
    tezos,
    "doorman",
    doormanStorage
  );

  console.log(`DoormanContract: ${doormanAddress}`);
};
