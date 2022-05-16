import * as MVKTokenRaw from './contracts/json/mvkToken.json';
import { ContractAbstraction } from '@taquito/taquito';
import { ContractProvider } from '@taquito/taquito/dist/types/contract/interface';
import { Wallet } from '@taquito/taquito/dist/types/wallet';
import { ContractMethodObject } from '@taquito/taquito/dist/types/contract/contract-methods/contract-method-object-param';
import { OnChainView } from '@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view';
import { ContractView } from '@taquito/taquito/dist/types/contract/contract';
import { MichelsonMap, MichelsonMapKey } from '@taquito/michelson-encoder';
import BigNumber from 'bignumber.js';
import { accountPerNetwork } from './accounts';
import { networkConfig, NetworkName } from './scripts/env';

export const MVKTokenCode = MVKTokenRaw.michelson;

export type MVKTokenStorage = {
  admin: string;

  generalContracts: MichelsonMap<MichelsonMapKey, unknown>;
  whitelistContracts: MichelsonMap<MichelsonMapKey, unknown>;

  metadata: MichelsonMap<MichelsonMapKey, unknown>;
  token_metadata: MichelsonMap<MichelsonMapKey, unknown>;

  totalSupply: BigNumber;

  ledger: MichelsonMap<MichelsonMapKey, unknown>;
  operators: MichelsonMap<MichelsonMapKey, unknown>;
};

// eslint-disable-next-line @typescript-eslint/ban-types
type MVKTokenContractMethods<T extends ContractProvider | Wallet> = {};

type MVKTokenContractMethodObject<T extends ContractProvider | Wallet> = Record<
  string,
  (...args: any[]) => ContractMethodObject<T>
>;

type MVKTokenViews = Record<string, (...args: any[]) => ContractView>;

type MVKTokenOnChainViews = Record<string, (args?: any) => OnChainView>;

export type MVKTokenContractAbstraction<
  T extends ContractProvider | Wallet = any
> = ContractAbstraction<
  T,
  MVKTokenContractMethods<T>,
  MVKTokenContractMethodObject<T>,
  MVKTokenViews,
  MVKTokenOnChainViews,
  MVKTokenStorage
>;

const mvkTokenDecimals = 9;
const totalSupply = 100000 * 10 ** mvkTokenDecimals;
const initialSupply = new BigNumber(totalSupply); // 1,000 MVK Tokens in mu (10^6)
const singleUserSupply = new BigNumber(totalSupply / 4);

const metadata = MichelsonMap.fromLiteral({
  '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
  data: Buffer.from(
    JSON.stringify({
      version: 'v1.0.0',
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
          icon: Buffer.from('https://mavryk.finance/logo192.png').toString(
            'hex'
          ),
          shouldPreferSymbol: true,
          thumbnailUri: 'https://mavryk.finance/logo192.png',
        },
      ],
    }),
    'ascii'
  ).toString('hex'),
});

const token_metadata = MichelsonMap.fromLiteral({
  0: {
    token_id: '0',
    token_info: MichelsonMap.fromLiteral({
      symbol: Buffer.from('MVK').toString('hex'),
      name: Buffer.from('MAVRYK').toString('hex'),
      decimals: Buffer.from(mvkTokenDecimals.toString()).toString('hex'),
      icon: Buffer.from('https://mavryk.finance/logo192.png').toString('hex'),
      shouldPreferSymbol: Buffer.from(new Uint8Array([1])).toString('hex'),
      thumbnailUri: Buffer.from('https://mavryk.finance/logo192.png').toString(
        'hex'
      ),
    }),
  },
});

export const mvkTokenStorageForNetwork = (
  networkName: NetworkName = 'development'
): MVKTokenStorage => {
  return {
    admin: networkConfig.networks[networkName].pkh,

    generalContracts: MichelsonMap.fromLiteral({}),
    whitelistContracts: MichelsonMap.fromLiteral({}),

    metadata: metadata,
    token_metadata: token_metadata,

    totalSupply: initialSupply,

    ledger: MichelsonMap.fromLiteral({
      [networkConfig.networks[networkName].pkh]: singleUserSupply,
      [accountPerNetwork[networkName].alice.pkh]: singleUserSupply,
      [accountPerNetwork[networkName].bob.pkh]: singleUserSupply,
      [accountPerNetwork[networkName].eve.pkh]: singleUserSupply,
      [accountPerNetwork[networkName].mallory.pkh]: singleUserSupply,
    }),
    operators: MichelsonMap.fromLiteral({}),
  };
};
