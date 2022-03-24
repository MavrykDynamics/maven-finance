import { MichelsonMap } from '@taquito/michelson-encoder'

import { BigNumber } from 'bignumber.js'
import { Buffer } from 'buffer'
import { array } from 'yargs'

const { alice, bob, eve, mallory } = require('../scripts/sandbox/accounts')

import { usdmTokenStorageType } from '../test/types/usdm/usdmTokenStorageType'

export const usdmTokenDecimals = 6

const totalSupply      = 1000000000
const initialSupply    = new BigNumber(totalSupply) // 1,000 MVK Tokens in mu (10^6)
const singleUserSupply = new BigNumber(totalSupply / 4)

const metadata = MichelsonMap.fromLiteral({
  '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
  data: Buffer.from(
    JSON.stringify({
      version: 'v1.0.0',
      description: 'USDM Algorithmic Stablecoin',
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
          symbol: Buffer.from('USDM').toString('hex'),
          name: Buffer.from('USDM').toString('hex'),
          decimals: Buffer.from(usdmTokenDecimals.toString()).toString('hex'),
          icon: Buffer.from('https://mavryk.finance/logo192.png').toString('hex'),
          shouldPreferSymbol: true,
          thumbnailUri: 'https://mavryk.finance/logo192.png',
        },
      ],
    }),
    'ascii',
  ).toString('hex'),
})

const ledger = MichelsonMap.fromLiteral({
  [alice.pkh]: singleUserSupply,
  [bob.pkh]: singleUserSupply,
  [eve.pkh]: singleUserSupply,
  [mallory.pkh]: singleUserSupply,
})

const token_metadata = MichelsonMap.fromLiteral({
  0: {
    token_id: '0',
    token_info: MichelsonMap.fromLiteral({
      symbol: Buffer.from('USDM').toString('hex'),
      name: Buffer.from('USDM').toString('hex'),
      decimals: Buffer.from(usdmTokenDecimals.toString()).toString('hex'),
      icon: Buffer.from('https://mavryk.finance/logo192.png').toString('hex'),
      shouldPreferSymbol: Buffer.from(new Uint8Array([1])).toString('hex'),
      thumbnailUri: Buffer.from('https://mavryk.finance/logo192.png').toString('hex'),
    }),
  },
})

export const usdmTokenStorage: usdmTokenStorageType = {
  admin: alice.pkh,

  metadata: metadata,
  token_metadata: token_metadata,

  totalSupply: initialSupply,

  ledger: ledger,
  operators: MichelsonMap.fromLiteral({}),
}
