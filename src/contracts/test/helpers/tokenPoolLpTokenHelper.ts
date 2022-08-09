import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { tokenPoolLpTokenStorageType } from "../types/tokenPoolLpTokenStorageType";

export class TokenPoolLpToken {
    contract: Contract;
    storage: tokenPoolLpTokenStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      tokenPoolLpTokenAddress: string,
      tezos: TezosToolkit
    ): Promise<TokenPoolLpToken> {
      return new TokenPoolLpToken(
        await tezos.contract.at(tokenPoolLpTokenAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: tokenPoolLpTokenStorageType
    ): Promise<TokenPoolLpToken> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/tokenPoolLpToken.json`).toString()
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
  
      return new TokenPoolLpToken(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  