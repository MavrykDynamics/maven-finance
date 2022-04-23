import { MichelsonMap } from '@taquito/michelson-encoder'

import { BigNumber } from 'bignumber.js'
import { Buffer } from 'buffer'
import { array } from 'yargs'

const { bob, alice, eve, mallory, oscar } = require('../scripts/sandbox/accounts')

import { MVK } from '../test/helpers/Utils'

import { mvkStorageType } from '../test/types/mvkTokenStorageType'

export const mvkTokenDecimals = 9

const totalSupply = MVK(100000)
const maximumSupply = MVK(10**9)
const initialSupply = new BigNumber(totalSupply) // 1,000 MVK Tokens in mu (10^6)
const singleUserSupply = new BigNumber(totalSupply / 5)

const metadata = MichelsonMap.fromLiteral({
  '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
  data: Buffer.from(
    JSON.stringify({
      name: 'MAVRYK',
      description: 'MAVRYK Token',
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
          symbol: Buffer.from('MVK').toString('hex'),
          name: Buffer.from('MAVRYK').toString('hex'),
          decimals: Buffer.from(mvkTokenDecimals.toString()).toString('hex'),
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
  [bob.pkh]: singleUserSupply,
  [alice.pkh]: singleUserSupply,
  [eve.pkh]: singleUserSupply,
  [mallory.pkh]: singleUserSupply,
  [oscar.pkh]: singleUserSupply
})

const token_metadata = MichelsonMap.fromLiteral({
  0: {
    token_id: '0',
    token_info: MichelsonMap.fromLiteral({
      symbol: Buffer.from('MVK').toString('hex'),
      name: Buffer.from('MAVRYK').toString('hex'),
      decimals: Buffer.from(mvkTokenDecimals.toString()).toString('hex'),
      icon: Buffer.from('https://mavryk.finance/logo192.png').toString('hex'),
      shouldPreferSymbol: Buffer.from(new Uint8Array([1])).toString('hex'),
      thumbnailUri: Buffer.from('https://mavryk.finance/logo192.png').toString('hex'),
    }),
  },
})

// Calculate one year from now
const currentTimestamp        = new Date();
currentTimestamp.setDate(currentTimestamp.getDate() + 365);
const nextInflationTimestamp  = Math.round(currentTimestamp.getTime() / 1000);

export const mvkStorage: mvkStorageType = {
  admin: bob.pkh,
  
  generalContracts: MichelsonMap.fromLiteral({}),
  whitelistContracts: MichelsonMap.fromLiteral({}),

  metadata: metadata,
  token_metadata: token_metadata,

  totalSupply: initialSupply,
  maximumSupply: new BigNumber(maximumSupply),
  inflationRate: new BigNumber(500),
  nextInflationTimestamp: new BigNumber(nextInflationTimestamp),

  ledger: ledger,
  operators: MichelsonMap.fromLiteral({}),
}
