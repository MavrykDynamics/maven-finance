const doormanContract = artifacts.require('doorman');

const faucet = require('../faucet.json');
const mvkTokenAddress = require('../deployments/mvkTokenContract')
const vMvkTokenAddress = require('../deployments/vMvkTokenContract')
const { alice, bob } = require('../scripts/sandbox/accounts');
const saveContractAddress = require('../helpers/saveContractAddress');
const { MichelsonMap } = require('@taquito/michelson-encoder');

const userStakeLedger = new MichelsonMap();
const adminAddress = alice.pkh;
const tempMvkTotalSupply = "1000000000";
const tempVMvkTotalSupply = "1000000000";
const lastUserId = "1";
const addressToUserRecord = new MichelsonMap();

const initialStorage = {
    admin : adminAddress, 
    mvkTokenAddress: mvkTokenAddress,
    vMvkTokenAddress: vMvkTokenAddress,
    userStakeLedger : userStakeLedger,
    tempMvkTotalSupply: tempMvkTotalSupply,
    tempVMvkTotalSupply: tempVMvkTotalSupply,
    addressToUserRecord : addressToUserRecord,
    lastUserId: lastUserId,
    logExitFee: "1",
    logFinalAmount: "1"
}

module.exports = async (deployer, network, accounts) => {
    deployer.deploy(doormanContract, initialStorage).then(contract => saveContractAddress('doormanContract', contract.address));
};

module.exports.initial_storage = initialStorage;
