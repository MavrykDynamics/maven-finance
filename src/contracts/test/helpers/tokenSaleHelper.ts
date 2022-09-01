import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { tokenSaleStorageType } from "../types/tokenSaleStorageType";

export class TokenSale {
    contract: Contract;
    storage: tokenSaleStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      tokenSaleAddress: string,
      tezos: TezosToolkit
    ): Promise<TokenSale> {
      return new TokenSale(
        await tezos.contract.at(tokenSaleAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: tokenSaleStorageType
    ): Promise<TokenSale> {      

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/tokenSale.json`).toString()
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
  
      return new TokenSale(
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
  