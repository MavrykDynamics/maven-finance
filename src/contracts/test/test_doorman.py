from unittest import TestCase
from contextlib import contextmanager
from copy import deepcopy
from pytezos import ContractInterface, MichelsonRuntimeError, pytezos
from pytezos.michelson.types.big_map import big_map_diff_to_lazy_diff
from pytezos.operation.result import OperationResult
from pytezos.contract.result import ContractCallResult
import time
import json 
import logging
import pytest
import os 
# import os.path as path

# set to localhost sandbox mode for testing
pytezos = pytezos.using(shell='http://localhost:8732', key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq')

# print(pytezos.using(shell='http://localhost:20000', key='edpkvGfYw3LyB1UcCahKQk4rF2tvbMUk8GFiTuMjL75uGXrpvKXhjn'))
# pytezos.using(shell='http://localhost:20000', key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq').activate_account

twoUp =  os.path.abspath(os.path.join('__file__' ,"../../"))
rootDir = os.path.abspath(os.curdir)
fileDir = os.path.dirname(os.path.realpath('__file__'))
print('root dir: '+rootDir)
print('file dlr: '+fileDir)
print('two up: '+ twoUp)

helpersDir          = os.path.join(fileDir, 'helpers')
mvkTokenDecimals = os.path.join(helpersDir, 'mvkTokenDecimals.json')
mvkTokenDecimals = open(mvkTokenDecimals)
mvkTokenDecimals = json.load(mvkTokenDecimals)
mvkTokenDecimals = mvkTokenDecimals['decimals']

deploymentsDir          = os.path.join(fileDir, 'deployments')
deployedDoormanContract = os.path.join(deploymentsDir, 'doormanAddress.json')
deployedMvkTokenContract = os.path.join(deploymentsDir, 'mvkTokenAddress.json')
deployedDelegationContract = os.path.join(deploymentsDir, 'delegationAddress.json')

deployedDoorman = open(deployedDoormanContract)
doormanContractAddress = json.load(deployedDoorman)
doormanContractAddress = doormanContractAddress['address']

deployedMvkToken = open(deployedMvkTokenContract)
mvkTokenAddress = json.load(deployedMvkToken)
mvkTokenAddress = mvkTokenAddress['address']

deployedDelegation = open(deployedDelegationContract)
delegationAddress = json.load(deployedDelegation)
delegationAddress = delegationAddress['address']

print('Doorman Contract Deployed at: ' + doormanContractAddress)
print('MVK Token Contract Deployed at: ' + mvkTokenAddress)
print('Delegation Contract Deployed at: ' + delegationAddress)

alice = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
admin = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
bob = 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6'
eve = 'tz1MnmtP4uAcgMpeZN6JtyziXeFqqwQG6yn6'
fox = 'tz1R2oNqANNy2vZhnZBJc8iMEqW79t85Fv7L'

sec_week = 604800

error_only_administrator = 'Error. Only the administrator can call this entrypoint.'
error_only_mvk_can_call = 'Error. Only the MVK Token Contract can call this entrypoint.'
error_stake_paused = 'Stake entrypoint is paused.'
error_unstake_paused = 'Unstake entrypoint is paused.'
error_compound_paused = 'Compound entrypoint is paused.'
error_only_delegation = 'Error. Only the Delegation Contract can call this entrypoint.'
error_mvk_contract_not_found = 'Error. MVK Token Contract is not found.'
error_delegation_contract_not_found = 'Error. Delegation Contract is not found.'

class DoormanContract(TestCase):
    
    @classmethod
    def setUpClass(cls):
        cls.doormanContract = pytezos.contract(doormanContractAddress)
        cls.doormanStorage  = cls.doormanContract.storage()
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

    # MVK Formatter
    def MVK(self, value = 1):
        return value * 10**int(mvkTokenDecimals)

#     ######################
#     # Tests for doorman contract #
#     ######################

    ###
    # %setAdmin
    ##
    def test_00_admin_set_admin(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        previousAdmin = init_doorman_storage['admin']

        # Operation
        res = self.doormanContract.setAdmin(bob).interpret(storage=init_doorman_storage, sender=alice)

        # Check new admin
        newAdmin = res.storage['admin']

        self.assertEqual(alice, previousAdmin)
        self.assertEqual(bob, newAdmin)

        print('----')
        print('✅ Admin tries to set another admin')
        print('previous admin:')
        print(previousAdmin)
        print('new admin:')
        print(newAdmin)

    def test_01_non_admin_set_admin(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        previousAdmin = init_doorman_storage['admin']
        newAdmin = previousAdmin

        # Operation
        with self.raisesMichelsonError(error_only_administrator):
            res = self.doormanContract.setAdmin(bob).interpret(storage=init_doorman_storage, sender=bob)
            # Check new admin
            newAdmin = res.storage['admin']

        self.assertEqual(alice, previousAdmin)
        self.assertEqual(alice, newAdmin)

        print('----')
        print('✅ Non-admin tries to set another admin')
        print('previous admin:')
        print(previousAdmin)
        print('new admin:')
        print(newAdmin)

    ###
    # %setTempMvkTotalSupply
    ##
    def test_10_mvk_contract_set_total_supply(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        initialTotalSupply = self.MVK(100)
        previousTotalSupply = init_doorman_storage['tempMvkTotalSupply']
        testTotalSupply = self.MVK(9000000)

        # Operation
        res = self.doormanContract.setTempMvkTotalSupply(testTotalSupply).interpret(storage=init_doorman_storage, sender=mvkTokenAddress)

        # Check new totak supply
        newTotalSupply = res.storage['tempMvkTotalSupply']

        self.assertEqual(initialTotalSupply, previousTotalSupply)
        self.assertEqual(testTotalSupply, newTotalSupply)

        print('----')
        print('✅ MVK Token contract tries to set doorman new mvk total supply')
        print('previous total supply:')
        print(previousTotalSupply)
        print('new total supply:')
        print(newTotalSupply)

    def test_11_other_contract_set_total_supply(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        initialTotalSupply = self.MVK(100)
        previousTotalSupply = init_doorman_storage['tempMvkTotalSupply']
        testTotalSupply = self.MVK(900000)
        newTotalSupply = self.MVK(100)

        # Operation
        with self.raisesMichelsonError(error_only_mvk_can_call):
            res = self.doormanContract.setTempMvkTotalSupply(testTotalSupply).interpret(storage=init_doorman_storage, sender=alice)

            # Check new totak supply
            newTotalSupply = res.storage['tempMvkTotalSupply']

        self.assertEqual(initialTotalSupply, previousTotalSupply)
        self.assertEqual(initialTotalSupply, newTotalSupply)

        print('----')
        print('✅ Another contract tries to set doorman new mvk total supply')
        print('previous total supply:')
        print(previousTotalSupply)
        print('new total supply:')
        print(newTotalSupply)

    ###
    # %pauseAll
    ##
    def test_20_admin_call_entrypoint(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeIsPaused = init_doorman_storage['breakGlassConfig']['stakeIsPaused']
        unstakeIsPaused = init_doorman_storage['breakGlassConfig']['unstakeIsPaused']
        compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']
        stakeAmount = self.MVK(2)
        unstakeAmount = self.MVK()

        # Operation
        res = self.doormanContract.pauseAll().interpret(storage=init_doorman_storage, sender=alice)

        # Final values
        finalStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']
        finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']
        finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']

        # Tests operations
        with self.raisesMichelsonError(error_stake_paused):
            res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=alice)
        
        with self.raisesMichelsonError(error_unstake_paused):
            res = self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=alice)
        
        with self.raisesMichelsonError(error_compound_paused):
            res = self.doormanContract.compound().interpret(storage=res.storage, sender=alice)

        self.assertEqual(0, res.storage['stakedMvkTotalSupply'])
        self.assertNotEqual(stakeIsPaused, finalStakeIsPaused)
        self.assertNotEqual(unstakeIsPaused, finalUnstakeIsPaused)
        self.assertNotEqual(compoundIsPaused, finalCompoundIsPaused)

        print('----')
        print('✅ Admin tries to pause all entrypoints')
        print('stake is paused:')
        print(finalStakeIsPaused)
        print('unstake is paused:')
        print(finalUnstakeIsPaused)
        print('compound is paused:')
        print(finalCompoundIsPaused)

    def test_21_non_admin_call_entrypoint(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeIsPaused = init_doorman_storage['breakGlassConfig']['stakeIsPaused']
        unstakeIsPaused = init_doorman_storage['breakGlassConfig']['unstakeIsPaused']
        compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']
        finalStakeIsPaused = stakeIsPaused
        finalUnstakeIsPaused = unstakeIsPaused
        finalCompoundIsPaused = compoundIsPaused

        # Operation
        with self.raisesMichelsonError(error_only_administrator):
            res = self.doormanContract.pauseAll().interpret(storage=init_doorman_storage, sender=bob)

            # Final values
            finalStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']
            finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']
            finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']

        self.assertEqual(stakeIsPaused, finalStakeIsPaused)
        self.assertEqual(unstakeIsPaused, finalUnstakeIsPaused)
        self.assertEqual(compoundIsPaused, finalCompoundIsPaused)

        print('----')
        print('✅ Non-admin tries to pause all entrypoints')
        print('stake is paused:')
        print(finalStakeIsPaused)
        print('unstake is paused:')
        print(finalUnstakeIsPaused)
        print('compound is paused:')
        print(finalCompoundIsPaused)

    ###
    # %unpauseAll
    ##
    def test_22_admin_call_entrypoint(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeIsPaused = init_doorman_storage['breakGlassConfig']['stakeIsPaused']
        unstakeIsPaused = init_doorman_storage['breakGlassConfig']['unstakeIsPaused']
        compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']
        stakeAmount = self.MVK(2)
        unstakeAmount = self.MVK()
        res = self.doormanContract.pauseAll().interpret(storage=init_doorman_storage, sender=alice)

        # Paused values
        pauseStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']
        pauseUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']
        pauseCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']

        # Operation
        res = self.doormanContract.unpauseAll().interpret(storage=res.storage, sender=alice)

        # Tests operations
        res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=alice)
        res = self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=alice)
        res = self.doormanContract.compound().interpret(storage=res.storage, sender=alice)
        
        # Final values
        finalStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']
        finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']
        finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']

        self.assertNotEqual(0, res.storage['stakedMvkTotalSupply'])
        self.assertNotEqual(stakeIsPaused, pauseStakeIsPaused)
        self.assertNotEqual(unstakeIsPaused, pauseUnstakeIsPaused)
        self.assertNotEqual(compoundIsPaused, pauseCompoundIsPaused)
        self.assertEqual(stakeIsPaused, finalStakeIsPaused)
        self.assertEqual(unstakeIsPaused, finalUnstakeIsPaused)
        self.assertEqual(compoundIsPaused, finalCompoundIsPaused)

        print('----')
        print('✅ Admin tries to unpause all entrypoints')
        print('stake is paused:')
        print(finalStakeIsPaused)
        print('unstake is paused:')
        print(finalUnstakeIsPaused)
        print('compound is paused:')
        print(finalCompoundIsPaused)

    def test_23_non_admin_call_entrypoint(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeIsPaused = init_doorman_storage['breakGlassConfig']['stakeIsPaused']
        unstakeIsPaused = init_doorman_storage['breakGlassConfig']['unstakeIsPaused']
        compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']
        stakeAmount = self.MVK(2)
        unstakeAmount = self.MVK()
        res = self.doormanContract.pauseAll().interpret(storage=init_doorman_storage, sender=alice)

        # Paused values
        pauseStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']
        pauseUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']
        pauseCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']

        # Operation
        with self.raisesMichelsonError(error_only_administrator):
            res = self.doormanContract.unpauseAll().interpret(storage=res.storage, sender=bob)

        # Tests operations
        with self.raisesMichelsonError(error_stake_paused):
            res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=alice)
        
        with self.raisesMichelsonError(error_unstake_paused):
            res = self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=alice)
        
        with self.raisesMichelsonError(error_compound_paused):
            res = self.doormanContract.compound().interpret(storage=res.storage, sender=alice)
        
        # Final values
        finalStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']
        finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']
        finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']

        self.assertEqual(0, res.storage['stakedMvkTotalSupply'])
        self.assertNotEqual(stakeIsPaused, pauseStakeIsPaused)
        self.assertNotEqual(unstakeIsPaused, pauseUnstakeIsPaused)
        self.assertNotEqual(compoundIsPaused, pauseCompoundIsPaused)
        self.assertNotEqual(stakeIsPaused, finalStakeIsPaused)
        self.assertNotEqual(unstakeIsPaused, finalUnstakeIsPaused)
        self.assertNotEqual(compoundIsPaused, finalCompoundIsPaused)

        print('----')
        print('✅ Non-admin tries to unpause all entrypoints')
        print('stake is paused:')
        print(finalStakeIsPaused)
        print('unstake is paused:')
        print(finalUnstakeIsPaused)
        print('compound is paused:')
        print(finalCompoundIsPaused)

    ###
    # %togglePauseStake
    ##
    def test_24_admin_pause_stake(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeIsPaused = init_doorman_storage['breakGlassConfig']['stakeIsPaused']
        stakeAmount = self.MVK(2)

        # Operation
        res = self.doormanContract.togglePauseStake().interpret(storage=init_doorman_storage, sender=alice)

        # Final values
        finalStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']

        # Tests operations
        with self.raisesMichelsonError(error_stake_paused):
            res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=alice)

        self.assertEqual(0, res.storage['stakedMvkTotalSupply'])
        self.assertNotEqual(stakeIsPaused, finalStakeIsPaused)

        print('----')
        print('✅ Admin tries to pause stake entrypoint')
        print('stake is paused:')
        print(finalStakeIsPaused)

    
    def test_25_non_admin_pause_stake(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeIsPaused = init_doorman_storage['breakGlassConfig']['stakeIsPaused']
        stakeAmount = self.MVK(2)
        finalStakeIsPaused = stakeIsPaused;

        # Operation
        with self.raisesMichelsonError(error_only_administrator):
            res = self.doormanContract.togglePauseStake().interpret(storage=init_doorman_storage, sender=bob)

            # Final values
            finalStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']

            # Tests operations
            res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=alice)

            self.assertNotEqual(0, res.storage['stakedMvkTotalSupply'])
            self.assertEqual(stakeIsPaused, finalStakeIsPaused)

        print('----')
        print('✅ Non-admin tries to pause stake entrypoint')
        print('stake is paused:')
        print(finalStakeIsPaused)

    ###
    # %togglePauseUnstake
    ##
    def test_26_admin_pause_unstake(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        unstakeIsPaused = init_doorman_storage['breakGlassConfig']['unstakeIsPaused']
        stakeAmount = self.MVK(2)
        unstakeAmount = self.MVK()

        # Operation
        res = self.doormanContract.togglePauseUnstake().interpret(storage=init_doorman_storage, sender=alice)

        # Final values
        finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']

        # Tests operations
        res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=alice)
        with self.raisesMichelsonError(error_unstake_paused):
            res = self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=alice)

        self.assertNotEqual(0, res.storage['stakedMvkTotalSupply'])
        self.assertNotEqual(unstakeIsPaused, finalUnstakeIsPaused)

        print('----')
        print('✅ Admin tries to pause stake entrypoint')
        print('unstake is paused:')
        print(finalUnstakeIsPaused)

    def test_27_non_admin_pause_unstake(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        unstakeIsPaused = init_doorman_storage['breakGlassConfig']['unstakeIsPaused']
        stakeAmount = self.MVK(2)
        unstakeAmount = self.MVK()
        finalUnstakeIsPaused = unstakeIsPaused;

        # Operation
        with self.raisesMichelsonError(error_only_administrator):
            res = self.doormanContract.togglePauseUnstake().interpret(storage=init_doorman_storage, sender=bob)

            # Final values
            finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']

            # Tests operations
            res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=alice)
            res = self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=alice)

            self.assertNotEqual(0, res.storage['stakedMvkTotalSupply'])
            self.assertEqual(unstakeIsPaused, finalUnstakeIsPaused)

        print('----')
        print('✅ Non-admin tries to pause unstake entrypoint')
        print('unstake is paused:')
        print(finalUnstakeIsPaused)

    ###
    # %togglePauseCompound
    ##
    def test_26_admin_pause_compound(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']

        # Operation
        res = self.doormanContract.togglePauseCompound().interpret(storage=init_doorman_storage, sender=alice)

        # Final values
        finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']

        # Tests operations
        with self.raisesMichelsonError(error_compound_paused):
            res = self.doormanContract.compound().interpret(storage=res.storage, sender=alice)

        self.assertEqual(0, res.storage['stakedMvkTotalSupply'])
        self.assertNotEqual(compoundIsPaused, finalCompoundIsPaused)

        print('----')
        print('✅ Admin tries to pause compound entrypoint')
        print('compound is paused:')
        print(finalCompoundIsPaused)
    
    def test_27_non_admin_pause_compound(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']
        finalCompoundIsPaused = compoundIsPaused;

        # Operation
        with self.raisesMichelsonError(error_only_administrator):
            res = self.doormanContract.togglePauseStake().interpret(storage=init_doorman_storage, sender=bob)

            # Final values
            finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']

            # Tests operations
            res = self.doormanContract.compound().interpret(storage=res.storage, sender=alice)

            self.assertNotEqual(0, res.storage['stakedMvkTotalSupply'])
            self.assertEqual(compoundIsPaused, finalCompoundIsPaused)

        print('----')
        print('✅ Non-admin tries to pause compound entrypoint')
        print('compound is paused:')
        print(finalCompoundIsPaused)

    ###
    # %getStakedBalance
    ##
    def test_30_user_get_existing_balance(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeAmount = self.MVK(2)

        # Tests operations
        res = self.doormanContract.stake(stakeAmount).interpret(storage=init_doorman_storage, sender=bob)

        # Operation
        res = self.doormanContract.getStakedBalance(bob,None).interpret(storage=res.storage, sender=alice, view_results=doormanContractAddress+"%getStakedBalance");

        # Final values
        userBalance = int(res.operations[-1]['parameters']['value']['int'])

        self.assertEqual(stakeAmount, userBalance)

        print('----')
        print('✅ User tries to get balance of a user who already staked')
        print('user balance:')
        print(userBalance)

    def test_31_user_get_unexisting_balance(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Operation
        res = self.doormanContract.getStakedBalance(bob,None).interpret(storage=init_doorman_storage, sender=alice, view_results=doormanContractAddress+"%getStakedBalance");

        # Final values
        userBalance = int(res.operations[-1]['parameters']['value']['int'])

        self.assertEqual(0, userBalance)

        print('----')
        print('✅ User tries to get balance of a user who never staked')
        print('user balance:')
        print(userBalance)

    ###
    # %getSatelliteBalance
    ##
    def test_32_delegation_get_existing_satellite_balance(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeAmount = self.MVK(2)
        satelliteName = "test_name"
        satelliteDescription = "test_description"
        satelliteImage = "test_image"
        satelliteFee = 10

        # Tests operations
        res = self.doormanContract.stake(stakeAmount).interpret(storage=init_doorman_storage, sender=bob)

        # Operation
        res = self.doormanContract.getSatelliteBalance(
            bob,
            satelliteName,
            satelliteDescription,
            satelliteImage,
            satelliteFee,
            None
        ).interpret(storage=res.storage, sender=delegationAddress, view_results=doormanContractAddress+"%getSatelliteBalance");

        # Final values
        satelliteBalance = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])
        satelliteResultName = res.operations[-1]['parameters']['value']['args'][0]['args'][0]['args'][0]['string']
        satelliteResultDescription = res.operations[-1]['parameters']['value']['args'][0]['args'][0]['args'][1]['string']
        satelliteResultImage = res.operations[-1]['parameters']['value']['args'][0]['args'][1]['string']
        satelliteResultFee = int(res.operations[-1]['parameters']['value']['args'][0]['args'][2]['int'])

        self.assertEqual(stakeAmount, satelliteBalance)
        self.assertEqual(satelliteName, satelliteResultName)
        self.assertEqual(satelliteDescription, satelliteResultDescription)
        self.assertEqual(satelliteImage, satelliteResultImage)
        self.assertEqual(satelliteFee, satelliteResultFee)

        print('----')
        print('✅ Delegation tries to get balance of a satellite who has one')
        print('satellite balance:')
        print(satelliteBalance)
        print('satellite name:')
        print(satelliteResultName)
        print('satellite description:')
        print(satelliteResultDescription)
        print('satellite image:')
        print(satelliteResultImage)
        print('satellite fee:')
        print(satelliteResultFee)

    def test_33_delegation_get_unexisting_satellite_balance(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        satelliteName = "test_name"
        satelliteDescription = "test_description"
        satelliteImage = "test_image"
        satelliteFee = 10

        # Operation
        res = self.doormanContract.getSatelliteBalance(
            bob,
            satelliteName,
            satelliteDescription,
            satelliteImage,
            satelliteFee,
            None
        ).interpret(storage=init_doorman_storage, sender=delegationAddress, view_results=doormanContractAddress+"%getSatelliteBalance");

        # Final values
        satelliteBalance = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])
        satelliteResultName = res.operations[-1]['parameters']['value']['args'][0]['args'][0]['args'][0]['string']
        satelliteResultDescription = res.operations[-1]['parameters']['value']['args'][0]['args'][0]['args'][1]['string']
        satelliteResultImage = res.operations[-1]['parameters']['value']['args'][0]['args'][1]['string']
        satelliteResultFee = int(res.operations[-1]['parameters']['value']['args'][0]['args'][2]['int'])

        self.assertEqual(0, satelliteBalance)
        self.assertEqual(satelliteName, satelliteResultName)
        self.assertEqual(satelliteDescription, satelliteResultDescription)
        self.assertEqual(satelliteImage, satelliteResultImage)
        self.assertEqual(satelliteFee, satelliteResultFee)

        print('----')
        print('✅ Delegation tries to get balance of a satellite who does not have one')
        print('satellite balance:')
        print(satelliteBalance)
        print('satellite name:')
        print(satelliteResultName)
        print('satellite description:')
        print(satelliteResultDescription)
        print('satellite image:')
        print(satelliteResultImage)
        print('satellite fee:')
        print(satelliteResultFee)

    def test_34_another_contract_get_satellite_balance(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        satelliteName = "test_name"
        satelliteDescription = "test_description"
        satelliteImage = "test_image"
        satelliteFee = 10

        # Operation
        with self.raisesMichelsonError(error_only_delegation):
            self.doormanContract.getSatelliteBalance(
                bob,
                satelliteName,
                satelliteDescription,
                satelliteImage,
                satelliteFee,
                None
            ).interpret(storage=init_doorman_storage, sender=alice, view_results=doormanContractAddress+"%getSatelliteBalance");

        print('----')
        print('✅ Another contract tries to get balance of a satellite')
    
    ###
    # %stake
    ##
    def test_40_stake_mvk_token_contract_unknown_to_doorman(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeAmount = self.MVK(2)

        # Operations
        res = self.doormanContract.updateGeneralContracts("mvkToken",mvkTokenAddress).interpret(storage=init_doorman_storage, sender=alice);
        with self.raisesMichelsonError(error_mvk_contract_not_found):
            self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=alice);

        print('----')
        print('✅ User tries to stake while doorman does not have mvkToken contract in generalContracts')

    def test_4_stake_delegation_contract_unknown_to_doorman(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeAmount = self.MVK(2)

        # Operations
        res = self.doormanContract.updateGeneralContracts("delegation",delegationAddress).interpret(storage=init_doorman_storage, sender=alice);
        with self.raisesMichelsonError(error_delegation_contract_not_found):
            self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=alice);

        print('----')
        print('✅ User tries to stake while doorman does not have delegation contract in generalContracts')

    ###
    # %unstake
    ##
    def test_50_unstake_mvk_token_contract_unknown_to_doorman(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        unstakeAmount = self.MVK(2)

        # Operations
        res = self.doormanContract.updateGeneralContracts("mvkToken",mvkTokenAddress).interpret(storage=init_doorman_storage, sender=alice);
        with self.raisesMichelsonError(error_mvk_contract_not_found):
            self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=alice);

        print('----')
        print('✅ User tries to unstake while doorman does not have mvkToken contract in generalContracts')

    ###
    # %unstakeComplete
    ##
    def test_51_mvk_contract_call_unstake_complete(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeAmount = self.MVK(2)
        unstakeAmount = self.MVK(2)

        # Operations
        res = self.doormanContract.stake(stakeAmount).interpret(storage=init_doorman_storage, sender=alice);
        res = self.doormanContract.unstakeComplete(unstakeAmount).interpret(storage=res.storage, sender=mvkTokenAddress, source=alice);

        print('----')
        print('✅ MVK Token contract tries to call unstakeComplete')

    def test_52_unstake_complete_delegation_contract_unknown_to_doorman(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeAmount = self.MVK(2)
        unstakeAmount = self.MVK(2)

        # Operations
        res = self.doormanContract.stake(stakeAmount).interpret(storage=init_doorman_storage, sender=alice);
        res = self.doormanContract.updateGeneralContracts("delegation",delegationAddress).interpret(storage=res.storage, sender=alice);
        with self.raisesMichelsonError(error_delegation_contract_not_found):
            self.doormanContract.unstakeComplete(unstakeAmount).interpret(storage=res.storage, sender=mvkTokenAddress, source=alice);

        print('----')
        print('✅ MVK Token contract tries to call unstakeComplete while doorman does not have delegation contract in generalContracts')

    def test_53_non_mvk_contract_call_unstake_complete(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeAmount = self.MVK(2)
        unstakeAmount = self.MVK(2)

        # Operations
        res = self.doormanContract.stake(stakeAmount).interpret(storage=init_doorman_storage, sender=alice);
        with self.raisesMichelsonError(error_only_mvk_can_call):
            self.doormanContract.unstakeComplete(unstakeAmount).interpret(storage=res.storage, sender=alice, source=alice);

        print('----')
        print('✅ Non-MVK Token contract tries to call unstakeComplete')

    ###
    # %compound
    ##
    def test_60_compound_delegation_contract_unknown_to_doorman(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeAmount = self.MVK(2)

        # Operations
        res = self.doormanContract.stake(stakeAmount).interpret(storage=init_doorman_storage, sender=alice);
        res = self.doormanContract.updateGeneralContracts("delegation",delegationAddress).interpret(storage=res.storage, sender=alice);
        with self.raisesMichelsonError(error_delegation_contract_not_found):
            self.doormanContract.compound().interpret(storage=res.storage, sender=alice, source=alice);

        print('----')
        print('✅ User tries to compound while doorman does not have delegation contract in generalContracts')