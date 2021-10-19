const doormanContract = artifacts.require('doorman');
const saveContractAddress = require('../helpers/saveContractAddress');

const initialStorage = 10

module.exports = async (deployer, network, accounts) => {
    deployer.deploy(doormanContract, initialStorage).then(contract => saveContractAddress('doormanContract', contract.address));
};

module.exports.initial_storage = initialStorage;
