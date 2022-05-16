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

sec_day   = 86400
sec_week  = 604800
sec_month = 2592000 # 30 days

blocks_day = 2880
blocks_month = blocks_day * 30 # 86400 per month

error_only_administrator    = 0
error_sender_not_allowed    = 'Error. Sender is not allowed to call this entrypoint.'
error_unable_to_claim_now   = 'Error. You are unable to claim now.'
error_vestee_is_locked      = 'Error. Vestee is locked.'
error_vestee_not_found      = 'Error. Vestee is not found.'
error_vestee_exists         = 'Error. Vestee already exists'
error_vestee_doesnt_exists = 'Error. Vestee is not found.'

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
        res = self.tokenSaleContract.setAdmin(eve).interpret(storage=init_token_sale_storage, sender=bob)

        # Assertions
        self.assertEqual(eve, res.storage['admin'])

        print('--%setAdmin--')
        print('✅ Admin should be able to call this entrypoint and update the contract administrator with a new address')

    def test_01_non_admin_should_not_set_admin(self):
        # Initial values
        init_token_sale_storage = deepcopy(self.tokenSaleStorage)

        # Operation
        with self.raisesMichelsonError(error_only_administrator):
            self.tokenSaleContract.setAdmin(eve).interpret(storage=init_token_sale_storage, sender=alice);

        print('✅ Non-admin should not be able to call this entrypoint')

    ###
    # %updateConfig
    ##
    def test_10_admin_can_update_config(self):
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
        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "maxAmountOptOnePerWalletTotal",
            "updateConfigNewValue" : newMaxAmountOptionOnePerWalletTotal
        }).interpret(storage=init_token_sale_storage, sender=bob)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "maxAmountOptTwoPerWalletTotal",
            "updateConfigNewValue" : newMaxAmountOptionTwoPerWalletTotal
        }).interpret(storage=res.storage, sender=bob)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "maxAmountOptThreePerWalletTotal",
            "updateConfigNewValue" : newMaxAmountOptionThreePerWalletTotal
        }).interpret(storage=res.storage, sender=bob)

        # whitelist max amount by option 
        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "whitelistMaxAmountOptOneTotal",
            "updateConfigNewValue" : newWhitelistMaxAmountOptionOneTotal
        }).interpret(storage=res.storage, sender=bob)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "whitelistMaxAmountOptTwoTotal",
            "updateConfigNewValue" : newWhitelistMaxAmountOptionTwoTotal
        }).interpret(storage=res.storage, sender=bob)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "whitelistMaxAmountOptThreeTotal",
            "updateConfigNewValue" : newWhitelistMaxAmountOptionThreeTotal
        }).interpret(storage=res.storage, sender=bob)

        # options max amount cap
        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "optionOneMaxAmountCap",
            "updateConfigNewValue" : newOptionOneMaxAmountCap
        }).interpret(storage=res.storage, sender=bob)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "optionTwoMaxAmountCap",
            "updateConfigNewValue" : newOptionTwoMaxAmountCap
        }).interpret(storage=res.storage, sender=bob)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "optionThreeMaxAmountCap",
            "updateConfigNewValue" : newOptionThreeMaxAmountCap
        }).interpret(storage=res.storage, sender=bob)

        # vesting option in months
        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "vestingOptionOneInMonths",
            "updateConfigNewValue" : newVestingOptionOneInMonths
        }).interpret(storage=res.storage, sender=bob)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "vestingOptionTwoInMonths",
            "updateConfigNewValue" : newVestingOptionTwoInMonths
        }).interpret(storage=res.storage, sender=bob)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "vestingOptionThreeInMonths",
            "updateConfigNewValue" : newVestingOptionThreeInMonths
        }).interpret(storage=res.storage, sender=bob)

        # options tez per token
        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "optionOneTezPerToken",
            "updateConfigNewValue" : newOptionOneTezPerToken
        }).interpret(storage=res.storage, sender=bob)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "optionTwoTezPerToken",
            "updateConfigNewValue" : newOptionTwoTezPerToken
        }).interpret(storage=res.storage, sender=bob)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "optionThreeTezPerToken",
            "updateConfigNewValue" : newOptionThreeTezPerToken
        }).interpret(storage=res.storage, sender=bob)

        # min option amount in tez
        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "minOptionOneAmountInTez",
            "updateConfigNewValue" : newMinOptionOneAmountInTez
        }).interpret(storage=res.storage, sender=bob)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "minOptionTwoAmountInTez",
            "updateConfigNewValue" : newMinOptionTwoAmountInTez
        }).interpret(storage=res.storage, sender=bob)

        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "minOptionThreeAmountInTez",
            "updateConfigNewValue" : newMinOptionThreeAmountInTez
        }).interpret(storage=res.storage, sender=bob)

        # blocks per minute
        res = self.tokenSaleContract.updateConfig({
            "updateConfigAction"   : "blocksPerMinute",
            "updateConfigNewValue" : newBlocksPerMinute
        }).interpret(storage=res.storage, sender=bob)
        
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
        print('✅ Admin can update config')


    ###
    # %addToWhitelist
    ##
    def test_20_admin_can_add_single_user_to_whitelist(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)

        # Operation
        res = self.tokenSaleContract.addToWhitelist([eve]).interpret(storage=init_token_sale_storage, sender=bob)

        # Assertions
        self.assertEqual(res.storage['whitelistedAddresses'][eve], True)
        
        print('--%addToWhitelist--')
        print('✅ Admin can add a single user to whitelist')

    def test_21_non_admin_should_not_add_be_able_to_whitelist(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
        # Operation
        with self.raisesMichelsonError(error_only_administrator):
            self.tokenSaleContract.addToWhitelist([bob]).interpret(storage=init_token_sale_storage, sender=eve)

        print('✅ Non-admin should not be able to add to whitelist')

    def test_22_admin_can_add_multiple_users_to_whitelist(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)

        # Operation
        res = self.tokenSaleContract.addToWhitelist([eve,fox,mallory]).interpret(storage=init_token_sale_storage, sender=bob)

        # Assertions
        self.assertEqual(res.storage['whitelistedAddresses'][eve], True)
        self.assertEqual(res.storage['whitelistedAddresses'][fox], True)
        self.assertEqual(res.storage['whitelistedAddresses'][mallory], True)
        
        print('✅ Admin can add multiple users to whitelist')
        
    def test_23_if_whitelist_user_already_exists_nothing_happens(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)

        # Operation
        res = self.tokenSaleContract.addToWhitelist([eve,fox,mallory]).interpret(storage=init_token_sale_storage, sender=bob)
        res = self.tokenSaleContract.addToWhitelist([eve,fox]).interpret(storage=res.storage, sender=bob)

        # Assertions
        self.assertEqual(res.storage['whitelistedAddresses'][eve], True)
        self.assertEqual(res.storage['whitelistedAddresses'][fox], True)
        self.assertEqual(res.storage['whitelistedAddresses'][mallory], True)
        
        print('✅ If user is already in whitelist addreses, nothing happens')

    # ###
    # # %removeFromWhitelist
    # ##
    def test_30_admin_can_remove_single_user_from_whitelist(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)

        # Operations
        res = self.tokenSaleContract.addToWhitelist([eve,fox,mallory]).interpret(storage=init_token_sale_storage, sender=bob)
        res = self.tokenSaleContract.removeFromWhitelist([eve]).interpret(storage=res.storage, sender=bob)

        # Assertions
        self.assertEqual(res.storage['whitelistedAddresses'][eve], None)    # eve removed from whitelisted addresses
        self.assertEqual(res.storage['whitelistedAddresses'][fox], True)
        self.assertEqual(res.storage['whitelistedAddresses'][mallory], True)

        print('--%removeFromWhitelist--')
        print('✅ Admin can remove single user from whitelist')

    def test_31_admin_can_remove_multiple_users_from_whitelist(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)

        # Operations
        res = self.tokenSaleContract.addToWhitelist([eve,fox,mallory]).interpret(storage=init_token_sale_storage, sender=bob)
        res = self.tokenSaleContract.removeFromWhitelist([eve,fox,mallory]).interpret(storage=res.storage, sender=bob)

        # Assertions
        self.assertEqual(res.storage['whitelistedAddresses'][eve], None)      # eve removed from whitelisted addresses
        self.assertEqual(res.storage['whitelistedAddresses'][fox], None)      # fox removed from whitelisted addresses
        self.assertEqual(res.storage['whitelistedAddresses'][mallory], None)  # mallory removed from whitelisted addresses

        print('✅ Admin can remove multiple users from whitelist')


    def test_32_non_admin_should_not_be_able_to_remove_whitelist_users(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)

        # Storage preparation
        res = self.tokenSaleContract.addToWhitelist([eve,fox,mallory]).interpret(storage=init_token_sale_storage, sender=bob)

        # Assertions
        self.assertEqual(res.storage['whitelistedAddresses'][eve], True) 
        self.assertEqual(res.storage['whitelistedAddresses'][fox], True)
        self.assertEqual(res.storage['whitelistedAddresses'][mallory], True)

        # Operation
        with self.raisesMichelsonError(error_only_administrator):
            self.tokenSaleContract.removeFromWhitelist([fox,mallory]).interpret(storage=res.storage, sender=eve)

        print('✅ Non-admin should not be able to remove whitelist users')

    def test_33_nothing_happens_if_non_existent_user_is_removed_from_whitelisted_addresses(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
        # Operation
        res = self.tokenSaleContract.removeFromWhitelist([fox]).interpret(storage=init_token_sale_storage, sender=bob)

        # Assertions
        with pytest.raises(KeyError):
          _ = res.storage['whitelistedAddresses'][fox] # check that fox user does not exist in whitelisted addresses key
        
        print('✅ Nothing happens if non existent user is removed from whitelisted addresses')

    # ###
    # # %startSale
    # ##
    def test_40_admin_should_be_able_to_start_sale(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
        # Operation
        res = self.tokenSaleContract.startSale().interpret(storage=init_token_sale_storage, sender=bob)

        # Assertion
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)

        print('--%startSale--')
        print('✅ Admin should be able to start sale')

    def test_40_non_admin_should_not_be_able_to_start_sale(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
        # Operation
        with self.raisesMichelsonError(error_only_administrator):
          self.tokenSaleContract.startSale().interpret(storage=init_token_sale_storage, sender=eve)

        # Assertion
        self.assertEqual(init_token_sale_storage['tokenSaleHasStarted'], False)

        print('✅ Non-admin should not be able to start sale')

    # ###
    # # %pauseSale
    # ##
    def test_50_admin_should_be_able_to_pause_sale(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
        # Operation
        res = self.tokenSaleContract.startSale().interpret(storage=init_token_sale_storage, sender=bob)
        res = self.tokenSaleContract.pauseSale().interpret(storage=res.storage, sender=bob)

        # Assertion
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSalePaused'], True)

        print('--%pauseSale--')
        print('✅ Admin should be able to pause sale')

    def test_51_non_admin_should_not_be_able_to_pause_sale(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
        # Storage preparation
        res = self.tokenSaleContract.startSale().interpret(storage=init_token_sale_storage, sender=bob)

        # Assertions
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSalePaused'], False)
        
        with self.raisesMichelsonError(error_only_administrator):
          self.tokenSaleContract.pauseSale().interpret(storage=res.storage, sender=eve)

        # Assertion
        self.assertEqual(res.storage['tokenSalePaused'], False)

        print('✅ Non-admin should not be able to pause sale')

    def test_52_admin_should_be_able_to_pause_then_unpause_sale(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
        # Operation
        res = self.tokenSaleContract.startSale().interpret(storage=init_token_sale_storage, sender=bob)
        res = self.tokenSaleContract.pauseSale().interpret(storage=res.storage, sender=bob)

        # Assertion
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSalePaused'], True)

        # Operation
        res = self.tokenSaleContract.pauseSale().interpret(storage=res.storage, sender=bob)

        # Assertion
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        print('✅ Admin should be able to pause then unpause sale')
        
    # ###
    # # %closeSale
    # ##
    def test_60_admin_should_be_able_to_close_sale(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
        # Operation
        res = self.tokenSaleContract.startSale().interpret(storage=init_token_sale_storage, sender=bob)
        res = self.tokenSaleContract.closeSale().interpret(storage=res.storage, sender=bob)

        # Assertion
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], True)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        print('--%closeSale--')
        print('✅ Admin should be able to close sale')

    def test_61_non_admin_should_not_be_able_to_close_sale(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
        # Storage preparation
        res = self.tokenSaleContract.startSale().interpret(storage=init_token_sale_storage, sender=bob)

        # Assertions
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], False)
        self.assertEqual(res.storage['tokenSalePaused'], False)
        
        with self.raisesMichelsonError(error_only_administrator):
          self.tokenSaleContract.closeSale().interpret(storage=res.storage, sender=eve)

        # Assertions
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], False)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        print('✅ Non-admin should not be able to close sale')

    def test_52_admin_should_be_able_to_close_sale_then_restart_if_necessary(self):
        # Initial values
        init_token_sale_storage    = deepcopy(self.tokenSaleStorage)
        
        # Operation
        res = self.tokenSaleContract.startSale().interpret(storage=init_token_sale_storage, sender=bob)
        res = self.tokenSaleContract.closeSale().interpret(storage=res.storage, sender=bob)

        # Assertions
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], True)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        # Operation
        res = self.tokenSaleContract.startSale().interpret(storage=res.storage, sender=bob)

        # Assertions
        self.assertEqual(res.storage['tokenSaleHasStarted'], True)
        self.assertEqual(res.storage['tokenSaleHasEnded'], False)
        self.assertEqual(res.storage['tokenSalePaused'], False)

        print('✅ Admin should be able to close sale then restart sale if necessary')
        
    # ###
    # # %buyTokens
    # ##
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
