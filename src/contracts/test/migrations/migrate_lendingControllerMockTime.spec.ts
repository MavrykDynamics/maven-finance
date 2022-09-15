const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { MVK, Utils, zeroAddress } from "../helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../../scripts/confirmation";
const saveContractAddress = require("../../helpers/saveContractAddress")
const saveMVKDecimals = require('../../helpers/saveMVKDecimals')
import { MichelsonMap } from '@taquito/michelson-encoder'
import {TezosToolkit, TransactionOperation} from "@taquito/taquito";
import {BigNumber} from "bignumber.js";

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

import env from '../../env'
import { bob, alice, eve, mallory, oracle0, oracle1, oracle2, oracleMaintainer } from '../../scripts/sandbox/accounts'


// ------------------------------------------------------------------------------
// Contract Addresses
// ------------------------------------------------------------------------------

import governanceAddress from '../../deployments/governanceAddress.json';
import mvkTokenAddress from '../../deployments/mvkTokenAddress.json';

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import {Aggregator, setAggregatorLambdas} from '../helpers/aggregatorHelper'
import {
    AggregatorFactory,
    setAggregatorFactoryLambdas, setAggregatorFactoryProductLambdas
} from '../helpers/aggregatorFactoryHelper'
import { LendingControllerMockTime, setLendingControllerLambdas } from "../helpers/lendingControllerMockTimeHelper"
import { VaultFactory, setVaultFactoryLambdas, setVaultFactoryProductLambdas } from "../helpers/vaultFactoryHelper"
import { TokenPoolReward, setTokenPoolRewardLambdas } from "../helpers/tokenPoolRewardHelper"

import { MockFa12Token } from '../helpers/mockFa12TokenHelper'
import { MockFa2Token } from '../helpers/mockFa2TokenHelper'
import { TokenPoolLpToken } from "../helpers/tokenPoolLpTokenHelper"

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { aggregatorStorage } from '../../storage/aggregatorStorage'
import { lpStorage } from "../../storage/testLPTokenStorage"

import { vaultStorage } from "../../storage/vaultStorage"
import { lendingControllerMockTimeStorage } from "../../storage/lendingControllerMockTimeStorage"
import { vaultFactoryStorage } from "../../storage/vaultFactoryStorage"
import { tokenPoolRewardStorage } from "../../storage/tokenPoolRewardStorage"

import { mockFa12TokenStorage } from '../../storage/mockFa12TokenStorage'
import { mockFa2TokenStorage } from '../../storage/mockFa2TokenStorage'
import { tokenPoolLpTokenStorage } from "../../storage/tokenPoolLpTokenStorage"

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Lending Controller Mock Time Contracts Deployment for Tests', async () => {
  
    var tezos
    var utils: Utils
    
    let governanceInstance

    var mockUsdXtzAggregator            : Aggregator;
    var mockUsdMockFa12TokenAggregator  : Aggregator;
    var mockUsdMockFa2TokenAggregator   : Aggregator;

    var mockFa12Token                   : MockFa12Token
    var mockFa2Token                    : MockFa2Token
    var lpTokenPoolMockFa12Token        : TokenPoolLpToken;
    var lpTokenPoolMockFa2Token         : TokenPoolLpToken;
    var lpTokenPoolXtz                  : TokenPoolLpToken;

    var lendingControllerMockTime       : LendingControllerMockTime
    var vaultFactory : VaultFactory
    var tokenPoolReward                 : TokenPoolReward
    
        
    const signerFactory = async (pk) => {
        await tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) })
        return tezos
    }

    before('setup', async () => {
        try{
            utils = new Utils()
            await utils.init(bob.sk)

            governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------

            lendingControllerMockTimeStorage.mvkTokenAddress     = mvkTokenAddress.address
            lendingControllerMockTimeStorage.governanceAddress   = governanceAddress.address
            lendingControllerMockTime = await LendingControllerMockTime.originate(utils.tezos,lendingControllerMockTimeStorage);

            await saveContractAddress('lendingControllerMockTimeAddress', lendingControllerMockTime.contract.address)
            console.log('Lending Controller Mock Time Contract deployed at:', lendingControllerMockTime.contract.address)

            //----------------------------
            // Vault Factory
            //----------------------------

            vaultFactoryStorage.mvkTokenAddress     = mvkTokenAddress.address
            vaultFactoryStorage.governanceAddress   = governanceAddress.address
            vaultFactory = await VaultFactory.originate(utils.tezos,vaultFactoryStorage);

            await saveContractAddress('vaultFactoryAddress', vaultFactory.contract.address)
            console.log('Vault Factory Contract deployed at:', vaultFactory.contract.address)


            //----------------------------
            // Mock FA12 Token
            //----------------------------
            mockFa12Token = await MockFa12Token.originate(
                utils.tezos,
                mockFa12TokenStorage
            )
        
            await saveContractAddress('mockFa12TokenAddress', mockFa12Token.contract.address)
            console.log('Mock FA12 Token Contract deployed at:', mockFa12Token.contract.address)
        

            //----------------------------
            // Mock FA2 Token
            //----------------------------
            mockFa2Token = await MockFa2Token.originate(
                utils.tezos,
                mockFa2TokenStorage
            )
        
            await saveContractAddress('mockFa2TokenAddress', mockFa2Token.contract.address)
            console.log('Mock Fa2 Token Contract deployed at:', mockFa2Token.contract.address)
        

            //----------------------------
            // LP Token: Mock FA12 Token in Lending Controller Token Pool 
            //----------------------------
            tokenPoolLpTokenStorage.whitelistContracts = MichelsonMap.fromLiteral({
                "lendingController"     : lendingControllerMockTime.contract.address
            })
            lpTokenPoolMockFa12Token = await TokenPoolLpToken.originate(
                utils.tezos,
                tokenPoolLpTokenStorage
            );

            await saveContractAddress("lpTokenPoolMockFa12TokenAddress", lpTokenPoolMockFa12Token.contract.address)
            console.log("LP Token Pool Mock Fa12 Token Contract deployed at:", lpTokenPoolMockFa12Token.contract.address);

            //----------------------------
            // LP Token: Mock FA2 Token in Lending Controller Token Pool 
            //----------------------------
            lpTokenPoolMockFa2Token = await TokenPoolLpToken.originate(
                utils.tezos,
                tokenPoolLpTokenStorage
            );
        
            await saveContractAddress("lpTokenPoolMockFa2TokenAddress", lpTokenPoolMockFa2Token.contract.address)
            console.log("LP Token Pool Mock Fa2 Token Contract deployed at:", lpTokenPoolMockFa2Token.contract.address);

            //----------------------------
            // LP Token: XTZ in Lending Controller Token Pool 
            //----------------------------
            lpTokenPoolXtz= await TokenPoolLpToken.originate(
                utils.tezos,
                tokenPoolLpTokenStorage
            );

            await saveContractAddress("lpTokenPoolXtzAddress", lpTokenPoolXtz.contract.address)
            console.log("LP Token Pool XTZ Contract deployed at:", lpTokenPoolXtz.contract.address);
        
            //----------------------------
            // Mock USD/MockFA12 Token Aggregator Contract
            //----------------------------
            aggregatorStorage.config = {
                nameMaxLength                       : new BigNumber(200),
                decimals                            : new BigNumber(6),
                numberBlocksDelay                   : new BigNumber(2),
                
                deviationTriggerBanDuration         : new BigNumber(86400), // one day
                perThousandDeviationTrigger         : new BigNumber(2),
                percentOracleThreshold              : new BigNumber(49),
            
                requestRateDeviationDepositFee      : new BigNumber(0),
                
                deviationRewardStakedMvk            : new BigNumber(15000000), // 0.015 MVK
                deviationRewardAmountXtz            : new BigNumber(0),  
                rewardAmountStakedMvk               : new BigNumber(10000000), // 0.01 MVK
                rewardAmountXtz                     : new BigNumber(1300),     // ~0.0013 tez 
            };
            aggregatorStorage.lastCompletedRoundPrice = {
                round                   : new BigNumber(0),
                price                   : new BigNumber(1500000),
                percentOracleResponse   : new BigNumber(100),
                priceDateTime           : '1'
            };
            mockUsdMockFa12TokenAggregator = await Aggregator.originate(
                utils.tezos,
                aggregatorStorage
            )

            await saveContractAddress('mockUsdMockFa12TokenAggregatorAddress', mockUsdMockFa12TokenAggregator.contract.address)
            console.log('Mock USD/MockFA12Token Aggregator Contract deployed at:', mockUsdMockFa12TokenAggregator.contract.address)


            //----------------------------
            // Mock USD/MockFA2 Token Aggregator Contract
            //----------------------------
            aggregatorStorage.lastCompletedRoundPrice = {
                round                   : new BigNumber(0),
                price                   : new BigNumber(3500000),
                percentOracleResponse   : new BigNumber(100),
                priceDateTime           : '1'
            };
            mockUsdMockFa2TokenAggregator = await Aggregator.originate(
                utils.tezos,
                aggregatorStorage
            )

            await saveContractAddress('mockUsdMockFa2TokenAggregatorAddress', mockUsdMockFa2TokenAggregator.contract.address)
            console.log('Mock USD/MockFA2Token Aggregator Contract deployed at:', mockUsdMockFa2TokenAggregator.contract.address)


            //----------------------------
            // Mock USD/XTZ Token Aggregator Contract
            //----------------------------
            aggregatorStorage.lastCompletedRoundPrice = {
                round                   : new BigNumber(0),
                price                   : new BigNumber(1800000),
                percentOracleResponse   : new BigNumber(100),
                priceDateTime           : '1'
            };
            mockUsdXtzAggregator = await Aggregator.originate(
                utils.tezos,
                aggregatorStorage
            )
            await saveContractAddress('mockUsdXtzAggregatorAddress', mockUsdXtzAggregator.contract.address)
            console.log('Mock USD/XTZ Aggregator Contract deployed at:', mockUsdXtzAggregator.contract.address)



            // Token Pool Reward Contract
            tokenPoolRewardStorage.mvkTokenAddress = mvkTokenAddress.address;
            tokenPoolRewardStorage.governanceAddress = governanceAddress.address;
            tokenPoolReward = await TokenPoolReward.originate(
                utils.tezos,
                tokenPoolRewardStorage
            )
            await saveContractAddress('tokenPoolRewardAddress', tokenPoolReward.contract.address)
            console.log('Token Pool Reward Contract deployed at:', tokenPoolReward.contract.address)
            
        
            /* ---- ---- ---- ---- ---- */
    
            tezos = lendingControllerMockTime.tezos
            await signerFactory(bob.sk);

            console.log('====== set lambdas ======')
        
            //----------------------------
            // Set Lambdas
            //----------------------------

            // Lending Controller Lambdas
            await setLendingControllerLambdas(tezos, lendingControllerMockTime.contract);
            console.log("Lending Controller Lambdas Setup")

            // Vault Factory Lambdas
            await setVaultFactoryLambdas(tezos, vaultFactory.contract);
            console.log("Vault Factory Lambdas Setup")

            // Vault Factory Setup Vault Lambdas
            await setVaultFactoryProductLambdas(tezos, vaultFactory.contract)
            console.log("Vault Factory - Vault Lambdas Setup")

            // Token Pool Reward Lambdas
            await setTokenPoolRewardLambdas(tezos, tokenPoolReward.contract);
            console.log("Token Pool Reward Lambdas Setup")
        

            //----------------------------
            // Update Contract Links and Relationships
            //----------------------------
        
            // Governance Contract update general contracts
            governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
        
            // Governance Contract - set contract addresses [doorman, delegation, emergencyGovernance, breakGlass, council, vesting, treasury, farmFactory, treasuryFactory]
            const governanceContractsBatch = await tezos.wallet
            .batch()
        
            // general contracts
            .withContractCall(governanceInstance.methods.updateGeneralContracts('lendingController', lendingControllerMockTime.contract.address))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('tokenPoolReward', tokenPoolReward.contract.address))
        
            const governanceContractsBatchOperation = await governanceContractsBatch.send()
            await confirmOperation(tezos, governanceContractsBatchOperation.opHash)
        
            console.log('Governance Contract - set general contract addresses [lendingController, tokenPoolReward]')
        

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`test all contract deployments`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --') 
            console.log('Test: Lending Controller Mock Time contracts deployed')
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log('error')
            console.log(e)
        }
    })
  
})