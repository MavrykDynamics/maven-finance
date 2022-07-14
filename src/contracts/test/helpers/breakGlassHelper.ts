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
import { breakGlassStorageType } from "../types/breakGlassStorageType";

import breakGlassLambdaIndex
    from '../../../contracts/contracts/partials/contractLambdas/breakGlass/breakGlassLambdaIndex.json';
import breakGlassLambdas from "../../build/lambdas/breakGlassLambdas.json";
import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";

type BreakGlassContractMethods<T extends ContractProvider | Wallet> = {
    setLambda: (number, string) => ContractMethod<T>;
    updateWhitelistContracts: (
        whitelistContractName     : string,
        whitelistContractAddress  : string
    ) => ContractMethod<T>;
    updateGeneralContracts: (
        generalContractName       : string,
        generalContractAddress    : string
    ) => ContractMethod<T>;
};

type BreakGlassContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type BreakGlassViews = Record<string, (...args: any[]) => ContractView>;

type BreakGlassOnChainViews = {
    decimals: () => OnChainView;
};

type BreakGlassContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    BreakGlassContractMethods<T>,
    BreakGlassContractMethodObject<T>,
    BreakGlassViews,
    BreakGlassOnChainViews,
    breakGlassStorageType>;


export const setBreakGlassLambdas = async (tezosToolkit: TezosToolkit, contract: BreakGlassContractAbstraction) => {
    const batch = tezosToolkit.wallet
        .batch();

    breakGlassLambdaIndex.forEach(({index, name}: { index: number, name: string }) => {
        batch.withContractCall(contract.methods.setLambda(name, breakGlassLambdas[index]))
    });

    const setupBreakGlassLambdasOperation = await batch.send()
    await confirmOperation(tezosToolkit, setupBreakGlassLambdasOperation.opHash);
};

export class BreakGlass {
    contract: BreakGlassContractAbstraction;
    storage: breakGlassStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: BreakGlassContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        breakGlassContractAddress: string,
        tezos: TezosToolkit
    ): Promise<BreakGlass> {
        return new BreakGlass(
            await tezos.contract.at(breakGlassContractAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: breakGlassStorageType
    ): Promise<BreakGlass> {       

        const artifacts: any = JSON.parse(
                fs.readFileSync(`${env.buildDir}/breakGlass.json`).toString()
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
  
        return new BreakGlass(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

  }
