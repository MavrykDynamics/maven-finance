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

# doorman_compiled_contract_path = os.path.join(twoUp, 'contracts/compiled/doorman.tz')
# print('doorman tz: '+ doorman_compiled_contract_path)

# alice = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
# admin = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
# bob = 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6'
# eve = 'tz1MnmtP4uAcgMpeZN6JtyziXeFqqwQG6yn6'
# fox = 'tz1R2oNqANNy2vZhnZBJc8iMEqW79t85Fv7L'

# sec_week = 604800

# # doorman_compiled_contract_path = os.path.join(fileDir, '/contracts/compiled/doorman.tz')
# # print(doorman_compiled_contract_path)
# # mvk_compiled_contract_path = os.path.join(fileDir, 'michelson/mvkToken.tz')
# # vMvk_compiled_contract_path = os.path.join(fileDir, 'michelson/vMvkToken.tz')

# # Doorman contract storage
# # breakGlassConfigType = {
# #   'stakeIsPaused'    : False,
# #   'unstakeIsPaused'  : False,
# # }
# # doorman_initial_storage = ContractInterface.from_file(doorman_compiled_contract_path).storage.dummy()
# # doorman_initial_storage["admin"] = admin
# # doorman_initial_storage["breakGlassConfig"] = breakGlassConfigType

# # doorman_initial_storage["userStakeRecordsLedger"] = {}
# # doorman_initial_storage["userStakeBalanceLedger"] = {}

# # doorman_initial_storage["delegationAddress"] = "KT1REDMfevEsNwgByA4sqGqjbTqm3e5euePr"
# # doorman_initial_storage["exitFeePoolAddress"] ="KT1XtQeSap9wvJGY1Lmek84NU6PK6cjzC9Qd"
# # doorman_initial_storage["mvkTokenAddress"] = "KT1VMD54xdE36WagMaPpbuzLREKqBJogJUcj"

# # doorman_initial_storage["tempMvkTotalSupply"] = 1000000000
# # doorman_initial_storage["tempVMvkTotalSupply"] = 0

# # doorman_initial_storage["stakedMvkTotalSupply"] = 0
# # doorman_initial_storage["logFinalAmount"] = 1
# # doorman_initial_storage["logExitFee"] = 1


# # doorman_contract = ContractInterface.from_file(doorman_compiled_contract_path)
# # doorman_contract.script

# # doorman = doorman_contract.using(shell='http://localhost:8732', key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq')

# # print(pytezos)

# # doorman_contract = pytezos.contract('KT1RDdjLLjuHCqchM4zSKcV3xo2swSz7vhGU')
# # print(doorman_contract)

# # doorman_storage = doorman_contract.storage
# # print(doorman_storage)



# class DoormanContract(TestCase):
    
#     @classmethod
#     def setUpClass(cls):
#         # cls.doormanContract = ContractInterface.create_from(doorman_compiled_contract_path)
#         cls.doormanContract = pytezos.contract('KT1VgSX6y31iq2gNktPXDr6HPwyqfrHnH6Va')
#         cls.doormanStorage  = cls.doormanContract.storage()
#         # print(cls.doormanContract.storage())
#         # cls.doormanStorage  = cls.doormanContract.storage
#         # print(cls.doormanContract)
#         # print(cls.doormanStorage.admin)
#         # cls.maxDiff = None
#         # print(cls.doorman.parameter.entrypoint)

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
# #     # Tests for admin #
# #     ######################

#     # def test_deploy_contract(self):
#         # Create client
#         # client = self.client.using(key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq')
#         # client.reveal()
#         # print(client)

#         # Originate contract with initial storage
        
#     def test_admin_set_mvk_contract_address_should_work(self):        

#     #     print('Test: Admin set MVK contract address should work')
#         new_doorman_storage = deepcopy(self.doormanStorage)
#         # print(new_doorman_storage['userStakeBalanceLedger']['tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'])    
        
#         # big_map lookup
#         # print(self.doormanContract.storage['userStakeRecordsLedger']['tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb']())
#         # print(self.doormanStorage['userStakeBalanceLedger'])    

#         res = self.doormanContract.setMvkTokenAddress(bob).interpret(storage=new_doorman_storage, sender=admin, now=int(sec_week + sec_week/2))
#         print(res.storage['mvkTokenAddress'])
#         self.assertEqual(bob, res.storage['mvkTokenAddress'])
        
#     # def test_non_admin_set_mvk_contract_address_should_fail(self):        
#     #     print('Test: Non-Admin set MVK contract address should fail')
#     #     doorman_init_storage = deepcopy(doorman_initial_storage)
#     #     with self.raisesMichelsonError(only_admin):
#     #         self.doorman.setMvkTokenAddress(bob).interpret(storage=doorman_init_storage, sender=bob, now=int(sec_week + sec_week/2))

#     # def test_admin_set_admin_to_bob_should_work(self):        
#     #     print('Test: Admin set admin to Bob should work')
#     #     doorman_init_storage = deepcopy(doorman_initial_storage)
#     #     res = self.doorman.setAdmin(bob).interpret(storage=doorman_init_storage, sender=admin, now=int(sec_week + sec_week/2))
#     #     self.assertEqual(bob, res.storage['admin'])

#     # def test_non_admin_set_admin_to_bob_should_fail(self):        
#     #     print('Test: Non-Admin set admin to Bob should fail')
#     #     doorman_init_storage = deepcopy(doorman_initial_storage)
#     #     with self.raisesMichelsonError(only_admin):
#     #         self.doorman.setAdmin(bob).interpret(storage=doorman_init_storage, sender=bob, now=int(sec_week + sec_week/2))