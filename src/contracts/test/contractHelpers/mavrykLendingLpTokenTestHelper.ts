import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { mavrykLendingLpTokenStorageType } from "../types/mavrykLendingLpTokenStorageType";

export class MavrykLendingLpToken {
    contract: Contract;
    storage: mavrykLendingLpTokenStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        mavrykLendingLpTokenAddress: string,
        tezos: TezosToolkit
    ): Promise<MavrykLendingLpToken> {
        return new MavrykLendingLpToken(
            await tezos.contract.at(mavrykLendingLpTokenAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: mavrykLendingLpTokenStorageType
    ): Promise<MavrykLendingLpToken> {       

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/mavrykLendingLpToken.json`).toString()
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
    
        return new MavrykLendingLpToken(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

  }
  