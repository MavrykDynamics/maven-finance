import { Utils } from "../helpers/Utils";
import { MichelsonMap } from '@taquito/michelson-encoder'
import { BigNumber } from "bignumber.js";
const saveContractAddress = require("../../helpers/saveContractAddress")

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

import { bob, eve, mallory, oracleMaintainer } from '../../scripts/sandbox/accounts'

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import mvkTokenAddress from '../../deployments/mvkTokenAddress.json';
import governanceAddress from '../../deployments/governanceAddress.json';
import lendingControllerAddress from '../../deployments/lendingControllerAddress.json';

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { Aggregator, setAggregatorLambdas } from '../helpers/aggregatorHelper'
import { MavrykFa2Token } from "../helpers/mavrykFa2TokenHelper"

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { aggregatorStorage } from '../../storage/aggregatorStorage'
import { mavrykFa2TokenStorage } from '../../storage/mavrykFa2TokenStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Lending Controller', async () => {
  
    var utils: Utils
    var lpTokenPoolMockFa12Token        : MavrykFa2Token
    var lpTokenPoolMockFa2Token         : MavrykFa2Token
    var lpTokenPoolXtz                  : MavrykFa2Token

    var mockUsdXtzAggregator            : Aggregator
    var mockUsdMockFa12TokenAggregator  : Aggregator
    var mockUsdMockFa2TokenAggregator   : Aggregator
    var mockUsdStakedMvkTokenAggregator : Aggregator

    var tezos

    before('setup', async () => {
        try{
            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------

            // LP Token for Mock FA12 Token in Lending Controller Token Pool 
            mavrykFa2TokenStorage.whitelistContracts = MichelsonMap.fromLiteral({
                "lendingController"     : lendingControllerAddress.address
            })
            lpTokenPoolMockFa12Token = await MavrykFa2Token.originate(
                utils.tezos,
                mavrykFa2TokenStorage
            );
        
            await saveContractAddress("lpTokenPoolMockFa12TokenAddress", lpTokenPoolMockFa12Token.contract.address)
            console.log("LP Token Pool Mock Fa12 Token Contract deployed at:", lpTokenPoolMockFa12Token.contract.address);



            // LP Token for Mock FA12 Token in Lending Controller Token Pool 
            lpTokenPoolMockFa2Token = await MavrykFa2Token.originate(
                utils.tezos,
                mavrykFa2TokenStorage
            );
        
            await saveContractAddress("lpTokenPoolMockFa2TokenAddress", lpTokenPoolMockFa2Token.contract.address)
            console.log("LP Token Pool Mock Fa2 Token Contract deployed at:", lpTokenPoolMockFa2Token.contract.address);



            // LP Token for XTZ in Lending Controller Token Pool 
            lpTokenPoolXtz= await MavrykFa2Token.originate(
                utils.tezos,
                mavrykFa2TokenStorage
            );
        
            await saveContractAddress("lpTokenPoolXtzAddress", lpTokenPoolXtz.contract.address)
            console.log("LP Token Pool XTZ Contract deployed at:", lpTokenPoolXtz.contract.address);


            //----------------------------
            // Mock Oracles
            //----------------------------
            const oracleMap = MichelsonMap.fromLiteral({
                [bob.pkh]              : true,
                [eve.pkh]              : true,
                [mallory.pkh]          : true,
                [oracleMaintainer.pkh] : true,
            });

            // Setup default Mock Aggregator Storage
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
            aggregatorStorage.oracleAddresses   = oracleMap;
            aggregatorStorage.mvkTokenAddress   = mvkTokenAddress.address;
            aggregatorStorage.governanceAddress = governanceAddress.address;

            // Mock USD/MockFa12Token Aggregator
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



            // Mock USD/MockFa2Token Aggregator
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



            // Mock USD/Xtz Aggregator
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


            //----------------------------
            // Mock USD/sMVK Token Aggregator Contract
            // - decimals to 9
            //----------------------------

            aggregatorStorage.config.decimals = new BigNumber(9);
            aggregatorStorage.lastCompletedRoundPrice = {
                round                   : new BigNumber(0),
                price                   : new BigNumber(2000000),
                percentOracleResponse   : new BigNumber(100),
                priceDateTime           : '1'
            };
            mockUsdStakedMvkTokenAggregator = await Aggregator.originate(
                utils.tezos,
                aggregatorStorage
            )

            await saveContractAddress('mockUsdStakedMvkTokenAggregatorAddress', mockUsdStakedMvkTokenAggregator.contract.address)
            console.log('Mock USD/StakedMvkToken Aggregator Contract deployed at:', mockUsdStakedMvkTokenAggregator.contract.address)

            //----------------------------
            // Set Lambdas
            //----------------------------

            tezos = mockUsdMockFa12TokenAggregator.tezos

            // Aggregator Setup Lambdas
            await setAggregatorLambdas(tezos, mockUsdMockFa12TokenAggregator.contract);
            await setAggregatorLambdas(tezos, mockUsdMockFa2TokenAggregator.contract);
            await setAggregatorLambdas(tezos, mockUsdXtzAggregator.contract);
            await setAggregatorLambdas(tezos, mockUsdStakedMvkTokenAggregator.contract);
          
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