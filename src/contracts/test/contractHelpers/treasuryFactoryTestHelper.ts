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
import { treasuryFactoryStorageType } from "../types/treasuryFactoryStorageType";

import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";
import {treasuryStorageType} from "../types/treasuryStorageType";
import treasuryFactoryLambdas from '../../build/lambdas/treasuryFactoryLambdas.json'
import treasuryLambdas from '../../build/lambdas/treasuryLambdas.json'
import {MichelsonMap} from "@taquito/michelson-encoder";
import {BigNumber} from "bignumber.js";

type TreasuryFactoryContractMethods<T extends ContractProvider | Wallet> = {
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

type TreasuryFactoryContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type TreasuryViews = Record<string, (...args: any[]) => ContractView>;

type TreasuryOnChainViews = {
    [key: string]: OnChainView
};

type TreasuryFactoryContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    TreasuryFactoryContractMethods<T>,
    TreasuryFactoryContractMethodObject<T>,
    TreasuryViews,
    TreasuryOnChainViews,
    treasuryStorageType>;


export const setTreasuryFactoryLambdas = async (tezosToolkit: TezosToolkit, contract: TreasuryFactoryContractAbstraction) => {
    const batch = tezosToolkit.wallet
        .batch();

    for (let lambdaName in treasuryFactoryLambdas) {
        let bytes   = treasuryFactoryLambdas[lambdaName]
        batch.withContractCall(contract.methods.setLambda(lambdaName, bytes))
    }

    const op = await batch.send()
    await confirmOperation(tezosToolkit, op.opHash);
}

export const setTreasuryFactoryProductLambdas = async (tezosToolkit: TezosToolkit, contract: TreasuryFactoryContractAbstraction) => {
    const batch = tezosToolkit.wallet
        .batch();

    for (let lambdaName in treasuryLambdas) {
        let bytes   = treasuryLambdas[lambdaName]
        batch.withContractCall(contract.methods.setProductLambda(lambdaName, bytes))
    }

    const op = await batch.send()
    await confirmOperation(tezosToolkit, op.opHash);
}

export class TreasuryFactory {
    contract: TreasuryFactoryContractAbstraction;
    storage: treasuryFactoryStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: TreasuryFactoryContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        treasuryFactoryAddress: string,
        tezos: TezosToolkit
    ): Promise<TreasuryFactory> {
        return new TreasuryFactory(
            await tezos.contract.at(treasuryFactoryAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: treasuryFactoryStorageType
    ): Promise<TreasuryFactory> {      

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/treasuryFactory.json`).toString()
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
    
        return new TreasuryFactory(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }
  
    async setAdmin(newAdminAddress: string): Promise<TransactionOperation> {
        const operation: TransactionOperation = await this.contract.methods
            .setAdmin(newAdminAddress)
            .send();
    
        await confirmOperation(this.tezos, operation.hash);
    
        return operation;
      }

  }
