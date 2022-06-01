import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { aggregatorStorageType } from "../types/aggregatorStorageType";

import aggregatorLambdaIndex  from '../../../contracts/contracts/partials/contractLambdas/aggregator/aggregatorLambdaIndex.json';

export const aggregatorLambdaIndexOf = (name: string) => {
    const index = aggregatorLambdaIndex.find(x => x.name === name)?.index

    if (index === undefined) {
        throw new Error(`aggregatorLambdaIndexOf: ${name} not found`)
    }

    return index;
}


export class Aggregator {
    contract: Contract;
    storage: aggregatorStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      aggregatorContractAddress: string,
      tezos: TezosToolkit
    ): Promise<Aggregator> {
      return new Aggregator(
        await tezos.contract.at(aggregatorContractAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: aggregatorStorageType
    ): Promise<Aggregator> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/aggregator.json`).toString()
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
  
      return new Aggregator(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
