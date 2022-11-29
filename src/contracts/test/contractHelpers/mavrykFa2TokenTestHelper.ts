import { Contract, OriginationOperation, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { mavrykFa2TokenStorageType } from "../types/mavrykFa2TokenStorageType";

export class MavrykFa2Token {
    contract: Contract;
    storage: mavrykFa2TokenStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: Contract, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        mavrykFa2TokenAddress: string,
        tezos: TezosToolkit
    ): Promise<MavrykFa2Token> {
        return new MavrykFa2Token(
            await tezos.contract.at(mavrykFa2TokenAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: mavrykFa2TokenStorageType
    ): Promise<MavrykFa2Token> {       

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/mavrykFa2Token.json`).toString()
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
    
        return new MavrykFa2Token(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

  }
  