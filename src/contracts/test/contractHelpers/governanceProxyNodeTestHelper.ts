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
import { governanceProxyNodeStorageType } from "../types/governanceProxyNodeStorageType";

import governanceProxyNodeOneLambdas from "../../build/lambdas/governanceProxyNodeOneLambdas.json";
import governanceProxyNodeTwoLambdas from "../../build/lambdas/governanceProxyNodeTwoLambdas.json";

import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";

type GovernanceProxyNodeContractMethods<T extends ContractProvider | Wallet> = {
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

type GovernanceProxyNodeContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type GovernanceProxyNodeViews = Record<string, (...args: any[]) => ContractView>;

type GovernanceProxyNodeOnChainViews = {
    decimals: () => OnChainView;
};

type GovernanceProxyNodeContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    GovernanceProxyNodeContractMethods<T>,
    GovernanceProxyNodeContractMethodObject<T>,
    GovernanceProxyNodeViews,
    GovernanceProxyNodeOnChainViews,
    governanceProxyNodeStorageType>;


export const setGovernanceProxyNodeContractLambdas = async (tezosToolkit: TezosToolkit, contract: GovernanceProxyNodeContractAbstraction, proxyNode: string, lastIndex : number) => {

    let governanceProxyNodeLambdas
    governanceProxyNodeLambdas = proxyNode == "one" ? governanceProxyNodeOneLambdas : governanceProxyNodeTwoLambdas;

    const batch = tezosToolkit.wallet.batch();
    var index   = 0

    for (let lambdaName in governanceProxyNodeLambdas) {
        let bytes   = governanceProxyNodeLambdas[lambdaName]
        if(index < lastIndex){
            batch.withContractCall(contract.methods.setLambda(lambdaName, bytes))
        }
        index++;
    }

    const setupGovernanceProxyNodeLambdasOperation = await batch.send()
    await confirmOperation(tezosToolkit, setupGovernanceProxyNodeLambdasOperation.opHash);

};

export const setGovernanceProxyNodeContractProxyLambdas = async (tezosToolkit: TezosToolkit, contract: GovernanceProxyNodeContractAbstraction, proxyNode: string, startIndex : number) => {

    let governanceProxyNodeLambdas
    governanceProxyNodeLambdas = proxyNode == "one" ? governanceProxyNodeOneLambdas : governanceProxyNodeTwoLambdas;

    const lambdasPerBatch = 10;

    const lambdasCount = Object.keys(governanceProxyNodeLambdas).length;
    const batchesCount = Math.ceil(lambdasCount / lambdasPerBatch);

    for(let i = 0; i < batchesCount; i++) {
    
        const batch = tezosToolkit.wallet.batch();
        var index   = 0

        for (let lambdaName in governanceProxyNodeLambdas) {
            let bytes   = governanceProxyNodeLambdas[lambdaName]
            if(index >= startIndex){
            
                // since contract lambdas and proxy lambdas are sharing the same index json - separate the two
                const newIndex = index - startIndex;

                if(index < (lambdasPerBatch * (i + 1)) && (index >= lambdasPerBatch * i)){
                    batch.withContractCall(contract.methods.setProxyLambda(newIndex, bytes))
                }
            }
            index++;
        }

        const setupGovernanceProxyNodeLambdasOperation = await batch.send()
        await confirmOperation(tezosToolkit, setupGovernanceProxyNodeLambdasOperation.opHash);

    }
};


export class GovernanceProxyNode {
    contract: GovernanceProxyNodeContractAbstraction;
    storage: governanceProxyNodeStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: GovernanceProxyNodeContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        governanceProxyNodeContractAddress: string,
        tezos: TezosToolkit
    ): Promise<GovernanceProxyNode> {
        return new GovernanceProxyNode(
            await tezos.contract.at(governanceProxyNodeContractAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: governanceProxyNodeStorageType
    ): Promise<GovernanceProxyNode> {       

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/governanceProxyNode.json`).toString()
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
        // console.log(operation);
    
        return new GovernanceProxyNode(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

  }
  