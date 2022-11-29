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
import { governanceStorageType } from "../types/governanceStorageType";

import governanceLambdas from "../../build/lambdas/governanceLambdas.json";
import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";

type GovernanceContractMethods<T extends ContractProvider | Wallet> = {
    setGovernanceProxy: (string) => ContractMethod<T>;  
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

type GovernanceContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type GovernanceViews = Record<string, (...args: any[]) => ContractView>;

type GovernanceOnChainViews = {
    decimals: () => OnChainView;
};

type GovernanceContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    GovernanceContractMethods<T>,
    GovernanceContractMethodObject<T>,
    GovernanceViews,
    GovernanceOnChainViews,
    governanceStorageType>;


export const setGovernanceLambdas = async (tezosToolkit: TezosToolkit, contract: GovernanceContractAbstraction) => {

    const lambdasPerBatch = 10;

    const lambdasCount  = Object.keys(governanceLambdas).length;
    const batchesCount  = Math.ceil(lambdasCount / lambdasPerBatch);
    
    for(let i = 0; i < batchesCount; i++) {
      
        const batch = tezosToolkit.wallet.batch();
        var index   = 0

        for (let lambdaName in governanceLambdas) {
            let bytes   = governanceLambdas[lambdaName]
            if(index < (lambdasPerBatch * (i + 1)) && (index >= lambdasPerBatch * i)){
                batch.withContractCall(contract.methods.setLambda(lambdaName, bytes))
            }
            index++;
        }

        const setupGovernanceLambdasOperation = await batch.send()
        await confirmOperation(tezosToolkit, setupGovernanceLambdasOperation.opHash);
    }
};


export class Governance {
    contract: GovernanceContractAbstraction;
    storage: governanceStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: GovernanceContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        governanceContractAddress: string,
        tezos: TezosToolkit
    ): Promise<Governance> {
        return new Governance(
            await tezos.contract.at(governanceContractAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: governanceStorageType
    ): Promise<Governance> {       

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/governance.json`).toString()
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
    
        return new Governance(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

  }
