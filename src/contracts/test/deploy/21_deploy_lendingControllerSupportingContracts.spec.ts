import { MichelsonMap } from '@taquito/michelson-encoder'
import { BigNumber } from "bignumber.js";

import { Utils } from "../helpers/Utils";

const saveContractAddress = require("../../helpers/saveContractAddress")

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

import { bob, eve, mallory, oscar } from '../../scripts/sandbox/accounts'

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

import { Aggregator, setAggregatorLambdas } from '../contractHelpers/aggregatorTestHelper'
import { MToken } from '../contractHelpers/mTokenTestHelper'

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
    var mTokenUsdt                      : MToken
    var mTokenEurl                      : MToken
    var mTokenXtz                       : MToken

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

            // mToken for Mock FA12 Token in Lending Controller Token Pool 
            mTokenStorage.governanceAddress = governanceAddress.address;
            mTokenStorage.whitelistContracts = MichelsonMap.fromLiteral({
                "lendingControllerMockTime"     : lendingControllerMockTimeAddress.address, // to be removed in prod
                "lendingController"             : lendingControllerAddress.address,
            })

            mTokenStorage.loanToken = "usdt";  // should correspond to loan token record in lending controller
            mTokenStorage.metadata  = MichelsonMap.fromLiteral({
                '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
                data: Buffer.from(
                    JSON.stringify({
                    version: 'v1.0.0',
                    description: 'Mavryk mUSDT Token',
                    authors: ['Mavryk Dev Team <info@mavryk.io>'],
                    source: {
                        tools: ['Ligo', 'Flextesa'],
                        location: 'https://ligolang.org/',
                    },
                    interfaces: ['TZIP-7', 'TZIP-12', 'TZIP-16', 'TZIP-21'],
                    errors: [],
                    views: [],
                    assets: [
                        {
                        symbol: Buffer.from('mUSDT').toString('hex'),
                        name: Buffer.from('mUSDT').toString('hex'),
                        decimals: Buffer.from('6').toString('hex'),
                        icon: Buffer.from('https://infura-ipfs.io/ipfs/Qmf99wTUgVsEndqhmoQLrpSiDoGMTZCCFLz7KEc5vfp8h1').toString('hex'),
                        shouldPreferSymbol: true,
                        thumbnailUri: 'https://infura-ipfs.io/ipfs/Qmf99wTUgVsEndqhmoQLrpSiDoGMTZCCFLz7KEc5vfp8h1'
                        }
                    ]
                    }),
                    'ascii',
                ).toString('hex'),
            })
            mTokenStorage.token_metadata    = MichelsonMap.fromLiteral({
                0: {
                    token_id: '0',
                    token_info: MichelsonMap.fromLiteral({
                        symbol: Buffer.from('mUSDT').toString('hex'),
                        name: Buffer.from('mUSDT').toString('hex'),
                        decimals: Buffer.from('6').toString('hex'),
                        icon: Buffer.from('https://infura-ipfs.io/ipfs/Qmf99wTUgVsEndqhmoQLrpSiDoGMTZCCFLz7KEc5vfp8h1').toString('hex'),
                        shouldPreferSymbol: Buffer.from(new Uint8Array([1])).toString('hex'),
                        thumbnailUri: Buffer.from('https://infura-ipfs.io/ipfs/Qmf99wTUgVsEndqhmoQLrpSiDoGMTZCCFLz7KEc5vfp8h1').toString('hex')
                    }),
                },
            })
            mTokenUsdt = await MToken.originate(
                utils.tezos,
                mTokenStorage
            );
        
            await saveContractAddress("mTokenUsdtAddress", mTokenUsdt.contract.address)
            console.log("mTokenUsdt Contract deployed at:", mTokenUsdt.contract.address);



            // mToken for Mock FA12 Token in Lending Controller Token Pool 
            mTokenStorage.loanToken = "eurl"; 
            mTokenStorage.metadata  = MichelsonMap.fromLiteral({
                '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
                data: Buffer.from(
                    JSON.stringify({
                    version: 'v1.0.0',
                    description: 'Mavryk mEURL Token',
                    authors: ['Mavryk Dev Team <info@mavryk.io>'],
                    source: {
                        tools: ['Ligo', 'Flextesa'],
                        location: 'https://ligolang.org/',
                    },
                    interfaces: ['TZIP-7', 'TZIP-12', 'TZIP-16', 'TZIP-21'],
                    errors: [],
                    views: [],
                    assets: [
                        {
                        symbol: Buffer.from('mEURL').toString('hex'),
                        name: Buffer.from('mEURL').toString('hex'),
                        decimals: Buffer.from('6').toString('hex'),
                        icon: Buffer.from('https://infura-ipfs.io/ipfs/QmY9jnbME9dxEsHapLsqt7b2juRgJXUpn41NgweMqCm5L4').toString('hex'),
                        shouldPreferSymbol: true,
                        thumbnailUri: 'https://infura-ipfs.io/ipfs/QmY9jnbME9dxEsHapLsqt7b2juRgJXUpn41NgweMqCm5L4'
                        }
                    ]
                    }),
                    'ascii',
                ).toString('hex'),
              })
            mTokenStorage.token_metadata    = MichelsonMap.fromLiteral({
                0: {
                    token_id: '0',
                    token_info: MichelsonMap.fromLiteral({
                        symbol: Buffer.from('mEURL').toString('hex'),
                        name: Buffer.from('mEURL').toString('hex'),
                        decimals: Buffer.from('6').toString('hex'),
                        icon: Buffer.from('https://infura-ipfs.io/ipfs/QmY9jnbME9dxEsHapLsqt7b2juRgJXUpn41NgweMqCm5L4').toString('hex'),
                        shouldPreferSymbol: Buffer.from(new Uint8Array([1])).toString('hex'),
                        thumbnailUri: Buffer.from('https://infura-ipfs.io/ipfs/QmY9jnbME9dxEsHapLsqt7b2juRgJXUpn41NgweMqCm5L4').toString('hex')
                    }),
                },
            })
            mTokenEurl = await MToken.originate(
                utils.tezos,
                mTokenStorage
            );
        
            await saveContractAddress("mTokenEurlAddress", mTokenEurl.contract.address)
            console.log("mTokenEurl Contract deployed at:", mTokenEurl.contract.address);



            // mToken for XTZ in Lending Controller Token Pool 
            mTokenStorage.loanToken = "tez"; 
            mTokenStorage.metadata  = MichelsonMap.fromLiteral({
                '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
                data: Buffer.from(
                    JSON.stringify({
                    version: 'v1.0.0',
                    description: 'Mavryk mXTZ Token',
                    authors: ['Mavryk Dev Team <info@mavryk.io>'],
                    source: {
                        tools: ['Ligo', 'Flextesa'],
                        location: 'https://ligolang.org/',
                    },
                    interfaces: ['TZIP-7', 'TZIP-12', 'TZIP-16', 'TZIP-21'],
                    errors: [],
                    views: [],
                    assets: [
                        {
                        symbol: Buffer.from('mXTZ').toString('hex'),
                        name: Buffer.from('mXTZ').toString('hex'),
                        decimals: Buffer.from('6').toString('hex'),
                        icon: Buffer.from('https://infura-ipfs.io/ipfs/QmaHqm92e6rCgw4eNFZ8SxJ5s9hsSgS5tJS4r4Af4zcy89').toString('hex'),
                        shouldPreferSymbol: true,
                        thumbnailUri: 'https://infura-ipfs.io/ipfs/QmaHqm92e6rCgw4eNFZ8SxJ5s9hsSgS5tJS4r4Af4zcy89'
                        }
                    ]
                    }),
                    'ascii',
                ).toString('hex'),
            })
            mTokenStorage.token_metadata    = MichelsonMap.fromLiteral({
                0: {
                    token_id: '0',
                    token_info: MichelsonMap.fromLiteral({
                        symbol: Buffer.from('mXTZ').toString('hex'),
                        name: Buffer.from('mXTZ').toString('hex'),
                        decimals: Buffer.from('6').toString('hex'),
                        icon: Buffer.from('https://infura-ipfs.io/ipfs/QmaHqm92e6rCgw4eNFZ8SxJ5s9hsSgS5tJS4r4Af4zcy89').toString('hex'),
                        shouldPreferSymbol: Buffer.from(new Uint8Array([1])).toString('hex'),
                        thumbnailUri: Buffer.from('https://infura-ipfs.io/ipfs/QmaHqm92e6rCgw4eNFZ8SxJ5s9hsSgS5tJS4r4Af4zcy89').toString('hex')
                    }),
                },
            })
            mTokenXtz= await MToken.originate(
                utils.tezos,
                mTokenStorage
            );
        
            await saveContractAddress("mTokenXtzAddress", mTokenXtz.contract.address)
            console.log("mTokenXtz Contract deployed at:", mTokenXtz.contract.address);



            // mToken for XTZ in Lending Controller Token Pool 
            mTokenStorage.loanToken = "tzbtc"; 
            mTokenStorage.metadata  = MichelsonMap.fromLiteral({
                '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
                data: Buffer.from(
                    JSON.stringify({
                    version: 'v1.0.0',
                    description: 'Mavryk mTzBTC Token',
                    authors: ['Mavryk Dev Team <info@mavryk.io>'],
                    source: {
                        tools: ['Ligo', 'Flextesa'],
                        location: 'https://ligolang.org/',
                    },
                    interfaces: ['TZIP-7', 'TZIP-12', 'TZIP-16', 'TZIP-21'],
                    errors: [],
                    views: [],
                    assets: [
                        {
                        symbol: Buffer.from('mTzBTC').toString('hex'),
                        name: Buffer.from('mTzBTC').toString('hex'),
                        decimals: Buffer.from('8').toString('hex'),
                        icon: Buffer.from('https://infura-ipfs.io/ipfs/Qme1GSg6KA3kbh3T6pwzVf3VcDRKY88fDYG6dzT6yFueME').toString('hex'),
                        shouldPreferSymbol: true,
                        thumbnailUri: 'https://infura-ipfs.io/ipfs/Qme1GSg6KA3kbh3T6pwzVf3VcDRKY88fDYG6dzT6yFueME'
                        }
                    ]
                    }),
                    'ascii',
                ).toString('hex'),
            })
            mTokenStorage.token_metadata    = MichelsonMap.fromLiteral({
                0: {
                    token_id: '0',
                    token_info: MichelsonMap.fromLiteral({
                        symbol: Buffer.from('mTzBTC').toString('hex'),
                        name: Buffer.from('mTzBTC').toString('hex'),
                        decimals: Buffer.from('8').toString('hex'),
                        icon: Buffer.from('https://infura-ipfs.io/ipfs/Qme1GSg6KA3kbh3T6pwzVf3VcDRKY88fDYG6dzT6yFueME').toString('hex'),
                        shouldPreferSymbol: Buffer.from(new Uint8Array([1])).toString('hex'),
                        thumbnailUri: Buffer.from('https://infura-ipfs.io/ipfs/Qme1GSg6KA3kbh3T6pwzVf3VcDRKY88fDYG6dzT6yFueME').toString('hex')
                    }),
                },
            })
            mTokenXtz= await MToken.originate(
                utils.tezos,
                mTokenStorage
            );
        
            await saveContractAddress("mTokenTzbtcAddress", mTokenXtz.contract.address)
            console.log("mTokenTzbtc Contract deployed at:", mTokenXtz.contract.address);


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

            // Setup default Mock Aggregator Storage
            aggregatorStorage.config = {

                decimals                            : new BigNumber(6),
                alphaPercentPerThousand             : new BigNumber(2),
                
                percentOracleThreshold              : new BigNumber(60),
                heartBeatSeconds                    : new BigNumber(30),
                
                rewardAmountStakedMvk               : new BigNumber(10000000), // 0.01 MVK
                rewardAmountXtz                     : new BigNumber(1300),     // ~0.0013 tez 
            };
            aggregatorStorage.oracleLedger      = oracleMap;
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