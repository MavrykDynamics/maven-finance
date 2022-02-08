import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { governanceStorageType } from "../types/governanceStorageType";

export class Governance {
    contract: Contract;
    storage: governanceStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      governanceContractAddress: string,
      tezos: TezosToolkit
    ): Promise<Governance> {
      return new Governance(
        await tezos.contract.at(governanceContractAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: governanceStorageType
    ): Promise<Governance> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/governance.json`).toString()
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
  
      return new Governance(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  