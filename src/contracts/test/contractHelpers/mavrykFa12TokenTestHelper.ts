import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { mavrykFa12TokenStorageType } from "../types/mavrykFa12TokenStorageType";

export class MavrykFa12Token {
    contract: Contract;
    storage: mavrykFa12TokenStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        mavrykFa12TokenAddress: string,
        tezos: TezosToolkit
    ): Promise<MavrykFa12Token> {
        return new MavrykFa12Token(
            await tezos.contract.at(mavrykFa12TokenAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: mavrykFa12TokenStorageType
    ): Promise<MavrykFa12Token> {       

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/mavrykFa12Token.json`).toString()
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
    
        return new MavrykFa12Token(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

  }
  