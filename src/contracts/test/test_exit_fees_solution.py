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
deployedExitFeesSolutionContract = os.path.join(deploymentsDir, 'exitFeesSolutionAddress.json')
deployedMvkTokenContract = os.path.join(deploymentsDir, 'mvkTokenAddress.json')
deployedLpTokenContract = os.path.join(deploymentsDir, 'lpTokenAddress.json')

deployedExitFeesSolution = open(deployedExitFeesSolutionContract)
exitFeesSolutionContractAddress = json.load(deployedExitFeesSolution)
exitFeesSolutionContractAddress = exitFeesSolutionContractAddress['address']

deployedMvkToken = open(deployedMvkTokenContract)
mvkTokenAddress = json.load(deployedMvkToken)
mvkTokenAddress = mvkTokenAddress['address']

print('Exit Fees Solution Contract Deployed at: ' + exitFeesSolutionContractAddress)
print('MVK Token Address Deployed at: ' + mvkTokenAddress)

alice   = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
admin   = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
bob     = 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6'
eve     = 'tz1MnmtP4uAcgMpeZN6JtyziXeFqqwQG6yn6'
fox     = 'tz1R2oNqANNy2vZhnZBJc8iMEqW79t85Fv7L'
mallory = 'tz1TJTq4Rcx4hqCxkGnmwJRpqeDNzoEpjk6n'

sec_day   = 86400
sec_week  = 604800
sec_month = 2592000 # 30 days

blocks_day = 2880
blocks_month = blocks_day * 30 # 86400 per month

TOLERANCE = 0.0001
MVK_DECIMALS = 6

class ExitFeesSolutionContract(TestCase):
    
    @classmethod
    def setUpClass(cls):
        cls.exitFeesSolutionContract = pytezos.contract(exitFeesSolutionContractAddress)
        cls.exitFeesSolutionStorage  = cls.exitFeesSolutionContract.storage()
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
#     # Tests for exitFeesSolution contract #
#     ######################

    def test_00_user_stake(self):
        init_exit_fees_solution_storage = deepcopy(self.exitFeesSolutionStorage)

        # Alice staked amount
        totalStakeAmount = 100000;

        # Stake operation
        res = self.exitFeesSolutionContract.stake(totalStakeAmount).interpret(storage=init_exit_fees_solution_storage, sender=alice);

        # Assert: Alice stake amount == Alice sMVK balance
        self.assertEqual(totalStakeAmount, res.storage['userStakeBalanceLedger'][alice]['balance'])
        print('----')
        print('✅ Alice stakes 1000')
        print('alice stake mvk:')
        print(res.storage['userStakeBalanceLedger'][alice]['balance'])

    def test_01_user_unstake(self):
        init_exit_fees_solution_storage = deepcopy(self.exitFeesSolutionStorage)

        # Inputs
        totalStakeAmount = 100000
        totalUnstakeAmount = 100000

        # Stake operation
        res = self.exitFeesSolutionContract.stake(totalStakeAmount).interpret(storage=init_exit_fees_solution_storage, sender=alice);

        # Unstake operation
        res = self.exitFeesSolutionContract.unstake(totalUnstakeAmount).interpret(storage=res.storage, sender=alice);
        userUnstakeAmount = int(res.operations[-1]['parameters']['value'][-1]['args'][-1][-1]['args'][-1]['int']);

        # Assert: 0 == Alice sMVK balance --> because she unstaked everything
        self.assertEqual(0, res.storage['userStakeBalanceLedger'][alice]['balance'])
        # Assert: 90000 == Alice final unstake amount --> because she earned 90% of what she wanted to unstake because of the exit fee
        self.assertEqual(90000, userUnstakeAmount)
        print('----')
        print('✅ Alice unstakes 1000')
        print('alice unstake amount:')
        print(userUnstakeAmount)
        print('alice exit fee:')
        print(totalUnstakeAmount - userUnstakeAmount)
        print('mli:')
        print(res.storage['mli'])

    def test_02_multiple_user_first_scenario(self):
        init_exit_fees_solution_storage = deepcopy(self.exitFeesSolutionStorage)

        # Inputs
        aliceFirstStakeAmount      = 100000
        bobFirstStakeAmount        = 678000
        eveFirstStakeAmount        = 35000000
        foxFirstStakeAmount        = 200000
        malloryFirstStakeAmount    = 5000000

        eveFirstUnstakeAmount      = 1700000

        # Stake operations
        res = self.exitFeesSolutionContract.stake(aliceFirstStakeAmount).interpret(storage=init_exit_fees_solution_storage, sender=alice);
        res = self.exitFeesSolutionContract.stake(bobFirstStakeAmount).interpret(storage=res.storage, sender=bob);
        res = self.exitFeesSolutionContract.stake(eveFirstStakeAmount).interpret(storage=res.storage, sender=eve);
        res = self.exitFeesSolutionContract.stake(foxFirstStakeAmount).interpret(storage=res.storage, sender=fox);
        res = self.exitFeesSolutionContract.stake(malloryFirstStakeAmount).interpret(storage=res.storage, sender=mallory);

        # Unstake operation
        res = self.exitFeesSolutionContract.unstake(eveFirstUnstakeAmount).interpret(storage=res.storage, sender=eve);
        breakpoint()
        userUnstakeAmount = int(res.operations[-1]['parameters']['value'][-1]['args'][-1][-1]['args'][-1]['int']);

        # View operations
        res = self.exitFeesSolutionContract.getStakedBalance([alice,None]).interpret(storage=res.storage, sender=alice, view_results=exitFeesSolutionContractAddress+"%getStakedBalance");
        aliceSMvkCurrentBalance = int(res.operations[-1]['parameters']['value']['int']);
        res = self.exitFeesSolutionContract.getStakedBalance([bob,None]).interpret(storage=res.storage, sender=alice, view_results=exitFeesSolutionContractAddress+"%getStakedBalance");
        bobSMvkCurrentBalance = int(res.operations[-1]['parameters']['value']['int']);
        res = self.exitFeesSolutionContract.getStakedBalance([eve,None]).interpret(storage=res.storage, sender=alice, view_results=exitFeesSolutionContractAddress+"%getStakedBalance");
        eveSMvkCurrentBalance = int(res.operations[-1]['parameters']['value']['int']);
        res = self.exitFeesSolutionContract.getStakedBalance([fox,None]).interpret(storage=res.storage, sender=alice, view_results=exitFeesSolutionContractAddress+"%getStakedBalance");
        foxSMvkCurrentBalance = int(res.operations[-1]['parameters']['value']['int']);
        res = self.exitFeesSolutionContract.getStakedBalance([mallory,None]).interpret(storage=res.storage, sender=alice, view_results=exitFeesSolutionContractAddress+"%getStakedBalance");
        mallorySMvkCurrentBalance = int(res.operations[-1]['parameters']['value']['int']);

        # Predict Eve's balance without fees rewards and Eve's final unstake amount after exit fee
        eveSuspectedUnstakeMvkAmount = eveFirstUnstakeAmount - eveFirstUnstakeAmount*0.1
        eveSuspectedBalance = eveFirstStakeAmount - eveFirstUnstakeAmount

        # Calculate users fee rewards
        aliceRewards = abs(aliceSMvkCurrentBalance - aliceFirstStakeAmount)
        bobRewards = abs(bobSMvkCurrentBalance - bobFirstStakeAmount)
        eveRewards = abs(eveSMvkCurrentBalance - eveSuspectedBalance)
        foxRewards = abs(foxSMvkCurrentBalance - foxFirstStakeAmount)
        malloryRewards = abs(mallorySMvkCurrentBalance - malloryFirstStakeAmount)
        cumulatedRewards = aliceRewards + bobRewards + eveRewards + foxRewards + malloryRewards

        # Assert: Eve predicted balance == Eve current sMVK balance --> Eve didn't call the contract since her unstake so her balance has not been updated with the rewards yet
        self.assertEqual(eveSuspectedBalance, res.storage['userStakeBalanceLedger'][eve]['balance'])
        # Assert: Eve predicted unstake amount after fees removal == Eve final unstake amount --> because she earned 90% of what she wanted to unstake because of the exit fee
        self.assertEqual(eveSuspectedUnstakeMvkAmount, userUnstakeAmount)
        print('----')
        print('✅ Five users stake then one unstake')
        print('eve unstake amount:')
        print(userUnstakeAmount)
        print('eve exit fee:')
        print(eveFirstUnstakeAmount - userUnstakeAmount)
        print('users cumulated earned rewards from exit fees:')
        print(cumulatedRewards)
        print('alice sMvk balance:')
        print(aliceSMvkCurrentBalance)
        print('bob sMvk balance:')
        print(bobSMvkCurrentBalance)
        print('eve sMvk balance:')
        print(eveSMvkCurrentBalance)
        print('fox sMvk balance:')
        print(foxSMvkCurrentBalance)
        print('mallory sMvk balance:')
        print(mallorySMvkCurrentBalance)
        print('mli:')
        print(res.storage['mli'])

    def test_03_multiple_user_second_scenario(self):
        init_exit_fees_solution_storage = deepcopy(self.exitFeesSolutionStorage)

        # Inputs
        # Stage 1
        aliceFirstStakeAmount      = 100000
        bobFirstStakeAmount        = 678000
        eveFirstStakeAmount        = 35000000

        # Stage 2
        aliceFirstUnstakeAmount    = 3000
        foxFirstStakeAmount        = 200000
        bobFirstUnstakeAmount      = 678000

        # Stage 3
        malloryFirstStakeAmount    = 5000000
        eveFirstUnstakeAmount      = 1700000
        aliceSecondUnstakeAmount   = 80000

        # Stage 1 operations
        res = self.exitFeesSolutionContract.stake(aliceFirstStakeAmount).interpret(storage=init_exit_fees_solution_storage, sender=alice);
        res = self.exitFeesSolutionContract.stake(bobFirstStakeAmount).interpret(storage=res.storage, sender=bob);
        res = self.exitFeesSolutionContract.stake(eveFirstStakeAmount).interpret(storage=res.storage, sender=eve);

        # Stage 2 operations
        res = self.exitFeesSolutionContract.unstake(aliceFirstUnstakeAmount).interpret(storage=res.storage, sender=alice);
        # aliceFirstUnstakeSuspectedExitFee = aliceFirstUnstakeAmount * 0.1;
        aliceFirstUnstakeSuspectedBalance = aliceFirstStakeAmount - aliceFirstUnstakeAmount;

        res = self.exitFeesSolutionContract.stake(foxFirstStakeAmount).interpret(storage=res.storage, sender=fox);
        res = self.exitFeesSolutionContract.unstake(bobFirstUnstakeAmount).interpret(storage=res.storage, sender=bob);
        # bobFirstUnstakeSuspectedExitFee = bobFirstUnstakeAmount * 0.1;
        bobFirstUnstakeSuspectedBalance = bobFirstStakeAmount - bobFirstUnstakeAmount;

        # Stage 3 operations
        res = self.exitFeesSolutionContract.stake(malloryFirstStakeAmount).interpret(storage=res.storage, sender=mallory);
        res = self.exitFeesSolutionContract.unstake(eveFirstUnstakeAmount).interpret(storage=res.storage, sender=eve);
        # eveFirstUnstakeSuspectedExitFee = eveFirstUnstakeAmount * 0.1;
        eveFirstUnstakeSuspectedBalance = eveFirstStakeAmount - eveFirstUnstakeAmount;

        res = self.exitFeesSolutionContract.unstake(aliceSecondUnstakeAmount).interpret(storage=res.storage, sender=alice);
        # aliceSecondUnstakeSuspectedExitFee = aliceSecondUnstakeAmount * 0.1;
        aliceSecondUnstakeSuspectedBalance = aliceFirstUnstakeSuspectedBalance - aliceSecondUnstakeAmount;

        # View operations
        res = self.exitFeesSolutionContract.getStakedBalance([alice,None]).interpret(storage=res.storage, sender=alice, view_results=exitFeesSolutionContractAddress+"%getStakedBalance");
        aliceSMvkCurrentBalance = int(res.operations[-1]['parameters']['value']['int']);
        res = self.exitFeesSolutionContract.getStakedBalance([bob,None]).interpret(storage=res.storage, sender=alice, view_results=exitFeesSolutionContractAddress+"%getStakedBalance");
        bobSMvkCurrentBalance = int(res.operations[-1]['parameters']['value']['int']);
        res = self.exitFeesSolutionContract.getStakedBalance([eve,None]).interpret(storage=res.storage, sender=alice, view_results=exitFeesSolutionContractAddress+"%getStakedBalance");
        eveSMvkCurrentBalance = int(res.operations[-1]['parameters']['value']['int']);
        res = self.exitFeesSolutionContract.getStakedBalance([fox,None]).interpret(storage=res.storage, sender=alice, view_results=exitFeesSolutionContractAddress+"%getStakedBalance");
        foxSMvkCurrentBalance = int(res.operations[-1]['parameters']['value']['int']);
        res = self.exitFeesSolutionContract.getStakedBalance([mallory,None]).interpret(storage=res.storage, sender=alice, view_results=exitFeesSolutionContractAddress+"%getStakedBalance");
        mallorySMvkCurrentBalance = int(res.operations[-1]['parameters']['value']['int']);

        # Calculate users fee rewards and the reward prediction
        aliceRewards = abs(aliceSMvkCurrentBalance - aliceSecondUnstakeSuspectedBalance)
        bobRewards = abs(bobSMvkCurrentBalance - bobFirstUnstakeSuspectedBalance)
        eveRewards = abs(eveSMvkCurrentBalance - eveFirstUnstakeSuspectedBalance)
        foxRewards = abs(foxSMvkCurrentBalance - foxFirstStakeAmount)
        malloryRewards = abs(mallorySMvkCurrentBalance - malloryFirstStakeAmount)
        cumulatedRewards = aliceRewards + bobRewards + eveRewards + foxRewards + malloryRewards
        # cumulatedRewardsPrediction = int(aliceFirstUnstakeSuspectedExitFee + bobFirstUnstakeSuspectedExitFee + eveFirstUnstakeSuspectedExitFee + aliceSecondUnstakeSuspectedExitFee)

        # Assert: predicted users total rewards == actual users total rewards with a precision of 1% (because of divisinsa and floating point in smart contract)
        # self.assertEqual(pytest.approx(cumulatedRewardsPrediction,0.01),cumulatedRewards)
        print('----')
        print('✅ Five users stake then one unstake')
        print('users cumulated earned rewards from exit fees:')
        # print(cumulatedRewardsPrediction)
        # print('cumulated rewards prediction:')
        print(cumulatedRewards)
        print('alice sMvk balance:')
        print(aliceSMvkCurrentBalance)
        print('bob sMvk balance:')
        print(bobSMvkCurrentBalance)
        print('eve sMvk balance:')
        print(eveSMvkCurrentBalance)
        print('fox sMvk balance:')
        print(foxSMvkCurrentBalance)
        print('mallory sMvk balance:')
        print(mallorySMvkCurrentBalance)
        print('staked total supply:')
        print(res.storage['stakedMvkTotalSupply'])
        print('mli:')
        print(res.storage['mli'])

    def test_04_compound_interests(self):
        init_exit_fees_solution_storage = deepcopy(self.exitFeesSolutionStorage)

        # Inputs
        aliceStakeAmount = 100000
        bobStakeAmount = 100000
        eveStakeAmount = 100000
        foxStakeAmount = 100000

        eveUnstakeAmount = 100000
        foxUnstakeAmount = 100000

        # Stage 1
        res = self.exitFeesSolutionContract.stake(aliceStakeAmount).interpret(storage=init_exit_fees_solution_storage, sender=alice);
        res = self.exitFeesSolutionContract.stake(eveStakeAmount).interpret(storage=res.storage, sender=eve);

        # Stage 2
        res = self.exitFeesSolutionContract.unstake(eveUnstakeAmount).interpret(storage=res.storage, sender=eve);
        res = self.exitFeesSolutionContract.stake(bobStakeAmount).interpret(storage=res.storage, sender=bob);

        # Stage 3
        res = self.exitFeesSolutionContract.stake(foxStakeAmount).interpret(storage=res.storage, sender=fox);
        res = self.exitFeesSolutionContract.unstake(foxUnstakeAmount).interpret(storage=res.storage, sender=fox);

        # Stage 4
        # View operations
        res = self.exitFeesSolutionContract.getStakedBalance([alice,None]).interpret(storage=res.storage, sender=alice, view_results=exitFeesSolutionContractAddress+"%getStakedBalance");
        aliceSMvkCurrentBalance = int(res.operations[-1]['parameters']['value']['int']);
        res = self.exitFeesSolutionContract.getStakedBalance([bob,None]).interpret(storage=res.storage, sender=alice, view_results=exitFeesSolutionContractAddress+"%getStakedBalance");
        bobSMvkCurrentBalance = int(res.operations[-1]['parameters']['value']['int']);
        res = self.exitFeesSolutionContract.getStakedBalance([eve,None]).interpret(storage=res.storage, sender=alice, view_results=exitFeesSolutionContractAddress+"%getStakedBalance");
        eveSMvkCurrentBalance = int(res.operations[-1]['parameters']['value']['int']);
        res = self.exitFeesSolutionContract.getStakedBalance([fox,None]).interpret(storage=res.storage, sender=alice, view_results=exitFeesSolutionContractAddress+"%getStakedBalance");
        foxSMvkCurrentBalance = int(res.operations[-1]['parameters']['value']['int']);

        print('----')
        print('❌ Compound rewards calculation')
        print('alice sMvk balance:')
        print(aliceSMvkCurrentBalance)
        print('bob sMvk balance:')
        print(bobSMvkCurrentBalance)
        print('eve sMvk balance:')
        print(eveSMvkCurrentBalance)
        print('fox sMvk balance:')
        print(foxSMvkCurrentBalance)
        print('staked total supply:')
        print(res.storage['stakedMvkTotalSupply'])
        print('mli:')
        print(res.storage['mli'])