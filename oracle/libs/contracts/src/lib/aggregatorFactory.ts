import * as AggregatorFactoryRaw from './contracts/json/aggregatorFactory.json';
import { MichelsonMap } from '@taquito/michelson-encoder';
import { ContractAbstraction } from '@taquito/taquito';
import { ContractProvider } from '@taquito/taquito/dist/types/contract/interface';
import { Wallet } from '@taquito/taquito/dist/types/wallet';
import { ContractMethod } from '@taquito/taquito/dist/types/contract/contract-methods/contract-method-flat-param';
import { ContractMethodObject } from '@taquito/taquito/dist/types/contract/contract-methods/contract-method-object-param';
import { OnChainView } from '@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view';
import { ContractView } from '@taquito/taquito/dist/types/contract/contract';
import BigNumber from 'bignumber.js';

export const AggregatorFactoryCode = AggregatorFactoryRaw.michelson;

export type AggregatorFactoryStorage = {
  admin: string;
  mvkTokenAddress: string;
  trackedSatellite: string[];
  trackedAggregators: MichelsonMap<any, string>;
};

type AggregatorFactoryContractMethods<T extends ContractProvider | Wallet> = {
  createAggregator: (
    pair1: string,
    pair2: string,
    oracleAddresses: MichelsonMap<string, boolean>,
    mvkTokenAddress: string,

    // aggregatorConfigType
    decimals: BigNumber,
    maintainer: string,
    minimalTezosAmountDeviationTrigger: BigNumber,
    numberBlocksDelay: BigNumber,
    percentOracleThreshold: BigNumber,
    perthousandDeviationTrigger: BigNumber,
    rewardAmountXTZ: BigNumber,
    rewardAmountMVK: BigNumber,

    owner: string
  ) => ContractMethod<T>;
  addSatellite: (satelliteAddress: string) => ContractMethod<T>;
  banSatellite: (satelliteAddress: string) => ContractMethod<T>;
  updateAggregatorConfig: (
    decimals: BigNumber,
    maintainer: string,
    minimalTezosAmountDeviationTrigger: BigNumber,
    numberBlocksDelay: BigNumber,
    perthousandDeviationTrigger: BigNumber,
    percentOracleThreshold: BigNumber,
    rewardAmountMVK: BigNumber,
    rewardAmountXTZ: BigNumber,
    satelliteAddress: string
  ) => ContractMethod<T>;
  updateAggregatorOwner: (
    ownerAddress: string,
    satelliteAddress: string
  ) => ContractMethod<T>;
};

type AggregatorFactoryContractMethodObject<
  T extends ContractProvider | Wallet
> = Record<string, (...args: any[]) => ContractMethodObject<T>>;

type AggregatorFactoryViews = Record<string, (...args: any[]) => ContractView>;

type AggregatorFactoryOnChainViews = Record<
  string,
  (args?: any) => OnChainView
>;

export type AggregatorFactoryContractAbstraction<
  T extends ContractProvider | Wallet = any
> = ContractAbstraction<
  T,
  AggregatorFactoryContractMethods<T>,
  AggregatorFactoryContractMethodObject<T>,
  AggregatorFactoryViews,
  AggregatorFactoryOnChainViews,
  AggregatorFactoryStorage
>;
