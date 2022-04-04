import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { cfmmTezFa2TokenStorageType } from "../types/cfmmTezFa2TokenStorageType";

export class CfmmTezFa2Token {
    contract: Contract;
    storage: cfmmTezFa2TokenStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      cfmmTezFa2TokenAddress: string,
      tezos: TezosToolkit
    ): Promise<CfmmTezFa2Token> {
      return new CfmmTezFa2Token(
        await tezos.contract.at(cfmmTezFa2TokenAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: cfmmTezFa2TokenStorageType
    ): Promise<CfmmTezFa2Token> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/cfmmTezFa2Token.json`).toString()
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
  
      return new CfmmTezFa2Token(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  