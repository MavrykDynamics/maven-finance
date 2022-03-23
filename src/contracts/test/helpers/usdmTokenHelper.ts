import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { usdmTokenStorageType } from "../types/usdm/usdmTokenStorageType";

export class UsdmToken {
    contract: Contract;
    storage: usdmTokenStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      usdmTokenAddress: string,
      tezos: TezosToolkit
    ): Promise<UsdmToken> {
      return new UsdmToken(
        await tezos.contract.at(usdmTokenAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: usdmTokenStorageType
    ): Promise<UsdmToken> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/usdmToken.json`).toString()
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
  
      return new UsdmToken(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  