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
import error_codes


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
deployedVestingContract = os.path.join(deploymentsDir, 'vestingAddress.json')
deployedMvkTokenContract = os.path.join(deploymentsDir, 'mvkTokenAddress.json')

deployedVesting = open(deployedVestingContract)
vestingContractAddress = json.load(deployedVesting)
vestingContractAddress = vestingContractAddress['address']

deployedMvkToken = open(deployedMvkTokenContract)
mvkTokenAddress = json.load(deployedMvkToken)
mvkTokenAddress = mvkTokenAddress['address']

print('Vesting Contract Deployed at: ' + vestingContractAddress)
print('MVK Token Address Deployed at: ' + mvkTokenAddress)

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

class VestingContract(TestCase):
    
    @classmethod
    def setUpClass(cls):
        cls.vestingContract = pytezos.contract(vestingContractAddress)
        cls.vestingStorage  = cls.vestingContract.storage()
        cls.mvkTokenContract = pytezos.contract(mvkTokenAddress)
        cls.mvkTokenStorage  = cls.mvkTokenContract.storage()
        
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

    ######################
    # Tests for vesting contract #
    ######################
    
    ###
    # %setAdmin
    ##
    def test_00_admin_should_set_admin(self):
        # Initial values
        init_vesting_storage = deepcopy(self.vestingStorage);

        # Operation
        res = self.vestingContract.setAdmin(eve).interpret(storage=init_vesting_storage, sender=bob);

        # Assertions
        self.assertEqual(eve, res.storage['admin']);

        print('--%setAdmin--')
        print('✅ Admin should be able to call this entrypoint and update the contract administrator with a new address')

    def test_01_non_admin_should_not_set_admin(self):
        # Initial values
        init_vesting_storage = deepcopy(self.vestingStorage);

        # Operation
        with self.raisesMichelsonError(error_codes.error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED):
            self.vestingContract.setAdmin(eve).interpret(storage=init_vesting_storage, sender=alice);

        print('✅ Non-admin should not be able to call this entrypoint')

    ###
    # %updateConfig
    ##

    ###
    # %addVestee
    ##
    def test_20_whitelist_should_add_vestee(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)
        totalVestedAmount           = self.MVK(3000000)
        totalCliffInMonths          = 2
        totalConfigVestingInMonths        = 24
        totalClaimAmountPerMonth    = totalVestedAmount // totalConfigVestingInMonths

        # Storage preparation
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);

        # Operation
        res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalConfigVestingInMonths).interpret(storage=res.storage, sender=bob)

        # Assertions
        self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
        self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(totalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

        print('--%addVestee--')
        print('✅ Whitelist contract should able to call this entrypoint')

    def test_21_non_whitelist_should_not_add_vestee(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)
        totalVestedAmount           = self.MVK(3000000)
        totalCliffInMonths          = 2
        totalConfigVestingInMonths        = 24

        # Operation
        with self.raisesMichelsonError(error_codes.error_ONLY_COUNCIL_CONTRACT_OR_ADMINISTRATOR_ALLOWED):
            self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalConfigVestingInMonths).interpret(storage=init_vesting_storage, sender=alice)

        print('✅ Other contracts should not be able to call this entrypoint')

    def test_22_whitelist_should_not_add_vestee_if_exists(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)
        totalVestedAmount           = self.MVK(3000000)
        totalCliffInMonths          = 2
        totalConfigVestingInMonths        = 24
        totalClaimAmountPerMonth    = totalVestedAmount // totalConfigVestingInMonths

        # Storage preparation
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);

        # Operation
        res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalConfigVestingInMonths).interpret(storage=res.storage, sender=bob)

        # Assertions
        self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
        self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(totalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

        # Final operation
        with self.raisesMichelsonError(error_codes.error_VESTEE_ALREADY_EXISTS):
            self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalConfigVestingInMonths).interpret(storage=res.storage, sender=bob)

        print('✅ Whitelist contract should not be able to call this entrypoint if the vestee already exists')

    ###
    # %removeVestee
    ##
    def test_30_whitelist_should_remove_vestee(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)
        totalVestedAmount           = self.MVK(3000000)
        totalCliffInMonths          = 2
        totalConfigVestingInMonths        = 24
        totalClaimAmountPerMonth    = totalVestedAmount // totalConfigVestingInMonths

        # Storage preparation
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
        res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalConfigVestingInMonths).interpret(storage=res.storage, sender=bob)

        # Assertions
        self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
        self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(totalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])
        
        # Operation
        res = self.vestingContract.removeVestee(bob).interpret(storage=res.storage, sender=bob)

        # Assertions
        self.assertEqual(None, res.storage['vesteeLedger'][bob])

        print('--%removeVestee--')
        print('✅ Whitelist contract should able to call this entrypoint')

    def test_31_non_council_nor_admin_should_not_remove_vestee(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)
        totalVestedAmount           = self.MVK(3000000)
        totalCliffInMonths          = 2
        totalConfigVestingInMonths        = 24
        totalClaimAmountPerMonth    = totalVestedAmount // totalConfigVestingInMonths

        # Storage preparation
        res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalConfigVestingInMonths).interpret(storage=init_vesting_storage, sender=bob)

        # Assertions
        self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
        self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(totalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])
        
        # Operation
        with self.raisesMichelsonError(error_codes.error_ONLY_COUNCIL_CONTRACT_OR_ADMINISTRATOR_ALLOWED):
            self.vestingContract.removeVestee(bob).interpret(storage=res.storage, sender=alice)

        print('✅ Other contracts should not be able to call this entrypoint')

    def test_32_whitelist_should_not_remove_vestee_if_doesnt_exists(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)

        # Storage preparation
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
        
        # Operation
        with self.raisesMichelsonError(error_codes.error_VESTEE_NOT_FOUND):
            self.vestingContract.removeVestee(bob).interpret(storage=res.storage, sender=bob)

        print('✅ Whitelist contract should not be able to call this entrypoint if the vestee does not exist')

    ###
    # %toggleVesteeLock
    ##
    def test_40_whitelist_should_lock_unlock_vestee(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)
        totalVestedAmount           = self.MVK(3000000)
        totalCliffInMonths          = 2
        totalConfigVestingInMonths        = 24
        totalClaimAmountPerMonth    = totalVestedAmount // totalConfigVestingInMonths

        # Storage preparation
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
        res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalConfigVestingInMonths).interpret(storage=res.storage, sender=bob)

        # Assertions
        self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
        self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(totalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])
        self.assertEqual("ACTIVE", res.storage['vesteeLedger'][bob]['status'])
        
        # Operation
        res = self.vestingContract.toggleVesteeLock(bob).interpret(storage=res.storage, sender=bob)

        # Assertion
        self.assertEqual("LOCKED", res.storage['vesteeLedger'][bob]['status'])

        # Operation
        res = self.vestingContract.toggleVesteeLock(bob).interpret(storage=res.storage, sender=bob)

        # Assertion
        self.assertEqual("ACTIVE", res.storage['vesteeLedger'][bob]['status'])

        print('--%toggleVesteeLock--')
        print('✅ Whitelist contract should able to call this entrypoint')

    def test_41_non_whitelist_should_not_lock_unlock_vestee(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)
        totalVestedAmount           = self.MVK(3000000)
        totalCliffInMonths          = 2
        totalConfigVestingInMonths        = 24
        totalClaimAmountPerMonth    = totalVestedAmount // totalConfigVestingInMonths

        # Storage preparation
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
        res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalConfigVestingInMonths).interpret(storage=res.storage, sender=bob)
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=res.storage, sender=bob);

        # Assertions
        self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
        self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(totalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])
        self.assertEqual("ACTIVE", res.storage['vesteeLedger'][bob]['status'])
        
        # Operation
        with self.raisesMichelsonError(error_codes.error_ONLY_COUNCIL_CONTRACT_OR_ADMINISTRATOR_ALLOWED):
            self.vestingContract.toggleVesteeLock(bob).interpret(storage=res.storage, sender=alice)

        print('✅ Other contracts should not be able to call this entrypoint')

    def test_42_whitelist_should_lock_unlock_vestee_if_doesnt_exists(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)

        # Storage preparation
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
        
        # Operation
        with self.raisesMichelsonError(error_codes.error_VESTEE_NOT_FOUND):
            self.vestingContract.toggleVesteeLock(bob).interpret(storage=res.storage, sender=bob)

        print('✅ Whitelist contract should not be able to call this entrypoint if the vestee does not exist')
        
    ###
    # %updateVestee
    ##
    def test_50_whitelist_should_update_vestee(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)
        totalVestedAmount           = self.MVK(3000000)
        totalCliffInMonths          = 2
        totalConfigVestingInMonths        = 24
        totalClaimAmountPerMonth    = totalVestedAmount // totalConfigVestingInMonths
        newTotalVestedAmount        = self.MVK(3000000)
        newTotalCliffInMonths       = 2
        newTotalConfigVestingInMonths     = 24
        newTotalClaimAmountPerMonth = totalVestedAmount // totalConfigVestingInMonths       
        
        # Storage preparation
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
        res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalConfigVestingInMonths).interpret(storage=res.storage, sender=bob)

        # Assertions
        self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
        self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(totalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

        # Operation
        res = self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalConfigVestingInMonths).interpret(storage=res.storage, sender=bob)

        # Assertions
        self.assertEqual(newTotalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(newTotalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
        self.assertEqual(newTotalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(newTotalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

        print('--%updateVestee--')
        print('✅ Whitelist contract should able to call this entrypoint')

    def test_51_non_whitelist_should_not_update_vestee(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)
        totalVestedAmount           = self.MVK(3000000)
        totalCliffInMonths          = 2
        totalConfigVestingInMonths        = 24
        totalClaimAmountPerMonth    = totalVestedAmount // totalConfigVestingInMonths
        newTotalVestedAmount        = self.MVK(3000000)
        newTotalCliffInMonths       = 2
        newTotalConfigVestingInMonths     = 24
        
        # Storage preparation
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
        res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalConfigVestingInMonths).interpret(storage=res.storage, sender=bob)
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=res.storage, sender=bob);

        # Assertions
        self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
        self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(totalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

        # Operation
        with self.raisesMichelsonError(error_codes.error_ONLY_COUNCIL_CONTRACT_OR_ADMINISTRATOR_ALLOWED):
            self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalConfigVestingInMonths).interpret(storage=res.storage, sender=alice)

        print('✅ Other contracts should not be able to call this entrypoint')
    
    def test_52_whitelist_should_not_update_vestee_if_doesnt_exists(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)
        newTotalVestedAmount        = self.MVK(3000000)
        newTotalCliffInMonths       = 2
        newTotalConfigVestingInMonths     = 24
        
        # Storage preparation
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);

        # Operation
        with self.raisesMichelsonError(error_codes.error_VESTEE_NOT_FOUND):
            self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalConfigVestingInMonths).interpret(storage=res.storage, sender=bob)
    
        print('✅ Whitelist contract should not be able to call this entrypoint if the vestee does not exist')

    ###
    # %claim
    ##
    def test_60_vestee_should_claim(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)
        totalVestedAmount           = self.MVK(3000000)
        totalCliffInMonths          = 2
        totalConfigVestingInMonths        = 24
        totalClaimAmountPerMonth    = totalVestedAmount // totalConfigVestingInMonths  
        currentTimestamp            = pytezos.now()

        # Storage preparation
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
        res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalConfigVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

        # Assertions
        self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
        self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(totalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

        # Operation
        firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1

        res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff)
        claimAmount = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

        print('--%claim--')
        print('✅ User should be able to call this entrypoint if it is a vestee')

    def test_61_vestee_should_claim(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)
        totalVestedAmount           = self.MVK(3000000)
        totalCliffInMonths          = 2
        totalConfigVestingInMonths        = 24
        totalClaimAmountPerMonth    = totalVestedAmount // totalConfigVestingInMonths  
        currentTimestamp            = pytezos.now()

        # Storage preparation
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
        res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalConfigVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

        # Assertions
        self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
        self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(totalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

        # Operation
        firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1

        res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff)
        claimAmount = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

        res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 30)
        claimAmount += int(res.operations[-1]['parameters']['value']['args'][-1]['int'])
        self.assertEqual(claimAmount, totalVestedAmount)

        print('✅ User should be able to claim previous months if it did not claimed for a long time')

    def test_62_vestee_should_claim(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)
        totalVestedAmount           = self.MVK(3000000)
        totalCliffInMonths          = 2
        totalConfigVestingInMonths        = 24
        totalClaimAmountPerMonth    = totalVestedAmount // totalConfigVestingInMonths  
        currentTimestamp            = pytezos.now()

        # Storage preparation
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
        res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalConfigVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

        # Assertions
        self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
        self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(totalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

        # Operation
        firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1

        res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 160)
        claimAmount = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])
        self.assertEqual(claimAmount, totalVestedAmount)

        print('✅ User should be able to claim after the vesting period without claiming extra token')

    def test_63_vestee_should_claim(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)
        totalVestedAmount           = self.MVK(3000000)
        totalCliffInMonths          = 2
        totalConfigVestingInMonths        = 24
        totalClaimAmountPerMonth    = totalVestedAmount // totalConfigVestingInMonths  
        currentTimestamp            = pytezos.now()

        # Storage preparation
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
        res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalConfigVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

        # Assertions
        self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
        self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(totalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

        # Operation
        firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1
        res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 10)
        claimAmount = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

        # Update process
        newTotalVestedAmount        = self.MVK(4000000)
        newTotalCliffInMonths       = 1
        newTotalConfigVestingInMonths     = 12

        res = self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalConfigVestingInMonths).interpret(storage=res.storage, sender=bob)

        # Assertions
        self.assertEqual(newTotalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(newTotalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(newTotalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

        # Operation
        res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 160)
        claimAmount += int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

        self.assertEqual(claimAmount, newTotalVestedAmount)

        print('✅ User should be able to claim the correct amount if its vestee record was updated during the process')

    def test_64_vestee_should_claim(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)
        totalVestedAmount           = self.MVK(3000000)
        totalCliffInMonths          = 0
        totalConfigVestingInMonths        = 24
        totalClaimAmountPerMonth    = totalVestedAmount // totalConfigVestingInMonths  
        currentTimestamp            = pytezos.now()

        # Storage preparation
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
        res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalConfigVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

        # Assertions
        self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
        self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(totalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

        # Operation
        firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1
        res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 13)
        claimAmount = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

        # Update process
        newTotalVestedAmount        = self.MVK(4000000)
        newTotalCliffInMonths       = 0
        newTotalConfigVestingInMonths     = 12

        res = self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalConfigVestingInMonths).interpret(storage=res.storage, sender=bob)

        # Assertions
        self.assertEqual(newTotalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(newTotalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(newTotalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

        # Operation
        res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 160)
        claimAmount += int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

        self.assertEqual(claimAmount, newTotalVestedAmount)

        print('✅ User should be able to claim without cliff period')

    def test_64_vestee_should_claim(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)
        totalVestedAmount           = self.MVK(3000000)
        totalCliffInMonths          = 4
        totalConfigVestingInMonths        = 24
        totalClaimAmountPerMonth    = totalVestedAmount // totalConfigVestingInMonths  
        currentTimestamp            = pytezos.now()

        # Storage preparation
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
        res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalConfigVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

        # Assertions
        self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
        self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(totalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

        # Operation
        firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1
        res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 5)
        claimAmount = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

        # Update process
        newTotalVestedAmount        = self.MVK(4000000)
        newTotalCliffInMonths       = 10
        newTotalConfigVestingInMonths     = 12

        res = self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalConfigVestingInMonths).interpret(storage=res.storage, sender=bob)

        # Assertions
        self.assertEqual(newTotalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(newTotalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(newTotalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

        # Operation
        res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 160)
        claimAmount += int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

        self.assertEqual(claimAmount, newTotalVestedAmount)

        print('✅ User should be able to claim with an updated longer cliff period')

    def test_61_non_vestee_should_not_claim(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)
        totalVestedAmount           = self.MVK(3000000)
        totalCliffInMonths          = 2
        totalConfigVestingInMonths        = 24
        totalClaimAmountPerMonth    = totalVestedAmount // totalConfigVestingInMonths
        currentTimestamp            = pytezos.now()
        firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1

        # Storage preparation
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
        res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalConfigVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

        # Assertions
        self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
        self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(totalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

        # Operation
        with self.raisesMichelsonError(error_codes.error_VESTEE_NOT_FOUND):
            self.vestingContract.claim().interpret(storage=res.storage, sender=alice, now=firstClaimAfterCliff)
        
        print('✅ User should not be able to call this entrypoint if it is not a vestee')

    def test_65_vestee_should_not_claim_if_locked(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)
        totalVestedAmount           = self.MVK(3000000)
        totalCliffInMonths          = 2
        totalConfigVestingInMonths        = 24
        totalClaimAmountPerMonth    = totalVestedAmount // totalConfigVestingInMonths
        currentTimestamp            = pytezos.now()
        firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1
        
        # Storage preparation
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
        res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalConfigVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)
        res = self.vestingContract.toggleVesteeLock(bob).interpret(storage=res.storage, sender=bob)

        # Assertions
        self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
        self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(totalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])
        self.assertEqual("LOCKED", res.storage['vesteeLedger'][bob]['status'])

        # Operation
        with self.raisesMichelsonError(error_codes.error_VESTEE_LOCKED):
            self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff)

        print('✅ User should not be able to call this entrypoint if its vesting is locked')

    def test_66_vestee_should_not_claim_if_already_claimed(self):
        # Initial values
        init_vesting_storage        = deepcopy(self.vestingStorage)
        totalVestedAmount           = self.MVK(3000000)
        totalCliffInMonths          = 2
        totalConfigVestingInMonths        = 24
        totalClaimAmountPerMonth    = totalVestedAmount // totalConfigVestingInMonths
        currentTimestamp            = pytezos.now()
        firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1
        
        # Storage preparation
        res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
        res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalConfigVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

        # Assertions
        self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
        self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
        self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
        self.assertEqual(totalConfigVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

        # Operation
        res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff)
        with self.raisesMichelsonError(error_codes.error_CANNOT_CLAIM_VESTING_REWARDS_NOW):
            self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff)

        print('✅ User should not be able to call this entrypoint if it already claimed during the same month')
