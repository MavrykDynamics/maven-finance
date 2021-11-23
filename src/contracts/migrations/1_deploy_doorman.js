const doormanContract = artifacts.require('doorman')
const { MichelsonMap } = require('@taquito/michelson-encoder')

const { alice } = require('../scripts/sandbox/accounts')
const saveContractAddress = require('../helpers/saveContractAddress')

const userStakeLedger = MichelsonMap.fromLiteral({});
const adminAddress = alice.pkh
const tempMvkTotalSupply = '1000000000'
const tempVMvkTotalSupply = '1000000000'
const breakGlassConfigType = {
  stakeIsPaused           : false,
  unstakeIsPaused         : false,
}


const initialStorage = {
  admin: adminAddress,
  breakGlassConfig : breakGlassConfigType,
  mvkTokenAddress: 'KT1UkahzqCvaVrVutMeTSCJqS2qBFhLjvSAk',  // TODO: Change to empty address + call setAddress after token deployed
  vMvkTokenAddress: 'KT1UkahzqCvaVrVutMeTSCJqS2qBFhLjvSAk', // TODO: Change to empty address + call setAddress after token deployed
  delegationAddress: 'KT1UkahzqCvaVrVutMeTSCJqS2qBFhLjvSAk', // TODO: Change to empty address + call setAddress after token deployed
  userStakeLedger: userStakeLedger,
  tempMvkTotalSupply: tempMvkTotalSupply,
  tempVMvkTotalSupply: tempVMvkTotalSupply,
  logExitFee: '1',
  logFinalAmount: '1',
}

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(doormanContract, initialStorage)
  const deployedContract = await doormanContract.deployed()
  
  await saveContractAddress('doormanAddress', deployedContract.address)
}

module.exports.initial_storage = initialStorage
