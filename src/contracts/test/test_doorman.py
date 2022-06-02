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
import error_codes
# import os.path as path

# set to localhost sandbox mode for testing
pytezos = pytezos.using(shell='http://localhost:8732', key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq')

# print(pytezos.using(shell='http://localhost:20000', key='edpkvGfYw3LyB1UcCahKQk4rF2tvbMUk8GFiTuMjL75uGXrpvKXhjn'))
# pytezos.using(shell='http://localhost:20000', key='edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq').activate_account

twoUp =  os.path.abspath(os.path.join('__file__' ,"../../"))
oneUp =  os.path.abspath(os.path.join('__file__' ,"../"))
rootDir = os.path.abspath(os.curdir)
fileDir = os.path.dirname(os.path.realpath('__file__'))
print('root dir: '+rootDir)
print('file dlr: '+fileDir)
print('two up: '+ twoUp)
print('one up: '+ oneUp)

helpersDir          = os.path.join(fileDir, 'helpers')
mvkTokenDecimals = os.path.join(helpersDir, 'mvkTokenDecimals.json')
mvkTokenDecimals = open(mvkTokenDecimals)
mvkTokenDecimals = json.load(mvkTokenDecimals)
mvkTokenDecimals = mvkTokenDecimals['decimals']

deploymentsDir          = os.path.join(fileDir, 'deployments')
lambdaDir               = os.path.join(oneUp, 'build/lambdas')
deployedDoormanContract = os.path.join(deploymentsDir, 'doormanAddress.json')
deployedMvkTokenContract = os.path.join(deploymentsDir, 'mvkTokenAddress.json')
deployedFarmFactoryContract = os.path.join(deploymentsDir, 'farmFactoryAddress.json')
deployedDelegationContract = os.path.join(deploymentsDir, 'delegationAddress.json')
deployedGovernanceContract = os.path.join(deploymentsDir, 'governanceAddress.json')
lambdaDoormanContract = os.path.join(deploymentsDir, 'doormanAddress.json')

deployedDoorman = open(deployedDoormanContract)
doormanContractAddress = json.load(deployedDoorman)
doormanContractAddress = doormanContractAddress['address']
lambdaDoormanContract   = os.path.join(lambdaDir, 'doormanLambdas.json')
lambdaDoorman = open(lambdaDoormanContract)
doormanLambdas = json.load(lambdaDoorman)

deployedMvkToken = open(deployedMvkTokenContract)
mvkTokenAddress = json.load(deployedMvkToken)
mvkTokenAddress = mvkTokenAddress['address']

deployedDelegation = open(deployedDelegationContract)
delegationAddress = json.load(deployedDelegation)
delegationAddress = delegationAddress['address']

deployedGovernance = open(deployedGovernanceContract)
governanceAddress = json.load(deployedGovernance)
governanceAddress = governanceAddress['address']

deployedFarmFactoryContract = open(deployedFarmFactoryContract)
farmFactoryAddress = json.load(deployedFarmFactoryContract)
farmFactoryAddress = farmFactoryAddress['address']
lambdaFarmFactoryContract   = os.path.join(lambdaDir, 'farmFactoryLambdas.json')
lambdaFarmFactory = open(lambdaFarmFactoryContract)
farmFactoryLambdas = json.load(lambdaFarmFactory)

print('Doorman Contract Deployed at: ' + doormanContractAddress)
print('MVK Token Contract Deployed at: ' + mvkTokenAddress)
print('Delegation Contract Deployed at: ' + delegationAddress)
print('Farm Factory Contract Deployed at: ' + farmFactoryAddress)

alice = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
admin = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
bob = 'tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD'
eve = 'tz1MnmtP4uAcgMpeZN6JtyziXeFqqwQG6yn6'
fox = 'tz1R2oNqANNy2vZhnZBJc8iMEqW79t85Fv7L'

sec_week = 604800

class DoormanContract(TestCase):
    
    @classmethod
    def setUpClass(cls):
        # Setup doorman 
        cls.doormanContract = pytezos.contract(doormanContractAddress)
        cls.doormanStorage  = cls.doormanContract.storage()

        # Setup MVK Token 
        cls.mvkTokenContract = pytezos.contract(mvkTokenAddress)
        cls.mvkTokenStorage  = cls.mvkTokenContract.storage()

        # Setup farm factory
        cls.farmFactoryContract = pytezos.contract(farmFactoryAddress)
        cls.farmFactoryStorage  = cls.farmFactoryContract.storage()

    @contextmanager
    def raisesMichelsonError(self, error_message):
        with self.assertRaises(MichelsonRuntimeError) as r:
            yield r

        error_msg = r.exception.format_stdout()
        if "FAILWITH" in error_msg:
            self.assertEqual(f"FAILWITH: {error_message}", r.exception.format_stdout())
        else:
            self.assertEqual(f"'{error_message}': ", r.exception.format_stdout())

    # MVK Formatter
    def MVK(self, value: float = 1.0):
        return int(value * 10**int(mvkTokenDecimals))

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
        res = self.doormanContract.setAdmin(alice).interpret(storage=init_doorman_storage, sender=bob)

        # Check new admin
        newAdmin = res.storage['admin']

        self.assertEqual(bob, previousAdmin)
        self.assertEqual(alice, newAdmin)

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
        with self.raisesMichelsonError(error_codes.error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED):
            res = self.doormanContract.setAdmin(bob).interpret(storage=init_doorman_storage, sender=alice)
            # Check new admin
            newAdmin = res.storage['admin']

        self.assertEqual(bob, previousAdmin)
        self.assertEqual(bob, newAdmin)

        print('----')
        print('✅ Non-admin tries to set another admin')
        print('previous admin:')
        print(previousAdmin)
        print('new admin:')
        print(newAdmin)

    ###
    # %pauseAll
    ##
    def test_20_admin_call_entrypoint(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeIsPaused = init_doorman_storage['breakGlassConfig']['stakeIsPaused']
        unstakeIsPaused = init_doorman_storage['breakGlassConfig']['unstakeIsPaused']
        compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']
        farmClaimIsPaused = init_doorman_storage['breakGlassConfig']['farmClaimIsPaused']
        stakeAmount = self.MVK(2)
        unstakeAmount = self.MVK()
        recipientAddress = alice
        mintedTokens = self.MVK(2)
        forceTransfer = False
        mvkTotalSupply = self.MVK(100)
        mvkMaximumSupply = self.MVK(1000)

        # Operation
        res = self.doormanContract.pauseAll().interpret(storage=init_doorman_storage, sender=bob)

        # Final values
        finalStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']
        finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']
        finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']
        finalFarmClaimIsPaused = res.storage['breakGlassConfig']['farmClaimIsPaused']

        # Tests operations
        with self.raisesMichelsonError(error_codes.error_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
            res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        
        with self.raisesMichelsonError(error_codes.error_UNSTAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
            res = self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                mvkTokenAddress+"%getTotalSupply": mvkTotalSupply,
                mvkTokenAddress+"%getBalance": self.MVK(2),
            });
        
        with self.raisesMichelsonError(error_codes.error_COMPOUND_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
            res = self.doormanContract.compound(bob).interpret(storage=res.storage, sender=bob)
        
        with self.raisesMichelsonError(error_codes.error_FARM_CLAIM_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
            res = self.doormanContract.farmClaim(recipientAddress,mintedTokens,forceTransfer).interpret(storage=init_doorman_storage, sender=bob, view_results={
                mvkTokenAddress+"%getTotalSupply": mvkTotalSupply,
                mvkTokenAddress+"%getMaximumSupply": mvkMaximumSupply,
                governanceAddress+"%getGeneralContractOpt": farmFactoryAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                farmFactoryAddress+"%checkFarmExists": True
            });

        self.assertNotEqual(stakeIsPaused, finalStakeIsPaused)
        self.assertNotEqual(unstakeIsPaused, finalUnstakeIsPaused)
        self.assertNotEqual(compoundIsPaused, finalCompoundIsPaused)
        self.assertNotEqual(farmClaimIsPaused, finalFarmClaimIsPaused)

        print('----')
        print('✅ Admin tries to pause all entrypoints')
        print('stake is paused:')
        print(finalStakeIsPaused)
        print('unstake is paused:')
        print(finalUnstakeIsPaused)
        print('compound is paused:')
        print(finalCompoundIsPaused)
        print('farmClaim is paused:')
        print(finalFarmClaimIsPaused)

    def test_21_non_admin_call_entrypoint(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeIsPaused = init_doorman_storage['breakGlassConfig']['stakeIsPaused']
        unstakeIsPaused = init_doorman_storage['breakGlassConfig']['unstakeIsPaused']
        compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']
        farmClaimIsPaused = init_doorman_storage['breakGlassConfig']['farmClaimIsPaused']
        finalStakeIsPaused = stakeIsPaused
        finalUnstakeIsPaused = unstakeIsPaused
        finalCompoundIsPaused = compoundIsPaused
        finalFarmClaimIsPaused = farmClaimIsPaused

        # Operation
        with self.raisesMichelsonError(error_codes.error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED):
            res = self.doormanContract.pauseAll().interpret(storage=init_doorman_storage, sender=alice)

            # Final values
            finalStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']
            finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']
            finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']
            finalFarmClaimIsPaused = res.storage['breakGlassConfig']['farmClaimIsPaused']

        self.assertEqual(stakeIsPaused, finalStakeIsPaused)
        self.assertEqual(unstakeIsPaused, finalUnstakeIsPaused)
        self.assertEqual(compoundIsPaused, finalCompoundIsPaused)
        self.assertEqual(farmClaimIsPaused, finalFarmClaimIsPaused)

        print('----')
        print('✅ Non-admin tries to pause all entrypoints')
        print('stake is paused:')
        print(finalStakeIsPaused)
        print('unstake is paused:')
        print(finalUnstakeIsPaused)
        print('compound is paused:')
        print(finalCompoundIsPaused)
        print('farmClaim is paused:')
        print(finalFarmClaimIsPaused)

    ###
    # %unpauseAll
    ##
    def test_22_admin_call_entrypoint(self):
        init_doorman_storage = deepcopy(self.doormanStorage)
        init_mvk_storage = deepcopy(self.mvkTokenStorage)

        # Initial values
        stakeIsPaused = init_doorman_storage['breakGlassConfig']['stakeIsPaused']
        unstakeIsPaused = init_doorman_storage['breakGlassConfig']['unstakeIsPaused']
        compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']
        farmClaimIsPaused = init_doorman_storage['breakGlassConfig']['farmClaimIsPaused']
        stakeAmount = self.MVK(2)
        unstakeAmount = self.MVK()
        res = self.doormanContract.pauseAll().interpret(storage=init_doorman_storage, sender=bob)

        # Paused values
        pauseStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']
        pauseUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']
        pauseCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']
        pauseFarmClaimIsPaused = res.storage['breakGlassConfig']['farmClaimIsPaused']

        # Operation
        res = self.doormanContract.unpauseAll().interpret(storage=res.storage, sender=bob)

        # Tests operations
        res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        res = self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                mvkTokenAddress+"%getTotalSupply": mvkTotalSupply,
                mvkTokenAddress+"%getBalance": self.MVK(2),
            });
        res = self.doormanContract.compound(bob).interpret(storage=res.storage, sender=bob)
        
        # Final values
        finalStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']
        finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']
        finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']
        finalFarmClaimIsPaused = res.storage['breakGlassConfig']['farmClaimIsPaused']

        self.assertNotEqual(stakeIsPaused, pauseStakeIsPaused)
        self.assertNotEqual(unstakeIsPaused, pauseUnstakeIsPaused)
        self.assertNotEqual(compoundIsPaused, pauseCompoundIsPaused)
        self.assertNotEqual(farmClaimIsPaused, pauseFarmClaimIsPaused)
        self.assertEqual(stakeIsPaused, finalStakeIsPaused)
        self.assertEqual(unstakeIsPaused, finalUnstakeIsPaused)
        self.assertEqual(compoundIsPaused, finalCompoundIsPaused)
        self.assertEqual(farmClaimIsPaused, finalFarmClaimIsPaused)

        print('----')
        print('✅ Admin tries to unpause all entrypoints')
        print('stake is paused:')
        print(finalStakeIsPaused)
        print('unstake is paused:')
        print(finalUnstakeIsPaused)
        print('compound is paused:')
        print(finalCompoundIsPaused)
        print('farmClaim is paused:')
        print(finalFarmClaimIsPaused)

    def test_23_non_admin_call_entrypoint(self):
        init_doorman_storage = deepcopy(self.doormanStorage)
        init_mvk_storage = deepcopy(self.mvkTokenStorage)

        # Initial values
        stakeIsPaused = init_doorman_storage['breakGlassConfig']['stakeIsPaused']
        unstakeIsPaused = init_doorman_storage['breakGlassConfig']['unstakeIsPaused']
        compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']
        farmClaimIsPaused = init_doorman_storage['breakGlassConfig']['farmClaimIsPaused']
        stakeAmount = self.MVK(2)
        unstakeAmount = self.MVK()
        recipientAddress = alice
        mintedTokens = self.MVK(2)
        forceTransfer = False
        mvkTotalSupply = self.MVK(100)
        mvkMaximumSupply = self.MVK(1000)

        # First operation
        res = self.doormanContract.pauseAll().interpret(storage=init_doorman_storage, sender=bob)

        # Paused values
        pauseStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']
        pauseUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']
        pauseCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']
        pauseFarmClaimIsPaused = res.storage['breakGlassConfig']['farmClaimIsPaused']

        # Operation
        with self.raisesMichelsonError(error_codes.error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED):
            res = self.doormanContract.unpauseAll().interpret(storage=res.storage, sender=alice)

        # Tests operations
        with self.raisesMichelsonError(error_codes.error_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
            res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        
        with self.raisesMichelsonError(error_codes.error_UNSTAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
            res = self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                mvkTokenAddress+"%getTotalSupply": mvkTotalSupply,
                mvkTokenAddress+"%getBalance": self.MVK(2),
            });
        
        with self.raisesMichelsonError(error_codes.error_COMPOUND_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
            res = self.doormanContract.compound(bob).interpret(storage=res.storage, sender=bob)
        
        with self.raisesMichelsonError(error_codes.error_FARM_CLAIM_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
            res = self.doormanContract.farmClaim(recipientAddress,mintedTokens,forceTransfer).interpret(storage=init_doorman_storage, sender=bob, view_results={
                farmFactoryAddress+"%checkFarmExists": True,
                mvkTokenAddress+"%getTotalAndMaximumSupply": (mvkTotalSupply, mvkMaximumSupply)
            });
        
        # Final values
        finalStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']
        finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']
        finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']
        finalFarmClaimIsPaused = res.storage['breakGlassConfig']['farmClaimIsPaused']

        self.assertNotEqual(stakeIsPaused, pauseStakeIsPaused)
        self.assertNotEqual(unstakeIsPaused, pauseUnstakeIsPaused)
        self.assertNotEqual(compoundIsPaused, pauseCompoundIsPaused)
        self.assertNotEqual(farmClaimIsPaused, pauseFarmClaimIsPaused)
        self.assertNotEqual(stakeIsPaused, finalStakeIsPaused)
        self.assertNotEqual(unstakeIsPaused, finalUnstakeIsPaused)
        self.assertNotEqual(farmClaimIsPaused, finalFarmClaimIsPaused)

        print('----')
        print('✅ Non-admin tries to unpause all entrypoints')
        print('stake is paused:')
        print(finalStakeIsPaused)
        print('unstake is paused:')
        print(finalUnstakeIsPaused)
        print('compound is paused:')
        print(finalCompoundIsPaused)
        print('farmClaim is paused:')
        print(finalFarmClaimIsPaused)

    ###
    # %togglePauseStake
    ##
    def test_24_admin_pause_stake(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeIsPaused = init_doorman_storage['breakGlassConfig']['stakeIsPaused']
        stakeAmount = self.MVK(2)

        # Operation
        res = self.doormanContract.togglePauseStake().interpret(storage=init_doorman_storage, sender=bob)

        # Final values
        finalStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']

        # Tests operations
        with self.raisesMichelsonError(error_codes.error_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
            res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });

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
        with self.raisesMichelsonError(error_codes.error_ONLY_ADMINISTRATOR_ALLOWED):
            res = self.doormanContract.togglePauseStake().interpret(storage=init_doorman_storage, sender=alice)

            # Final values
            finalStakeIsPaused = res.storage['breakGlassConfig']['stakeIsPaused']

            # Tests operations
            res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });

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
        init_mvk_storage = deepcopy(self.mvkTokenStorage)

        # Initial values
        unstakeIsPaused = init_doorman_storage['breakGlassConfig']['unstakeIsPaused']
        stakeAmount = self.MVK(2)
        unstakeAmount = self.MVK()

        # Operation
        res = self.doormanContract.togglePauseUnstake().interpret(storage=init_doorman_storage, sender=bob)

        # Final values
        finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']

        # Tests operations
        res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        with self.raisesMichelsonError(error_codes.error_UNSTAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
            res = self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                mvkTokenAddress+"%getTotalSupply": mvkTotalSupply,
                mvkTokenAddress+"%getBalance": self.MVK(2),
            });

        self.assertNotEqual(unstakeIsPaused, finalUnstakeIsPaused)

        print('----')
        print('✅ Admin tries to pause stake entrypoint')
        print('unstake is paused:')
        print(finalUnstakeIsPaused)

    def test_27_non_admin_pause_unstake(self):
        init_doorman_storage = deepcopy(self.doormanStorage)
        init_mvk_storage = deepcopy(self.mvkTokenStorage)

        # Initial values
        unstakeIsPaused = init_doorman_storage['breakGlassConfig']['unstakeIsPaused']
        stakeAmount = self.MVK(2)
        unstakeAmount = self.MVK()
        finalUnstakeIsPaused = unstakeIsPaused;

        # Operation
        with self.raisesMichelsonError(error_codes.error_ONLY_ADMINISTRATOR_ALLOWED):
            res = self.doormanContract.togglePauseUnstake().interpret(storage=init_doorman_storage, sender=alice)

            # Final values
            finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeIsPaused']

            # Tests operations
            res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
            res = self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                mvkTokenAddress+"%getTotalSupply": mvkTotalSupply,
                mvkTokenAddress+"%getBalance": self.MVK(2),
            });

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
        res = self.doormanContract.togglePauseCompound().interpret(storage=init_doorman_storage, sender=bob)

        # Final values
        finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']

        # Tests operations
        with self.raisesMichelsonError(error_codes.error_COMPOUND_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
            res = self.doormanContract.compound(bob).interpret(storage=res.storage, sender=bob)

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
        with self.raisesMichelsonError(error_codes.error_ONLY_ADMINISTRATOR_ALLOWED):
            res = self.doormanContract.togglePauseCompound().interpret(storage=init_doorman_storage, sender=alice)

            # Final values
            finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']

            # Tests operations
            res = self.doormanContract.compound(bob).interpret(storage=res.storage, sender=bob)

            self.assertEqual(compoundIsPaused, finalCompoundIsPaused)

        print('----')
        print('✅ Non-admin tries to pause compound entrypoint')
        print('compound is paused:')
        print(finalCompoundIsPaused)

     ###
    # %togglePauseFarmClaim
    ##
    def test_27_admin_pause_farm_claim(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        farmClaimIsPaused = init_doorman_storage['breakGlassConfig']['farmClaimIsPaused']
        recipientAddress = alice
        mintedTokens = self.MVK(2)
        forceTransfer = False
        mvkTotalSupply = self.MVK(100)
        mvkMaximumSupply = self.MVK(1000)

        # Operation
        res = self.doormanContract.togglePauseFarmClaim().interpret(storage=init_doorman_storage, sender=bob)

        # Final values
        finalFarmClaimIsPaused = res.storage['breakGlassConfig']['farmClaimIsPaused']

        # Tests operations
        with self.raisesMichelsonError(error_codes.error_FARM_CLAIM_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
            res = self.doormanContract.farmClaim(recipientAddress,mintedTokens,forceTransfer).interpret(storage=init_doorman_storage, sender=bob, view_results={
                farmFactoryAddress+"%checkFarmExists": True,
                mvkTokenAddress+"%getTotalAndMaximumSupply": (mvkTotalSupply, mvkMaximumSupply)
            });

        self.assertNotEqual(farmClaimIsPaused, finalFarmClaimIsPaused)

        print('----')
        print('✅ Admin tries to pause farmClaim entrypoint')
        print('farmClaim is paused:')
        print(finalFarmClaimIsPaused)
    
    def test_28_non_admin_pause_compound(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        farmClaimIsPaused = init_doorman_storage['breakGlassConfig']['farmClaimIsPaused']
        finalFarmClaimIsPaused = farmClaimIsPaused;
        recipientAddress = alice
        mintedTokens = self.MVK(2)
        forceTransfer = False
        mvkTotalSupply = self.MVK(100)
        mvkMaximumSupply = self.MVK(1000)

        # Operation
        with self.raisesMichelsonError(error_codes.error_ONLY_ADMINISTRATOR_ALLOWED):
            res = self.doormanContract.togglePauseStake().interpret(storage=init_doorman_storage, sender=alice)

            # Final values
            finalFarmClaimIsPaused = res.storage['breakGlassConfig']['farmClaimIsPaused']

            # Tests operations
            res = self.doormanContract.farmClaim(recipientAddress,mintedTokens,forceTransfer).interpret(storage=init_doorman_storage, sender=bob, view_results={
                farmFactoryAddress+"%checkFarmExists": True,
                mvkTokenAddress+"%getTotalAndMaximumSupply": (mvkTotalSupply, mvkMaximumSupply)
            });

            self.assertEqual(farmClaimIsPaused, finalFarmClaimIsPaused)

        print('----')
        print('✅ Non-admin tries to pause farmClaim entrypoint')
        print('farmClaim is paused:')
        print(finalFarmClaimIsPaused)
    
    ###
    # %stake
    ##
    def test_40_stake_delegation_contract_unknown_to_doorman(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeAmount = self.MVK(2)

        # Operations
        with self.raisesMichelsonError(error_codes.error_DELEGATION_CONTRACT_NOT_FOUND):
            self.doormanContract.stake( stakeAmount).interpret(storage=init_doorman_storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });

        print('----')
        print('✅ User tries to stake while doorman does not have delegation contract in generalContracts')

    ###
    # %unstake
    ##
    def test_51_mvk_contract_call_unstake(self):
        init_doorman_storage = deepcopy(self.doormanStorage)
        init_mvk_storage = deepcopy(self.mvkTokenStorage)

        # Initial values
        stakeAmount = self.MVK(2)
        unstakeAmount = self.MVK(2)
        mvkTotalSupply = self.MVK(100)

        # Operations
        res = self.doormanContract.stake(stakeAmount).interpret(storage=init_doorman_storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        res = self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                mvkTokenAddress+"%getTotalSupply": mvkTotalSupply,
                mvkTokenAddress+"%getBalance": self.MVK(2),
            });

        print('----')
        print('✅ MVK Token contract tries to call unstake')

    def test_52_unstake_delegation_contract_unknown_to_doorman(self):
        init_doorman_storage = deepcopy(self.doormanStorage)
        init_mvk_storage = deepcopy(self.mvkTokenStorage)

        # Initial values
        stakeAmount = self.MVK(2)
        unstakeAmount = self.MVK(2)
        mvkTotalSupply = self.MVK(100)

        # Operations
        res = self.doormanContract.stake(stakeAmount).interpret(storage=init_doorman_storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        res = self.doormanContract.updateGeneralContracts("delegation",delegationAddress).interpret(storage=res.storage, sender=bob);
        with self.raisesMichelsonError(error_codes.error_DELEGATION_CONTRACT_NOT_FOUND):
            self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                mvkTokenAddress+"%getTotalSupply": mvkTotalSupply,
                mvkTokenAddress+"%getBalance": self.MVK(2),
            });

        print('----')
        print('✅ MVK Token contract tries to call unstake while doorman does not have delegation contract in generalContracts')

    def test_53_non_mvk_contract_call_unstake(self):
        init_doorman_storage = deepcopy(self.doormanStorage)
        init_mvk_storage = deepcopy(self.mvkTokenStorage)

        # Initial values
        stakeAmount = self.MVK(2)
        unstakeAmount = self.MVK(2)

        # Operations
        res = self.doormanContract.stake(stakeAmount).interpret(storage=init_doorman_storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        with self.raisesMichelsonError(error_codes.error_ONLY_MVK_TOKEN_CONTRACT_ALLOWED):
            self.doormanContract.unstake(unstakeAmount).interpret(storage=res.storage, sender=bob, source=bob, view_results={
                mvkTokenAddress+"%getTotalSupply": init_mvk_storage['totalSupply'],
                delegationAddress+"%getSatelliteRewardsOpt": None,
            })

        print('----')
        print('✅ Non-MVK Token contract tries to call unstake')

    ###
    # %compound
    ##
    def test_60_compound_delegation_contract_unknown_to_doorman(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeAmount = self.MVK(2)

        # Operations
        res = self.doormanContract.stake(stakeAmount).interpret(storage=init_doorman_storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        res = self.doormanContract.updateGeneralContracts("delegation",delegationAddress).interpret(storage=res.storage, sender=bob);
        with self.raisesMichelsonError(error_codes.error_DELEGATION_CONTRACT_NOT_FOUND):
            self.doormanContract.compound(bob).interpret(storage=res.storage, sender=bob, source=bob);

        print('----')
        print('✅ User tries to compound while doorman does not have delegation contract in generalContracts')

    ###
    # %updateMinMvkAmount
    ##
    def test_70_admin_can_increase_min_mvk(self):
        init_doorman_storage = deepcopy(self.doormanStorage)
        init_mvk_storage = deepcopy(self.mvkTokenStorage)

        # Initial values
        stakeAmount = self.MVK(1)
        minAmount = init_doorman_storage['minMvkAmount']
        desiredMinAmount = self.MVK(2)

        # Operation
        res = self.doormanContract.updateMinMvkAmount(desiredMinAmount).interpret(storage=init_doorman_storage, sender=bob);

        # Test operation
        with self.raisesMichelsonError(error_codes.error_MVK_ACCESS_AMOUNT_NOT_REACHED):
            res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        
        with self.raisesMichelsonError(error_codes.error_MVK_ACCESS_AMOUNT_NOT_REACHED):
            res = self.doormanContract.unstake(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                mvkTokenAddress+"%getTotalSupply": self.MVK(100),
                mvkTokenAddress+"%getBalance": self.MVK(2),
            });

        newAmount = res.storage['minMvkAmount']

        self.assertNotEqual(minAmount, newAmount)

        print('----')
        print('✅ Admin should be able to increase the minimum amount of MVK to interact with the contract')
        print('minimum amount:')
        print(res.storage['minMvkAmount'])

    def test_71_admin_can_decrease_min_mvk(self):
        init_doorman_storage = deepcopy(self.doormanStorage)
        init_mvk_storage = deepcopy(self.mvkTokenStorage)

        # Initial values
        stakeAmount = self.MVK(1)
        minAmount = init_doorman_storage['minMvkAmount']
        firstDesiredMinAmount = self.MVK(3)
        secondDesiredMinAmount = self.MVK(2)

        # Operation
        res = self.doormanContract.updateMinMvkAmount(firstDesiredMinAmount).interpret(storage=init_doorman_storage, sender=bob);
        res = self.doormanContract.updateMinMvkAmount(secondDesiredMinAmount).interpret(storage=res.storage, sender=bob);

        # Test operation
        with self.raisesMichelsonError(error_codes.error_MVK_ACCESS_AMOUNT_NOT_REACHED):
            res = self.doormanContract.stake(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        
        with self.raisesMichelsonError(error_codes.error_MVK_ACCESS_AMOUNT_NOT_REACHED):
            res = self.doormanContract.unstake(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                mvkTokenAddress+"%getTotalSupply": self.MVK(100),
                mvkTokenAddress+"%getBalance": self.MVK(2),
            });

        newAmount = res.storage['minMvkAmount']

        self.assertNotEqual(minAmount, newAmount)

        print('----')
        print('✅ Admin should be able to decrease the minimum amount of MVK to interact with the contract')
        print('minimum amount:')
        print(res.storage['minMvkAmount'])

    def test_72_admin_cant_decrease_min_mvk_too_much(self):
        init_doorman_storage = deepcopy(self.doormanStorage)
        init_mvk_storage = deepcopy(self.mvkTokenStorage)

        # Initial values
        stakeAmount = self.MVK(1)
        minAmount = init_doorman_storage['minMvkAmount']
        desiredMinAmount = self.MVK(0.001)

        # Operation
        with self.raisesMichelsonError(error_codes.error_CONFIG_VALUE_TOO_LOW):
            res = self.doormanContract.updateMinMvkAmount(desiredMinAmount).interpret(storage=init_doorman_storage, sender=bob);

        # Test operation
        res = self.doormanContract.stake(stakeAmount).interpret(storage=init_doorman_storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        res = self.doormanContract.unstake(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                mvkTokenAddress+"%getTotalSupply": self.MVK(100),
                mvkTokenAddress+"%getBalance": self.MVK(2),
            });

        newAmount = res.storage['minMvkAmount']

        self.assertEqual(minAmount, newAmount)

        print('----')
        print('✅ Admin should not be able to decrease the minimum amount of MVK below 1MVK')
        print('minimum amount:')
        print(init_doorman_storage['minMvkAmount'])

    def test_73_non_admin_cant_update_min_mvk(self):
        init_doorman_storage = deepcopy(self.doormanStorage)
        init_mvk_storage = deepcopy(self.mvkTokenStorage)

        # Initial values
        stakeAmount = self.MVK(2)
        minAmount = init_doorman_storage['minMvkAmount']
        desiredMinAmount = self.MVK(2)

        # Operation
        newAmount = 0
        with self.raisesMichelsonError(error_codes.error_ONLY_ADMINISTRATOR_ALLOWED):
            res = self.doormanContract.updateMinMvkAmount(desiredMinAmount).interpret(storage=init_doorman_storage, sender=alice);

        # Test operation
        res = self.doormanContract.stake(stakeAmount).interpret(storage=init_doorman_storage, sender=bob, view_results={
            governanceAddress+"%getGeneralContractOpt": delegationAddress,
            governanceAddress+"%getGeneralContractOpt": delegationAddress
        });
        res = self.doormanContract.unstake(stakeAmount).interpret(storage=res.storage, source=bob, view_results={
                mvkTokenAddress+"%getTotalSupply": init_mvk_storage['totalSupply'],
                mvkTokenAddress+"%getBalance": self.MVK(2),
            });

        newAmount = res.storage['minMvkAmount']

        self.assertEqual(minAmount, newAmount)

        print('----')
        print('✅ Non-admin should not be able to update the minimum amount of MVK')
        print('minimum amount:')
        print(init_doorman_storage['minMvkAmount'])

    ###
    # %farmClaim
    ##
    def test_80_mvk_contract_call_farmclaim(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        recipientAddress = alice
        mintedTokens = self.MVK(2)
        forceTransfer = False
        mvkTotalSupply = self.MVK(100)
        mvkMaximumSupply = self.MVK(1000)

        # Operations
        self.doormanContract.farmClaim(recipientAddress,mintedTokens,forceTransfer).interpret(storage=init_doorman_storage, sender=bob, view_results={
            farmFactoryAddress+"%checkFarmExists": True,
            mvkTokenAddress+"%getTotalAndMaximumSupply": (mvkTotalSupply, mvkMaximumSupply)
        });

        print('----')
        print('✅ MVK Token contract tries to call farmClaim')

    def test_81_farmclaim_treasury_contract_unknown_to_doorman(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        recipientAddress = alice
        mintedTokens = self.MVK(2)
        forceTransfer = False
        mvkTotalSupply = self.MVK(100)
        mvkMaximumSupply = self.MVK(1000)

        # Operations
        res = self.doormanContract.updateGeneralContracts("farmTreasury",eve).interpret(storage=init_doorman_storage, sender=bob); # update map
        res = self.doormanContract.updateGeneralContracts("farmTreasury",eve).interpret(storage=res.storage, sender=bob); # then delete same entry
        with self.raisesMichelsonError(error_codes.error_FARM_TREASURY_CONTRACT_NOT_FOUND):
            self.doormanContract.farmClaim(recipientAddress,mintedTokens,forceTransfer).interpret(storage=res.storage, sender=bob, view_results={
                farmFactoryAddress+"%checkFarmExists": True,
                mvkTokenAddress+"%getTotalAndMaximumSupply": (mvkTotalSupply, mvkMaximumSupply)
            });

        print('----')
        print('✅ MVK Token contract tries to call farmClaim while doorman does not have farmTreasury contract in generalContracts')

    def test_82_farmclaim_complete_delegation_contract_unknown_to_doorman(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        recipientAddress = alice
        mintedTokens = self.MVK(2)
        forceTransfer = False
        mvkTotalSupply = self.MVK(100)
        mvkMaximumSupply = self.MVK(1000)

        # Operations
        res = self.doormanContract.updateGeneralContracts("delegation",delegationAddress).interpret(storage=init_doorman_storage, sender=bob);
        with self.raisesMichelsonError(error_codes.error_DELEGATION_CONTRACT_NOT_FOUND):
            self.doormanContract.farmClaim(recipientAddress,mintedTokens,forceTransfer).interpret(storage=res.storage, sender=bob, view_results={
                farmFactoryAddress+"%checkFarmExists": True,
                mvkTokenAddress+"%getTotalAndMaximumSupply": (mvkTotalSupply, mvkMaximumSupply)
            });

        print('----')
        print('✅ MVK Token contract tries to call farmClaim while doorman does not have delegation contract in generalContracts')

    def test_83_claim_should_be_split_between_mint_transfer(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        recipientAddress = alice
        fakeTotalSupply = self.MVK(100)
        fakemaximumSupply = self.MVK(1000)
        mintedTokens = self.MVK(910)
        forceTransfer = False

        res = self.doormanContract.farmClaim(recipientAddress,mintedTokens,forceTransfer).interpret(storage=init_doorman_storage, sender=bob, view_results={
            farmFactoryAddress+"%checkFarmExists": True,
            mvkTokenAddress+"%getTotalAndMaximumSupply": (fakeTotalSupply, fakemaximumSupply)
        });
        mintedAmount = int(res.operations[3]['parameters']['value']['args'][-1]['int'])
        transferedAmount = int(res.operations[2]['parameters']['value'][-1]['args'][-1]['int'])

        self.assertEqual(mintedAmount+transferedAmount,mintedTokens)
        self.assertEqual(fakeTotalSupply+mintedAmount,fakemaximumSupply)

        print('----')
        print('✅ Claim should be split between mint and transfer if the reward exceed the MVK maximumSupply')