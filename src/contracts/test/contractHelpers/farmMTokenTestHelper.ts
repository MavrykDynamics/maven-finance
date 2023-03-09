import {
    ContractAbstraction,
    ContractMethod,
    ContractMethodObject,
    ContractProvider,
    ContractView,
    OriginationOperation,
    TezosToolkit,
    Wallet
} from "@taquito/taquito";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { farmMTokenStorageType } from "../types/farmMTokenStorageType";

import farmMTokenLambdas from "../../build/lambdas/farmMTokenLambdas.json";
import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";

type FarmMTokenContractMethods<T extends ContractProvider | Wallet> = {
    setLambda: (number, string) => ContractMethod<T>;
    updateWhitelistContracts: (
        whitelistContractName:string,
        whitelistContractAddress:string
    ) => ContractMethod<T>;
    updateGeneralContracts: (
        generalContractName:string,
        generalContractAddress:string
    ) => ContractMethod<T>;
};

type FarmMTokenContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type FarmMTokenViews = Record<string, (...args: any[]) => ContractView>;

type FarmMTokenOnChainViews = {
    decimals: () => OnChainView;
};

type FarmMTokenContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    FarmMTokenContractMethods<T>,
    FarmMTokenContractMethodObject<T>,
    FarmMTokenViews,
    FarmMTokenOnChainViews,
    farmMTokenStorageType>;


export const setFarmMTokenLambdas = async (tezosToolkit: TezosToolkit, contract: FarmMTokenContractAbstraction) => {
    const batch = tezosToolkit.wallet
        .batch();

    for (let lambdaName in farmMTokenLambdas) {
        let bytes   = farmMTokenLambdas[lambdaName]
        batch.withContractCall(contract.methods.setLambda(lambdaName, bytes))
    }

    const setupFarmMTokenLambdasOperation = await batch.send()
    await confirmOperation(tezosToolkit, setupFarmMTokenLambdasOperation.opHash);
};

export class FarmMToken {
    contract: FarmMTokenContractAbstraction;
    storage: farmMTokenStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: FarmMTokenContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        farmContractAddress: string,
        tezos: TezosToolkit
    ): Promise<FarmMToken> {
        return new FarmMToken(
            await tezos.contract.at(farmContractAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: farmMTokenStorageType
    ): Promise<FarmMToken> {       

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/farmMToken.json`).toString()
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
    
        return new FarmMToken(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }
}
