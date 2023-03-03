import governanceProxyLambdas from "../../build/lambdas/governanceProxyTestLambdas.json";
import { ContractAbstraction, ContractMethod, ContractMethodObject, ContractProvider, ContractView, OriginationOperation, TezosToolkit, Wallet } from "@taquito/taquito";
import { OnChainView } from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";
import fs from "fs";

import env from "../../env";
import { confirmOperation } from "../../scripts/confirmation";
import { governanceProxyStorageType } from "../types/governanceProxyTestStorageType";

type GovernanceProxyContractMethods<T extends ContractProvider | Wallet> = {
    setLambda: (number, string) => ContractMethod<T>;
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


export const setGovernanceProxyContractLambdas = async (tezosToolkit: TezosToolkit, contract: GovernanceProxyContractAbstraction) => {

    const batch = tezosToolkit.wallet.batch();

    for (let lambdaName in governanceProxyLambdas) {
        let bytes   = governanceProxyLambdas[lambdaName]
        batch.withContractCall(contract.methods.setLambda(lambdaName, bytes))
    }

    const setupGovernanceProxyLambdasOperation = await batch.send()
    await confirmOperation(tezosToolkit, setupGovernanceProxyLambdasOperation.opHash);

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
            fs.readFileSync(`${env.buildDir}/governanceProxyTest.json`).toString()
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
    
        return new GovernanceProxy(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

  }
  