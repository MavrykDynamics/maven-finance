import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { farmStorageType } from "../types/farmStorageType";

export class Farm {
    contract: Contract;
    storage: farmStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      farmContractAddress: string,
      tezos: TezosToolkit
    ): Promise<Farm> {
      return new Farm(
        await tezos.contract.at(farmContractAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: farmStorageType
    ): Promise<Farm> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/farm.json`).toString()
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
  
      return new Farm(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }
}
  