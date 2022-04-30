import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { governanceSatelliteStorageType } from "../types/governanceSatelliteStorageType";

export class GovernanceSatellite {
    contract: Contract;
    storage: governanceSatelliteStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
      this.contract = contract;
      this.tezos = tezos;
    }
  
    static async init(
      governanceSatelliteContractAddress: string,
      tezos: TezosToolkit
    ): Promise<GovernanceSatellite> {
      return new GovernanceSatellite(
        await tezos.contract.at(governanceSatelliteContractAddress),
        tezos
      );
    }

    static async originate(
      tezos: TezosToolkit,
      storage: governanceSatelliteStorageType
    ): Promise<GovernanceSatellite> {       

      const artifacts: any = JSON.parse(
        fs.readFileSync(`${env.buildDir}/governanceSatellite.json`).toString()
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
  
      return new GovernanceSatellite(
        await tezos.contract.at(operation.contractAddress),
        tezos
      );
    }

  }
  