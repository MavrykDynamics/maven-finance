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
import {confirmOperation} from "../../scripts/confirmation";
import {aggregatorFactoryStorageType} from "../types/aggregatorFactoryStorageType";

import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";
import {aggregatorStorageType} from "../types/aggregatorStorageType";
import aggregatorFactoryLambdas from '../../build/lambdas/aggregatorFactoryLambdas.json'
import aggregatorLambdas from '../../build/lambdas/aggregatorLambdas.json'
import {MichelsonMap} from "@taquito/michelson-encoder";
import {BigNumber} from "bignumber.js";


type AggregatorFactoryContractMethods<T extends ContractProvider | Wallet> = {
    setLambda: (number, string) => ContractMethod<T>;
    updateWhitelistContracts: (
        whitelistContractName     : string,
        whitelistContractAddress  : string
    ) => ContractMethod<T>;
    updateGeneralContracts: (
        generalContractName       : string,
        generalContractAddress    : string
    ) => ContractMethod<T>;
    setProductLambda: (number, string) => ContractMethod<T>;
    createAggregator: (
        pair1                               : string,
        pair2                               : string,

        name                                : string,
        addToGeneralContracts               : boolean,

        oracleAddresses                     : MichelsonMap<string, boolean>,

        decimals                            : BigNumber,
        numberBlocksDelay                   : BigNumber,

        percentOracleThreshold              : BigNumber,
        
        rewardAmountStakedMvK               : BigNumber,
        rewardAmountXtz                     : BigNumber,

        maintainer                          : string,
        metadataBytes                       : string

    ) => ContractMethod<T>;
};

type AggregatorFactoryContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type AggregatorViews = Record<string, (...args: any[]) => ContractView>;

type AggregatorOnChainViews = {
    [key: string]: OnChainView
};

export type AggregatorFactoryContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    AggregatorFactoryContractMethods<T>,
    AggregatorFactoryContractMethodObject<T>,
    AggregatorViews,
    AggregatorOnChainViews,
    aggregatorStorageType>;


export const setAggregatorFactoryLambdas = async (tezosToolkit: TezosToolkit, contract: AggregatorFactoryContractAbstraction) => {
    
    const lambdasPerBatch = 7;

    const lambdasCount = Object.keys(aggregatorFactoryLambdas).length;
    const batchesCount = Math.ceil(lambdasCount / lambdasPerBatch);

    for(let i = 0; i < batchesCount; i++) {
    
        const batch = tezosToolkit.wallet.batch();
        var index   = 0

        for (let lambdaName in aggregatorFactoryLambdas) {
            let bytes   = aggregatorFactoryLambdas[lambdaName]
            if(index < (lambdasPerBatch * (i + 1)) && (index >= lambdasPerBatch * i)){
                batch.withContractCall(contract.methods.setLambda(lambdaName, bytes))
            }
            index++;
        }

        const setupLambdasOperation = await batch.send()
        await confirmOperation(tezosToolkit, setupLambdasOperation.opHash);

    }
}

export const setAggregatorFactoryProductLambdas = async (tezosToolkit: TezosToolkit, contract: AggregatorFactoryContractAbstraction) => {

    const lambdasPerBatch = 7;

    const lambdasCount = Object.keys(aggregatorLambdas).length;
    const batchesCount = Math.ceil(lambdasCount / lambdasPerBatch);

    for(let i = 0; i < batchesCount; i++) {
    
        const batch = tezosToolkit.wallet.batch();
        var index   = 0

        for (let lambdaName in aggregatorLambdas) {
            let bytes   = aggregatorLambdas[lambdaName]
            if(index < (lambdasPerBatch * (i + 1)) && (index >= lambdasPerBatch * i)){
                batch.withContractCall(contract.methods.setProductLambda(lambdaName, bytes))
            }
            index++;
        }

        const setupLambdasOperation = await batch.send()
        await confirmOperation(tezosToolkit, setupLambdasOperation.opHash);

    }
}


export class AggregatorFactory {
    contract: AggregatorFactoryContractAbstraction;
    storage: aggregatorFactoryStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: AggregatorFactoryContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        aggregatorFactoryContractAddress: string,
        tezos: TezosToolkit
    ): Promise<AggregatorFactory> {
        return new AggregatorFactory(
            await tezos.contract.at(aggregatorFactoryContractAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: aggregatorFactoryStorageType
    ): Promise<AggregatorFactory> {       

      const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/aggregatorFactory.json`).toString()
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
  
      return new AggregatorFactory(
            await tezos.contract.at(operation.contractAddress),
            tezos
      );
    }

  }
