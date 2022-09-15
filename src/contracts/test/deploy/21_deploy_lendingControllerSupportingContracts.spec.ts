import { Utils } from "../helpers/Utils";
import { MichelsonMap } from '@taquito/michelson-encoder'
import { BigNumber } from "bignumber.js";
const saveContractAddress = require("../../helpers/saveContractAddress")

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

import { bob } from '../../scripts/sandbox/accounts'

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import mvkTokenAddress from '../../deployments/mvkTokenAddress.json';
import governanceAddress from '../../deployments/governanceAddress.json';
import lendingControllerAddress from '../../deployments/lendingControllerAddress.json';

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { Aggregator } from '../helpers/aggregatorHelper'
import { TokenPoolLpToken } from "../helpers/tokenPoolLpTokenHelper"
import { TokenPoolReward, setTokenPoolRewardLambdas } from "../helpers/tokenPoolRewardHelper"

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { aggregatorStorage } from '../../storage/aggregatorStorage'
import { tokenPoolLpTokenStorage } from '../../storage/tokenPoolLpTokenStorage'
import { tokenPoolRewardStorage } from '../../storage/tokenPoolRewardStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Lending Controller', async () => {
  
    var utils: Utils
    var lpTokenPoolMockFa12Token        : TokenPoolLpToken
    var lpTokenPoolMockFa2Token         : TokenPoolLpToken
    var lpTokenPoolXtz                  : TokenPoolLpToken

    var mockUsdXtzAggregator            : Aggregator
    var mockUsdMockFa12TokenAggregator  : Aggregator
    var mockUsdMockFa2TokenAggregator   : Aggregator

    var tokenPoolReward                 : TokenPoolReward
    var tezos

    before('setup', async () => {
        try{
            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------

            // LP Token for Mock FA12 Token in Lending Controller Token Pool 
            tokenPoolLpTokenStorage.whitelistContracts = MichelsonMap.fromLiteral({
                "lendingController"     : lendingControllerAddress.address
            })
            lpTokenPoolMockFa12Token = await TokenPoolLpToken.originate(
                utils.tezos,
                tokenPoolLpTokenStorage
            );
        
            await saveContractAddress("lpTokenPoolMockFa12TokenAddress", lpTokenPoolMockFa12Token.contract.address)
            console.log("LP Token Pool Mock Fa12 Token Contract deployed at:", lpTokenPoolMockFa12Token.contract.address);



            // LP Token for Mock FA12 Token in Lending Controller Token Pool 
            lpTokenPoolMockFa2Token = await TokenPoolLpToken.originate(
                utils.tezos,
                tokenPoolLpTokenStorage
            );
        
            await saveContractAddress("lpTokenPoolMockFa2TokenAddress", lpTokenPoolMockFa2Token.contract.address)
            console.log("LP Token Pool Mock Fa2 Token Contract deployed at:", lpTokenPoolMockFa2Token.contract.address);



            // LP Token for XTZ in Lending Controller Token Pool 
            lpTokenPoolXtz= await TokenPoolLpToken.originate(
                utils.tezos,
                tokenPoolLpTokenStorage
            );
        
            await saveContractAddress("lpTokenPoolXtzAddress", lpTokenPoolXtz.contract.address)
            console.log("LP Token Pool XTZ Contract deployed at:", lpTokenPoolXtz.contract.address);



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

            

            // Token Pool Reward Contract
            tokenPoolRewardStorage.governanceAddress    = governanceAddress.address;
            tokenPoolRewardStorage.mvkTokenAddress      = mvkTokenAddress.address;
            tokenPoolReward = await TokenPoolReward.originate(
                utils.tezos,
                tokenPoolRewardStorage
            )
            await saveContractAddress('tokenPoolRewardAddress', tokenPoolReward.contract.address)
            console.log('Token Pool Reward Contract deployed at:', tokenPoolReward.contract.address)


            //----------------------------
            // Set Lambdas
            //----------------------------

            tezos = tokenPoolReward.tezos

            // Token Pool Reward Lambdas
            await setTokenPoolRewardLambdas(tezos, tokenPoolReward.contract);
            console.log("Token Pool Reward Lambdas Setup")
          
          
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