import {
  ContractAbstraction,
  ContractMethod,
  ContractMethodObject,
  ContractProvider,
  ContractView,
  OriginationOperation,
  TezosToolkit,
  Wallet
} from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { vestingStorageType } from "../types/vestingStorageType";

import vestingLambdaIndex
    from '../../../contracts/contracts/partials/contractLambdas/vesting/vestingLambdaIndex.json';
import vestingLambdas from "../../build/lambdas/vestingLambdas.json";
import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";

type VestingContractMethods<T extends ContractProvider | Wallet> = {
  setLambda: (number, string) => ContractMethod<T>;
  updateWhitelistContracts: (
    whitelistContractName:string,
    whitelistContractAddress:string
  ) => ContractMethod<T>;
  updateGeneralContracts: (
      generalContractName:string,
      generalContractAddress:string
  ) => ContractMethod<T>;
};

type VestingContractMethodObject<T extends ContractProvider | Wallet> =
  Record<string, (...args: any[]) => ContractMethodObject<T>>;

type VestingViews = Record<string, (...args: any[]) => ContractView>;

type VestingOnChainViews = {
  decimals: () => OnChainView;
};

type VestingContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
  VestingContractMethods<T>,
  VestingContractMethodObject<T>,
  VestingViews,
  VestingOnChainViews,
  vestingStorageType>;


export const setVestingLambdas = async (tezosToolkit: TezosToolkit, contract: VestingContractAbstraction) => {
  const batch = tezosToolkit.wallet
      .batch();

  vestingLambdaIndex.forEach(({index, name}: { index: number, name: string }) => {
      batch.withContractCall(contract.methods.setLambda(name, vestingLambdas[index]))

  });

  const setupVestingLambdasOperation = await batch.send()
  await confirmOperation(tezosToolkit, setupVestingLambdasOperation.opHash);
};


export class Vesting {
    contract: VestingContractAbstraction;
    storage: vestingStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: VestingContractAbstraction, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      vestingContractAddress: string,
      tezos: TezosToolkit
    ): Promise<Vesting> {
      return new Vesting(
        await tezos.contract.at(vestingContractAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: vestingStorageType
    ): Promise<Vesting> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/vesting.json`).toString()
      );
      const operation: OriginationOperation = await tezos.contract
        .originate({
          code: artifacts.michelson,
          storage: storage,
        })
        .catch((e) => {
          console.error(e);
          console.log('error no hash')
          return null;
        });
  
      await confirmOperation(tezos, operation.hash);
  
      return new Vesting(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
