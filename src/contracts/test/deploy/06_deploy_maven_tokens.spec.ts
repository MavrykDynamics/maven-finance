import { Utils } from "../helpers/Utils"
const saveContractAddress = require("../helpers/saveContractAddress")
import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"

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

import { GeneralContract }  from '../helpers/deploymentTestHelper'
import { bob } from '../../scripts/sandbox/accounts'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { mavenFa12TokenStorage } from '../../storage/mavenFa12TokenStorage'
import { mavenFa2TokenStorage } from '../../storage/mavenFa2TokenStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Maven Token', async () => {
    
    var utils: Utils
    var mavenFa12Token 
    var mavenFa2Token 

    before('setup', async () => {
        try{

            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------
        
            mavenFa12TokenStorage.governanceAddress  = contractDeployments.governance.address;
            mavenFa12Token = await GeneralContract.originate(utils.tezos, "mavenFa12Token", mavenFa12TokenStorage);
            await saveContractAddress('mavenFa12TokenAddress', mavenFa12Token.contract.address)
        
            mavenFa2TokenStorage.governanceAddress  = contractDeployments.governance.address;
            mavenFa2Token = await GeneralContract.originate(utils.tezos, "mavenFa2Token", mavenFa2TokenStorage);
            await saveContractAddress('mavenFa2TokenAddress', mavenFa2Token.contract.address)

            // Deploy a fakeUSDt Token
            const fakeUSDtMetadata = MichelsonMap.fromLiteral({
                '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
                data: Buffer.from(
                    JSON.stringify({
                    name: 'Tether Token',
                    description: 'All Tether tokens are pegged at 1-to-1 with a matching fiat currency and built by a trusted team of developers which operates under tether.to.',
                    version: '1.0.1',
                    license: {
                        name: 'MIT',
                        details: 'MIT License'
                    }, 
                    authors: [
                        'Tether Operations Limited'
                    ],
                    homepage: 'https://tether.to/',
                    source: {
                        tools: [
                            "SmartPy 0.10.1"
                        ],
                        location: "https://github.com/airgap-it/usdt-smart-contracts"
                    },
                    interfaces: [
                        'TZIP-012', 
                        'TZIP-016', 
                        'TZIP-021'
                    ],
                    errors: [
                        {
                            error: {
                                string: "TETHER_FROZEN_SENDER"
                            },
                            expansion: {
                                string: "The sender is currently frozen"
                            },
                            languages: [
                                "en"
                            ]
                        },
                        {
                            error: {
                                string: "TETHER_FROZEN_RECEIVER"
                            },
                            expansion: {
                                string: "The receiver is currently frozen"
                            },
                            languages: [
                                "en"
                            ]
                        },
                        {
                            error: {
                                string: "TETHER_ASSETS_NOT_FROZEN"
                            },
                            expansion: {
                                string: "Only frozen assets can be transferred with this entrypoint"
                            },
                            languages: [
                                "en"
                            ]
                        },
                        {
                            error: {
                                string: "TETHER_ASSETS_FROZEN"
                            },
                            expansion: {
                                string: "Only unfrozen assets can be burned"
                            },
                            languages: [
                                "en"
                            ]
                        },
                        {
                            error: {
                                string: "ADMIN_FA2_NOT_ADMIN"
                            },
                            expansion: {
                                string: "Only admin can call this entrypoint"
                            },
                            languages: [
                                "en"
                            ]
                        },
                        {
                            error: {
                                string: "ADMIN_FA2_NOT_PROPOSED_ADMIN"
                            },
                            expansion: {
                                string: "Only proposed admin can set themselves as admin"
                            },
                            languages: [
                                "en"
                            ]
                        }
                    ]
                    }),
                    'ascii',
                ).toString('hex'),
            })

            const fakeUSDtTokenMetadata = MichelsonMap.fromLiteral({
                0: {
                    token_id: '0',
                    token_info: MichelsonMap.fromLiteral({
                        name: Buffer.from('Tether USD').toString('hex'),
                        symbol: Buffer.from('USDt').toString('hex'),
                        decimals: Buffer.from('6').toString('hex'),
                        thumbnailUri: Buffer.from('ipfs://QmRymVGWEudMfLrbjaEiXxngCRTDgWCsscjQMwizy4ZJjX').toString('hex'),
                        isTransferable: '74727565',
                        isBooleanAmount: Buffer.from(new Uint8Array([0])).toString('hex'),
                        shouldPreferSymbol: '74727565'
                    }),
                },
            })
        
            mavenFa2TokenStorage.metadata = fakeUSDtMetadata;
            mavenFa2TokenStorage.token_metadata = fakeUSDtTokenMetadata;
            mavenFa2Token = await GeneralContract.originate(utils.tezos, "mavenFa2Token", mavenFa2TokenStorage);
            await saveContractAddress('fakeUSDtTokenAddress', mavenFa2Token.contract.address)

            // Deploy a fakeWBTC Token
            const fakeWBTCMetadata = MichelsonMap.fromLiteral({
                '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
                data: Buffer.from(
                    JSON.stringify({
                    name: 'Wrapped Bitcoin',
                    description: 'WBTC delivers the power of Bitcoin as a token on the Mavryk blockchain.',
                    version: '1.0.0',
                    license: {
                        name: 'MIT',
                        details: 'MIT License'
                    }, 
                    authors: [
                        'info@mavryk.io'
                    ],
                    homepage: 'https://mavrykdynamics.com',
                    source: {
                        tools: [
                            "LIGO 0.60.0"
                        ],
                        location: "https://github.com/mavenfinance/maven-finance"
                    },
                    interfaces: [
                        'TZIP-012', 
                        'TZIP-016', 
                        'TZIP-021'
                    ],
                    errors: []
                    }),
                    'ascii',
                ).toString('hex'),
            })

            const fakeWBTCTokenMetadata = MichelsonMap.fromLiteral({
                0: {
                    token_id: '0',
                    token_info: MichelsonMap.fromLiteral({
                        name: Buffer.from('Wrapped Bitcoin').toString('hex'),
                        symbol: Buffer.from('WBTC').toString('hex'),
                        decimals: Buffer.from('8').toString('hex'),
                        thumbnailUri: Buffer.from('ipfs://QmRymVGWEudMfLrbjaEiXxngCRTDgWCsscjQMwizy4ZJjX').toString('hex'),
                        isTransferable: '74727565',
                        isBooleanAmount: Buffer.from(new Uint8Array([0])).toString('hex'),
                        shouldPreferSymbol: '74727565'
                    }),
                },
            })
        
            mavenFa2TokenStorage.metadata = fakeWBTCMetadata;
            mavenFa2TokenStorage.token_metadata = fakeWBTCTokenMetadata;
            mavenFa2Token = await GeneralContract.originate(utils.tezos, "mavenFa2Token", mavenFa2TokenStorage);
            await saveContractAddress('fakeWBTCTokenAddress', mavenFa2Token.contract.address)

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`maven token contracts deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})