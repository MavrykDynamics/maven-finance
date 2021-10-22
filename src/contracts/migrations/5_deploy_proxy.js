const proxyContract = artifacts.require('proxy');
const saveContractAddress = require('../helpers/saveContractAddress');
const senderAddress = require('../deployments/senderContract')

console.log(senderAddress)

const initialStorage = senderAddress;

module.exports = async (deployer, network, accounts) => {
    deployer.deploy(proxyContract, initialStorage).then(contract => saveContractAddress('proxyContract', contract.address));
};

module.exports.proxyInitialStorage = initialStorage;
