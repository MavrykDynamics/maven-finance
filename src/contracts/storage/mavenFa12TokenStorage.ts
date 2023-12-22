import { MichelsonMap } from "@taquito/michelson-encoder"
import { BigNumber } from "bignumber.js"
import { Buffer } from "buffer"
import { bob, alice, eve, mallory } from '../scripts/sandbox/accounts'
import { zeroAddress } from "../test/helpers/Utils"
import { mavenFa12TokenStorageType } from "./storageTypes/mavenFa12TokenStorageType"

const totalSupply      = 20000000000;
const initialSupply    = new BigNumber(totalSupply); // 20,000 MOCK FA12 Tokens in mu (10^6)
const singleUserSupply = new BigNumber(totalSupply / 4);

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
            version: 'v1.0.0',
            description: 'MAVEN FA12 TOKEN',
            authors: ['MAVEN Dev Team <contact@mavenfinance.io>'],
            source: {
                tools: ['Ligo', 'Flextesa'],
                location: 'https://ligolang.org/',
            },
            interfaces: ['TZIP-7'],
            errors: [],
            views: [],
            assets: [
                {
                symbol: Buffer.from('FA12').toString('hex'),
                name: Buffer.from('MAVEN FA12 TOKEN').toString('hex'),
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
    [bob.pkh]: {
        balance: singleUserSupply,
        allowances: MichelsonMap.fromLiteral({})
    },
    [alice.pkh]: {
        balance: singleUserSupply,
        allowances: MichelsonMap.fromLiteral({})
    },
    [eve.pkh]: {
        balance: singleUserSupply,
        allowances: MichelsonMap.fromLiteral({})
    },
    [mallory.pkh]: {
        balance: singleUserSupply,
        allowances: MichelsonMap.fromLiteral({})
    }
  })

const token_metadata = MichelsonMap.fromLiteral({
    0: {
        token_id: '0',
        token_info: MichelsonMap.fromLiteral({
            symbol: Buffer.from('FA12').toString('hex'),
            name: Buffer.from('MAVENFA12').toString('hex'),
            decimals: Buffer.from('6').toString('hex'),
            icon: Buffer.from('https://mavenfinance.io/logo192.png').toString('hex'),
            shouldPreferSymbol: Buffer.from(new Uint8Array([1])).toString('hex'),
            thumbnailUri: Buffer.from('https://mavenfinance.io/logo192.png').toString('hex')
        }),
    },
  })

export const mavenFa12TokenStorage: mavenFa12TokenStorageType = {
    admin:                  bob.pkh,
    metadata:               metadata,
    governanceAddress:      zeroAddress,
    
    whitelistContracts:     MichelsonMap.fromLiteral({}),

    token_metadata:         token_metadata,
    totalSupply:            initialSupply,
    ledger:                 ledger,
};
