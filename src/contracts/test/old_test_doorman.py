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


# # set to localhost sandbox mode for testing
# pytezos = pytezos.using(shell='http://localhost:8732', key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq')

# # print(pytezos.using(shell='http://localhost:20000', key='edpkvGfYw3LyB1UcCahKQk4rF2tvbMUk8GFiTuMjL75uGXrpvKXhjn'))
# # pytezos.using(shell='http://localhost:20000', key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq').activate_account


# fileDir = os.path.dirname(os.path.realpath('__file__'))

# alice = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
# admin = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
# bob = 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6'
# eve = 'tz1MnmtP4uAcgMpeZN6JtyziXeFqqwQG6yn6'
# fox = 'tz1R2oNqANNy2vZhnZBJc8iMEqW79t85Fv7L'

# sec_week = 604800

# doorman_compiled_contract_path = os.path.join(fileDir, 'michelson/doorman.tz')
# mvk_compiled_contract_path = os.path.join(fileDir, 'michelson/mvkToken.tz')
# vMvk_compiled_contract_path = os.path.join(fileDir, 'michelson/vMvkToken.tz')

# # Doorman contract storage
# # breakGlassConfigType = {
# #   'stakeIsPaused'    : False,
# #   'unstakeIsPaused'  : False,
# # }
# # doorman_initial_storage = ContractInterface.from_file(doorman_compiled_contract_path).storage.dummy()
# # doorman_initial_storage["admin"] = admin
# # doorman_initial_storage["breakGlassConfig"] = breakGlassConfigType
# # doorman_initial_storage["userStakeLedger"] = {}
# # doorman_initial_storage["logFinalAmount"] = 1
# # doorman_initial_storage["logExitFee"] = 1
# # doorman_initial_storage["mvkTokenAddress"] = "KT1TwzD6zV3WeJ39ukuqxcfK2fJCnhvrdN1X"
# # doorman_initial_storage["vMvkTokenAddress"] ="KT1XtQeSap9wvJGY1Lmek84NU6PK6cjzC9Qd"
# # doorman_initial_storage["delegationAddress"] = "tz1fABJ97CJMSP2DKrQx2HAFazh6GgahQ7ZK"

# doorman_contract = ContractInterface.from_file(doorman_compiled_contract_path)
# # doorman_contract.script

# # doorman = doorman_contract.using(shell='http://localhost:8732', key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq')

# # doorman.storage.dummy()
# # print(doorman.storage.dummy())

# print(pytezos)
# print(pytezos.origination(script=doorman_contract.script()).autofill())
# # test = pytezos.origination(script=doorman.script()).autofill().sign().inject(_async=False)
# # print(test)

# # test_branch = test['branch']
# # test_hash = test['hash']
# # opg = pytezos.shell.blocks[test_branch:].find_operation(test_hash)
# # res = OperationResult.from_operation_group(opg)
# # res[0].originated_contracts[0]
# # print(res[0].originated_contracts[0])

# # bulk_op = pytezos.bulk(
# #     ContractInterface.from_file(doorman_compiled_contract_path).originate(),
# #     ContractInterface.from_file(mvk_compiled_contract_path).originate()
# # ).autofill().sign().inject(_async = False)

# # [res.originated_contracts[0] for res in OperationResult.from_operation_group(bulk_op)]


# # mvk_metadata = {
    
# # }

# # mvk_token_metadata = {
    
# # }

# # mvk_ledger = {
# #     alice: {
# #         'balance' : 10000000000000/2,
# #         'allowances' : {}
# #     },
# #     bob: {
# #         'balance' : 10000000000000/2,
# #         'allowances' : {}
# #     }
# # }

# # mvk_token_initial_storage = ContractInterface.from_file(mvk_compiled_contract_path).storage.dummy()
# # mvk_token_initial_storage['doormanAddress'] = 'KT1TwzD6zV3WeJ39ukuqxcfK2fJCnhvrdN1X'
# # mvk_token_initial_storage['totalSupply'] = 10000000000000
# # mvk_token_initial_storage['metadata'] = mvk_metadata
# # mvk_token_initial_storage['ledger'] = mvk_ledger
# # mvk_token_initial_storage['token_metadata'] = mvk_token_metadata

# # Error messages - should correspond to actual error message in contract
# # only_admin = "Only the administrator can call this entrypoint."


# class DoormanContract(TestCase):
# #     # @classmethod
# #     # def setUpClass(cls):
# #     #     cls.doorman = ContractInterface.from_file(doorman_compiled_contract_path)
# #     #     cls.maxDiff = None
# #     #     print(cls.doorman.parameter.entrypoint)

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
# #         # Create client
# #         # client = self.client.using(key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq')
# #         # client.reveal()
# #         # print(client)

# #         # Originate contract with initial storage
# #         # contract = ContractInterface.from_michelson(contract_michelson)
#         # doorman_contract = ContractInterface.from_file(doorman_compiled_contract_path)
#         # doorman_contract.script
#         # doorman = doorman_contract.using(shell='http://localhost:8732', key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq')
#         # doorman_contract.storage.dummy()
# #         # print(doorman_contract)
#         # opg = doorman_contract.using(shell='http://localhost:8732', key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq').originate().autofill()
#         # opg = opg.fill().sign().inject()
#         # opg = pytezos.origination(script=doorman.script()).autofill().sign().inject(_async=False)
#         # print(opg)
        
# #         # self.bake_block()

# #         # print('hash: '+opg['hash'])
# #         # print(pytezos.shell.blocks[opg['branch']:])

# #         # self.assertEqual({'string': 'foobar'}, result.storage)

# #         # opg = pytezos.shell.blocks[opg['branch']:] \
# #             # .find_operation(opg['hash'])

# #         # print(opg)
# #         # contract_address = opg['contents'][0]['metadata']['operation_result']['originated_contracts'][0]

# #         result = ContractCallResult.from_operation_group(opg)[0]

# #         self.assertEqual({'string': 'foobar'}, result.storage)

#         # self.bake_block()

#     # def test_admin_set_mvk_contract_address_should_work(self):        
#     #     print('Test: Admin set MVK contract address should work')
#     #     doorman_init_storage = deepcopy(doorman_initial_storage)
#     #     res = self.doorman.setMvkTokenAddress(bob).interpret(storage=doorman_init_storage, sender=admin, now=int(sec_week + sec_week/2))
#     #     self.assertEqual(bob, res.storage['mvkTokenAddress'])
        
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

# # contract_michelson = """
# #     parameter string;
# #     storage string;
# #     code { DUP;
# #         DIP { CAR ; NIL string ; SWAP ; CONS } ;
# #         CDR ; CONS ;
# #         CONCAT ;
# #         NIL operation; PAIR }
# # """

# # class SandboxedContractTest(SandboxedNodeTestCase):
# #     def test_deploy_contract(self):
# #         # Create client
# #         client = self.client.using(key='bootstrap1')
# #         client.reveal()

# #         # Originate contract with initial storage
# #         contract = ContractInterface.from_michelson(contract_michelson)
# #         opg = contract.using(shell=self.get_node_url(), key='bootstrap1').originate(initial_storage="foo")
# #         opg = opg.fill().sign().inject()

# #         self.bake_block()

# #         # Find originated contract address by operation hash
# #         opg = client.shell.blocks['head':].find_operation(opg['hash'])
# #         contract_address = opg['contents'][0]['metadata']['operation_result']['originated_contracts'][0]

# #         # Load originated contract from blockchain
# #         originated_contract = client.contract(contract_address).using(shell=self.get_node_url(), key='bootstrap1')

# #         # Perform real contract call
# #         call = originated_contract.default("bar")
# #         opg = call.inject()

# #         self.bake_block()

# #         # Get injected operation and convert to ContractCallResult
# #         opg = client.shell.blocks['head':].find_operation(opg['hash'])
# #         result = ContractCallResult.from_operation_group(opg)[0]

# #         self.assertEqual({'string': 'foobar'}, result.storage)


# # NOTE: Node won't be wiped between tests so alphabetical order of method names matters
# # class SandboxTestCase(SandboxedNodeTestCase):

# #     def test_1_activate_protocol(self) -> None:
# #         block = self.client.shell.block()
# #         self.assertIsNotNone(block['header'].get('content'))

# #     def test_2_bake_empty_block(self) -> None:
# #         self.bake_block()

# #     def test_3_create_transaction(self) -> None:
# #         opg = self.client.transaction(
# #             destination=sandbox_addresses['bootstrap3'],
# #             amount=42,
# #         ).fill().sign().inject(min_confirmations=0)
# #         self.assertIsNotNone(self.client.shell.mempool.pending_operations[opg['hash']])

# #     def test_4_bake_block(self) -> None:
# #         self.bake_block()
# #         bootstrap3 = self.client.shell.contracts[sandbox_addresses['bootstrap3']]()
# #         self.assertEqual('4000000000042', bootstrap3['balance'])

# #     def test_5_rollback(self) -> None:
# #         self.activate(LATEST, reset=True)
# #         bootstrap3 = self.client.shell.contracts[sandbox_addresses['bootstrap3']]()
# #         self.assertEqual('4000000000000', bootstrap3['balance'])