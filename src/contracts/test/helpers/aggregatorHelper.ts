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
import {aggregatorStorageType} from "../types/aggregatorStorageType";

import aggregatorLambdaIndex
    from '../../../contracts/contracts/partials/contractLambdas/aggregator/aggregatorLambdaIndex.json';
import aggregatorLambdas from "../../build/lambdas/aggregatorLambdas.json";
import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";

type AggregatorContractMethods<T extends ContractProvider | Wallet> = {
    setLambda: (number, string) => ContractMethod<T>;
};

type AggregatorContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type AggregatorViews = Record<string, (...args: any[]) => ContractView>;

type AggregatorOnChainViews = {
    decimals: () => OnChainView;
};

type AggregatorContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    AggregatorContractMethods<T>,
    AggregatorContractMethodObject<T>,
    AggregatorViews,
    AggregatorOnChainViews,
    aggregatorStorageType>;


export const setAggregatorLambdas = async (tezosToolkit: TezosToolkit, contract: AggregatorContractAbstraction) => {
    const batch = tezosToolkit.wallet
        .batch();

    aggregatorLambdaIndex.forEach(({index, name}: { index: number, name: string }) => {
        batch.withContractCall(contract.methods.setLambda(name, aggregatorLambdas[index]))

    });

    const setupAggregatorLambdasOperation = await batch.send()
    await setupAggregatorLambdasOperation.confirmation()
};

export class Aggregator {
    contract: AggregatorContractAbstraction;
    storage: aggregatorStorageType;
    tezos: TezosToolkit;

    constructor(contract: AggregatorContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }

    static async init(
        aggregatorContractAddress: string,
        tezos: TezosToolkit
    ): Promise<Aggregator> {
        return new Aggregator(
            await tezos.contract.at(aggregatorContractAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: aggregatorStorageType
    ): Promise<Aggregator> {

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/aggregator.json`).toString()
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

        return new Aggregator(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

}
