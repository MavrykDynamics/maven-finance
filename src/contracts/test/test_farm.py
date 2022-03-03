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

helpersDir          = os.path.join(fileDir, 'helpers')
mvkTokenDecimals = os.path.join(helpersDir, 'mvkTokenDecimals.json')
mvkTokenDecimals = open(mvkTokenDecimals)
mvkTokenDecimals = json.load(mvkTokenDecimals)
mvkTokenDecimals = mvkTokenDecimals['decimals']

deploymentsDir          = os.path.join(fileDir, 'deployments')
deployedFarmContract = os.path.join(deploymentsDir, 'farmAddress.json')
deployedFarmFA2Contract = os.path.join(deploymentsDir, 'farmFA2Address.json')
deployedFarmInfiniteContract = os.path.join(deploymentsDir, 'farmInfiniteAddress.json')
deployedMvkTokenContract = os.path.join(deploymentsDir, 'mvkTokenAddress.json')
deployedLpTokenContract = os.path.join(deploymentsDir, 'lpTokenAddress.json')
deployedCouncilContract = os.path.join(deploymentsDir, 'councilAddress.json')

deployedFarm = open(deployedFarmContract)
farmContractAddress = json.load(deployedFarm)
farmContractAddress = farmContractAddress['address']

deployedFarmFA2 = open(deployedFarmFA2Contract)
farmFA2ContractAddress = json.load(deployedFarmFA2)
farmFA2ContractAddress = farmFA2ContractAddress['address']

deployedFarmInfinite = open(deployedFarmContract)
farmInfiniteContractAddress = json.load(deployedFarmInfinite)
farmInfiniteContractAddress = farmInfiniteContractAddress['address']

deployedMvkToken = open(deployedMvkTokenContract)
mvkTokenAddress = json.load(deployedMvkToken)
mvkTokenAddress = mvkTokenAddress['address']

deployedLpToken = open(deployedLpTokenContract)
lpTokenAddress = json.load(deployedLpToken)
lpTokenAddress = lpTokenAddress['address']

deployedCouncil = open(deployedCouncilContract)
councilAddress = json.load(deployedCouncil)
councilAddress = councilAddress['address']

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

error_farm_not_init = 'This farm has not yet been initiated'
error_withdraw_higher_than_deposit = 'The amount withdrawn is higher than the delegator deposit'
error_only_administrator = 'ONLY_ADMINISTRATOR_ALLOWED'
error_farm_closed = 'This farm is closed'
error_farm_already_init = 'This farm is already opened you cannot initialize it again'
error_delegator_not_found = 'DELEGATOR_NOT_FOUND'
error_no_unclaimed_rewards = 'The delegator has no rewards to claim'
error_deposit_paused = 'Deposit entrypoint is paused.'
error_withdraw_paused = 'Withdraw entrypoint is paused.'
error_claim_paused = 'Claim entrypoint is paused.'
error_increase_rewards_higher = 'The new reward per block must be higher than the previous one.'
error_farm_duration = 'This farm should be either infinite or have a specified duration'
error_farm_blocks_per_minute = 'This farm farm blocks per minute should be greater than 0'
error_only_administrator_or_factory_not_found = 'Only Admin or Farm Factory contract allowed and Farm factory contract not found in whitelist contracts'
error_only_council = 'Only Council contract allowed'

class FarmContract(TestCase):
    
    @classmethod
    def setUpClass(cls):
        cls.farmContract = pytezos.contract(farmContractAddress)
        cls.farmStorage  = cls.farmContract.storage()
        cls.farmFA2Contract = pytezos.contract(farmFA2ContractAddress)
        cls.farmFA2Storage  = cls.farmFA2Contract.storage()
        cls.farmInfiniteContract = pytezos.contract(farmInfiniteContractAddress)
        cls.farmInfiniteStorage  = cls.farmInfiniteContract.storage()
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

    # MVK Formatter
    def MVK(self, value: float = 1.0):
        return int(value * 10**int(mvkTokenDecimals))

#     ######################
#     # Tests for farm contract #
#     ######################

    ###
    # %initFarm
    ##
    def test_01_admin_init_farm(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalBlocks     = 100
        currentRewardPerBlock  = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)

        self.assertEqual(totalBlocks, res.storage['plannedRewards']['totalBlocks'])
        self.assertEqual(currentRewardPerBlock, res.storage['plannedRewards']['currentRewardPerBlock'])
        self.assertEqual(True, res.storage['open'])
        self.assertEqual(True, res.storage['init'])
        print('----')
        print('✅ Admin initialize a farm')
        print('total blocks:')
        print(res.storage['plannedRewards']['totalBlocks'])
        print('rewards per block:')
        print(res.storage['plannedRewards']['currentRewardPerBlock'])
        print('open:')
        print(res.storage['open'])
        print('init:')
        print(res.storage['init'])

    def test_02_non_admin_init_farm(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalBlocks     = 100
        currentRewardPerBlock  = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        with self.raisesMichelsonError(error_only_administrator):
            res = self.farmContract.initFarm({
                "currentRewardPerBlock": currentRewardPerBlock,
                "totalBlocks": totalBlocks,
                "blocksPerMinute": blocksPerMinute,
                "forceRewardFromTransfer": False,
                "infinite": False
            }).interpret(storage=init_farm_storage, sender=bob)

        self.assertEqual(0, init_farm_storage['plannedRewards']['totalBlocks'])
        self.assertEqual(0, init_farm_storage['plannedRewards']['currentRewardPerBlock'])
        self.assertEqual(False, init_farm_storage['open'])
        self.assertEqual(False, init_farm_storage['init'])
        print('----')
        print('✅ Non-admin initialize a farm')
        print('total blocks:')
        print(init_farm_storage['plannedRewards']['totalBlocks'])
        print('rewards per block:')
        print(init_farm_storage['plannedRewards']['currentRewardPerBlock'])
        print('open:')
        print(init_farm_storage['open'])
        print('init:')
        print(init_farm_storage['init'])
        
    def test_03_admin_init_farm_twice(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalBlocks     = 100
        currentRewardPerBlock  = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)

        # Init farm again
        with self.raisesMichelsonError(error_farm_already_init):
            res = self.farmContract.initFarm({
                "currentRewardPerBlock": currentRewardPerBlock,
                "totalBlocks": totalBlocks,
                "blocksPerMinute": blocksPerMinute,
                "forceRewardFromTransfer": False,
                "infinite": False
            }).interpret(storage=res.storage, source=alice)

        self.assertEqual(totalBlocks, res.storage['plannedRewards']['totalBlocks'])
        self.assertEqual(currentRewardPerBlock, res.storage['plannedRewards']['currentRewardPerBlock'])
        self.assertEqual(True, res.storage['open'])
        self.assertEqual(True, res.storage['init'])
        print('----')
        print('✅ Admin initialize a farm twice')
        print('total blocks:')
        print(res.storage['plannedRewards']['totalBlocks'])
        print('rewards per block:')
        print(res.storage['plannedRewards']['currentRewardPerBlock'])
        print('open:')
        print(res.storage['open'])
        print('init:')
        print(res.storage['init'])

    def test_04_admin_init_farm_finite_no_duration(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalBlocks     = 0
        currentRewardPerBlock  = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        with self.raisesMichelsonError(error_farm_duration):
            self.farmContract.initFarm({
                "currentRewardPerBlock": currentRewardPerBlock,
                "totalBlocks": totalBlocks,
                "blocksPerMinute": blocksPerMinute,
                "forceRewardFromTransfer": False,
                "infinite": False
            }).interpret(storage=init_farm_storage, source=alice)

        print('----')
        print('✅ Admin should not be able to initialize a finite farm with no duration')

    def test_05_admin_init_farm_with_wrong_blocks_per_minute(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalBlocks     = 100
        currentRewardPerBlock  = 1000
        blocksPerMinute = 0
        
        # Init farm operation
        with self.raisesMichelsonError(error_farm_blocks_per_minute):
            self.farmContract.initFarm({
                "currentRewardPerBlock": currentRewardPerBlock,
                "totalBlocks": totalBlocks,
                "blocksPerMinute": blocksPerMinute,
                "forceRewardFromTransfer": False,
                "infinite": False
            }).interpret(storage=init_farm_storage, source=alice)

        print('----')
        print('✅ Admin should not be able to initialize a farm with blocks per minute equal to 0')
    
    ###
    # %deposit
    ##
    def test_10_user_cant_deposit_if_farm_not_init(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2

        # Deposit operation
        with self.raisesMichelsonError(error_farm_not_init):
            self.farmContract.deposit(totalDepositAmount).interpret(storage=init_farm_storage, source=alice)

        print('----')
        print('✅ User should not be able to deposit in a non-initiated farm')

    def test_11_user_cant_deposit_in_ended_farm(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        with self.raisesMichelsonError(error_farm_closed):
            res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate+101)

        self.assertEqual(False, alice in res.storage['delegators'])
        print('----')
        print('✅ User should not be able to deposit in a ended farm')

    def test_12_user_should_have_unclaimed_rewards_updated_during_deposit(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        firstDeposit                = 100
        secondDeposit               = 50
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Operations
        res = self.farmContract.deposit(firstDeposit).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        userUnclaimedReward = int(res.storage['delegators'][alice]['unclaimedRewards'])
        self.assertEqual(0,userUnclaimedReward)

        res = self.farmContract.deposit(secondDeposit).interpret(storage=res.storage, source=alice, level=lastBlockUpdate+1)
        userUnclaimedReward = int(res.storage['delegators'][alice]['unclaimedRewards'])
        self.assertNotEqual(0,userUnclaimedReward)

        print('----')
        print('✅ User should have his unclaimed rewards updated during deposit')

    def test_10_alice_deposit_2_lp(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)

        self.assertEqual(totalDepositAmount, res.storage['delegators'][alice]['balance'])
        print('----')
        print('✅ Alice deposits 2LP')
        print('alice deposit balance:')
        print(res.storage['delegators'][alice]['balance'])

    def test_11_alice_deposit_2_lp(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)

        self.assertEqual(totalDepositAmount, res.storage['delegators'][alice]['balance'])
        print('----')
        print('✅ Alice deposits 2LP')
        print('alice deposit balance:')
        print(res.storage['delegators'][alice]['balance'])

    def test_12_alice_deposit_2_lp_on_fa2(self):        
        init_farm_storage = deepcopy(self.farmFA2Storage)

        # Initial parameters
        totalDepositAmount          = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmFA2Contract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmFA2Contract.deposit(totalDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)

        self.assertEqual(totalDepositAmount, res.storage['delegators'][alice]['balance'])
        print('----')
        print('✅ Alice deposits 2LP on a farm with FA2 LP Tokens')
        print('alice deposit balance:')
        print(res.storage['delegators'][alice]['balance'])
        
    def test_13_alice_deposit_2_lp_then_2_lp_on_different_block(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        firstDepositedAmount        = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # First deposit operation
        res = self.farmContract.deposit(firstDepositedAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 20

        # Second deposit operation
        res = self.farmContract.deposit(firstDepositedAmount).interpret(storage=res.storage, source=alice, level=nextBlock)

        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
        suspectedRewards = (nextBlock-lastBlockUpdate) * currentRewardPerBlock
        totalDepositAmount = 2 * firstDepositedAmount

        self.assertEqual(suspectedRewards, aliceUnclaimedRewards)
        self.assertEqual(totalDepositAmount, res.storage['delegators'][alice]['balance'])
        print('----')
        print('✅ Alice deposits 2LP on one block then 2 more on another block')
        print('alice deposit balance:')
        print(res.storage['delegators'][alice]['balance'])
        print('alice unclaimedRewards during second deposit')
        print(aliceUnclaimedRewards)
    
    # ###
    # # %withdraw
    # ##
    def test_20_user_cant_withdraw_if_farm_not_init(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalWithdrawAmount         = 1

        # Deposit operation
        with self.raisesMichelsonError(error_farm_not_init):
            self.farmContract.withdraw(totalWithdrawAmount).interpret(storage=init_farm_storage, source=alice)

        print('----')
        print('✅ User should not be able to withdraw in a non-initiated farm')

    def test_21_user_should_have_unclaimed_rewards_updated_during_withdraw(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        firstDeposit                = 100
        firstWithdraw               = 50
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Operations
        res = self.farmContract.deposit(firstDeposit).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        userUnclaimedReward = int(res.storage['delegators'][alice]['unclaimedRewards'])
        self.assertEqual(0,userUnclaimedReward)

        res = self.farmContract.withdraw(firstWithdraw).interpret(storage=res.storage, source=alice, level=lastBlockUpdate+1)
        userUnclaimedReward = int(res.storage['delegators'][alice]['unclaimedRewards'])
        self.assertNotEqual(0,userUnclaimedReward)

        print('----')
        print('✅ User should have his unclaimed rewards updated during withdrawal')

    def test_22_user_cant_withdraw_if_he_never_deposited(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        firstWithdraw               = 50
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Operations
        with self.raisesMichelsonError(error_delegator_not_found):
            self.farmContract.withdraw(firstWithdraw).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)

        print('----')
        print('✅ User should not be able to withdraw if he never deposited')

    def test_23_user_cant_withdraw_more_than_his_deposit(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        firstDeposit                = 100
        firstWithdraw               = 200
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Operations
        res = self.farmContract.deposit(firstDeposit).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        with self.raisesMichelsonError(error_withdraw_higher_than_deposit):
            self.farmContract.withdraw(firstWithdraw).interpret(storage=res.storage, source=alice, level=lastBlockUpdate+1)

        print('----')
        print('✅ User should not be able to withdraw more than his deposit')

    def test_20_alice_deposit_2_lp_and_withdraw_2_lp_on_same_block(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)

        # Withdraw operation
        res = self.farmContract.withdraw(totalDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']

        self.assertEqual(0, res.storage['delegators'][alice]['balance'])
        self.assertEqual(0, aliceUnclaimedRewards)
        print('----')
        print('✅ Alice deposits 2LP then withdraws 2LP on the same block')
        print('alice delegated lp balance')
        print(res.storage['delegators'][alice]['balance'])
        print('alice unclaimedRewards during withdrawal')
        print(aliceUnclaimedRewards)

    def test_21_alice_deposit_2_lp_and_withdraw_2_lp_on_same_block_on_fa2(self):        
        init_farm_storage = deepcopy(self.farmFA2Storage)

        # Initial parameters
        totalDepositAmount          = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmFA2Contract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmFA2Contract.deposit(totalDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)

        # Withdraw operation
        res = self.farmFA2Contract.withdraw(totalDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']

        self.assertEqual(0, res.storage['delegators'][alice]['balance'])
        self.assertEqual(0, aliceUnclaimedRewards)
        print('----')
        print('✅ Alice deposits 2LP then withdraws 2LP on the same block on a farm with FA2 LP Tokens')
        print('alice delegated lp balance')
        print(res.storage['delegators'][alice]['balance'])
        print('alice unclaim rewards during withdrawal')
        print(aliceUnclaimedRewards)
        
    def test_22_alice_deposit_2_lp_and_withdraw_2_lp_on_different_blocks(self): 
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 10

        # Withdraw operation
        res = self.farmContract.withdraw(totalDepositAmount).interpret(storage=res.storage, source=alice, level=nextBlock)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']

        suspectedRewards = (nextBlock-lastBlockUpdate) * currentRewardPerBlock

        self.assertEqual(0, res.storage['delegators'][alice]['balance'])
        self.assertEqual(suspectedRewards, aliceUnclaimedRewards)
        print('----')
        print('✅ Alice deposits 2LP then withdraws 2LP on two different blocks')
        print('alice delegated lp balance')
        print(res.storage['delegators'][alice]['balance'])
        print('alice unclaimed rewards during withdrawal')
        print(aliceUnclaimedRewards)

    def test_23_alice_deposit_2_lp_and_withdraw_1_lp_on_different_blocks(self): 
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalWithdrawAmount         = 1
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 10

        # Withdraw operation
        res = self.farmContract.withdraw(totalWithdrawAmount).interpret(storage=res.storage, source=alice, level=nextBlock)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards'];

        suspectedRewards = (nextBlock-lastBlockUpdate) * currentRewardPerBlock

        self.assertEqual(totalDepositAmount-totalWithdrawAmount, res.storage['delegators'][alice]['balance'])
        self.assertEqual(suspectedRewards, aliceUnclaimedRewards)
        print('----')
        print('✅ Alice deposits 2LP then withdraws 1LP on two different blocks')
        print('alice delegated lp balance')
        print(res.storage['delegators'][alice]['balance'])
        print('alice unclaimed rewards during withdrawal')
        print(aliceUnclaimedRewards)

    def test_25_alice_deposit_lp_before_end_and_withdraw_after_end(self): 
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalWithdrawAmount         = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 100

        # Withdraw operation
        aliceUnclaimedRewards = 0
        res = self.farmContract.withdraw(totalWithdrawAmount).interpret(storage=res.storage, source=alice, level=nextBlock)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']

        suspectedRewards = totalBlocks * currentRewardPerBlock

        self.assertEqual(0, res.storage['delegators'][alice]['balance'])
        self.assertEqual(suspectedRewards, aliceUnclaimedRewards)
        print('----')
        print('✅ Alice deposits 2LP before farm ends then withdraws 2LP after farm ends')
        print('alice delegated lp balance')
        print(res.storage['delegators'][alice]['balance'])
        print('alice unclaimed rewards during withdrawal')
        print(aliceUnclaimedRewards)

    # ###
    # # %claim
    # ##
    def test_30_user_cant_claim_if_farm_not_init(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Deposit operation
        with self.raisesMichelsonError(error_farm_not_init):
            self.farmContract.claim().interpret(storage=init_farm_storage, source=alice)

        print('----')
        print('✅ User should not be able to claim in a non-initiated farm')

    def test_31_user_cant_claim_if_he_never_deposited(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Operations
        with self.raisesMichelsonError(error_delegator_not_found):
            self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate)

        print('----')
        print('✅ User should not be able to claim if he never deposited')
    
    def test_32_user_cant_claim_if_he_has_no_unclaimed_rewards(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        firstDeposit                = 100
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Operations
        res = self.farmContract.deposit(firstDeposit).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        with self.raisesMichelsonError(error_no_unclaimed_rewards):
            self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate)

        print('----')
        print('✅ User should not be able to claim if he has no unclaimed rewards')

    def test_30_alice_and_bob_deposit_2_lp_then_claim_on_two_different_blocks(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        aliceDepositAmount          = 2
        bobDepositAmount            = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Initial deposit
        res = self.farmContract.deposit(aliceDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        res = self.farmContract.deposit(bobDepositAmount).interpret(storage=res.storage, sender=bob, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 50

        # New deposit
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=nextBlock)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']

        # breakpoint()

        aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        res = self.farmContract.claim().interpret(storage=res.storage, sender=bob, level=nextBlock)
        bobUnclaimedRewards = res.storage['delegators'][bob]['unclaimedRewards']
        bobClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        suspectedRewards = (nextBlock-lastBlockUpdate) * currentRewardPerBlock
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

    def test_31_alice_and_bob_deposit_2_lp_then_claim_on_two_different_blocks_on_fa2(self):        
        init_farm_storage = deepcopy(self.farmFA2Storage)

        # Initial parameters
        aliceDepositAmount          = 2
        bobDepositAmount            = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmFA2Contract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Initial deposit
        res = self.farmFA2Contract.deposit(aliceDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        res = self.farmFA2Contract.deposit(bobDepositAmount).interpret(storage=res.storage, sender=bob, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 50

        # New deposit
        res = self.farmFA2Contract.claim().interpret(storage=res.storage, source=alice, level=nextBlock)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        res = self.farmFA2Contract.claim().interpret(storage=res.storage, sender=bob, level=nextBlock)
        bobUnclaimedRewards = res.storage['delegators'][bob]['unclaimedRewards']
        bobClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        suspectedRewards = (nextBlock-lastBlockUpdate) * currentRewardPerBlock
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

    def test_32_alice_and_bob_deposit_then_claim_on_different_blocks(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        aliceDepositAmount          = 2
        bobDepositAmount            = 4
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Initial deposit
        res = self.farmContract.deposit(aliceDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 50

        res = self.farmContract.deposit(bobDepositAmount).interpret(storage=res.storage, sender=bob, level=nextBlock)
        nextBlock += 25

        # New deposit
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=nextBlock)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])
        nextBlock += 15

        res = self.farmContract.claim().interpret(storage=res.storage, sender=bob, level=nextBlock)
        bobUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
        bobClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        aliceSuspectedRewards = math.trunc((50 * currentRewardPerBlock) + (25 * currentRewardPerBlock / 3))
        bobSuspectedRewards = math.trunc(40 * currentRewardPerBlock * 2 / 3)
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
        
    def test_33_alice_deposits_then_claims_on_same_blocks(self):        
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        totalDepositAmount      = 2
        totalBlocks             = 100
        currentRewardPerBlock   = 1000
        blocksPerMinute = 2
        
        # Init farm
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)

        # Claim reward after one block
        aliceUnclaimedRewards = 0;
        aliceClaimedRewards = 0;
        with self.raisesMichelsonError(error_no_unclaimed_rewards):
            res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
            aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
            aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

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

    
    def test_34_alice_deposits_then_withdraw_all_then_claim_on_different_blocks(self):        
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        totalDepositAmount      = 2
        totalBlocks             = 100
        currentRewardPerBlock   = 1000
        blocksPerMinute = 2
        
        # Init farm
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)

        # Withdraw LP Tokens
        res = self.farmContract.withdraw(totalDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        nextBlock = 15 + lastBlockUpdate

        # Claim reward after one block
        aliceUnclaimedRewards = 0
        aliceClaimedRewards = 0
        with self.raisesMichelsonError(error_no_unclaimed_rewards):
            res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=nextBlock)
            aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
            aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

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
        
    def test_35_alice_deposits_then_claims_on_different_blocks(self):        
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        totalDepositAmount      = 2
        totalBlocks             = 100
        currentRewardPerBlock   = 1000
        blocksPerMinute = 2
        
        # Init farm
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 10

        # Claim reward after one block
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=nextBlock)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        suspectedRewards = (nextBlock-lastBlockUpdate) * currentRewardPerBlock

        self.assertEqual(aliceClaimedRewards, suspectedRewards)
        self.assertEqual(aliceUnclaimedRewards, 0)
        print('----')
        print('✅ Alice claims sMVK after depositing 2LP')
        print('rewards:')
        print(aliceClaimedRewards)

    def test_36_alice_deposits_then_claims_twice(self):        
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        totalDepositAmount      = 2
        totalBlocks             = 100
        currentRewardPerBlock   = 1000
        blocksPerMinute = 2
        
        # Init farm
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 10

        # Claim reward after one block
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=nextBlock)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        with self.raisesMichelsonError(error_no_unclaimed_rewards):
            res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=nextBlock)
            aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
            aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        suspectedRewards = (nextBlock-lastBlockUpdate) * currentRewardPerBlock

        self.assertEqual(aliceClaimedRewards, suspectedRewards)
        self.assertEqual(aliceUnclaimedRewards, 0)
        print('----')
        print('✅ Alice claims sMVK after depositing 2LP')
        print('rewards:')
        print(aliceClaimedRewards)
        
    def test_37_alice_claims_without_having_deposit(self):        
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        totalDepositAmount      = 2
        totalBlocks             = 100
        currentRewardPerBlock   = 1000
        blocksPerMinute = 2
        
        # Init farm
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Claim rewards
        aliceUnclaimedRewards = 0
        aliceClaimedRewards = 0
        with self.raisesMichelsonError(error_delegator_not_found):
            res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
            aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
            aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        suspectedRewards = 0

        self.assertEqual(aliceClaimedRewards, suspectedRewards)
        self.assertEqual(aliceUnclaimedRewards, suspectedRewards)
        print('----')
        print('✅ Alice claims sMVK without having deposit at all')
        print('rewards:')
        print(aliceClaimedRewards)
        
    def test_38_alice_deposits_then_withdraws_lesser_amount_then_claims_on_different_blocks(self):        
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        totalDepositAmount      = 2
        totalWithdrawAmount     = 1
        totalBlocks             = 100
        currentRewardPerBlock   = 1000
        blocksPerMinute = 2
        
        # Init farm
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 10

        # Withdraw LP Tokens
        res = self.farmContract.withdraw(totalWithdrawAmount).interpret(storage=res.storage, source=alice, level=nextBlock)
        nextBlock += 10

        # Claim reward after one block
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=nextBlock)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        suspectedRewards = (nextBlock-lastBlockUpdate) * currentRewardPerBlock

        self.assertEqual(1, res.storage['delegators'][alice]['balance'])
        self.assertEqual(suspectedRewards, aliceClaimedRewards)
        self.assertEqual(0, aliceUnclaimedRewards)
        print('----')
        print('✅ Alice deposits 2LP on a block, withdraws 1LP on another and claims on another')
        print('alice delegated lp balance')
        print(res.storage['delegators'][alice]['balance'])
        print('rewards:')
        print(aliceClaimedRewards)

    def test_39_farm_total_reward_match_accumulated_users_rewards_one_deposit_one_claim(self):
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        aliceDepositAmount          = 2
        bobDepositAmount            = 8
        eveDepositAmount            = 10
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens
        res = self.farmContract.deposit(aliceDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate + 1)
        res = self.farmContract.deposit(eveDepositAmount).interpret(storage=res.storage, sender=eve, level=lastBlockUpdate + 20)
        res = self.farmContract.deposit(bobDepositAmount).interpret(storage=res.storage, sender=bob, level=lastBlockUpdate + 50)

        # Claim reward after one block
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate + 1000)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        res = self.farmContract.claim().interpret(storage=res.storage, sender=bob, level=lastBlockUpdate + 1001)
        bobUnclaimedRewards = res.storage['delegators'][bob]['unclaimedRewards']
        bobClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        res = self.farmContract.claim().interpret(storage=res.storage, sender=eve, level=lastBlockUpdate + 1002)
        eveUnclaimedRewards = res.storage['delegators'][eve]['unclaimedRewards']
        eveClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        totalFarmRewards = totalBlocks * currentRewardPerBlock
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
        
    def test_40_farm_total_reward_match_accumulated_users_rewards_multiple_deposits_multiple_claims(self):
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        aliceDepositAmount          = 2
        bobDepositAmount            = 8
        eveDepositAmount            = 10
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens and claims LP
        res = self.farmContract.deposit(aliceDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate + 1)
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate + 10)
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        res = self.farmContract.deposit(eveDepositAmount).interpret(storage=res.storage, sender=eve, level=lastBlockUpdate + 20)
        res = self.farmContract.deposit(eveDepositAmount).interpret(storage=res.storage, sender=eve, level=lastBlockUpdate + 23)
        res = self.farmContract.deposit(bobDepositAmount).interpret(storage=res.storage, sender=bob, level=lastBlockUpdate + 50)

        # Claim reward after one block
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate + 1000)   
        aliceClaimedRewards += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        res = self.farmContract.claim().interpret(storage=res.storage, sender=bob, level=lastBlockUpdate + 1001)
        bobClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        res = self.farmContract.claim().interpret(storage=res.storage, sender=eve, level=lastBlockUpdate + 1002)
        eveUnclaimedRewards = res.storage['delegators'][eve]['unclaimedRewards']
        eveClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        totalFarmRewards = totalBlocks * currentRewardPerBlock

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
    #     currentRewardPerBlock       = 1000
    #     blocksPerMinute = 2
        
    #     # Init farm
    #     res = self.farmContract.initFarm({
    #         "currentRewardPerBlock": currentRewardPerBlock,
    #         "totalBlocks": totalBlocks,
    #         "blocksPerMinute": blocksPerMinute,
            # "forceRewardFromTransfer": False,
            # "infinite": False
    #     }).interpret(storage=init_farm_storage, source=alice)
    #     lastBlockUpdate = res.storage['lastBlockUpdate']

    #     # Alice First deposit
    #     res = self.farmContract.deposit(aliceFirstDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
    #     nextBlock = lastBlockUpdate + 10;

    #     # Bob First deposit
    #     res = self.farmContract.deposit(bobFirstDepositAmount).interpret(storage=res.storage, sender=bob, level=nextBlock)
    #     nextBlock += 2;

    #     # Alice First Withdrawal
    #     res = self.farmContract.withdraw(aliceFirstWithdrawAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
    #     aliceUnclaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])
    #     nextBlock += 11;

    #     # Eve First deposit
    #     res = self.farmContract.deposit(eveFirstDepositAmount).interpret(storage=res.storage, sender=eve, level=nextBlock)
    #     nextBlock += 20;

    #     # Bob Second deposit
    #     res = self.farmContract.deposit(bobSecondDepositAmount).interpret(storage=res.storage, sender=bob, level=nextBlock)
    #     bobUnclaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])
    #     nextBlock += 5;

    #     # Alice Second Withdrawal
    #     res = self.farmContract.withdraw(aliceSecondWithdrawAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
    #     aliceUnclaimedRewards += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])
    #     nextBlock += 23;

    #     # Bob Third deposit
    #     res = self.farmContract.deposit(bobThirdDepositAmount).interpret(storage=res.storage, sender=bob, level=nextBlock)
    #     bobUnclaimedRewards += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])
    #     nextBlock += 16;

    #     # Eve Second deposit
    #     res = self.farmContract.deposit(eveSecondDepositAmount).interpret(storage=res.storage, sender=eve, level=nextBlock)
    #     eveUnclaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])
    #     nextBlock += 8;

    #     # Eve First withdraw
    #     res = self.farmContract.withdraw(eveFirstWithdrawAmount).interpret(storage=res.storage, sender=eve, level=nextBlock)
    #     eveUnclaimedRewards += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])
    #     nextBlock += 4;

    #     suspectedAliceRewards = (10 * currentRewardPerBlock) + (2 * currentRewardPerBlock * 20/28) + (11 * currentRewardPerBlock * 15/28) + (20 * currentRewardPerBlock * 15/38) + (5 * currentRewardPerBlock * 15/39) + (23 * currentRewardPerBlock * 5/29) + (16 * currentRewardPerBlock * 5/41) + (8 * currentRewardPerBlock * 5/51) + (4 * currentRewardPerBlock * 5/49)
    #     suspectedBobRewards = 0
    #     suspectedEveRewards = 0

    #     # Claim reward after one block
    #     res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=nextBlock + 1000)
    #     aliceUnclaimedRewards += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

    #     res = self.farmContract.claim().interpret(storage=res.storage, sender=bob, level=nextBlock + 1001)
    #     bobUnclaimedRewards += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

    #     res = self.farmContract.claim().interpret(storage=res.storage, sender=eve, level=nextBlock + 1002)
    #     eveUnclaimedRewards += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

    #     totalFarmRewards = totalBlocks * currentRewardPerBlock
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

    ###
    # %setAdmin
    ##
    def test_50_admin_set_admin(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        previousAdmin = init_farm_storage['admin']

        # Operation
        res = self.farmContract.setAdmin(bob).interpret(storage=init_farm_storage, source=alice)

        # Check new admin
        newAdmin = res.storage['admin']

        self.assertEqual(alice, previousAdmin)
        self.assertEqual(bob, newAdmin)

        print('----')
        print('✅ Admin should be able to set another admin')
        print('previous admin:')
        print(previousAdmin)
        print('new admin:')
        print(newAdmin)

    def test_51_non_admin_set_admin(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        previousAdmin = init_farm_storage['admin']
        newAdmin = previousAdmin

        # Operation
        with self.raisesMichelsonError(error_only_administrator):
            res = self.farmContract.setAdmin(bob).interpret(storage=init_farm_storage, sender=bob)
            # Check new admin
            newAdmin = res.storage['admin']

        self.assertEqual(alice, previousAdmin)
        self.assertEqual(alice, newAdmin)

        print('----')
        print('✅ Non-admin should not be able to set another admin')
        print('previous admin:')
        print(previousAdmin)
        print('new admin:')
        print(newAdmin)

    
    ###
    # %pauseAll
    ##
    def test_60_admin_call_entrypoint(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        depositIsPaused = init_farm_storage['breakGlassConfig']['depositIsPaused']
        withdrawIsPaused = init_farm_storage['breakGlassConfig']['withdrawIsPaused']
        claimIsPaused = init_farm_storage['breakGlassConfig']['claimIsPaused']
        depositAmount = 2
        withdrawAmount = 1
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Operation
        res = self.farmContract.pauseAll().interpret(storage=res.storage, source=alice, level=lastBlockUpdate)

        # Final values
        finaldepositIsPaused = res.storage['breakGlassConfig']['depositIsPaused']
        finalwithdrawIsPaused = res.storage['breakGlassConfig']['withdrawIsPaused']
        finalclaimIsPaused = res.storage['breakGlassConfig']['claimIsPaused']

        # Tests operations
        with self.raisesMichelsonError(error_deposit_paused):
            res = self.farmContract.deposit(depositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        
        with self.raisesMichelsonError(error_withdraw_paused):
            res = self.farmContract.withdraw(withdrawAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        
        with self.raisesMichelsonError(error_claim_paused):
            res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate)

        self.assertEqual(0, res.storage['lpToken']['tokenBalance'])
        self.assertNotEqual(depositIsPaused, finaldepositIsPaused)
        self.assertNotEqual(withdrawIsPaused, finalwithdrawIsPaused)
        self.assertNotEqual(claimIsPaused, finalclaimIsPaused)

        print('----')
        print('✅ Admin tries to pause all entrypoints')
        print('deposit is paused:')
        print(finaldepositIsPaused)
        print('withdraw is paused:')
        print(finalwithdrawIsPaused)
        print('claim is paused:')
        print(finalclaimIsPaused)

    def test_61_non_admin_call_entrypoint(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        depositIsPaused = init_farm_storage['breakGlassConfig']['depositIsPaused']
        withdrawIsPaused = init_farm_storage['breakGlassConfig']['withdrawIsPaused']
        claimIsPaused = init_farm_storage['breakGlassConfig']['claimIsPaused']
        finaldepositIsPaused = depositIsPaused
        finalwithdrawIsPaused = withdrawIsPaused
        finalclaimIsPaused = claimIsPaused
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)

        # Operation
        with self.raisesMichelsonError(error_only_administrator_or_factory_not_found):
            res = self.farmContract.pauseAll().interpret(storage=res.storage, sender=bob)

            # Final values
            finaldepositIsPaused = res.storage['breakGlassConfig']['depositIsPaused']
            finalwithdrawIsPaused = res.storage['breakGlassConfig']['withdrawIsPaused']
            finalclaimIsPaused = res.storage['breakGlassConfig']['claimIsPaused']

        self.assertEqual(depositIsPaused, finaldepositIsPaused)
        self.assertEqual(withdrawIsPaused, finalwithdrawIsPaused)
        self.assertEqual(claimIsPaused, finalclaimIsPaused)

        print('----')
        print('✅ Non-admin should not be to pause all entrypoints')
        print('deposit is paused:')
        print(finaldepositIsPaused)
        print('withdraw is paused:')
        print(finalwithdrawIsPaused)
        print('claim is paused:')
        print(finalclaimIsPaused)

    ###
    # %unpauseAll
    ##
    def test_62_admin_call_entrypoint(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        depositIsPaused = init_farm_storage['breakGlassConfig']['depositIsPaused']
        withdrawIsPaused = init_farm_storage['breakGlassConfig']['withdrawIsPaused']
        claimIsPaused = init_farm_storage['breakGlassConfig']['claimIsPaused']
        depositAmount = 2
        withdrawAmount = 1
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        res = self.farmContract.pauseAll().interpret(storage=res.storage, source=alice)

        # Paused values
        pausedepositIsPaused = res.storage['breakGlassConfig']['depositIsPaused']
        pausewithdrawIsPaused = res.storage['breakGlassConfig']['withdrawIsPaused']
        pauseclaimIsPaused = res.storage['breakGlassConfig']['claimIsPaused']

        # Operation
        res = self.farmContract.unpauseAll().interpret(storage=res.storage, source=alice)

        # Tests operations
        res = self.farmContract.deposit(depositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate+1)
        res = self.farmContract.withdraw(withdrawAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate+2)
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate+3)
        
        # Final values
        finaldepositIsPaused = res.storage['breakGlassConfig']['depositIsPaused']
        finalwithdrawIsPaused = res.storage['breakGlassConfig']['withdrawIsPaused']
        finalclaimIsPaused = res.storage['breakGlassConfig']['claimIsPaused']

        self.assertEqual(1, res.storage['lpToken']['tokenBalance'])
        self.assertNotEqual(depositIsPaused, pausedepositIsPaused)
        self.assertNotEqual(withdrawIsPaused, pausewithdrawIsPaused)
        self.assertNotEqual(claimIsPaused, pauseclaimIsPaused)
        self.assertEqual(depositIsPaused, finaldepositIsPaused)
        self.assertEqual(withdrawIsPaused, finalwithdrawIsPaused)
        self.assertEqual(claimIsPaused, finalclaimIsPaused)

        print('----')
        print('✅ Admin should be able to unpause all entrypoints')
        print('deposit is paused:')
        print(finaldepositIsPaused)
        print('withdraw is paused:')
        print(finalwithdrawIsPaused)
        print('claim is paused:')
        print(finalclaimIsPaused)

    def test_63_non_admin_call_entrypoint(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        depositIsPaused = init_farm_storage['breakGlassConfig']['depositIsPaused']
        withdrawIsPaused = init_farm_storage['breakGlassConfig']['withdrawIsPaused']
        claimIsPaused = init_farm_storage['breakGlassConfig']['claimIsPaused']
        depositAmount = 2
        withdrawAmount = 1
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)

        res = self.farmContract.pauseAll().interpret(storage=res.storage, source=alice)

        # Paused values
        pausedepositIsPaused = res.storage['breakGlassConfig']['depositIsPaused']
        pausewithdrawIsPaused = res.storage['breakGlassConfig']['withdrawIsPaused']
        pauseclaimIsPaused = res.storage['breakGlassConfig']['claimIsPaused']

        # Operation
        with self.raisesMichelsonError(error_only_administrator_or_factory_not_found):
            res = self.farmContract.unpauseAll().interpret(storage=res.storage, sender=bob)

        # Tests operations
        with self.raisesMichelsonError(error_deposit_paused):
            res = self.farmContract.deposit(depositAmount).interpret(storage=res.storage, source=alice)
        
        with self.raisesMichelsonError(error_withdraw_paused):
            res = self.farmContract.withdraw(withdrawAmount).interpret(storage=res.storage, source=alice)
        
        with self.raisesMichelsonError(error_claim_paused):
            res = self.farmContract.claim().interpret(storage=res.storage, source=alice)
        
        # Final values
        finaldepositIsPaused = res.storage['breakGlassConfig']['depositIsPaused']
        finalwithdrawIsPaused = res.storage['breakGlassConfig']['withdrawIsPaused']
        finalclaimIsPaused = res.storage['breakGlassConfig']['claimIsPaused']

        self.assertEqual(0, res.storage['lpToken']['tokenBalance'])
        self.assertNotEqual(depositIsPaused, pausedepositIsPaused)
        self.assertNotEqual(withdrawIsPaused, pausewithdrawIsPaused)
        self.assertNotEqual(claimIsPaused, pauseclaimIsPaused)
        self.assertNotEqual(depositIsPaused, finaldepositIsPaused)
        self.assertNotEqual(withdrawIsPaused, finalwithdrawIsPaused)
        self.assertNotEqual(claimIsPaused, finalclaimIsPaused)

        print('----')
        print('✅ Non-admin should not be able to unpause all entrypoints')
        print('deposit is paused:')
        print(finaldepositIsPaused)
        print('withdraw is paused:')
        print(finalwithdrawIsPaused)
        print('claim is paused:')
        print(finalclaimIsPaused)

    ###
    # %togglePauseDeposit
    ##
    def test_64_admin_pause_deposit(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        depositIsPaused = init_farm_storage['breakGlassConfig']['depositIsPaused']
        depositAmount = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)

        # Operation
        res = self.farmContract.togglePauseDeposit().interpret(storage=res.storage, source=alice)

        # Final values
        finaldepositIsPaused = res.storage['breakGlassConfig']['depositIsPaused']

        # Tests operations
        with self.raisesMichelsonError(error_deposit_paused):
            res = self.farmContract.deposit(depositAmount).interpret(storage=res.storage, source=alice)

        self.assertEqual(0, res.storage['lpToken']['tokenBalance'])
        self.assertNotEqual(depositIsPaused, finaldepositIsPaused)

        print('----')
        print('✅ Admin should be able to pause deposit entrypoint')
        print('deposit is paused:')
        print(finaldepositIsPaused)

    
    def test_65_non_admin_pause_deposit(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        depositIsPaused = init_farm_storage['breakGlassConfig']['depositIsPaused']
        depositAmount = 2
        finaldepositIsPaused = depositIsPaused;
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)

        # Operation
        with self.raisesMichelsonError(error_only_administrator_or_factory_not_found):
            res = self.farmContract.togglePauseDeposit().interpret(storage=res.storage, sender=bob)

            # Final values
            finaldepositIsPaused = res.storage['breakGlassConfig']['depositIsPaused']

            # Tests operations
            res = self.farmContract.deposit(depositAmount).interpret(storage=res.storage, source=alice)

            self.assertEqual(0, res.storage['lpToken']['tokenBalance'])
            self.assertEqual(depositIsPaused, finaldepositIsPaused)

        print('----')
        print('✅ Non-admin should not be to pause deposit entrypoint')
        print('deposit is paused:')
        print(finaldepositIsPaused)
    
    ###
    # %togglePauseWithdraw
    ##
    def test_66_admin_pause_withdraw(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        withdrawIsPaused = init_farm_storage['breakGlassConfig']['withdrawIsPaused']
        withdrawAmount = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)

        # Operation
        res = self.farmContract.togglePauseWithdraw().interpret(storage=res.storage, source=alice)

        # Final values
        finalwithdrawIsPaused = res.storage['breakGlassConfig']['withdrawIsPaused']

        # Tests operations
        with self.raisesMichelsonError(error_withdraw_paused):
            res = self.farmContract.withdraw(withdrawAmount).interpret(storage=res.storage, source=alice)

        self.assertEqual(0, res.storage['lpToken']['tokenBalance'])
        self.assertNotEqual(withdrawIsPaused, finalwithdrawIsPaused)

        print('----')
        print('✅ Admin should be able to pause withdraw entrypoint')
        print('withdraw is paused:')
        print(finalwithdrawIsPaused)

    
    def test_67_non_admin_pause_withdraw(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        withdrawIsPaused = init_farm_storage['breakGlassConfig']['withdrawIsPaused']
        withdrawAmount = 2
        finalwithdrawIsPaused = withdrawIsPaused;
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)

        # Operation
        with self.raisesMichelsonError(error_only_administrator_or_factory_not_found):
            res = self.farmContract.togglePauseWithdraw().interpret(storage=res.storage, sender=bob)

            # Final values
            finalwithdrawIsPaused = res.storage['breakGlassConfig']['withdrawIsPaused']

            # Tests operations
            res = self.farmContract.withdraw(withdrawAmount).interpret(storage=res.storage, source=alice)

            self.assertEqual(0, res.storage['lpToken']['tokenBalance'])
            self.assertEqual(withdrawIsPaused, finalwithdrawIsPaused)

        print('----')
        print('✅ Non-admin should not be to pause withdraw entrypoint')
        print('withdraw is paused:')
        print(finalwithdrawIsPaused)

    ###
    # %togglePauseClaim
    ##
    def test_64_admin_pause_claim(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        claimIsPaused = init_farm_storage['breakGlassConfig']['claimIsPaused']
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)

        # Operation
        res = self.farmContract.togglePauseClaim().interpret(storage=res.storage, source=alice)

        # Final values
        finalclaimIsPaused = res.storage['breakGlassConfig']['claimIsPaused']

        # Tests operations
        with self.raisesMichelsonError(error_claim_paused):
            res = self.farmContract.claim().interpret(storage=res.storage, source=alice)

        self.assertEqual(0, res.storage['lpToken']['tokenBalance'])
        self.assertNotEqual(claimIsPaused, finalclaimIsPaused)

        print('----')
        print('✅ Admin should be able to pause claim entrypoint')
        print('claim is paused:')
        print(finalclaimIsPaused)

    
    def test_68_non_admin_pause_claim(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        claimIsPaused = init_farm_storage['breakGlassConfig']['claimIsPaused']
        finalclaimIsPaused = claimIsPaused;
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute = 2
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)

        # Operation
        with self.raisesMichelsonError(error_only_administrator_or_factory_not_found):
            res = self.farmContract.togglePauseClaim().interpret(storage=res.storage, sender=bob)

            # Final values
            finalclaimIsPaused = res.storage['breakGlassConfig']['claimIsPaused']

            # Tests operations
            res = self.farmContract.claim().interpret(storage=res.storage, source=alice)

            self.assertEqual(0, res.storage['lpToken']['tokenBalance'])
            self.assertEqual(claimIsPaused, finalclaimIsPaused)

        print('----')
        print('✅ Non-admin should not be to pause claim entrypoint')
        print('claim is paused:')
        print(finalclaimIsPaused)
    
    ###
    # %updateBlocksPerMinute
    ##
    def test_70_council_should_increase_blocks_per_minute_farm(self):
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial values
        totalBlocks                 = 10000
        currentRewardPerBlock       = self.MVK(500)
        blocksPerMinute             = 2
        newBlocksPerMinute          = 3
        totalRewards                = totalBlocks * currentRewardPerBlock

        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Some tests operations to see if the total rewards are affected
        res = self.farmContract.deposit(self.MVK(2)).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        res = self.farmContract.deposit(self.MVK(2)).interpret(storage=res.storage, source=alice, level=lastBlockUpdate+2000)
        res = self.farmContract.deposit(self.MVK()).interpret(storage=res.storage, sender=bob, level=lastBlockUpdate+5000)
        res = self.farmContract.withdraw(self.MVK(2)).interpret(storage=res.storage, source=alice, level=lastBlockUpdate+5500)
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate+6000)
        aliceClaim = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        # Operation
        res = self.farmContract.updateBlocksPerMinute(newBlocksPerMinute).interpret(storage=res.storage, source=councilAddress, level=lastBlockUpdate+6000)
        storageBlocksPerMinute = res.storage["blocksPerMinute"]
        storageTotalBlocks = res.storage['plannedRewards']["totalBlocks"]
        storageRewardPerBlock = res.storage['plannedRewards']["currentRewardPerBlock"]
        storageTotalRewards = res.storage['plannedRewards']["totalRewards"]

        # Some tests operations to see if the total rewards are affected
        res = self.farmContract.claim().interpret(storage=res.storage, sender=bob, level=lastBlockUpdate+6000)
        bobClaim = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])
        res = self.farmContract.deposit(self.MVK(8)).interpret(storage=res.storage, sender=eve, level=lastBlockUpdate+10200)
        res = self.farmContract.withdraw(self.MVK()).interpret(storage=res.storage, sender=eve, level=lastBlockUpdate+11000)

        # # Final claims
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate+storageTotalBlocks)
        aliceClaim += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])
        res = self.farmContract.claim().interpret(storage=res.storage, sender=bob, level=lastBlockUpdate+storageTotalBlocks)
        bobClaim += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])
        res = self.farmContract.claim().interpret(storage=res.storage, sender=eve, level=lastBlockUpdate+storageTotalBlocks)
        eveClaim = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        totalClaim = aliceClaim + bobClaim + eveClaim

        self.assertEqual(totalRewards, pytest.approx(totalClaim,0.01))
        self.assertEqual(totalRewards, storageTotalRewards)
        self.assertEqual(newBlocksPerMinute, storageBlocksPerMinute)
        self.assertNotEqual(currentRewardPerBlock, storageRewardPerBlock)
        self.assertNotEqual(totalBlocks, storageTotalBlocks)

        print('----')
        print('✅ Council should be to call updateBlocksPerMinute entrypoint')
        print('blocksPerMinute:')
        print(storageBlocksPerMinute)
        print('new totalBlocks:')
        print(storageTotalBlocks)
        print('new currentRewardPerBlock:')
        print(storageRewardPerBlock)
        print('total rewards claim:')
        print(totalClaim)

    def test_71_council_should_decrease_blocks_per_minute_farm(self):
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial values
        totalBlocks                 = 10000
        currentRewardPerBlock       = self.MVK(500)
        blocksPerMinute             = 2
        newBlocksPerMinute          = 1
        totalRewards                = totalBlocks * currentRewardPerBlock

        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Some tests operations to see if the total rewards are affected
        res = self.farmContract.deposit(self.MVK(2)).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        res = self.farmContract.deposit(self.MVK(2)).interpret(storage=res.storage, source=alice, level=lastBlockUpdate+2000)
        res = self.farmContract.deposit(self.MVK(1)).interpret(storage=res.storage, sender=bob, level=lastBlockUpdate+3000)
        res = self.farmContract.withdraw(self.MVK(2)).interpret(storage=res.storage, source=alice, level=lastBlockUpdate+4000)
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate+4200)
        aliceClaim = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        # Operation
        res = self.farmContract.updateBlocksPerMinute(newBlocksPerMinute).interpret(storage=res.storage, source=councilAddress, level=lastBlockUpdate+4200)
        storageBlocksPerMinute = res.storage["blocksPerMinute"]
        storageTotalBlocks = res.storage['plannedRewards']["totalBlocks"]
        storageRewardPerBlock = res.storage['plannedRewards']["currentRewardPerBlock"]
        storageTotalRewards = res.storage['plannedRewards']["totalRewards"]

        # Some tests operations to see if the total rewards are affected
        res = self.farmContract.claim().interpret(storage=res.storage, sender=bob, level=lastBlockUpdate+4200)
        bobClaim = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])
        res = self.farmContract.deposit(self.MVK(8)).interpret(storage=res.storage, sender=eve, level=lastBlockUpdate+4500)
        res = self.farmContract.withdraw(self.MVK(1)).interpret(storage=res.storage, sender=eve, level=lastBlockUpdate+4600)

        # Final claims
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate+storageTotalBlocks)
        aliceClaim += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])
        res = self.farmContract.claim().interpret(storage=res.storage, sender=bob, level=lastBlockUpdate+storageTotalBlocks)
        bobClaim += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])
        res = self.farmContract.claim().interpret(storage=res.storage, sender=eve, level=lastBlockUpdate+storageTotalBlocks)
        eveClaim = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        totalClaim = aliceClaim + bobClaim + eveClaim

        self.assertEqual(totalRewards, pytest.approx(totalClaim,0.01))
        self.assertEqual(totalRewards, storageTotalRewards)
        self.assertEqual(newBlocksPerMinute, storageBlocksPerMinute)
        self.assertNotEqual(currentRewardPerBlock, storageRewardPerBlock)
        self.assertNotEqual(totalBlocks, storageTotalBlocks)

        print('----')
        print('✅ Council should be to call updateBlocksPerMinute entrypoint')
        print('blocksPerMinute:')
        print(storageBlocksPerMinute)
        print('new totalBlocks:')
        print(storageTotalBlocks)
        print('new currentRewardPerBlock:')
        print(storageRewardPerBlock)
        print('total rewards claim:')
        print(totalClaim)

    def test_72_non_council_update_blocks_per_minute(self):
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial values
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        blocksPerMinute             = 2
        newBlocksPerMinute          = 3

        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)

        # Operation
        with self.raisesMichelsonError(error_only_council):
            res = self.farmContract.updateBlocksPerMinute(newBlocksPerMinute).interpret(storage=res.storage, source=bob)
            storageBlocksPerMinute = res.storage["blocksPerMinute"]
            storageTotalBlocks = res.storage['plannedRewards']["totalBlocks"]
            storageRewardPerBlock = res.storage['plannedRewards']["currentRewardPerBlock"]
            self.assertEqual(blocksPerMinute,storageBlocksPerMinute)
            self.assertEqual(currentRewardPerBlock,storageRewardPerBlock)
            self.assertEqual(totalBlocks,storageTotalBlocks)
        print('----')
        print('✅ Non-council should not be to call updateBlocksPerMinute entrypoint')
        print('blocksPerMinute:')
        print(blocksPerMinute)

    def test_73_council_update_blocks_per_minute_farm_non_init(self):
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial values
        newBlocksPerMinute          = 3

        # Operation
        with self.raisesMichelsonError(error_farm_not_init):
            res = self.farmContract.updateBlocksPerMinute(newBlocksPerMinute).interpret(storage=init_farm_storage, source=councilAddress)
            storageBlocksPerMinute = res.storage["blocksPerMinute"]
            storageTotalBlocks = res.storage['plannedRewards']["totalBlocks"]
            storageRewardPerBlock = res.storage['plannedRewards']["currentRewardPerBlock"]
            self.assertEqual(0,storageBlocksPerMinute)
            self.assertEqual(0,storageRewardPerBlock)
            self.assertEqual(0,storageTotalBlocks)
        print('----')
        print('✅ Council should not be to call updateBlocksPerMinute entrypoint if the farm has not yet been initiated')
        print('blocksPerMinute:')
        print(0)

    def test_74_update_blocks_per_minute_infinite_farm(self):
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial values
        totalBlocks                         = 0
        currentRewardPerBlock               = self.MVK(500)
        blocksPerMinute                     = 2
        newBlocksPerMinute                  = 3

        # Reward proportionnality testing
        expectedRewardsForFiveMinutes       = 10 * currentRewardPerBlock # For 2BPM
        blocksForTwoMinutes                 = 4 # For 2BPM
        blocksForThreeMinutes               = 9 # For 9BPM

        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": True
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Some tests operations to see if the total rewards are affected
        res = self.farmContract.deposit(self.MVK(2)).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)

        # Operation
        res = self.farmContract.updateBlocksPerMinute(newBlocksPerMinute).interpret(storage=res.storage, source=councilAddress, level=lastBlockUpdate+blocksForTwoMinutes)
        storageBlocksPerMinute = res.storage["blocksPerMinute"]
        storageRewardPerBlock = res.storage['plannedRewards']["currentRewardPerBlock"]

        # Some tests operations to see if the total rewards are affected
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate+blocksForThreeMinutes+blocksForTwoMinutes)
        aliceClaim = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        self.assertNotEqual(currentRewardPerBlock, storageRewardPerBlock)
        self.assertEqual(aliceClaim, pytest.approx(expectedRewardsForFiveMinutes, 0.01))

        print('----')
        print('✅ Infinite farm should be to update its blocks per minute')
        print('blocksPerMinute:')
        print(storageBlocksPerMinute)
        print('new currentRewardPerBlock:')
        print(storageRewardPerBlock)
        print('total rewards claim:')
        print(aliceClaim)

    ###
    ## %closeFarm
    ###
    def test_80_admin_can_close_farm(self):
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial values
        totalBlocks     = 100
        currentRewardPerBlock  = 1000
        blocksPerMinute = 2
        userDepositAmount          = 2

        # Init farm operation
        res = self.farmInfiniteContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # New values
        farmOpen = res.storage['open'];

        # Test operations
        res = self.farmContract.deposit(userDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate+50)
        userClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        # Close Farm operation
        res = self.farmContract.closeFarm().interpret(storage=res.storage, source=alice, level=lastBlockUpdate+50)
        farmClose = res.storage['open'];

        # Final tests operations
        with self.raisesMichelsonError(error_farm_closed):
            res = self.farmContract.deposit(userDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate+51)
        
        res = self.farmContract.withdraw(userDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate+51)
        userWithdraw = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

        with self.raisesMichelsonError(error_no_unclaimed_rewards):
            res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate+51)

        suspectedRewards = (lastBlockUpdate+50-lastBlockUpdate) * currentRewardPerBlock

        self.assertNotEqual(farmOpen,farmClose)
        self.assertEqual(userClaimedRewards,suspectedRewards)
        self.assertEqual(userWithdraw,userDepositAmount)

        print('----')
        print('✅ Admin should be able to close a farm')
        print('totalBlocks:')
        print(totalBlocks)
        print('currentRewardPerBlock:')
        print(currentRewardPerBlock)
        print('farm open:')
        print(farmClose)
        print('farm closed at block:')
        print(50)
        print('claimed rewards:')
        print(userClaimedRewards)

    def test_81_non_admin_cant_close_farm(self):
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial values
        totalBlocks     = 100
        currentRewardPerBlock  = 1000
        blocksPerMinute = 2
        userDepositAmount          = 2

        # Init farm operation
        res = self.farmInfiniteContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Test operations
        res = self.farmContract.deposit(userDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate+50)
        userClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        # Close Farm operation
        with self.raisesMichelsonError(error_only_administrator):
            res = self.farmContract.closeFarm().interpret(storage=res.storage, source=bob, level=lastBlockUpdate+50)

        # Final tests operations
        res = self.farmContract.deposit(userDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate+51)        
        res = self.farmContract.withdraw(userDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate+51)
        userWithdraw = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate+51)
        userClaimedRewards += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])
        
        suspectedRewards = (lastBlockUpdate+51-lastBlockUpdate) * currentRewardPerBlock

        self.assertEqual(userClaimedRewards,suspectedRewards)
        self.assertEqual(userWithdraw,userDepositAmount)

        print('----')
        print('✅ Non-admin should not be able to close a farm')
        print('totalBlocks:')
        print(totalBlocks)
        print('currentRewardPerBlock:')
        print(currentRewardPerBlock)
        print('farm close attempt at block:')
        print(50)
        print('claimed rewards:')
        print(userClaimedRewards)

    ###
    # %increaseRewardPerBlock
    ##
    def test_90_admin_can_increase_reward_per_block(self):
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial values
        totalBlocks     = 100
        currentRewardPerBlock  = 1000
        newRewardPerBlock = 2000
        blocksPerMinute = 2
        userDepositAmount          = 2

        # Init farm operation
        res = self.farmInfiniteContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Test operations
        res = self.farmContract.deposit(userDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate+50)
        userClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        # Increase reward operation
        res = self.farmContract.increaseRewardPerBlock(newRewardPerBlock).interpret(storage=res.storage, source=alice, level=lastBlockUpdate+50)
        newStorageRewardPerBlock = res.storage['plannedRewards']['currentRewardPerBlock'];

        # Final tests operations
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate+100)
        userClaimedRewards += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])
        
        suspectedRewards = 50 * currentRewardPerBlock + newRewardPerBlock * 50

        self.assertEqual(newStorageRewardPerBlock,newRewardPerBlock)
        self.assertEqual(userClaimedRewards,suspectedRewards)

        print('----')
        print('✅ Admin should be able to increase the reward per block')
        print('totalBlocks:')
        print(totalBlocks)
        print('currentRewardPerBlock:')
        print(newStorageRewardPerBlock)
        print('claimed rewards:')
        print(userClaimedRewards)

    def test_91_admin_cant_decrease_reward_per_block(self):
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial values
        totalBlocks     = 100
        currentRewardPerBlock  = 1000
        newRewardPerBlock = 500
        blocksPerMinute = 2
        userDepositAmount          = 2

        # Init farm operation
        res = self.farmInfiniteContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Test operations
        res = self.farmContract.deposit(userDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate+50)
        userClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        # Decrease reward operation
        with self.raisesMichelsonError(error_increase_rewards_higher):
            res = self.farmContract.increaseRewardPerBlock(newRewardPerBlock).interpret(storage=res.storage, source=alice, level=lastBlockUpdate+50)

        # Final tests operations
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate+100)
        userClaimedRewards += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])
        
        storageRewardPerBlock = res.storage['plannedRewards']['currentRewardPerBlock']
        suspectedRewards = 100 * currentRewardPerBlock

        self.assertEqual(userClaimedRewards,suspectedRewards)

        print('----')
        print('✅ Admin should not be able to decrease the reward per block')
        print('totalBlocks:')
        print(totalBlocks)
        print('currentRewardPerBlock:')
        print(storageRewardPerBlock)
        print('claimed rewards:')
        print(userClaimedRewards)

    def test_92_non_admin_cant_increase_reward_per_block(self):
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial values
        totalBlocks     = 100
        currentRewardPerBlock  = 1000
        newRewardPerBlock = 2000
        blocksPerMinute = 2
        userDepositAmount          = 2

        # Init farm operation
        res = self.farmInfiniteContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Test operations
        res = self.farmContract.deposit(userDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate+50)
        userClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        # Increase reward operation
        with self.raisesMichelsonError(error_only_administrator_or_factory_not_found):
            res = self.farmContract.increaseRewardPerBlock(newRewardPerBlock).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+50)

        # Final tests operations
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate+100)
        userClaimedRewards += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])
        
        storageRewardPerBlock = res.storage['plannedRewards']['currentRewardPerBlock']
        suspectedRewards = 100 * currentRewardPerBlock

        self.assertEqual(userClaimedRewards,suspectedRewards)

        print('----')
        print('✅ Non-admin should not be able to increase the reward per block')
        print('totalBlocks:')
        print(totalBlocks)
        print('currentRewardPerBlock:')
        print(storageRewardPerBlock)
        print('claimed rewards:')
        print(userClaimedRewards)

    def test_93_extra_admin_can_increase_reward_per_block(self):
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial values
        totalBlocks     = 100
        currentRewardPerBlock  = 1000
        newRewardPerBlock = 2000
        blocksPerMinute = 2
        userDepositAmount          = 2

        # Init farm operation
        res = self.farmInfiniteContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Test operations
        res = self.farmContract.deposit(userDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)

        # Increase reward operation
        res = self.farmContract.increaseRewardPerBlock(newRewardPerBlock).interpret(storage=res.storage, source=alice, level=lastBlockUpdate+50)
        newStorageRewardPerBlock = res.storage['plannedRewards']['currentRewardPerBlock'];

        # Final tests operations
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate+100)
        userClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        suspectedRewards = 50 * currentRewardPerBlock + newRewardPerBlock * 50

        self.assertEqual(newStorageRewardPerBlock,newRewardPerBlock)
        self.assertEqual(userClaimedRewards,suspectedRewards)

        print('----')
        print('✅ Admin should be able to increase the reward per block and user should be able to claim form the two different rewards')
        print('totalBlocks:')
        print(totalBlocks)
        print('currentRewardPerBlock:')
        print(newStorageRewardPerBlock)
        print('claimed rewards:')
        print(userClaimedRewards)
    
    ###
    # INFINITE FARM
    ##
    def test_infinite_farm(self):
        init_infinite_farm_storage = deepcopy(self.farmInfiniteStorage)

        # Initial parameters
        totalBlocks     = 0
        currentRewardPerBlock  = 1000
        blocksPerMinute = 2
        aliceDepositAmount          = 2
        bobDepositAmount            = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        
        # Init farm operation
        res = self.farmInfiniteContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "blocksPerMinute": blocksPerMinute,
            "forceRewardFromTransfer": False,
            "infinite": True
        }).interpret(storage=init_infinite_farm_storage, source=alice)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # First deposit
        res = self.farmContract.deposit(aliceDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate)
        res = self.farmContract.deposit(bobDepositAmount).interpret(storage=res.storage, sender=bob, level=lastBlockUpdate)

        # First claim
        res = self.farmContract.claim().interpret(storage=res.storage, source=alice, level=lastBlockUpdate+10000)
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        # Second deposit
        res = self.farmContract.deposit(aliceDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+12500)

        # Second claim
        res = self.farmContract.claim().interpret(storage=res.storage, sender=bob, level=lastBlockUpdate+1500000)
        bobClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        # Third deposit
        res = self.farmContract.deposit(aliceDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate+1500500)

        # Final claim
        res = self.farmContract.claim().interpret(storage=res.storage, sender=alice, level=lastBlockUpdate+2000000)
        aliceUnclaimedRewards = res.storage['delegators'][alice]['unclaimedRewards']
        aliceClaimedRewards += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        res = self.farmContract.claim().interpret(storage=res.storage, sender=bob, level=lastBlockUpdate+2000000)
        bobUnclaimedRewards = res.storage['delegators'][bob]['unclaimedRewards']
        bobClaimedRewards += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        totalClaimedRewards = aliceClaimedRewards + bobClaimedRewards
        suspectedRewards = (lastBlockUpdate+2000000-lastBlockUpdate) * currentRewardPerBlock

        storageInfinite = res.storage['infinite']

        self.assertEqual(aliceUnclaimedRewards,0)
        self.assertEqual(bobUnclaimedRewards,0)
        self.assertEqual(totalClaimedRewards,pytest.approx(suspectedRewards,0.001))
        print('----')
        print('✅ Infinite farm test')
        print('total claimed rewards:')
        print(totalClaimedRewards)
        print('infinite farm:')
        print(storageInfinite)