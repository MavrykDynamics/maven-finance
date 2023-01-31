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
import { breakGlassStorageType } from "../types/breakGlassStorageType";

import breakGlassLambdas from "../../build/lambdas/breakGlassLambdas.json";
import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";

type BreakGlassContractMethods<T extends ContractProvider | Wallet> = {
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

type BreakGlassContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type BreakGlassViews = Record<string, (...args: any[]) => ContractView>;

type BreakGlassOnChainViews = {
    decimals: () => OnChainView;
};

type BreakGlassContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    BreakGlassContractMethods<T>,
    BreakGlassContractMethodObject<T>,
    BreakGlassViews,
    BreakGlassOnChainViews,
    breakGlassStorageType>;


export const setBreakGlassLambdas = async (tezosToolkit: TezosToolkit, contract: BreakGlassContractAbstraction) => {

    const lambdasPerBatch = 7;

    const lambdasCount = Object.keys(breakGlassLambdas).length;
    const batchesCount = Math.ceil(lambdasCount / lambdasPerBatch);

    for(let i = 0; i < batchesCount; i++) {
    
        const batch = tezosToolkit.wallet.batch();
        var index   = 0

        for (let lambdaName in breakGlassLambdas) {
            let bytes   = breakGlassLambdas[lambdaName]
            if(index < (lambdasPerBatch * (i + 1)) && (index >= lambdasPerBatch * i)){
                batch.withContractCall(contract.methods.setLambda(lambdaName, bytes))
            }
            index++;
        }

        const setupLambdasOperation = await batch.send()
        await confirmOperation(tezosToolkit, setupLambdasOperation.opHash);

    }
};

export class BreakGlass {
    contract: BreakGlassContractAbstraction;
    storage: breakGlassStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: BreakGlassContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        breakGlassContractAddress: string,
        tezos: TezosToolkit
    ): Promise<BreakGlass> {
        return new BreakGlass(
            await tezos.contract.at(breakGlassContractAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: breakGlassStorageType
    ): Promise<BreakGlass> {       

        const artifacts: any = JSON.parse(
                fs.readFileSync(`${env.buildDir}/breakGlass.json`).toString()
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
  
        return new BreakGlass(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

  }
