import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { vestingStorageType } from "../types/vestingStorageType";

export class Vesting {
    contract: Contract;
    storage: vestingStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      vestingContractAddress: string,
      tezos: TezosToolkit
    ): Promise<Vesting> {
      return new Vesting(
        await tezos.contract.at(vestingContractAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: vestingStorageType
    ): Promise<Vesting> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/vesting.json`).toString()
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
  
      return new Vesting(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  