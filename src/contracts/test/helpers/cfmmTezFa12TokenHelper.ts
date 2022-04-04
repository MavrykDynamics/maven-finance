import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { cfmmTezFa12TokenStorageType } from "../types/cfmmTezFa12TokenStorageType";

export class CfmmTezFa12Token {
    contract: Contract;
    storage: cfmmTezFa12TokenStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      cfmmTezFa12TokenAddress: string,
      tezos: TezosToolkit
    ): Promise<CfmmTezFa12Token> {
      return new CfmmTezFa12Token(
        await tezos.contract.at(cfmmTezFa12TokenAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: cfmmTezFa12TokenStorageType
    ): Promise<CfmmTezFa12Token> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/cfmmTezFa12Token.json`).toString()
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
  
      return new CfmmTezFa12Token(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  