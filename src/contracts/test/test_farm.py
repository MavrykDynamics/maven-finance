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
deployedFarmContract = os.path.join(deploymentsDir, 'farmAddress.json')
deployedFarmFA2Contract = os.path.join(deploymentsDir, 'farmFA2Address.json')
deployedMvkTokenContract = os.path.join(deploymentsDir, 'mvkTokenAddress.json')
deployedLpTokenContract = os.path.join(deploymentsDir, 'lpTokenAddress.json')

deployedFarm = open(deployedFarmContract)
farmContractAddress = json.load(deployedFarm)
farmContractAddress = farmContractAddress['address']

deployedFarmFA2 = open(deployedFarmFA2Contract)
farmFA2ContractAddress = json.load(deployedFarmFA2)
farmFA2ContractAddress = farmFA2ContractAddress['address']

deployedMvkToken = open(deployedMvkTokenContract)
mvkTokenAddress = json.load(deployedMvkToken)
mvkTokenAddress = mvkTokenAddress['address']

deployedLpToken = open(deployedLpTokenContract)
lpTokenAddress = json.load(deployedLpToken)
lpTokenAddress = lpTokenAddress['address']

print('Farm Contract Deployed at: ' + farmContractAddress)
print('Farm FA2 Contract Deployed at: ' + farmContractAddress)
print('MVK Token Address Deployed at: ' + mvkTokenAddress)
print('LP Token Address Deployed at: ' + lpTokenAddress)

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

class FarmContract(TestCase):
    
    @classmethod
    def setUpClass(cls):
        cls.farmContract = pytezos.contract(farmContractAddress)
        cls.farmStorage  = cls.farmContract.storage()
        cls.farmFA2Contract = pytezos.contract(farmFA2ContractAddress)
        cls.farmFA2Storage  = cls.farmFA2Contract.storage()
        cls.mvkTokenContract = pytezos.contract(mvkTokenAddress)
        cls.mvkTokenStorage  = cls.mvkTokenContract.storage()
        cls.lpTokenContract = pytezos.contract(lpTokenAddress)
        cls.lpTokenStorage  = cls.lpTokenContract.storage()
        
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
#     # Tests for farm contract #
#     ######################

    ###
    # %initFarm
    ##
    def test_00_admin_init_farm(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalBlocks     = 100
        rewardPerBlock  = 1000
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)

        self.assertEqual(totalBlocks, res.storage['plannedRewards']['totalBlocks'])
        self.assertEqual(rewardPerBlock, res.storage['plannedRewards']['rewardPerBlock'])
        self.assertEqual(True, res.storage['open'])
        print('----')
        print('✅ Admin initialize a farm')
        print('total blocks:')
        print(res.storage['plannedRewards']['totalBlocks'])
        print('rewards per block:')
        print(res.storage['plannedRewards']['rewardPerBlock'])
        print('open:')
        print(res.storage['open'])

    def test_00_non_admin_init_farm(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalBlocks     = 100
        rewardPerBlock  = 1000
        
        # Init farm operation
        with self.raisesMichelsonError(error_only_administrator):
            res = self.farmContract.initFarm({
                "rewardPerBlock": rewardPerBlock,
                "totalBlocks": totalBlocks
            }).interpret(storage=init_farm_storage, sender=bob)

        self.assertEqual(0, init_farm_storage['plannedRewards']['totalBlocks'])
        self.assertEqual(0, init_farm_storage['plannedRewards']['rewardPerBlock'])
        self.assertEqual(False, init_farm_storage['open'])
        print('----')
        print('✅ Non-admin initialize a farm')
        print('total blocks:')
        print(init_farm_storage['plannedRewards']['totalBlocks'])
        print('rewards per block:')
        print(init_farm_storage['plannedRewards']['rewardPerBlock'])
        print('open:')
        print(init_farm_storage['open'])
        
    def test_00_admin_init_farm(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalBlocks     = 100
        rewardPerBlock  = 1000
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)

        # Init farm again
        with self.raisesMichelsonError(error_farm_already_init):
            res = self.farmContract.initFarm({
                "rewardPerBlock": rewardPerBlock,
                "totalBlocks": totalBlocks
            }).interpret(storage=res.storage, sender=alice)

        self.assertEqual(totalBlocks, res.storage['plannedRewards']['totalBlocks'])
        self.assertEqual(rewardPerBlock, res.storage['plannedRewards']['rewardPerBlock'])
        self.assertEqual(True, res.storage['open'])
        print('----')
        print('✅ Admin initialize a farm twice')
        print('total blocks:')
        print(res.storage['plannedRewards']['totalBlocks'])
        print('rewards per block:')
        print(res.storage['plannedRewards']['rewardPerBlock'])
        print('open:')
        print(res.storage['open'])
    

    ###
    # %deposit
    ##
    def test_01_alice_deposit_2_lp(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalBlocks                 = 100
        rewardPerBlock              = 1000
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)

        self.assertEqual(totalDepositAmount, res.storage['delegators'][alice]['balance'])
        print('----')
        print('✅ Alice deposits 2LP')
        print('alice deposit balance:')
        print(res.storage['delegators'][alice]['balance'])

    def test_01_alice_deposit_2_lp_on_fa2(self):        
        init_farm_storage = deepcopy(self.farmFA2Storage)

        # Initial parameters
        totalDepositAmount          = 2
        totalBlocks                 = 100
        rewardPerBlock              = 1000
        
        # Init farm operation
        res = self.farmFA2Contract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmFA2Contract.deposit(totalDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)

        self.assertEqual(totalDepositAmount, res.storage['delegators'][alice]['balance'])
        print('----')
        print('✅ Alice deposits 2LP on a farm with FA2 LP Tokens')
        print('alice deposit balance:')
        print(res.storage['delegators'][alice]['balance'])
        
    def test_01_alice_deposit_2_lp_then_2_lp_on_different_block(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        firstDepositedAmount        = 2
        totalBlocks                 = 100
        rewardPerBlock              = 1000
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # First deposit operation
        res = self.farmContract.deposit(firstDepositedAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 20

        # Second deposit operation
        res = self.farmContract.deposit(firstDepositedAmount).interpret(storage=res.storage, sender=alice, level=nextBlock)

        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
        suspectedRewards = (nextBlock-lastBlockUpdate) * rewardPerBlock
        totalDepositAmount = 2 * firstDepositedAmount

        self.assertEqual(suspectedRewards, aliceUnclaimedRewards)
        self.assertEqual(totalDepositAmount, res.storage['delegators'][alice]['balance'])
        print('----')
        print('✅ Alice deposits 2LP on one block then 2 more on another block')
        print('alice deposit balance:')
        print(res.storage['delegators'][alice]['balance'])
        print('alice unclaimedRewards during second deposit')
        print(aliceUnclaimedRewards)
    
    def test_01_alice_deposit_after_end(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalBlocks                 = 100
        rewardPerBlock              = 1000
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        with self.raisesMichelsonError(error_farm_closed):
            res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate+101)

        self.assertEqual(False, alice in res.storage['delegators'])
        print('----')
        print('✅ Alice deposits 2LP after farm ends')
        print('alice has an entry in delegators:')
        print(alice in res.storage['delegators'])

    ###
    # %withdraw
    ##
    def test_02_alice_deposit_2_lp_and_withdraw_2_lp_on_same_block(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalBlocks                 = 100
        rewardPerBlock              = 1000
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)

        # Withdraw operation
        res = self.farmContract.withdraw(totalDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']

        self.assertEqual(0, res.storage['delegators'][alice]['balance'])
        self.assertEqual(0, aliceUnclaimedRewards)
        print('----')
        print('✅ Alice deposits 2LP then withdraws 2LP on the same block')
        print('alice delegated lp balance')
        print(res.storage['delegators'][alice]['balance'])
        print('alice unclaimedRewards during withdrawal')
        print(aliceUnclaimedRewards)

    def test_02_alice_deposit_2_lp_and_withdraw_2_lp_on_same_block_on_fa2(self):        
        init_farm_storage = deepcopy(self.farmFA2Storage)

        # Initial parameters
        totalDepositAmount          = 2
        totalBlocks                 = 100
        rewardPerBlock              = 1000
        
        # Init farm operation
        res = self.farmFA2Contract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmFA2Contract.deposit(totalDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)

        # Withdraw operation
        res = self.farmFA2Contract.withdraw(totalDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']

        self.assertEqual(0, res.storage['delegators'][alice]['balance'])
        self.assertEqual(0, aliceUnclaimedRewards)
        print('----')
        print('✅ Alice deposits 2LP then withdraws 2LP on the same block on a farm with FA2 LP Tokens')
        print('alice delegated lp balance')
        print(res.storage['delegators'][alice]['balance'])
        print('alice unclaim rewards during withdrawal')
        print(aliceUnclaimedRewards)
        
    def test_02_alice_deposit_2_lp_and_withdraw_2_lp_on_different_blocks(self): 
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalBlocks                 = 100
        rewardPerBlock              = 1000
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 10

        # Withdraw operation
        res = self.farmContract.withdraw(totalDepositAmount).interpret(storage=res.storage, sender=alice, level=nextBlock)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']

        suspectedRewards = (nextBlock-lastBlockUpdate) * rewardPerBlock

        self.assertEqual(0, res.storage['delegators'][alice]['balance'])
        self.assertEqual(suspectedRewards, aliceUnclaimedRewards)
        print('----')
        print('✅ Alice deposits 2LP then withdraws 2LP on two different blocks')
        print('alice delegated lp balance')
        print(res.storage['delegators'][alice]['balance'])
        print('alice unclaimed rewards during withdrawal')
        print(aliceUnclaimedRewards)

    def test_02_alice_deposit_2_lp_and_withdraw_1_lp_on_different_blocks(self): 
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalWithdrawAmount         = 1
        totalBlocks                 = 100
        rewardPerBlock              = 1000
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 10

        # Withdraw operation
        res = self.farmContract.withdraw(totalWithdrawAmount).interpret(storage=res.storage, sender=alice, level=nextBlock)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards'];

        suspectedRewards = (nextBlock-lastBlockUpdate) * rewardPerBlock

        self.assertEqual(totalDepositAmount-totalWithdrawAmount, res.storage['delegators'][alice]['balance'])
        self.assertEqual(suspectedRewards, aliceUnclaimedRewards)
        print('----')
        print('✅ Alice deposits 2LP then withdraws 1LP on two different blocks')
        print('alice delegated lp balance')
        print(res.storage['delegators'][alice]['balance'])
        print('alice unclaimed rewards during withdrawal')
        print(aliceUnclaimedRewards)

    def test_02_alice_deposit_2_lp_and_withdraw_3_lp_on_different_blocks(self): 
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalWithdrawAmount         = 3
        totalBlocks                 = 100
        rewardPerBlock              = 1000
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 10

        # Withdraw operation
        aliceUnclaimedRewards = 0
        with self.raisesMichelsonError(error_withdraw_higher_than_deposit):
            res = self.farmContract.withdraw(totalWithdrawAmount).interpret(storage=res.storage, sender=alice, level=nextBlock)
            aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']

        self.assertEqual(totalDepositAmount, res.storage['delegators'][alice]['balance'])
        self.assertEqual(0, aliceUnclaimedRewards)
        print('----')
        print('✅ Alice deposits 2LP then withdraws 3LP on two different blocks')
        print('alice delegated lp balance')
        print(res.storage['delegators'][alice]['balance'])
        print('alice unclaimed rewards during withdrawal')
        print(aliceUnclaimedRewards)

    def test_02_alice_deposit_lp_before_end_and_withdraw_after_end(self): 
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalWithdrawAmount         = 2
        totalBlocks                 = 100
        rewardPerBlock              = 1000
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 100

        # Withdraw operation
        aliceUnclaimedRewards = 0
        res = self.farmContract.withdraw(totalWithdrawAmount).interpret(storage=res.storage, sender=alice, level=nextBlock)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']

        suspectedRewards = totalBlocks * rewardPerBlock

        self.assertEqual(0, res.storage['delegators'][alice]['balance'])
        self.assertEqual(suspectedRewards, aliceUnclaimedRewards)
        print('----')
        print('✅ Alice deposits 2LP before farm ends then withdraws 2LP after farm ends')
        print('alice delegated lp balance')
        print(res.storage['delegators'][alice]['balance'])
        print('alice unclaimed rewards during withdrawal')
        print(aliceUnclaimedRewards)

    ###
    # %claim
    ##
    def test_03_alice_and_bob_deposit_2_lp_then_claim_on_two_different_blocks(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        aliceDepositAmount          = 2
        bobDepositAmount            = 2
        totalBlocks                 = 100
        rewardPerBlock              = 1000
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Initial deposit
        res = self.farmContract.deposit(aliceDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
        res = self.farmContract.deposit(bobDepositAmount).interpret(storage=res.storage, sender=bob, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 50

        # New deposit
        res = self.farmContract.claim().interpret(storage=res.storage, sender=alice, level=nextBlock)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

        res = self.farmContract.claim().interpret(storage=res.storage, sender=bob, level=nextBlock)
        bobUnclaimedRewards = res.storage['delegators'][bob]['unclaimedRewards']
        bobClaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

        suspectedRewards = (nextBlock-lastBlockUpdate) * rewardPerBlock
        self.assertEqual(aliceDepositAmount, res.storage['delegators'][alice]['balance'])
        self.assertEqual(bobDepositAmount, res.storage['delegators'][bob]['balance'])
        self.assertEqual(0, aliceUnclaimedRewards)
        self.assertEqual(0, bobUnclaimedRewards)
        self.assertEqual(suspectedRewards/2, aliceClaimedRewards)
        self.assertEqual(suspectedRewards/2, bobClaimedRewards)
        print('----')
        print('✅ Alice and Bob deposit 2LP on a block then they both claim on another one')
        print('alice deposit balance:')
        print(res.storage['delegators'][alice]['balance'])
        print('alice unclaimed sMVK:')
        print(aliceClaimedRewards)
        print('bob deposit balance:')
        print(res.storage['delegators'][bob]['balance'])
        print('bob unclaimed sMVK:')
        print(bobClaimedRewards)

    def test_03_alice_and_bob_deposit_2_lp_then_claim_on_two_different_blocks_on_fa2(self):        
        init_farm_storage = deepcopy(self.farmFA2Storage)

        # Initial parameters
        aliceDepositAmount          = 2
        bobDepositAmount            = 2
        totalBlocks                 = 100
        rewardPerBlock              = 1000
        
        # Init farm operation
        res = self.farmFA2Contract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Initial deposit
        res = self.farmFA2Contract.deposit(aliceDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
        res = self.farmFA2Contract.deposit(bobDepositAmount).interpret(storage=res.storage, sender=bob, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 50

        # New deposit
        res = self.farmFA2Contract.claim().interpret(storage=res.storage, sender=alice, level=nextBlock)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

        res = self.farmFA2Contract.claim().interpret(storage=res.storage, sender=bob, level=nextBlock)
        bobUnclaimedRewards = res.storage['delegators'][bob]['unclaimedRewards']
        bobClaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

        suspectedRewards = (nextBlock-lastBlockUpdate) * rewardPerBlock
        self.assertEqual(aliceDepositAmount, res.storage['delegators'][alice]['balance'])
        self.assertEqual(bobDepositAmount, res.storage['delegators'][bob]['balance'])
        self.assertEqual(0, aliceUnclaimedRewards)
        self.assertEqual(0, bobUnclaimedRewards)
        self.assertEqual(suspectedRewards/2, aliceClaimedRewards)
        self.assertEqual(suspectedRewards/2, bobClaimedRewards)
        print('----')
        print('✅ Alice and Bob deposit 2LP on a block then they both claim on another one on a farm with FA2 LP Tokens')
        print('alice deposit balance:')
        print(res.storage['delegators'][alice]['balance'])
        print('alice claimed sMVK:')
        print(aliceClaimedRewards)
        print('bob deposit balance:')
        print(res.storage['delegators'][bob]['balance'])
        print('bob claimed sMVK:')
        print(bobClaimedRewards)

    def test_03_alice_and_bob_deposit_then_claim_on_different_blocks(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        aliceDepositAmount          = 2
        bobDepositAmount            = 4
        totalBlocks                 = 100
        rewardPerBlock              = 1000
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Initial deposit
        res = self.farmContract.deposit(aliceDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 50

        res = self.farmContract.deposit(bobDepositAmount).interpret(storage=res.storage, sender=bob, level=nextBlock)
        nextBlock += 25

        # New deposit
        res = self.farmContract.claim().interpret(storage=res.storage, sender=alice, level=nextBlock)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])
        nextBlock += 15

        res = self.farmContract.claim().interpret(storage=res.storage, sender=bob, level=nextBlock)
        bobUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
        bobClaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

        aliceSuspectedRewards = math.trunc((50 * rewardPerBlock) + (25 * rewardPerBlock / 3))
        bobSuspectedRewards = math.trunc(40 * rewardPerBlock * 2 / 3)
        self.assertEqual(aliceDepositAmount, res.storage['delegators'][alice]['balance'])
        self.assertEqual(bobDepositAmount, res.storage['delegators'][bob]['balance'])
        self.assertEqual(0, aliceUnclaimedRewards)
        self.assertEqual(0, bobUnclaimedRewards)
        self.assertEqual(aliceSuspectedRewards, aliceClaimedRewards)
        self.assertEqual(bobSuspectedRewards, bobClaimedRewards)
        print('----')
        print('✅ Alice deposit 2LP on a block, Bob deposit 4LP on another block then Alice claim on another block then Bob claim on another block')
        print('alice deposit balance:')
        print(res.storage['delegators'][alice]['balance'])
        print('alice claimed sMVK:')
        print(aliceClaimedRewards)
        print('bob deposit balance:')
        print(res.storage['delegators'][bob]['balance'])
        print('bob claimed sMVK:')
        print(bobClaimedRewards)
        
    def test_03_alice_deposits_then_claims_on_same_blocks(self):        
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        totalDepositAmount      = 2
        totalBlocks             = 100
        rewardPerBlock          = 1000
        
        # Init farm
        res = self.farmContract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)

        # Claim reward after one block
        aliceUnclaimedRewards = 0;
        aliceClaimedRewards = 0;
        with self.raisesMichelsonError(error_no_unclaimed_rewards):
            res = self.farmContract.claim().interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
            aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
            aliceClaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

        suspectedRewards = 0
        
        self.assertEqual(totalDepositAmount, res.storage['delegators'][alice]['balance'])
        self.assertEqual(aliceClaimedRewards, suspectedRewards)
        self.assertEqual(aliceUnclaimedRewards, suspectedRewards)
        print('----')
        print('✅ Alice claims sMVK after depositing 2LP on the same block')
        print('alice delegated lp balance')
        print(res.storage['delegators'][alice]['balance'])
        print('rewards:')
        print(aliceClaimedRewards)

    
    def test_03_alice_deposits_then_withdraw_all_then_claim_on_different_blocks(self):        
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        totalDepositAmount      = 2
        totalBlocks             = 100
        rewardPerBlock          = 1000
        
        # Init farm
        res = self.farmContract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)

        # Withdraw LP Tokens
        res = self.farmContract.withdraw(totalDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
        nextBlock = 15 + lastBlockUpdate

        # Claim reward after one block
        aliceUnclaimedRewards = 0
        aliceClaimedRewards = 0
        with self.raisesMichelsonError(error_no_unclaimed_rewards):
            res = self.farmContract.claim().interpret(storage=res.storage, sender=alice, level=nextBlock)
            aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
            aliceClaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

        suspectedRewards = 0
        
        self.assertEqual(0, res.storage['delegators'][alice]['balance'])
        self.assertEqual(aliceClaimedRewards, suspectedRewards)
        self.assertEqual(aliceUnclaimedRewards, suspectedRewards)
        print('----')
        print('✅ Alice deposits and withdraws on the same block then claim on a different block')
        print('alice delegated lp balance')
        print(res.storage['delegators'][alice]['balance'])
        print('rewards:')
        print(aliceClaimedRewards)
        
    def test_03_alice_deposits_then_claims_on_different_blocks(self):        
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        totalDepositAmount      = 2
        totalBlocks             = 100
        rewardPerBlock          = 1000
        
        # Init farm
        res = self.farmContract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 10

        # Claim reward after one block
        res = self.farmContract.claim().interpret(storage=res.storage, sender=alice, level=nextBlock)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

        suspectedRewards = (nextBlock-lastBlockUpdate) * rewardPerBlock

        self.assertEqual(aliceClaimedRewards, suspectedRewards)
        self.assertEqual(aliceUnclaimedRewards, 0)
        print('----')
        print('✅ Alice claims sMVK after depositing 2LP')
        print('rewards:')
        print(aliceClaimedRewards)

    def test_03_alice_deposits_then_claims_twice(self):        
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        totalDepositAmount      = 2
        totalBlocks             = 100
        rewardPerBlock          = 1000
        
        # Init farm
        res = self.farmContract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 10

        # Claim reward after one block
        res = self.farmContract.claim().interpret(storage=res.storage, sender=alice, level=nextBlock)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

        with self.raisesMichelsonError(error_no_unclaimed_rewards):
            res = self.farmContract.claim().interpret(storage=res.storage, sender=alice, level=nextBlock)
            aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
            aliceClaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

        suspectedRewards = (nextBlock-lastBlockUpdate) * rewardPerBlock

        self.assertEqual(aliceClaimedRewards, suspectedRewards)
        self.assertEqual(aliceUnclaimedRewards, 0)
        print('----')
        print('✅ Alice claims sMVK after depositing 2LP')
        print('rewards:')
        print(aliceClaimedRewards)
        
    def test_03_alice_claims_without_having_deposit(self):        
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        totalDepositAmount      = 2
        totalBlocks             = 100
        rewardPerBlock          = 1000
        
        # Init farm
        res = self.farmContract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Claim rewards
        aliceUnclaimedRewards = 0
        aliceClaimedRewards = 0
        with self.raisesMichelsonError(error_delegator_not_found):
            res = self.farmContract.claim().interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
            aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
            aliceClaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

        suspectedRewards = 0

        self.assertEqual(aliceClaimedRewards, suspectedRewards)
        self.assertEqual(aliceUnclaimedRewards, suspectedRewards)
        print('----')
        print('✅ Alice claims sMVK without having deposit at all')
        print('rewards:')
        print(aliceClaimedRewards)
        
    def test_03_alice_deposits_then_withdraws_lesser_amount_then_claims_on_different_blocks(self):        
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        totalDepositAmount      = 2
        totalWithdrawAmount     = 1
        totalBlocks             = 100
        rewardPerBlock          = 1000
        
        # Init farm
        res = self.farmContract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 10

        # Withdraw LP Tokens
        res = self.farmContract.withdraw(totalWithdrawAmount).interpret(storage=res.storage, sender=alice, level=nextBlock)
        nextBlock += 10

        # Claim reward after one block
        res = self.farmContract.claim().interpret(storage=res.storage, sender=alice, level=nextBlock)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

        suspectedRewards = (nextBlock-lastBlockUpdate) * rewardPerBlock

        self.assertEqual(1, res.storage['delegators'][alice]['balance'])
        self.assertEqual(suspectedRewards, aliceClaimedRewards)
        self.assertEqual(0, aliceUnclaimedRewards)
        print('----')
        print('✅ Alice deposits 2LP on a block, withdraws 1LP on another and claims on another')
        print('alice delegated lp balance')
        print(res.storage['delegators'][alice]['balance'])
        print('rewards:')
        print(aliceClaimedRewards)

    def test_03_farm_total_reward_match_accumulated_users_rewards_one_deposit_one_claim(self):
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        aliceDepositAmount          = 2
        bobDepositAmount            = 8
        eveDepositAmount            = 10
        totalBlocks                 = 100
        rewardPerBlock              = 1000
        
        # Init farm
        res = self.farmContract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens
        res = self.farmContract.deposit(aliceDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate + 1)
        res = self.farmContract.deposit(eveDepositAmount).interpret(storage=res.storage, sender=eve, level=lastBlockUpdate + 20)
        res = self.farmContract.deposit(bobDepositAmount).interpret(storage=res.storage, sender=bob, level=lastBlockUpdate + 50)

        # Claim reward after one block
        res = self.farmContract.claim().interpret(storage=res.storage, sender=alice, level=lastBlockUpdate + 1000)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

        res = self.farmContract.claim().interpret(storage=res.storage, sender=bob, level=lastBlockUpdate + 1001)
        bobUnclaimedRewards = res.storage['delegators'][bob]['unclaimedRewards']
        bobClaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

        res = self.farmContract.claim().interpret(storage=res.storage, sender=eve, level=lastBlockUpdate + 1002)
        eveUnclaimedRewards = res.storage['delegators'][eve]['unclaimedRewards']
        eveClaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

        totalFarmRewards = totalBlocks * rewardPerBlock
        totalUserClaimedRewards = aliceClaimedRewards + bobClaimedRewards + eveClaimedRewards
        totalUserUnclaimedRewards = aliceUnclaimedRewards + bobUnclaimedRewards + eveUnclaimedRewards
        self.assertEqual(totalFarmRewards, totalUserClaimedRewards)
        self.assertEqual(0,totalUserUnclaimedRewards)
        print('----')
        print('✅ Alice, Bob and Eve deposit 2, 8 and 10LP on three different blocks then claim their rewards after the farm has ended')
        print('alice rewards:')
        print(aliceClaimedRewards)
        print('bob rewards:')
        print(bobClaimedRewards)
        print('eve rewards:')
        print(eveClaimedRewards)
        print('total rewards:')
        print(totalUserClaimedRewards)
        
    def test_03_farm_total_reward_match_accumulated_users_rewards_multiple_deposits_multiple_claims(self):
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        aliceDepositAmount          = 2
        bobDepositAmount            = 8
        eveDepositAmount            = 10
        totalBlocks                 = 100
        rewardPerBlock              = 1000
        
        # Init farm
        res = self.farmContract.initFarm({
            "rewardPerBlock": rewardPerBlock,
            "totalBlocks": totalBlocks
        }).interpret(storage=init_farm_storage, sender=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens and claims LP
        res = self.farmContract.deposit(aliceDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate + 1)
        res = self.farmContract.claim().interpret(storage=res.storage, sender=alice, level=lastBlockUpdate + 10)
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

        res = self.farmContract.deposit(eveDepositAmount).interpret(storage=res.storage, sender=eve, level=lastBlockUpdate + 20)
        res = self.farmContract.deposit(eveDepositAmount).interpret(storage=res.storage, sender=eve, level=lastBlockUpdate + 23)
        res = self.farmContract.deposit(bobDepositAmount).interpret(storage=res.storage, sender=bob, level=lastBlockUpdate + 50)

        # Claim reward after one block
        res = self.farmContract.claim().interpret(storage=res.storage, sender=alice, level=lastBlockUpdate + 1000)   
        aliceClaimedRewards += int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

        res = self.farmContract.claim().interpret(storage=res.storage, sender=bob, level=lastBlockUpdate + 1001)
        bobClaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

        res = self.farmContract.claim().interpret(storage=res.storage, sender=eve, level=lastBlockUpdate + 1002)
        eveUnclaimedRewards = res.storage['delegators'][eve]['unclaimedRewards']
        eveClaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

        totalFarmRewards = totalBlocks * rewardPerBlock

        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
        bobUnclaimedRewards = res.storage['delegators'][bob]['unclaimedRewards']
        eveUnclaimedRewards = res.storage['delegators'][eve]['unclaimedRewards']
        totalUserUnclaimedRewards = aliceUnclaimedRewards + bobUnclaimedRewards + eveUnclaimedRewards
        totalUserClaimedRewards = aliceClaimedRewards + bobClaimedRewards + eveClaimedRewards

        self.assertEqual(pytest.approx(totalFarmRewards, TOLERANCE), totalUserClaimedRewards)
        self.assertEqual(0, totalUserUnclaimedRewards)
        print('----')
        print('✅ Alice deposits 2 and claim on two different blocks, then Eve deposits 20LP on two different blocks then Bob deposits 8LP. They finally claim their rewards after the farm has ended')
        print('alice rewards:')
        print(aliceClaimedRewards)
        print('bob rewards:')
        print(bobClaimedRewards)
        print('eve rewards:')
        print(eveClaimedRewards)
        print('total farm rewards:')
        print(totalFarmRewards)
        print('users claimed rewards:')
        print(totalUserClaimedRewards)

    # def test_03_multiple_users_deposit_withdraw_claim_until_end(self):
    #     init_farm_storage = deepcopy(self.farmStorage)
        
    #     # Initial parameters
    #     aliceFirstDepositAmount     = 20
    #     aliceFirstWithdrawAmount    = 5
    #     aliceSecondWithdrawAmount   = 10
    #     bobFirstDepositAmount       = 8
    #     bobSecondDepositAmount      = 1
    #     bobThirdDepositAmount       = 12
    #     eveFirstDepositAmount       = 10
    #     eveSecondDepositAmount      = 10
    #     eveFirstWithdrawAmount      = 2
    #     totalBlocks                 = 100
    #     rewardPerBlock              = 1000
        
    #     # Init farm
    #     res = self.farmContract.initFarm({
    #         "rewardPerBlock": rewardPerBlock,
    #         "totalBlocks": totalBlocks
    #     }).interpret(storage=init_farm_storage, sender=alice)
    #     lastBlockUpdate = res.storage['lastBlockUpdate']

    #     # Alice First deposit
    #     res = self.farmContract.deposit(aliceFirstDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
    #     nextBlock = lastBlockUpdate + 10;

    #     # Bob First deposit
    #     res = self.farmContract.deposit(bobFirstDepositAmount).interpret(storage=res.storage, sender=bob, level=nextBlock)
    #     nextBlock += 2;

    #     # Alice First Withdrawal
    #     res = self.farmContract.withdraw(aliceFirstWithdrawAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
    #     aliceUnclaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])
    #     nextBlock += 11;

    #     # Eve First deposit
    #     res = self.farmContract.deposit(eveFirstDepositAmount).interpret(storage=res.storage, sender=eve, level=nextBlock)
    #     nextBlock += 20;

    #     # Bob Second deposit
    #     res = self.farmContract.deposit(bobSecondDepositAmount).interpret(storage=res.storage, sender=bob, level=nextBlock)
    #     bobUnclaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])
    #     nextBlock += 5;

    #     # Alice Second Withdrawal
    #     res = self.farmContract.withdraw(aliceSecondWithdrawAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
    #     aliceUnclaimedRewards += int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])
    #     nextBlock += 23;

    #     # Bob Third deposit
    #     res = self.farmContract.deposit(bobThirdDepositAmount).interpret(storage=res.storage, sender=bob, level=nextBlock)
    #     bobUnclaimedRewards += int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])
    #     nextBlock += 16;

    #     # Eve Second deposit
    #     res = self.farmContract.deposit(eveSecondDepositAmount).interpret(storage=res.storage, sender=eve, level=nextBlock)
    #     eveUnclaimedRewards = int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])
    #     nextBlock += 8;

    #     # Eve First withdraw
    #     res = self.farmContract.withdraw(eveFirstWithdrawAmount).interpret(storage=res.storage, sender=eve, level=nextBlock)
    #     eveUnclaimedRewards += int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])
    #     nextBlock += 4;

    #     suspectedAliceRewards = (10 * rewardPerBlock) + (2 * rewardPerBlock * 20/28) + (11 * rewardPerBlock * 15/28) + (20 * rewardPerBlock * 15/38) + (5 * rewardPerBlock * 15/39) + (23 * rewardPerBlock * 5/29) + (16 * rewardPerBlock * 5/41) + (8 * rewardPerBlock * 5/51) + (4 * rewardPerBlock * 5/49)
    #     suspectedBobRewards = 0
    #     suspectedEveRewards = 0

    #     # Claim reward after one block
    #     res = self.farmContract.claim().interpret(storage=res.storage, sender=alice, level=nextBlock + 1000)
    #     aliceUnclaimedRewards += int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

    #     res = self.farmContract.claim().interpret(storage=res.storage, sender=bob, level=nextBlock + 1001)
    #     bobUnclaimedRewards += int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

    #     res = self.farmContract.claim().interpret(storage=res.storage, sender=eve, level=nextBlock + 1002)
    #     eveUnclaimedRewards += int(res.operations[-1]['parameters']['value'][0]['args'][-1][0]['args'][-1]['int'])

    #     totalFarmRewards = totalBlocks * rewardPerBlock
    #     totalUserClaimedRewards = aliceUnclaimedRewards + bobUnclaimedRewards + eveUnclaimedRewards
                
    #     self.assertEqual(5, res.storage['delegators'][alice]['balance'])
    #     self.assertEqual(21, res.storage['delegators'][bob]['balance'])
    #     self.assertEqual(18, res.storage['delegators'][eve]['balance'])
    #     self.assertEqual(pytest.approx(totalFarmRewards, TOLERANCE), totalUserClaimedRewards)
    #     self.assertEqual(suspectedAliceRewards, aliceUnclaimedRewards)
    #     print('----')
    #     print('✅ Alice ')
    #     print('alice delegated lp balance')
    #     print(res.storage['delegators'][alice]['balance'])
    #     print('alice rewards:')
    #     print(aliceUnclaimedRewards)
    #     print('bob delegated lp balance')
    #     print(res.storage['delegators'][bob]['balance'])
    #     print('bob rewards:')
    #     print(bobUnclaimedRewards)
    #     print('eve delegated lp balance')
    #     print(res.storage['delegators'][eve]['balance'])
    #     print('eve rewards:')
    #     print(eveUnclaimedRewards)
    #     print('total farm rewards:')
    #     print(totalFarmRewards)
    #     print('users claimed rewards:')
    #     print(totalUserClaimedRewards)
