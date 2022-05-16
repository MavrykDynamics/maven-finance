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
<<<<<<< HEAD
import error_codes
=======

>>>>>>> 92623556 (Token sale contract updates and token sale tests)

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
deployedTokenSaleContract = os.path.join(deploymentsDir, 'tokenSaleAddress.json')
deployedMvkTokenContract = os.path.join(deploymentsDir, 'mvkTokenAddress.json')
deployedTreasuryContract = os.path.join(deploymentsDir, 'treasuryAddress.json')

deployedTokenSale = open(deployedTokenSaleContract)
tokenSaleContractAddress = json.load(deployedTokenSale)
tokenSaleContractAddress = tokenSaleContractAddress['address']

deployedMvkToken = open(deployedMvkTokenContract)
mvkTokenAddress = json.load(deployedMvkToken)
mvkTokenAddress = mvkTokenAddress['address']

deployedTreasury = open(deployedTreasuryContract)
treasuryContractAddress = json.load(deployedTreasury)
treasuryContractAddress = treasuryContractAddress['address']

print('Token Sale Contract Deployed at: ' + tokenSaleContractAddress)
print('MVK Token Address Deployed at: ' + mvkTokenAddress)
print('Treasury Contract Deployed at: ' + treasuryContractAddress)

alice = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
admin = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
bob   = 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6'
eve   = 'tz1MnmtP4uAcgMpeZN6JtyziXeFqqwQG6yn6'
fox   = 'tz1R2oNqANNy2vZhnZBJc8iMEqW79t85Fv7L'
mallory = 'tz1TJTq4Rcx4hqCxkGnmwJRpqeDNzoEpjk6n'

<<<<<<< HEAD
sec_hour  = 3600
=======
>>>>>>> 92623556 (Token sale contract updates and token sale tests)
sec_day   = 86400
sec_week  = 604800
sec_month = 2592000 # 30 days

blocks_day = 2880
blocks_month = blocks_day * 30 # 86400 per month

<<<<<<< HEAD
=======
error_only_administrator    = 0
error_sender_not_allowed    = 'Error. Sender is not allowed to call this entrypoint.'
error_unable_to_claim_now   = 'Error. You are unable to claim now.'
error_vestee_is_locked      = 'Error. Vestee is locked.'
error_vestee_not_found      = 'Error. Vestee is not found.'
error_vestee_exists         = 'Error. Vestee already exists'
error_vestee_doesnt_exists = 'Error. Vestee is not found.'

>>>>>>> 92623556 (Token sale contract updates and token sale tests)
class TokenSaleContract(TestCase):
    
    @classmethod
    def setUpClass(cls):
        
        cls.tokenSaleContract = pytezos.contract(tokenSaleContractAddress)
        cls.tokenSaleStorage  = cls.tokenSaleContract.storage()
        
        cls.mvkTokenContract = pytezos.contract(mvkTokenAddress)
        cls.mvkTokenStorage  = cls.mvkTokenContract.storage()

        cls.treasuryContract = pytezos.contract(treasuryContractAddress)
        cls.treasuryStorage  = cls.treasuryContract.storage()
        
        
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
    # Tests for Token Sale contract #
    ######################
    
    ###
    # %setAdmin
    ##
    def test_00_admin_should_set_admin(self):
        # Initial values
        init_token_sale_storage = deepcopy(self.tokenSaleStorage)

        # Operation
<<<<<<< HEAD
        res = self.tokenSaleContract.setAdmin(eve).interpret(storage = init_token_sale_storage, sender = bob)
=======
        res = self.tokenSaleContract.setAdmin(eve).interpret(storage=init_token_sale_storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # Assertions
        self.assertEqual(eve, res.storage['admin'])

        print('--%setAdmin--')
        print('✅ Admin should be able to call this entrypoint and update the contract administrator with a new address')

    def test_01_non_admin_should_not_set_admin(self):
        # Initial values
        init_token_sale_storage = deepcopy(self.tokenSaleStorage)

        # Operation
<<<<<<< HEAD
        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.setAdmin(eve).interpret(storage = init_token_sale_storage, sender = alice);
=======
        with self.raisesMichelsonError(error_only_administrator):
            self.tokenSaleContract.setAdmin(eve).interpret(storage=init_token_sale_storage, sender=alice);
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        print('✅ Non-admin should not be able to call this entrypoint')

    ###
<<<<<<< HEAD
    # %updateMetadata
    ##



    ###
    # %updateConfig
    ##
    def test_20_admin_can_update_config(self):
=======
    # %updateConfig
    ##
    def test_10_admin_can_update_config(self):
>>>>>>> 92623556 (Token sale contract updates and token sale tests)
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)

        # Assertions (initial storage)
        self.assertEqual(init_token_sale_storage['config']["maxAmountOptionOnePerWalletTotal"]   , 200000000)
        self.assertEqual(init_token_sale_storage['config']["maxAmountOptionTwoPerWalletTotal"]   , 200000000)
        self.assertEqual(init_token_sale_storage['config']["maxAmountOptionThreePerWalletTotal"] , 200000000)

        self.assertEqual(init_token_sale_storage['config']["whitelistMaxAmountOptionOneTotal"]   , 100000000)
        self.assertEqual(init_token_sale_storage['config']["whitelistMaxAmountOptionTwoTotal"]   , 100000000)
        self.assertEqual(init_token_sale_storage['config']["whitelistMaxAmountOptionThreeTotal"] , 100000000)

        self.assertEqual(init_token_sale_storage['config']["optionOneMaxAmountCap"]              , 600000000000)
        self.assertEqual(init_token_sale_storage['config']["optionTwoMaxAmountCap"]              , 630000000000)
        self.assertEqual(init_token_sale_storage['config']["optionThreeMaxAmountCap"]            , 560000000000)

        self.assertEqual(init_token_sale_storage['config']["vestingOptionOneInMonths"]           , 6)
        self.assertEqual(init_token_sale_storage['config']["vestingOptionTwoInMonths"]           , 8)
        self.assertEqual(init_token_sale_storage['config']["vestingOptionThreeInMonths"]         , 12)

        self.assertEqual(init_token_sale_storage['config']["optionOneTezPerToken"]               , 100000)
        self.assertEqual(init_token_sale_storage['config']["optionTwoTezPerToken"]               , 90000)
        self.assertEqual(init_token_sale_storage['config']["optionThreeTezPerToken"]             , 80000)

        self.assertEqual(init_token_sale_storage['config']["minOptionOneAmountInTez"]            , 30000000)
        self.assertEqual(init_token_sale_storage['config']["minOptionTwoAmountInTez"]            , 30000000)
        self.assertEqual(init_token_sale_storage['config']["minOptionThreeAmountInTez"]          , 30000000)

        self.assertEqual(init_token_sale_storage['config']["blocksPerMinute"]                    , 2)

        # new config values
        newMaxAmountOptionOnePerWalletTotal   = 300000000
        newMaxAmountOptionTwoPerWalletTotal   = 300000000
        newMaxAmountOptionThreePerWalletTotal = 300000000

        newWhitelistMaxAmountOptionOneTotal   = 200000000
        newWhitelistMaxAmountOptionTwoTotal   = 200000000
        newWhitelistMaxAmountOptionThreeTotal = 200000000

        newOptionOneMaxAmountCap              = 700000000000
        newOptionTwoMaxAmountCap              = 700000000000
        newOptionThreeMaxAmountCap            = 700000000000

        newVestingOptionOneInMonths           = 3
        newVestingOptionTwoInMonths           = 4
        newVestingOptionThreeInMonths         = 5

        newOptionOneTezPerToken               = 200000
        newOptionTwoTezPerToken               = 150000
        newOptionThreeTezPerToken             = 100000

        newMinOptionOneAmountInTez            = 50000000
        newMinOptionTwoAmountInTez            = 50000000
        newMinOptionThreeAmountInTez          = 50000000

        newBlocksPerMinute                    = 3

<<<<<<< HEAD
        # Operations
=======
        # Operation
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # max amount by option per wallet total
        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "maxAmountOptOnePerWalletTotal",
            "updateConfigNewValue" : newMaxAmountOptionOnePerWalletTotal
<<<<<<< HEAD
        }).interpret(storage = init_token_sale_storage, sender = bob)
=======
        }).interpret(storage=init_token_sale_storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "maxAmountOptTwoPerWalletTotal",
            "updateConfigNewValue" : newMaxAmountOptionTwoPerWalletTotal
<<<<<<< HEAD
        }).interpret(storage = res.storage, sender = bob)
=======
        }).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "maxAmountOptThreePerWalletTotal",
            "updateConfigNewValue" : newMaxAmountOptionThreePerWalletTotal
<<<<<<< HEAD
        }).interpret(storage = res.storage, sender = bob)
=======
        }).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # whitelist max amount by option 
        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "whitelistMaxAmountOptOneTotal",
            "updateConfigNewValue" : newWhitelistMaxAmountOptionOneTotal
<<<<<<< HEAD
        }).interpret(storage = res.storage, sender = bob)
=======
        }).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "whitelistMaxAmountOptTwoTotal",
            "updateConfigNewValue" : newWhitelistMaxAmountOptionTwoTotal
<<<<<<< HEAD
        }).interpret(storage = res.storage, sender = bob)
=======
        }).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "whitelistMaxAmountOptThreeTotal",
            "updateConfigNewValue" : newWhitelistMaxAmountOptionThreeTotal
<<<<<<< HEAD
        }).interpret(storage = res.storage, sender = bob)
=======
        }).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # options max amount cap
        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "optionOneMaxAmountCap",
            "updateConfigNewValue" : newOptionOneMaxAmountCap
<<<<<<< HEAD
        }).interpret(storage = res.storage, sender = bob)
=======
        }).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "optionTwoMaxAmountCap",
            "updateConfigNewValue" : newOptionTwoMaxAmountCap
<<<<<<< HEAD
        }).interpret(storage = res.storage, sender = bob)
=======
        }).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "optionThreeMaxAmountCap",
            "updateConfigNewValue" : newOptionThreeMaxAmountCap
<<<<<<< HEAD
        }).interpret(storage = res.storage, sender = bob)
=======
        }).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # vesting option in months
        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "vestingOptionOneInMonths",
            "updateConfigNewValue" : newVestingOptionOneInMonths
<<<<<<< HEAD
        }).interpret(storage = res.storage, sender = bob)
=======
        }).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "vestingOptionTwoInMonths",
            "updateConfigNewValue" : newVestingOptionTwoInMonths
<<<<<<< HEAD
        }).interpret(storage = res.storage, sender = bob)
=======
        }).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "vestingOptionThreeInMonths",
            "updateConfigNewValue" : newVestingOptionThreeInMonths
<<<<<<< HEAD
        }).interpret(storage = res.storage, sender = bob)
=======
        }).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # options tez per token
        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "optionOneTezPerToken",
            "updateConfigNewValue" : newOptionOneTezPerToken
<<<<<<< HEAD
        }).interpret(storage = res.storage, sender = bob)
=======
        }).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "optionTwoTezPerToken",
            "updateConfigNewValue" : newOptionTwoTezPerToken
<<<<<<< HEAD
        }).interpret(storage = res.storage, sender = bob)
=======
        }).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "optionThreeTezPerToken",
            "updateConfigNewValue" : newOptionThreeTezPerToken
<<<<<<< HEAD
        }).interpret(storage = res.storage, sender = bob)
=======
        }).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # min option amount in tez
        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "minOptionOneAmountInTez",
            "updateConfigNewValue" : newMinOptionOneAmountInTez
<<<<<<< HEAD
        }).interpret(storage = res.storage, sender = bob)
=======
        }).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "minOptionTwoAmountInTez",
            "updateConfigNewValue" : newMinOptionTwoAmountInTez
<<<<<<< HEAD
        }).interpret(storage = res.storage, sender = bob)
=======
        }).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "minOptionThreeAmountInTez",
            "updateConfigNewValue" : newMinOptionThreeAmountInTez
<<<<<<< HEAD
        }).interpret(storage = res.storage, sender = bob)
=======
        }).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # blocks per minute
        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "blocksPerMinute",
            "updateConfigNewValue" : newBlocksPerMinute
<<<<<<< HEAD
        }).interpret(storage = res.storage, sender = bob)
=======
        }).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)
        
        # Assertions
        self.assertEqual(res.storage['config']["maxAmountOptionOnePerWalletTotal"]   , newMaxAmountOptionOnePerWalletTotal)
        self.assertEqual(res.storage['config']["maxAmountOptionTwoPerWalletTotal"]   , newMaxAmountOptionTwoPerWalletTotal)
        self.assertEqual(res.storage['config']["maxAmountOptionThreePerWalletTotal"] , newMaxAmountOptionThreePerWalletTotal)

        self.assertEqual(res.storage['config']["whitelistMaxAmountOptionOneTotal"]   , newWhitelistMaxAmountOptionOneTotal)
        self.assertEqual(res.storage['config']["whitelistMaxAmountOptionTwoTotal"]   , newWhitelistMaxAmountOptionTwoTotal)
        self.assertEqual(res.storage['config']["whitelistMaxAmountOptionThreeTotal"] , newWhitelistMaxAmountOptionThreeTotal)

        self.assertEqual(res.storage['config']["optionOneMaxAmountCap"]              , newOptionOneMaxAmountCap)
        self.assertEqual(res.storage['config']["optionTwoMaxAmountCap"]              , newOptionTwoMaxAmountCap)
        self.assertEqual(res.storage['config']["optionThreeMaxAmountCap"]            , newOptionThreeMaxAmountCap)

        self.assertEqual(res.storage['config']["vestingOptionOneInMonths"]           , newVestingOptionOneInMonths)
        self.assertEqual(res.storage['config']["vestingOptionTwoInMonths"]           , newVestingOptionTwoInMonths)
        self.assertEqual(res.storage['config']["vestingOptionThreeInMonths"]         , newVestingOptionThreeInMonths)

        self.assertEqual(res.storage['config']["optionOneTezPerToken"]               , newOptionOneTezPerToken)
        self.assertEqual(res.storage['config']["optionTwoTezPerToken"]               , newOptionTwoTezPerToken)
        self.assertEqual(res.storage['config']["optionThreeTezPerToken"]             , newOptionThreeTezPerToken)

        self.assertEqual(res.storage['config']["minOptionOneAmountInTez"]            , newMinOptionOneAmountInTez)
        self.assertEqual(res.storage['config']["minOptionTwoAmountInTez"]            , newMinOptionTwoAmountInTez)
        self.assertEqual(res.storage['config']["minOptionThreeAmountInTez"]          , newMinOptionThreeAmountInTez)

        self.assertEqual(res.storage['config']["blocksPerMinute"]                    , newBlocksPerMinute)
        
        print('--%updateConfig--')
<<<<<<< HEAD
        print('✅ Admin can update config variables')

    def test_21_non_admin_should_not_be_able_to_update_config(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)

        # Assertions (initial storage)
        self.assertEqual(init_token_sale_storage['config']["maxAmountOptionOnePerWalletTotal"]   , 200000000)
        self.assertEqual(init_token_sale_storage['config']["maxAmountOptionTwoPerWalletTotal"]   , 200000000)
        self.assertEqual(init_token_sale_storage['config']["maxAmountOptionThreePerWalletTotal"] , 200000000)

        self.assertEqual(init_token_sale_storage['config']["whitelistMaxAmountOptionOneTotal"]   , 100000000)
        self.assertEqual(init_token_sale_storage['config']["whitelistMaxAmountOptionTwoTotal"]   , 100000000)
        self.assertEqual(init_token_sale_storage['config']["whitelistMaxAmountOptionThreeTotal"] , 100000000)

        self.assertEqual(init_token_sale_storage['config']["optionOneMaxAmountCap"]              , 600000000000)
        self.assertEqual(init_token_sale_storage['config']["optionTwoMaxAmountCap"]              , 630000000000)
        self.assertEqual(init_token_sale_storage['config']["optionThreeMaxAmountCap"]            , 560000000000)

        self.assertEqual(init_token_sale_storage['config']["vestingOptionOneInMonths"]           , 6)
        self.assertEqual(init_token_sale_storage['config']["vestingOptionTwoInMonths"]           , 8)
        self.assertEqual(init_token_sale_storage['config']["vestingOptionThreeInMonths"]         , 12)

        self.assertEqual(init_token_sale_storage['config']["optionOneTezPerToken"]               , 100000)
        self.assertEqual(init_token_sale_storage['config']["optionTwoTezPerToken"]               , 90000)
        self.assertEqual(init_token_sale_storage['config']["optionThreeTezPerToken"]             , 80000)

        self.assertEqual(init_token_sale_storage['config']["minOptionOneAmountInTez"]            , 30000000)
        self.assertEqual(init_token_sale_storage['config']["minOptionTwoAmountInTez"]            , 30000000)
        self.assertEqual(init_token_sale_storage['config']["minOptionThreeAmountInTez"]          , 30000000)

        self.assertEqual(init_token_sale_storage['config']["blocksPerMinute"]                    , 2)

        # new config values
        newMaxAmountOptionOnePerWalletTotal   = 300000000
        newMaxAmountOptionTwoPerWalletTotal   = 300000000
        newMaxAmountOptionThreePerWalletTotal = 300000000

        newWhitelistMaxAmountOptionOneTotal   = 200000000
        newWhitelistMaxAmountOptionTwoTotal   = 200000000
        newWhitelistMaxAmountOptionThreeTotal = 200000000

        newOptionOneMaxAmountCap              = 700000000000
        newOptionTwoMaxAmountCap              = 700000000000
        newOptionThreeMaxAmountCap            = 700000000000

        newVestingOptionOneInMonths           = 3
        newVestingOptionTwoInMonths           = 4
        newVestingOptionThreeInMonths         = 5

        newOptionOneTezPerToken               = 200000
        newOptionTwoTezPerToken               = 150000
        newOptionThreeTezPerToken             = 100000

        newMinOptionOneAmountInTez            = 50000000
        newMinOptionTwoAmountInTez            = 50000000
        newMinOptionThreeAmountInTez          = 50000000

        newBlocksPerMinute                    = 3

        # Operation
        # max amount by option per wallet total
        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.updateConfig({
              "updateConfigAction"   : "maxAmountOptOnePerWalletTotal",
              "updateConfigNewValue" : newMaxAmountOptionOnePerWalletTotal
            }).interpret(storage = init_token_sale_storage, sender = eve)

        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.updateConfig({
              "updateConfigAction"   : "maxAmountOptTwoPerWalletTotal",
              "updateConfigNewValue" : newMaxAmountOptionTwoPerWalletTotal
            }).interpret(storage = init_token_sale_storage, sender = eve)

        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.updateConfig({
              "updateConfigAction"   : "maxAmountOptThreePerWalletTotal",
              "updateConfigNewValue" : newMaxAmountOptionThreePerWalletTotal
            }).interpret(storage = init_token_sale_storage, sender = eve)

        # whitelist max amount by option 
        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.updateConfig({
              "updateConfigAction"   : "whitelistMaxAmountOptOneTotal",
              "updateConfigNewValue" : newWhitelistMaxAmountOptionOneTotal
            }).interpret(storage = init_token_sale_storage, sender = eve)

        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.updateConfig({
              "updateConfigAction"   : "whitelistMaxAmountOptTwoTotal",
              "updateConfigNewValue" : newWhitelistMaxAmountOptionTwoTotal
            }).interpret(storage = init_token_sale_storage, sender = eve)
        
        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.updateConfig({
              "updateConfigAction"   : "whitelistMaxAmountOptThreeTotal",
              "updateConfigNewValue" : newWhitelistMaxAmountOptionThreeTotal
            }).interpret(storage = init_token_sale_storage, sender = eve)

        # options max amount cap
        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.updateConfig({
              "updateConfigAction"   : "optionOneMaxAmountCap",
              "updateConfigNewValue" : newOptionOneMaxAmountCap
            }).interpret(storage = init_token_sale_storage, sender = eve)

        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.updateConfig({
              "updateConfigAction"   : "optionTwoMaxAmountCap",
              "updateConfigNewValue" : newOptionTwoMaxAmountCap
            }).interpret(storage = init_token_sale_storage, sender = eve)

        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.updateConfig({
              "updateConfigAction"   : "optionThreeMaxAmountCap",
              "updateConfigNewValue" : newOptionThreeMaxAmountCap
            }).interpret(storage = init_token_sale_storage, sender = eve)

        # vesting option in months
        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.updateConfig({
              "updateConfigAction"   : "vestingOptionOneInMonths",
              "updateConfigNewValue" : newVestingOptionOneInMonths
            }).interpret(storage = init_token_sale_storage, sender = eve)

        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.updateConfig({
              "updateConfigAction"   : "vestingOptionTwoInMonths",
              "updateConfigNewValue" : newVestingOptionTwoInMonths
            }).interpret(storage = init_token_sale_storage, sender = eve)

        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.updateConfig({
              "updateConfigAction"   : "vestingOptionThreeInMonths",
              "updateConfigNewValue" : newVestingOptionThreeInMonths
            }).interpret(storage = init_token_sale_storage, sender = eve)

        # options tez per token
        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.updateConfig({
              "updateConfigAction"   : "optionOneTezPerToken",
              "updateConfigNewValue" : newOptionOneTezPerToken
            }).interpret(storage = init_token_sale_storage, sender = eve)

        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.updateConfig({
              "updateConfigAction"   : "optionTwoTezPerToken",
              "updateConfigNewValue" : newOptionTwoTezPerToken
            }).interpret(storage = init_token_sale_storage, sender = eve)

        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.updateConfig({
              "updateConfigAction"   : "optionThreeTezPerToken",
              "updateConfigNewValue" : newOptionThreeTezPerToken
            }).interpret(storage = init_token_sale_storage, sender = eve)

        # min option amount in tez
        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.updateConfig({
              "updateConfigAction"   : "minOptionOneAmountInTez",
              "updateConfigNewValue" : newMinOptionOneAmountInTez
            }).interpret(storage = init_token_sale_storage, sender = eve)

        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.updateConfig({
              "updateConfigAction"   : "minOptionTwoAmountInTez",
              "updateConfigNewValue" : newMinOptionTwoAmountInTez
            }).interpret(storage = init_token_sale_storage, sender = eve)

        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.updateConfig({
              "updateConfigAction"   : "minOptionThreeAmountInTez",
              "updateConfigNewValue" : newMinOptionThreeAmountInTez
            }).interpret(storage = init_token_sale_storage, sender = eve)

        # blocks per minute
        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.updateConfig({
              "updateConfigAction"   : "blocksPerMinute",
              "updateConfigNewValue" : newBlocksPerMinute
            }).interpret(storage = init_token_sale_storage, sender = eve)
      
        print('✅ Non-admin should not be able to update config variables')

    ###
    # %setWhitelistDateTime
    ##
    def test_30_admin_can_set_whitelist_date_time(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        whitelistStartDateTime     = pytezos.now()
        whitelistEndDateTime       = pytezos.now() + 3 * sec_day

        # Operation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)

        # Assertions
        self.assertEqual(res.storage['whitelistStartDateTime'], whitelistStartDateTime)
        self.assertEqual(res.storage['whitelistEndDateTime'], whitelistEndDateTime)

        print('--%setWhitelistDateTime--')
        print('✅ Admin can set whitelist date time')

    def test_30_non_admin_should_not_be_able_to_set_whitelist_date_time(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        whitelistStartDateTime     = pytezos.now()
        whitelistEndDateTime       = pytezos.now() + 3 * sec_day

        # Operation
        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = eve)

        print('✅ Non-admin should not be able to set whitelist date time')
=======
        print('✅ Admin can update config')

>>>>>>> 92623556 (Token sale contract updates and token sale tests)

    ###
    # %addToWhitelist
    ##
<<<<<<< HEAD
    def test_40_admin_can_add_single_user_to_whitelist(self):
=======
    def test_20_admin_can_add_single_user_to_whitelist(self):
>>>>>>> 92623556 (Token sale contract updates and token sale tests)
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)

        # Operation
<<<<<<< HEAD
        res = self.tokenSaleContract.addToWhitelist([eve]).interpret(storage = init_token_sale_storage, sender = bob)
=======
        res = self.tokenSaleContract.addToWhitelist([eve]).interpret(storage=init_token_sale_storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # Assertions
        self.assertEqual(res.storage['whitelistedAddresses'][eve], True)
        
        print('--%addToWhitelist--')
        print('✅ Admin can add a single user to whitelist')

<<<<<<< HEAD
    def test_41_non_admin_should_not_add_be_able_to_whitelist(self):
=======
    def test_21_non_admin_should_not_add_be_able_to_whitelist(self):
>>>>>>> 92623556 (Token sale contract updates and token sale tests)
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
        # Operation
<<<<<<< HEAD
        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.addToWhitelist([bob]).interpret(storage = init_token_sale_storage, sender = eve)

        print('✅ Non-admin should not be able to add to whitelist')

    def test_42_admin_can_add_multiple_users_to_whitelist(self):
=======
        with self.raisesMichelsonError(error_only_administrator):
            self.tokenSaleContract.addToWhitelist([bob]).interpret(storage=init_token_sale_storage, sender=eve)

        print('✅ Non-admin should not be able to add to whitelist')

    def test_22_admin_can_add_multiple_users_to_whitelist(self):
>>>>>>> 92623556 (Token sale contract updates and token sale tests)
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)

        # Operation
<<<<<<< HEAD
        res = self.tokenSaleContract.addToWhitelist([eve,fox,mallory]).interpret(storage = init_token_sale_storage, sender = bob)
=======
        res = self.tokenSaleContract.addToWhitelist([eve,fox,mallory]).interpret(storage=init_token_sale_storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # Assertions
        self.assertEqual(res.storage['whitelistedAddresses'][eve], True)
        self.assertEqual(res.storage['whitelistedAddresses'][fox], True)
        self.assertEqual(res.storage['whitelistedAddresses'][mallory], True)
        
        print('✅ Admin can add multiple users to whitelist')
        
<<<<<<< HEAD
    def test_43_if_whitelist_user_already_exists_nothing_happens(self):
=======
    def test_23_if_whitelist_user_already_exists_nothing_happens(self):
>>>>>>> 92623556 (Token sale contract updates and token sale tests)
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)

        # Operation
<<<<<<< HEAD
        res = self.tokenSaleContract.addToWhitelist([eve,fox,mallory]).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.addToWhitelist([eve,fox]).interpret(storage = res.storage, sender = bob)
=======
        res = self.tokenSaleContract.addToWhitelist([eve,fox,mallory]).interpret(storage=init_token_sale_storage, sender=bob)
        res = self.tokenSaleContract.addToWhitelist([eve,fox]).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # Assertions
        self.assertEqual(res.storage['whitelistedAddresses'][eve], True)
        self.assertEqual(res.storage['whitelistedAddresses'][fox], True)
        self.assertEqual(res.storage['whitelistedAddresses'][mallory], True)
        
        print('✅ If user is already in whitelist addreses, nothing happens')

    # ###
    # # %removeFromWhitelist
    # ##
<<<<<<< HEAD
    def test_50_admin_can_remove_single_user_from_whitelist(self):
=======
    def test_30_admin_can_remove_single_user_from_whitelist(self):
>>>>>>> 92623556 (Token sale contract updates and token sale tests)
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)

        # Operations
<<<<<<< HEAD
        res = self.tokenSaleContract.addToWhitelist([eve,fox,mallory]).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.removeFromWhitelist([eve]).interpret(storage = res.storage, sender = bob)
=======
        res = self.tokenSaleContract.addToWhitelist([eve,fox,mallory]).interpret(storage=init_token_sale_storage, sender=bob)
        res = self.tokenSaleContract.removeFromWhitelist([eve]).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # Assertions
        self.assertEqual(res.storage['whitelistedAddresses'][eve], None)    # eve removed from whitelisted addresses
        self.assertEqual(res.storage['whitelistedAddresses'][fox], True)
        self.assertEqual(res.storage['whitelistedAddresses'][mallory], True)

        print('--%removeFromWhitelist--')
        print('✅ Admin can remove single user from whitelist')

<<<<<<< HEAD
    def test_51_admin_can_remove_multiple_users_from_whitelist(self):
=======
    def test_31_admin_can_remove_multiple_users_from_whitelist(self):
>>>>>>> 92623556 (Token sale contract updates and token sale tests)
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)

        # Operations
<<<<<<< HEAD
        res = self.tokenSaleContract.addToWhitelist([eve,fox,mallory]).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.removeFromWhitelist([eve,fox,mallory]).interpret(storage = res.storage, sender = bob)
=======
        res = self.tokenSaleContract.addToWhitelist([eve,fox,mallory]).interpret(storage=init_token_sale_storage, sender=bob)
        res = self.tokenSaleContract.removeFromWhitelist([eve,fox,mallory]).interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # Assertions
        self.assertEqual(res.storage['whitelistedAddresses'][eve], None)      # eve removed from whitelisted addresses
        self.assertEqual(res.storage['whitelistedAddresses'][fox], None)      # fox removed from whitelisted addresses
        self.assertEqual(res.storage['whitelistedAddresses'][mallory], None)  # mallory removed from whitelisted addresses

        print('✅ Admin can remove multiple users from whitelist')


<<<<<<< HEAD
    def test_52_non_admin_should_not_be_able_to_remove_whitelist_users(self):
=======
    def test_32_non_admin_should_not_be_able_to_remove_whitelist_users(self):
>>>>>>> 92623556 (Token sale contract updates and token sale tests)
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)

        # Storage preparation
<<<<<<< HEAD
        res = self.tokenSaleContract.addToWhitelist([eve,fox,mallory]).interpret(storage = init_token_sale_storage, sender = bob)
=======
        res = self.tokenSaleContract.addToWhitelist([eve,fox,mallory]).interpret(storage=init_token_sale_storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # Assertions
        self.assertEqual(res.storage['whitelistedAddresses'][eve], True) 
        self.assertEqual(res.storage['whitelistedAddresses'][fox], True)
        self.assertEqual(res.storage['whitelistedAddresses'][mallory], True)

        # Operation
<<<<<<< HEAD
        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
            self.tokenSaleContract.removeFromWhitelist([fox,mallory]).interpret(storage = res.storage, sender = eve)

        print('✅ Non-admin should not be able to remove whitelist users')

    def test_53_nothing_happens_if_non_existent_user_is_removed_from_whitelisted_addresses(self):
=======
        with self.raisesMichelsonError(error_only_administrator):
            self.tokenSaleContract.removeFromWhitelist([fox,mallory]).interpret(storage=res.storage, sender=eve)

        print('✅ Non-admin should not be able to remove whitelist users')

    def test_33_nothing_happens_if_non_existent_user_is_removed_from_whitelisted_addresses(self):
>>>>>>> 92623556 (Token sale contract updates and token sale tests)
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
        # Operation
<<<<<<< HEAD
        res = self.tokenSaleContract.removeFromWhitelist([fox]).interpret(storage = init_token_sale_storage, sender = bob)
=======
        res = self.tokenSaleContract.removeFromWhitelist([fox]).interpret(storage=init_token_sale_storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # Assertions
        with pytest.raises(KeyError):
          _ = res.storage['whitelistedAddresses'][fox] # check that fox user does not exist in whitelisted addresses key
        
        print('✅ Nothing happens if non existent user is removed from whitelisted addresses')

    # ###
    # # %startSale
    # ##
<<<<<<< HEAD
    def test_60_admin_should_be_able_to_start_sale(self):
=======
    def test_40_admin_should_be_able_to_start_sale(self):
>>>>>>> 92623556 (Token sale contract updates and token sale tests)
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
        # Operation
<<<<<<< HEAD
        res = self.tokenSaleContract.startSale().interpret(storage = init_token_sale_storage, sender = bob)
=======
        res = self.tokenSaleContract.startSale().interpret(storage=init_token_sale_storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # Assertion
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)

        print('--%startSale--')
        print('✅ Admin should be able to start sale')

<<<<<<< HEAD
    def test_61_non_admin_should_not_be_able_to_start_sale(self):
=======
    def test_40_non_admin_should_not_be_able_to_start_sale(self):
>>>>>>> 92623556 (Token sale contract updates and token sale tests)
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
        # Operation
<<<<<<< HEAD
        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
          self.tokenSaleContract.startSale().interpret(storage = init_token_sale_storage, sender = eve)
=======
        with self.raisesMichelsonError(error_only_administrator):
          self.tokenSaleContract.startSale().interpret(storage=init_token_sale_storage, sender=eve)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # Assertion
        self.assertEqual(init_token_sale_storage['tokenSaleHasStarted'], False)

        print('✅ Non-admin should not be able to start sale')

    # ###
    # # %pauseSale
    # ##
<<<<<<< HEAD
    def test_70_admin_should_be_able_to_pause_sale(self):
=======
    def test_50_admin_should_be_able_to_pause_sale(self):
>>>>>>> 92623556 (Token sale contract updates and token sale tests)
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
        # Operation
<<<<<<< HEAD
        res = self.tokenSaleContract.startSale().interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.pauseSale().interpret(storage = res.storage, sender = bob)
=======
        res = self.tokenSaleContract.startSale().interpret(storage=init_token_sale_storage, sender=bob)
        res = self.tokenSaleContract.pauseSale().interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # Assertion
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSalePaused'], True)

        print('--%pauseSale--')
        print('✅ Admin should be able to pause sale')

<<<<<<< HEAD
    def test_71_non_admin_should_not_be_able_to_pause_sale(self):
=======
    def test_51_non_admin_should_not_be_able_to_pause_sale(self):
>>>>>>> 92623556 (Token sale contract updates and token sale tests)
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
        # Storage preparation
<<<<<<< HEAD
        res = self.tokenSaleContract.startSale().interpret(storage = init_token_sale_storage, sender = bob)
=======
        res = self.tokenSaleContract.startSale().interpret(storage=init_token_sale_storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # Assertions
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSalePaused'], False)
        
<<<<<<< HEAD
        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
          self.tokenSaleContract.pauseSale().interpret(storage = res.storage, sender = eve)
=======
        with self.raisesMichelsonError(error_only_administrator):
          self.tokenSaleContract.pauseSale().interpret(storage=res.storage, sender=eve)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # Assertion
        self.assertEqual(res.storage['tokenSalePaused'], False)

        print('✅ Non-admin should not be able to pause sale')

<<<<<<< HEAD
    def test_72_admin_should_be_able_to_pause_then_unpause_sale(self):
=======
    def test_52_admin_should_be_able_to_pause_then_unpause_sale(self):
>>>>>>> 92623556 (Token sale contract updates and token sale tests)
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
        # Operation
<<<<<<< HEAD
        res = self.tokenSaleContract.startSale().interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.pauseSale().interpret(storage = res.storage, sender = bob)
=======
        res = self.tokenSaleContract.startSale().interpret(storage=init_token_sale_storage, sender=bob)
        res = self.tokenSaleContract.pauseSale().interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # Assertion
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSalePaused'], True)

        # Operation
<<<<<<< HEAD
        res = self.tokenSaleContract.pauseSale().interpret(storage = res.storage, sender = bob)
=======
        res = self.tokenSaleContract.pauseSale().interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # Assertion
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        print('✅ Admin should be able to pause then unpause sale')
        
    # ###
    # # %closeSale
    # ##
<<<<<<< HEAD
    def test_80_admin_should_be_able_to_close_sale(self):
=======
    def test_60_admin_should_be_able_to_close_sale(self):
>>>>>>> 92623556 (Token sale contract updates and token sale tests)
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
        # Operation
<<<<<<< HEAD
        res = self.tokenSaleContract.startSale().interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.closeSale().interpret(storage = res.storage, sender = bob)
=======
        res = self.tokenSaleContract.startSale().interpret(storage=init_token_sale_storage, sender=bob)
        res = self.tokenSaleContract.closeSale().interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # Assertion
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], True)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        print('--%closeSale--')
        print('✅ Admin should be able to close sale')

<<<<<<< HEAD
    def test_81_non_admin_should_not_be_able_to_close_sale(self):
=======
    def test_61_non_admin_should_not_be_able_to_close_sale(self):
>>>>>>> 92623556 (Token sale contract updates and token sale tests)
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
        # Storage preparation
<<<<<<< HEAD
        res = self.tokenSaleContract.startSale().interpret(storage = init_token_sale_storage, sender = bob)
=======
        res = self.tokenSaleContract.startSale().interpret(storage=init_token_sale_storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # Assertions
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], False)
        self.assertEqual(res.storage['tokenSalePaused'], False)
        
<<<<<<< HEAD
        with self.raisesMichelsonError(error_ONLY_ADMINISTRATOR_ALLOWED):
          self.tokenSaleContract.closeSale().interpret(storage = res.storage, sender = eve)
=======
        with self.raisesMichelsonError(error_only_administrator):
          self.tokenSaleContract.closeSale().interpret(storage=res.storage, sender=eve)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # Assertions
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], False)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        print('✅ Non-admin should not be able to close sale')

<<<<<<< HEAD
    def test_82_admin_should_be_able_to_close_sale_then_restart_if_necessary(self):
=======
    def test_52_admin_should_be_able_to_close_sale_then_restart_if_necessary(self):
>>>>>>> 92623556 (Token sale contract updates and token sale tests)
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
        # Operation
<<<<<<< HEAD
        res = self.tokenSaleContract.startSale().interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.closeSale().interpret(storage = res.storage, sender = bob)
=======
        res = self.tokenSaleContract.startSale().interpret(storage=init_token_sale_storage, sender=bob)
        res = self.tokenSaleContract.closeSale().interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # Assertions
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], True)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        # Operation
<<<<<<< HEAD
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)
=======
        res = self.tokenSaleContract.startSale().interpret(storage=res.storage, sender=bob)
>>>>>>> 92623556 (Token sale contract updates and token sale tests)

        # Assertions
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], False)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        print('✅ Admin should be able to close sale then restart sale if necessary')
        
    # ###
    # # %buyTokens
    # ##
<<<<<<< HEAD
    def test_90_whitelisted_users_should_be_able_to_buy_tokens_after_token_sale_start(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        whitelistStartDateTime     = pytezos.now()
        whitelistEndDateTime       = pytezos.now() + 3 * sec_day
        amountToBuy                = 50000000     # 50 tez worth ea (option one, option two, option three)

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.addToWhitelist([eve]).interpret(storage = res.storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        # Assertions
        self.assertEqual(res.storage['whitelistStartDateTime'], whitelistStartDateTime)
        self.assertEqual(res.storage['whitelistEndDateTime'], whitelistEndDateTime)
        self.assertEqual(res.storage['whitelistedAddresses'][eve], True)
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], False)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        # Operations
        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = amountToBuy)
        
        # Assertions
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneBought"], amountToBuy)
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoBought"], amountToBuy)
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeBought"], amountToBuy)

        print('--%buyTokens--')
        print('✅ Whitelisted users should be able to buy tokens after token sale start')
    
    def test_91_non_whitelisted_users_should_not_be_able_to_buy_tokens_after_token_sale_start(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        whitelistStartDateTime     = pytezos.now()
        whitelistEndDateTime       = pytezos.now() + 3 * sec_day
        amountToBuy                = 50000000     # 50 tez worth ea (option one, option two, option three)

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.addToWhitelist([eve]).interpret(storage = res.storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        # Assertions
        self.assertEqual(res.storage['whitelistStartDateTime'], whitelistStartDateTime)
        self.assertEqual(res.storage['whitelistEndDateTime'], whitelistEndDateTime)
        self.assertEqual(res.storage['whitelistedAddresses'][eve], True)
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], False)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        # Failed Operations - Mallory not whitelisted
        with self.raisesMichelsonError(error_USER_IS_NOT_WHITELISTED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionOne"
            }).interpret(storage = res.storage, sender = mallory, now =  whitelistStartDateTime + 100, amount = amountToBuy)

        with self.raisesMichelsonError(error_USER_IS_NOT_WHITELISTED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionTwo"
            }).interpret(storage = res.storage, sender = mallory, now =  whitelistStartDateTime + 100, amount = amountToBuy)

        with self.raisesMichelsonError(error_USER_IS_NOT_WHITELISTED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionThree"
            }).interpret(storage = res.storage, sender = mallory, now =  whitelistStartDateTime + 100, amount = amountToBuy)
          
        # Assertions
        with pytest.raises(KeyError):
          _ = res.storage['tokenSaleLedger'][mallory] 
    
        print('✅ Non-whitelisted users should not be able to buy tokens after token sale start')

    def test_92_whitelisted_users_should_send_the_correct_amount_of_tez_for_the_amount_they_are_buying(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        whitelistStartDateTime     = pytezos.now()
        whitelistEndDateTime       = pytezos.now() + 3 * sec_day
        amountToBuy                = 50000000     # 50 tez worth ea (option one, option two, option three)
        incorrectAmount            = 40000000     # 40 tez

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.addToWhitelist([eve]).interpret(storage = res.storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        # Assertions
        self.assertEqual(res.storage['whitelistStartDateTime'], whitelistStartDateTime)
        self.assertEqual(res.storage['whitelistEndDateTime'], whitelistEndDateTime)
        self.assertEqual(res.storage['whitelistedAddresses'][eve], True)
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], False)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        # Failed Operations - Tez sent is not equal to amount in tez
        with self.raisesMichelsonError(error_TEZ_SENT_IS_NOT_EQUAL_TO_AMOUNT_IN_TEZ):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionOne"
            }).interpret(storage = res.storage, sender = mallory, now =  whitelistStartDateTime + 100, amount = incorrectAmount)

        with self.raisesMichelsonError(error_TEZ_SENT_IS_NOT_EQUAL_TO_AMOUNT_IN_TEZ):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionTwo"
            }).interpret(storage = res.storage, sender = mallory, now =  whitelistStartDateTime + 100, amount = incorrectAmount)

        with self.raisesMichelsonError(error_TEZ_SENT_IS_NOT_EQUAL_TO_AMOUNT_IN_TEZ):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionThree"
            }).interpret(storage = res.storage, sender = mallory, now =  whitelistStartDateTime + 100, amount = incorrectAmount)
          
        # Assertions
        with pytest.raises(KeyError):
          _ = res.storage['tokenSaleLedger'][mallory] 
    
        print('✅ Whitelisted users should send the correct amount of tez for the amount they are buying')


    def test_93_whitelisted_users_should_not_be_able_to_buy_tokens_before_token_sale_start(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        whitelistStartDateTime     = pytezos.now()
        whitelistEndDateTime       = pytezos.now() + 3 * sec_day
        amountToBuy                = 50000000     # 50 tez worth ea (option one, option two, option three)

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.addToWhitelist([eve]).interpret(storage = res.storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        # Assertions
        self.assertEqual(res.storage['whitelistStartDateTime'], whitelistStartDateTime)
        self.assertEqual(res.storage['whitelistEndDateTime'], whitelistEndDateTime)
        self.assertEqual(res.storage['whitelistedAddresses'][eve], True)
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], False)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        # Operations
        with self.raisesMichelsonError(error_WHITELIST_SALE_HAS_NOT_STARTED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionOne"
            }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime - 100, amount = amountToBuy)

        with self.raisesMichelsonError(error_WHITELIST_SALE_HAS_NOT_STARTED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionTwo"
            }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime - 100, amount = amountToBuy)

        with self.raisesMichelsonError(error_WHITELIST_SALE_HAS_NOT_STARTED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionThree"
            }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime - 100, amount = amountToBuy)
          
        # Assertions
        with pytest.raises(KeyError):
          _ = res.storage['tokenSaleLedger'][eve] 
    
        print('✅ Whitelisted users should not be able to buy tokens before token sale start')
    
    def test_94_whitelisted_users_can_only_buy_tokens_above_the_minimum_amount_required_per_option(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        whitelistStartDateTime     = pytezos.now()
        whitelistEndDateTime       = pytezos.now() + 3 * sec_day
        minAmountRequiredPerOption = 30000000     # 30 tez worth
        amountToBuy                = 20000000     # 20 tez worth ea (option one, option two, option three)
        newAmountToBuy             = 30000001     

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.addToWhitelist([eve]).interpret(storage = res.storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        # Assertions
        self.assertEqual(res.storage['whitelistStartDateTime'], whitelistStartDateTime)
        self.assertEqual(res.storage['whitelistEndDateTime'], whitelistEndDateTime)
        self.assertEqual(res.storage['whitelistedAddresses'][eve], True)
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], False)
        self.assertEqual(res.storage['tokenSalePaused'], False)
        self.assertEqual(res.storage['config']["minOptionOneAmountInTez"], minAmountRequiredPerOption)
        self.assertEqual(res.storage['config']["minOptionTwoAmountInTez"], minAmountRequiredPerOption)
        self.assertEqual(res.storage['config']["minOptionThreeAmountInTez"], minAmountRequiredPerOption)

        # Operations - min amount per option not reached
        with self.raisesMichelsonError(error_MIN_AMOUNT_OPTION_ONE_REQUIRED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionOne"
            }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = amountToBuy)

        with self.raisesMichelsonError(error_MIN_AMOUNT_OPTION_TWO_REQUIRED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionTwo"
            }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = amountToBuy)

        with self.raisesMichelsonError(error_MIN_AMOUNT_OPTION_THREE_REQUIRED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionThree"
            }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = amountToBuy)

        # Operations - min amount per option reached
        res = self.tokenSaleContract.buyTokens({
              "amount"      : newAmountToBuy, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = newAmountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : newAmountToBuy, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = newAmountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : newAmountToBuy, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = newAmountToBuy)
        
        # Assertions
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneBought"], newAmountToBuy)
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoBought"], newAmountToBuy)
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeBought"], newAmountToBuy)

        print('✅ Whitelisted users can only buy tokens above the minimum amount required per option')
    
    def test_95_whitelisted_users_can_only_buy_tokens_up_to_the_whitelist_max_amount_per_option_per_wallet(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        whitelistStartDateTime     = pytezos.now()
        whitelistEndDateTime       = pytezos.now() + 3 * sec_day
        amountToBuy                = 110000000    # 110 tez worth ea (option one, option two, option three)
        whitelistMaxAmountOption   = 100000000    # 100 tez

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.addToWhitelist([eve]).interpret(storage = res.storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        # Assertions
        self.assertEqual(res.storage['whitelistStartDateTime'], whitelistStartDateTime)
        self.assertEqual(res.storage['whitelistEndDateTime'], whitelistEndDateTime)
        self.assertEqual(res.storage['whitelistedAddresses'][eve], True)
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], False)
        self.assertEqual(res.storage['tokenSalePaused'], False)
        self.assertEqual(res.storage['config']["whitelistMaxAmountOptionOneTotal"], whitelistMaxAmountOption)
        self.assertEqual(res.storage['config']["whitelistMaxAmountOptionTwoTotal"], whitelistMaxAmountOption)
        self.assertEqual(res.storage['config']["whitelistMaxAmountOptionThreeTotal"], whitelistMaxAmountOption)

        # Operations - min amount per option not reached
        with self.raisesMichelsonError(error_MAX_AMOUNT_OPTION_ONE_WHITELIST_WALLET_EXCEEDED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionOne"
            }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = amountToBuy)

        with self.raisesMichelsonError(error_MAX_AMOUNT_OPTION_TWO_WHITELIST_WALLET_EXCEEDED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionTwo"
            }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = amountToBuy)

        with self.raisesMichelsonError(error_MAX_AMOUNT_OPTION_THREE_WHITELIST_WALLET_EXCEEDED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionThree"
            }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = amountToBuy)

        # Assertions
        with pytest.raises(KeyError):
          _ = res.storage['tokenSaleLedger'][eve] 
        
        print('✅ Whitelisted users can only buy tokens up to the whitelist maximum amount per option per wallet')

    def test_96_whitelisted_users_can_buy_tokens_multiple_times_above_the_min_amount_and_up_to_the_whitelist_max_amount_per_option_per_wallet(self):        
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        whitelistStartDateTime     = pytezos.now()
        whitelistEndDateTime       = pytezos.now() + 3 * sec_day
        firstAmountToBuyAboveMin   = 30000000     # 30 tez
        secondAmountToBuy          = 20000000     # 20 tez worth ea (option one, option two, option three)
        thirdAmountToBuy           = 10000000     # 10 tez
        fourthAmountToBuy          = 40000000     # 40 tez  
        whitelistMaxAmountOption   = 100000000    # 100 tez
        testAmountToBuy            = 5000000      # 5 tez

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.addToWhitelist([eve]).interpret(storage = res.storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        # Assertions
        self.assertEqual(res.storage['whitelistStartDateTime'], whitelistStartDateTime)
        self.assertEqual(res.storage['whitelistEndDateTime'], whitelistEndDateTime)
        self.assertEqual(res.storage['whitelistedAddresses'][eve], True)
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], False)
        self.assertEqual(res.storage['tokenSalePaused'], False)
        self.assertEqual(res.storage['config']["whitelistMaxAmountOptionOneTotal"], whitelistMaxAmountOption)
        self.assertEqual(res.storage['config']["whitelistMaxAmountOptionTwoTotal"], whitelistMaxAmountOption)
        self.assertEqual(res.storage['config']["whitelistMaxAmountOptionThreeTotal"], whitelistMaxAmountOption)

        # Operations - min amount per option reached
        res = self.tokenSaleContract.buyTokens({
              "amount"      : firstAmountToBuyAboveMin, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = firstAmountToBuyAboveMin)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : firstAmountToBuyAboveMin, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = firstAmountToBuyAboveMin)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : firstAmountToBuyAboveMin, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = firstAmountToBuyAboveMin)

        # Operations - second time buying (below first amount)
        res = self.tokenSaleContract.buyTokens({
              "amount"      : secondAmountToBuy, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 200, amount = secondAmountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : secondAmountToBuy, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 200, amount = secondAmountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : secondAmountToBuy, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 200, amount = secondAmountToBuy)

        # Operations - third time buying
        res = self.tokenSaleContract.buyTokens({
              "amount"      : thirdAmountToBuy, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 300, amount = thirdAmountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : thirdAmountToBuy, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 300, amount = thirdAmountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : thirdAmountToBuy, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 300, amount = thirdAmountToBuy)

        # Operations - fourth time buying
        res = self.tokenSaleContract.buyTokens({
              "amount"      : fourthAmountToBuy, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 300, amount = fourthAmountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : fourthAmountToBuy, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 300, amount = fourthAmountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : fourthAmountToBuy, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 300, amount = fourthAmountToBuy)

        # Failed Operations - max amount reached
        with self.raisesMichelsonError(error_MAX_AMOUNT_OPTION_ONE_WHITELIST_WALLET_EXCEEDED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : testAmountToBuy, 
                "tokenOption" : "optionOne"
            }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 400, amount = testAmountToBuy)

        with self.raisesMichelsonError(error_MAX_AMOUNT_OPTION_TWO_WHITELIST_WALLET_EXCEEDED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : testAmountToBuy, 
                "tokenOption" : "optionTwo"
            }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 400, amount = testAmountToBuy)

        with self.raisesMichelsonError(error_MAX_AMOUNT_OPTION_THREE_WHITELIST_WALLET_EXCEEDED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : testAmountToBuy, 
                "tokenOption" : "optionThree"
            }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 400, amount = testAmountToBuy)

        # Assertions
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneBought"], whitelistMaxAmountOption)
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoBought"], whitelistMaxAmountOption)
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeBought"], whitelistMaxAmountOption)

        print('✅ Whitelisted users can buy tokens multiple times above the min amount per option and up to the whitelist maximum amount per option per wallet')
        
    def test_97_whitelisted_users_should_not_be_able_to_buy_tokens_if_token_sale_is_paused_or_closed_after_it_has_started(self):        
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        whitelistStartDateTime     = pytezos.now()
        whitelistEndDateTime       = pytezos.now() + 3 * sec_day
        firstAmountToBuyAboveMin   = 30000000     # 30 tez
        secondAmountToBuy          = 20000000     # 20 tez worth ea (option one, option two, option three)
        thirdAmountToBuy           = 10000000     # 10 tez
        whitelistMaxAmountOption   = 100000000    # 100 tez
        testAmountToBuy            = 35000000     # 35 tez

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.addToWhitelist([eve]).interpret(storage = res.storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        # Assertions
        self.assertEqual(res.storage['whitelistStartDateTime'], whitelistStartDateTime)
        self.assertEqual(res.storage['whitelistEndDateTime'], whitelistEndDateTime)
        self.assertEqual(res.storage['whitelistedAddresses'][eve], True)
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], False)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        # Operations - min amount per option reached
        res = self.tokenSaleContract.buyTokens({
              "amount"      : firstAmountToBuyAboveMin, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = firstAmountToBuyAboveMin)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : firstAmountToBuyAboveMin, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = firstAmountToBuyAboveMin)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : firstAmountToBuyAboveMin, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = firstAmountToBuyAboveMin)

        # Operations - pause sale
        res = self.tokenSaleContract.pauseSale().interpret(storage = res.storage, sender = bob)

        # Assertions after sale paused
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], False)
        self.assertEqual(res.storage['tokenSalePaused'], True)
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneBought"], firstAmountToBuyAboveMin)
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoBought"], firstAmountToBuyAboveMin)
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeBought"], firstAmountToBuyAboveMin)

        # Failed Operations - token sale is paused
        with self.raisesMichelsonError(error_TOKEN_SALE_IS_PAUSED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : testAmountToBuy, 
                "tokenOption" : "optionOne"
            }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 200, amount = testAmountToBuy)

        with self.raisesMichelsonError(error_TOKEN_SALE_IS_PAUSED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : testAmountToBuy, 
                "tokenOption" : "optionTwo"
            }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 200, amount = testAmountToBuy)

        with self.raisesMichelsonError(error_TOKEN_SALE_IS_PAUSED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : testAmountToBuy, 
                "tokenOption" : "optionThree"
            }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 200, amount = testAmountToBuy)

        # Operations - unpause sale
        res = self.tokenSaleContract.pauseSale().interpret(storage = res.storage, sender = bob)

        # Assertions after sale unpaused
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], False)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        # Operations - buy again after sale paused then unpaused
        res = self.tokenSaleContract.buyTokens({
              "amount"      : secondAmountToBuy, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 300, amount = secondAmountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : secondAmountToBuy, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 300, amount = secondAmountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : secondAmountToBuy, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 300, amount = secondAmountToBuy)

        # Assertions
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneBought"], firstAmountToBuyAboveMin + secondAmountToBuy)
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoBought"], firstAmountToBuyAboveMin + secondAmountToBuy)
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeBought"], firstAmountToBuyAboveMin + secondAmountToBuy)

        # Operations - close sale
        res = self.tokenSaleContract.closeSale().interpret(storage = res.storage, sender = bob)

        # Assertions after sale unpaused
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], True)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        # Failed Operations - token sale is closed
        with self.raisesMichelsonError(error_TOKEN_SALE_HAS_ENDED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : testAmountToBuy, 
                "tokenOption" : "optionOne"
            }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 500, amount = testAmountToBuy)

        with self.raisesMichelsonError(error_TOKEN_SALE_HAS_ENDED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : testAmountToBuy, 
                "tokenOption" : "optionTwo"
            }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 500, amount = testAmountToBuy)

        with self.raisesMichelsonError(error_TOKEN_SALE_HAS_ENDED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : testAmountToBuy, 
                "tokenOption" : "optionThree"
            }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 500, amount = testAmountToBuy)

        # Operations - restart sale
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        # Assertions after sale unpaused
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], False)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        # Operations - buy again after sale closed then restarted
        res = self.tokenSaleContract.buyTokens({
              "amount"      : thirdAmountToBuy, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 700, amount = thirdAmountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : thirdAmountToBuy, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 700, amount = thirdAmountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : thirdAmountToBuy, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 700, amount = thirdAmountToBuy)

        # Assertions
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneBought"], firstAmountToBuyAboveMin + secondAmountToBuy + thirdAmountToBuy)
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoBought"], firstAmountToBuyAboveMin + secondAmountToBuy + thirdAmountToBuy)
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeBought"], firstAmountToBuyAboveMin + secondAmountToBuy + thirdAmountToBuy)

        print('✅ Whitelisted users should not be able to buy tokens if token sale is paused or closed after it has started')

    def test_97_whitelisted_users_can_continue_to_buy_tokens_during_public_sale_up_to_the_max_amount_per_option_per_wallet(self):        
        # Initial values
        init_token_sale_storage      = deepcopy(self.tokenSaleStorage)
        whitelistStartDateTime       = pytezos.now()
        whitelistEndDateTime         = pytezos.now() + 1 * sec_day
        duringPublicSale             = whitelistEndDateTime + 6 * sec_hour 
        firstAmountToBuyAboveMin     = 30000000     # 30 tez
        secondAmountToBuy            = 20000000     # 20 tez worth ea (option one, option two, option three)
        thirdAmountToBuy             = 150000000    # 150 tez
        maxAmountPerOptionPerWallet  = 200000000    # 200 tez
        testAmountToBuy              = 35000000     # 35 tez

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.addToWhitelist([eve]).interpret(storage = res.storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        # Assertions
        self.assertEqual(res.storage['whitelistStartDateTime'], whitelistStartDateTime)
        self.assertEqual(res.storage['whitelistEndDateTime'], whitelistEndDateTime)
        self.assertEqual(res.storage['whitelistedAddresses'][eve], True)
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], False)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        # Operations - during whitelist sale
        res = self.tokenSaleContract.buyTokens({
              "amount"      : firstAmountToBuyAboveMin, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = firstAmountToBuyAboveMin)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : firstAmountToBuyAboveMin, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = firstAmountToBuyAboveMin)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : firstAmountToBuyAboveMin, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now =  whitelistStartDateTime + 100, amount = firstAmountToBuyAboveMin)

        # Operations - during public sale - second purchase
        res = self.tokenSaleContract.buyTokens({
              "amount"      : secondAmountToBuy, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now = duringPublicSale, amount = secondAmountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : secondAmountToBuy, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now = duringPublicSale, amount = secondAmountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : secondAmountToBuy, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now = duringPublicSale, amount = secondAmountToBuy)

        # Operations - during public sale - third purchase to max amount per option per wallet
        res = self.tokenSaleContract.buyTokens({
              "amount"      : thirdAmountToBuy, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now = duringPublicSale + 500, amount = thirdAmountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : thirdAmountToBuy, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now = duringPublicSale + 500, amount = thirdAmountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : thirdAmountToBuy, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now = duringPublicSale + 500, amount = thirdAmountToBuy)

        # Failed Operations - max amount per option per wallet reached
        with self.raisesMichelsonError(error_MAX_AMOUNT_OPTION_ONE_PER_WALLET_TOTAL_EXCEEDED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : testAmountToBuy, 
                "tokenOption" : "optionOne"
            }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 1000, amount = testAmountToBuy)

        with self.raisesMichelsonError(error_MAX_AMOUNT_OPTION_TWO_PER_WALLET_TOTAL_EXCEEDED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : testAmountToBuy, 
                "tokenOption" : "optionTwo"
            }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 1000, amount = testAmountToBuy)

        with self.raisesMichelsonError(error_MAX_AMOUNT_OPTION_THREE_PER_WALLET_TOTAL_EXCEEDED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : testAmountToBuy, 
                "tokenOption" : "optionThree"
            }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 1000, amount = testAmountToBuy)

        # Assertions
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneBought"],   maxAmountPerOptionPerWallet)
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoBought"],   maxAmountPerOptionPerWallet)
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeBought"], maxAmountPerOptionPerWallet)

        print('✅ Whitelisted users can continue to buy tokens during public sale up to the max amount per option per wallet')

    def test_98_non_whitelisted_users_can_buy_tokens_during_public_sale(self):        
        # Initial values
        init_token_sale_storage      = deepcopy(self.tokenSaleStorage)
        whitelistStartDateTime       = pytezos.now()
        whitelistEndDateTime         = pytezos.now() + 1 * sec_day
        duringPublicSale             = whitelistEndDateTime + 6 * sec_hour 
        amountToBuy                  = 20000000     # 20 tez
        newAmountToBuy               = 200000000    # 200 tez
        testAmountToBuy              = 15000000     # 15 tez

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        # Assertions
        self.assertEqual(res.storage['whitelistStartDateTime'], whitelistStartDateTime)
        self.assertEqual(res.storage['whitelistEndDateTime'], whitelistEndDateTime)
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], False)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        # Operations - min amount per option not reached
        with self.raisesMichelsonError(error_MIN_AMOUNT_OPTION_ONE_REQUIRED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionOne"
            }).interpret(storage = res.storage, sender = eve, now = duringPublicSale, amount = amountToBuy)

        with self.raisesMichelsonError(error_MIN_AMOUNT_OPTION_TWO_REQUIRED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionTwo"
            }).interpret(storage = res.storage, sender = eve, now = duringPublicSale, amount = amountToBuy)

        with self.raisesMichelsonError(error_MIN_AMOUNT_OPTION_THREE_REQUIRED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionThree"
            }).interpret(storage = res.storage, sender = eve, now = duringPublicSale, amount = amountToBuy)

        # Operations - min amount per option reached
        res = self.tokenSaleContract.buyTokens({
              "amount"      : newAmountToBuy, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 100, amount = newAmountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : newAmountToBuy, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 100, amount = newAmountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : newAmountToBuy, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 100, amount = newAmountToBuy)

        # Failed Operations - max amount per option per wallet reached
        with self.raisesMichelsonError(error_MAX_AMOUNT_OPTION_ONE_PER_WALLET_TOTAL_EXCEEDED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : testAmountToBuy, 
                "tokenOption" : "optionOne"
            }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 300, amount = testAmountToBuy)

        with self.raisesMichelsonError(error_MAX_AMOUNT_OPTION_TWO_PER_WALLET_TOTAL_EXCEEDED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : testAmountToBuy, 
                "tokenOption" : "optionTwo"
            }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 300, amount = testAmountToBuy)

        with self.raisesMichelsonError(error_MAX_AMOUNT_OPTION_THREE_PER_WALLET_TOTAL_EXCEEDED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : testAmountToBuy, 
                "tokenOption" : "optionThree"
            }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 300, amount = testAmountToBuy)
        
        # Assertions
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneBought"], newAmountToBuy)
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoBought"], newAmountToBuy)
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeBought"], newAmountToBuy)

        print('✅ Non-whitelisted users can buy tokens during public sale (above the min amount required per option, and up to the max amount per option per wallet.')

    def test_99_no_users_can_buy_tokens_above_the_overall_option_caps(self):        
        # Initial values
        init_token_sale_storage      = deepcopy(self.tokenSaleStorage)
        whitelistStartDateTime       = pytezos.now()
        whitelistEndDateTime         = pytezos.now() + 1 * sec_day
        duringPublicSale             = whitelistEndDateTime + 6 * sec_hour 
        amountToBuy                  = 40000000     # 40 tez
        testAmountToBuy              = 35000000     # 35 tez - still needs to be above min amount (30 tez) for first purchase of user

        optionOneMaxAmountCap        = 600000000000 # 600,000 tez 
        optionTwoMaxAmountCap        = 630000000000 # 630,000 tez
        optionThreeMaxAmountCap      = 560000000000 # 560,000 tez

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        # Set Bought Amount Total per option to (max cap - test amount) 
        res.storage["optionOneBoughtTotal"] = optionOneMaxAmountCap - testAmountToBuy
        res.storage["optionTwoBoughtTotal"] = optionTwoMaxAmountCap - testAmountToBuy
        res.storage["optionThreeBoughtTotal"] = optionThreeMaxAmountCap - testAmountToBuy

        # Assertions
        self.assertEqual(res.storage['whitelistStartDateTime'], whitelistStartDateTime)
        self.assertEqual(res.storage['whitelistEndDateTime'], whitelistEndDateTime)
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], False)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        # Remaining Tez to be bought is 15 tez per option 
        # Failed Operations - max amount cap per option reached
        with self.raisesMichelsonError(error_OPTION_ONE_MAX_AMOUNT_CAP_REACHED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionOne"
            }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 300, amount = amountToBuy)

        with self.raisesMichelsonError(error_OPTION_TWO_MAX_AMOUNT_CAP_REACHED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionTwo"
            }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 300, amount = amountToBuy)

        with self.raisesMichelsonError(error_OPTION_THREE_MAX_AMOUNT_CAP_REACHED):
          res = self.tokenSaleContract.buyTokens({
                "amount"      : amountToBuy, 
                "tokenOption" : "optionThree"
            }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 300, amount = amountToBuy)

        # Operations - user buys remainder left - 15 tez
        res = self.tokenSaleContract.buyTokens({
              "amount"      : testAmountToBuy, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = testAmountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : testAmountToBuy, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = testAmountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : testAmountToBuy, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = testAmountToBuy)

        # Assertions
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneBought"], testAmountToBuy)
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoBought"], testAmountToBuy)
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeBought"], testAmountToBuy)

        print('✅ No user can buy tokens above the overall option caps')

    ###
    # %claimTokens
    ##
    def test_9_100_user_should_not_be_able_to_claim_before_token_sale_closed(self):        
        # Initial values
        init_token_sale_storage      = deepcopy(self.tokenSaleStorage)
        
        whitelistStartDateTime       = pytezos.now()
        whitelistEndDateTime         = pytezos.now() + 1 * sec_day
        duringPublicSale             = whitelistEndDateTime + 6 * sec_hour 
        tokenSaleClosed              = duringPublicSale + 2 * sec_day
        tokenSaleClosedLevel         = 100

        amountToBuy                  = 30000000     # 30 tez

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        # Operations - eve should not be able to claim tokens before token sale ends
        with self.raisesMichelsonError(error_TOKEN_SALE_HAS_NOT_ENDED):
          res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed - 1000, level = 150000)

        print('--%claimTokens--')
        print('✅ User should not be able to claim tokens before token sale ends')

    def test_9_101_user_should_not_be_able_to_claim_if_he_has_nothing_to_claim(self):        
        # Initial values
        init_token_sale_storage      = deepcopy(self.tokenSaleStorage)
        
        whitelistStartDateTime       = pytezos.now()
        whitelistEndDateTime         = pytezos.now() + 1 * sec_day
        duringPublicSale             = whitelistEndDateTime + 6 * sec_hour 
        tokenSaleClosed              = duringPublicSale + 2 * sec_day
        tokenSaleClosedLevel         = 100

        amountToBuy                  = 30000000     # 30 tez

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)
        res = self.tokenSaleContract.closeSale().interpret(storage = res.storage, sender = bob, now = tokenSaleClosed, level = 100)

        # Operations - eve should not be able to claim tokens before token sale ends
        with self.raisesMichelsonError(error_USER_TOKEN_SALE_RECORD_NOT_FOUND):
          res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + 1000, level = 150000)

        print('✅ User should not be able to claim tokens if he has nothing to claim')


    def test_9_102_user_should_be_able_to_claim_for_the_first_time_on_day_zero_after_token_sale_closed_opt_one_and_opt_two_and_opt_three(self):        
        # Initial values
        init_token_sale_storage      = deepcopy(self.tokenSaleStorage)
        
        whitelistStartDateTime       = pytezos.now()
        whitelistEndDateTime         = pytezos.now() + 1 * sec_day
        duringPublicSale             = whitelistEndDateTime + 6 * sec_hour 
        tokenSaleClosed              = duringPublicSale + 2 * sec_day
        tokenSaleClosedLevel         = 100

        optionOneTezPerToken         = init_token_sale_storage["config"]["optionOneTezPerToken"]
        optionTwoTezPerToken         = init_token_sale_storage["config"]["optionTwoTezPerToken"]
        optionThreeTezPerToken       = init_token_sale_storage["config"]["optionThreeTezPerToken"]

        vestingOptionOneInMonths     = init_token_sale_storage["config"]["vestingOptionOneInMonths"]
        vestingOptionTwoInMonths     = init_token_sale_storage["config"]["vestingOptionTwoInMonths"]
        vestingOptionThreeInMonths   = init_token_sale_storage["config"]["vestingOptionThreeInMonths"]

        amountToBuy                  = 30000000     # 30 tez

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        # Close Sale
        res = self.tokenSaleContract.closeSale().interpret(storage = res.storage, sender = bob, now = tokenSaleClosed, level = 100)

        # Operations - eve claim tokens on day zero (opt one + opt two + opt three)
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + 1000, level = tokenSaleClosedLevel + 100)

        monthsToClaim = 1
        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * monthsToClaim
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * monthsToClaim
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountToClaim)      # 50000000
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountToClaim)      # 41666666
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountToClaim)  # 31250000

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], 1)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], 1)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], 1)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + 1000)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + 1000)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + 1000)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[2]["parameters"]["value"][-1]["args"][-1]["int"]), optionOneAmountToClaim)
        self.assertEqual(int(res.operations[1]["parameters"]["value"][-1]["args"][-1]["int"]), optionTwoAmountToClaim)
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountToClaim)

        print('✅ User should be able to claim for the first time on day zero after token sale closed (opt one + opt two + opt three)')

    def test_9_103_user_should_be_able_to_claim_for_the_first_time_on_day_zero_after_token_sale_closed_partial_options_bought(self):        
        # Initial values
        init_token_sale_storage      = deepcopy(self.tokenSaleStorage)
        
        whitelistStartDateTime       = pytezos.now()
        whitelistEndDateTime         = pytezos.now() + 1 * sec_day
        duringPublicSale             = whitelistEndDateTime + 6 * sec_hour 
        tokenSaleClosed              = duringPublicSale + 2 * sec_day
        tokenSaleClosedLevel         = 100

        optionOneTezPerToken         = init_token_sale_storage["config"]["optionOneTezPerToken"]
        optionTwoTezPerToken         = init_token_sale_storage["config"]["optionTwoTezPerToken"]
        optionThreeTezPerToken       = init_token_sale_storage["config"]["optionThreeTezPerToken"]

        vestingOptionOneInMonths     = init_token_sale_storage["config"]["vestingOptionOneInMonths"]
        vestingOptionTwoInMonths     = init_token_sale_storage["config"]["vestingOptionTwoInMonths"]
        vestingOptionThreeInMonths   = init_token_sale_storage["config"]["vestingOptionThreeInMonths"]

        amountToBuy                  = 30000000     # 30 tez

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        # eve buys option one and option two
        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionOne"
        }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionTwo"
        }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        # fox buys option one and option three
        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = fox, now =  duringPublicSale + 500, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionThree"
        }).interpret(storage = res.storage, sender = fox, now =  duringPublicSale + 500, amount = amountToBuy)

        # mallory buys option two and option three
        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = mallory, now =  duringPublicSale + 500, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionThree"
        }).interpret(storage = res.storage, sender = mallory, now =  duringPublicSale + 500, amount = amountToBuy)

        # Close Sale
        res = self.tokenSaleContract.closeSale().interpret(storage = res.storage, sender = bob, now = tokenSaleClosed, level = 100)

        # Operations 
        # - eve claim tokens on day zero (opt one + opt two)
        # - fox claim tokens on day zero (opt one + opt three)
        # - mallory claim tokens on day zero (opt two + opt three)
        eveRes     = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + 1000, level = tokenSaleClosedLevel + 100)
        foxRes     = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = fox, now = tokenSaleClosed + 1000, level = tokenSaleClosedLevel + 100)
        malloryRes = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = mallory, now = tokenSaleClosed + 1000, level = tokenSaleClosedLevel + 100)

        monthsToClaim = 1
        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * monthsToClaim
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * monthsToClaim
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        zeroAmount               = 0

        # Assertions
        # eve token sale ledger user record (opt one + opt two)
        self.assertEqual(eveRes.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountToClaim)      
        self.assertEqual(eveRes.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountToClaim)      
        self.assertEqual(eveRes.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], zeroAmount) 

        self.assertEqual(eveRes.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], 1)      
        self.assertEqual(eveRes.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], 1)      
        self.assertEqual(eveRes.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], zeroAmount)  

        self.assertEqual(eveRes.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + 100)      
        self.assertEqual(eveRes.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + 100)      
        self.assertEqual(eveRes.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], zeroAmount)  

        self.assertEqual(eveRes.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + 1000)      
        self.assertEqual(eveRes.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + 1000)      

        # fox token sale ledger user record (opt one + opt three)
        self.assertEqual(foxRes.storage['tokenSaleLedger'][fox]["optionOneClaimedAmount"], optionOneAmountToClaim)      
        self.assertEqual(foxRes.storage['tokenSaleLedger'][fox]["optionTwoClaimedAmount"], zeroAmount)      
        self.assertEqual(foxRes.storage['tokenSaleLedger'][fox]["optionThreeClaimedAmount"], optionThreeAmountToClaim) 

        self.assertEqual(foxRes.storage['tokenSaleLedger'][fox]["optionOneTimesClaimed"], 1)      
        self.assertEqual(foxRes.storage['tokenSaleLedger'][fox]["optionTwoTimesClaimed"], zeroAmount)      
        self.assertEqual(foxRes.storage['tokenSaleLedger'][fox]["optionThreeTimesClaimed"], 1)  

        self.assertEqual(foxRes.storage['tokenSaleLedger'][fox]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + 100)      
        self.assertEqual(foxRes.storage['tokenSaleLedger'][fox]["optionTwoLastClaimedBlockLevel"], zeroAmount)      
        self.assertEqual(foxRes.storage['tokenSaleLedger'][fox]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + 100)  

        self.assertEqual(foxRes.storage['tokenSaleLedger'][fox]["optionOneLastClaimed"], tokenSaleClosed + 1000)      
        self.assertEqual(foxRes.storage['tokenSaleLedger'][fox]["optionThreeLastClaimed"], tokenSaleClosed + 1000)      

        # mallory token sale ledger user record (opt two + opt three)
        self.assertEqual(malloryRes.storage['tokenSaleLedger'][mallory]["optionOneClaimedAmount"], zeroAmount)     
        self.assertEqual(malloryRes.storage['tokenSaleLedger'][mallory]["optionTwoClaimedAmount"], optionTwoAmountToClaim) 
        self.assertEqual(malloryRes.storage['tokenSaleLedger'][mallory]["optionThreeClaimedAmount"], optionThreeAmountToClaim) 

        self.assertEqual(malloryRes.storage['tokenSaleLedger'][mallory]["optionOneTimesClaimed"], zeroAmount)      
        self.assertEqual(malloryRes.storage['tokenSaleLedger'][mallory]["optionTwoTimesClaimed"], 1)      
        self.assertEqual(malloryRes.storage['tokenSaleLedger'][mallory]["optionThreeTimesClaimed"], 1)  

        self.assertEqual(malloryRes.storage['tokenSaleLedger'][mallory]["optionOneLastClaimedBlockLevel"], zeroAmount)      
        self.assertEqual(malloryRes.storage['tokenSaleLedger'][mallory]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + 100)      
        self.assertEqual(malloryRes.storage['tokenSaleLedger'][mallory]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + 100)  

        self.assertEqual(malloryRes.storage['tokenSaleLedger'][mallory]["optionTwoLastClaimed"], tokenSaleClosed + 1000)      
        self.assertEqual(malloryRes.storage['tokenSaleLedger'][mallory]["optionThreeLastClaimed"], tokenSaleClosed + 1000)          

        print('✅ User should be able to claim for the first time on day zero after token sale closed (opt one + opt two)')
        print('✅ User should be able to claim for the first time on day zero after token sale closed (opt one + opt three)')
        print('✅ User should be able to claim for the first time on day zero after token sale closed (opt two + opt three)')

    def test_9_104_user_should_be_able_to_claim_for_the_first_time_after_two_months_after_token_sale_is_closed(self):        
        # Initial values
        init_token_sale_storage      = deepcopy(self.tokenSaleStorage)
        
        whitelistStartDateTime       = pytezos.now()
        whitelistEndDateTime         = pytezos.now() + 1 * sec_day
        duringPublicSale             = whitelistEndDateTime + 6 * sec_hour 
        tokenSaleClosed              = duringPublicSale + 2 * sec_day
        tokenSaleClosedLevel         = 100

        optionOneTezPerToken         = init_token_sale_storage["config"]["optionOneTezPerToken"]
        optionTwoTezPerToken         = init_token_sale_storage["config"]["optionTwoTezPerToken"]
        optionThreeTezPerToken       = init_token_sale_storage["config"]["optionThreeTezPerToken"]

        vestingOptionOneInMonths     = init_token_sale_storage["config"]["vestingOptionOneInMonths"]
        vestingOptionTwoInMonths     = init_token_sale_storage["config"]["vestingOptionTwoInMonths"]
        vestingOptionThreeInMonths   = init_token_sale_storage["config"]["vestingOptionThreeInMonths"]

        amountToBuy                  = 30000000     # 30 tez

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        # Close Sale
        res = self.tokenSaleContract.closeSale().interpret(storage = res.storage, sender = bob, now = tokenSaleClosed, level = 100)

        # Operations - eve claim tokens after two months
        afterMonths = 2
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsToClaim = 3 # month 0, month 1, month 2
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * monthsToClaim
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * monthsToClaim
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], monthsToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], monthsToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], monthsToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[2]["parameters"]["value"][-1]["args"][-1]["int"]), optionOneAmountToClaim)
        self.assertEqual(int(res.operations[1]["parameters"]["value"][-1]["args"][-1]["int"]), optionTwoAmountToClaim)
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountToClaim)

        print('✅ User should be able to claim for the first time after two months after token sale closed')

    def test_9_105_user_should_be_able_to_claim_for_the_first_time_after_six_months_after_token_sale_is_closed(self):        
        # Initial values
        init_token_sale_storage      = deepcopy(self.tokenSaleStorage)
        
        whitelistStartDateTime       = pytezos.now()
        whitelistEndDateTime         = pytezos.now() + 1 * sec_day
        duringPublicSale             = whitelistEndDateTime + 6 * sec_hour 
        tokenSaleClosed              = duringPublicSale + 2 * sec_day
        tokenSaleClosedLevel         = 100

        optionOneTezPerToken         = init_token_sale_storage["config"]["optionOneTezPerToken"]
        optionTwoTezPerToken         = init_token_sale_storage["config"]["optionTwoTezPerToken"]
        optionThreeTezPerToken       = init_token_sale_storage["config"]["optionThreeTezPerToken"]

        vestingOptionOneInMonths     = init_token_sale_storage["config"]["vestingOptionOneInMonths"]
        vestingOptionTwoInMonths     = init_token_sale_storage["config"]["vestingOptionTwoInMonths"]
        vestingOptionThreeInMonths   = init_token_sale_storage["config"]["vestingOptionThreeInMonths"]

        amountToBuy                  = 30000000     # 30 tez

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        # Close Sale
        res = self.tokenSaleContract.closeSale().interpret(storage = res.storage, sender = bob, now = tokenSaleClosed, level = 100)

        # Operations - eve claim tokens after 6 months
        afterMonths = 6
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsToClaim        = 7 # month 0, 1, 2, 3, 4, 5, 6
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * maxOptionOneMonths
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * monthsToClaim
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountToClaim)      # 50000000
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountToClaim)      # 41666666
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountToClaim)  # 31250000

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], maxOptionOneMonths)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], monthsToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], monthsToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[2]["parameters"]["value"][-1]["args"][-1]["int"]), optionOneAmountToClaim)
        self.assertEqual(int(res.operations[1]["parameters"]["value"][-1]["args"][-1]["int"]), optionTwoAmountToClaim)
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountToClaim)

        print('✅ User should be able to claim for the first time after six months after token sale closed (opt one fully claimed)')

    def test_9_106_user_should_be_able_to_claim_for_the_first_time_after_eight_months_after_token_sale_is_closed(self):        
        # Initial values
        init_token_sale_storage      = deepcopy(self.tokenSaleStorage)
        
        whitelistStartDateTime       = pytezos.now()
        whitelistEndDateTime         = pytezos.now() + 1 * sec_day
        duringPublicSale             = whitelistEndDateTime + 6 * sec_hour 
        tokenSaleClosed              = duringPublicSale + 2 * sec_day
        tokenSaleClosedLevel         = 100

        optionOneTezPerToken         = init_token_sale_storage["config"]["optionOneTezPerToken"]
        optionTwoTezPerToken         = init_token_sale_storage["config"]["optionTwoTezPerToken"]
        optionThreeTezPerToken       = init_token_sale_storage["config"]["optionThreeTezPerToken"]

        vestingOptionOneInMonths     = init_token_sale_storage["config"]["vestingOptionOneInMonths"]
        vestingOptionTwoInMonths     = init_token_sale_storage["config"]["vestingOptionTwoInMonths"]
        vestingOptionThreeInMonths   = init_token_sale_storage["config"]["vestingOptionThreeInMonths"]

        amountToBuy                  = 30000000     # 30 tez

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        # Close Sale
        res = self.tokenSaleContract.closeSale().interpret(storage = res.storage, sender = bob, now = tokenSaleClosed, level = 100)

        # Operations - eve claim tokens after 8 months
        afterMonths = 8
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsToClaim        = 9 # month 0, 1, 2, 3, 4, 5, 6, 7, 8
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * maxOptionOneMonths
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * maxOptionTwoMonths
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountToClaim)      # 50000000
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountToClaim)      # 41666666
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountToClaim)  # 31250000

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], maxOptionOneMonths)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], maxOptionTwoMonths)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], monthsToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[2]["parameters"]["value"][-1]["args"][-1]["int"]), optionOneAmountToClaim)
        self.assertEqual(int(res.operations[1]["parameters"]["value"][-1]["args"][-1]["int"]), optionTwoAmountToClaim)
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountToClaim)

        print('✅ User should be able to claim for the first time after eight months after token sale closed (opt one and opt two fully claimed)')

    def test_9_107_user_should_be_able_to_claim_for_the_first_time_after_twelve_months_after_token_sale_is_closed(self):        
        # Initial values
        init_token_sale_storage      = deepcopy(self.tokenSaleStorage)
        
        whitelistStartDateTime       = pytezos.now()
        whitelistEndDateTime         = pytezos.now() + 1 * sec_day
        duringPublicSale             = whitelistEndDateTime + 6 * sec_hour 
        tokenSaleClosed              = duringPublicSale + 2 * sec_day
        tokenSaleClosedLevel         = 100

        optionOneTezPerToken         = init_token_sale_storage["config"]["optionOneTezPerToken"]
        optionTwoTezPerToken         = init_token_sale_storage["config"]["optionTwoTezPerToken"]
        optionThreeTezPerToken       = init_token_sale_storage["config"]["optionThreeTezPerToken"]

        vestingOptionOneInMonths     = init_token_sale_storage["config"]["vestingOptionOneInMonths"]
        vestingOptionTwoInMonths     = init_token_sale_storage["config"]["vestingOptionTwoInMonths"]
        vestingOptionThreeInMonths   = init_token_sale_storage["config"]["vestingOptionThreeInMonths"]

        amountToBuy                  = 30000000     # 30 tez

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        # Close Sale
        res = self.tokenSaleContract.closeSale().interpret(storage = res.storage, sender = bob, now = tokenSaleClosed, level = 100)

        # Operations - eve claim tokens after 12 months
        afterMonths = 12
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsToClaim        = 13 # month 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * maxOptionOneMonths
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * maxOptionTwoMonths
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * maxOptionThreeMonths

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], maxOptionOneMonths)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], maxOptionTwoMonths)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], maxOptionThreeMonths)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[2]["parameters"]["value"][-1]["args"][-1]["int"]), optionOneAmountToClaim)
        self.assertEqual(int(res.operations[1]["parameters"]["value"][-1]["args"][-1]["int"]), optionTwoAmountToClaim)
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountToClaim)

        print('✅ User should be able to claim for the first time after twelve months after token sale closed (opt one, opt two, and opt three fully claimed)')



    def test_9_108_user_should_be_able_to_claim_for_the_first_time_on_day_zero_and_every_month_subsequently(self):        
        # Initial values
        init_token_sale_storage      = deepcopy(self.tokenSaleStorage)
        
        whitelistStartDateTime       = pytezos.now()
        whitelistEndDateTime         = pytezos.now() + 1 * sec_day
        duringPublicSale             = whitelistEndDateTime + 6 * sec_hour 
        tokenSaleClosed              = duringPublicSale + 2 * sec_day
        tokenSaleClosedLevel         = 100

        optionOneTezPerToken         = init_token_sale_storage["config"]["optionOneTezPerToken"]
        optionTwoTezPerToken         = init_token_sale_storage["config"]["optionTwoTezPerToken"]
        optionThreeTezPerToken       = init_token_sale_storage["config"]["optionThreeTezPerToken"]

        vestingOptionOneInMonths     = init_token_sale_storage["config"]["vestingOptionOneInMonths"]
        vestingOptionTwoInMonths     = init_token_sale_storage["config"]["vestingOptionTwoInMonths"]
        vestingOptionThreeInMonths   = init_token_sale_storage["config"]["vestingOptionThreeInMonths"]

        amountToBuy                  = 30000000     # 30 tez

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        # Close Sale
        res = self.tokenSaleContract.closeSale().interpret(storage = res.storage, sender = bob, now = tokenSaleClosed, level = 100)

        # Operations - eve claim tokens on day zero
        afterMonths = 0
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsToClaim        = 1 # month 0
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * monthsToClaim
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * monthsToClaim
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], monthsToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], monthsToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], monthsToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[2]["parameters"]["value"][-1]["args"][-1]["int"]), optionOneAmountSingleMonth)
        self.assertEqual(int(res.operations[1]["parameters"]["value"][-1]["args"][-1]["int"]), optionTwoAmountSingleMonth)
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountSingleMonth)

        # Operations - eve claim tokens again after one month
        afterMonths = 1
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsToClaim        = 2 # month 0, 1
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * monthsToClaim
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * monthsToClaim
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], monthsToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], monthsToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], monthsToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[2]["parameters"]["value"][-1]["args"][-1]["int"]), optionOneAmountSingleMonth)
        self.assertEqual(int(res.operations[1]["parameters"]["value"][-1]["args"][-1]["int"]), optionTwoAmountSingleMonth)
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountSingleMonth)

        # Operations - eve claim tokens again after two months
        afterMonths = 2
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsToClaim        = 3 # month 0, 1, 2
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * monthsToClaim
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * monthsToClaim
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], monthsToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], monthsToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], monthsToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[2]["parameters"]["value"][-1]["args"][-1]["int"]), optionOneAmountSingleMonth)
        self.assertEqual(int(res.operations[1]["parameters"]["value"][-1]["args"][-1]["int"]), optionTwoAmountSingleMonth)
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountSingleMonth)

        # Operations - eve claim tokens again after three months
        afterMonths = 3
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsToClaim        = 4 # month 0, 1, 2, 3
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * monthsToClaim
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * monthsToClaim
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], monthsToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], monthsToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], monthsToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[2]["parameters"]["value"][-1]["args"][-1]["int"]), optionOneAmountSingleMonth)
        self.assertEqual(int(res.operations[1]["parameters"]["value"][-1]["args"][-1]["int"]), optionTwoAmountSingleMonth)
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountSingleMonth)

        # Operations - eve claim tokens again after four months
        afterMonths = 4
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsToClaim        = 5 # month 0, 1, 3, 4, 5
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * monthsToClaim
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * monthsToClaim
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], monthsToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], monthsToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], monthsToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[2]["parameters"]["value"][-1]["args"][-1]["int"]), optionOneAmountSingleMonth)
        self.assertEqual(int(res.operations[1]["parameters"]["value"][-1]["args"][-1]["int"]), optionTwoAmountSingleMonth)
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountSingleMonth)

        # Operations - eve claim tokens again after five months
        afterMonths = 5
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsToClaim        = 6 # month 0, 1, 2, 3, 4, 5
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * monthsToClaim
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * monthsToClaim
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], monthsToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], monthsToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], monthsToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[2]["parameters"]["value"][-1]["args"][-1]["int"]), optionOneAmountSingleMonth)
        self.assertEqual(int(res.operations[1]["parameters"]["value"][-1]["args"][-1]["int"]), optionTwoAmountSingleMonth)
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountSingleMonth)

        # Operations - eve claim tokens again after six months
        afterMonths = 6
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsToClaim        = 7 # month 0, 1, 2, 3, 4, 5, 6
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12
        zeroAmount           = 0

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * maxOptionOneMonths
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * monthsToClaim
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], maxOptionOneMonths)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], monthsToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], monthsToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (5 * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (5 * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[1]["parameters"]["value"][-1]["args"][-1]["int"]), optionTwoAmountSingleMonth)
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountSingleMonth)

        # Operations - eve claim tokens again after seven months
        afterMonths = 7
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsToClaim        = 8 # month 0, 1, 2, 3, 4, 5, 6, 7
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12
        zeroAmount           = 0

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * maxOptionOneMonths
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * monthsToClaim
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], maxOptionOneMonths)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], monthsToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], monthsToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (5 * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (5 * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[1]["parameters"]["value"][-1]["args"][-1]["int"]), optionTwoAmountSingleMonth)
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountSingleMonth)

        # Operations - eve claim tokens again after eight months
        afterMonths = 8
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsToClaim        = 9 # month 0, 1, 2, 3, 4, 5, 6, 7, 8
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12
        zeroAmount           = 0

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * maxOptionOneMonths
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * maxOptionTwoMonths
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], maxOptionOneMonths)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], maxOptionTwoMonths)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], monthsToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (5 * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (7 * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (5 * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (7 * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountSingleMonth)

        # Operations - eve claim tokens again after nine months
        afterMonths = 9
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsToClaim        = 10 # month 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12
        zeroAmount           = 0

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * maxOptionOneMonths
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * maxOptionTwoMonths
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], maxOptionOneMonths)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], maxOptionTwoMonths)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], monthsToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (5 * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (7 * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (5 * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (7 * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountSingleMonth)

        # Operations - eve claim tokens again after ten months
        afterMonths = 10
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsToClaim        = 11 # month 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12
        zeroAmount           = 0

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * maxOptionOneMonths
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * maxOptionTwoMonths
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], maxOptionOneMonths)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], maxOptionTwoMonths)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], monthsToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (5 * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (7 * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (5 * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (7 * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountSingleMonth)

        # Operations - eve claim tokens again after eleven months
        afterMonths = 11
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsToClaim        = 12 # month 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12
        zeroAmount           = 0

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * maxOptionOneMonths
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * maxOptionTwoMonths
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], maxOptionOneMonths)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], maxOptionTwoMonths)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], monthsToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (5 * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (7 * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (5 * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (7 * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountSingleMonth)

        print('✅ User should be able to claim for the first time on day zero and every month subsequently')

    def test_9_109_user_should_be_able_to_claim_for_the_first_time_on_day_zero_and_every_three_months_subsequently(self):        
        # Initial values
        init_token_sale_storage      = deepcopy(self.tokenSaleStorage)
        
        whitelistStartDateTime       = pytezos.now()
        whitelistEndDateTime         = pytezos.now() + 1 * sec_day
        duringPublicSale             = whitelistEndDateTime + 6 * sec_hour 
        tokenSaleClosed              = duringPublicSale + 2 * sec_day
        tokenSaleClosedLevel         = 100

        optionOneTezPerToken         = init_token_sale_storage["config"]["optionOneTezPerToken"]
        optionTwoTezPerToken         = init_token_sale_storage["config"]["optionTwoTezPerToken"]
        optionThreeTezPerToken       = init_token_sale_storage["config"]["optionThreeTezPerToken"]

        vestingOptionOneInMonths     = init_token_sale_storage["config"]["vestingOptionOneInMonths"]
        vestingOptionTwoInMonths     = init_token_sale_storage["config"]["vestingOptionTwoInMonths"]
        vestingOptionThreeInMonths   = init_token_sale_storage["config"]["vestingOptionThreeInMonths"]

        amountToBuy                  = 30000000     # 30 tez

        # Storage preparation
        res = self.tokenSaleContract.setWhitelistDateTime(whitelistStartDateTime, whitelistEndDateTime).interpret(storage = init_token_sale_storage, sender = bob)
        res = self.tokenSaleContract.startSale().interpret(storage = res.storage, sender = bob)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionOne"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionTwo"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        res = self.tokenSaleContract.buyTokens({
              "amount"      : amountToBuy, 
              "tokenOption" : "optionThree"
          }).interpret(storage = res.storage, sender = eve, now =  duringPublicSale + 500, amount = amountToBuy)

        # Close Sale
        res = self.tokenSaleContract.closeSale().interpret(storage = res.storage, sender = bob, now = tokenSaleClosed, level = 100)

        # Operations - eve claim tokens on day zero
        afterMonths = 0
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsToClaim        = 1 # month 0
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * monthsToClaim
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * monthsToClaim
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], monthsToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], monthsToClaim)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], monthsToClaim)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[2]["parameters"]["value"][-1]["args"][-1]["int"]), optionOneAmountSingleMonth)
        self.assertEqual(int(res.operations[1]["parameters"]["value"][-1]["args"][-1]["int"]), optionTwoAmountSingleMonth)
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountSingleMonth)

        # ----------
        # Operations - eve claim tokens again after three months
        afterMonths = 3
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsClaimed        = 1
        totalTimesClaimed    = 4 # month 0, 1, 2, 3
        monthsToClaim        = totalTimesClaimed - monthsClaimed
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * monthsToClaim
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * monthsToClaim
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        optionOneAmountClaimed   = optionOneAmountSingleMonth * totalTimesClaimed
        optionTwoAmountClaimed   = optionTwoAmountSingleMonth * totalTimesClaimed
        optionThreeAmountClaimed = optionThreeAmountSingleMonth * totalTimesClaimed


        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountClaimed)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountClaimed)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountClaimed)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], totalTimesClaimed)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], totalTimesClaimed)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], totalTimesClaimed)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[2]["parameters"]["value"][-1]["args"][-1]["int"]), optionOneAmountToClaim)
        self.assertEqual(int(res.operations[1]["parameters"]["value"][-1]["args"][-1]["int"]), optionTwoAmountToClaim)
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountToClaim)

        # ----------
        # Operations - eve claim tokens again after another three months
        afterMonths = 6
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsClaimed        = 4
        totalTimesClaimed    = 7 # month 0, 1, 2, 3, 4, 5, 6
        monthsToClaim        = totalTimesClaimed - monthsClaimed
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * (maxOptionOneMonths - monthsClaimed)
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * monthsToClaim
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        optionOneAmountClaimed   = optionOneAmountSingleMonth * maxOptionOneMonths
        optionTwoAmountClaimed   = optionTwoAmountSingleMonth * totalTimesClaimed
        optionThreeAmountClaimed = optionThreeAmountSingleMonth * totalTimesClaimed

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountClaimed)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountClaimed)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountClaimed)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], maxOptionOneMonths)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], totalTimesClaimed)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], totalTimesClaimed)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[2]["parameters"]["value"][-1]["args"][-1]["int"]), optionOneAmountToClaim)
        self.assertEqual(int(res.operations[1]["parameters"]["value"][-1]["args"][-1]["int"]), optionTwoAmountToClaim)
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountToClaim)

        # ----------
        # Operations - eve claim tokens again after another three months
        afterMonths = 9
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsClaimed        = 7
        totalTimesClaimed    = 10 # month 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
        monthsToClaim        = totalTimesClaimed - monthsClaimed
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * (maxOptionOneMonths - monthsClaimed)
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * (maxOptionTwoMonths - monthsClaimed)
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * monthsToClaim

        optionOneAmountClaimed   = optionOneAmountSingleMonth * maxOptionOneMonths
        optionTwoAmountClaimed   = optionTwoAmountSingleMonth * maxOptionTwoMonths
        optionThreeAmountClaimed = optionThreeAmountSingleMonth * totalTimesClaimed

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountClaimed)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountClaimed)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountClaimed)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], maxOptionOneMonths)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], maxOptionTwoMonths)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], totalTimesClaimed)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (6 * blocks_month) + 100)     
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (6 * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[1]["parameters"]["value"][-1]["args"][-1]["int"]), optionTwoAmountToClaim)
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountToClaim)

        # ----------
        # Operations - eve claim tokens again after another three months
        afterMonths = 12
        res = self.tokenSaleContract.claimTokens().interpret(storage = res.storage, sender = eve, now = tokenSaleClosed + (afterMonths * sec_month) + 100, level = tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)

        monthsClaimed        = 10
        totalTimesClaimed    = 12 # month 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
        monthsToClaim        = totalTimesClaimed - monthsClaimed
        maxOptionOneMonths   = 6
        maxOptionTwoMonths   = 8
        maxOptionThreeMonths = 12

        optionOneAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionOneTezPerToken) / vestingOptionOneInMonths) / 10 ** 3 )
        optionTwoAmountSingleMonth   = int( int( int(amountToBuy * 10 ** 12 / optionTwoTezPerToken) / vestingOptionTwoInMonths) / 10 ** 3)
        optionThreeAmountSingleMonth = int( int( int(amountToBuy * 10 ** 12 / optionThreeTezPerToken) / vestingOptionThreeInMonths) / 10 ** 3)

        optionOneAmountToClaim   = optionOneAmountSingleMonth * (maxOptionOneMonths - monthsClaimed)
        optionTwoAmountToClaim   = optionTwoAmountSingleMonth * (maxOptionTwoMonths - monthsClaimed)
        optionThreeAmountToClaim = optionThreeAmountSingleMonth * (maxOptionThreeMonths - monthsClaimed)

        optionOneAmountClaimed   = optionOneAmountSingleMonth * maxOptionOneMonths
        optionTwoAmountClaimed   = optionTwoAmountSingleMonth * maxOptionTwoMonths
        optionThreeAmountClaimed = optionThreeAmountSingleMonth * maxOptionThreeMonths

        # Assertions
        # token sale ledger user record
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneClaimedAmount"], optionOneAmountClaimed)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoClaimedAmount"], optionTwoAmountClaimed)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeClaimedAmount"], optionThreeAmountClaimed)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneTimesClaimed"], maxOptionOneMonths)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoTimesClaimed"], maxOptionTwoMonths)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeTimesClaimed"], maxOptionThreeMonths)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimedBlockLevel"], tokenSaleClosedLevel + (6 * blocks_month) + 100)     
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimedBlockLevel"], tokenSaleClosedLevel + (9 * blocks_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimedBlockLevel"], tokenSaleClosedLevel + (afterMonths * blocks_month) + 100)  

        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionOneLastClaimed"], tokenSaleClosed + (6 * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionTwoLastClaimed"], tokenSaleClosed + (9 * sec_month) + 100)      
        self.assertEqual(res.storage['tokenSaleLedger'][eve]["optionThreeLastClaimed"], tokenSaleClosed + (afterMonths * sec_month) + 100)  

        # operations sent to treasury on amount to claim
        self.assertEqual(int(res.operations[0]["parameters"]["value"][-1]["args"][-1]["int"]), optionThreeAmountToClaim)

        print('✅ User should be able to claim for the first time on day zero and every three months subsequently')
=======
    # def test_70_whitelisted_users_should_be_able_to_buy_tokens_after_token_sale_start(self):
    #     # Initial values
    #     init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
    #     # Operations
    #     res = self.tokenSaleContract.addToWhitelist([eve]).interpret(storage=init_token_sale_storage, sender=bob)
    #     res = self.tokenSaleContract.startSale().interpret(storage=res.storage, sender=bob)

    #     # Assertions
    #     self.assertEqual(res.storage['whitelistedAddresses'][eve], True)
    #     self.assertEqual(res.storage['tokenSaleHasStarted'], True)
    #     self.assertEqual(res.storage['tokenSaleHasEnded'], False)
    #     self.assertEqual(res.storage['tokenSalePaused'], False)

    #     print('--%buyTokens--')
    #     print('✅ User should be able to buy tokens after token sale start')
    


    # ###
    # # %claim
    # ##
    # def test_60_vestee_should_claim(self):
    #     # Initial values
    #     init_vesting_storage        = deepcopy(self.vestingStorage)
    #     totalVestedAmount           = self.MVK(3000000)
    #     totalCliffInMonths          = 2
    #     totalVestingInMonths        = 24
    #     totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths  
    #     currentTimestamp            = pytezos.now()

    #     # Storage preparation
    #     res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
    #     res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

    #     # Assertions
    #     self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
    #     self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
    #     self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
    #     self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

    #     # Operation
    #     firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1

    #     res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff)
    #     claimAmount = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

    #     print('--%claim--')
    #     print('✅ User should be able to call this entrypoint if it is a vestee')

    # def test_61_vestee_should_claim(self):
    #     # Initial values
    #     init_vesting_storage        = deepcopy(self.vestingStorage)
    #     totalVestedAmount           = self.MVK(3000000)
    #     totalCliffInMonths          = 2
    #     totalVestingInMonths        = 24
    #     totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths  
    #     currentTimestamp            = pytezos.now()

    #     # Storage preparation
    #     res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
    #     res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

    #     # Assertions
    #     self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
    #     self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
    #     self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
    #     self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

    #     # Operation
    #     firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1

    #     res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff)
    #     claimAmount = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

    #     res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 30)
    #     claimAmount += int(res.operations[-1]['parameters']['value']['args'][-1]['int'])
    #     self.assertEqual(claimAmount, totalVestedAmount)

    #     print('✅ User should be able to claim previous months if it did not claimed for a long time')

    # def test_62_vestee_should_claim(self):
    #     # Initial values
    #     init_vesting_storage        = deepcopy(self.vestingStorage)
    #     totalVestedAmount           = self.MVK(3000000)
    #     totalCliffInMonths          = 2
    #     totalVestingInMonths        = 24
    #     totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths  
    #     currentTimestamp            = pytezos.now()

    #     # Storage preparation
    #     res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
    #     res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

    #     # Assertions
    #     self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
    #     self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
    #     self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
    #     self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

    #     # Operation
    #     firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1

    #     res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 160)
    #     claimAmount = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])
    #     self.assertEqual(claimAmount, totalVestedAmount)

    #     print('✅ User should be able to claim after the vesting period without claiming extra token')

    # def test_63_vestee_should_claim(self):
    #     # Initial values
    #     init_vesting_storage        = deepcopy(self.vestingStorage)
    #     totalVestedAmount           = self.MVK(3000000)
    #     totalCliffInMonths          = 2
    #     totalVestingInMonths        = 24
    #     totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths  
    #     currentTimestamp            = pytezos.now()

    #     # Storage preparation
    #     res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
    #     res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

    #     # Assertions
    #     self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
    #     self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
    #     self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
    #     self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

    #     # Operation
    #     firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1
    #     res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 10)
    #     claimAmount = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

    #     # Update process
    #     newTotalVestedAmount        = self.MVK(4000000)
    #     newTotalCliffInMonths       = 1
    #     newTotalVestingInMonths     = 12

    #     res = self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalVestingInMonths).interpret(storage=res.storage, sender=bob)

    #     # Assertions
    #     self.assertEqual(newTotalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
    #     self.assertEqual(newTotalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
    #     self.assertEqual(newTotalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

    #     # Operation
    #     res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 160)
    #     claimAmount += int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

    #     self.assertEqual(claimAmount, newTotalVestedAmount)

    #     print('✅ User should be able to claim the correct amount if its vestee record was updated during the process')

    # def test_64_vestee_should_claim(self):
    #     # Initial values
    #     init_vesting_storage        = deepcopy(self.vestingStorage)
    #     totalVestedAmount           = self.MVK(3000000)
    #     totalCliffInMonths          = 0
    #     totalVestingInMonths        = 24
    #     totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths  
    #     currentTimestamp            = pytezos.now()

    #     # Storage preparation
    #     res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
    #     res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

    #     # Assertions
    #     self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
    #     self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
    #     self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
    #     self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

    #     # Operation
    #     firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1
    #     res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 13)
    #     claimAmount = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

    #     # Update process
    #     newTotalVestedAmount        = self.MVK(4000000)
    #     newTotalCliffInMonths       = 0
    #     newTotalVestingInMonths     = 12

    #     res = self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalVestingInMonths).interpret(storage=res.storage, sender=bob)

    #     # Assertions
    #     self.assertEqual(newTotalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
    #     self.assertEqual(newTotalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
    #     self.assertEqual(newTotalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

    #     # Operation
    #     res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 160)
    #     claimAmount += int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

    #     self.assertEqual(claimAmount, newTotalVestedAmount)

    #     print('✅ User should be able to claim without cliff period')

    # def test_64_vestee_should_claim(self):
    #     # Initial values
    #     init_vesting_storage        = deepcopy(self.vestingStorage)
    #     totalVestedAmount           = self.MVK(3000000)
    #     totalCliffInMonths          = 4
    #     totalVestingInMonths        = 24
    #     totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths  
    #     currentTimestamp            = pytezos.now()

    #     # Storage preparation
    #     res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
    #     res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

    #     # Assertions
    #     self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
    #     self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
    #     self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
    #     self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

    #     # Operation
    #     firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1
    #     res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 5)
    #     claimAmount = int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

    #     # Update process
    #     newTotalVestedAmount        = self.MVK(4000000)
    #     newTotalCliffInMonths       = 10
    #     newTotalVestingInMonths     = 12

    #     res = self.vestingContract.updateVestee(bob, newTotalVestedAmount, newTotalCliffInMonths, newTotalVestingInMonths).interpret(storage=res.storage, sender=bob)

    #     # Assertions
    #     self.assertEqual(newTotalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
    #     self.assertEqual(newTotalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
    #     self.assertEqual(newTotalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

    #     # Operation
    #     res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff + sec_month * 160)
    #     claimAmount += int(res.operations[-1]['parameters']['value']['args'][-1]['int'])

    #     self.assertEqual(claimAmount, newTotalVestedAmount)

    #     print('✅ User should be able to claim with an updated longer cliff period')

    # def test_61_non_vestee_should_not_claim(self):
    #     # Initial values
    #     init_vesting_storage        = deepcopy(self.vestingStorage)
    #     totalVestedAmount           = self.MVK(3000000)
    #     totalCliffInMonths          = 2
    #     totalVestingInMonths        = 24
    #     totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths
    #     currentTimestamp            = pytezos.now()
    #     firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1

    #     # Storage preparation
    #     res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
    #     res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

    #     # Assertions
    #     self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
    #     self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
    #     self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
    #     self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

    #     # Operation
    #     with self.raisesMichelsonError(error_vestee_doesnt_exists):
    #         self.vestingContract.claim().interpret(storage=res.storage, sender=alice, now=firstClaimAfterCliff)
        
    #     print('✅ User should not be able to call this entrypoint if it is not a vestee')

    # def test_65_vestee_should_not_claim_if_locked(self):
    #     # Initial values
    #     init_vesting_storage        = deepcopy(self.vestingStorage)
    #     totalVestedAmount           = self.MVK(3000000)
    #     totalCliffInMonths          = 2
    #     totalVestingInMonths        = 24
    #     totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths
    #     currentTimestamp            = pytezos.now()
    #     firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1
        
    #     # Storage preparation
    #     res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
    #     res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)
    #     res = self.vestingContract.toggleVesteeLock(bob).interpret(storage=res.storage, sender=bob)

    #     # Assertions
    #     self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
    #     self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
    #     self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
    #     self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])
    #     self.assertEqual("LOCKED", res.storage['vesteeLedger'][bob]['status'])

    #     # Operation
    #     with self.raisesMichelsonError(error_vestee_is_locked):
    #         self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff)

    #     print('✅ User should not be able to call this entrypoint if its vesting is locked')

    # def test_66_vestee_should_not_claim_if_already_claimed(self):
    #     # Initial values
    #     init_vesting_storage        = deepcopy(self.vestingStorage)
    #     totalVestedAmount           = self.MVK(3000000)
    #     totalCliffInMonths          = 2
    #     totalVestingInMonths        = 24
    #     totalClaimAmountPerMonth    = totalVestedAmount // totalVestingInMonths
    #     currentTimestamp            = pytezos.now()
    #     firstClaimAfterCliff        = totalCliffInMonths * sec_month + currentTimestamp + 1
        
    #     # Storage preparation
    #     res = self.vestingContract.updateWhitelistContracts("authorized", bob).interpret(storage=init_vesting_storage, sender=bob);
    #     res = self.vestingContract.addVestee(bob, totalVestedAmount, totalCliffInMonths, totalVestingInMonths).interpret(storage=res.storage, sender=bob, now=currentTimestamp)

    #     # Assertions
    #     self.assertEqual(totalVestedAmount, res.storage['vesteeLedger'][bob]['totalAllocatedAmount'])
    #     self.assertEqual(totalClaimAmountPerMonth, res.storage['vesteeLedger'][bob]['claimAmountPerMonth'])
    #     self.assertEqual(totalCliffInMonths, res.storage['vesteeLedger'][bob]['cliffMonths'])
    #     self.assertEqual(totalVestingInMonths, res.storage['vesteeLedger'][bob]['vestingMonths'])

    #     # Operation
    #     res = self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff)
    #     with self.raisesMichelsonError(error_unable_to_claim_now):
    #         self.vestingContract.claim().interpret(storage=res.storage, sender=bob, now=firstClaimAfterCliff)

    #     print('✅ User should not be able to call this entrypoint if it already claimed during the same month')
>>>>>>> 92623556 (Token sale contract updates and token sale tests)
