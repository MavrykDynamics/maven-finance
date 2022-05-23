import { MichelsonMap } from '@taquito/michelson-encoder';
import BigNumber from 'bignumber.js';
import { ContractAbstraction } from '@taquito/taquito';
import { ContractProvider } from '@taquito/taquito/dist/types/contract/interface';
import { Wallet } from '@taquito/taquito/dist/types/wallet';
import { ContractMethod } from '@taquito/taquito/dist/types/contract/contract-methods/contract-method-flat-param';
import { ContractMethodObject } from '@taquito/taquito/dist/types/contract/contract-methods/contract-method-object-param';
import { OnChainView } from '@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view';
import { ContractView } from '@taquito/taquito/dist/types/contract/contract';

export type aggregatorConfigType = {
  decimals: BigNumber;
  percentOracleThreshold: BigNumber;
  rewardAmountXTZ: BigNumber;
  rewardAmountMVK: BigNumber;
  deviationRewardAmountXTZ: BigNumber;
  minimalTezosAmountDeviationTrigger: BigNumber;
  perthousandDeviationTrigger: BigNumber;
  maintainer: string;
  numberBlocksDelay: BigNumber;
};
export type AggregatorStorage = {
  oracleAddresses: MichelsonMap<string, string>;
  oracleRewardsMVK: MichelsonMap<string, BigNumber>;
  oracleRewardsXTZ: MichelsonMap<string, BigNumber>;
  mvkTokenAddress: string;
  round: BigNumber;
  roundStart: string;
  deviationTriggerInfos: {
    oracleAddress: string;
    amount: BigNumber;
    roundPrice: BigNumber;
  };
  lastCompletedRoundPrice: {
    round: BigNumber;
    price: BigNumber;
    percentOracleResponse: BigNumber;
    priceDateTime: string;
  };
  observationCommits: MichelsonMap<string, string>;
  observationReveals: MichelsonMap<string, BigNumber>;
  owner: string;
  config: aggregatorConfigType;
  switchBlock: BigNumber;
};

// export const aggregatorStorage: AggregatorStorage = {
//   rewardAmountXTZ: new BigNumber(10000),
//   rewardAmountMVK: new BigNumber(1),
//   oracleRewardsMVK: MichelsonMap.fromLiteral({}) as MichelsonMap<
//     string,
//     BigNumber
//   >,
//   oracleRewardsXTZ: MichelsonMap.fromLiteral({}) as MichelsonMap<
//     string,
//     BigNumber
//   >,
//   oracleAddresses: MichelsonMap.fromLiteral({
//     [accounts.bob.pkh]: true,
//     [accounts.eve.pkh]: true,
//     [accounts.mallory.pkh]: true,
//     [accounts.oscar.pkh]: true,
//   }),
//   decimals: new BigNumber(8),
//   lastCompletedRoundPrice: {
//     round: new BigNumber(0),
//     price: new BigNumber(0),
//     percentOracleResponse: new BigNumber(0),
//   },
//   round: new BigNumber(8),
//   percentOracleThreshold: new BigNumber(50),
//   owner: accounts.alice.pkh,
//   observations: MichelsonMap.fromLiteral({}) as MichelsonMap<string, BigNumber>,
// };

type AggregatorContractMethods<T extends ContractProvider | Wallet> = {
  requestRateUpdate: () => ContractMethod<T>;
  requestRateUpdateDeviation: (
    round: BigNumber,
    sign: string
  ) => ContractMethod<T>;
  default: () => ContractMethod<T>;
  addOracle: (oracleAddress: string) => ContractMethod<T>;
  removeOracle: (oracleAddress: string) => ContractMethod<T>;
  setObservationCommit: (round: BigNumber, sign: string) => ContractMethod<T>;
  setObservationReveal: (
    round: BigNumber,
    priceSalted_price: BigNumber,
    priceSalted_salt: string,
    pkh: string
  ) => ContractMethod<T>;
  updateOwner: (owner: string) => ContractMethod<T>;
  updateAggregatorConfig: (
    decimals: BigNumber,
    deviationRewardAmountXTZ: BigNumber,
    maintainer: string,
    minimalTezosAmountDeviationTrigger: BigNumber,
    numberBlocksDelay: BigNumber,
    perthousandDeviationTrigger: BigNumber,
    percentOracleThreshold: BigNumber,
    rewardAmountXTZ: BigNumber,
    rewardAmountMVK: BigNumber
  ) => ContractMethod<T>;
  withdrawRewardXTZ: (address: string) => ContractMethod<T>;
  withdrawRewardMVK: (address: string) => ContractMethod<T>;
};

type AggregatorContractMethodObject<T extends ContractProvider | Wallet> =
  Record<string, (...args: any[]) => ContractMethodObject<T>>;

type AggregatorViews = Record<string, (...args: any[]) => ContractView>;

type AggregatorOnChainViews = {
  decimals: () => OnChainView;
};

export type AggregatorContractAbstraction<
  T extends ContractProvider | Wallet = any
> = ContractAbstraction<
  T,
  AggregatorContractMethods<T>,
  AggregatorContractMethodObject<T>,
  AggregatorViews,
  AggregatorOnChainViews,
  AggregatorStorage
>;
