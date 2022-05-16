import { ContractAbstraction } from '@taquito/taquito';
import { ContractProvider } from '@taquito/taquito/dist/types/contract/interface';
import { Wallet } from '@taquito/taquito/dist/types/wallet';
import { ContractMethodObject } from '@taquito/taquito/dist/types/contract/contract-methods/contract-method-object-param';
import { OnChainView } from '@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view';
import { ContractView } from '@taquito/taquito/dist/types/contract/contract';

export type ClientStorage = {
  address: string;
  lastprices: {
    round: number;
    price: number;
    percentOracleResponse: number;
    decimals: number;
  };
};

type ClientContractMethods<T extends ContractProvider | Wallet> = {};

type ClientContractMethodObject<T extends ContractProvider | Wallet> = Record<
  string,
  (...args: any[]) => ContractMethodObject<T>
>;

type ClientViews = Record<string, (...args: any[]) => ContractView>;

type ClientOnChainViews = Record<string, (args?: any) => OnChainView>;

export type ClientContractAbstraction<
  T extends ContractProvider | Wallet = any
> = ContractAbstraction<
  T,
  ClientContractMethods<T>,
  ClientContractMethodObject<T>,
  ClientViews,
  ClientOnChainViews,
  ClientStorage
>;
