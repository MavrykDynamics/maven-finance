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
import { doormanStorageType } from "../types/doormanStorageType";

import doormanLambdas from "../../build/lambdas/doormanLambdas.json";
import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";
import {BigNumber} from "bignumber.js";

type DoormanContractMethods<T extends ContractProvider | Wallet> = {
    setLambda: (number, string) => ContractMethod<T>;
    updateWhitelistContracts: (
        whitelistContractName     : string,
        whitelistContractAddress  : string
    ) => ContractMethod<T>;
    updateGeneralContracts: (
        generalContractName       : string,
        generalContractAddress    : string
    ) => ContractMethod<T>;
    stake: (
        amount                    : BigNumber
    ) => ContractMethod<T>;
};

type DoormanContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type DoormanViews = Record<string, (...args: any[]) => ContractView>;

type DoormanOnChainViews = {
    decimals: () => OnChainView;
};

export type DoormanContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    DoormanContractMethods<T>,
    DoormanContractMethodObject<T>,
    DoormanViews,
    DoormanOnChainViews,
    doormanStorageType>;


export const setDoormanLambdas = async (tezosToolkit: TezosToolkit, contract: DoormanContractAbstraction) => {
    
    const lambdasPerBatch = 7;

    const lambdasCount = Object.keys(doormanLambdas).length;
    const batchesCount = Math.ceil(lambdasCount / lambdasPerBatch);

    for(let i = 0; i < batchesCount; i++) {
    
        const batch = tezosToolkit.wallet.batch();
        var index   = 0

        for (let lambdaName in doormanLambdas) {
            let bytes   = doormanLambdas[lambdaName]
            if(index < (lambdasPerBatch * (i + 1)) && (index >= lambdasPerBatch * i)){
                batch.withContractCall(contract.methods.setLambda(lambdaName, bytes))
            }
            index++;
        }

        const setupDoormanLambdasOperation = await batch.send()
        await confirmOperation(tezosToolkit, setupDoormanLambdasOperation.opHash);

    }
};

export class Doorman {
    contract: DoormanContractAbstraction;
    storage: doormanStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: DoormanContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        doormanAddress : string,
        tezos: TezosToolkit
    ): Promise<Doorman> {
        return new Doorman(
            await tezos.contract.at(doormanAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: doormanStorageType
    ): Promise<Doorman> {      

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/doorman.json`).toString()
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
    
        return new Doorman(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

  }
