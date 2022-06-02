import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { doormanStorageType } from "../types/doormanStorageType";

import doormanLambdaIndex  from '../../../contracts/contracts/partials/contractLambdas/doorman/doormanLambdaIndex.json';

export const doormanLambdaIndexOf = (name: string) => {
    const index = doormanLambdaIndex.find(x => x.name === name)?.index

    if (index === undefined) {
        throw new Error(`doormanLambdaIndexOf: ${name} not found`)
    }

    return index;
}

export class Doorman {
    contract: Contract;
    storage: doormanStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
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
  
    async setAdmin(newAdminAddress: string): Promise<TransactionOperation> {
        const operation: TransactionOperation = await this.contract.methods
          .setAdmin(newAdminAddress)
          .send();
    
        await confirmOperation(this.tezos, operation.hash);
    
        return operation;
      }

  }
  