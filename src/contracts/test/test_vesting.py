# from unittest import TestCase
# from contextlib import contextmanager
# from copy import deepcopy
# from pytezos import ContractInterface, MichelsonRuntimeError, pytezos
# # from pytezos import ContractInterface, pytezos, format_timestamp, MichelsonRuntimeError
# from pytezos.michelson.types.big_map import big_map_diff_to_lazy_diff
# from pytezos.operation.result import OperationResult
# from pytezos.contract.result import ContractCallResult
# import time
# import json 
# import logging
# import pytest
# import os 


# # set to localhost sandbox mode for testing
# pytezos = pytezos.using(shell='http://localhost:8732', key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq')

# twoUp =  os.path.abspath(os.path.join('__file__' ,"../../"))
# rootDir = os.path.abspath(os.curdir)
# fileDir = os.path.dirname(os.path.realpath('__file__'))

# print('fileDir: '+fileDir)

# helpersDir          = os.path.join(fileDir, 'helpers')
# mvkTokenDecimals = os.path.join(helpersDir, 'mvkTokenDecimals.json')
# mvkTokenDecimals = open(mvkTokenDecimals)
# mvkTokenDecimals = json.load(mvkTokenDecimals)
# mvkTokenDecimals = mvkTokenDecimals['decimals']

# deploymentsDir          = os.path.join(fileDir, 'deployments')
# deployedVestingContract = os.path.join(deploymentsDir, 'vestingAddress.json')
# deployedMvkTokenContract = os.path.join(deploymentsDir, 'mvkTokenAddress.json')

# deployedVesting = open(deployedVestingContract)
# vestingContractAddress = json.load(deployedVesting)
# vestingContractAddress = vestingContractAddress['address']

# deployedMvkToken = open(deployedMvkTokenContract)
# mvkTokenAddress = json.load(deployedMvkToken)
# mvkTokenAddress = mvkTokenAddress['address']

# print('Vesting Contract Deployed at: ' + vestingContractAddress)
# print('MVK Token Address Deployed at: ' + mvkTokenAddress)

# alice = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
# admin = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
# bob   = 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6'
# eve   = 'tz1MnmtP4uAcgMpeZN6JtyziXeFqqwQG6yn6'
# fox   = 'tz1R2oNqANNy2vZhnZBJc8iMEqW79t85Fv7L'

# sec_day   = 86400
# sec_week  = 604800
# sec_month = 2592000 # 30 days

# blocks_day = 2880
# blocks_month = blocks_day * 30 # 86400 per month

# error_only_administrator    = 'Only the administrator can call this entrypoint.'
# error_sender_not_allowed    = 'Error. Sender is not allowed to call this entrypoint.'
# error_unable_to_claim_now   = 'Error. You are unable to claim now.'
# error_vestee_is_locked      = 'Error. Vestee is locked.'
# error_vestee_not_found      = 'Error. Vestee is not found.'
# error_vestee_exists         = 'Error. Vestee already exists'
# error_vestee_doesnt_exists = 'Error. Vestee is not found.'

# class VestingContract(TestCase):
    
#     @classmethod
#     def setUpClass(cls):
#         cls.vestingContract = pytezos.contract(vestingContractAddress)
#         cls.vestingStorage  = cls.vestingContract.storage()
#         cls.mvkTokenContract = pytezos.contract(mvkTokenAddress)
#         cls.mvkTokenStorage  = cls.mvkTokenContract.storage()
        
#     @contextmanager
#     def raisesMichelsonError(self, error_message):
#         with self.assertRaises(MichelsonRuntimeError) as r:
#             yield r

#         error_msg = r.exception.format_stdout()
#         if "FAILWITH" in error_msg:
#             self.assertEqual(f"FAILWITH: '{error_message}'", r.exception.format_stdout())
#         else:
#             self.assertEqual(f"'{error_message}': ", r.exception.format_stdout())
    
#     # MVK Formatter
#     def MVK(self, value: float = 1.0):
#         return int(value * 10**int(mvkTokenDecimals))

#     ######################
#     # Tests for vesting contract #
#     ######################
    
#     ###
#     # %setAdmin
#     ##
#     def test_00_admin_should_set_admin(self):
#         # Initial values
#         init_vesting_storage = deepcopy(self.vestingStorage);

#         # Operation
#         res = self.vestingContract.setAdmin(eve).interpret(storage=init_vesting_storage, sender=bob);

#         # Assertions
#         self.assertEqual(eve, res.storage['admin']);

#         print('--%setAdmin--')
#         print('✅ Admin should be able to call this entrypoint and update the contract administrator with a new address')

#     def test_01_non_admin_should_not_set_admin(self):
#         # Initial values
#         init_vesting_storage = deepcopy(self.vestingStorage);

#         # Operation
#         with self.raisesMichelsonError(error_only_administrator):
#             self.vestingContract.setAdmin(eve).interpret(storage=init_vesting_storage, sender=alice);

#         print('✅ Non-admin should not be able to call this entrypoint')

#     ###
#     # %updateConfig
#     ##

#     ###
#     # %addVestee
#     ##
#     def test_20_whitelist_should_add_vestee(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)
#         totalVestedAmount           = self.MVK(3000000)
#         totalCliffInMonths          = 2
#         totalVestingInMonths        = 24
#         totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths

#         # Storage preparation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);

#         # Operation
#         res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob)

#         # Assertions
#         self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
#         self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

#         print('--%addVestee--')
#         print('✅ Whitelist contract should able to call this entrypoint')

#     def test_21_non_whitelist_should_not_add_vestee(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)
#         totalVestedAmount           = self.MVK(3000000)
#         totalCliffInMonths          = 2
#         totalVestingInMonths        = 24

#         # Operation
#         with self.raisesMichelsonError(error_sender_not_allowed):
#             self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=bob)

#         print('✅ Other contracts should not be able to call this entrypoint')

#     def test_22_whitelist_should_not_add_vestee_if_exists(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)
#         totalVestedAmount           = self.MVK(3000000)
#         totalCliffInMonths          = 2
#         totalVestingInMonths        = 24
#         totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths

#         # Storage preparation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);

#         # Operation
#         res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob)

#         # Assertions
#         self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
#         self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

#         # Final operation
#         with self.raisesMichelsonError(error_vestee_exists):
#             self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob)

#         print('✅ Whitelist contract should not be able to call this entrypoint if the vestee already exists')

#     ###
#     # %removeVestee
#     ##
#     def test_30_whitelist_should_remove_vestee(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)
#         totalVestedAmount           = self.MVK(3000000)
#         totalCliffInMonths          = 2
#         totalVestingInMonths        = 24
#         totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths

#         # Storage preparation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
#         res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob)

#         # Assertions
#         self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
#         self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])
        
#         # Operation
#         res = self.vestingContract.removeVestee(bob).interpret(storage=res.storage, sender=bob)

#         # Assertions
#         self.assertEqual(None, res.storage['vesteeLedger'][bob])

#         print('--%removeVestee--')
#         print('✅ Whitelist contract should able to call this entrypoint')

#     def test_31_non_whitelist_should_not_remove_vestee(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)
#         totalVestedAmount           = self.MVK(3000000)
#         totalCliffInMonths          = 2
#         totalVestingInMonths        = 24
#         totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths

#         # Storage preparation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
#         res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob)

#         # Assertions
#         self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
#         self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])
        
#         # Operation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=res.storage, sender=bob);
#         with self.raisesMichelsonError(error_sender_not_allowed):
#             self.vestingContract.removeVestee(bob).interpret(storage=res.storage, sender=bob)

#         print('✅ Other contracts should not be able to call this entrypoint')

#     def test_32_whitelist_should_not_remove_vestee_if_doesnt_exists(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)

#         # Storage preparation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
        
#         # Operation
#         with self.raisesMichelsonError(error_vestee_doesnt_exists):
#             self.vestingContract.removeVestee(bob).interpret(storage=res.storage, sender=bob)

#         print('✅ Whitelist contract should not be able to call this entrypoint if the vestee does not exist')

#     ###
#     # %toggleVesteeLock
#     ##
#     def test_40_whitelist_should_lock_unlock_vestee(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)
#         totalVestedAmount           = self.MVK(3000000)
#         totalCliffInMonths          = 2
#         totalVestingInMonths        = 24
#         totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths

#         # Storage preparation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
#         res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob)

#         # Assertions
#         self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
#         self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])
#         self.assertEqual("ACTIVE", res.storage['vesteeLedger'][bob]['status'])
        
#         # Operation
#         res = self.vestingContract.toggleVesteeLock(bob).interpret(storage=res.storage, sender=bob)

#         # Assertion
#         self.assertEqual("LOCKED", res.storage['vesteeLedger'][bob]['status'])

#         # Operation
#         res = self.vestingContract.toggleVesteeLock(bob).interpret(storage=res.storage, sender=bob)

#         # Assertion
#         self.assertEqual("ACTIVE", res.storage['vesteeLedger'][bob]['status'])

#         print('--%toggleVesteeLock--')
#         print('✅ Whitelist contract should able to call this entrypoint')

#     def test_41_non_whitelist_should_not_lock_unlock_vestee(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)
#         totalVestedAmount           = self.MVK(3000000)
#         totalCliffInMonths          = 2
#         totalVestingInMonths        = 24
#         totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths

#         # Storage preparation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
#         res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob)
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=res.storage, sender=bob);

#         # Assertions
#         self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
#         self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])
#         self.assertEqual("ACTIVE", res.storage['vesteeLedger'][bob]['status'])
        
#         # Operation
#         with self.raisesMichelsonError(error_sender_not_allowed):
#             self.vestingContract.toggleVesteeLock(bob).interpret(storage=res.storage, sender=bob)

#         print('✅ Other contracts should not be able to call this entrypoint')

#     def test_42_whitelist_should_lock_unlock_vestee_if_doesnt_exists(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)

#         # Storage preparation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
        
#         # Operation
#         with self.raisesMichelsonError(error_vestee_doesnt_exists):
#             self.vestingContract.toggleVesteeLock(bob).interpret(storage=res.storage, sender=bob)

#         print('✅ Whitelist contract should not be able to call this entrypoint if the vestee does not exist')
        
#     ###
#     # %updateVestee
#     ##
#     def test_50_whitelist_should_update_vestee(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)
#         totalVestedAmount           = self.MVK(3000000)
#         totalCliffInMonths          = 2
#         totalVestingInMonths        = 24
#         totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths
#         newTotalVestedAmount        = self.MVK(3000000)
#         newTotalCliffInMonths       = 2
#         newTotalVestingInMonths     = 24
#         newTotalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths       
        
#         # Storage preparation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
#         res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob)

#         # Assertions
#         self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
#         self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

#         # Operation
#         res = self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalVestingInMonths).interpret(storage=res.storage, sender=bob)

#         # Assertions
#         self.assertEqual(newTotalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(newTotalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
#         self.assertEqual(newTotalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(newTotalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

#         print('--%updateVestee--')
#         print('✅ Whitelist contract should able to call this entrypoint')

#     def test_51_non_whitelist_should_not_update_vestee(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)
#         totalVestedAmount           = self.MVK(3000000)
#         totalCliffInMonths          = 2
#         totalVestingInMonths        = 24
#         totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths
#         newTotalVestedAmount        = self.MVK(3000000)
#         newTotalCliffInMonths       = 2
#         newTotalVestingInMonths     = 24
        
#         # Storage preparation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
#         res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob)
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=res.storage, sender=bob);

#         # Assertions
#         self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
#         self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

#         # Operation
#         with self.raisesMichelsonError(error_sender_not_allowed):
#             self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalVestingInMonths).interpret(storage=res.storage, sender=bob)

#         print('✅ Other contracts should not be able to call this entrypoint')
    
#     def test_52_whitelist_should_not_update_vestee_if_doesnt_exists(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)
#         newTotalVestedAmount        = self.MVK(3000000)
#         newTotalCliffInMonths       = 2
#         newTotalVestingInMonths     = 24
        
#         # Storage preparation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);

#         # Operation
#         with self.raisesMichelsonError(error_vestee_doesnt_exists):
#             self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalVestingInMonths).interpret(storage=res.storage, sender=bob)
    
#         print('✅ Whitelist contract should not be able to call this entrypoint if the vestee does not exist')

#     ###
#     # %claim
#     ##
#     def test_60_vestee_should_claim(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)
#         totalVestedAmount           = self.MVK(3000000)
#         totalCliffInMonths          = 2
#         totalVestingInMonths        = 24
#         totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths  
#         currentTimestamp            = pytezos.now()

#         # Storage preparation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
#         res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

#         # Assertions
#         self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
#         self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

#         # Operation
#         firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1

#         res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff)
#         claimAmount = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

#         print('--%claim--')
#         print('✅ User should be able to call this entrypoint if it is a vestee')

#     def test_61_vestee_should_claim(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)
#         totalVestedAmount           = self.MVK(3000000)
#         totalCliffInMonths          = 2
#         totalVestingInMonths        = 24
#         totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths  
#         currentTimestamp            = pytezos.now()

#         # Storage preparation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
#         res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

#         # Assertions
#         self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
#         self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

#         # Operation
#         firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1

#         res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff)
#         claimAmount = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

#         res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 30)
#         claimAmount += int(res.operations[-1]['parameters']['value']['args'][-1]['int'])
#         self.assertEqual(claimAmount, totalVestedAmount)

#         print('✅ User should be able to claim previous months if it did not claimed for a long time')

#     def test_62_vestee_should_claim(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)
#         totalVestedAmount           = self.MVK(3000000)
#         totalCliffInMonths          = 2
#         totalVestingInMonths        = 24
#         totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths  
#         currentTimestamp            = pytezos.now()

#         # Storage preparation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
#         res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

#         # Assertions
#         self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
#         self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

#         # Operation
#         firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1

#         res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 160)
#         claimAmount = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])
#         self.assertEqual(claimAmount, totalVestedAmount)

#         print('✅ User should be able to claim after the vesting period without claiming extra token')

#     def test_63_vestee_should_claim(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)
#         totalVestedAmount           = self.MVK(3000000)
#         totalCliffInMonths          = 2
#         totalVestingInMonths        = 24
#         totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths  
#         currentTimestamp            = pytezos.now()

#         # Storage preparation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
#         res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

#         # Assertions
#         self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
#         self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

#         # Operation
#         firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1
#         res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 10)
#         claimAmount = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

#         # Update process
#         newTotalVestedAmount        = self.MVK(4000000)
#         newTotalCliffInMonths       = 1
#         newTotalVestingInMonths     = 12

#         res = self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalVestingInMonths).interpret(storage=res.storage, sender=bob)

#         # Assertions
#         self.assertEqual(newTotalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(newTotalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(newTotalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

#         # Operation
#         res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 160)
#         claimAmount += int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

#         self.assertEqual(claimAmount, newTotalVestedAmount)

#         print('✅ User should be able to claim the correct amount if its vestee record was updated during the process')

#     def test_64_vestee_should_claim(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)
#         totalVestedAmount           = self.MVK(3000000)
#         totalCliffInMonths          = 0
#         totalVestingInMonths        = 24
#         totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths  
#         currentTimestamp            = pytezos.now()

#         # Storage preparation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
#         res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

#         # Assertions
#         self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
#         self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

#         # Operation
#         firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1
#         res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 13)
#         claimAmount = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

#         # Update process
#         newTotalVestedAmount        = self.MVK(4000000)
#         newTotalCliffInMonths       = 0
#         newTotalVestingInMonths     = 12

#         res = self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalVestingInMonths).interpret(storage=res.storage, sender=bob)

#         # Assertions
#         self.assertEqual(newTotalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(newTotalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(newTotalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

#         # Operation
#         res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 160)
#         claimAmount += int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

#         self.assertEqual(claimAmount, newTotalVestedAmount)

#         print('✅ User should be able to claim without cliff period')

#     def test_64_vestee_should_claim(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)
#         totalVestedAmount           = self.MVK(3000000)
#         totalCliffInMonths          = 4
#         totalVestingInMonths        = 24
#         totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths  
#         currentTimestamp            = pytezos.now()

#         # Storage preparation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
#         res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

#         # Assertions
#         self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
#         self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

#         # Operation
#         firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1
#         res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 5)
#         claimAmount = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

#         # Update process
#         newTotalVestedAmount        = self.MVK(4000000)
#         newTotalCliffInMonths       = 10
#         newTotalVestingInMonths     = 12

#         res = self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalVestingInMonths).interpret(storage=res.storage, sender=bob)

#         # Assertions
#         self.assertEqual(newTotalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(newTotalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(newTotalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

#         # Operation
#         res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 160)
#         claimAmount += int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

#         self.assertEqual(claimAmount, newTotalVestedAmount)

#         print('✅ User should be able to claim with an updated longer cliff period')

#     def test_61_non_vestee_should_not_claim(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)
#         totalVestedAmount           = self.MVK(3000000)
#         totalCliffInMonths          = 2
#         totalVestingInMonths        = 24
#         totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths
#         currentTimestamp            = pytezos.now()
#         firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1

#         # Storage preparation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
#         res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

#         # Assertions
#         self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
#         self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

#         # Operation
#         with self.raisesMichelsonError(error_vestee_doesnt_exists):
#             self.vestingContract.claim().interpret(storage=res.storage, sender=alice, now=firstClaimAfterCliff)
        
#         print('✅ User should not be able to call this entrypoint if it is not a vestee')

#     def test_65_vestee_should_not_claim_if_locked(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)
#         totalVestedAmount           = self.MVK(3000000)
#         totalCliffInMonths          = 2
#         totalVestingInMonths        = 24
#         totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths
#         currentTimestamp            = pytezos.now()
#         firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1
        
#         # Storage preparation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
#         res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)
#         res = self.vestingContract.toggleVesteeLock(bob).interpret(storage=res.storage, sender=bob)

#         # Assertions
#         self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
#         self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])
#         self.assertEqual("LOCKED", res.storage['vesteeLedger'][bob]['status'])

#         # Operation
#         with self.raisesMichelsonError(error_vestee_is_locked):
#             self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff)

#         print('✅ User should not be able to call this entrypoint if its vesting is locked')

#     def test_66_vestee_should_not_claim_if_already_claimed(self):
#         # Initial values
#         init_vesting_storage        = deepcopy(self.vestingStorage)
#         totalVestedAmount           = self.MVK(3000000)
#         totalCliffInMonths          = 2
#         totalVestingInMonths        = 24
#         totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths
#         currentTimestamp            = pytezos.now()
#         firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1
        
#         # Storage preparation
#         res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
#         res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

#         # Assertions
#         self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
#         self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
#         self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
#         self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

#         # Operation
#         res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff)
#         with self.raisesMichelsonError(error_unable_to_claim_now):
#             self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff)

#         print('✅ User should not be able to call this entrypoint if it already claimed during the same month')

#     # def test_bob_cannot_claim_before_cliff_period(self):            
#     #     init_vesting_storage = deepcopy(self.vestingStorage)
#     #     print('----')
#     #     print('test_bob_cannot_claim_before_cliff_period')    
#     #     res = self.vestingContract.addVestee(bob, 500000000, 6,24).interpret(storage=init_vesting_storage, sender=admin)            
#     #     with self.raisesMichelsonError(error_unable_to_claim_now):
#     #         self.vestingContract.claim().interpret(storage=res.storage, sender=alice)

#     # def test_bob_can_claim_after_cliff_period(self):            
        
#     #     init_vesting_storage = deepcopy(self.vestingStorage)        
#     #     init_mvk_token_storage = deepcopy(self.mvkTokenStorage)        
        
#     #     currentLevel     = pytezos.shell.head.level()
#     #     currentTimestamp = pytezos.now()
        
#     #     print('current level: ' + str(currentLevel))
#     #     # print(currentTimestamp)
#     #     # print(currentTimestamp + sec_month * 30)
        
#     #     after_6_months = currentTimestamp + sec_month * 6

#     #     totalVestedAmount        = 500000000
#     #     totalCliffInMonths       = 6
#     #     totalVestingInMonths     = 24
#     #     totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

#     #     # print(self.vestingContract.storage)
#     #     addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
#     #     bobClaimsRes = self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender = bob, now = after_6_months, level = currentLevel + blocks_month * 6 + 100)
        
#     #     self.assertEqual(totalClaimAmountPerMonth * 6, bobClaimsRes.storage['vesteeLedger'][bob]['totalClaimed'])

#     #     # addVesteeBobOpg = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).send()
#     #     # print(addVesteeBobOpg)
#     #     # print("opg hash: "+addVesteeBobOpg.hash())

#     #     # oldVestingStorage = self.vestingContract.storage['vesteeLedger']
#     #     # print(oldVestingStorage)

#     #     print(bobClaimsRes)

#     #     # print(self.vestingContract.using(block_id='head~100').storage['vesteeLedger'][bob])
#     #     # print(self.vestingContract.using(block_id='head~10').storage['vesteeLedger'][bob])
#     #     # print(bobClaimsRes.storage['vesteeLedger'][bob])


#     #     # addVesteeBobOpg.inject()
#     #     print('----')
#     #     print('----')
#     #     print('shell')
#     #     # print(pytezos.shell)

#     #     # print(pytezos.shell.get_confirmations(addVesteeBobOpg.hash(), 'transaction', addVesteeBobOpg.branch, 'head'))

#     #     # pytezos.shell.get_confirmations(addVesteeBobOpg.hash(), 'transaction', addVesteeBobOpg.branch, 'head')

#     #     # print(pytezos.shell)

#     #     # newLevel     = pytezos.shell.head.level()
#     #     # new_block_id = 'head~'+str(newLevel)
#     #     # print('new block id: '+ new_block_id)

#     #     # newVestingStorage = self.vestingContract.using(block_id='head~2').storage['vesteeLedger'][bob]()
#     #     # print(newVestingStorage)

#     #     # newVestingStorage = self.vestingContract.storage
#     #     # print(newVestingStorage)

#     #     # bobClaimsRes = self.vestingContract.claim().send()
        
#     #     # print(bobClaimsRes)

#     #     # print('----')
#     #     # print('test_bob_can_claim_after_cliff_period')    
#     #     # print(bobClaimsRes.storage)        

#     #     # print(bobClaimsRes.storage)

#     #     # checkMvkToken = self.mvkTokenContract.storage()        
#     #     # print(pytezos.sleep( num_blocks = 5, time_between_blocks = 1, block_timeout =10))
#     #     # pytezos.sleep(1)
#     #     # pytezos.sleep(1)
        
#     #     # newLevel     = pytezos.shell.head.level()
#     #     # # print('new level: ' + str(newLevel))
#     #     # # # print(pytezos.shell.head.operations)
#     #     # # # print('---')
#     #     # # print('head~'+str(newLevel))
#     #     # new_block_id = 'head~'+str(newLevel)
#     #     # new_block_id = newLevel
#     #     # updatedMvkTokenCheck = self.mvkTokenContract.using(block_id=new_block_id)
#     #     # # # print(updatedMvkTokenCheck)
#     #     # # updatedMvkTokenCheck = updatedMvkTokenCheck.storage
#     #     # # # print(updatedMvkTokenCheck['ledger'][bob]())

#     #     # print('mvkTokenAddress: '+mvkTokenAddress)

#     #     # jsonMvkTokenStorage = pytezos.shell.head.context.raw.json

#     #     # print(updatedMvkTokenCheck)
#     #     # print('---------')
#     #     # print(pytezos.shell.head.context.contracts[mvkTokenAddress].storage())
#     #     # print('---------')
#     #     # print(pytezos.shell.head.context.raw.json.big_maps.index[66].contents())
#     #     # print('--')
#     #     # print('----')


#     # # def test_bob_can_claim_3_months_after_cliff_period(self):            
#     # #     init_vesting_storage = deepcopy(self.vestingStorage)        
        
#     # #     currentLevel     = pytezos.shell.head.level()
#     # #     currentTimestamp = pytezos.now()
        
#     # #     after_9_months = currentTimestamp + (sec_month * 9)

#     # #     totalVestedAmount        = 500000000
#     # #     totalCliffInMonths       = 6
#     # #     totalVestingInMonths     = 24
#     # #     totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

#     # #     addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
#     # #     bobClaimsRes = self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender = bob, now = after_9_months, level = currentLevel + blocks_month * 9 + 100)
        
#     # #     self.assertEqual(totalClaimAmountPerMonth * 9, bobClaimsRes.storage['vesteeLedger'][bob]['totalClaimed'])
        
#     # #     print('----')
#     # #     print('test_bob_can_claim_3_months_after_cliff_period')    
#     # #     print(bobClaimsRes.storage)        

#     # # def test_bob_can_claim_after_cliff_and_2_months_after(self):            
#     # #     init_vesting_storage = deepcopy(self.vestingStorage)        
        
#     # #     currentLevel     = pytezos.shell.head.level()
#     # #     currentTimestamp = pytezos.now()
        
#     # #     after_6_months = currentTimestamp + (sec_month * 6)
#     # #     after_8_months = currentTimestamp + (sec_month * 8)

#     # #     totalVestedAmount        = 500000000
#     # #     totalCliffInMonths       = 6
#     # #     totalVestingInMonths     = 24
#     # #     totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

#     # #     addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
#     # #     bobClaimsRes = self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender = bob, now = after_6_months, level = currentLevel + blocks_month * 6 + 100)
        
#     # #     self.assertEqual(totalClaimAmountPerMonth * 6, bobClaimsRes.storage['vesteeLedger'][bob]['totalClaimed'])

#     # #     bobClaimsRes = self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender = bob, now = after_8_months, level = currentLevel + blocks_month * 8 + 100)
#     # #     self.assertEqual(totalClaimAmountPerMonth * 8, bobClaimsRes.storage['vesteeLedger'][bob]['totalClaimed'])
        
#     # #     print('----')
#     # #     print('test_bob_can_claim_after_cliff_and_2_months_after')    
#     # #     print(bobClaimsRes.storage)        

#     # # def test_admin_can_lock_bob_from_claiming(self):          
#     # #     init_vesting_storage = deepcopy(self.vestingStorage)        
        
#     # #     currentLevel     = pytezos.shell.head.level()
#     # #     currentTimestamp = pytezos.now()
        
#     # #     after_3_months = currentTimestamp + (sec_month * 3)

#     # #     totalVestedAmount        = 500000000
#     # #     totalCliffInMonths       = 3
#     # #     totalVestingInMonths     = 24
#     # #     totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

#     # #     addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
#     # #     bobClaimsRes = self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender = bob, now = after_3_months, level = currentLevel + blocks_month * 3 + 100)

#     # #     lockBobVestee = self.vestingContract.toggleVesteeLock(bob).interpret(storage=bobClaimsRes.storage, sender=admin)
#     # #     self.assertEqual("LOCKED", lockBobVestee.storage['vesteeLedger'][bob]['status'])

#     # #     with self.raisesMichelsonError(error_vestee_is_locked):
#     # #         self.vestingContract.claim().interpret(storage=lockBobVestee.storage, sender=alice)

#     # #     print('----')
#     # #     print('test_admin_can_lock_bob_from_claiming')    
#     # #     print(lockBobVestee.storage)        
          
#     # # def test_admin_can_update_bob_vestee_params(self):          
#     # #     init_vesting_storage = deepcopy(self.vestingStorage)        
        
#     # #     currentLevel     = pytezos.shell.head.level()
#     # #     currentTimestamp = pytezos.now()
        
#     # #     after_3_months = currentTimestamp + (sec_month * 3)

#     # #     totalVestedAmount        = 500000000
#     # #     totalCliffInMonths       = 3
#     # #     totalVestingInMonths     = 24
#     # #     totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

#     # #     addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
#     # #     # bobClaimsRes = self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender = bob, now = after_3_months, level = currentLevel + blocks_month * 3 + 100)

#     # #     print('----')
#     # #     print('test_admin_can_update_bob_vestee_params')    
#     # #     print('before update storage')    
#     # #     print(addVesteeBob.storage) 

#     # #     newTotalVestedAmount        = 1000000000
#     # #     newTotalCliffInMonths       = 6 
#     # #     newTotalVestingInMonths     = 18       

#     # #     updateVesteeBob = self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalVestingInMonths).interpret(storage=addVesteeBob.storage, sender=admin)
#     # #     self.assertEqual(newTotalVestedAmount, updateVesteeBob.storage['vesteeLedger'][bob]['totalAllocatedAmount'])

#     # #     print('--')
#     # #     print('after update storage')    
#     # #     print(updateVesteeBob.storage)    

#     # # def test_admin_can_update_bob_vestee_params_after_he_has_claimed(self):          
#     # #     init_vesting_storage = deepcopy(self.vestingStorage)        
        
#     # #     currentLevel     = pytezos.shell.head.level()
#     # #     currentTimestamp = pytezos.now()
        
#     # #     after_5_months = currentTimestamp + (sec_month * 5)

#     # #     totalVestedAmount        = 500000000
#     # #     totalCliffInMonths       = 5
#     # #     totalVestingInMonths     = 24
#     # #     totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

#     # #     addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
#     # #     bobClaimsRes = self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender = bob, now = after_5_months, level = currentLevel + blocks_month * 5 + 100)

#     # #     print('----')
#     # #     print('test_admin_can_update_bob_vestee_params_after_he_has_claimed')    
#     # #     print('before update storage')    
#     # #     print(bobClaimsRes.storage) 

#     # #     newTotalVestedAmount        = 1000000000
#     # #     newTotalCliffInMonths       = 5 
#     # #     newTotalVestingInMonths     = 18       

#     # #     updateVesteeBob = self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalVestingInMonths).interpret(storage=bobClaimsRes.storage, sender=admin)
#     # #     self.assertEqual(newTotalVestedAmount, updateVesteeBob.storage['vesteeLedger'][bob]['totalAllocatedAmount'])

#     # #     print('--')
#     # #     print('after update storage')    
#     # #     print(updateVesteeBob.storage)    

#     # # def test_admin_can_increase_bob_cliff_period_after_he_has_claimed(self):          
#     # #     init_vesting_storage = deepcopy(self.vestingStorage)        
        
#     # #     currentLevel     = pytezos.shell.head.level()
#     # #     currentTimestamp = pytezos.now()
        
#     # #     after_3_months = currentTimestamp + (sec_month * 3)

#     # #     totalVestedAmount        = 500000000
#     # #     totalCliffInMonths       = 3
#     # #     totalVestingInMonths     = 24
#     # #     totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

#     # #     addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
#     # #     bobClaimsRes = self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender = bob, now = after_3_months, level = currentLevel + blocks_month * 3 + 100)

#     # #     print('----')
#     # #     print('test_admin_can_increase_bob_cliff_period_after_he_has_claimed')    
#     # #     print('before update storage')    
#     # #     print(bobClaimsRes.storage) 

#     # #     newTotalVestedAmount        = 1000000000
#     # #     newTotalCliffInMonths       = 6 
#     # #     newTotalVestingInMonths     = 18       

#     # #     updateVesteeBob = self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalVestingInMonths).interpret(storage=bobClaimsRes.storage, sender=admin)
#     # #     self.assertEqual(newTotalVestedAmount, updateVesteeBob.storage['vesteeLedger'][bob]['totalAllocatedAmount'])

#     # #     print('--')
#     # #     print('after update storage')    
#     # #     print(updateVesteeBob.storage)    

    
#     # # def test_admin_can_remove_bob_vestee(self):          
#     # #     init_vesting_storage = deepcopy(self.vestingStorage)        
        
#     # #     currentLevel     = pytezos.shell.head.level()
#     # #     currentTimestamp = pytezos.now()
        
#     # #     after_3_months = currentTimestamp + (sec_month * 3)

#     # #     totalVestedAmount        = 500000000
#     # #     totalCliffInMonths       = 3
#     # #     totalVestingInMonths     = 24
#     # #     totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

#     # #     addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
#     # #     removeVesteeBob = self.vestingContract.removeVestee(bob).interpret(storage=addVesteeBob.storage, sender=admin)

#     # #     print('----')
#     # #     print('test_admin_can_remove_bob_vestee')        
#     # #     print(removeVesteeBob.storage) 

#     # # def test_vestee_can_only_claim_for_his_share_and_not_for_others(self):          
#     # #     init_vesting_storage = deepcopy(self.vestingStorage)        
        
#     # #     currentLevel     = pytezos.shell.head.level()
#     # #     currentTimestamp = pytezos.now()
        
#     # #     after_3_months = currentTimestamp + (sec_month * 3)

#     # #     totalVestedAmount        = 500000000
#     # #     totalCliffInMonths       = 3
#     # #     totalVestingInMonths     = 24
#     # #     totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

#     # #     addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)        
#     # #     with self.raisesMichelsonError(error_vestee_not_found):
#     # #         self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender=bob)

#     # #     print('----')
#     # #     print('test_vestee_can_only_claim_for_his_share_and_not_for_others')        
#     # #     print(addVesteeBob.storage) 