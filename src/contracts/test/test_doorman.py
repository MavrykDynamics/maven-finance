# from unittest import TestCase
# from contextlib import contextmanager
# from copy import deepcopy
# from pytezos import ContractInterface, MichelsonRuntimeError, pytezos
# from pytezos.michelson.types.big_map import big_map_diff_to_lazy_diff
# from pytezos.operation.result import OperationResult
# from pytezos.contract.result import ContractCallResult
# import time
# import json 
# import logging
# import pytest
# import os 
# # import os.path as path

# # set to localhost sandbox mode for testing
# pytezos = pytezos.using(shell='http://localhost:8732', key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq')

# # print(pytezos.using(shell='http://localhost:20000', key='edpkvGfYw3LyB1UcCahKQk4rF2tvbMUk8GFiTuMjL75uGXrpvKXhjn'))
# # pytezos.using(shell='http://localhost:20000', key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq').activate_account

# twoUp =  os.path.abspath(os.path.join('__file__' ,"../../"))
# rootDir = os.path.abspath(os.curdir)
# fileDir = os.path.dirname(os.path.realpath('__file__'))
# print('root dir: '+rootDir)
# print('file dlr: '+fileDir)
# print('two up: '+ twoUp)

# helpersDir          = os.path.join(fileDir, 'helpers')
# mvkTokenDecimals = os.path.join(helpersDir, 'mvkTokenDecimals.json')
# mvkTokenDecimals = open(mvkTokenDecimals)
# mvkTokenDecimals = json.load(mvkTokenDecimals)
# mvkTokenDecimals = mvkTokenDecimals['decimals']

# deploymentsDir          = os.path.join(fileDir, 'deployments')
# deployedDoormanContract = os.path.join(deploymentsDir, 'doormanAddress.json')
# deployedMvkTokenContract = os.path.join(deploymentsDir, 'mvkTokenAddress.json')
# deployedFarmFactoryContract = os.path.join(deploymentsDir, 'farmFactoryAddress.json')
# deployedDelegationContract = os.path.join(deploymentsDir, 'delegationAddress.json')

# deployedDoorman = open(deployedDoormanContract)
# doormanContractAddress = json.load(deployedDoorman)
# doormanContractAddress = doormanContractAddress['address']

# deployedMvkToken = open(deployedMvkTokenContract)
# mvkTokenAddress = json.load(deployedMvkToken)
# mvkTokenAddress = mvkTokenAddress['address']

# deployedDelegation = open(deployedDelegationContract)
# delegationAddress = json.load(deployedDelegation)
# delegationAddress = delegationAddress['address']

# deployedFarmFactoryContract = open(deployedFarmFactoryContract)
# farmFactoryAddress = json.load(deployedFarmFactoryContract)
# farmFactoryAddress = farmFactoryAddress['address']

# print('Doorman Contract Deployed at: ' + doormanContractAddress)
# print('MVK Token Contract Deployed at: ' + mvkTokenAddress)
# print('Delegation Contract Deployed at: ' + delegationAddress)
# print('Farm Factory Contract Deployed at: ' + farmFactoryAddress)

# alice = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
# admin = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
# bob = 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6'
# eve = 'tz1MnmtP4uAcgMpeZN6JtyziXeFqqwQG6yn6'
# fox = 'tz1R2oNqANNy2vZhnZBJc8iMEqW79t85Fv7L'

# sec_week = 604800

# error_only_administrator = 'Error. Only the administrator can call this entrypoint.'
# error_only_mvk_can_call = 'Error. Only the MVK Token Contract can call this entrypoint.'
# error_stake_paused = 'Stake entrypoint is paused.'
# error_unstake_paused = 'Unstake entrypoint is paused.'
# error_compound_paused = 'Compound entrypoint is paused.'
# error_only_delegation = 'Error. Only the Delegation Contract can call this entrypoint.'
# error_mvk_contract_not_found = 'Error. MVK Token Contract is not found.'
# error_delegation_contract_not_found = 'Error. Delegation Contract is not found.'
# error_treasury_contract_not_found = 'Error. Farm treasury contract not found'
# error_min_mvk_amount_stake = 'You have to stake at least 1 MVK token.'
# error_min_mvk_amount_unstake = 'You have to unstake at least 1 MVK token.'
# error_min_mvk_bound = 'Error. The minimum amount of MVK to stake should be equal to 1.'

# class DoormanContract(TestCase):
    
#     @classmethod
#     def setUpClass(cls):
#         cls.doormanContract = pytezos.contract(doormanContractAddress)
#         cls.doormanStorage  = cls.doormanContract.storage()
#         cls.mvkTokenContract = pytezos.contract(mvkTokenAddress)
#         cls.mvkTokenStorage  = cls.mvkTokenContract.storage()
#         cls.farmFactoryContract = pytezos.contract(farmFactoryAddress)
#         cls.farmFactoryStorage  = cls.farmFactoryContract.storage()

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

# #     ######################
# #     # Tests for doorman contract #
# #     ######################

#     ###
#     # %setAdmin
#     ##
#     def test_00_admin_set_admin(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)

#         # Initial values
#         previousAdmin = init_doorman_storage['admin']

#         # Operation
#         res = self.doormanContract.setAdmin(alice).interpret(storage=init_doorman_storage, sender=bob)

#         # Check new admin
#         newAdmin = res.storage['admin']

#         self.assertEqual(bob, previousAdmin)
#         self.assertEqual(alice, newAdmin)

#         print('----')
#         print('✅ Admin tries to set another admin')
#         print('previous admin:')
#         print(previousAdmin)
#         print('new admin:')
#         print(newAdmin)

#     def test_01_non_admin_set_admin(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)

#         # Initial values
#         previousAdmin = init_doorman_storage['admin']
#         newAdmin = previousAdmin

#         # Operation
#         with self.raisesMichelsonError(error_only_administrator):
#             res = self.doormanContract.setAdmin(bob).interpret(storage=init_doorman_storage, sender=alice)
#             # Check new admin
#             newAdmin = res.storage['admin']

#         self.assertEqual(bob, previousAdmin)
#         self.assertEqual(bob, newAdmin)

#         print('----')
#         print('✅ Non-admin tries to set another admin')
#         print('previous admin:')
#         print(previousAdmin)
#         print('new admin:')
#         print(newAdmin)

#     ###
#     # %pauseAll
#     ##
#     def test_20_admin_call_entrypoint(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)

#         # Initial values
#         stakeIsPaused = init_doorman_storage['breakGlassConfig']['stakeIsPaused']
#         unstakeIsPaused = init_doorman_storage['breakGlassConfig']['unstakeIsPaused']
#         compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']
#         stakeAmount = self.MVK(2)
#         unstakeAmount = self.MVK()

#         # Operation
#         res = self.doormanContract.pauseAll().interpret(storage=init_doorman_storage, sender=bob)

#         # Final values
#         finalStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']
#         finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']
#         finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']

#         # Tests operations
#         with self.raisesMichelsonError(error_stake_paused):
#             res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=bob)
        
#         with self.raisesMichelsonError(error_unstake_paused):
#             res = self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=bob)
        
#         with self.raisesMichelsonError(error_compound_paused):
#             res = self.doormanContract.compound().interpret(storage=res.storage, sender=bob)

#         self.assertEqual(0, res.storage['stakedMvkTotalSupply'])
#         self.assertNotEqual(stakeIsPaused, finalStakeIsPaused)
#         self.assertNotEqual(unstakeIsPaused, finalUnstakeIsPaused)
#         self.assertNotEqual(compoundIsPaused, finalCompoundIsPaused)

#         print('----')
#         print('✅ Admin tries to pause all entrypoints')
#         print('stake is paused:')
#         print(finalStakeIsPaused)
#         print('unstake is paused:')
#         print(finalUnstakeIsPaused)
#         print('compound is paused:')
#         print(finalCompoundIsPaused)

#     def test_21_non_admin_call_entrypoint(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)

#         # Initial values
#         stakeIsPaused = init_doorman_storage['breakGlassConfig']['stakeIsPaused']
#         unstakeIsPaused = init_doorman_storage['breakGlassConfig']['unstakeIsPaused']
#         compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']
#         finalStakeIsPaused = stakeIsPaused
#         finalUnstakeIsPaused = unstakeIsPaused
#         finalCompoundIsPaused = compoundIsPaused

#         # Operation
#         with self.raisesMichelsonError(error_only_administrator):
#             res = self.doormanContract.pauseAll().interpret(storage=init_doorman_storage, sender=alice)

#             # Final values
#             finalStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']
#             finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']
#             finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']

#         self.assertEqual(stakeIsPaused, finalStakeIsPaused)
#         self.assertEqual(unstakeIsPaused, finalUnstakeIsPaused)
#         self.assertEqual(compoundIsPaused, finalCompoundIsPaused)

#         print('----')
#         print('✅ Non-admin tries to pause all entrypoints')
#         print('stake is paused:')
#         print(finalStakeIsPaused)
#         print('unstake is paused:')
#         print(finalUnstakeIsPaused)
#         print('compound is paused:')
#         print(finalCompoundIsPaused)

#     ###
#     # %unpauseAll
#     ##
#     def test_22_admin_call_entrypoint(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)
#         init_mvk_storage = deepcopy(self.mvkTokenStorage)

#         # Initial values
#         stakeIsPaused = init_doorman_storage['breakGlassConfig']['stakeIsPaused']
#         unstakeIsPaused = init_doorman_storage['breakGlassConfig']['unstakeIsPaused']
#         compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']
#         stakeAmount = self.MVK(2)
#         unstakeAmount = self.MVK()
#         res = self.doormanContract.pauseAll().interpret(storage=init_doorman_storage, sender=bob)

#         # Paused values
#         pauseStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']
#         pauseUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']
#         pauseCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']

#         # Operation
#         res = self.doormanContract.unpauseAll().interpret(storage=res.storage, sender=bob)

#         # Tests operations
#         res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=bob)
#         res = self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=bob, view_results={
#             mvkTokenAddress+"%getTotalSupply": init_mvk_storage['totalSupply']
#         })
#         res = self.doormanContract.compound().interpret(storage=res.storage, sender=bob)
        
#         # Final values
#         finalStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']
#         finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']
#         finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']

#         self.assertNotEqual(0, res.storage['stakedMvkTotalSupply'])
#         self.assertNotEqual(stakeIsPaused, pauseStakeIsPaused)
#         self.assertNotEqual(unstakeIsPaused, pauseUnstakeIsPaused)
#         self.assertNotEqual(compoundIsPaused, pauseCompoundIsPaused)
#         self.assertEqual(stakeIsPaused, finalStakeIsPaused)
#         self.assertEqual(unstakeIsPaused, finalUnstakeIsPaused)
#         self.assertEqual(compoundIsPaused, finalCompoundIsPaused)

#         print('----')
#         print('✅ Admin tries to unpause all entrypoints')
#         print('stake is paused:')
#         print(finalStakeIsPaused)
#         print('unstake is paused:')
#         print(finalUnstakeIsPaused)
#         print('compound is paused:')
#         print(finalCompoundIsPaused)

#     def test_23_non_admin_call_entrypoint(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)
#         init_mvk_storage = deepcopy(self.mvkTokenStorage)

#         # Initial values
#         stakeIsPaused = init_doorman_storage['breakGlassConfig']['stakeIsPaused']
#         unstakeIsPaused = init_doorman_storage['breakGlassConfig']['unstakeIsPaused']
#         compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']
#         stakeAmount = self.MVK(2)
#         unstakeAmount = self.MVK()
#         res = self.doormanContract.pauseAll().interpret(storage=init_doorman_storage, sender=bob)

#         # Paused values
#         pauseStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']
#         pauseUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']
#         pauseCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']

#         # Operation
#         with self.raisesMichelsonError(error_only_administrator):
#             res = self.doormanContract.unpauseAll().interpret(storage=res.storage, sender=alice)

#         # Tests operations
#         with self.raisesMichelsonError(error_stake_paused):
#             res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=bob)
        
#         with self.raisesMichelsonError(error_unstake_paused):
#             res = self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=bob, view_results={
#             mvkTokenAddress+"%getTotalSupply": init_mvk_storage['totalSupply']
#         })
        
#         with self.raisesMichelsonError(error_compound_paused):
#             res = self.doormanContract.compound().interpret(storage=res.storage, sender=bob)
        
#         # Final values
#         finalStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']
#         finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']
#         finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']

#         self.assertEqual(0, res.storage['stakedMvkTotalSupply'])
#         self.assertNotEqual(stakeIsPaused, pauseStakeIsPaused)
#         self.assertNotEqual(unstakeIsPaused, pauseUnstakeIsPaused)
#         self.assertNotEqual(compoundIsPaused, pauseCompoundIsPaused)
#         self.assertNotEqual(stakeIsPaused, finalStakeIsPaused)
#         self.assertNotEqual(unstakeIsPaused, finalUnstakeIsPaused)
#         self.assertNotEqual(compoundIsPaused, finalCompoundIsPaused)

#         print('----')
#         print('✅ Non-admin tries to unpause all entrypoints')
#         print('stake is paused:')
#         print(finalStakeIsPaused)
#         print('unstake is paused:')
#         print(finalUnstakeIsPaused)
#         print('compound is paused:')
#         print(finalCompoundIsPaused)

#     ###
#     # %togglePauseStake
#     ##
#     def test_24_admin_pause_stake(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)

#         # Initial values
#         stakeIsPaused = init_doorman_storage['breakGlassConfig']['stakeIsPaused']
#         stakeAmount = self.MVK(2)

#         # Operation
#         res = self.doormanContract.togglePauseStake().interpret(storage=init_doorman_storage, sender=bob)

#         # Final values
#         finalStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']

#         # Tests operations
#         with self.raisesMichelsonError(error_stake_paused):
#             res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=bob)

#         self.assertEqual(0, res.storage['stakedMvkTotalSupply'])
#         self.assertNotEqual(stakeIsPaused, finalStakeIsPaused)

#         print('----')
#         print('✅ Admin tries to pause stake entrypoint')
#         print('stake is paused:')
#         print(finalStakeIsPaused)

    
#     def test_25_non_admin_pause_stake(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)

#         # Initial values
#         stakeIsPaused = init_doorman_storage['breakGlassConfig']['stakeIsPaused']
#         stakeAmount = self.MVK(2)
#         finalStakeIsPaused = stakeIsPaused;

#         # Operation
#         with self.raisesMichelsonError(error_only_administrator):
#             res = self.doormanContract.togglePauseStake().interpret(storage=init_doorman_storage, sender=alice)

#             # Final values
#             finalStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']

#             # Tests operations
#             res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=bob)

#             self.assertNotEqual(0, res.storage['stakedMvkTotalSupply'])
#             self.assertEqual(stakeIsPaused, finalStakeIsPaused)

#         print('----')
#         print('✅ Non-admin tries to pause stake entrypoint')
#         print('stake is paused:')
#         print(finalStakeIsPaused)

#     ###
#     # %togglePauseUnstake
#     ##
#     def test_26_admin_pause_unstake(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)
#         init_mvk_storage = deepcopy(self.mvkTokenStorage)

#         # Initial values
#         unstakeIsPaused = init_doorman_storage['breakGlassConfig']['unstakeIsPaused']
#         stakeAmount = self.MVK(2)
#         unstakeAmount = self.MVK()

#         # Operation
#         res = self.doormanContract.togglePauseUnstake().interpret(storage=init_doorman_storage, sender=bob)

#         # Final values
#         finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']

#         # Tests operations
#         res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=bob)
#         with self.raisesMichelsonError(error_unstake_paused):
#             res = self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=bob, view_results={
#                 mvkTokenAddress+"%getTotalSupply": init_mvk_storage['totalSupply']
#             })

#         self.assertNotEqual(0, res.storage['stakedMvkTotalSupply'])
#         self.assertNotEqual(unstakeIsPaused, finalUnstakeIsPaused)

#         print('----')
#         print('✅ Admin tries to pause stake entrypoint')
#         print('unstake is paused:')
#         print(finalUnstakeIsPaused)

#     def test_27_non_admin_pause_unstake(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)
#         init_mvk_storage = deepcopy(self.mvkTokenStorage)

#         # Initial values
#         unstakeIsPaused = init_doorman_storage['breakGlassConfig']['unstakeIsPaused']
#         stakeAmount = self.MVK(2)
#         unstakeAmount = self.MVK()
#         finalUnstakeIsPaused = unstakeIsPaused;

#         # Operation
#         with self.raisesMichelsonError(error_only_administrator):
#             res = self.doormanContract.togglePauseUnstake().interpret(storage=init_doorman_storage, sender=alice)

#             # Final values
#             finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']

#             # Tests operations
#             res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=bob)
#             res = self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=bob, view_results={
#                 mvkTokenAddress+"%getTotalSupply": init_mvk_storage['totalSupply']
#             })

#             self.assertNotEqual(0, res.storage['stakedMvkTotalSupply'])
#             self.assertEqual(unstakeIsPaused, finalUnstakeIsPaused)

#         print('----')
#         print('✅ Non-admin tries to pause unstake entrypoint')
#         print('unstake is paused:')
#         print(finalUnstakeIsPaused)

#     ###
#     # %togglePauseCompound
#     ##
#     def test_26_admin_pause_compound(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)

#         # Initial values
#         compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']

#         # Operation
#         res = self.doormanContract.togglePauseCompound().interpret(storage=init_doorman_storage, sender=bob)

#         # Final values
#         finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']

#         # Tests operations
#         with self.raisesMichelsonError(error_compound_paused):
#             res = self.doormanContract.compound().interpret(storage=res.storage, sender=bob)

#         self.assertEqual(0, res.storage['stakedMvkTotalSupply'])
#         self.assertNotEqual(compoundIsPaused, finalCompoundIsPaused)

#         print('----')
#         print('✅ Admin tries to pause compound entrypoint')
#         print('compound is paused:')
#         print(finalCompoundIsPaused)
    
#     def test_27_non_admin_pause_compound(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)

#         # Initial values
#         compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']
#         finalCompoundIsPaused = compoundIsPaused;

#         # Operation
#         with self.raisesMichelsonError(error_only_administrator):
#             res = self.doormanContract.togglePauseStake().interpret(storage=init_doorman_storage, sender=alice)

#             # Final values
#             finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']

#             # Tests operations
#             res = self.doormanContract.compound().interpret(storage=res.storage, sender=bob)

#             self.assertNotEqual(0, res.storage['stakedMvkTotalSupply'])
#             self.assertEqual(compoundIsPaused, finalCompoundIsPaused)

#         print('----')
#         print('✅ Non-admin tries to pause compound entrypoint')
#         print('compound is paused:')
#         print(finalCompoundIsPaused)

#     ###
#     # %getStakedBalance
#     ##
#     def test_30_user_get_existing_balance(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)

#         # Initial values
#         stakeAmount = self.MVK(2)

#         # Tests operations
#         res = self.doormanContract.stake(stakeAmount).interpret(storage=init_doorman_storage, sender=alice)

#         # Operation
#         res = self.doormanContract.getStakedBalance(bob,None).interpret(storage=res.storage, sender=bob, view_results=doormanContractAddress+"%getStakedBalance");

#         # Final values
#         userBalance = int(res.operations[-1]['parameters']['value']['int'])

#         self.assertEqual(stakeAmount, userBalance)

#         print('----')
#         print('✅ User tries to get balance of a user who already staked')
#         print('user balance:')
#         print(userBalance)

#     def test_31_user_get_unexisting_balance(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)

#         # Operation
#         res = self.doormanContract.getStakedBalance(bob,None).interpret(storage=init_doorman_storage, sender=bob, view_results=doormanContractAddress+"%getStakedBalance");

#         # Final values
#         userBalance = int(res.operations[-1]['parameters']['value']['int'])

#         self.assertEqual(0, userBalance)

#         print('----')
#         print('✅ User tries to get balance of a user who never staked')
#         print('user balance:')
#         print(userBalance)
    
#     ###
#     # %stake
#     ##
#     def test_40_stake_delegation_contract_unknown_to_doorman(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)

#         # Initial values
#         stakeAmount = self.MVK(2)

#         # Operations
#         res = self.doormanContract.updateGeneralContracts("delegation",delegationAddress).interpret(storage=init_doorman_storage, sender=bob);
#         with self.raisesMichelsonError(error_delegation_contract_not_found):
#             self.doormanContract.stake( stakeAmount).interpret(storage=res.storage, sender=bob);

#         print('----')
#         print('✅ User tries to stake while doorman does not have delegation contract in generalContracts')

#     ###
#     # %unstake
#     ##
#     def test_51_mvk_contract_call_unstake(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)
#         init_mvk_storage = deepcopy(self.mvkTokenStorage)

#         # Initial values
#         stakeAmount = self.MVK(2)
#         unstakeAmount = self.MVK(2)
#         mvkTotalSupply = self.MVK(100)

#         # Operations
#         res = self.doormanContract.stake(stakeAmount).interpret(storage=init_doorman_storage, sender=bob);
#         res = self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=bob, view_results={
#             mvkTokenAddress+"%getTotalSupply": init_mvk_storage['totalSupply']
#         })

#         print('----')
#         print('✅ MVK Token contract tries to call unstake')

#     def test_52_unstake_delegation_contract_unknown_to_doorman(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)
#         init_mvk_storage = deepcopy(self.mvkTokenStorage)

#         # Initial values
#         stakeAmount = self.MVK(2)
#         unstakeAmount = self.MVK(2)
#         mvkTotalSupply = self.MVK(100)

#         # Operations
#         res = self.doormanContract.stake(stakeAmount).interpret(storage=init_doorman_storage, sender=bob);
#         res = self.doormanContract.updateGeneralContracts("delegation",delegationAddress).interpret(storage=res.storage, sender=bob);
#         with self.raisesMichelsonError(error_delegation_contract_not_found):
#             self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=bob, view_results={
#                 mvkTokenAddress+"%getTotalSupply": init_mvk_storage['totalSupply']
#             })

#         print('----')
#         print('✅ MVK Token contract tries to call unstake while doorman does not have delegation contract in generalContracts')

#     def test_53_non_mvk_contract_call_unstake(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)
#         init_mvk_storage = deepcopy(self.mvkTokenStorage)

#         # Initial values
#         stakeAmount = self.MVK(2)
#         unstakeAmount = self.MVK(2)

#         # Operations
#         res = self.doormanContract.stake(stakeAmount).interpret(storage=init_doorman_storage, sender=bob);
#         with self.raisesMichelsonError(error_only_mvk_can_call):
#             self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=bob, source=bob, view_results={
#                 mvkTokenAddress+"%getTotalSupply": init_mvk_storage['totalSupply']
#             })

#         print('----')
#         print('✅ Non-MVK Token contract tries to call unstake')

#     ###
#     # %compound
#     ##
#     def test_60_compound_delegation_contract_unknown_to_doorman(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)

#         # Initial values
#         stakeAmount = self.MVK(2)

#         # Operations
#         res = self.doormanContract.stake(stakeAmount).interpret(storage=init_doorman_storage, sender=bob);
#         res = self.doormanContract.updateGeneralContracts("delegation",delegationAddress).interpret(storage=res.storage, sender=bob);
#         with self.raisesMichelsonError(error_delegation_contract_not_found):
#             self.doormanContract.compound().interpret(storage=res.storage, sender=bob, source=bob);

#         print('----')
#         print('✅ User tries to compound while doorman does not have delegation contract in generalContracts')

#     ###
#     # %updateMinMvkAmount
#     ##
#     def test_70_admin_can_increase_min_mvk(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)
#         init_mvk_storage = deepcopy(self.mvkTokenStorage)

#         # Initial values
#         stakeAmount = self.MVK(1)
#         minAmount = init_doorman_storage['minMvkAmount']
#         desiredMinAmount = self.MVK(2)

#         # Operation
#         res = self.doormanContract.updateMinMvkAmount(desiredMinAmount).interpret(storage=init_doorman_storage, sender=bob);

#         # Test operation
#         with self.raisesMichelsonError(error_min_mvk_amount_stake):
#             res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=bob);
        
#         with self.raisesMichelsonError(error_min_mvk_amount_unstake):
#             res = self.doormanContract.unstake(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
#                 mvkTokenAddress+"%getTotalSupply": init_mvk_storage['totalSupply']
#             })

#         newAmount = res.storage['minMvkAmount']

#         self.assertNotEqual(minAmount, newAmount)

#         print('----')
#         print('✅ Admin should be able to increase the minimum amount of MVK to interact with the contract')
#         print('minimum amount:')
#         print(res.storage['minMvkAmount'])

#     def test_71_admin_can_decrease_min_mvk(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)
#         init_mvk_storage = deepcopy(self.mvkTokenStorage)

#         # Initial values
#         stakeAmount = self.MVK(1)
#         minAmount = init_doorman_storage['minMvkAmount']
#         firstDesiredMinAmount = self.MVK(3)
#         secondDesiredMinAmount = self.MVK(2)

#         # Operation
#         res = self.doormanContract.updateMinMvkAmount(firstDesiredMinAmount).interpret(storage=init_doorman_storage, sender=bob);
#         res = self.doormanContract.updateMinMvkAmount(secondDesiredMinAmount).interpret(storage=res.storage, sender=bob);

#         # Test operation
#         with self.raisesMichelsonError(error_min_mvk_amount_stake):
#             res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=bob);
        
#         with self.raisesMichelsonError(error_min_mvk_amount_unstake):
#             res = self.doormanContract.unstake(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
#                 mvkTokenAddress+"%getTotalSupply": init_mvk_storage['totalSupply']
#             })

#         newAmount = res.storage['minMvkAmount']

#         self.assertNotEqual(minAmount, newAmount)

#         print('----')
#         print('✅ Admin should be able to decrease the minimum amount of MVK to interact with the contract')
#         print('minimum amount:')
#         print(res.storage['minMvkAmount'])

#     def test_72_admin_cant_decrease_min_mvk_too_much(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)
#         init_mvk_storage = deepcopy(self.mvkTokenStorage)

#         # Initial values
#         stakeAmount = self.MVK(1)
#         minAmount = init_doorman_storage['minMvkAmount']
#         desiredMinAmount = self.MVK(0.5)

#         # Operation
#         with self.raisesMichelsonError(error_min_mvk_bound):
#             res = self.doormanContract.updateMinMvkAmount(desiredMinAmount).interpret(storage=init_doorman_storage, sender=bob);

#         # Test operation
#         res = self.doormanContract.stake(stakeAmount).interpret(storage=init_doorman_storage, sender=bob);
#         res = self.doormanContract.unstake(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
#             mvkTokenAddress+"%getTotalSupply": init_mvk_storage['totalSupply']
#         })

#         newAmount = res.storage['minMvkAmount']

#         self.assertEqual(minAmount, newAmount)

#         print('----')
#         print('✅ Admin should not be able to decrease the minimum amount of MVK below 1MVK')
#         print('minimum amount:')
#         print(init_doorman_storage['minMvkAmount'])

#     def test_73_non_admin_cant_update_min_mvk(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)
#         init_mvk_storage = deepcopy(self.mvkTokenStorage)

#         # Initial values
#         stakeAmount = self.MVK(1)
#         minAmount = init_doorman_storage['minMvkAmount']
#         desiredMinAmount = self.MVK(2)

#         # Operation
#         newAmount = 0
#         with self.raisesMichelsonError(error_only_administrator):
#             res = self.doormanContract.updateMinMvkAmount(desiredMinAmount).interpret(storage=init_doorman_storage, sender=alice);

#         # Test operation
#         res = self.doormanContract.stake(stakeAmount).interpret(storage=init_doorman_storage, sender=bob);
#         res = self.doormanContract.unstake(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
#             mvkTokenAddress+"%getTotalSupply": init_mvk_storage['totalSupply']
#         })

#         newAmount = res.storage['minMvkAmount']

#         self.assertEqual(minAmount, newAmount)

#         print('----')
#         print('✅ Non-admin should not be able to update the minimum amount of MVK')
#         print('minimum amount:')
#         print(init_doorman_storage['minMvkAmount'])

#     ###
#     # %farmClaim
#     ##
#     def test_80_mvk_contract_call_farmclaim(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)

#         # Initial values
#         recipientAddress = alice
#         mintedTokens = self.MVK(2)
#         forceTransfer = False
#         mvkTotalSupply = self.MVK(100)
#         mvkMaximumSupply = self.MVK(1000)

#         # Operations
#         self.doormanContract.farmClaim(recipientAddress,mintedTokens,forceTransfer).interpret(storage=init_doorman_storage, sender=bob, view_results={
#             farmFactoryAddress+"%checkFarmExists": True,
#             mvkTokenAddress+"%getTotalAndMaximumSupply": (mvkTotalSupply, mvkMaximumSupply)
#         });

#         print('----')
#         print('✅ MVK Token contract tries to call farmClaim')

#     def test_81_farmclaim_treasury_contract_unknown_to_doorman(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)

#         # Initial values
#         recipientAddress = alice
#         mintedTokens = self.MVK(2)
#         forceTransfer = False
#         mvkTotalSupply = self.MVK(100)
#         mvkMaximumSupply = self.MVK(1000)

#         # Operations
#         res = self.doormanContract.updateGeneralContracts("farmTreasury",eve).interpret(storage=init_doorman_storage, sender=bob); # update map
#         res = self.doormanContract.updateGeneralContracts("farmTreasury",eve).interpret(storage=res.storage, sender=bob); # then delete same entry
#         with self.raisesMichelsonError(error_treasury_contract_not_found):
#             self.doormanContract.farmClaim(recipientAddress,mintedTokens,forceTransfer).interpret(storage=res.storage, sender=bob, view_results={
#                 farmFactoryAddress+"%checkFarmExists": True,
#                 mvkTokenAddress+"%getTotalAndMaximumSupply": (mvkTotalSupply, mvkMaximumSupply)
#             });

#         print('----')
#         print('✅ MVK Token contract tries to call farmClaim while doorman does not have farmTreasury contract in generalContracts')

#     def test_82_farmclaim_complete_delegation_contract_unknown_to_doorman(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)

#         # Initial values
#         recipientAddress = alice
#         mintedTokens = self.MVK(2)
#         forceTransfer = False
#         mvkTotalSupply = self.MVK(100)
#         mvkMaximumSupply = self.MVK(1000)

#         # Operations
#         res = self.doormanContract.updateGeneralContracts("delegation",delegationAddress).interpret(storage=init_doorman_storage, sender=bob);
#         with self.raisesMichelsonError(error_delegation_contract_not_found):
#             self.doormanContract.farmClaim(recipientAddress,mintedTokens,forceTransfer).interpret(storage=res.storage, sender=bob, view_results={
#                 farmFactoryAddress+"%checkFarmExists": True,
#                 mvkTokenAddress+"%getTotalAndMaximumSupply": (mvkTotalSupply, mvkMaximumSupply)
#             });

#         print('----')
#         print('✅ MVK Token contract tries to call farmClaim while doorman does not have delegation contract in generalContracts')

#     def test_83_claim_should_be_split_between_mint_transfer(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)

#         # Initial values
#         recipientAddress = alice
#         fakeTotalSupply = self.MVK(100)
#         fakemaximumSupply = self.MVK(1000)
#         mintedTokens = self.MVK(910)
#         forceTransfer = False

#         res = self.doormanContract.farmClaim(recipientAddress,mintedTokens,forceTransfer).interpret(storage=init_doorman_storage, sender=bob, view_results={
#             farmFactoryAddress+"%checkFarmExists": True,
#             mvkTokenAddress+"%getTotalAndMaximumSupply": (fakeTotalSupply, fakemaximumSupply)
#         });
#         mintedAmount = int(res.operations[1]['parameters']['value']['args'][-1]['int'])
#         transferedAmount = int(res.operations[0]['parameters']['value'][-1]['args'][-1][-1]['args'][-1]['int'])

#         self.assertEqual(mintedAmount+transferedAmount,mintedTokens)
#         self.assertEqual(fakeTotalSupply+mintedAmount,fakemaximumSupply)

#         print('----')
#         print('✅ Claim should be split between mint and transfer if the reward exceed the MVK maximumSupply')