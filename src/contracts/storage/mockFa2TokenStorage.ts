import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";
import { Buffer } from "buffer";
import { array } from "yargs";

const { bob, alice, eve, mallory } = require('../scripts/sandbox/accounts')

import { zeroAddress } from "../test/helpers/Utils";

import { mockFa2TokenStorageType } from "../test/types/mockFa2TokenStorageType";

const totalSupply   = 2000000000;
const initialSupply = new BigNumber(totalSupply); // 2,000 MOCK FA2 Tokens in mu (10^6)
const singleUserSupply = new BigNumber(totalSupply / 4);

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        version: 'v1.0.0',
        description: 'MOCK FA2',
        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
        source: {
            tools: ['Ligo', 'Flextesa'],
            location: 'https://ligolang.org/',
        },
        interfaces: ['TZIP-7', 'TZIP-12', 'TZIP-16', 'TZIP-21'],
        errors: [],
        views: [],
        assets: [
            {
            symbol: Buffer.from('FA2').toString('hex'),
            name: Buffer.from('MOCKFA2').toString('hex'),
            decimals: Buffer.from('6').toString('hex'),
            icon: Buffer.from('https://mavryk.finance/logo192.png').toString('hex'),
            shouldPreferSymbol: true,
            thumbnailUri: 'https://mavryk.finance/logo192.png'
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
            name: Buffer.from('MOCKFA2').toString('hex'),
            decimals: Buffer.from('6').toString('hex'),
            icon: Buffer.from('https://mavryk.finance/logo192.png').toString('hex'),
            shouldPreferSymbol: Buffer.from(new Uint8Array([1])).toString('hex'),
            thumbnailUri: Buffer.from('https://mavryk.finance/logo192.png').toString('hex')
        }),
    },
})

export const mockFa2TokenStorage: mockFa2TokenStorageType = {
    
    admin: bob.pkh,
    metadata: metadata,
    token_metadata: token_metadata,
    totalSupply: initialSupply,
    ledger: ledger,
    operators:  MichelsonMap.fromLiteral({})

};
