const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { MVK, Utils, zeroAddress } from "../helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../../scripts/confirmation";
const saveContractAddress = require("../helpers/saveContractAddress")
const saveMVKDecimals = require('../../helpers/saveMVKDecimals')
import { MichelsonMap } from '@taquito/michelson-encoder'
import {TezosToolkit, TransactionOperation} from "@taquito/taquito";
import {BigNumber} from "bignumber.js";

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

import env from '../../env'
import { bob, alice, eve, mallory, oscar } from '../../scripts/sandbox/accounts'


// ------------------------------------------------------------------------------
// Contract Addresses
// ------------------------------------------------------------------------------

import governanceAddress from '../../deployments/governanceAddress.json';
import governanceProxyAddress from '../../deployments/governanceProxyAddress.json';
import mvkTokenAddress from '../../deployments/mvkTokenAddress.json';

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import {Aggregator, setAggregatorLambdas} from '../contractHelpers/aggregatorTestHelper'
import {
    AggregatorFactory,
    setAggregatorFactoryLambdas, setAggregatorFactoryProductLambdas
} from '../contractHelpers/aggregatorFactoryTestHelper'
import { LendingControllerMockTime, setLendingControllerLambdas } from "../contractHelpers/lendingControllerMockTimeTestHelper"
import { VaultFactory, setVaultFactoryLambdas, setVaultFactoryProductLambdas } from "../contractHelpers/vaultFactoryTestHelper"

import { MavrykFa12Token } from '../contractHelpers/mavrykFa12TokenTestHelper'
import { MavrykFa2Token } from '../contractHelpers/mavrykFa2TokenTestHelper'
import { MToken } from '../contractHelpers/mTokenTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { aggregatorStorage } from '../../storage/aggregatorStorage'

import { lendingControllerMockTimeStorage } from "../../storage/lendingControllerMockTimeStorage"
import { vaultFactoryStorage } from "../../storage/vaultFactoryStorage"

import { mavrykFa12TokenStorage } from '../../storage/mavrykFa12TokenStorage'
import { mavrykFa2TokenStorage } from '../../storage/mavrykFa2TokenStorage'
import { mTokenStorage } from '../../storage/mTokenStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Lending Controller Mock Time Contracts Deployment for Tests', async () => {
  
    var tezos
    var utils: Utils
    
    let governanceInstance
    let vaultFactoryInstance

    var mockUsdXtzAggregator            : Aggregator;
    var mockUsdMockFa12TokenAggregator  : Aggregator;
    var mockUsdMockFa2TokenAggregator   : Aggregator;
    var mockUsdMvkAggregator            : Aggregator;

    var mockFa12Token                   : MavrykFa12Token
    var mockFa2Token                    : MavrykFa2Token
    var mTokenUsdt                      : MToken;
    var mTokenEurl                      : MToken;
    var mTokenXtz                       : MToken;

    var lendingControllerMockTime       : LendingControllerMockTime
    var vaultFactory                    : VaultFactory
    
        
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
            mavrykFa12TokenStorage.governanceAddress = governanceAddress.address;
            mockFa12Token = await MavrykFa12Token.originate(
                utils.tezos,
                mavrykFa12TokenStorage
            )
        
            await saveContractAddress('mockFa12TokenAddress', mockFa12Token.contract.address)
            console.log('Mock FA12 Token Contract deployed at:', mockFa12Token.contract.address)
        

            //----------------------------
            // Mock FA2 Token
            //----------------------------
            mavrykFa2TokenStorage.governanceAddress = governanceAddress.address;
            mockFa2Token = await MavrykFa2Token.originate(
                utils.tezos,
                mavrykFa2TokenStorage
            )
        
            await saveContractAddress('mockFa2TokenAddress', mockFa2Token.contract.address)
            console.log('Mock Fa2 Token Contract deployed at:', mockFa2Token.contract.address)
        

            //----------------------------
            // mUsdt mToken
            //----------------------------
            mTokenStorage.governanceAddress = governanceAddress.address;
            mTokenStorage.whitelistContracts = MichelsonMap.fromLiteral({
                "lendingController"     : lendingControllerMockTime.contract.address
            });
            mTokenStorage.loanToken = "usdt";  // should correspond to loan token record in lending controller
            mTokenUsdt = await MToken.originate(
                utils.tezos,
                mTokenStorage
            );

            await saveContractAddress("mTokenUsdtAddress", mTokenUsdt.contract.address)
            console.log("mTokenUsdt Contract deployed at:", mTokenUsdt.contract.address);


            //----------------------------
            // mEurl mToken
            //----------------------------
            mTokenStorage.loanToken = "eurl";  // should correspond to loan token record in lending controller
            mTokenEurl = await MToken.originate(
                utils.tezos,
                mTokenStorage
            );
        
            await saveContractAddress("mTokenEurlAddress", mTokenEurl.contract.address)
            console.log("mTokenEurl Contract deployed at:", mTokenEurl.contract.address);


            //----------------------------
            // mXtz mToken
            //----------------------------
            mTokenStorage.loanToken = "tez";  // should correspond to loan token record in lending controller
            mTokenXtz= await MToken.originate(
                utils.tezos,
                mTokenStorage
            );

            await saveContractAddress("mTokenXtzAddress", mTokenXtz.contract.address)
            console.log("mTokenXtz Contract deployed at:", mTokenXtz.contract.address);
        

            //----------------------------
            // Mock Oracles
            //----------------------------
            const oracleMap = MichelsonMap.fromLiteral({
                [bob.pkh]              : {
                    oraclePublicKey : bob.pk,
                    oraclePeerId : bob.peerId
                },
                [eve.pkh]              : {
                    oraclePublicKey : eve.pk,
                    oraclePeerId : eve.peerId
                },
                [mallory.pkh]          : {
                    oraclePublicKey : mallory.pk,
                    oraclePeerId : mallory.peerId
                }
            });

            //----------------------------
            // Mock USD/MockFA12 Token Aggregator Contract
            //----------------------------
          
            aggregatorStorage.config = {
                decimals                            : new BigNumber(6),
                alphaPercentPerThousand             : new BigNumber(2),
                
                percentOracleThreshold              : new BigNumber(60),
                heartBeatSeconds                    : new BigNumber(30),
                
                rewardAmountStakedMvk               : new BigNumber(10000000), // 0.01 MVK
                rewardAmountXtz                     : new BigNumber(1300),     // ~0.0013 tez 
            };
            aggregatorStorage.lastCompletedData = {
                round                   : new BigNumber(0),
                epoch                   : new BigNumber(0),
                data                    : new BigNumber(1500000),
                percentOracleResponse   : new BigNumber(100),
                lastUpdatedAt           : '1'
            };
            aggregatorStorage.oracleLedger      = oracleMap;
            aggregatorStorage.mvkTokenAddress   = mvkTokenAddress.address;
            aggregatorStorage.governanceAddress = governanceAddress.address;
            mockUsdMockFa12TokenAggregator = await Aggregator.originate(
                utils.tezos,
                aggregatorStorage
            )

            await saveContractAddress('mockUsdMockFa12TokenAggregatorAddress', mockUsdMockFa12TokenAggregator.contract.address)
            console.log('Mock USD/MockFA12Token Aggregator Contract deployed at:', mockUsdMockFa12TokenAggregator.contract.address)


            //----------------------------
            // Mock USD/MockFA2 Token Aggregator Contract
            //----------------------------
            aggregatorStorage.lastCompletedData = {
                round                   : new BigNumber(0),
                epoch                   : new BigNumber(0),
                data                    : new BigNumber(3500000),
                percentOracleResponse   : new BigNumber(100),
                lastUpdatedAt           : '1'
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
            
            aggregatorStorage.lastCompletedData = {
                round                   : new BigNumber(0),
                epoch                   : new BigNumber(0),
                data                    : new BigNumber(1800000),
                percentOracleResponse   : new BigNumber(100),
                lastUpdatedAt           : '1'
            };
            mockUsdXtzAggregator = await Aggregator.originate(
                utils.tezos,
                aggregatorStorage
            )
            await saveContractAddress('mockUsdXtzAggregatorAddress', mockUsdXtzAggregator.contract.address)
            console.log('Mock USD/XTZ Aggregator Contract deployed at:', mockUsdXtzAggregator.contract.address)


            //----------------------------
            // Mock USD/sMVK Token Aggregator Contract
            // - decimals to 9
            //----------------------------

            aggregatorStorage.config.decimals = new BigNumber(9);
            aggregatorStorage.lastCompletedData = {
                round                   : new BigNumber(0),
                epoch                   : new BigNumber(0),
                data                    : new BigNumber(1000000000),
                percentOracleResponse   : new BigNumber(100),
                lastUpdatedAt           : '1'
            };
            mockUsdMvkAggregator = await Aggregator.originate(
                utils.tezos,
                aggregatorStorage
            )

            await saveContractAddress('mockUsdMvkAggregatorAddress', mockUsdMvkAggregator.contract.address)
            console.log('Mock USD/MVK Aggregator Contract deployed at:', mockUsdMvkAggregator.contract.address)

        
            /* ---- ---- ---- ---- ---- */
    
            tezos = lendingControllerMockTime.tezos
            await signerFactory(bob.sk);
        
            //----------------------------
            // Set Lambdas
            //----------------------------

            console.log('====== set lambdas ======')

            // Lending Controller Lambdas
            await setLendingControllerLambdas(tezos, lendingControllerMockTime.contract);
            console.log("Lending Controller Lambdas Setup")

            // Vault Factory Lambdas
            await setVaultFactoryLambdas(tezos, vaultFactory.contract);
            console.log("Vault Factory Lambdas Setup")

            // Vault Factory Setup Vault Lambdas
            await setVaultFactoryProductLambdas(tezos, vaultFactory.contract)
            console.log("Vault Factory - Vault Lambdas Setup")

            // Aggregator Setup Lambdas
            await setAggregatorLambdas(tezos, mockUsdMockFa12TokenAggregator.contract);
            await setAggregatorLambdas(tezos, mockUsdMockFa2TokenAggregator.contract);
            await setAggregatorLambdas(tezos, mockUsdXtzAggregator.contract);
            await setAggregatorLambdas(tezos, mockUsdMvkAggregator.contract);

            //----------------------------
            // Update Contract Links and Relationships
            //----------------------------
        
            // Governance Contract update general contracts
            governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
        
            // Governance Contract - set contract addresses [doorman, delegation, emergencyGovernance, breakGlass, council, vesting, treasury, farmFactory, treasuryFactory]
            const governanceContractsBatch = await tezos.wallet
            .batch()
        
            // general contracts
            .withContractCall(governanceInstance.methods.updateGeneralContracts('lendingController' , lendingControllerMockTime.contract.address))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('vaultFactory'      , vaultFactory.contract.address))

            .withContractCall(governanceInstance.methods.updateGeneralContracts('usdMockFa12TokenAggregator'    , mockUsdMockFa12TokenAggregator.contract.address))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('usdMockFa2TokenAggregator'     , mockUsdMockFa2TokenAggregator.contract.address))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('usdXtzAggregator'              , mockUsdXtzAggregator.contract.address))
            .withContractCall(governanceInstance.methods.updateGeneralContracts('usdMvkAggregator'              , mockUsdMvkAggregator.contract.address))
        
            const governanceContractsBatchOperation = await governanceContractsBatch.send()
            await confirmOperation(tezos, governanceContractsBatchOperation.opHash)
        
            console.log('Governance Contract - set general contract addresses [lendingController]')

            
            //----------------------------
            // Set Vault Factory Admin to Governance Proxy 
            //----------------------------


            // Vault Factory Set Admin
            vaultFactoryInstance = await utils.tezos.contract.at(vaultFactory.contract.address);
            const vaultFactorySetAdminOperation = await vaultFactoryInstance.methods.setAdmin(governanceProxyAddress.address).send();

            await vaultFactorySetAdminOperation.confirmation();
        

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