const doormanContract = artifacts.require('doorman');

const mvkTokenAddress = require('../deployments/mvkTokenContract')
const vMvkTokenAddress = require('../deployments/vMvkTokenContract')

const { alice } = require('../scripts/sandbox/accounts');

const saveContractAddress = require('../helpers/saveContractAddress');
const { MichelsonMap } = require('@taquito/michelson-encoder');

// const initialStorage = 10

const addressId = new MichelsonMap.fromLiteral({
    [alice.pkh]: "1" 
});
const userStakeRecord = new MichelsonMap();

const tempTotalSupply = "2000";
const tempMvkTotalSupply = "1000";
const tempVMvkTotalSupply = "1000";
const lastUserId = "1";

const initialStorage = {
    admin : alice.pkh,
    vMvkTokenAddress: vMvkTokenAddress,
    mvkTokenAddress: mvkTokenAddress,
    tempTotalSupply: tempTotalSupply,
    tempMvkTotalSupply: tempMvkTotalSupply,
    tempVMvkTotalSupply: tempVMvkTotalSupply,
    userStakeRecord : userStakeRecord,
    addressId : addressId,
    lastUserId: lastUserId,
}

module.exports = async (deployer, network, accounts) => {
    deployer.deploy(doormanContract, initialStorage).then(contract => saveContractAddress('doormanContract', contract.address));
};

module.exports.initial_storage = initialStorage;
