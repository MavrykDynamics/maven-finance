import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { breakGlassStorageType } from "../types/breakGlassStorageType";

export class BreakGlass {
    contract: Contract;
    storage: breakGlassStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      breakGlassContractAddress: string,
      tezos: TezosToolkit
    ): Promise<BreakGlass> {
      return new BreakGlass(
        await tezos.contract.at(breakGlassContractAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: breakGlassStorageType
    ): Promise<BreakGlass> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/breakGlass.json`).toString()
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
  
      return new BreakGlass(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  