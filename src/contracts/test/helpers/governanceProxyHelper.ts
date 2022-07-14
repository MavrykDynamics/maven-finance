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
import { governanceProxyStorageType } from "../types/governanceProxyStorageType";

import governanceProxyLambdaIndex
    from '../../../contracts/contracts/partials/contractLambdas/governanceProxy/governanceProxyLambdaIndex.json';
import governanceProxyLambdas from "../../build/lambdas/governanceProxyLambdas.json";

import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";

type GovernanceProxyContractMethods<T extends ContractProvider | Wallet> = {
    setLambda: (number, string) => ContractMethod<T>;
    setProxyLambda: (number, string) => ContractMethod<T>;
    updateWhitelistContracts: (
        whitelistContractName:string,
        whitelistContractAddress:string
    ) => ContractMethod<T>;
    updateGeneralContracts: (
        generalContractName:string,
        generalContractAddress:string
    ) => ContractMethod<T>;  
};

type GovernanceProxyContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type GovernanceProxyViews = Record<string, (...args: any[]) => ContractView>;

type GovernanceProxyOnChainViews = {
    decimals: () => OnChainView;
};

type GovernanceProxyContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    GovernanceProxyContractMethods<T>,
    GovernanceProxyContractMethodObject<T>,
    GovernanceProxyViews,
    GovernanceProxyOnChainViews,
    governanceProxyStorageType>;


export const setGovernanceProxyContractLambdas = async (tezosToolkit: TezosToolkit, contract: GovernanceProxyContractAbstraction, lastIndex : number) => {

    const batch = tezosToolkit.wallet.batch();

    governanceProxyLambdaIndex.forEach(({index, name}: { index: number, name: string }) => {  
        if(index < lastIndex){
          batch.withContractCall(contract.methods.setLambda(name, governanceProxyLambdas[index]))
        }
    });

    const setupGovernanceProxyLambdasOperation = await batch.send()
    await confirmOperation(tezosToolkit, setupGovernanceProxyLambdasOperation.opHash);

};

export const setGovernanceProxyContractProxyLambdas = async (tezosToolkit: TezosToolkit, contract: GovernanceProxyContractAbstraction, startIndex : number) => {

    const lambdasPerBatch = 10;

    const lambdasCount = governanceProxyLambdas.length;
    const batchesCount = Math.ceil(lambdasCount / lambdasPerBatch);

    for(let i = 0; i < batchesCount; i++) {
    
        const batch = tezosToolkit.wallet.batch();

        governanceProxyLambdaIndex.forEach(({index, name}: { index: number, name: string }) => {  
        
            if(index >= startIndex){
            
            // since contract lambdas and proxy lambdas are sharing the same index json - separate the two
            const newIndex = index - startIndex;

            if(index < (lambdasPerBatch * (i + 1)) && (index >= lambdasPerBatch * i)){
                batch.withContractCall(contract.methods.setProxyLambda(newIndex, governanceProxyLambdas[index]))
            }
        }
        });

        const setupGovernanceProxyLambdasOperation = await batch.send()
        await confirmOperation(tezosToolkit, setupGovernanceProxyLambdasOperation.opHash);

    }
};


export class GovernanceProxy {
    contract: GovernanceProxyContractAbstraction;
    storage: governanceProxyStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: GovernanceProxyContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        governanceProxyContractAddress: string,
        tezos: TezosToolkit
    ): Promise<GovernanceProxy> {
        return new GovernanceProxy(
            await tezos.contract.at(governanceProxyContractAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: governanceProxyStorageType
    ): Promise<GovernanceProxy> {       

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/governanceProxy.json`).toString()
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
    
        return new GovernanceProxy(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

  }
  