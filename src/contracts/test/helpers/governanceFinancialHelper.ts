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
import { governanceFinancialStorageType } from "../types/governanceFinancialStorageType";

import governanceFinancialLambdas from "../../build/lambdas/governanceFinancialLambdas.json";
import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";

type GovernanceFinancialContractMethods<T extends ContractProvider | Wallet> = {
    setLambda: (number, string) => ContractMethod<T>;
    updateWhitelistContracts: (
        whitelistContractName:string,
        whitelistContractAddress:string
    ) => ContractMethod<T>;
    updateGeneralContracts: (
        generalContractName:string,
        generalContractAddress:string
    ) => ContractMethod<T>;
    updateWhitelistTokenContracts: (
        whitelistTokenContractName:string,
        whitelistTokenContractAddress:string
    ) => ContractMethod<T>;
};

type GovernanceFinancialContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type GovernanceFinancialViews = Record<string, (...args: any[]) => ContractView>;

type GovernanceFinancialOnChainViews = {
    decimals: () => OnChainView;
};

type GovernanceFinancialContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    GovernanceFinancialContractMethods<T>,
    GovernanceFinancialContractMethodObject<T>,
    GovernanceFinancialViews,
    GovernanceFinancialOnChainViews,
    governanceFinancialStorageType>;


export const setGovernanceFinancialLambdas = async (tezosToolkit: TezosToolkit, contract: GovernanceFinancialContractAbstraction) => {
        
    const batch = tezosToolkit.wallet
        .batch();

    for (let lambdaName in governanceFinancialLambdas) {
        let bytes   = governanceFinancialLambdas[lambdaName]
        batch.withContractCall(contract.methods.setLambda(lambdaName, bytes))
    }

    const setupGovernanceFinancialLambdasOperation = await batch.send()
    await confirmOperation(tezosToolkit, setupGovernanceFinancialLambdasOperation.opHash);
};

export class GovernanceFinancial {
    contract: GovernanceFinancialContractAbstraction;
    storage: governanceFinancialStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: GovernanceFinancialContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        governanceFinancialContractAddress: string,
        tezos: TezosToolkit
    ): Promise<GovernanceFinancial> {
        return new GovernanceFinancial(
            await tezos.contract.at(governanceFinancialContractAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: governanceFinancialStorageType
    ): Promise<GovernanceFinancial> {       

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/governanceFinancial.json`).toString()
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
    
        return new GovernanceFinancial(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

  }
