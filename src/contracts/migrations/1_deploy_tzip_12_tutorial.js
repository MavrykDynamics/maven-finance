const mvkTokenContract = artifacts.require('mvk_token');
const { alice } = require('./../scripts/sandbox/accounts');
const { MichelsonMap } = require('@taquito/taquito');
const saveContractAddress = require('./../helpers/saveContractAddress');

const initial_storage = {
    metadata: MichelsonMap.fromLiteral({
            [`name`]: `4d415652594b`,
            [`symbol`]: `4d564b`,
            [`decimals`]: `32`
        }),
    totalSupply: 1000000000,
    ledger: new MichelsonMap()
}

module.exports = async (deployer, network, accounts) => {

    // TODO format to await instead of .then
    deployer.deploy(mvkTokenContract, initial_storage)
        .then(contract => saveContractAddress('mvkTokenContract', contract.address));

};
module.exports.initial_storage = initial_storage;
