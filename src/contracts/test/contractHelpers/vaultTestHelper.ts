import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { vaultStorageType } from "../types/vaultStorageType";

export class Vault {
    contract: Contract;
    storage: vaultStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      vaultAddress: string,
      tezos: TezosToolkit
    ): Promise<Vault> {
      return new Vault(
        await tezos.contract.at(vaultAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: vaultStorageType
    ): Promise<Vault> {      

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/u_vault.json`).toString()
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
  
      return new Vault(
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
  