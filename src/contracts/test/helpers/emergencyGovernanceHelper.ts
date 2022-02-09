import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { emergencyGovernanceStorageType } from "../types/emergencyGovernanceStorageType";

export class EmergencyGovernance {
    contract: Contract;
    storage: emergencyGovernanceStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
        emergencyGovernanceContractAddress: string,
      tezos: TezosToolkit
    ): Promise<EmergencyGovernance> {
      return new EmergencyGovernance(
        await tezos.contract.at(emergencyGovernanceContractAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: emergencyGovernanceStorageType
    ): Promise<EmergencyGovernance> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/emergencyGovernance.json`).toString()
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
  
      return new EmergencyGovernance(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  