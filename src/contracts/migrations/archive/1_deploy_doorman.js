const doormanContract = artifacts.require('doorman')
const { MichelsonMap } = require('@taquito/michelson-encoder')

const { alice } = require('../../scripts/sandbox/accounts')
const saveContractAddress = require('../../helpers/saveContractAddress')

const userStakeRecordsLedger = MichelsonMap.fromLiteral({});
const userStakeBalanceLedger = MichelsonMap.fromLiteral({});

const adminAddress = alice.pkh
const tempMvkTotalSupply = '10000000000000'   // 10,000,000 MVK Tokens in mu (10^6)
const tempVMvkTotalSupply = '10000000000000'  // 10,000,000 vMVK Tokens in mu (10^6)
const breakGlassConfigType = {
  stakeIsPaused           : false,
  unstakeIsPaused         : false,
}

const initialStorage = {
  admin: adminAddress,
  breakGlassConfig : breakGlassConfigType,
  mvkTokenAddress: 'KT1UkahzqCvaVrVutMeTSCJqS2qBFhLjvSAk',  // TODO: Change to empty address + call setAddress after token deployed
  // vMvkTokenAddress: 'KT1UkahzqCvaVrVutMeTSCJqS2qBFhLjvSAk', // TODO: Change to empty address + call setAddress after token deployed
  delegationAddress: 'KT1UkahzqCvaVrVutMeTSCJqS2qBFhLjvSAk', // TODO: Change to empty address + call setAddress after contract deployed
  exitFeePoolAddress: 'KT1UkahzqCvaVrVutMeTSCJqS2qBFhLjvSAk', // TODO: Change to empty address + call setAddress after contract deployed
  userStakeRecordsLedger: userStakeRecordsLedger,
  userStakeBalanceLedger: userStakeBalanceLedger,
  tempMvkTotalSupply: tempMvkTotalSupply,
  tempVMvkTotalSupply: tempVMvkTotalSupply,
  stakedMvkTotalSupply: '0',
  logExitFee: '1',
  logFinalAmount: '1',
}

module.exports = async (deployer, network, accounts) => {

  await deployer.deploy(doormanContract, initialStorage)
  const deployedContract = await doormanContract.deployed()
  
  await saveContractAddress('doormanAddress', deployedContract.address)
}

module.exports.initial_storage = initialStorage
