const mvkTokenContract = artifacts.require('mvkToken');
const { alice } = require('../scripts/sandbox/accounts');
const { MichelsonMap } = require('@taquito/taquito');
const saveContractAddress = require('../helpers/saveContractAddress');

const totalSupply = "1000000000";

const metadata = MichelsonMap.fromLiteral({
    "": Buffer("tezos-storage:data", "ascii").toString("hex"),
    data: Buffer(
        JSON.stringify({
            version: "v1.0.0",
            description: "MAVRYK Token",
            authors: ["MAVRYK Dev Team <contact@mavryk.finance>"],
            source: {
                tools: ["Ligo", "Flextesa"],
                location: "https://ligolang.org/",
            },
            interfaces: ["TZIP-7", "TZIP-16"],
            errors: [],
            views: [],
        }),
        "ascii"
    ).toString("hex"),
});

const ledger = MichelsonMap.fromLiteral({
    [alice.pkh]: {
        balance: totalSupply,
        allowances: new MichelsonMap(),
    },
});

const tokenMetadata = MichelsonMap.fromLiteral({
    0: {
        token_id: "0",
        token_info: MichelsonMap.fromLiteral({
            symbol: Buffer.from("MVK").toString("hex"),
            name: Buffer.from("MAVRYK").toString("hex"),
            decimals: Buffer.from("2").toString("hex"),
            icon: Buffer.from(
                "https://mavryk.finance/logo192.png"
            ).toString("hex"),
        }),
    },
});

const initialStorage = {
    totalSupply: totalSupply,
    metadata: metadata,
    ledger: ledger,
    token_metadata: tokenMetadata,
};

module.exports = async (deployer, network, accounts) => {
    deployer.deploy(mvkTokenContract, initialStorage).then(contract => saveContractAddress('mvkTokenContract', contract.address));
};

module.exports.initial_storage = initialStorage;
