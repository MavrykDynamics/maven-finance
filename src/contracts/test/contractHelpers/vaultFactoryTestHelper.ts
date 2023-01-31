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
import { vaultFactoryStorageType } from "../types/vaultFactoryStorageType";

import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";
import {vaultStorageType} from "../types/vaultStorageType";
import vaultFactoryLambdas from '../../build/lambdas/vaultFactoryLambdas.json'
import vaultLambdas from '../../build/lambdas/vaultLambdas.json'
import {MichelsonMap} from "@taquito/michelson-encoder";
import {BigNumber} from "bignumber.js";

type VaultFactoryContractMethods<T extends ContractProvider | Wallet> = {
    setLambda: (number, string) => ContractMethod<T>;
    updateWhitelistContracts: (
        whitelistContractName:string,
        whitelistContractAddress:string
    ) => ContractMethod<T>;
    updateGeneralContracts: (
        generalContractName:string,
        generalContractAddress:string
    ) => ContractMethod<T>;
    setProductLambda: (number, string) => ContractMethod<T>;
};

type VaultFactoryContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type VaultViews = Record<string, (...args: any[]) => ContractView>;

type VaultOnChainViews = {
    decimals: () => OnChainView;
};

type VaultFactoryContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    VaultFactoryContractMethods<T>,
    VaultFactoryContractMethodObject<T>,
    VaultViews,
    VaultOnChainViews,
    vaultStorageType>;


export const setVaultFactoryLambdas = async (tezosToolkit: TezosToolkit, contract: VaultFactoryContractAbstraction) => {

    const lambdasPerBatch = 7;

    const lambdasCount = Object.keys(vaultFactoryLambdas).length;
    const batchesCount = Math.ceil(lambdasCount / lambdasPerBatch);

    for(let i = 0; i < batchesCount; i++) {
    
        const batch = tezosToolkit.wallet.batch();
        var index   = 0

        for (let lambdaName in vaultFactoryLambdas) {
            let bytes   = vaultFactoryLambdas[lambdaName]
            if(index < (lambdasPerBatch * (i + 1)) && (index >= lambdasPerBatch * i)){
                batch.withContractCall(contract.methods.setLambda(lambdaName, bytes))
            }
            index++;
        }

        const setupDelegationLambdasOperation = await batch.send()
        await confirmOperation(tezosToolkit, setupDelegationLambdasOperation.opHash);

    }
}

export const setVaultFactoryProductLambdas = async (tezosToolkit: TezosToolkit, contract: VaultFactoryContractAbstraction) => {

    const lambdasPerBatch = 7;

    const lambdasCount = Object.keys(vaultLambdas).length;
    const batchesCount = Math.ceil(lambdasCount / lambdasPerBatch);

    for(let i = 0; i < batchesCount; i++) {
    
        const batch = tezosToolkit.wallet.batch();
        var index   = 0

        for (let lambdaName in vaultLambdas) {
            let bytes   = vaultLambdas[lambdaName]
            if(index < (lambdasPerBatch * (i + 1)) && (index >= lambdasPerBatch * i)){
                batch.withContractCall(contract.methods.setProductLambda(lambdaName, bytes))
            }
            index++;
        }

        const setupLambdasOperation = await batch.send()
        await confirmOperation(tezosToolkit, setupLambdasOperation.opHash);

    }
}


export class VaultFactory {
    contract: VaultFactoryContractAbstraction;
    storage: vaultFactoryStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: VaultFactoryContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        vaultFactoryAddress: string,
        tezos: TezosToolkit
    ): Promise<VaultFactory> {
        return new VaultFactory(
            await tezos.contract.at(vaultFactoryAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: vaultFactoryStorageType
    ): Promise<VaultFactory> {       

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/vaultFactory.json`).toString()
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
    
        return new VaultFactory(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }
}
