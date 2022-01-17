import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { councilStorageType } from "../types/councilStorageType";

export class Council {
    contract: Contract;
    storage: councilStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      councilContractAddress: string,
      tezos: TezosToolkit
    ): Promise<Council> {
      return new Council(
        await tezos.contract.at(councilContractAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: councilStorageType
    ): Promise<Council> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/council.json`).toString()
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
  
      return new Council(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  