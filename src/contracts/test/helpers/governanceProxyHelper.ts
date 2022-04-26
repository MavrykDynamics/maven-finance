import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { governanceProxyStorageType } from "../types/governanceProxyStorageType";

export class GovernanceProxy {
    contract: Contract;
    storage: governanceProxyStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      governanceProxyContractAddress: string,
      tezos: TezosToolkit
    ): Promise<GovernanceProxy> {
      return new GovernanceProxy(
        await tezos.contract.at(governanceProxyContractAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: governanceProxyStorageType
    ): Promise<GovernanceProxy> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/governanceProxy.json`).toString()
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
  
      return new GovernanceProxy(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  