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
import { governanceSatelliteStorageType } from "../types/governanceSatelliteStorageType";

import governanceSatelliteLambdaIndex
    from '../../../contracts/contracts/partials/contractLambdas/governanceSatellite/governanceSatelliteLambdaIndex.json';
import governanceSatelliteLambdas from "../../build/lambdas/governanceSatelliteLambdas.json";
import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";

type GovernanceSatelliteContractMethods<T extends ContractProvider | Wallet> = {
  setLambda: (number, string) => ContractMethod<T>;
};

type GovernanceSatelliteContractMethodObject<T extends ContractProvider | Wallet> =
  Record<string, (...args: any[]) => ContractMethodObject<T>>;

type GovernanceSatelliteViews = Record<string, (...args: any[]) => ContractView>;

type GovernanceSatelliteOnChainViews = {
  decimals: () => OnChainView;
};

type GovernanceSatelliteContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
  GovernanceSatelliteContractMethods<T>,
  GovernanceSatelliteContractMethodObject<T>,
  GovernanceSatelliteViews,
  GovernanceSatelliteOnChainViews,
  governanceSatelliteStorageType>;


export const setGovernanceSatelliteLambdas = async (tezosToolkit: TezosToolkit, contract: GovernanceSatelliteContractAbstraction) => {
  const batch = tezosToolkit.wallet
      .batch();

  governanceSatelliteLambdaIndex.forEach(({index, name}: { index: number, name: string }) => {
      batch.withContractCall(contract.methods.setLambda(name, governanceSatelliteLambdas[index]))

  });

  const setupGovernanceSatelliteLambdasOperation = await batch.send()
  await setupGovernanceSatelliteLambdasOperation.confirmation()
};


export class GovernanceSatellite {
    contract: GovernanceSatelliteContractAbstraction;
    storage: governanceSatelliteStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: GovernanceSatelliteContractAbstraction, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      governanceSatelliteContractAddress: string,
      tezos: TezosToolkit
    ): Promise<GovernanceSatellite> {
      return new GovernanceSatellite(
        await tezos.contract.at(governanceSatelliteContractAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: governanceSatelliteStorageType
    ): Promise<GovernanceSatellite> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/governanceSatellite.json`).toString()
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
  
      return new GovernanceSatellite(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  