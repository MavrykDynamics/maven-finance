import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { BigNumber } from "bignumber.js"
import { Buffer } from "buffer"
import { zeroAddress } from "../test/helpers/Utils"
import { bob, alice, eve, mallory } from '../scripts/sandbox/accounts'
import { mavenFa2TokenStorageType } from "./storageTypes/mavenFa2TokenStorageType"

const totalSupply      = 20000000000;
const initialSupply    = new BigNumber(totalSupply); // 20,000 MOCK FA2 Tokens in mu (10^6)
const singleUserSupply = new BigNumber(totalSupply / 4);

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

const ledger = MichelsonMap.fromLiteral({
    [bob.pkh]: singleUserSupply,
    [alice.pkh]: singleUserSupply,
    [eve.pkh]: singleUserSupply,
    [mallory.pkh]: singleUserSupply
})

const token_metadata = MichelsonMap.fromLiteral({
    0: {
        token_id: '0',
        token_info: MichelsonMap.fromLiteral({
            symbol: Buffer.from('FA2').toString('hex'),
            name: Buffer.from('MAVENFA2').toString('hex'),
            decimals: Buffer.from('6').toString('hex'),
            icon: Buffer.from('https://mavenfinance.io/logo192.png').toString('hex'),
            shouldPreferSymbol: Buffer.from(new Uint8Array([1])).toString('hex'),
            thumbnailUri: Buffer.from('https://mavenfinance.io/logo192.png').toString('hex')
        }),
    },
})

export const mavenFa2TokenStorage: mavenFa2TokenStorageType = {
    
    admin: bob.pkh,
    metadata: metadata,
    governanceAddress: zeroAddress,

    whitelistContracts:  MichelsonMap.fromLiteral({}),

    token_metadata: token_metadata,
    totalSupply: initialSupply,
    ledger: ledger,
    operators:  MichelsonMap.fromLiteral({})

};
