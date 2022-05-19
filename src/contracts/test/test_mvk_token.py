from unittest import TestCase
from contextlib import contextmanager
from copy import deepcopy
from pytezos import ContractInterface, MichelsonRuntimeError, pytezos
# from pytezos import ContractInterface, pytezos, format_timestamp, MichelsonRuntimeError
import time
import json
import os 


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
deployedMvkTokenContract = os.path.join(deploymentsDir, 'mvkTokenAddress.json')

deployedMvkToken = open(deployedMvkTokenContract)
mvkTokenAddress = json.load(deployedMvkToken)
mvkTokenAddress = mvkTokenAddress['address']

print('MVK Token Contract Deployed at: ' + mvkTokenAddress)

alice = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
admin = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
bob   = 'tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD'
eve   = 'tz1MnmtP4uAcgMpeZN6JtyziXeFqqwQG6yn6'
fox   = 'tz1R2oNqANNy2vZhnZBJc8iMEqW79t85Fv7L'

sec_day             = 86400
sec_week            = 604800
sec_month           = 2592000 # 30 days
sec_year            = sec_day * 365

error_only_administrator        = 'ONLY_ADMINISTRATOR_ALLOWED'
error_sender_not_allowed        = 'Error. Sender is not allowed to call this entrypoint.'
error_maximum_amount_exceeded   = 'MAXIMUM_SUPPLY_EXCEEDED'
error_too_soon                  = 'CANNOT_TRIGGER_INFLATION_NOW'

class MVKTokenContract(TestCase):
    
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
    
    # MVK Formatter
    def MVK(self, value: float = 1.0):
        return int(value * 10**int(mvkTokenDecimals))

    ######################
    # Tests for MVK Token contract #
    ######################
    
    ###
    # %setAdmin
    ##
    def test_00_admin_should_set_admin(self):
        # Initial values
        init_token_storage = deepcopy(self.mvkTokenStorage);

        # Operation
        res = self.mvkTokenContract.setAdmin(eve).interpret(storage=init_token_storage, sender=bob);

        # Assertions
        self.assertEqual(eve, res.storage['admin']);

        print('--%setAdmin--')
        print('✅ Admin should be able to call this entrypoint and update the contract administrator with a new address')

    def test_01_non_admin_should_not_set_admin(self):
        # Initial values
        init_token_storage = deepcopy(self.mvkTokenStorage);

        # Operation
        with self.raisesMichelsonError(error_only_administrator):
            self.mvkTokenContract.setAdmin(eve).interpret(storage=init_token_storage, sender=alice);

        print('✅ Non-admin should not be able to call this entrypoint')

    
    ###
    # %mint
    ##
    def test_10_whitelist_should_not_strongly_exceed_maximum(self):
        # Initial values
        init_token_storage  = deepcopy(self.mvkTokenStorage);
        maximumSupply       = int(init_token_storage["maximumSupply"])
        totalSupply         = int(init_token_storage["totalSupply"])
        inflationRate       = int(init_token_storage["inflationRate"])
        nextInflation       = int(init_token_storage["nextInflationTimestamp"])
        nextMaximumAmount   = maximumSupply + maximumSupply * inflationRate / 10000
        currentTimestamp    = pytezos.now()

        # Preparation
        res = self.mvkTokenContract.updateWhitelistContracts("bob", bob).interpret(storage=init_token_storage, sender=bob);
        res = self.mvkTokenContract.triggerInflation().interpret(storage=res.storage, sender=bob, now=currentTimestamp + sec_year + sec_week);

        # Operation
        with self.raisesMichelsonError(error_maximum_amount_exceeded):
            self.mvkTokenContract.mint(bob, self.MVK(10**20)).interpret(storage=res.storage, sender=bob, now=currentTimestamp + sec_year + sec_week);

        # Assertions
        print(maximumSupply)
        print(totalSupply)
        print(inflationRate)
        print(nextMaximumAmount)
        print(nextInflation)
        print(currentTimestamp)
        print(currentTimestamp + sec_year + sec_week)
        # self.assertEqual(eve, res.storage['admin']);

        print('--%mint--')
        print('✅ Whitelist should not be able to call this entrypoint and mint tokens if the amount it wants to mint strongly exceeds the maximum supply')

    def test_10_whitelist_should_not_exceed_maximum_if_year_has_not_passed(self):
        # Initial values
        init_token_storage = deepcopy(self.mvkTokenStorage);
        currentTimestamp   = pytezos.now()

        # Preparation
        res = self.mvkTokenContract.updateWhitelistContracts("bob", bob).interpret(storage=init_token_storage, sender=bob, now=currentTimestamp);

        # Operation
        with self.raisesMichelsonError(error_maximum_amount_exceeded):
            self.mvkTokenContract.mint(bob, self.MVK(10**9)).interpret(storage=res.storage, sender=bob, now=currentTimestamp + 1);

        print('✅ Whitelist should not be able to call this entrypoint and mint tokens if the amount it wants to mint exceeds the maximum supply and a year has not passed')

    ###
    # %mint
    ##
    def test_11_whitelist_should_exceed_maximum_if_year_has_passed(self):
        # Initial values
        init_token_storage  = deepcopy(self.mvkTokenStorage);
        currentTimestamp    = pytezos.now()
        maximumSupply       = int(init_token_storage["maximumSupply"])
        totalSupply         = int(init_token_storage["totalSupply"])
        inflationRate       = int(init_token_storage["inflationRate"])
        nextInflation       = int(init_token_storage["nextInflationTimestamp"])
        nextMaximumAmount   = maximumSupply + maximumSupply * inflationRate / 10000
        mintedAmount        = self.MVK(10**9)

        # Preparation
        res = self.mvkTokenContract.updateWhitelistContracts("bob", bob).interpret(storage=init_token_storage, sender=bob);
        res = self.mvkTokenContract.triggerInflation().interpret(storage=res.storage, sender=bob, now=currentTimestamp + sec_year + sec_week);
        
        # Operation
        res = self.mvkTokenContract.mint(bob, mintedAmount).interpret(storage=res.storage, sender=bob, now=currentTimestamp + sec_year + sec_week);

        # Assertions
        newMaximumSupply    = int(res.storage["maximumSupply"])
        newTotalSupply      = int(res.storage["totalSupply"])
        newNextInflation    = int(res.storage["nextInflationTimestamp"])
        self.assertEqual(nextMaximumAmount, newMaximumSupply)
        self.assertEqual(totalSupply + mintedAmount, newTotalSupply)
        self.assertEqual(currentTimestamp + sec_week + 2 * sec_year, newNextInflation)

        print('✅ Whitelist should be able to call this entrypoint and mint tokens if the amount it wants to mint exceeds the maximum supply and a year has passed')

    def test_11_whitelist_should_not_exceed_maximum_if_year_has_passed_and_not_another(self):
        # Initial values
        init_token_storage  = deepcopy(self.mvkTokenStorage);
        currentTimestamp    = pytezos.now()
        maximumSupply       = int(init_token_storage["maximumSupply"])
        totalSupply         = int(init_token_storage["totalSupply"])
        inflationRate       = int(init_token_storage["inflationRate"])
        nextInflation       = int(init_token_storage["nextInflationTimestamp"])
        nextMaximumAmount   = maximumSupply + maximumSupply * inflationRate / 10000
        mintedAmount        = self.MVK(10**9)

        # Preparation
        res = self.mvkTokenContract.updateWhitelistContracts("bob", bob).interpret(storage=init_token_storage, sender=bob);
        res = self.mvkTokenContract.triggerInflation().interpret(storage=res.storage, sender=bob, now=currentTimestamp + sec_year + sec_week);
        res = self.mvkTokenContract.mint(bob, mintedAmount).interpret(storage=res.storage, sender=bob, now=currentTimestamp + sec_year + sec_week);

        # Operation
        with self.raisesMichelsonError(error_maximum_amount_exceeded):
            self.mvkTokenContract.mint(bob, mintedAmount).interpret(storage=res.storage, sender=bob, now=currentTimestamp + sec_year * 2 + sec_week);

        print('✅ Whitelist should not be able to call this entrypoint and mint tokens if the amount it wants to mint exceeds the maximum supply and a year has passed (test with year 2)')

    def test_11_whitelist_should_not_exceed_maximum_if_year_has_passed_and_another(self):
        # Initial values
        init_token_storage      = deepcopy(self.mvkTokenStorage);
        currentTimestamp        = pytezos.now()
        maximumSupply           = int(init_token_storage["maximumSupply"])
        totalSupply             = int(init_token_storage["totalSupply"])
        inflationRate           = int(init_token_storage["inflationRate"])
        nextInflation           = int(init_token_storage["nextInflationTimestamp"])
        nextMaximumAmount       = maximumSupply + maximumSupply * inflationRate / 10000
        nextMaximumAmountTwo    = nextMaximumAmount + nextMaximumAmount * inflationRate / 10000
        firstMintedAmount       = self.MVK(10**9)
        secondMintedAmount      = round(nextMaximumAmount - maximumSupply + self.MVK(500))

        # Preparation
        res = self.mvkTokenContract.updateWhitelistContracts("bob", bob).interpret(storage=init_token_storage, sender=bob);
        res = self.mvkTokenContract.triggerInflation().interpret(storage=res.storage, sender=bob, now=currentTimestamp + sec_year + sec_week);
        res = self.mvkTokenContract.mint(bob, firstMintedAmount).interpret(storage=res.storage, sender=bob, now=currentTimestamp + sec_year + sec_week);
        res = self.mvkTokenContract.triggerInflation().interpret(storage=res.storage, sender=bob, now=currentTimestamp + sec_year * 2 + sec_week + 1);

        # Operation
        res = self.mvkTokenContract.mint(bob, secondMintedAmount).interpret(storage=res.storage, sender=bob, now=currentTimestamp + sec_year * 2 + sec_week + 1);

        # Assertions
        newMaximumSupply    = int(res.storage["maximumSupply"])
        newTotalSupply      = int(res.storage["totalSupply"])
        newNextInflation    = int(res.storage["nextInflationTimestamp"])
        self.assertEqual(nextMaximumAmountTwo, newMaximumSupply)
        self.assertEqual(totalSupply + firstMintedAmount + secondMintedAmount, newTotalSupply)
        self.assertEqual(currentTimestamp + sec_year * 3 + sec_week + 1, newNextInflation)

        print('✅ Whitelist should be able to call this entrypoint and mint tokens if the amount it wants to mint exceeds the maximum supply and a year has passed (test with year 2)')

    ###
    # %updateInflationRate
    ##
    def test_20_admin_should_update_inflation(self):
        # Initial values
        init_token_storage  = deepcopy(self.mvkTokenStorage);
        currentTimestamp    = pytezos.now()
        maximumSupply       = int(init_token_storage["maximumSupply"])
        totalSupply         = int(init_token_storage["totalSupply"])
        inflationRate       = int(init_token_storage["inflationRate"])
        nextInflation       = int(init_token_storage["nextInflationTimestamp"])
        inflationUpdated    = 1000;
        nextMaximumAmount   = maximumSupply + maximumSupply * inflationUpdated / 10000
        mintedAmount        = self.MVK(10**9)

        # Preparation
        res = self.mvkTokenContract.updateWhitelistContracts("bob", bob).interpret(storage=init_token_storage, sender=bob);

        # Operation
        res = self.mvkTokenContract.updateInflationRate(inflationUpdated).interpret(storage=res.storage, sender=bob, now=currentTimestamp + sec_year + sec_week);

        # Test mint
        res = self.mvkTokenContract.triggerInflation().interpret(storage=res.storage, sender=bob, now=currentTimestamp + sec_year + sec_week);
        res = self.mvkTokenContract.mint(bob, mintedAmount).interpret(storage=res.storage, sender=bob, now=currentTimestamp + sec_year + sec_week);

        # Assertions
        newMaximumSupply    = int(res.storage["maximumSupply"])
        newTotalSupply      = int(res.storage["totalSupply"])
        newInflationRate    = int(res.storage["inflationRate"])
        newNextInflation    = int(res.storage["nextInflationTimestamp"])
        self.assertEqual(nextMaximumAmount, newMaximumSupply)
        self.assertEqual(totalSupply + mintedAmount, newTotalSupply)
        self.assertEqual(currentTimestamp + 2*sec_year + sec_week, newNextInflation)
        self.assertEqual(inflationRate + 500, newInflationRate)
        self.assertEqual(newInflationRate, inflationUpdated)
        
        print('--%updateInflationRate--')
        print('✅ Admin should be able to call this entrypoint and update the inflation rate')

    def test_21_non_admin_should_not_update_inflation(self):
        # Initial values
        init_token_storage  = deepcopy(self.mvkTokenStorage);
        currentTimestamp    = pytezos.now()
        maximumSupply       = int(init_token_storage["maximumSupply"])
        totalSupply         = int(init_token_storage["totalSupply"])
        inflationRate       = int(init_token_storage["inflationRate"])
        nextInflation       = int(init_token_storage["nextInflationTimestamp"])
        inflationUpdated    = 1000;
        nextMaximumAmount   = maximumSupply + maximumSupply * inflationUpdated / 10000
        mintedAmount        = self.MVK(10**9)

        # Preparation
        res = self.mvkTokenContract.updateWhitelistContracts("bob", bob).interpret(storage=init_token_storage, sender=bob);

        # Operation
        res = self.mvkTokenContract.updateInflationRate(inflationUpdated).interpret(storage=res.storage, sender=bob, now=currentTimestamp + sec_year + sec_week);

        # Test mint
        res = self.mvkTokenContract.triggerInflation().interpret(storage=res.storage, sender=bob, now=currentTimestamp + sec_year + sec_week);
        res = self.mvkTokenContract.mint(bob, mintedAmount).interpret(storage=res.storage, sender=bob, now=currentTimestamp + sec_year + sec_week);

        # Assertions
        newMaximumSupply    = int(res.storage["maximumSupply"])
        newTotalSupply      = int(res.storage["totalSupply"])
        newInflationRate    = int(res.storage["inflationRate"])
        newNextInflation    = int(res.storage["nextInflationTimestamp"])
        self.assertEqual(nextMaximumAmount, newMaximumSupply)
        self.assertEqual(totalSupply + mintedAmount, newTotalSupply)
        self.assertEqual(currentTimestamp + 2 * sec_year + sec_week, newNextInflation)
        self.assertEqual(inflationRate + 500, newInflationRate)
        self.assertEqual(newInflationRate, inflationUpdated)

        print('✅ Non-admin should not be able to call this entrypoint and update the inflation rate')

    ###
    # %triggerInflation
    ##
    def test_30_admin_should_trigger_inflation(self):
        # Initial values
        init_token_storage  = deepcopy(self.mvkTokenStorage);
        currentTimestamp    = pytezos.now()
        maximumSupply       = int(init_token_storage["maximumSupply"])
        nextInflation       = int(init_token_storage["nextInflationTimestamp"])
        inflationUpdated    = 1000;

        # Operation
        res = self.mvkTokenContract.triggerInflation().interpret(storage=init_token_storage, sender=bob, now=currentTimestamp + sec_year + sec_week);

        # Assertions
        newMaximumSupply    = int(res.storage["maximumSupply"])
        newNextInflation    = int(res.storage["nextInflationTimestamp"])
        self.assertEqual(currentTimestamp + 2 * sec_year + sec_week, newNextInflation)
        
        print('--%triggerInflation--')
        print('✅ Admin should be able to call this entrypoint and trigger the inflation')

    def test_31_non_admin_should_not_trigger_inflation(self):
        # Initial values
        init_token_storage  = deepcopy(self.mvkTokenStorage);
        currentTimestamp    = pytezos.now()

        # Operation
        with self.raisesMichelsonError(error_only_administrator):
            self.mvkTokenContract.triggerInflation().interpret(storage=init_token_storage, sender=alice, now=currentTimestamp + sec_year + sec_week);

        print('✅ Non-admin should not be able to call this entrypoint and trigger the inflation')

    def test_31_admin_should_not_trigger_inflation_if_not_time(self):
        # Initial values
        init_token_storage  = deepcopy(self.mvkTokenStorage);
        currentTimestamp    = pytezos.now()

        # Operation
        with self.raisesMichelsonError(error_too_soon):
            self.mvkTokenContract.triggerInflation().interpret(storage=init_token_storage, sender=bob, now=currentTimestamp);

        print('✅ Admin should not be able to call this entrypoint and trigger the inflation if a year has not passed')
