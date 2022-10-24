import { MichelsonMap } from '@taquito/michelson-encoder'
import { BigNumber } from "bignumber.js";

import { Utils } from "../helpers/Utils";

const saveContractAddress = require("../../helpers/saveContractAddress")

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

import { bob, eve, mallory, oracleMaintainer, oscar } from '../../scripts/sandbox/accounts'

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import mvkTokenAddress from '../../deployments/mvkTokenAddress.json';
import governanceAddress from '../../deployments/governanceAddress.json';
import lendingControllerAddress from '../../deployments/lendingControllerAddress.json';
import lendingControllerMockTimeAddress from '../../deployments/lendingControllerMockTimeAddress.json';

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { Aggregator, setAggregatorLambdas } from '../helpers/aggregatorHelper'
import { MToken } from '../helpers/mTokenHelper'

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
    var lpTokenPoolMockFa12Token        : MToken
    var lpTokenPoolMockFa2Token         : MToken
    var lpTokenPoolXtz                  : MToken

    var mockUsdXtzAggregator            : Aggregator
    var mockUsdMockFa12TokenAggregator  : Aggregator
    var mockUsdMockFa2TokenAggregator   : Aggregator
    var mockUsdMvkAggregator            : Aggregator

    var tezos

    before('setup', async () => {
        try{
            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------

            // LP Token for Mock FA12 Token in Lending Controller Token Pool 
            mTokenStorage.whitelistContracts = MichelsonMap.fromLiteral({
                "lendingController"             : lendingControllerAddress.address,
                "lendingControllerMockTime"     : lendingControllerMockTimeAddress.address
            })
            lpTokenPoolMockFa12Token = await MToken.originate(
                utils.tezos,
                mTokenStorage
            );
        
            await saveContractAddress("lpTokenPoolMockFa12TokenAddress", lpTokenPoolMockFa12Token.contract.address)
            console.log("LP Token Pool Mock Fa12 Token Contract deployed at:", lpTokenPoolMockFa12Token.contract.address);



            // LP Token for Mock FA12 Token in Lending Controller Token Pool 
            lpTokenPoolMockFa2Token = await MToken.originate(
                utils.tezos,
                mTokenStorage
            );
        
            await saveContractAddress("lpTokenPoolMockFa2TokenAddress", lpTokenPoolMockFa2Token.contract.address)
            console.log("LP Token Pool Mock Fa2 Token Contract deployed at:", lpTokenPoolMockFa2Token.contract.address);



            // LP Token for XTZ in Lending Controller Token Pool 
            lpTokenPoolXtz= await MToken.originate(
                utils.tezos,
                mTokenStorage
            );
        
            await saveContractAddress("lpTokenPoolXtzAddress", lpTokenPoolXtz.contract.address)
            console.log("LP Token Pool XTZ Contract deployed at:", lpTokenPoolXtz.contract.address);


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
                },
                [oscar.pkh] : {
                    oraclePublicKey : oscar.pk,
                    oraclePeerId : oscar.peerId
                }
            });

            // Setup default Mock Aggregator Storage
            aggregatorStorage.config = {

                decimals                            : new BigNumber(6),
                alphaPercentPerThousand             : new BigNumber(2),
                
                percentOracleThreshold              : new BigNumber(60),
                heartBeatSeconds                    : new BigNumber(30),
                
                rewardAmountStakedMvk               : new BigNumber(10000000), // 0.01 MVK
                rewardAmountXtz                     : new BigNumber(1300),     // ~0.0013 tez 
            };
            aggregatorStorage.oracleAddresses   = oracleMap;
            aggregatorStorage.mvkTokenAddress   = mvkTokenAddress.address;
            aggregatorStorage.governanceAddress = governanceAddress.address;

            // Mock USD/MockFa12Token Aggregator
            aggregatorStorage.lastCompletedData = {
                round                   : new BigNumber(0),
                epoch                   : new BigNumber(0),
                data                    : new BigNumber(1500000),
                percentOracleResponse   : new BigNumber(100),
                lastUpdatedAt           : '1'
            };
            mockUsdMockFa12TokenAggregator = await Aggregator.originate(
                utils.tezos,
                aggregatorStorage
            )
        
            await saveContractAddress('mockUsdMockFa12TokenAggregatorAddress', mockUsdMockFa12TokenAggregator.contract.address)
            console.log('Mock USD/MockFA12Token Aggregator Contract deployed at:', mockUsdMockFa12TokenAggregator.contract.address)



            // Mock USD/MockFa2Token Aggregator
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



            // Mock USD/Xtz Aggregator
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

            //----------------------------
            // Set Lambdas
            //----------------------------

            tezos = mockUsdMockFa12TokenAggregator.tezos

            // Aggregator Setup Lambdas
            await setAggregatorLambdas(tezos, mockUsdMockFa12TokenAggregator.contract);
            await setAggregatorLambdas(tezos, mockUsdMockFa2TokenAggregator.contract);
            await setAggregatorLambdas(tezos, mockUsdXtzAggregator.contract);
            await setAggregatorLambdas(tezos, mockUsdMvkAggregator.contract);
          
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