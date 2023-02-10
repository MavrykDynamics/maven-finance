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
import { farmFactoryStorageType } from "../types/farmFactoryStorageType";

import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";
import {farmStorageType} from "../types/farmStorageType";
import farmFactoryLambdas from '../../build/lambdas/farmFactoryLambdas.json'
import farmLambdas from '../../build/lambdas/farmLambdas.json'
import {MichelsonMap} from "@taquito/michelson-encoder";
import {BigNumber} from "bignumber.js";

type Fa12 = string
type Fa2  = string
type lpStandardType = Fa12 | Fa2;

type FarmFactoryContractMethods<T extends ContractProvider | Wallet> = {
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
    createFarm: (
        forceRewardFromTransfer: boolean,
        infinite: boolean,
        plannedRewards: {
            totalBlocks : BigNumber,
            currentRewardPerBlock: BigNumber
        },
        metadata: string,
        lpToken: {
            tokenAddress : string,
            tokenId : BigNumber,
            tokenStandard : lpStandardType
        }
    ) => ContractMethod<T>;
};

type FarmFactoryContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type FarmViews = Record<string, (...args: any[]) => ContractView>;

type FarmOnChainViews = {
    [key: string]: OnChainView
};

type FarmFactoryContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    FarmFactoryContractMethods<T>,
    FarmFactoryContractMethodObject<T>,
    FarmViews,
    FarmOnChainViews,
    farmStorageType>;


export const setFarmFactoryLambdas = async (tezosToolkit: TezosToolkit, contract: FarmFactoryContractAbstraction) => {
    const batch = tezosToolkit.wallet
        .batch();

    for (let lambdaName in farmFactoryLambdas) {
        let bytes   = farmFactoryLambdas[lambdaName]
        batch.withContractCall(contract.methods.setLambda(lambdaName, bytes))
    }

  const op = await batch.send()
  await confirmOperation(tezosToolkit, op.opHash);
}

export const setFarmFactoryProductLambdas = async (tezosToolkit: TezosToolkit, contract: FarmFactoryContractAbstraction) => {
    const batch = tezosToolkit.wallet
        .batch();

    for (let lambdaName in farmLambdas) {
        let bytes   = farmLambdas[lambdaName]
        batch.withContractCall(contract.methods.setProductLambda(lambdaName, bytes))
    }

    const op = await batch.send()
    await confirmOperation(tezosToolkit, op.opHash);
}


export class FarmFactory {
    contract: FarmFactoryContractAbstraction;
    storage: farmFactoryStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: FarmFactoryContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        farmFactoryAddress: string,
        tezos: TezosToolkit
    ): Promise<FarmFactory> {
        return new FarmFactory(
            await tezos.contract.at(farmFactoryAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: farmFactoryStorageType
    ): Promise<FarmFactory> {       

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/farmFactory.json`).toString()
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
    
        return new FarmFactory(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }
}
