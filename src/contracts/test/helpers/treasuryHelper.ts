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
import { treasuryStorageType } from "../types/treasuryStorageType";

import treasuryLambdaIndex
    from '../../../contracts/contracts/partials/contractLambdas/treasury/treasuryLambdaIndex.json';
import treasuryLambdas from "../../build/lambdas/treasuryLambdas.json";
import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";
import {BigNumber} from "bignumber.js";


type TreasuryContractMethods<T extends ContractProvider | Wallet> = {
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
    updateMvkOperators: (
        updateOperators:  [
            update_operators : {
                add_operator : {
                    owner : string,
                    operator : string,
                    token_id: Number
                } 
            }
        ]
    ) => ContractMethod<T>;
};


type TreasuryContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type TreasuryViews = Record<string, (...args: any[]) => ContractView>;

type TreasuryOnChainViews = {
    decimals: () => OnChainView;
};

export type TreasuryContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    TreasuryContractMethods<T>,
    TreasuryContractMethodObject<T>,
    TreasuryViews,
    TreasuryOnChainViews,
    treasuryStorageType>;


export const setTreasuryLambdas = async (tezosToolkit: TezosToolkit, contract: TreasuryContractAbstraction) => {
    const batch = tezosToolkit.wallet
        .batch();

    treasuryLambdaIndex.forEach(({index, name}: { index: number, name: string }) => {
        batch.withContractCall(contract.methods.setLambda(name, treasuryLambdas[index]))
    });

    const setupTreasuryLambdasOperation = await batch.send()
    await confirmOperation(tezosToolkit, setupTreasuryLambdasOperation.opHash);
};

export class Treasury {
    contract: TreasuryContractAbstraction;
    storage: treasuryStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: TreasuryContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        treasuryAddress: string,
        tezos: TezosToolkit
    ): Promise<Treasury> {
        return new Treasury(
            await tezos.contract.at(treasuryAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: treasuryStorageType
    ): Promise<Treasury> {      

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/treasury.json`).toString()
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
    
        return new Treasury(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

  }
