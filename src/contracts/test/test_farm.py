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
import error_codes

# set to localhost sandbox mode for testing
pytezos = pytezos.using(shell='http://localhost:8732', key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq')

twoUp =  os.path.abspath(os.path.join('__file__' ,"../../"))
rootDir = os.path.abspath(os.curdir)
fileDir = os.path.dirname(os.path.realpath('__file__'))

print('fileDir: '+fileDir)

helpersDir          = os.path.join(fileDir, 'helpers')
mvnTokenDecimals = os.path.join(helpersDir, 'mvnTokenDecimals.json')
mvnTokenDecimals = open(mvnTokenDecimals)
mvnTokenDecimals = json.load(mvnTokenDecimals)
mvnTokenDecimals = mvnTokenDecimals['decimals']

deploymentsDir          = os.path.join(fileDir, 'deployments')
deployedFarmContract = os.path.join(deploymentsDir, 'farmAddress.json')
deployedFarmFA2Contract = os.path.join(deploymentsDir, 'farmFA2Address.json')
deployedFarmInfiniteContract = os.path.join(deploymentsDir, 'farmInfiniteAddress.json')
deployedMvnTokenContract = os.path.join(deploymentsDir, 'mvnTokenAddress.json')
deployedLpTokenContract = os.path.join(deploymentsDir, 'lpTokenAddress.json')
deployedCouncilContract = os.path.join(deploymentsDir, 'councilAddress.json')
deployedDoormanContract = os.path.join(deploymentsDir, 'doormanAddress.json')
deployedGovernanceContract = os.path.join(deploymentsDir, 'governanceAddress.json')

deployedFarm = open(deployedFarmContract)
farmContractAddress = json.load(deployedFarm)
farmContractAddress = farmContractAddress['address']

deployedFarmFA2 = open(deployedFarmFA2Contract)
farmFA2ContractAddress = json.load(deployedFarmFA2)
farmFA2ContractAddress = farmFA2ContractAddress['address']

deployedFarmInfinite = open(deployedFarmContract)
farmInfiniteContractAddress = json.load(deployedFarmInfinite)
farmInfiniteContractAddress = farmInfiniteContractAddress['address']

deployedMvnToken = open(deployedMvnTokenContract)
mvnTokenAddress = json.load(deployedMvnToken)
mvnTokenAddress = mvnTokenAddress['address']

deployedLpToken = open(deployedLpTokenContract)
lpTokenAddress = json.load(deployedLpToken)
lpTokenAddress = lpTokenAddress['address']

deployedCouncil = open(deployedCouncilContract)
councilAddress = json.load(deployedCouncil)
councilAddress = councilAddress['address']

deployedDoorman = open(deployedDoormanContract)
doormanAddress = json.load(deployedDoorman)
doormanAddress = doormanAddress['address']

deployedGovernance = open(deployedGovernanceContract)
governanceAddress = json.load(deployedGovernance)
governanceAddress = governanceAddress['address']

print('Farm Contract Deployed at: ' + farmContractAddress)
print('Farm FA2 Contract Deployed at: ' + farmContractAddress)
print('MVN Token Address Deployed at: ' + mvnTokenAddress)
print('LP Token Address Deployed at: ' + lpTokenAddress)

alice = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
admin = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
bob   = 'tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD'
eve   = 'tz1MnmtP4uAcgMpeZN6JtyziXeFqqwQG6yn6'
fox   = 'tz1R2oNqANNy2vZhnZBJc8iMEqW79t85Fv7L'

sec_day   = 86400
sec_week  = 604800
sec_month = 2592000 # 30 days

blocks_day = 2880
blocks_month = blocks_day * 30 # 86400 per month

TOLERANCE = 0.0001

class FarmContract(TestCase):
    
    @classmethod
    def setUpClass(cls):
        cls.farmContract = pytezos.contract(farmContractAddress)
        cls.farmStorage  = cls.farmContract.storage()
        cls.farmFA2Contract = pytezos.contract(farmFA2ContractAddress)
        cls.farmFA2Storage  = cls.farmFA2Contract.storage()
        cls.farmInfiniteContract = pytezos.contract(farmInfiniteContractAddress)
        cls.farmInfiniteStorage  = cls.farmInfiniteContract.storage()
        cls.mvnTokenContract = pytezos.contract(mvnTokenAddress)
        cls.mvnTokenStorage  = cls.mvnTokenContract.storage()
        cls.lpTokenContract = pytezos.contract(lpTokenAddress)
        cls.lpTokenStorage  = cls.lpTokenContract.storage()
        
    @contextmanager
    def raisesMichelsonError(self, error_message):
        with self.assertRaises(MichelsonRuntimeError) as r:
            yield r

        error_msg = r.exception.format_stdout()
        if "FAILWITH" in error_msg:
            self.assertEqual(f"FAILWITH: {error_message}", r.exception.format_stdout())
        else:
            self.assertEqual(f"'{error_message}': ", r.exception.format_stdout())

    # MVN Formatter
    def MVN(self, value: float = 1.0):
        return int(value * 10**int(mvnTokenDecimals))

    ######################
    # Tests for farm contract #
    ######################

    # ##
    # %initFarm
    # #
    def test_01_admin_init_farm(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalBlocks     = 100
        currentRewardPerBlock  = 1000
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)

        self.assertEqual(totalBlocks, res.storage['config']['plannedRewards']['totalBlocks'])
        self.assertEqual(currentRewardPerBlock, res.storage['config']['plannedRewards']['currentRewardPerBlock'])
        self.assertEqual(True, res.storage['open'])
        self.assertEqual(True, res.storage['init'])
        print('----')
        print('✅ Admin initialize a farm')
        print('total blocks:')
        print(res.storage['config']['plannedRewards']['totalBlocks'])
        print('rewards per block:')
        print(res.storage['config']['plannedRewards']['currentRewardPerBlock'])
        print('open:')
        print(res.storage['open'])
        print('init:')
        print(res.storage['init'])

    def test_02_non_admin_init_farm(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalBlocks     = 100
        currentRewardPerBlock  = 1000
        
        # Init farm operation
        with self.raisesMichelsonError(error_codes.error_ONLY_ADMINISTRATOR_ALLOWED):
            res = self.farmContract.initFarm({
                "currentRewardPerBlock": currentRewardPerBlock,
                "totalBlocks": totalBlocks,
                "forceRewardFromTransfer": False,
                "infinite": False
            }).interpret(storage=init_farm_storage, sender=alice)

        self.assertEqual(0, init_farm_storage['config']['plannedRewards']['totalBlocks'])
        self.assertEqual(0, init_farm_storage['config']['plannedRewards']['currentRewardPerBlock'])
        self.assertEqual(False, init_farm_storage['open'])
        self.assertEqual(False, init_farm_storage['init'])
        print('----')
        print('✅ Non-admin initialize a farm')
        print('total blocks:')
        print(init_farm_storage['config']['plannedRewards']['totalBlocks'])
        print('rewards per block:')
        print(init_farm_storage['config']['plannedRewards']['currentRewardPerBlock'])
        print('open:')
        print(init_farm_storage['open'])
        print('init:')
        print(init_farm_storage['init'])
        
    def test_03_admin_init_farm_twice(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalBlocks     = 100
        currentRewardPerBlock  = 1000
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)

        # Init farm again
        with self.raisesMichelsonError(error_codes.error_FARM_ALREADY_OPEN):
            res = self.farmContract.initFarm({
                "currentRewardPerBlock": currentRewardPerBlock,
                "totalBlocks": totalBlocks,
                "forceRewardFromTransfer": False,
                "infinite": False
            }).interpret(storage=res.storage, source=bob)

        self.assertEqual(totalBlocks, res.storage['config']['plannedRewards']['totalBlocks'])
        self.assertEqual(currentRewardPerBlock, res.storage['config']['plannedRewards']['currentRewardPerBlock'])
        self.assertEqual(True, res.storage['open'])
        self.assertEqual(True, res.storage['init'])
        print('----')
        print('✅ Admin initialize a farm twice')
        print('total blocks:')
        print(res.storage['config']['plannedRewards']['totalBlocks'])
        print('rewards per block:')
        print(res.storage['config']['plannedRewards']['currentRewardPerBlock'])
        print('open:')
        print(res.storage['open'])
        print('init:')
        print(res.storage['init'])

    def test_04_admin_init_farm_finite_no_duration(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalBlocks     = 0
        currentRewardPerBlock  = 1000
        
        # Init farm operation
        with self.raisesMichelsonError(error_codes.error_FARM_SHOULD_BE_INFINITE_OR_HAVE_A_DURATION):
            self.farmContract.initFarm({
                "currentRewardPerBlock": currentRewardPerBlock,
                "totalBlocks": totalBlocks,
                "forceRewardFromTransfer": False,
                "infinite": False
            }).interpret(storage=init_farm_storage, source=bob)

        print('----')
        print('✅ Admin should not be able to initialize a finite farm with no duration')

    def test_05_admin_init_farm_with_wrong_blocks_per_minute(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalBlocks     = 100
        currentRewardPerBlock  = 1000
        
        # Init farm operation
        with self.raisesMichelsonError(error_codes.error_INVALID_BLOCKS_PER_MINUTE):
            self.farmContract.initFarm({
                "currentRewardPerBlock": currentRewardPerBlock,
                "totalBlocks": totalBlocks,
                "forceRewardFromTransfer": False,
                "infinite": False
            }).interpret(storage=init_farm_storage, source=bob)

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
        with self.raisesMichelsonError(error_codes.error_FARM_NOT_INITIATED):
            self.farmContract.deposit(totalDepositAmount).interpret(storage=init_farm_storage, source=bob)

        print('----')
        print('✅ User should not be able to deposit in a non-initiated farm')

    def test_11_user_cant_deposit_in_ended_farm(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        with self.raisesMichelsonError(error_codes.error_FARM_CLOSED):
            res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+101)

        self.assertEqual(False, alice in res.storage['depositorLedger'])
        print('----')
        print('✅ User should not be able to deposit in a ended farm')

    def test_12_user_should_have_unclaimed_rewards_updated_during_deposit(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        firstDeposit                = 100
        secondDeposit               = 50
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,
            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Operations
        res = self.farmContract.deposit(firstDeposit).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        userUnclaimedReward = int(res.storage['depositorLedger'][bob]['unclaimedRewards'])
        self.assertEqual(0,userUnclaimedReward)

        res = self.farmContract.deposit(secondDeposit).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+1)
        userUnclaimedReward = int(res.storage['depositorLedger'][bob]['unclaimedRewards'])
        self.assertNotEqual(0,userUnclaimedReward)

        print('----')
        print('✅ User should have his unclaimed rewards updated during deposit')

    def test_10_alice_deposit_2_lp(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)

        self.assertEqual(totalDepositAmount, res.storage['depositorLedger'][bob]['balance'])
        print('----')
        print('✅ Alice deposits 2LP')
        print('alice deposit balance:')
        print(res.storage['depositorLedger'][bob]['balance'])

    def test_11_alice_deposit_2_lp(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)

        self.assertEqual(totalDepositAmount, res.storage['depositorLedger'][bob]['balance'])
        print('----')
        print('✅ Alice deposits 2LP')
        print('alice deposit balance:')
        print(res.storage['depositorLedger'][bob]['balance'])

    def test_12_alice_deposit_2_lp_on_fa2(self):        
        init_farm_storage = deepcopy(self.farmFA2Storage)

        # Initial parameters
        totalDepositAmount          = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000

        
        # Init farm operation
        res = self.farmFA2Contract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmFA2Contract.deposit(totalDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)

        self.assertEqual(totalDepositAmount, res.storage['depositorLedger'][bob]['balance'])
        print('----')
        print('✅ Alice deposits 2LP on a farm with FA2 LP Tokens')
        print('alice deposit balance:')
        print(res.storage['depositorLedger'][bob]['balance'])
        
    def test_13_alice_deposit_2_lp_then_2_lp_on_different_block(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        firstDepositedAmount        = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # First deposit operation
        res = self.farmContract.deposit(firstDepositedAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 20

        # Second deposit operation
        res = self.farmContract.deposit(firstDepositedAmount).interpret(storage=res.storage, source=bob, level=nextBlock)

        aliceUnclaimedRewards = res.storage['depositorLedger'][bob]['unclaimedRewards']
        suspectedRewards = (nextBlock-lastBlockUpdate) * currentRewardPerBlock
        totalDepositAmount = 2 * firstDepositedAmount

        self.assertEqual(suspectedRewards, aliceUnclaimedRewards)
        self.assertEqual(totalDepositAmount, res.storage['depositorLedger'][bob]['balance'])
        print('----')
        print('✅ Alice deposits 2LP on one block then 2 more on another block')
        print('alice deposit balance:')
        print(res.storage['depositorLedger'][bob]['balance'])
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
        with self.raisesMichelsonError(error_codes.error_FARM_NOT_INITIATED):
            self.farmContract.withdraw(totalWithdrawAmount).interpret(storage=init_farm_storage, source=bob)

        print('----')
        print('✅ User should not be able to withdraw in a non-initiated farm')

    def test_21_user_should_have_unclaimed_rewards_updated_during_withdraw(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        firstDeposit                = 100
        firstWithdraw               = 50
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Operations
        res = self.farmContract.deposit(firstDeposit).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        userUnclaimedReward = int(res.storage['depositorLedger'][bob]['unclaimedRewards'])
        self.assertEqual(0,userUnclaimedReward)

        res = self.farmContract.withdraw(firstWithdraw).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+1)
        userUnclaimedReward = int(res.storage['depositorLedger'][bob]['unclaimedRewards'])
        self.assertNotEqual(0,userUnclaimedReward)

        print('----')
        print('✅ User should have his unclaimed rewards updated during withdrawal')

    def test_22_user_cant_withdraw_if_he_never_deposited(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        firstWithdraw               = 50
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Operations
        with self.raisesMichelsonError(error_codes.error_DEPOSITOR_NOT_FOUND):
            self.farmContract.withdraw(firstWithdraw).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)

        print('----')
        print('✅ User should not be able to withdraw if he never deposited')

    def test_23_user_cant_withdraw_more_than_his_deposit(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        firstDeposit                = 100
        firstWithdraw               = 200
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Operations
        res = self.farmContract.deposit(firstDeposit).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        with self.raisesMichelsonError(error_codes.error_WITHDRAWN_AMOUNT_TOO_HIGH):
            self.farmContract.withdraw(firstWithdraw).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+1)

        print('----')
        print('✅ User should not be able to withdraw more than his deposit')

    def test_20_alice_deposit_2_lp_and_withdraw_2_lp_on_same_block(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)

        # Withdraw operation
        res = self.farmContract.withdraw(totalDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        aliceUnclaimedRewards = res.storage['depositorLedger'][bob]['unclaimedRewards']

        self.assertEqual(0, res.storage['depositorLedger'][bob]['balance'])
        self.assertEqual(0, aliceUnclaimedRewards)
        print('----')
        print('✅ Alice deposits 2LP then withdraws 2LP on the same block')
        print('alice delegated lp balance')
        print(res.storage['depositorLedger'][bob]['balance'])
        print('alice unclaimedRewards during withdrawal')
        print(aliceUnclaimedRewards)

    def test_21_alice_deposit_2_lp_and_withdraw_2_lp_on_same_block_on_fa2(self):        
        init_farm_storage = deepcopy(self.farmFA2Storage)

        # Initial parameters
        totalDepositAmount          = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000

        
        # Init farm operation
        res = self.farmFA2Contract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmFA2Contract.deposit(totalDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)

        # Withdraw operation
        res = self.farmFA2Contract.withdraw(totalDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        aliceUnclaimedRewards = res.storage['depositorLedger'][bob]['unclaimedRewards']

        self.assertEqual(0, res.storage['depositorLedger'][bob]['balance'])
        self.assertEqual(0, aliceUnclaimedRewards)
        print('----')
        print('✅ Alice deposits 2LP then withdraws 2LP on the same block on a farm with FA2 LP Tokens')
        print('alice delegated lp balance')
        print(res.storage['depositorLedger'][bob]['balance'])
        print('alice unclaim rewards during withdrawal')
        print(aliceUnclaimedRewards)
        
    def test_22_alice_deposit_2_lp_and_withdraw_2_lp_on_different_blocks(self): 
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 10

        # Withdraw operation
        res = self.farmContract.withdraw(totalDepositAmount).interpret(storage=res.storage, source=bob, level=nextBlock)
        aliceUnclaimedRewards = res.storage['depositorLedger'][bob]['unclaimedRewards']

        suspectedRewards = (nextBlock-lastBlockUpdate) * currentRewardPerBlock

        self.assertEqual(0, res.storage['depositorLedger'][bob]['balance'])
        self.assertEqual(suspectedRewards, aliceUnclaimedRewards)
        print('----')
        print('✅ Alice deposits 2LP then withdraws 2LP on two different blocks')
        print('alice delegated lp balance')
        print(res.storage['depositorLedger'][bob]['balance'])
        print('alice unclaimed rewards during withdrawal')
        print(aliceUnclaimedRewards)

    def test_23_alice_deposit_2_lp_and_withdraw_1_lp_on_different_blocks(self): 
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalWithdrawAmount         = 1
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 10

        # Withdraw operation
        res = self.farmContract.withdraw(totalWithdrawAmount).interpret(storage=res.storage, source=bob, level=nextBlock)
        aliceUnclaimedRewards = res.storage['depositorLedger'][bob]['unclaimedRewards'];

        suspectedRewards = (nextBlock-lastBlockUpdate) * currentRewardPerBlock

        self.assertEqual(totalDepositAmount-totalWithdrawAmount, res.storage['depositorLedger'][bob]['balance'])
        self.assertEqual(suspectedRewards, aliceUnclaimedRewards)
        print('----')
        print('✅ Alice deposits 2LP then withdraws 1LP on two different blocks')
        print('alice delegated lp balance')
        print(res.storage['depositorLedger'][bob]['balance'])
        print('alice unclaimed rewards during withdrawal')
        print(aliceUnclaimedRewards)

    def test_25_alice_deposit_lp_before_end_and_withdraw_after_end(self): 
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        totalDepositAmount          = 2
        totalWithdrawAmount         = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit operation
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 100

        # Withdraw operation
        aliceUnclaimedRewards = 0
        res = self.farmContract.withdraw(totalWithdrawAmount).interpret(storage=res.storage, source=bob, level=nextBlock)
        aliceUnclaimedRewards = res.storage['depositorLedger'][bob]['unclaimedRewards']

        suspectedRewards = totalBlocks * currentRewardPerBlock

        self.assertEqual(0, res.storage['depositorLedger'][bob]['balance'])
        self.assertEqual(suspectedRewards, aliceUnclaimedRewards)
        print('----')
        print('✅ Alice deposits 2LP before farm ends then withdraws 2LP after farm ends')
        print('alice delegated lp balance')
        print(res.storage['depositorLedger'][bob]['balance'])
        print('alice unclaimed rewards during withdrawal')
        print(aliceUnclaimedRewards)

    # ###
    # # %claim
    # ##
    def test_30_user_cant_claim_if_farm_not_init(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Deposit operation
        with self.raisesMichelsonError(error_codes.error_FARM_NOT_INITIATED):
            self.farmContract.claim(bob).interpret(storage=init_farm_storage, source=bob, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });

        print('----')
        print('✅ User should not be able to claim in a non-initiated farm')

    def test_31_user_cant_claim_if_he_never_deposited(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Operations
        with self.raisesMichelsonError(error_codes.error_DEPOSITOR_NOT_FOUND):
            self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });

        print('----')
        print('✅ User should not be able to claim if he never deposited')
    
    def test_32_user_cant_claim_if_he_has_no_unclaimed_rewards(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        firstDeposit                = 100
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Operations
        res = self.farmContract.deposit(firstDeposit).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        with self.raisesMichelsonError(error_codes.error_NO_FARM_REWARDS_TO_CLAIM):
            self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });

        print('----')
        print('✅ User should not be able to claim if he has no unclaimed rewards')

    def test_30_alice_and_bob_deposit_2_lp_then_claim_on_two_different_blocks(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        aliceDepositAmount          = 2
        bobDepositAmount            = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Initial deposit
        res = self.farmContract.deposit(aliceDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        res = self.farmContract.deposit(bobDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 50

        # New deposit
        res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=nextBlock, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        aliceUnclaimedRewards = res.storage['depositorLedger'][bob]['unclaimedRewards']

        # breakpoint()

        aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        res = self.farmContract.claim(alice).interpret(storage=res.storage, sender=alice, level=nextBlock, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        bobUnclaimedRewards = res.storage['depositorLedger'][alice]['unclaimedRewards']
        bobClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        suspectedRewards = (nextBlock-lastBlockUpdate) * currentRewardPerBlock
        self.assertEqual(aliceDepositAmount, res.storage['depositorLedger'][bob]['balance'])
        self.assertEqual(bobDepositAmount, res.storage['depositorLedger'][alice]['balance'])
        self.assertEqual(0, aliceUnclaimedRewards)
        self.assertEqual(0, bobUnclaimedRewards)
        self.assertEqual(suspectedRewards/2, aliceClaimedRewards)
        self.assertEqual(suspectedRewards/2, bobClaimedRewards)
        print('----')
        print('✅ Alice and Bob deposit 2LP on a block then they both claim on another one')
        print('alice deposit balance:')
        print(res.storage['depositorLedger'][bob]['balance'])
        print('alice unclaimed sMVN:')
        print(aliceClaimedRewards)
        print('bob deposit balance:')
        print(res.storage['depositorLedger'][alice]['balance'])
        print('bob unclaimed sMVN:')
        print(bobClaimedRewards)

    def test_31_alice_and_bob_deposit_2_lp_then_claim_on_two_different_blocks_on_fa2(self):        
        init_farm_storage = deepcopy(self.farmFA2Storage)

        # Initial parameters
        aliceDepositAmount          = 2
        bobDepositAmount            = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000

        
        # Init farm operation
        res = self.farmFA2Contract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Initial deposit
        res = self.farmFA2Contract.deposit(aliceDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        res = self.farmFA2Contract.deposit(bobDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 50

        # New deposit
        res = self.farmFA2Contract.claim(bob).interpret(storage=res.storage, source=bob, level=nextBlock, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        aliceUnclaimedRewards = res.storage['depositorLedger'][bob]['unclaimedRewards']
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        res = self.farmFA2Contract.claim(alice).interpret(storage=res.storage, sender=alice, level=nextBlock, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        bobUnclaimedRewards = res.storage['depositorLedger'][alice]['unclaimedRewards']
        bobClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        suspectedRewards = (nextBlock-lastBlockUpdate) * currentRewardPerBlock
        self.assertEqual(aliceDepositAmount, res.storage['depositorLedger'][bob]['balance'])
        self.assertEqual(bobDepositAmount, res.storage['depositorLedger'][alice]['balance'])
        self.assertEqual(0, aliceUnclaimedRewards)
        self.assertEqual(0, bobUnclaimedRewards)
        self.assertEqual(suspectedRewards/2, aliceClaimedRewards)
        self.assertEqual(suspectedRewards/2, bobClaimedRewards)
        print('----')
        print('✅ Alice and Bob deposit 2LP on a block then they both claim on another one on a farm with FA2 LP Tokens')
        print('alice deposit balance:')
        print(res.storage['depositorLedger'][bob]['balance'])
        print('alice claimed sMVN:')
        print(aliceClaimedRewards)
        print('bob deposit balance:')
        print(res.storage['depositorLedger'][alice]['balance'])
        print('bob claimed sMVN:')
        print(bobClaimedRewards)

    def test_32_alice_and_bob_deposit_then_claim_on_different_blocks(self):        
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial parameters
        aliceDepositAmount          = 2
        bobDepositAmount            = 4
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Initial deposit
        res = self.farmContract.deposit(aliceDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 50

        res = self.farmContract.deposit(bobDepositAmount).interpret(storage=res.storage, sender=alice, level=nextBlock)
        nextBlock += 25

        # New deposit
        res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=nextBlock, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        aliceUnclaimedRewards = res.storage['depositorLedger'][bob]['unclaimedRewards']
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])
        nextBlock += 15

        res = self.farmContract.claim(alice).interpret(storage=res.storage, sender=alice, level=nextBlock, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        bobUnclaimedRewards = res.storage['depositorLedger'][bob]['unclaimedRewards']
        bobClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        aliceSuspectedRewards = math.trunc((50 * currentRewardPerBlock) + (25 * currentRewardPerBlock / 3))
        bobSuspectedRewards = math.trunc(40 * currentRewardPerBlock * 2 / 3)
        self.assertEqual(aliceDepositAmount, res.storage['depositorLedger'][bob]['balance'])
        self.assertEqual(bobDepositAmount, res.storage['depositorLedger'][alice]['balance'])
        self.assertEqual(0, aliceUnclaimedRewards)
        self.assertEqual(0, bobUnclaimedRewards)
        self.assertEqual(aliceSuspectedRewards, aliceClaimedRewards)
        self.assertEqual(bobSuspectedRewards, bobClaimedRewards)
        print('----')
        print('✅ Alice deposit 2LP on a block, Bob deposit 4LP on another block then Alice claim on another block then Bob claim on another block')
        print('alice deposit balance:')
        print(res.storage['depositorLedger'][bob]['balance'])
        print('alice claimed sMVN:')
        print(aliceClaimedRewards)
        print('bob deposit balance:')
        print(res.storage['depositorLedger'][alice]['balance'])
        print('bob claimed sMVN:')
        print(bobClaimedRewards)
        
    def test_33_alice_deposits_then_claims_on_same_blocks(self):        
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        totalDepositAmount      = 2
        totalBlocks             = 100
        currentRewardPerBlock   = 1000

        
        # Init farm
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)

        # Claim reward after one block
        aliceUnclaimedRewards = 0;
        aliceClaimedRewards = 0;
        with self.raisesMichelsonError(error_codes.error_NO_FARM_REWARDS_TO_CLAIM):
            res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate, view_results={
                governanceAddress+"%getGeneralContractOpt": doormanAddress,
            });
            aliceUnclaimedRewards = res.storage['depositorLedger'][bob]['unclaimedRewards']
            aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        suspectedRewards = 0
        
        self.assertEqual(totalDepositAmount, res.storage['depositorLedger'][bob]['balance'])
        self.assertEqual(aliceClaimedRewards, suspectedRewards)
        self.assertEqual(aliceUnclaimedRewards, suspectedRewards)
        print('----')
        print('✅ Alice claims sMVN after depositing 2LP on the same block')
        print('alice delegated lp balance')
        print(res.storage['depositorLedger'][bob]['balance'])
        print('rewards:')
        print(aliceClaimedRewards)

    
    def test_34_alice_deposits_then_withdraw_all_then_claim_on_different_blocks(self):        
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        totalDepositAmount      = 2
        totalBlocks             = 100
        currentRewardPerBlock   = 1000

        
        # Init farm
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)

        # Withdraw LP Tokens
        res = self.farmContract.withdraw(totalDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        nextBlock = 15 + lastBlockUpdate

        # Claim reward after one block
        aliceUnclaimedRewards = 0
        aliceClaimedRewards = 0
        with self.raisesMichelsonError(error_codes.error_NO_FARM_REWARDS_TO_CLAIM):
            res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=nextBlock, view_results={
                governanceAddress+"%getGeneralContractOpt": doormanAddress,
            });
            aliceUnclaimedRewards = res.storage['depositorLedger'][bob]['unclaimedRewards']
            aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        suspectedRewards = 0
        
        self.assertEqual(0, res.storage['depositorLedger'][bob]['balance'])
        self.assertEqual(aliceClaimedRewards, suspectedRewards)
        self.assertEqual(aliceUnclaimedRewards, suspectedRewards)
        print('----')
        print('✅ Alice deposits and withdraws on the same block then claim on a different block')
        print('alice delegated lp balance')
        print(res.storage['depositorLedger'][bob]['balance'])
        print('rewards:')
        print(aliceClaimedRewards)
        
    def test_35_alice_deposits_then_claims_on_different_blocks(self):        
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        totalDepositAmount      = 2
        totalBlocks             = 100
        currentRewardPerBlock   = 1000

        
        # Init farm
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 10

        # Claim reward after one block
        res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=nextBlock, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        aliceUnclaimedRewards = res.storage['depositorLedger'][bob]['unclaimedRewards']
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        suspectedRewards = (nextBlock-lastBlockUpdate) * currentRewardPerBlock

        self.assertEqual(aliceClaimedRewards, suspectedRewards)
        self.assertEqual(aliceUnclaimedRewards, 0)
        print('----')
        print('✅ Alice claims sMVN after depositing 2LP')
        print('rewards:')
        print(aliceClaimedRewards)

    def test_36_alice_deposits_then_claims_twice(self):        
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        totalDepositAmount      = 2
        totalBlocks             = 100
        currentRewardPerBlock   = 1000

        
        # Init farm
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 10

        # Claim reward after one block
        res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=nextBlock, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        aliceUnclaimedRewards = res.storage['depositorLedger'][bob]['unclaimedRewards']
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        with self.raisesMichelsonError(error_codes.error_NO_FARM_REWARDS_TO_CLAIM):
            res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=nextBlock, view_results={
                governanceAddress+"%getGeneralContractOpt": doormanAddress,
            });
            aliceUnclaimedRewards = res.storage['depositorLedger'][bob]['unclaimedRewards']
            aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        suspectedRewards = (nextBlock-lastBlockUpdate) * currentRewardPerBlock

        self.assertEqual(aliceClaimedRewards, suspectedRewards)
        self.assertEqual(aliceUnclaimedRewards, 0)
        print('----')
        print('✅ Alice claims sMVN after depositing 2LP')
        print('rewards:')
        print(aliceClaimedRewards)
        
    def test_37_alice_claims_without_having_deposit(self):        
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        totalDepositAmount      = 2
        totalBlocks             = 100
        currentRewardPerBlock   = 1000

        
        # Init farm
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Claim rewards
        aliceUnclaimedRewards = 0
        aliceClaimedRewards = 0
        with self.raisesMichelsonError(error_codes.error_DEPOSITOR_NOT_FOUND):
            res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate, view_results={
                governanceAddress+"%getGeneralContractOpt": doormanAddress,
            });
            aliceUnclaimedRewards = res.storage['depositorLedger'][bob]['unclaimedRewards']
            aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        suspectedRewards = 0

        self.assertEqual(aliceClaimedRewards, suspectedRewards)
        self.assertEqual(aliceUnclaimedRewards, suspectedRewards)
        print('----')
        print('✅ Alice claims sMVN without having deposit at all')
        print('rewards:')
        print(aliceClaimedRewards)
        
    def test_38_alice_deposits_then_withdraws_lesser_amount_then_claims_on_different_blocks(self):        
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial parameters
        totalDepositAmount      = 2
        totalWithdrawAmount     = 1
        totalBlocks             = 100
        currentRewardPerBlock   = 1000

        
        # Init farm
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens
        res = self.farmContract.deposit(totalDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        nextBlock = lastBlockUpdate + 10

        # Withdraw LP Tokens
        res = self.farmContract.withdraw(totalWithdrawAmount).interpret(storage=res.storage, source=bob, level=nextBlock)
        nextBlock += 10

        # Claim reward after one block
        res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=nextBlock, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        aliceUnclaimedRewards = res.storage['depositorLedger'][bob]['unclaimedRewards']
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        suspectedRewards = (nextBlock-lastBlockUpdate) * currentRewardPerBlock

        self.assertEqual(1, res.storage['depositorLedger'][bob]['balance'])
        self.assertEqual(suspectedRewards, aliceClaimedRewards)
        self.assertEqual(0, aliceUnclaimedRewards)
        print('----')
        print('✅ Alice deposits 2LP on a block, withdraws 1LP on another and claims on another')
        print('alice delegated lp balance')
        print(res.storage['depositorLedger'][bob]['balance'])
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

        
        # Init farm
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens
        res = self.farmContract.deposit(aliceDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate + 1)
        res = self.farmContract.deposit(eveDepositAmount).interpret(storage=res.storage, sender=eve, level=lastBlockUpdate + 20)
        res = self.farmContract.deposit(bobDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate + 50)

        # Claim reward after one block
        res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate + 1000, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        aliceUnclaimedRewards = res.storage['depositorLedger'][bob]['unclaimedRewards']
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        res = self.farmContract.claim(alice).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate + 1001, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        bobUnclaimedRewards = res.storage['depositorLedger'][alice]['unclaimedRewards']
        bobClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        res = self.farmContract.claim(eve).interpret(storage=res.storage, sender=eve, level=lastBlockUpdate + 1002, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        eveUnclaimedRewards = res.storage['depositorLedger'][eve]['unclaimedRewards']
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

        
        # Init farm
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Deposit LP Tokens and claims LP
        res = self.farmContract.deposit(aliceDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate + 1)
        res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate + 10, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        res = self.farmContract.deposit(eveDepositAmount).interpret(storage=res.storage, sender=eve, level=lastBlockUpdate + 20)
        res = self.farmContract.deposit(eveDepositAmount).interpret(storage=res.storage, sender=eve, level=lastBlockUpdate + 23)
        res = self.farmContract.deposit(bobDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate + 50)

        # Claim reward after one block
        res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate + 1000, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        aliceClaimedRewards += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        res = self.farmContract.claim(alice).interpret(storage=res.storage, sender=bob, level=lastBlockUpdate + 1001, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        bobClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        res = self.farmContract.claim(eve).interpret(storage=res.storage, sender=bob, level=lastBlockUpdate + 1002, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        eveUnclaimedRewards = res.storage['depositorLedger'][eve]['unclaimedRewards']
        eveClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        totalFarmRewards = totalBlocks * currentRewardPerBlock

        aliceUnclaimedRewards = res.storage['depositorLedger'][bob]['unclaimedRewards']
        bobUnclaimedRewards = res.storage['depositorLedger'][alice]['unclaimedRewards']
        eveUnclaimedRewards = res.storage['depositorLedger'][eve]['unclaimedRewards']
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

    ###
    # %setAdmin
    ##
    def test_50_admin_set_admin(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        previousAdmin = init_farm_storage['admin']

        # Operation
        res = self.farmContract.setAdmin(alice).interpret(storage=init_farm_storage, source=bob)

        # Check new admin
        newAdmin = res.storage['admin']

        self.assertEqual(bob, previousAdmin)
        self.assertEqual(alice, newAdmin)

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
        with self.raisesMichelsonError(error_codes.error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED):
            res = self.farmContract.setAdmin(alice).interpret(storage=init_farm_storage, sender=alice)
            # Check new admin
            newAdmin = res.storage['admin']

        self.assertEqual(bob, previousAdmin)
        self.assertEqual(bob, newAdmin)

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

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Operation
        res = self.farmContract.pauseAll().interpret(storage=res.storage, source=bob, level=lastBlockUpdate)

        # Final values
        finaldepositIsPaused = res.storage['breakGlassConfig']['depositIsPaused']
        finalwithdrawIsPaused = res.storage['breakGlassConfig']['withdrawIsPaused']
        finalclaimIsPaused = res.storage['breakGlassConfig']['claimIsPaused']

        # Tests operations
        with self.raisesMichelsonError(error_codes.error_DEPOSIT_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED):
            res = self.farmContract.deposit(depositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        
        with self.raisesMichelsonError(error_codes.error_WITHDRAW_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED):
            res = self.farmContract.withdraw(withdrawAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        
        with self.raisesMichelsonError(error_codes.error_CLAIM_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED):
            res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate, view_results={
                governanceAddress+"%getGeneralContractOpt": doormanAddress,
            });

        self.assertEqual(0, res.storage['config']['lpToken']['tokenBalance'])
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

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)

        # Operation
        with self.raisesMichelsonError(error_codes.error_ONLY_ADMIN_OR_FARM_FACTORY_CONTRACT_ALLOWED):
            res = self.farmContract.pauseAll().interpret(storage=res.storage, sender=alice)

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

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        res = self.farmContract.pauseAll().interpret(storage=res.storage, source=bob)

        # Paused values
        pausedepositIsPaused = res.storage['breakGlassConfig']['depositIsPaused']
        pausewithdrawIsPaused = res.storage['breakGlassConfig']['withdrawIsPaused']
        pauseclaimIsPaused = res.storage['breakGlassConfig']['claimIsPaused']

        # Operation
        res = self.farmContract.unpauseAll().interpret(storage=res.storage, source=bob)

        # Tests operations
        res = self.farmContract.deposit(depositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+1)
        res = self.farmContract.withdraw(withdrawAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+2)
        res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+3, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        
        # Final values
        finaldepositIsPaused = res.storage['breakGlassConfig']['depositIsPaused']
        finalwithdrawIsPaused = res.storage['breakGlassConfig']['withdrawIsPaused']
        finalclaimIsPaused = res.storage['breakGlassConfig']['claimIsPaused']

        self.assertEqual(1, res.storage['config']['lpToken']['tokenBalance'])
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

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)

        res = self.farmContract.pauseAll().interpret(storage=res.storage, source=bob)

        # Paused values
        pausedepositIsPaused = res.storage['breakGlassConfig']['depositIsPaused']
        pausewithdrawIsPaused = res.storage['breakGlassConfig']['withdrawIsPaused']
        pauseclaimIsPaused = res.storage['breakGlassConfig']['claimIsPaused']

        # Operation
        with self.raisesMichelsonError(error_codes.error_ONLY_ADMIN_OR_FARM_FACTORY_CONTRACT_ALLOWED):
            res = self.farmContract.unpauseAll().interpret(storage=res.storage, sender=alice)

        # Tests operations
        with self.raisesMichelsonError(error_codes.error_DEPOSIT_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED):
            res = self.farmContract.deposit(depositAmount).interpret(storage=res.storage, source=bob)
        
        with self.raisesMichelsonError(error_codes.error_WITHDRAW_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED):
            res = self.farmContract.withdraw(withdrawAmount).interpret(storage=res.storage, source=bob)
        
        with self.raisesMichelsonError(error_codes.error_CLAIM_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED):
            res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": doormanAddress,
            });
        
        # Final values
        finaldepositIsPaused = res.storage['breakGlassConfig']['depositIsPaused']
        finalwithdrawIsPaused = res.storage['breakGlassConfig']['withdrawIsPaused']
        finalclaimIsPaused = res.storage['breakGlassConfig']['claimIsPaused']

        self.assertEqual(0, res.storage['config']['lpToken']['tokenBalance'])
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
    # %togglePauseEntrypoint
    ##
    def test_64_admin_pause_deposit(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        depositIsPaused = init_farm_storage['breakGlassConfig']['depositIsPaused']
        depositAmount = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)

        # Operation
        res = self.farmContract.togglePauseEntrypoint({
            "toggleDeposit": True
        }).interpret(storage=res.storage, source=bob)

        # Final values
        finaldepositIsPaused = res.storage['breakGlassConfig']['depositIsPaused']

        # Tests operations
        with self.raisesMichelsonError(error_codes.error_DEPOSIT_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED):
            res = self.farmContract.deposit(depositAmount).interpret(storage=res.storage, source=bob)

        self.assertEqual(0, res.storage['config']['lpToken']['tokenBalance'])
        self.assertNotEqual(depositIsPaused, finaldepositIsPaused)

        print('----')
        print('✅ Admin should be able to pause deposit entrypoint')
        print('deposit is paused:')
        print(finaldepositIsPaused)

    def test_66_admin_pause_withdraw(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        withdrawIsPaused = init_farm_storage['breakGlassConfig']['withdrawIsPaused']
        withdrawAmount = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)

        # Operation
        res = self.farmContract.togglePauseEntrypoint({
            "toggleWithdraw": True
        }).interpret(storage=res.storage, source=bob)

        # Final values
        finalwithdrawIsPaused = res.storage['breakGlassConfig']['withdrawIsPaused']

        # Tests operations
        with self.raisesMichelsonError(error_codes.error_WITHDRAW_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED):
            res = self.farmContract.withdraw(withdrawAmount).interpret(storage=res.storage, source=bob)

        self.assertEqual(0, res.storage['config']['lpToken']['tokenBalance'])
        self.assertNotEqual(withdrawIsPaused, finalwithdrawIsPaused)

        print('----')
        print('✅ Admin should be able to pause withdraw entrypoint')
        print('withdraw is paused:')
        print(finalwithdrawIsPaused)

    def test_64_admin_pause_claim(self):
        init_farm_storage = deepcopy(self.farmStorage)

        # Initial values
        claimIsPaused = init_farm_storage['breakGlassConfig']['claimIsPaused']
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob, level=0)

        # Operation
        res = self.farmContract.deposit(2).interpret(storage=res.storage, source=bob, level=1)
        res = self.farmContract.togglePauseEntrypoint({
            "toggleClaim": True
        }).interpret(storage=res.storage, source=bob, level=2)

        # Final values
        finalclaimIsPaused = res.storage['breakGlassConfig']['claimIsPaused']

        # Tests operations
        with self.raisesMichelsonError(error_codes.error_CLAIM_ENTRYPOINT_IN_FARM_CONTRACT_PAUSED):
            res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=5, view_results={
                governanceAddress+"%getGeneralContractOpt": doormanAddress,
            });

        self.assertEqual(2, res.storage['config']['lpToken']['tokenBalance'])
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

        
        # Init farm operation
        res = self.farmContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)

        # Operation
        with self.raisesMichelsonError(error_codes.error_ONLY_ADMINISTRATOR_ALLOWED):
            res = self.farmContract.togglePauseEntrypoint({
                "toggleClaim": True
            }).interpret(storage=res.storage, sender=alice)

            # Final values
            finalclaimIsPaused = res.storage['breakGlassConfig']['claimIsPaused']

            # Tests operations
            res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": doormanAddress,
            });

            self.assertEqual(0, res.storage['config']['lpToken']['tokenBalance'])
            self.assertEqual(claimIsPaused, finalclaimIsPaused)

        print('----')
        print('✅ Non-admin should not be to pause claim entrypoint')
        print('claim is paused:')
        print(finalclaimIsPaused)

    ##
    # %closeFarm
    ##
    def test_80_admin_can_close_farm(self):
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial values
        totalBlocks     = 100
        currentRewardPerBlock  = 1000

        userDepositAmount          = 2

        # Init farm operation
        res = self.farmInfiniteContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # New values
        farmOpen = res.storage['open'];

        # Test operations
        res = self.farmContract.deposit(userDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+50, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        userClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        # Close Farm operation
        res = self.farmContract.closeFarm().interpret(storage=res.storage, source=bob, level=lastBlockUpdate+50)
        farmClose = res.storage['open'];

        # Final tests operations
        with self.raisesMichelsonError(error_codes.error_FARM_CLOSED):
            res = self.farmContract.deposit(userDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+51)
        
        res = self.farmContract.withdraw(userDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+51)
        userWithdraw = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

        with self.raisesMichelsonError(error_codes.error_NO_FARM_REWARDS_TO_CLAIM):
            res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+51, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });

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

        userDepositAmount          = 2

        # Init farm operation
        res = self.farmInfiniteContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Test operations
        res = self.farmContract.deposit(userDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+50, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        userClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        # Close Farm operation
        with self.raisesMichelsonError(error_codes.error_ONLY_ADMINISTRATOR_ALLOWED):
            res = self.farmContract.closeFarm().interpret(storage=res.storage, source=alice, level=lastBlockUpdate+50)

        # Final tests operations
        res = self.farmContract.deposit(userDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+51)        
        res = self.farmContract.withdraw(userDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+51)
        userWithdraw = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])
        res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+51, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
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

    ##
    # %increaseRewardPerBlock
    ##
    def test_90_admin_can_increase_reward_per_block(self):
        init_farm_storage = deepcopy(self.farmStorage)
        
        # Initial values
        totalBlocks     = 100
        currentRewardPerBlock  = 1000
        newRewardPerBlock = 2000

        userDepositAmount          = 2

        # Init farm operation
        res = self.farmInfiniteContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Test operations
        res = self.farmContract.deposit(userDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+50, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        userClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        # Increase reward operation
        res = self.farmContract.updateConfig({
            "updateConfigAction": 'configRewardPerBlock',
            "updateConfigNewValue": newRewardPerBlock, 
        }).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+50)
        newStorageRewardPerBlock = res.storage['config']['plannedRewards']['currentRewardPerBlock'];

        # Final tests operations
        res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+100, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
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

        userDepositAmount          = 2

        # Init farm operation
        res = self.farmInfiniteContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Test operations
        res = self.farmContract.deposit(userDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+50, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        userClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        # Decrease reward operation
        with self.raisesMichelsonError(error_codes.error_CONFIG_VALUE_ERROR):
            res = self.farmContract.updateConfig({
                "updateConfigAction": 'configRewardPerBlock',
                "updateConfigNewValue": newRewardPerBlock, 
            }).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+50)

        # Final tests operations
        res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+100, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        userClaimedRewards += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])
        
        storageRewardPerBlock = res.storage['config']['plannedRewards']['currentRewardPerBlock']
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

        userDepositAmount          = 2

        # Init farm operation
        res = self.farmInfiniteContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Test operations
        res = self.farmContract.deposit(userDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+50, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        userClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        # Increase reward operation
        with self.raisesMichelsonError(error_codes.error_ONLY_ADMINISTRATOR_ALLOWED):
            res = self.farmContract.updateConfig({
                "updateConfigAction": 'configRewardPerBlock',
                "updateConfigNewValue": newRewardPerBlock, 
            }).interpret(storage=res.storage, source=alice, level=lastBlockUpdate+50)

        # Final tests operations
        res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+100, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        userClaimedRewards += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])
        
        storageRewardPerBlock = res.storage['config']['plannedRewards']['currentRewardPerBlock']
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

        userDepositAmount          = 2

        # Init farm operation
        res = self.farmInfiniteContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": False
        }).interpret(storage=init_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # Test operations
        res = self.farmContract.deposit(userDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)

        # Increase reward operation
        res = self.farmContract.updateConfig({
            "updateConfigAction": 'configRewardPerBlock',
            "updateConfigNewValue": newRewardPerBlock, 
        }).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+50)
        newStorageRewardPerBlock = res.storage['config']['plannedRewards']['currentRewardPerBlock'];

        # Final tests operations
        res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+100, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
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

        aliceDepositAmount          = 2
        bobDepositAmount            = 2
        totalBlocks                 = 100
        currentRewardPerBlock       = 1000
        
        # Init farm operation
        res = self.farmInfiniteContract.initFarm({
            "currentRewardPerBlock": currentRewardPerBlock,
            "totalBlocks": totalBlocks,

            "forceRewardFromTransfer": False,
            "infinite": True
        }).interpret(storage=init_infinite_farm_storage, source=bob)
        lastBlockUpdate = res.storage['lastBlockUpdate']

        # First deposit
        res = self.farmContract.deposit(aliceDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate)
        res = self.farmContract.deposit(bobDepositAmount).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate)

        # First claim
        res = self.farmContract.claim(bob).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+10000, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        aliceClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        # Second deposit
        res = self.farmContract.deposit(aliceDepositAmount).interpret(storage=res.storage, source=alice, level=lastBlockUpdate+12500)

        # Second claim
        res = self.farmContract.claim(alice).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate+1500000, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        bobClaimedRewards = int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        # Third deposit
        res = self.farmContract.deposit(aliceDepositAmount).interpret(storage=res.storage, source=bob, level=lastBlockUpdate+1500500)

        # Final claim
        res = self.farmContract.claim(bob).interpret(storage=res.storage, sender=bob, level=lastBlockUpdate+2000000, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        aliceUnclaimedRewards = res.storage['depositorLedger'][bob]['unclaimedRewards']
        aliceClaimedRewards += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        res = self.farmContract.claim(alice).interpret(storage=res.storage, sender=alice, level=lastBlockUpdate+2000000, view_results={
            governanceAddress+"%getGeneralContractOpt": doormanAddress,
        });
        bobUnclaimedRewards = res.storage['depositorLedger'][alice]['unclaimedRewards']
        bobClaimedRewards += int(res.operations[-1]['parameters']['value']['args'][0]['args'][-1]['int'])

        totalClaimedRewards = aliceClaimedRewards + bobClaimedRewards
        suspectedRewards = (lastBlockUpdate+2000000-lastBlockUpdate) * currentRewardPerBlock

        storageInfinite = res.storage['config']['infinite']

        self.assertEqual(aliceUnclaimedRewards,0)
        self.assertEqual(bobUnclaimedRewards,0)
        self.assertEqual(totalClaimedRewards,pytest.approx(suspectedRewards,0.001))
        print('----')
        print('✅ Infinite farm test')
        print('total claimed rewards:')
        print(totalClaimedRewards)
        print('infinite farm:')
        print(storageInfinite)