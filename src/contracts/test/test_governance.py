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

# deploymentsDir             = os.path.join(fileDir, 'deployments')
# deployedGovernanceContract = os.path.join(deploymentsDir, 'governanceAddress.json')
# # deployedVestingContract = os.path.join(deploymentsDir, 'vestingAddress.json')
# # deployedMvkTokenContract = os.path.join(deploymentsDir, 'mvkTokenAddress.json')

# deployedGovernance = open(deployedGovernanceContract)
# governanceContractAddress = json.load(deployedGovernance)
# governanceContractAddress = governanceContractAddress['address']

# # deployedMvkToken = open(deployedMvkTokenContract)
# # mvkTokenAddress = json.load(deployedMvkToken)
# # mvkTokenAddress = mvkTokenAddress['address']

# print('Governance Contract Deployed at: ' + governanceContractAddress)
# # print('MVK Token Address Deployed at: ' + mvkTokenAddress)

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

# class GovernanceContract(TestCase):
    
#     @classmethod
#     def setUpClass(cls):
#         cls.governanceContract = pytezos.contract(governanceContractAddress)
#         cls.governanceStorage  = cls.governanceContract.storage()
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
#         init_vesting_storage = deepcopy(self.vestingStorage)

#         totalVestedAmount        = 500000000
#         totalCliffInMonths       = 6
#         totalVestingInMonths     = 24
#         totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

#         res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
#         self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
#         print('----')
#         print('test_admin_can_add_a_new_vestee')
#         # print(res.storage['vesteeLedger'][bob])        
        