from unittest import TestCase
from contextlib import contextmanager
from copy import deepcopy
from pytezos import ContractInterface, MichelsonRuntimeError, pytezos
# from pytezos import ContractInterface, pytezos, format_timestamp, MichelsonRuntimeError
from pytezos.michelson.types.big_map import big_map_diff_to_lazy_diff
from pytezos.operation.result import OperationResult
from pytezos.contract.result import ContractCallResult
import time
import json 
import logging
import pytest
import os 

# set to localhost sandbox mode for testing
pytezos = pytezos.using(shell='http://localhost:8732', key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq')

twoUp =  os.path.abspath(os.path.join('__file__' ,"../../"))
rootDir = os.path.abspath(os.curdir)
fileDir = os.path.dirname(os.path.realpath('__file__'))

doorman_compiled_contract_path = os.path.join(twoUp, 'contracts/compiled/doorman.tz')
vesting_compiled_contract_path = os.path.join(twoUp, 'contracts/compiled/vesting.tz')
print('doorman tz: '+ doorman_compiled_contract_path)

alice = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
admin = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
bob   = 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6'
eve   = 'tz1MnmtP4uAcgMpeZN6JtyziXeFqqwQG6yn6'
fox   = 'tz1R2oNqANNy2vZhnZBJc8iMEqW79t85Fv7L'

sec_day   = 86400
sec_week  = 604800
sec_month = 2592000 # 30 days

blocks_day = 2880
blocks_month = blocks_day * 30 # 86400 per month

error_unable_to_claim_now = 'Error. You are unable to claim now.'

class VestingContract(TestCase):
    
    @classmethod
    def setUpClass(cls):
        cls.vestingContract = pytezos.contract('KT1AFhjL9WPhYMYYh5ZoU9QCZQAXxhjVGQxg')
        cls.vestingStorage  = cls.vestingContract.storage()
        

    @contextmanager
    def raisesMichelsonError(self, error_message):
        with self.assertRaises(MichelsonRuntimeError) as r:
            yield r

        error_msg = r.exception.format_stdout()
        if "FAILWITH" in error_msg:
            self.assertEqual(f"FAILWITH: '{error_message}'", r.exception.format_stdout())
        else:
            self.assertEqual(f"'{error_message}': ", r.exception.format_stdout())

#     ######################
#     # Tests for vesting contract #
#     ######################
        
    def test_admin_can_add_a_new_vestee(self):        
        init_vesting_storage = deepcopy(self.vestingStorage)

        totalVestedAmount        = 500000000
        totalCliffInMonths       = 6
        totalVestingInMonths     = 24
        totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

        res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
        self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
        print('----')
        print('test_admin_can_add_a_new_vestee')
        print(res.storage['vesteeLedger'][bob])        
        
        
    def test_bob_cannot_claim_before_cliff_period(self):            
        init_vesting_storage = deepcopy(self.vestingStorage)
        print('----')
        print('test_bob_cannot_claim_before_cliff_period')    
        res = self.vestingContract.addVestee(bob, 500000000, 6,24).interpret(storage=init_vesting_storage, sender=admin)            
        with self.raisesMichelsonError(error_unable_to_claim_now):
            self.vestingContract.claim().interpret(storage=res.storage, sender=bob)

    def test_bob_can_claim_after_cliff_period(self):            
        init_vesting_storage = deepcopy(self.vestingStorage)        
        
        currentLevel     = pytezos.shell.head.level()
        currentTimestamp = pytezos.now()

        # print(currentTimestamp)
        # print(currentTimestamp + sec_month * 30)
        
        after_6_months = currentTimestamp + sec_month * 6

        totalVestedAmount        = 500000000
        totalCliffInMonths       = 6
        totalVestingInMonths     = 24
        totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

        addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
        bobClaimsRes = self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender = bob, now = after_6_months, level = currentLevel + blocks_month * 6 + 100)
        
        self.assertEqual(totalClaimAmountPerMonth * 6, bobClaimsRes.storage['vesteeLedger'][bob]['totalClaimed'])

        print('----')
        print('test_bob_can_claim_after_cliff_period')    
        print(bobClaimsRes.storage)        

    def test_bob_can_claim_3_months_after_cliff_period(self):            
        init_vesting_storage = deepcopy(self.vestingStorage)        
        
        currentLevel     = pytezos.shell.head.level()
        currentTimestamp = pytezos.now()
        
        after_9_months = currentTimestamp + (sec_month * 9)

        totalVestedAmount        = 500000000
        totalCliffInMonths       = 6
        totalVestingInMonths     = 24
        totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

        addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
        bobClaimsRes = self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender = bob, now = after_9_months, level = currentLevel + blocks_month * 9 + 100)
        
        self.assertEqual(totalClaimAmountPerMonth * 9, bobClaimsRes.storage['vesteeLedger'][bob]['totalClaimed'])
        
        print('----')
        print('test_bob_can_claim_3_months_after_cliff_period')    
        print(bobClaimsRes.storage)        

    def test_bob_can_claim_after_cliff_and_2_months_after(self):            
        init_vesting_storage = deepcopy(self.vestingStorage)        
        
        currentLevel     = pytezos.shell.head.level()
        currentTimestamp = pytezos.now()
        
        after_6_months = currentTimestamp + (sec_month * 6)
        after_8_months = currentTimestamp + (sec_month * 8)

        totalVestedAmount        = 500000000
        totalCliffInMonths       = 6
        totalVestingInMonths     = 24
        totalClaimAmountPerMonth = totalVestedAmount // totalVestingInMonths

        addVesteeBob = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=init_vesting_storage, sender=admin)
        bobClaimsRes = self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender = bob, now = after_6_months, level = currentLevel + blocks_month * 6 + 100)
        
        self.assertEqual(totalClaimAmountPerMonth * 6, bobClaimsRes.storage['vesteeLedger'][bob]['totalClaimed'])

        bobClaimsRes = self.vestingContract.claim().interpret(storage=addVesteeBob.storage, sender = bob, now = after_8_months, level = currentLevel + blocks_month * 8 + 100)
        self.assertEqual(totalClaimAmountPerMonth * 8, bobClaimsRes.storage['vesteeLedger'][bob]['totalClaimed'])
        
        print('----')
        print('test_bob_can_claim_after_cliff_and_2_months_after')    
        print(bobClaimsRes.storage)        