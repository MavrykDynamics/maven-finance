const doormanContract = artifacts.require('doorman');

const mvkTokenAddress = require('../deployments/mvkTokenContract')
const vMvkTokenAddress = require('../deployments/vMvkTokenContract')
const tempSenderAddress = require('../deployments/senderContract')
const { alice, bob } = require('../scripts/sandbox/accounts');
const saveContractAddress = require('../helpers/saveContractAddress');
const { MichelsonMap } = require('@taquito/michelson-encoder');

const userStakeRecord = new MichelsonMap();
const adminAddress = alice.pkh;
const tempMvkTotalSupply = "1000";
const tempVMvkTotalSupply = "1000";
const lastUserId = "1";
const addressId = new MichelsonMap.fromLiteral({
    [alice.pkh] : "1",
    [bob.pkh] : "2"
});

const initialStorage = {
    admin : adminAddress, 
    mvkTokenAddress: mvkTokenAddress,
    vMvkTokenAddress: vMvkTokenAddress,
    tempSenderAddress: tempSenderAddress,
    userStakeRecord : userStakeRecord,
    tempMvkTotalSupply: tempMvkTotalSupply,
    tempVMvkTotalSupply: tempVMvkTotalSupply,
    addressId : addressId,
    lastUserId: lastUserId
}

module.exports = async (deployer, network, accounts) => {
    deployer.deploy(doormanContract, initialStorage).then(contract => saveContractAddress('doormanContract', contract.address));
};

module.exports.initial_storage = initialStorage;
