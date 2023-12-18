import { MichelsonMap } from '@mavrykdynamics/taquito-michelson-encoder'
import { BigNumber } from "bignumber.js"

import { Utils } from "../helpers/Utils"

const saveContractAddress = require("../helpers/saveContractAddress")

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from '../contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { GeneralContract, setGeneralContractLambdas } from '../helpers/deploymentTestHelper'
import { alice, bob, eve, susie } from '../../scripts/sandbox/accounts'
import { mTokenMockData } from "../helpers/mockSampleData"

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { aggregatorStorage } from '../../storage/aggregatorStorage'
import { mTokenStorage } from '../../storage/mTokenStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Lending Controller Supporting Contracts', async () => {
  
    var utils: Utils
    var mTokenUsdt                      
    var mTokenEurl                      
    var mTokenXtz                       
    var mTokenTzBtc

    var mockUsdXtzAggregator            
    var mockUsdMockFa12TokenAggregator  
    var mockUsdMockFa2TokenAggregator   
    var mockUsdMvkAggregator            

    var tezos

    before('setup', async () => {
        try{
            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------

            // mToken for Mock FA12 Token in Lending Controller Token Pool 
            mTokenStorage.governanceAddress = contractDeployments.governance.address;
            if('lendingControllerMockTime' in contractDeployments){ // to be removed in prod
                mTokenStorage.whitelistContracts.set(contractDeployments.lendingControllerMockTime.address, null)
            }
            if('lendingController' in contractDeployments){
                mTokenStorage.whitelistContracts.set(contractDeployments.lendingController.address, null)
            }

            mTokenStorage.loanToken      = mTokenMockData.mTokenUsdt.loanToken;  // should correspond to loan token record in lending controller
            mTokenStorage.metadata       = mTokenMockData.mTokenUsdt.metadata;
            mTokenStorage.token_metadata = mTokenMockData.mTokenUsdt.token_metadata;

            mTokenUsdt = await GeneralContract.originate(utils.tezos, "mTokenUsdt", mTokenStorage);
            await saveContractAddress("mTokenUsdtAddress", mTokenUsdt.contract.address)


            // mToken for Mock FA12 Token in Lending Controller Token Pool 
            mTokenStorage.loanToken      = mTokenMockData.mTokenEurl.loanToken;
            mTokenStorage.metadata       = mTokenMockData.mTokenEurl.metadata;
            mTokenStorage.token_metadata = mTokenMockData.mTokenEurl.token_metadata;
            
            mTokenEurl = await GeneralContract.originate(utils.tezos, "mTokenEurl", mTokenStorage);
            await saveContractAddress("mTokenEurlAddress", mTokenEurl.contract.address)


            // mToken for XTZ in Lending Controller Token Pool 
            mTokenStorage.loanToken      = mTokenMockData.mTokenTez.loanToken;
            mTokenStorage.metadata       = mTokenMockData.mTokenTez.metadata;
            mTokenStorage.token_metadata = mTokenMockData.mTokenTez.token_metadata;

            mTokenXtz = await GeneralContract.originate(utils.tezos, "mTokenXtz", mTokenStorage);
            await saveContractAddress("mTokenXtzAddress", mTokenXtz.contract.address)


            // mToken for tzBtc in Lending Controller Token Pool 
            mTokenStorage.loanToken      = mTokenMockData.mTokenTzBtc.loanToken;
            mTokenStorage.metadata       = mTokenMockData.mTokenTzBtc.metadata;
            mTokenStorage.token_metadata = mTokenMockData.mTokenTzBtc.token_metadata;

            mTokenTzBtc = await GeneralContract.originate(utils.tezos, "mTokenTzBtc", mTokenStorage);
            await saveContractAddress("mTokenTzbtcAddress", mTokenTzBtc.contract.address)

            //----------------------------
            // Mock Oracles
            //----------------------------
            const oracleMap = MichelsonMap.fromLiteral({
                [alice.pkh]              : {
                    oraclePublicKey : alice.pk,
                    oraclePeerId : alice.peerId
                },
                [eve.pkh]              : {
                    oraclePublicKey : eve.pk,
                    oraclePeerId : eve.peerId
                },
                [susie.pkh]          : {
                    oraclePublicKey : susie.pk,
                    oraclePeerId : susie.peerId
                }
            });

            // Setup default Mock Aggregator Storage
            aggregatorStorage.config = {

                decimals                            : new BigNumber(6),
                alphaPercentPerThousand             : new BigNumber(2),
                
                percentOracleThreshold              : new BigNumber(60),
                heartbeatSeconds                    : new BigNumber(30),
                
                rewardAmountStakedMvk               : new BigNumber(10000000), // 0.01 MVK
                rewardAmountXtz                     : new BigNumber(1300),     // ~0.0013 tez 
            };
            aggregatorStorage.oracleLedger      = oracleMap;
            aggregatorStorage.mvkTokenAddress   = contractDeployments.mvkToken.address;
            aggregatorStorage.governanceAddress = contractDeployments.governance.address;

            // Mock USD/MockFa12Token Aggregator
            aggregatorStorage.lastCompletedData = {
                round                   : new BigNumber(0),
                epoch                   : new BigNumber(0),
                data                    : new BigNumber(1500000),
                percentOracleResponse   : new BigNumber(100),
                lastUpdatedAt           : '1'
            };
            
            mockUsdMockFa12TokenAggregator = await GeneralContract.originate(utils.tezos, "aggregator", aggregatorStorage);
            await saveContractAddress('mockUsdMockFa12TokenAggregatorAddress', mockUsdMockFa12TokenAggregator.contract.address)



            // Mock USD/MockFa2Token Aggregator
            aggregatorStorage.lastCompletedData = {
                round                   : new BigNumber(0),
                epoch                   : new BigNumber(0),
                data                    : new BigNumber(3500000),
                percentOracleResponse   : new BigNumber(100),
                lastUpdatedAt           : '1'
            };
            
            mockUsdMockFa2TokenAggregator = await GeneralContract.originate(utils.tezos, "aggregator", aggregatorStorage);
            await saveContractAddress('mockUsdMockFa2TokenAggregatorAddress', mockUsdMockFa2TokenAggregator.contract.address)


            // Mock USD/Xtz Aggregator
            aggregatorStorage.lastCompletedData = {
                round                   : new BigNumber(0),
                epoch                   : new BigNumber(0),
                data                    : new BigNumber(1800000),
                percentOracleResponse   : new BigNumber(100),
                lastUpdatedAt           : '1'
            };

            mockUsdXtzAggregator = await GeneralContract.originate(utils.tezos, "aggregator", aggregatorStorage);
            await saveContractAddress('mockUsdXtzAggregatorAddress', mockUsdXtzAggregator.contract.address)


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

            mockUsdMvkAggregator = await GeneralContract.originate(utils.tezos, "aggregator", aggregatorStorage);
            await saveContractAddress('mockUsdMvkAggregatorAddress', mockUsdMvkAggregator.contract.address)

            //----------------------------
            // Set Lambdas
            //----------------------------

            tezos = mockUsdMockFa12TokenAggregator.tezos

            // Aggregator Setup Lambdas
            await setGeneralContractLambdas(tezos, "aggregator", mockUsdMockFa12TokenAggregator.contract);
            await setGeneralContractLambdas(tezos, "aggregator", mockUsdMockFa2TokenAggregator.contract);
            await setGeneralContractLambdas(tezos, "aggregator", mockUsdXtzAggregator.contract);
            await setGeneralContractLambdas(tezos, "aggregator", mockUsdMvkAggregator.contract);
          
        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`lending controller supporting contracts deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })

})