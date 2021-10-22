const senderContract = artifacts.require('sender');
const saveContractAddress = require('../helpers/saveContractAddress');

const initialStorage = 0;

module.exports = async (deployer, network, accounts) => {
    deployer.deploy(senderContract, initialStorage).then(contract => saveContractAddress('senderContract', contract.address));
};

module.exports.initial_storage = initialStorage;
