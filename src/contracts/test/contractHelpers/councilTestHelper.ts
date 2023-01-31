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
import { councilStorageType } from "../types/councilStorageType";

import councilLambdas from "../../build/lambdas/councilLambdas.json";
import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";

type CouncilContractMethods<T extends ContractProvider | Wallet> = {
    setLambda: (number, string) => ContractMethod<T>;
    updateWhitelistContracts: (
        whitelistContractName     : string,
        whitelistContractAddress  : string
    ) => ContractMethod<T>;
    updateGeneralContracts: (
        generalContractName       : string,
        generalContractAddress    : string
    ) => ContractMethod<T>;
};

type CouncilContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type CouncilViews = Record<string, (...args: any[]) => ContractView>;

type CouncilOnChainViews = {
    decimals: () => OnChainView;
};

type CouncilContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    CouncilContractMethods<T>,
    CouncilContractMethodObject<T>,
    CouncilViews,
    CouncilOnChainViews,
    councilStorageType>;


export const setCouncilLambdas = async (tezosToolkit: TezosToolkit, contract: CouncilContractAbstraction) => {

    const lambdasPerBatch = 7;

    const lambdasCount = Object.keys(councilLambdas).length;
    const batchesCount = Math.ceil(lambdasCount / lambdasPerBatch);

    for(let i = 0; i < batchesCount; i++) {
    
        const batch = tezosToolkit.wallet.batch();
        var index   = 0

        for (let lambdaName in councilLambdas) {
            let bytes   = councilLambdas[lambdaName]
            if(index < (lambdasPerBatch * (i + 1)) && (index >= lambdasPerBatch * i)){
                batch.withContractCall(contract.methods.setLambda(lambdaName, bytes))
            }
            index++;
        }

        const setupLambdasOperation = await batch.send()
        await confirmOperation(tezosToolkit, setupLambdasOperation.opHash);

    }
};

export class Council {
    contract: CouncilContractAbstraction;
    storage: councilStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: CouncilContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        councilContractAddress: string,
        tezos: TezosToolkit
    ): Promise<Council> {
        return new Council(
            await tezos.contract.at(councilContractAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: councilStorageType
    ): Promise<Council> {       

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/council.json`).toString()
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

        return new Council(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

  }
