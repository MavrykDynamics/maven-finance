from unittest import TestCase
from contextlib import contextmanager
from copy import deepcopy
from pytezos import ContractInterface, MichelsonRuntimeError, pytezos
from pytezos.michelson.types.big_map import big_map_diff_to_lazy_diff
import time
import json 
import logging
import pytest
import os 

# pytezos.using(shell='http://localhost:18731', key='edsk3gUfUPyBSfrS9CCgmCiQsTCHGkviBDusMxDJstFtojtc1zcpsh')

fileDir = os.path.dirname(os.path.realpath('__file__'))

alice = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
admin = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
bob = 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6'
eve = 'tz1MnmtP4uAcgMpeZN6JtyziXeFqqwQG6yn6'
fox = 'tz1R2oNqANNy2vZhnZBJc8iMEqW79t85Fv7L'

sec_week = 604800

doorman_compiled_contract_path = os.path.join(fileDir, 'michelson/doorman.tz')
mvk_compiled_contract_path = os.path.join(fileDir, 'michelson/mvkToken.tz')
vMvk_compiled_contract_path = os.path.join(fileDir, 'michelson/vMvkToken.tz')

# Doorman contract storage
breakGlassConfigType = {
  'stakeIsPaused'    : False,
  'unstakeIsPaused'  : False,
}
doorman_initial_storage = ContractInterface.from_file(doorman_compiled_contract_path).storage.dummy()
doorman_initial_storage["admin"] = admin
doorman_initial_storage["breakGlassConfig"] = breakGlassConfigType
doorman_initial_storage["userStakeLedger"] = {}
doorman_initial_storage["logFinalAmount"] = 1
doorman_initial_storage["logExitFee"] = 1
doorman_initial_storage["mvkTokenAddress"] = "KT1TwzD6zV3WeJ39ukuqxcfK2fJCnhvrdN1X"
doorman_initial_storage["vMvkTokenAddress"] ="KT1XtQeSap9wvJGY1Lmek84NU6PK6cjzC9Qd"
doorman_initial_storage["delegationAddress"] = "tz1fABJ97CJMSP2DKrQx2HAFazh6GgahQ7ZK"

mvk_metadata = {
    
}

mvk_token_metadata = {
    
}

mvk_ledger = {
    alice: {
        'balance' : 10000000000000/2,
        'allowances' : {}
    },
    bob: {
        'balance' : 10000000000000/2,
        'allowances' : {}
    }
}

mvk_token_initial_storage = ContractInterface.from_file(mvk_compiled_contract_path).storage.dummy()
mvk_token_initial_storage['doormanAddress'] = 'KT1TwzD6zV3WeJ39ukuqxcfK2fJCnhvrdN1X'
mvk_token_initial_storage['totalSupply'] = 10000000000000
mvk_token_initial_storage['metadata'] = mvk_metadata
mvk_token_initial_storage['ledger'] = mvk_ledger
mvk_token_initial_storage['token_metadata'] = mvk_token_metadata

# Error messages - should correspond to actual error message in contract
only_admin = "Only the administrator can call this entrypoint."

class DoormanContract(TestCase):
    @classmethod
    def setUpClass(cls):
        cls.doorman = ContractInterface.from_file(doorman_compiled_contract_path)
        cls.maxDiff = None
        print(cls.doorman.parameter.entrypoint)

    @contextmanager
    def raisesMichelsonError(self, error_message):
        with self.assertRaises(MichelsonRuntimeError) as r:
            yield r

        error_msg = r.exception.format_stdout()
        if "FAILWITH" in error_msg:
            self.assertEqual(f"FAILWITH: '{error_message}'", r.exception.format_stdout())
        else:
            self.assertEqual(f"'{error_message}': ", r.exception.format_stdout())

    ######################
    # Tests for admin #
    ######################

    def test_admin_set_mvk_contract_address_should_work(self):        
        print('Test: Admin set MVK contract address should work')
        doorman_init_storage = deepcopy(doorman_initial_storage)
        res = self.doorman.setMvkTokenAddress(bob).interpret(storage=doorman_init_storage, sender=admin, now=int(sec_week + sec_week/2))
        self.assertEqual(bob, res.storage['mvkTokenAddress'])
        
    def test_non_admin_set_mvk_contract_address_should_fail(self):        
        print('Test: Non-Admin set MVK contract address should fail')
        doorman_init_storage = deepcopy(doorman_initial_storage)
        with self.raisesMichelsonError(only_admin):
            self.doorman.setMvkTokenAddress(bob).interpret(storage=doorman_init_storage, sender=bob, now=int(sec_week + sec_week/2))

    def test_admin_set_admin_to_bob_should_work(self):        
        print('Test: Admin set admin to Bob should work')
        doorman_init_storage = deepcopy(doorman_initial_storage)
        res = self.doorman.setAdmin(bob).interpret(storage=doorman_init_storage, sender=admin, now=int(sec_week + sec_week/2))
        self.assertEqual(bob, res.storage['admin'])

    def test_non_admin_set_admin_to_bob_should_fail(self):        
        print('Test: Non-Admin set admin to Bob should fail')
        doorman_init_storage = deepcopy(doorman_initial_storage)
        with self.raisesMichelsonError(only_admin):
            self.doorman.setAdmin(bob).interpret(storage=doorman_init_storage, sender=bob, now=int(sec_week + sec_week/2))