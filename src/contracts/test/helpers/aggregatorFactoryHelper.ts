import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { aggregatorFactoryStorageType } from "../types/aggregatorFactoryStorageType";

export class AggregatorFactory {
    contract: Contract;
    storage: aggregatorFactoryStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      aggregatorFactoryContractAddress: string,
      tezos: TezosToolkit
    ): Promise<AggregatorFactory> {
      return new AggregatorFactory(
        await tezos.contract.at(aggregatorFactoryContractAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: aggregatorFactoryStorageType
    ): Promise<AggregatorFactory> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/aggregatorFactory.json`).toString()
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
  
      return new AggregatorFactory(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  