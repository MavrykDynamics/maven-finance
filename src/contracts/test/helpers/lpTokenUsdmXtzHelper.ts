import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { lpTokenUsdmXtzStorageType } from "../types/lpTokenUsdmXtzStorageType";

export class LpTokenUsdmXtz {
    contract: Contract;
    storage: lpTokenUsdmXtzStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      lpTokenUsdmXtzAddress: string,
      tezos: TezosToolkit
    ): Promise<LpTokenUsdmXtz> {
      return new LpTokenUsdmXtz(
        await tezos.contract.at(lpTokenUsdmXtzAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: lpTokenUsdmXtzStorageType
    ): Promise<LpTokenUsdmXtz> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/lpTokenUsdmXtz.json`).toString()
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
  
      return new LpTokenUsdmXtz(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  