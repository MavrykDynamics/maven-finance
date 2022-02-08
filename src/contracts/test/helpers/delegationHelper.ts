import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { delegationStorageType } from "../types/delegationStorageType";

export class Delegation {
    contract: Contract;
    storage: delegationStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      delegationContractAddress: string,
      tezos: TezosToolkit
    ): Promise<Delegation> {
      return new Delegation(
        await tezos.contract.at(delegationContractAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: delegationStorageType
    ): Promise<Delegation> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/delegation.json`).toString()
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
  
      return new Delegation(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  