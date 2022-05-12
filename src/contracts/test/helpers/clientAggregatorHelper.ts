import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { clientAggregatorStorageType } from "../types/clientAggregatorStorageType";

export class ClientAggregator {
    contract: Contract;
    storage: clientAggregatorStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      clientAggregatorAddress: string,
      tezos: TezosToolkit
    ): Promise<ClientAggregator> {
      return new ClientAggregator(
        await tezos.contract.at(clientAggregatorAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: clientAggregatorStorageType
    ): Promise<ClientAggregator> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/clientAggregator.json`).toString()
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
  
      return new ClientAggregator(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  