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
import { lendingControllerMockTimeStorageType } from "../types/lendingControllerMockTimeStorageType";

import lendingControllerMockTimeLambdaIndex
    from '../../../contracts/contracts/partials/contractLambdas/lendingControllerMockTime/lendingControllerMockTimeLambdaIndex.json';
import lendingControllerMockTimeLambdas from "../../build/lambdas/lendingControllerMockTimeLambdas.json";

import vaultLambdaIndex
    from '../../../contracts/contracts/partials/contractLambdas/vault/vaultLambdaIndex.json';
import vaultLambdas from "../../build/lambdas/vaultLambdas.json";


import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";

type LendingControllerMockTimeContractMethods<T extends ContractProvider | Wallet> = {
    setLambda: (number, string) => ContractMethod<T>;
    setProductLambda: (number, string) => ContractMethod<T>;
    updateWhitelistContracts: (
        whitelistContractName:string,
        whitelistContractAddress:string
    ) => ContractMethod<T>;
    updateGeneralContracts: (
        generalContractName:string,
        generalContractAddress:string
    ) => ContractMethod<T>;  
};

type LendingControllerMockTimeContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type LendingControllerMockTimeViews = Record<string, (...args: any[]) => ContractView>;

type LendingControllerMockTimeOnChainViews = {
    decimals: () => OnChainView;
};

type LendingControllerMockTimeContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    LendingControllerMockTimeContractMethods<T>,
    LendingControllerMockTimeContractMethodObject<T>,
    LendingControllerMockTimeViews,
    LendingControllerMockTimeOnChainViews,
    lendingControllerMockTimeStorageType>;


export const setLendingControllerLambdas = async (tezosToolkit: TezosToolkit, contract: LendingControllerMockTimeContractAbstraction) => {

    const lambdasPerBatch = 8;

    const lambdasCount = lendingControllerMockTimeLambdas.length;
    const batchesCount = Math.ceil(lambdasCount / lambdasPerBatch);

    for(let i = 0; i < batchesCount; i++) {
    
        const batch = tezosToolkit.wallet.batch();

        lendingControllerMockTimeLambdaIndex.forEach(({index, name}: { index : number, name : string }) => {  

            if(index < (lambdasPerBatch * (i + 1)) && (index >= lambdasPerBatch * i)){
                batch.withContractCall(contract.methods.setLambda(name, lendingControllerMockTimeLambdas[index]))
            }

        });

        const setupLendingControllerLambdasOperation = await batch.send()
        await confirmOperation(tezosToolkit, setupLendingControllerLambdasOperation.opHash);

    }
};


export const setLendingControllerProductLambdas = async (tezosToolkit: TezosToolkit, contract: LendingControllerMockTimeContractAbstraction) => {
    const batch = tezosToolkit.wallet
        .batch();

    vaultLambdaIndex.forEach(({index, name}: { index: number, name: string }) => {
        batch.withContractCall(contract.methods.setProductLambda(name, vaultLambdas[index]))
    });

    const op = await batch.send()
    await confirmOperation(tezosToolkit, op.opHash);
}



export class LendingControllerMockTime {
    contract: LendingControllerMockTimeContractAbstraction;
    storage: lendingControllerMockTimeStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: LendingControllerMockTimeContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        lendingControllerMockTimeContractAddress: string,
        tezos: TezosToolkit
    ): Promise<LendingControllerMockTime> {
        return new LendingControllerMockTime(
            await tezos.contract.at(lendingControllerMockTimeContractAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: lendingControllerMockTimeStorageType
    ): Promise<LendingControllerMockTime> {       

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/lendingControllerMockTime.json`).toString()
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
    
        return new LendingControllerMockTime(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

  }
  