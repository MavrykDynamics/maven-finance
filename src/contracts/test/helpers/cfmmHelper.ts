import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { cfmmStorageType } from "../types/cfmmStorageType";

export class Cfmm {
    contract: Contract;
    storage: cfmmStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
        cfmmAddress: string,
      tezos: TezosToolkit
    ): Promise<Cfmm> {
      return new Cfmm(
        await tezos.contract.at(cfmmAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: cfmmStorageType
    ): Promise<Cfmm> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/cfmm.json`).toString()
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
  
      return new Cfmm(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  