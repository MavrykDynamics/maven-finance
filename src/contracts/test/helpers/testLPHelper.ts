import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { lpStorageType } from "../types/testLPTokenType";

export class LPToken {
    contract: Contract;
    storage: lpStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        lpTokenAddress: string,
        tezos: TezosToolkit
    ): Promise<LPToken> {
        return new LPToken(
            await tezos.contract.at(lpTokenAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: lpStorageType
    ): Promise<LPToken> {       

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/testLPToken.json`).toString()
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
    
        return new LPToken(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }
}
  