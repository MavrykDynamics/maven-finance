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
import math


# set to localhost sandbox mode for testing
pytezos = pytezos.using(shell='http://localhost:8732', key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq')

twoUp =  os.path.abspath(os.path.join('__file__' ,"../../"))
rootDir = os.path.abspath(os.curdir)
fileDir = os.path.dirname(os.path.realpath('__file__'))

print('fileDir: '+fileDir)

deploymentsDir          = os.path.join(fileDir, 'deployments')
deployedMvkTokenContract = os.path.join(deploymentsDir, 'mvkTokenAddress.json')
deployedDoormanContract = os.path.join(deploymentsDir, 'doormanAddress.json')

deployedMvkToken = open(deployedMvkTokenContract)
mvkTokenAddress = json.load(deployedMvkToken)
mvkTokenAddress = mvkTokenAddress['address']

deployedDoorman = open(deployedDoormanContract)
doormanAddress = json.load(deployedDoorman)
doormanAddress = doormanAddress['address']

print('MVK Token Address Deployed at: ' + mvkTokenAddress)
print('Doorman Address Deployed at: ' + doormanAddress)

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

TOLERANCE = 0.0001

error_withdraw_higher_than_deposit = 'The amount withdrawn is higher than the delegator deposit'
error_only_administrator = 'ONLY_ADMINISTRATOR_ALLOWED'
error_farm_closed = 'This farm is closed you cannot deposit on it'
error_farm_already_init = 'This farm is already opened you cannot initialize it again'
error_delegator_not_found = 'DELEGATOR_NOT_FOUND'
error_no_unclaimed_rewards = 'The delegator has no rewards to claim'

class MvkTokenContract(TestCase):
    
    @classmethod
    def setUpClass(cls):
        cls.mvkTokenContract = pytezos.contract(mvkTokenAddress)
        cls.mvkTokenStorage  = cls.mvkTokenContract.storage()
        
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
#     # Tests for mvk token contract #
#     ######################

    ###
    # %balance_of
    ##
    def test_00_balance_of_one(self):
        init_mvk_token_storage = deepcopy(self.mvkTokenStorage)

        # mint on bob's address
        res = self.mvkTokenContract.mint(bob, 1000).interpret(storage=init_mvk_token_storage, sender=doormanAddress);
        
        # balance_of operation
        res = self.mvkTokenContract.balance_of({
            "requests": [
                {
                    "owner": bob,
                    "token_id": 0
                }
            ],
            "callback": None
        }).interpret(storage=res.storage, sender=alice, view_results=mvkTokenAddress+"%balance_of");
        bobBalance = int(res.operations[-1]['parameters']['value'][-1]['args'][-1]['int'])

        self.assertEqual(1000, bobBalance);

        print('----')
        print('✅ Alice get balance_of bob')
        print('bob balance:')
        print(bobBalance)

    def test_01_balance_of_multiple(self):
        init_mvk_token_storage = deepcopy(self.mvkTokenStorage)

        # mint on bob's address
        res = self.mvkTokenContract.mint(bob, 1000).interpret(storage=init_mvk_token_storage, sender=doormanAddress);
        res = self.mvkTokenContract.mint(alice, 2000).interpret(storage=res.storage, sender=doormanAddress);
        
        # balance_of operation
        res = self.mvkTokenContract.balance_of({
            "requests": [
                {
                    "owner": alice,
                    "token_id": 0
                },
                {
                    "owner": bob,
                    "token_id": 0
                }
            ],
            "callback": None
        }).interpret(storage=res.storage, sender=alice, view_results=mvkTokenAddress+"%balance_of");

        balances = {};
        for response in res.operations[-1]['parameters']['value']:
            balances[response['args'][0]['args'][0]['string']] = int(response['args'][-1]['int'])

        self.assertEqual(2000, balances[alice]);
        self.assertEqual(1000, balances[bob]);

        print('----')
        print('✅ Alice get balance_of bob and herself')
        print('alice balance:')
        print(balances[alice])
        print('bob balance:')
        print(balances[bob])

    ###
    # %getTotalSupply
    ##
    def test_02_mvk_total_supply(self):
        init_mvk_token_storage = deepcopy(self.mvkTokenStorage)

        # get MVK total supply
        res = self.mvkTokenContract.getTotalSupply(None).interpret(storage=init_mvk_token_storage, sender=alice, view_results=mvkTokenAddress+"%getTotalSupply");
        totalSupply = int(res.operations[-1]['parameters']['value']['int']);

        self.assertEqual(init_mvk_token_storage['totalSupply'], totalSupply);

        print('----')
        print('✅ Get MVK total supply')
        print('Total supply:')
        print(totalSupply)