import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { mockFa2TokenStorageType } from "../types/mockFa2TokenStorageType";

export class MockFa2Token {
    contract: Contract;
    storage: mockFa2TokenStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      mockFa2TokenAddress: string,
      tezos: TezosToolkit
    ): Promise<MockFa2Token> {
      return new MockFa2Token(
        await tezos.contract.at(mockFa2TokenAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: mockFa2TokenStorageType
    ): Promise<MockFa2Token> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/mockFa2Token.json`).toString()
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
  
      return new MockFa2Token(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  