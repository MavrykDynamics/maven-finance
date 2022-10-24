import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { mTokenStorageType } from "../types/mTokenStorageType";

export class MToken {
    contract: Contract;
    storage: mTokenStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        mTokenAddress: string,
        tezos: TezosToolkit
    ): Promise<MToken> {
        return new MToken(
            await tezos.contract.at(mTokenAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: mTokenStorageType
    ): Promise<MToken> {       

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/mToken.json`).toString()
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
    
        return new MToken(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

  }
  