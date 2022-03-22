import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { usdmTokenControllerStorageType } from "../types/usdmTokenControllerStorageType";

export class UsdmTokenController {
    contract: Contract;
    storage: usdmTokenControllerStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      usdmTokenControllerAddress: string,
      tezos: TezosToolkit
    ): Promise<UsdmTokenController> {
      return new UsdmTokenController(
        await tezos.contract.at(usdmTokenControllerAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: usdmTokenControllerStorageType
    ): Promise<UsdmTokenController> {      

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/usdmTokenController.json`).toString()
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
  
      return new UsdmTokenController(
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
  