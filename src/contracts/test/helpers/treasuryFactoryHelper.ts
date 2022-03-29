import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { treasuryFactoryStorageType } from "../types/treasuryFactoryStorageType";

export class TreasuryFactory {
    contract: Contract;
    storage: treasuryFactoryStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      treasuryFactoryAddress: string,
      tezos: TezosToolkit
    ): Promise<TreasuryFactory> {
      return new TreasuryFactory(
        await tezos.contract.at(treasuryFactoryAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: treasuryFactoryStorageType
    ): Promise<TreasuryFactory> {      

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/treasuryFactory.json`).toString()
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
  
      return new TreasuryFactory(
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
  