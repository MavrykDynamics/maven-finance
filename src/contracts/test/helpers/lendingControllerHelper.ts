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
import { lendingControllerStorageType } from "../types/lendingControllerStorageType";

import lendingControllerLambdaIndex
    from '../../../contracts/contracts/partials/contractLambdas/lendingController/lendingControllerLambdaIndex.json';
import lendingControllerLambdas from "../../build/lambdas/lendingControllerLambdas.json";

import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";

type LendingControllerContractMethods<T extends ContractProvider | Wallet> = {
    setLambda: (number, string) => ContractMethod<T>;
    setProductLambda: (number, string) => ContractMethod<T>;
    updateWhitelistContracts: (
        whitelistContractName:string,
        whitelistContractAddress:string
    ) => ContractMethod<T>;
    updateGeneralContracts: (
        generalContractName:string,
        generalContractAddress:string
    ) => ContractMethod<T>;  
};

type LendingControllerContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type LendingControllerViews = Record<string, (...args: any[]) => ContractView>;

type LendingControllerOnChainViews = {
    decimals: () => OnChainView;
};

type LendingControllerContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    LendingControllerContractMethods<T>,
    LendingControllerContractMethodObject<T>,
    LendingControllerViews,
    LendingControllerOnChainViews,
    lendingControllerStorageType>;


export const setLendingControllerLambdas = async (tezosToolkit: TezosToolkit, contract: LendingControllerContractAbstraction) => {

    const lambdasPerBatch = 8;

    const lambdasCount = lendingControllerLambdas.length;
    const batchesCount = Math.ceil(lambdasCount / lambdasPerBatch);

    for(let i = 0; i < batchesCount; i++) {
    
        const batch = tezosToolkit.wallet.batch();

        lendingControllerLambdaIndex.forEach(({index, name}: { index : number, name : string }) => {  

            if(index < (lambdasPerBatch * (i + 1)) && (index >= lambdasPerBatch * i)){
                batch.withContractCall(contract.methods.setLambda(name, lendingControllerLambdas[index]))
            }

        });

        const setupLendingControllerLambdasOperation = await batch.send()
        await confirmOperation(tezosToolkit, setupLendingControllerLambdasOperation.opHash);

    }
};


export class LendingController {
    contract: LendingControllerContractAbstraction;
    storage: lendingControllerStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: LendingControllerContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        lendingControllerContractAddress: string,
        tezos: TezosToolkit
    ): Promise<LendingController> {
        return new LendingController(
            await tezos.contract.at(lendingControllerContractAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: lendingControllerStorageType
    ): Promise<LendingController> {       

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/lendingController.json`).toString()
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
    
        return new LendingController(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

  }
  