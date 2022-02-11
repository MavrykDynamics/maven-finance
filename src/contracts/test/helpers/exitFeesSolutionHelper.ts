import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { exitFeeSolutionStorageType } from "../types/exitFeesSolutionStorageType";

export class ExitFeesSolution {
    contract: Contract;
    storage: exitFeeSolutionStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      exitFeesSolutionAddress: string,
      tezos: TezosToolkit
    ): Promise<ExitFeesSolution> {
      return new ExitFeesSolution(
        await tezos.contract.at(exitFeesSolutionAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: exitFeeSolutionStorageType
    ): Promise<ExitFeesSolution> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/exitFeesSolution.json`).toString()
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
  
      return new ExitFeesSolution(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  