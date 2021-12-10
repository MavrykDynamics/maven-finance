import {
    OriginationOperation,
    TransactionOperation,
    TezosToolkit,
    Contract,
  } from "@taquito/taquito";
  
  import fs from "fs";
  
  import env from "../../env";
  
  import { confirmOperation } from "../../scripts/confirmation";
  
  import { DoormanStorage } from "../types/doormanType";
  
  export class Doorman {
    contract: Contract;
    storage: DoormanStorage;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      doormanAddress: string,
      tezos: TezosToolkit
    ): Promise<Doorman> {
      return new Doorman(
        await tezos.contract.at(doormanAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: DoormanStorage
    ): Promise<Doorman> {
        
      console.log('test show storage');

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/doorman.json`).toString()
      );
      const operation: OriginationOperation = await tezos.contract
        .originate({
          code: artifacts.michelson,
          storage: storage,
        })
        .catch((e) => {
        //   console.error(e);
        console.log('error no hash')
  
          return null;
        });
  
      await confirmOperation(tezos, operation.hash);
  
      return new Doorman(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }
  
    // async updateStorage(keys: string[]): Promise<void> {
    //   const storage: DoormanStorage = await this.contract.storage();
  
    //   this.storage = await keys.reduce(async (prev: any, current: any) => {
    //     try {
    //       return {
    //         ...(await prev),
    //         [current]: await storage.get(current),
    //       };
    //     } catch (ex) {
    //       return {
    //         ...(await prev),
    //         [current]: 0,
    //       };
    //     }
    //   }, Promise.resolve({}));
    // }
  
    // async validate(baker: string): Promise<TransactionOperation> {
    //   const operation: TransactionOperation = await this.contract.methods
    //     .validate(baker)
    //     .send();
  
    //   await confirmOperation(this.tezos, operation.hash);
  
    //   return operation;
    // }
  
    async setAdmin(newAdminAddress: string): Promise<TransactionOperation> {
        const operation: TransactionOperation = await this.contract.methods
          .setAdmin(newAdminAddress)
          .send();
    
        await confirmOperation(this.tezos, operation.hash);
    
        return operation;
      }

    // async register(baker: string): Promise<TransactionOperation> {
    //   const operation: TransactionOperation = await this.contract.methods
    //     .register(baker)
    //     .send();
  
    //   await confirmOperation(this.tezos, operation.hash);
  
    //   return operation;
    // }

  }
  