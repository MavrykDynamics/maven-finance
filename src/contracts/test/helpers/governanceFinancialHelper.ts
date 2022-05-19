import { governanceFinancialStorageType } from "../types/governanceFinancialStorageType";
import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";

export class GovernanceFinancial {
    contract: Contract;
    storage: governanceFinancialStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      governanceFinancialContractAddress: string,
      tezos: TezosToolkit
    ): Promise<GovernanceFinancial> {
      return new GovernanceFinancial(
        await tezos.contract.at(governanceFinancialContractAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: governanceFinancialStorageType
    ): Promise<GovernanceFinancial> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/governanceFinancial.json`).toString()
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
  
      return new GovernanceFinancial(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  