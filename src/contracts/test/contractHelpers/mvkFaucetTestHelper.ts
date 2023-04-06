import {
    Contract,
    OriginationOperation,
    TezosToolkit
} from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import {confirmOperation} from "../../scripts/confirmation";
import {mvkFaucetStorageType} from "../types/mvkFaucetStorageType";

export class MvkFaucet {
    contract: Contract;
    storage: mvkFaucetStorageType;
    tezos: TezosToolkit;

    constructor(contract: Contrcat, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }

    static async init(
        mvkFaucetContractAddress: string,
        tezos: TezosToolkit
    ): Promise<MvkFaucet> {
        return new MvkFaucet(
            await tezos.contract.at(mvkFaucetContractAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: mvkFaucetStorageType
    ): Promise<MvkFaucet> {

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/mvkFaucet.json`).toString()
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

        return new MvkFaucet(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

}
