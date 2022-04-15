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
# from pytezos.sandbox.node import SandboxedNodeTestCase


# # set to localhost sandbox mode for testing
# pytezos = pytezos.using(shell='http://localhost:8732', key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq')


# twoUp =  os.path.abspath(os.path.join('__file__' ,"../../"))
# rootDir = os.path.abspath(os.curdir)
# fileDir = os.path.dirname(os.path.realpath('__file__'))

# print('fileDir: '+fileDir)

# buildDir = os.path.join(fileDir, 'contracts/compiled')
# buildVestingContract = os.path.join(buildDir, 'vesting.tz')
# print('------')
# print('buildDir: '+buildDir)
# print('vesting tz: '+buildVestingContract)

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

# error_unable_to_claim_now = 'Error. You are unable to claim now.'
# error_vestee_is_locked    = 'Error. Vestee is locked.'
# error_vestee_not_found    = 'Error. Vestee is not found.'


# class VestingContract(SandboxedNodeTestCase):
    
#     @classmethod
#     def setUpClass(cls):
#         print('--- set up class ---')
#         print(cls)
#         cls.vestingContract = ContractInterface.from_file(buildVestingContract)

#         # cls.vestingContract = pytezos.contract(vestingContractAddress)
#         # cls.vestingStorage  = cls.vestingContract.storage()
#         # cls.mvkTokenContract = pytezos.contract(mvkTokenAddress)
#         # cls.mvkTokenStorage  = cls.mvkTokenContract.storage()
        
#     @contextmanager
#     def raisesMichelsonError(self, error_message):
#         with self.assertRaises(MichelsonRuntimeError) as r:
#             yield r

#         error_msg = r.exception.format_stdout()
#         if "FAILWITH" in error_msg:
#             self.assertEqual(f"FAILWITH: '{error_message}'", r.exception.format_stdout())
#         else:
#             self.assertEqual(f"'{error_message}': ", r.exception.format_stdout())

# #     ######################
# #     # Tests for vesting contract #
# #     ######################
        
#     def test_admin_can_add_a_new_vestee(self):   

#         header = self.client.shell.head.header()
#         print('header')

#         print('first test')
#         print(self.client)
#         # print(self.vestingContract)
#         # # print(self.vestingContract.storage())
#         # # print(self.vestingStorage)
        
#         # client = self.client.using(key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq')
#         # client.reveal()

#         # # opg = contract.using(shell='http://localhost:8732', key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq').originate(initial_storage="foo")
#         # # opg = opg.fill().sign().inject()

#         # self.bake_block()

#         # print(client)

#         # init_vesting_storage = deepcopy(self.vestingStorage)

#         totalVestedAmount        = 500000000
#         totalCliffInMonths       = 6
#         totalVestingInMonths     = 24
#         totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

#         # call = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths)
#         # print(call)

#         # opg = call.inject()
#         # print(opg)

#         # self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
#         # print('----')
#         # print('test_admin_can_add_a_new_vestee')
#         # print(res.storage['vesteeLedger'][bob])        
        
        
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
#     #     # addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
#     #     # bobClaimsRes = self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender = bob, now = after_6_months, level = currentLevel + blocks_month * 6 + 100)
        
#     #     # self.assertEqual(totalClaimAmountPerMonth * 6, bobClaimsRes.storage['vesteeLedger'][bob]['totalClaimed'])

#     #     addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).run_operation(storage=init_vesting_storage, sender=admin)
#     #     print(addVesteeBob)

#     #     print('----')
#     #     print('test_bob_can_claim_after_cliff_period')    
#     #     # print(bobClaimsRes.storage)        

#     #     # print(bobClaimsRes.storage)

#     #     # checkMvkToken = self.mvkTokenContract.storage()        
#     #     # print(pytezos.sleep( num_blocks = 5, time_between_blocks = 1, block_timeout =10))
#     #     pytezos.sleep(1)
#     #     pytezos.sleep(1)
        
#     #     newLevel     = pytezos.shell.head.level()
#     #     # print('new level: ' + str(newLevel))
#     #     # # print(pytezos.shell.head.operations)
#     #     # # print('---')
#     #     # print('head~'+str(newLevel))
#     #     # # new_block_id = 'head~'+str(newLevel)
#     #     new_block_id = newLevel
#     #     updatedMvkTokenCheck = self.mvkTokenContract.using(block_id=new_block_id)
#     #     # # print(updatedMvkTokenCheck)
#     #     # updatedMvkTokenCheck = updatedMvkTokenCheck.storage
#     #     # # print(updatedMvkTokenCheck['ledger'][bob]())

#     #     print('mvkTokenAddress: '+mvkTokenAddress)

#     #     jsonMvkTokenStorage = pytezos.shell.head.context.raw.json

#     #     print(updatedMvkTokenCheck)
#     #     print('---------')
#     #     print(pytezos.shell.head.context.contracts[mvkTokenAddress].storage())
#     #     print('---------')
#     #     print(pytezos.shell.head.context.raw.json.big_maps.index[66].contents())
#     #     print('--')
#     #     print('----')


#     # def test_bob_can_claim_3_months_after_cliff_period(self):            
#     #     init_vesting_storage = deepcopy(self.vestingStorage)        
        
#     #     currentLevel     = pytezos.shell.head.level()
#     #     currentTimestamp = pytezos.now()
        
#     #     after_9_months = currentTimestamp + (sec_month * 9)

#     #     totalVestedAmount        = 500000000
#     #     totalCliffInMonths       = 6
#     #     totalVestingInMonths     = 24
#     #     totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

#     #     addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
#     #     bobClaimsRes = self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender = bob, now = after_9_months, level = currentLevel + blocks_month * 9 + 100)
        
#     #     self.assertEqual(totalClaimAmountPerMonth * 9, bobClaimsRes.storage['vesteeLedger'][bob]['totalClaimed'])
        
#     #     print('----')
#     #     print('test_bob_can_claim_3_months_after_cliff_period')    
#     #     print(bobClaimsRes.storage)        

#     # def test_bob_can_claim_after_cliff_and_2_months_after(self):            
#     #     init_vesting_storage = deepcopy(self.vestingStorage)        
        
#     #     currentLevel     = pytezos.shell.head.level()
#     #     currentTimestamp = pytezos.now()
        
#     #     after_6_months = currentTimestamp + (sec_month * 6)
#     #     after_8_months = currentTimestamp + (sec_month * 8)

#     #     totalVestedAmount        = 500000000
#     #     totalCliffInMonths       = 6
#     #     totalVestingInMonths     = 24
#     #     totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

#     #     addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
#     #     bobClaimsRes = self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender = bob, now = after_6_months, level = currentLevel + blocks_month * 6 + 100)
        
#     #     self.assertEqual(totalClaimAmountPerMonth * 6, bobClaimsRes.storage['vesteeLedger'][bob]['totalClaimed'])

#     #     bobClaimsRes = self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender = bob, now = after_8_months, level = currentLevel + blocks_month * 8 + 100)
#     #     self.assertEqual(totalClaimAmountPerMonth * 8, bobClaimsRes.storage['vesteeLedger'][bob]['totalClaimed'])
        
#     #     print('----')
#     #     print('test_bob_can_claim_after_cliff_and_2_months_after')    
#     #     print(bobClaimsRes.storage)        

#     # def test_admin_can_lock_bob_from_claiming(self):          
#     #     init_vesting_storage = deepcopy(self.vestingStorage)        
        
#     #     currentLevel     = pytezos.shell.head.level()
#     #     currentTimestamp = pytezos.now()
        
#     #     after_3_months = currentTimestamp + (sec_month * 3)

#     #     totalVestedAmount        = 500000000
#     #     totalCliffInMonths       = 3
#     #     totalVestingInMonths     = 24
#     #     totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

#     #     addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
#     #     bobClaimsRes = self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender = bob, now = after_3_months, level = currentLevel + blocks_month * 3 + 100)

#     #     lockBobVestee = self.vestingContract.toggleVesteeLock(bob).interpret(storage=bobClaimsRes.storage, sender=admin)
#     #     self.assertEqual("LOCKED", lockBobVestee.storage['vesteeLedger'][bob]['status'])

#     #     with self.raisesMichelsonError(error_vestee_is_locked):
#     #         self.vestingContract.claim().interpret(storage=lockBobVestee.storage, sender=alice)

#     #     print('----')
#     #     print('test_admin_can_lock_bob_from_claiming')    
#     #     print(lockBobVestee.storage)        
          
#     # def test_admin_can_update_bob_vestee_params(self):          
#     #     init_vesting_storage = deepcopy(self.vestingStorage)        
        
#     #     currentLevel     = pytezos.shell.head.level()
#     #     currentTimestamp = pytezos.now()
        
#     #     after_3_months = currentTimestamp + (sec_month * 3)

#     #     totalVestedAmount        = 500000000
#     #     totalCliffInMonths       = 3
#     #     totalVestingInMonths     = 24
#     #     totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

#     #     addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
#     #     # bobClaimsRes = self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender = bob, now = after_3_months, level = currentLevel + blocks_month * 3 + 100)

#     #     print('----')
#     #     print('test_admin_can_update_bob_vestee_params')    
#     #     print('before update storage')    
#     #     print(addVesteeBob.storage) 

#     #     newTotalVestedAmount        = 1000000000
#     #     newTotalCliffInMonths       = 6 
#     #     newTotalVestingInMonths     = 18       

#     #     updateVesteeBob = self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalVestingInMonths).interpret(storage=addVesteeBob.storage, sender=admin)
#     #     self.assertEqual(newTotalVestedAmount, updateVesteeBob.storage['vesteeLedger'][bob]['totalAllocatedAmount'])

#     #     print('--')
#     #     print('after update storage')    
#     #     print(updateVesteeBob.storage)    

#     # def test_admin_can_update_bob_vestee_params_after_he_has_claimed(self):          
#     #     init_vesting_storage = deepcopy(self.vestingStorage)        
        
#     #     currentLevel     = pytezos.shell.head.level()
#     #     currentTimestamp = pytezos.now()
        
#     #     after_5_months = currentTimestamp + (sec_month * 5)

#     #     totalVestedAmount        = 500000000
#     #     totalCliffInMonths       = 5
#     #     totalVestingInMonths     = 24
#     #     totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

#     #     addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
#     #     bobClaimsRes = self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender = bob, now = after_5_months, level = currentLevel + blocks_month * 5 + 100)

#     #     print('----')
#     #     print('test_admin_can_update_bob_vestee_params_after_he_has_claimed')    
#     #     print('before update storage')    
#     #     print(bobClaimsRes.storage) 

#     #     newTotalVestedAmount        = 1000000000
#     #     newTotalCliffInMonths       = 5 
#     #     newTotalVestingInMonths     = 18       

#     #     updateVesteeBob = self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalVestingInMonths).interpret(storage=bobClaimsRes.storage, sender=admin)
#     #     self.assertEqual(newTotalVestedAmount, updateVesteeBob.storage['vesteeLedger'][bob]['totalAllocatedAmount'])

#     #     print('--')
#     #     print('after update storage')    
#     #     print(updateVesteeBob.storage)    

#     # def test_admin_can_increase_bob_cliff_period_after_he_has_claimed(self):          
#     #     init_vesting_storage = deepcopy(self.vestingStorage)        
        
#     #     currentLevel     = pytezos.shell.head.level()
#     #     currentTimestamp = pytezos.now()
        
#     #     after_3_months = currentTimestamp + (sec_month * 3)

#     #     totalVestedAmount        = 500000000
#     #     totalCliffInMonths       = 3
#     #     totalVestingInMonths     = 24
#     #     totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

#     #     addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
#     #     bobClaimsRes = self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender = bob, now = after_3_months, level = currentLevel + blocks_month * 3 + 100)

#     #     print('----')
#     #     print('test_admin_can_increase_bob_cliff_period_after_he_has_claimed')    
#     #     print('before update storage')    
#     #     print(bobClaimsRes.storage) 

#     #     newTotalVestedAmount        = 1000000000
#     #     newTotalCliffInMonths       = 6 
#     #     newTotalVestingInMonths     = 18       

#     #     updateVesteeBob = self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalVestingInMonths).interpret(storage=bobClaimsRes.storage, sender=admin)
#     #     self.assertEqual(newTotalVestedAmount, updateVesteeBob.storage['vesteeLedger'][bob]['totalAllocatedAmount'])

#     #     print('--')
#     #     print('after update storage')    
#     #     print(updateVesteeBob.storage)    

    
#     # def test_admin_can_remove_bob_vestee(self):          
#     #     init_vesting_storage = deepcopy(self.vestingStorage)        
        
#     #     currentLevel     = pytezos.shell.head.level()
#     #     currentTimestamp = pytezos.now()
        
#     #     after_3_months = currentTimestamp + (sec_month * 3)

#     #     totalVestedAmount        = 500000000
#     #     totalCliffInMonths       = 3
#     #     totalVestingInMonths     = 24
#     #     totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

#     #     addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
#     #     removeVesteeBob = self.vestingContract.removeVestee(bob).interpret(storage=addVesteeBob.storage, sender=admin)

#     #     print('----')
#     #     print('test_admin_can_remove_bob_vestee')        
#     #     print(removeVesteeBob.storage) 

#     # def test_vestee_can_only_claim_for_his_share_and_not_for_others(self):          
#     #     init_vesting_storage = deepcopy(self.vestingStorage)        
        
#     #     currentLevel     = pytezos.shell.head.level()
#     #     currentTimestamp = pytezos.now()
        
#     #     after_3_months = currentTimestamp + (sec_month * 3)

#     #     totalVestedAmount        = 500000000
#     #     totalCliffInMonths       = 3
#     #     totalVestingInMonths     = 24
#     #     totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

#     #     addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)        
#     #     with self.raisesMichelsonError(error_vestee_not_found):
#     #         self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender=bob)

#     #     print('----')
#     #     print('test_vestee_can_only_claim_for_his_share_and_not_for_others')        
#     #     print(addVesteeBob.storage) 