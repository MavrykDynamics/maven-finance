import { MichelsonMap } from '@taquito/michelson-encoder'

import { BigNumber } from 'bignumber.js'
import { Buffer } from 'buffer'
import { array } from 'yargs'

const { alice, bob, eve, mallory } = require('../scripts/sandbox/accounts')


import { lpTokenUsdmXtzStorageType } from '../test/types/lpTokenUsdmXtzStorageType'

export const lpTokenUsdmXtzDecimals = 6

const totalSupply      = 0
const initialSupply    = new BigNumber(totalSupply)       // 0 LP Tokens
const singleUserSupply = new BigNumber(totalSupply / 4)   // 0 LP Tokens

const metadata = MichelsonMap.fromLiteral({
  '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
  data: Buffer.from(
    JSON.stringify({
      version: 'v1.0.0',
      description: 'LP Token USDM-XTZ',
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
          symbol: Buffer.from('USDM-XTZ').toString('hex'),
          name: Buffer.from('LP Token USDM-XTZ').toString('hex'),
          decimals: Buffer.from(lpTokenUsdmXtzDecimals.toString()).toString('hex'),
          icon: Buffer.from('https://mavryk.finance/logo192.png').toString('hex'),
          shouldPreferSymbol: true,
          thumbnailUri: 'https://mavryk.finance/logo192.png',
        },
      ],
    }),
    'ascii',
  ).toString('hex'),
})

const ledger = MichelsonMap.fromLiteral({})

const token_metadata = MichelsonMap.fromLiteral({
  0: {
    token_id: '0',
    token_info: MichelsonMap.fromLiteral({
      symbol: Buffer.from('USDM-XTZ').toString('hex'),
      name: Buffer.from('LP Token USDM-XTZ').toString('hex'),
      decimals: Buffer.from(lpTokenUsdmXtzDecimals.toString()).toString('hex'),
      icon: Buffer.from('https://mavryk.finance/logo192.png').toString('hex'),
      shouldPreferSymbol: Buffer.from(new Uint8Array([1])).toString('hex'),
      thumbnailUri: Buffer.from('https://mavryk.finance/logo192.png').toString('hex'),
    }),
  },
})

export const lpTokenUsdmXtzStorage: lpTokenUsdmXtzStorageType = {
  admin           : alice.pkh,

  metadata        : metadata,
  token_metadata  : token_metadata,

  totalSupply     : initialSupply,

  ledger          : ledger,
  operators       : MichelsonMap.fromLiteral({}),
}
