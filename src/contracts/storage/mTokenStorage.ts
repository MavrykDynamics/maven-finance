import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { BigNumber } from "bignumber.js"
import { Buffer } from "buffer"
import { zeroAddress } from "../test/helpers/Utils"
import { bob } from '../scripts/sandbox/accounts'
import { mTokenStorageType } from "./storageTypes/mTokenStorageType"

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        version: 'v1.0.0',
        description: 'MAVEN FA2',
        authors: ['MAVEN Dev Team <info@mavryk.io>'],
        source: {
            tools: ['Ligo', 'Flexmasa'],
            location: 'https://ligolang.org/',
        },
        interfaces: ['TZIP-7', 'TZIP-12', 'TZIP-16', 'TZIP-21'],
        errors: [],
        views: [],
        assets: [
            {
            symbol: Buffer.from('FA2').toString('hex'),
            name: Buffer.from('MAVENFA2').toString('hex'),
            decimals: Buffer.from('6').toString('hex'),
            icon: Buffer.from('https://mavenfinance.io/logo192.png').toString('hex'),
            shouldPreferSymbol: true,
            thumbnailUri: 'https://mavenfinance.io/logo192.png'
            }
        ]
        }),
        'ascii',
    ).toString('hex'),
  })

const ledger = MichelsonMap.fromLiteral({})

const token_metadata = MichelsonMap.fromLiteral({
    0: {
        token_id: '0',
        token_info: MichelsonMap.fromLiteral({
            symbol: Buffer.from('FA2').toString('hex'),
            name: Buffer.from('mToken').toString('hex'),
            decimals: Buffer.from('6').toString('hex'),
            icon: Buffer.from('https://mavenfinance.io/logo192.png').toString('hex'),
            shouldPreferSymbol: Buffer.from(new Uint8Array([1])).toString('hex'),
            thumbnailUri: Buffer.from('https://mavenfinance.io/logo192.png').toString('hex')
        }),
    },
})

export const mTokenStorage: mTokenStorageType = {
    
    admin               : bob.pkh,
    metadata            : metadata,

    loanToken           : "something",
    tokenRewardIndex    : new BigNumber(1),
    rewardIndexLedger   :  MichelsonMap.fromLiteral({}),

    governanceAddress   : zeroAddress,

    whitelistContracts  :  MichelsonMap.fromLiteral({}),

    token_metadata      : token_metadata,
    totalSupply         : new BigNumber(0),
    ledger              : ledger,
    operators           :  MichelsonMap.fromLiteral({})

};
