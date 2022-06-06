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
import { doormanStorageType } from "../types/doormanStorageType";

import doormanLambdaIndex
    from '../../../contracts/contracts/partials/contractLambdas/doorman/doormanLambdaIndex.json';
import doormanLambdas from "../../build/lambdas/doormanLambdas.json";
import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";

type DoormanContractMethods<T extends ContractProvider | Wallet> = {
  setLambda: (number, string) => ContractMethod<T>;
  updateWhitelistContracts: (
    whitelistContractName     : string,
    whitelistContractAddress  : string
  ) => ContractMethod<T>;
  updateGeneralContracts: (
    generalContractName       : string,
    generalContractAddress    : string
  ) => ContractMethod<T>;
};

type DoormanContractMethodObject<T extends ContractProvider | Wallet> =
  Record<string, (...args: any[]) => ContractMethodObject<T>>;

type DoormanViews = Record<string, (...args: any[]) => ContractView>;

type DoormanOnChainViews = {
  decimals: () => OnChainView;
};

type DoormanContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
  DoormanContractMethods<T>,
  DoormanContractMethodObject<T>,
  DoormanViews,
  DoormanOnChainViews,
  doormanStorageType>;


export const setDoormanLambdas = async (tezosToolkit: TezosToolkit, contract: DoormanContractAbstraction) => {
  const batch = tezosToolkit.wallet
      .batch();

  doormanLambdaIndex.forEach(({index, name}: { index: number, name: string }) => {
      batch.withContractCall(contract.methods.setLambda(name, doormanLambdas[index]))

  });

  const setupDoormanLambdasOperation = await batch.send()
  await setupDoormanLambdasOperation.confirmation()
};

export const doormanLambdaIndexOf = (name: string) => {
    const index = doormanLambdaIndex.find(x => x.name === name)?.index

    if (index === undefined) {
        throw new Error(`doormanLambdaIndexOf: ${name} not found`)
    }

    return index;
}

export class Doorman {
    contract: DoormanContractAbstraction;
    storage: doormanStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: DoormanContractAbstraction, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      doormanAddress: string,
      tezos: TezosToolkit
    ): Promise<Doorman> {
      return new Doorman(
        await tezos.contract.at(doormanAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: doormanStorageType
    ): Promise<Doorman> {      

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/doorman.json`).toString()
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
  
      return new Doorman(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  