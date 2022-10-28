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
import { delegationStorageType } from "../types/delegationStorageType";

import delegationLambdas from "../../build/lambdas/delegationLambdas.json";
import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";
import {BigNumber} from "bignumber.js";

type DelegationContractMethods<T extends ContractProvider | Wallet> = {
    setLambda: (number, string) => ContractMethod<T>;
    updateWhitelistContracts: (
        whitelistContractName     : string,
        whitelistContractAddress  : string
    ) => ContractMethod<T>;
    updateGeneralContracts: (
        generalContractName       : string,
        generalContractAddress    : string
    ) => ContractMethod<T>;
    registerAsSatellite: (
        name                      : string,
        description               : string,
        image                     : string,
        website                   : string,
        satelliteFee              : BigNumber
    ) => ContractMethod<T>;
};

type DelegationContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type DelegationViews = Record<string, (...args: any[]) => ContractView>;

type DelegationOnChainViews = {
    decimals: () => OnChainView;
};

export type DelegationContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    DelegationContractMethods<T>,
    DelegationContractMethodObject<T>,
    DelegationViews,
    DelegationOnChainViews,
    delegationStorageType>;


export const setDelegationLambdas = async (tezosToolkit: TezosToolkit, contract: DelegationContractAbstraction) => {
    const batch = tezosToolkit.wallet
        .batch();

    for (let lambdaName in delegationLambdas) {
        let bytes   = delegationLambdas[lambdaName]
        batch.withContractCall(contract.methods.setLambda(lambdaName, bytes))
    }

    const setupDelegationLambdasOperation = await batch.send()
    await confirmOperation(tezosToolkit, setupDelegationLambdasOperation.opHash);
};

export class Delegation {
    contract: DelegationContractAbstraction;
    storage: delegationStorageType;
    tezos: TezosToolkit;

    constructor(contract: DelegationContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }

    static async init(
        delegationContractAddress: string,
        tezos: TezosToolkit
    ): Promise<Delegation> {
        return new Delegation(
            await tezos.contract.at(delegationContractAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: delegationStorageType
    ): Promise<Delegation> {

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/delegation.json`).toString()
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

        return new Delegation(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

  }
