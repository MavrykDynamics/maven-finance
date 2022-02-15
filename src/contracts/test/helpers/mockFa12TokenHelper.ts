import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { mockFa12TokenStorageType } from "../types/mockFa12TokenStorageType";

export class MockFa12Token {
    contract: Contract;
    storage: mockFa12TokenStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      mockFa12TokenAddress: string,
      tezos: TezosToolkit
    ): Promise<MockFa12Token> {
      return new MockFa12Token(
        await tezos.contract.at(mockFa12TokenAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: mockFa12TokenStorageType
    ): Promise<MockFa12Token> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/mockFa12Token.json`).toString()
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
  
      return new MockFa12Token(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  