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
import { farmStorageType } from "../types/farmStorageType";

import farmLambdaIndex
    from '../../../contracts/contracts/partials/contractLambdas/farm/farmLambdaIndex.json';
import farmLambdas from "../../build/lambdas/farmLambdas.json";
import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";

type FarmContractMethods<T extends ContractProvider | Wallet> = {
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

type FarmContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type FarmViews = Record<string, (...args: any[]) => ContractView>;

type FarmOnChainViews = {
    decimals: () => OnChainView;
};

type FarmContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    FarmContractMethods<T>,
    FarmContractMethodObject<T>,
    FarmViews,
    FarmOnChainViews,
    farmStorageType>;


export const setFarmLambdas = async (tezosToolkit: TezosToolkit, contract: FarmContractAbstraction) => {
    const batch = tezosToolkit.wallet
        .batch();

    farmLambdaIndex.forEach(({index, name}: { index: number, name: string }) => {
        batch.withContractCall(contract.methods.setLambda(name, farmLambdas[index]))
    });

    const setupFarmLambdasOperation = await batch.send()
    await confirmOperation(tezosToolkit, setupFarmLambdasOperation.opHash);
};

export class Farm {
    contract: FarmContractAbstraction;
    storage: farmStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: FarmContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        farmContractAddress: string,
        tezos: TezosToolkit
    ): Promise<Farm> {
        return new Farm(
            await tezos.contract.at(farmContractAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: farmStorageType
    ): Promise<Farm> {       

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/farm.json`).toString()
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
    
        return new Farm(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }
}
