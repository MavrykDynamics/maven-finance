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
mvnTokenDecimals = os.path.join(helpersDir, 'mvnTokenDecimals.json')
mvnTokenDecimals = open(mvnTokenDecimals)
mvnTokenDecimals = json.load(mvnTokenDecimals)
mvnTokenDecimals = mvnTokenDecimals['decimals']

deploymentsDir          = os.path.join(fileDir, 'deployments')
lambdaDir               = os.path.join(oneUp, 'build/lambdas')
deployedDoormanContract = os.path.join(deploymentsDir, 'doormanAddress.json')
deployedMvnTokenContract = os.path.join(deploymentsDir, 'mvnTokenAddress.json')
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

deployedMvnToken = open(deployedMvnTokenContract)
mvnTokenAddress = json.load(deployedMvnToken)
mvnTokenAddress = mvnTokenAddress['address']

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
print('MVN Token Contract Deployed at: ' + mvnTokenAddress)
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

        # Setup MVN Token 
        cls.mvnTokenContract = pytezos.contract(mvnTokenAddress)
        cls.mvnTokenStorage  = cls.mvnTokenContract.storage()

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

    # MVN Formatter
    def MVN(self, value: float = 1.0):
        return int(value * 10**int(mvnTokenDecimals))

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
        stakeMvnIsPaused = init_doorman_storage['breakGlassConfig']['stakeMvnIsPaused']
        unstakeMvnIsPaused = init_doorman_storage['breakGlassConfig']['unstakeMvnIsPaused']
        compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']
        farmClaimIsPaused = init_doorman_storage['breakGlassConfig']['farmClaimIsPaused']
        stakeAmount = self.MVN(2)
        unstakeAmount = self.MVN()
        recipientAddress = alice
        mintedTokens = self.MVN(2)
        forceTransfer = False
        mvnTotalSupply = self.MVN(100)
        mvnMaximumSupply = self.MVN(1000)

        # Operation
        res = self.doormanContract.pauseAll().interpret(storage=init_doorman_storage, sender=bob)

        # Final values
        finalStakeIsPaused = res.storage['breakGlassConfig']['stakeMvnIsPaused']
        finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeMvnIsPaused']
        finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']
        finalFarmClaimIsPaused = res.storage['breakGlassConfig']['farmClaimIsPaused']

        # Tests operations
        with self.raisesMichelsonError(error_codes.error_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
            res = self.doormanContract.stakeMvn(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        
        with self.raisesMichelsonError(error_codes.error_UNSTAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
            res = self.doormanContract.unstakeMvn(unstakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                mvnTokenAddress+"%total_supply": mvnTotalSupply,
                mvnTokenAddress+"%get_balance": self.MVN(2),
            });
        
#         with self.raisesMichelsonError(error_codes.error_COMPOUND_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
#             res = self.doormanContract.compound(bob).interpret(storage=res.storage, sender=bob)
        
        with self.raisesMichelsonError(error_codes.error_FARM_CLAIM_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
            res = self.doormanContract.farmClaim(recipientAddress,mintedTokens,forceTransfer).interpret(storage=init_doorman_storage, sender=bob, view_results={
                mvnTokenAddress+"%total_supply": mvnTotalSupply,
                mvnTokenAddress+"%getMaximumSupply": mvnMaximumSupply,
                governanceAddress+"%getGeneralContractOpt": farmFactoryAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                farmFactoryAddress+"%checkFarmExists": True
            });

        self.assertNotEqual(stakeMvnIsPaused, finalStakeIsPaused)
        self.assertNotEqual(unstakeMvnIsPaused, finalUnstakeIsPaused)
        self.assertNotEqual(compoundIsPaused, finalCompoundIsPaused)
        self.assertNotEqual(farmClaimIsPaused, finalFarmClaimIsPaused)

        print('----')
        print('✅ Admin tries to pause all entrypoints')
        print('stake is paused:')
        print(finalStakeIsPaused)
        print('unstakeMvn is paused:')
        print(finalUnstakeIsPaused)
        print('compound is paused:')
        print(finalCompoundIsPaused)
        print('farmClaim is paused:')
        print(finalFarmClaimIsPaused)

    def test_21_non_admin_call_entrypoint(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeMvnIsPaused = init_doorman_storage['breakGlassConfig']['stakeMvnIsPaused']
        unstakeMvnIsPaused = init_doorman_storage['breakGlassConfig']['unstakeMvnIsPaused']
        compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']
        farmClaimIsPaused = init_doorman_storage['breakGlassConfig']['farmClaimIsPaused']
        finalStakeIsPaused = stakeMvnIsPaused
        finalUnstakeIsPaused = unstakeMvnIsPaused
        finalCompoundIsPaused = compoundIsPaused
        finalFarmClaimIsPaused = farmClaimIsPaused

        # Operation
        with self.raisesMichelsonError(error_codes.error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED):
            res = self.doormanContract.pauseAll().interpret(storage=init_doorman_storage, sender=alice)

            # Final values
            finalStakeIsPaused = res.storage['breakGlassConfig']['stakeMvnIsPaused']
            finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeMvnIsPaused']
            finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']
            finalFarmClaimIsPaused = res.storage['breakGlassConfig']['farmClaimIsPaused']

        self.assertEqual(stakeMvnIsPaused, finalStakeIsPaused)
        self.assertEqual(unstakeMvnIsPaused, finalUnstakeIsPaused)
        self.assertEqual(compoundIsPaused, finalCompoundIsPaused)
        self.assertEqual(farmClaimIsPaused, finalFarmClaimIsPaused)

        print('----')
        print('✅ Non-admin tries to pause all entrypoints')
        print('stake is paused:')
        print(finalStakeIsPaused)
        print('unstakeMvn is paused:')
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
        init_mvn_storage = deepcopy(self.mvnTokenStorage)

        # Initial values
        stakeMvnIsPaused = init_doorman_storage['breakGlassConfig']['stakeMvnIsPaused']
        unstakeMvnIsPaused = init_doorman_storage['breakGlassConfig']['unstakeMvnIsPaused']
        compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']
        farmClaimIsPaused = init_doorman_storage['breakGlassConfig']['farmClaimIsPaused']
        stakeAmount = self.MVN(2)
        unstakeAmount = self.MVN()
        res = self.doormanContract.pauseAll().interpret(storage=init_doorman_storage, sender=bob)

        # Paused values
        pauseStakeIsPaused = res.storage['breakGlassConfig']['stakeMvnIsPaused']
        pauseUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeMvnIsPaused']
        pauseCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']
        pauseFarmClaimIsPaused = res.storage['breakGlassConfig']['farmClaimIsPaused']

        # Operation
        res = self.doormanContract.unpauseAll().interpret(storage=res.storage, sender=bob)

        # Tests operations
        res = self.doormanContract.stakeMvn(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        res = self.doormanContract.unstakeMvn(unstakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                mvnTokenAddress+"%total_supply": mvnTotalSupply,
                mvnTokenAddress+"%get_balance": self.MVN(2),
            });
        res = self.doormanContract.compound(bob).interpret(storage=res.storage, sender=bob)
        
        # Final values
        finalStakeIsPaused = res.storage['breakGlassConfig']['stakeMvnIsPaused']
        finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeMvnIsPaused']
        finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']
        finalFarmClaimIsPaused = res.storage['breakGlassConfig']['farmClaimIsPaused']

        self.assertNotEqual(stakeMvnIsPaused, pauseStakeIsPaused)
        self.assertNotEqual(unstakeMvnIsPaused, pauseUnstakeIsPaused)
        self.assertNotEqual(compoundIsPaused, pauseCompoundIsPaused)
        self.assertNotEqual(farmClaimIsPaused, pauseFarmClaimIsPaused)
        self.assertEqual(stakeMvnIsPaused, finalStakeIsPaused)
        self.assertEqual(unstakeMvnIsPaused, finalUnstakeIsPaused)
        self.assertEqual(compoundIsPaused, finalCompoundIsPaused)
        self.assertEqual(farmClaimIsPaused, finalFarmClaimIsPaused)

        print('----')
        print('✅ Admin tries to unpause all entrypoints')
        print('stake is paused:')
        print(finalStakeIsPaused)
        print('unstakeMvn is paused:')
        print(finalUnstakeIsPaused)
        print('compound is paused:')
        print(finalCompoundIsPaused)
        print('farmClaim is paused:')
        print(finalFarmClaimIsPaused)

    def test_23_non_admin_call_entrypoint(self):
        init_doorman_storage = deepcopy(self.doormanStorage)
        init_mvn_storage = deepcopy(self.mvnTokenStorage)

        # Initial values
        stakeMvnIsPaused = init_doorman_storage['breakGlassConfig']['stakeMvnIsPaused']
        unstakeMvnIsPaused = init_doorman_storage['breakGlassConfig']['unstakeMvnIsPaused']
        compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']
        farmClaimIsPaused = init_doorman_storage['breakGlassConfig']['farmClaimIsPaused']
        stakeAmount = self.MVN(2)
        unstakeAmount = self.MVN()
        recipientAddress = alice
        mintedTokens = self.MVN(2)
        forceTransfer = False
        mvnTotalSupply = self.MVN(100)
        mvnMaximumSupply = self.MVN(1000)

        # First operation
        res = self.doormanContract.pauseAll().interpret(storage=init_doorman_storage, sender=bob)

        # Paused values
        pauseStakeIsPaused = res.storage['breakGlassConfig']['stakeMvnIsPaused']
        pauseUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeMvnIsPaused']
        pauseCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']
        pauseFarmClaimIsPaused = res.storage['breakGlassConfig']['farmClaimIsPaused']

        # Operation
        with self.raisesMichelsonError(error_codes.error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED):
            res = self.doormanContract.unpauseAll().interpret(storage=res.storage, sender=alice)

        # Tests operations
        with self.raisesMichelsonError(error_codes.error_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
            res = self.doormanContract.stakeMvn(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        
        with self.raisesMichelsonError(error_codes.error_UNSTAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
            res = self.doormanContract.unstakeMvn(unstakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                mvnTokenAddress+"%total_supply": mvnTotalSupply,
                mvnTokenAddress+"%get_balance": self.MVN(2),
            });
        
#         with self.raisesMichelsonError(error_codes.error_COMPOUND_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
#             res = self.doormanContract.compound(bob).interpret(storage=res.storage, sender=bob)
        
#         with self.raisesMichelsonError(error_codes.error_FARM_CLAIM_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
#             res = self.doormanContract.farmClaim(recipientAddress,mintedTokens,forceTransfer).interpret(storage=init_doorman_storage, sender=bob, view_results={
#                 farmFactoryAddress+"%checkFarmExists": True,
#                 mvnTokenAddress+"%getTotalAndMaximumSupply": (mvnTotalSupply, mvnMaximumSupply)
#             });
        
        # Final values
        finalStakeIsPaused = res.storage['breakGlassConfig']['stakeMvnIsPaused']
        finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeMvnIsPaused']
        finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']
        finalFarmClaimIsPaused = res.storage['breakGlassConfig']['farmClaimIsPaused']

        self.assertNotEqual(stakeMvnIsPaused, pauseStakeIsPaused)
        self.assertNotEqual(unstakeMvnIsPaused, pauseUnstakeIsPaused)
        self.assertNotEqual(compoundIsPaused, pauseCompoundIsPaused)
        self.assertNotEqual(farmClaimIsPaused, pauseFarmClaimIsPaused)
        self.assertNotEqual(stakeMvnIsPaused, finalStakeIsPaused)
        self.assertNotEqual(unstakeMvnIsPaused, finalUnstakeIsPaused)
        self.assertNotEqual(farmClaimIsPaused, finalFarmClaimIsPaused)

        print('----')
        print('✅ Non-admin tries to unpause all entrypoints')
        print('stake is paused:')
        print(finalStakeIsPaused)
        print('unstakeMvn is paused:')
        print(finalUnstakeIsPaused)
        print('compound is paused:')
        print(finalCompoundIsPaused)
        print('farmClaim is paused:')
        print(finalFarmClaimIsPaused)

    ###
    # %togglePauseEntrypoint
    ##
    def test_24_admin_pause_stake(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeMvnIsPaused = init_doorman_storage['breakGlassConfig']['stakeMvnIsPaused']
        stakeAmount = self.MVN(2)

        # Operation
        res = self.doormanContract.togglePauseEntrypoint({
            "toggleStake": True
        }).interpret(storage=init_doorman_storage, sender=bob)

        # Final values
        finalStakeIsPaused = res.storage['breakGlassConfig']['stakeMvnIsPaused']

        # Tests operations
        with self.raisesMichelsonError(error_codes.error_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
            res = self.doormanContract.stakeMvn(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });

        self.assertNotEqual(stakeMvnIsPaused, finalStakeIsPaused)

        print('----')
        print('✅ Admin tries to pause stake entrypoint')
        print('stake is paused:')
        print(finalStakeIsPaused)

    def test_25_admin_pause_unstake(self):
        init_doorman_storage = deepcopy(self.doormanStorage)
        init_mvn_storage = deepcopy(self.mvnTokenStorage)

        # Initial values
        unstakeMvnIsPaused = init_doorman_storage['breakGlassConfig']['unstakeMvnIsPaused']
        stakeAmount = self.MVN(2)
        unstakeAmount = self.MVN()

        # Operation
        res = self.doormanContract.togglePauseEntrypoint({
            "toggleUnstake": True
        }).interpret(storage=init_doorman_storage, sender=bob)

        # Final values
        finalUnstakeIsPaused = res.storage['breakGlassConfig']['unstakeMvnIsPaused']

        # Tests operations
        res = self.doormanContract.stakeMvn(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        with self.raisesMichelsonError(error_codes.error_UNSTAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
            res = self.doormanContract.unstakeMvn(unstakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                mvnTokenAddress+"%total_supply": mvnTotalSupply,
                mvnTokenAddress+"%get_balance": self.MVN(2),
            });

        self.assertNotEqual(unstakeMvnIsPaused, finalUnstakeIsPaused)

        print('----')
        print('✅ Admin tries to pause stake entrypoint')
        print('unstakeMvn is paused:')
        print(finalUnstakeIsPaused)

    def test_27_admin_pause_compound(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']

        # Operation
        res = self.doormanContract.togglePauseEntrypoint({
            "toggleCompound": True
        }).interpret(storage=init_doorman_storage, sender=bob)

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
    
#     def test_27_non_admin_pause_compound(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)

#         # Initial values
#         compoundIsPaused = init_doorman_storage['breakGlassConfig']['compoundIsPaused']
#         finalCompoundIsPaused = compoundIsPaused;

#         # Operation
#         with self.raisesMichelsonError(error_codes.error_ONLY_ADMINISTRATOR_ALLOWED):
#             res = self.doormanContract.togglePauseCompound().interpret(storage=init_doorman_storage, sender=alice)

#             # Final values
#             finalCompoundIsPaused = res.storage['breakGlassConfig']['compoundIsPaused']

#             # Tests operations
#             res = self.doormanContract.compound(bob).interpret(storage=res.storage, sender=bob)

#             self.assertNotEqual(0, res.storage['stakedMvnTotalSupply'])
#             self.assertEqual(compoundIsPaused, finalCompoundIsPaused)

#         print('----')
#         print('✅ Non-admin tries to pause compound entrypoint')
#         print('compound is paused:')
#         print(finalCompoundIsPaused)

#      ###
#     # %togglePauseFarmClaim
#     ##
#     def test_27_admin_pause_farm_claim(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)

#         # Initial values
#         farmClaimIsPaused = init_doorman_storage['breakGlassConfig']['farmClaimIsPaused']
#         recipientAddress = alice
#         mintedTokens = self.MVN(2)
#         forceTransfer = False
#         mvnTotalSupply = self.MVN(100)
#         mvnMaximumSupply = self.MVN(1000)

#         # Operation
#         res = self.doormanContract.togglePauseFarmClaim().interpret(storage=init_doorman_storage, sender=bob)

#         # Final values
#         finalFarmClaimIsPaused = res.storage['breakGlassConfig']['farmClaimIsPaused']

#         # Tests operations
#         with self.raisesMichelsonError(error_codes.error_FARM_CLAIM_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED):
#             res = self.doormanContract.farmClaim(recipientAddress,mintedTokens,forceTransfer).interpret(storage=init_doorman_storage, sender=bob, view_results={
#                 farmFactoryAddress+"%checkFarmExists": True,
#                 mvnTokenAddress+"%getTotalAndMaximumSupply": (mvnTotalSupply, mvnMaximumSupply)
#             });

#         self.assertEqual(0, res.storage['stakedMvnTotalSupply'])
#         self.assertNotEqual(farmClaimIsPaused, finalFarmClaimIsPaused)

#         print('----')
#         print('✅ Admin tries to pause farmClaim entrypoint')
#         print('farmClaim is paused:')
#         print(finalFarmClaimIsPaused)
    
#     def test_28_non_admin_pause_compound(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)

#         # Initial values
#         farmClaimIsPaused = init_doorman_storage['breakGlassConfig']['farmClaimIsPaused']
#         finalFarmClaimIsPaused = farmClaimIsPaused;
#         recipientAddress = alice
#         mintedTokens = self.MVN(2)
#         forceTransfer = False
#         mvnTotalSupply = self.MVN(100)
#         mvnMaximumSupply = self.MVN(1000)

#         # Operation
#         with self.raisesMichelsonError(error_codes.error_ONLY_ADMINISTRATOR_ALLOWED):
#             res = self.doormanContract.togglePauseStake().interpret(storage=init_doorman_storage, sender=alice)

#             # Final values
#             finalFarmClaimIsPaused = res.storage['breakGlassConfig']['farmClaimIsPaused']

#             # Tests operations
#             res = self.doormanContract.farmClaim(recipientAddress,mintedTokens,forceTransfer).interpret(storage=init_doorman_storage, sender=bob, view_results={
#                 farmFactoryAddress+"%checkFarmExists": True,
#                 mvnTokenAddress+"%getTotalAndMaximumSupply": (mvnTotalSupply, mvnMaximumSupply)
#             });

#             self.assertNotEqual(0, res.storage['stakedMvnTotalSupply'])
#             self.assertEqual(farmClaimIsPaused, finalFarmClaimIsPaused)

#         print('----')
#         print('✅ Non-admin tries to pause farmClaim entrypoint')
#         print('farmClaim is paused:')
#         print(finalFarmClaimIsPaused)
    
    ###
    # %stakeMvn
    ##
    def test_40_stake_delegation_contract_unknown_to_doorman(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeAmount = self.MVN(2)

        # Operations
        with self.raisesMichelsonError(error_codes.error_DELEGATION_CONTRACT_NOT_FOUND):
            self.doormanContract.stakeMvn( stakeAmount).interpret(storage=init_doorman_storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });

        print('----')
        print('✅ User tries to stake while doorman does not have delegation contract in generalContracts')

    ###
    # %unstakeMvn
    ##
    def test_51_mvn_contract_call_unstake(self):
        init_doorman_storage = deepcopy(self.doormanStorage)
        init_mvn_storage = deepcopy(self.mvnTokenStorage)

        # Initial values
        stakeAmount = self.MVN(2)
        unstakeAmount = self.MVN(2)
        mvnTotalSupply = self.MVN(100)

        # Operations
        res = self.doormanContract.stakeMvn(stakeAmount).interpret(storage=init_doorman_storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        res = self.doormanContract.unstakeMvn(unstakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                mvnTokenAddress+"%total_supply": mvnTotalSupply,
                mvnTokenAddress+"%get_balance": self.MVN(2),
            });

        print('----')
        print('✅ MVN Token contract tries to call unstakeMvn')

    def test_52_unstake_delegation_contract_unknown_to_doorman(self):
        init_doorman_storage = deepcopy(self.doormanStorage)
        init_mvn_storage = deepcopy(self.mvnTokenStorage)

        # Initial values
        stakeAmount = self.MVN(2)
        unstakeAmount = self.MVN(2)
        mvnTotalSupply = self.MVN(100)

        # Operations
        res = self.doormanContract.stakeMvn(stakeAmount).interpret(storage=init_doorman_storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        res = self.doormanContract.updateGeneralContracts("delegation",delegationAddress).interpret(storage=res.storage, sender=bob);
        with self.raisesMichelsonError(error_codes.error_DELEGATION_CONTRACT_NOT_FOUND):
            self.doormanContract.unstakeMvn(unstakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                mvnTokenAddress+"%total_supply": mvnTotalSupply,
                mvnTokenAddress+"%get_balance": self.MVN(2),
            });

        print('----')
        print('✅ MVN Token contract tries to call unstakeMvn while doorman does not have delegation contract in generalContracts')

    def test_53_non_mvn_contract_call_unstake(self):
        init_doorman_storage = deepcopy(self.doormanStorage)
        init_mvn_storage = deepcopy(self.mvnTokenStorage)

        # Initial values
        stakeAmount = self.MVN(2)
        unstakeAmount = self.MVN(2)

        # Operations
        res = self.doormanContract.stakeMvn(stakeAmount).interpret(storage=init_doorman_storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        with self.raisesMichelsonError(error_codes.error_ONLY_MVN_TOKEN_CONTRACT_ALLOWED):
            self.doormanContract.unstakeMvn(unstakeAmount).interpret(storage=res.storage, sender=bob, source=bob, view_results={
                mvnTokenAddress+"%total_supply": init_mvn_storage['totalSupply'],
                delegationAddress+"%getSatelliteRewardsOpt": None,
            })

        print('----')
        print('✅ Non-MVN Token contract tries to call unstakeMvn')

    ###
    # %compound
    ##
    def test_60_compound_delegation_contract_unknown_to_doorman(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        stakeAmount = self.MVN(2)

        # Operations
        res = self.doormanContract.stakeMvn(stakeAmount).interpret(storage=init_doorman_storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        res = self.doormanContract.updateGeneralContracts("delegation",delegationAddress).interpret(storage=res.storage, sender=bob);
        with self.raisesMichelsonError(error_codes.error_DELEGATION_CONTRACT_NOT_FOUND):
            self.doormanContract.compound(bob).interpret(storage=res.storage, sender=bob, source=bob);

        print('----')
        print('✅ User tries to compound while doorman does not have delegation contract in generalContracts')

    ###
    # %updateMinMvnAmount
    ##
    def test_70_admin_can_increase_min_mvn(self):
        init_doorman_storage = deepcopy(self.doormanStorage)
        init_mvn_storage = deepcopy(self.mvnTokenStorage)

        # Initial values
        stakeAmount = self.MVN(1)
        minAmount = init_doorman_storage['minMvnAmount']
        desiredMinAmount = self.MVN(2)

        # Operation
        res = self.doormanContract.updateMinMvnAmount(desiredMinAmount).interpret(storage=init_doorman_storage, sender=bob);

        # Test operation
        with self.raisesMichelsonError(error_codes.error_MVN_ACCESS_AMOUNT_NOT_REACHED):
            res = self.doormanContract.stakeMvn(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        
        with self.raisesMichelsonError(error_codes.error_MVN_ACCESS_AMOUNT_NOT_REACHED):
            res = self.doormanContract.unstakeMvn(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                mvnTokenAddress+"%total_supply": self.MVN(100),
                mvnTokenAddress+"%get_balance": self.MVN(2),
            });

#         newAmount = res.storage['minMvnAmount']

#         self.assertNotEqual(minAmount, newAmount)

#         print('----')
#         print('✅ Admin should be able to increase the minimum amount of MVN to interact with the contract')
#         print('minimum amount:')
#         print(res.storage['minMvnAmount'])

#     def test_71_admin_can_decrease_min_mvn(self):
#         init_doorman_storage = deepcopy(self.doormanStorage)
#         init_mvn_storage = deepcopy(self.mvnTokenStorage)

#         # Initial values
#         stakeAmount = self.MVN(1)
#         minAmount = init_doorman_storage['minMvnAmount']
#         firstDesiredMinAmount = self.MVN(3)
#         secondDesiredMinAmount = self.MVN(2)

#         # Operation
#         res = self.doormanContract.updateMinMvnAmount(firstDesiredMinAmount).interpret(storage=init_doorman_storage, sender=bob);
#         res = self.doormanContract.updateMinMvnAmount(secondDesiredMinAmount).interpret(storage=res.storage, sender=bob);

        # Test operation
        with self.raisesMichelsonError(error_codes.error_MVN_ACCESS_AMOUNT_NOT_REACHED):
            res = self.doormanContract.stakeMvn(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        
        with self.raisesMichelsonError(error_codes.error_MVN_ACCESS_AMOUNT_NOT_REACHED):
            res = self.doormanContract.unstakeMvn(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                mvnTokenAddress+"%total_supply": self.MVN(100),
                mvnTokenAddress+"%get_balance": self.MVN(2),
            });

        newAmount = res.storage['minMvnAmount']

        self.assertNotEqual(minAmount, newAmount)

        print('----')
        print('✅ Admin should be able to decrease the minimum amount of MVN to interact with the contract')
        print('minimum amount:')
        print(res.storage['minMvnAmount'])

    def test_72_admin_cant_decrease_min_mvn_too_much(self):
        init_doorman_storage = deepcopy(self.doormanStorage)
        init_mvn_storage = deepcopy(self.mvnTokenStorage)

        # Initial values
        stakeAmount = self.MVN(1)
        minAmount = init_doorman_storage['minMvnAmount']
        desiredMinAmount = self.MVN(0.001)

        # Operation
        with self.raisesMichelsonError(error_codes.error_CONFIG_VALUE_TOO_LOW):
            res = self.doormanContract.updateMinMvnAmount(desiredMinAmount).interpret(storage=init_doorman_storage, sender=bob);

        # Test operation
        res = self.doormanContract.stakeMvn(stakeAmount).interpret(storage=init_doorman_storage, sender=bob, view_results={
                governanceAddress+"%getGeneralContractOpt": delegationAddress,
                governanceAddress+"%getGeneralContractOpt": delegationAddress
            });
        res = self.doormanContract.unstakeMvn(stakeAmount).interpret(storage=res.storage, sender=bob, view_results={
                mvnTokenAddress+"%total_supply": self.MVN(100),
                mvnTokenAddress+"%get_balance": self.MVN(2),
            });

        newAmount = res.storage['minMvnAmount']

        self.assertEqual(minAmount, newAmount)

        print('----')
        print('✅ Admin should not be able to decrease the minimum amount of MVN below 1MVN')
        print('minimum amount:')
        print(init_doorman_storage['minMvnAmount'])

    def test_73_non_admin_cant_update_min_mvn(self):
        init_doorman_storage = deepcopy(self.doormanStorage)
        init_mvn_storage = deepcopy(self.mvnTokenStorage)

        # Initial values
        stakeAmount = self.MVN(2)
        minAmount = init_doorman_storage['minMvnAmount']
        desiredMinAmount = self.MVN(2)

        # Operation
        newAmount = 0
        with self.raisesMichelsonError(error_codes.error_ONLY_ADMINISTRATOR_ALLOWED):
            res = self.doormanContract.updateMinMvnAmount(desiredMinAmount).interpret(storage=init_doorman_storage, sender=alice);

        # Test operation
        res = self.doormanContract.stakeMvn(stakeAmount).interpret(storage=init_doorman_storage, sender=bob, view_results={
            governanceAddress+"%getGeneralContractOpt": delegationAddress,
            governanceAddress+"%getGeneralContractOpt": delegationAddress
        });
        res = self.doormanContract.unstakeMvn(stakeAmount).interpret(storage=res.storage, source=bob, view_results={
                mvnTokenAddress+"%total_supply": init_mvn_storage['totalSupply'],
                mvnTokenAddress+"%get_balance": self.MVN(2),
            });

        newAmount = res.storage['minMvnAmount']

        self.assertEqual(minAmount, newAmount)

        print('----')
        print('✅ Non-admin should not be able to update the minimum amount of MVN')
        print('minimum amount:')
        print(init_doorman_storage['minMvnAmount'])

    ###
    # %farmClaim
    ##
    def test_80_mvn_contract_call_farmclaim(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        recipientAddress = alice
        mintedTokens = self.MVN(2)
        forceTransfer = False
        mvnTotalSupply = self.MVN(100)
        mvnMaximumSupply = self.MVN(1000)

        # Operations
        self.doormanContract.farmClaim(recipientAddress,mintedTokens,forceTransfer).interpret(storage=init_doorman_storage, sender=bob, view_results={
            farmFactoryAddress+"%checkFarmExists": True,
            mvnTokenAddress+"%getTotalAndMaximumSupply": (mvnTotalSupply, mvnMaximumSupply)
        });

        print('----')
        print('✅ MVN Token contract tries to call farmClaim')

    def test_81_farmclaim_treasury_contract_unknown_to_doorman(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        recipientAddress = alice
        mintedTokens = self.MVN(2)
        forceTransfer = False
        mvnTotalSupply = self.MVN(100)
        mvnMaximumSupply = self.MVN(1000)

        # Operations
        res = self.doormanContract.updateGeneralContracts("farmTreasury",eve).interpret(storage=init_doorman_storage, sender=bob); # update map
        res = self.doormanContract.updateGeneralContracts("farmTreasury",eve).interpret(storage=res.storage, sender=bob); # then delete same entry
        with self.raisesMichelsonError(error_codes.error_FARM_TREASURY_CONTRACT_NOT_FOUND):
            self.doormanContract.farmClaim(recipientAddress,mintedTokens,forceTransfer).interpret(storage=res.storage, sender=bob, view_results={
                farmFactoryAddress+"%checkFarmExists": True,
                mvnTokenAddress+"%getTotalAndMaximumSupply": (mvnTotalSupply, mvnMaximumSupply)
            });

        print('----')
        print('✅ MVN Token contract tries to call farmClaim while doorman does not have farmTreasury contract in generalContracts')

    def test_82_farmclaim_complete_delegation_contract_unknown_to_doorman(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        recipientAddress = alice
        mintedTokens = self.MVN(2)
        forceTransfer = False
        mvnTotalSupply = self.MVN(100)
        mvnMaximumSupply = self.MVN(1000)

        # Operations
        res = self.doormanContract.updateGeneralContracts("delegation",delegationAddress).interpret(storage=init_doorman_storage, sender=bob);
        with self.raisesMichelsonError(error_codes.error_DELEGATION_CONTRACT_NOT_FOUND):
            self.doormanContract.farmClaim(recipientAddress,mintedTokens,forceTransfer).interpret(storage=res.storage, sender=bob, view_results={
                farmFactoryAddress+"%checkFarmExists": True,
                mvnTokenAddress+"%getTotalAndMaximumSupply": (mvnTotalSupply, mvnMaximumSupply)
            });

        print('----')
        print('✅ MVN Token contract tries to call farmClaim while doorman does not have delegation contract in generalContracts')

    def test_83_claim_should_be_split_between_mint_transfer(self):
        init_doorman_storage = deepcopy(self.doormanStorage)

        # Initial values
        recipientAddress = alice
        fakeTotalSupply = self.MVN(100)
        fakemaximumSupply = self.MVN(1000)
        mintedTokens = self.MVN(910)
        forceTransfer = False

        res = self.doormanContract.farmClaim(recipientAddress,mintedTokens,forceTransfer).interpret(storage=init_doorman_storage, sender=bob, view_results={
            farmFactoryAddress+"%checkFarmExists": True,
            mvnTokenAddress+"%getTotalAndMaximumSupply": (fakeTotalSupply, fakemaximumSupply)
        });
        mintedAmount = int(res.operations[3]['parameters']['value']['args'][-1]['int'])
        transferedAmount = int(res.operations[2]['parameters']['value'][-1]['args'][-1]['int'])

        self.assertEqual(mintedAmount+transferedAmount,mintedTokens)
        self.assertEqual(fakeTotalSupply+mintedAmount,fakemaximumSupply)

        print('----')
        print('✅ Claim should be split between mint and transfer if the reward exceed the MVN maximumSupply')
