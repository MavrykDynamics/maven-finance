import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { farmFactoryStorageType } from "../types/farmFactoryStorageType";

export class FarmFactory {
    contract: Contract;
    storage: farmFactoryStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      farmFactoryAddress: string,
      tezos: TezosToolkit
    ): Promise<FarmFactory> {
      return new FarmFactory(
        await tezos.contract.at(farmFactoryAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: farmFactoryStorageType
    ): Promise<FarmFactory> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/farmFactory.json`).toString()
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
  
      return new FarmFactory(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }
}
  