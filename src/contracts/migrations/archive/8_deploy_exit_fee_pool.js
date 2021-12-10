const exitFeePoolContract = artifacts.require('exitFeePool')
const doormanContract = artifacts.require('doorman')

const { MichelsonMap } = require('@taquito/michelson-encoder')

const { alice } = require('../scripts/sandbox/accounts')
const saveContractAddress = require('../helpers/saveContractAddress')
const doormanAddress = require('../deployments/doormanAddress')

const adminAddress     = alice.pkh;

const initialStorage = {
  admin : adminAddress,
  doormanAddress : doormanAddress
  
}

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(exitFeePoolContract, initialStorage)
  const deployedExitFeePoolContract = await exitFeePoolContract.deployed()

  // set governance address in delegation contract
  const deployedDoormanContract = await doormanContract.deployed()
  await deployedDoormanContract.setExitFeePoolAddress(deployedExitFeePoolContract.address)

  await saveContractAddress('exitFeePoolAddress', deployedExitFeePoolContract.address)
}

module.exports.initial_storage = initialStorage
