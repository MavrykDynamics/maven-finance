import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";
import { Buffer } from "buffer";
import { array } from "yargs";

import { bob, alice, eve, mallory } from '../scripts/sandbox/accounts'

import { zeroAddress } from "../test/helpers/Utils";

import { lpStorageType } from "../test/types/testLPTokenType";

const totalSupply   = 100;
const initialSupply = new BigNumber(totalSupply); // 1,000 MVK Tokens in mu (10^6)
const singleUserSupply = new BigNumber(totalSupply / 4);

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
          version: 'v1.0.0',
          description: 'MAVRYK Test LP Token',
          authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
          source: {
            tools: ['Ligo', 'Flextesa'],
            location: 'https://ligolang.org/',
          },
          interfaces: ['TZIP-7', 'TZIP-16'],
          errors: [],
          views: [],
          assets: [
            {
              symbol: Buffer.from('MLP').toString('hex'),
              name: Buffer.from('MAVRYK-TEST LP').toString('hex'),
              decimals: Buffer.from('15').toString('hex'),
              icon: Buffer.from('https://mavryk.finance/logo192.png').toString('hex')
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
        symbol: Buffer.from('MLP').toString('hex'),
        name: Buffer.from('MAVRYK-TEST LP').toString('hex'),
        decimals: Buffer.from('15').toString('hex'),
        icon: Buffer.from('https://mavryk.finance/logo192.png').toString('hex')
      }),
    },
  })

export const lpStorage: lpStorageType = {
  metadata: metadata,
  token_metadata: token_metadata,
  totalSupply: initialSupply,
  ledger: ledger
};