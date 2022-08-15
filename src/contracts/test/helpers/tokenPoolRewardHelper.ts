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

// import treasuryLambdaIndex
//     from '../../../contracts/contracts/partials/contractLambdas/treasury/treasuryLambdaIndex.json';
// import treasuryLambdas from "../../build/lambdas/treasuryLambdas.json";
import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";
import {BigNumber} from "bignumber.js";


type TokenPoolRewardContractMethods<T extends ContractProvider | Wallet> = {
    
};


type TokenPoolRewardContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type TokenPoolRewardViews = Record<string, (...args: any[]) => ContractView>;

type TokenPoolRewardOnChainViews = {
    decimals: () => OnChainView;
};

type TokenPoolRewardContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    TokenPoolRewardContractMethods<T>,
    TokenPoolRewardContractMethodObject<T>,
    TokenPoolRewardViews,
    TokenPoolRewardOnChainViews,
    tokenPoolRewardStorageType>;


// export const setTokenPoolRewardLambdas = async (tezosToolkit: TezosToolkit, contract: TokenPoolRewardContractAbstraction) => {
//     const batch = tezosToolkit.wallet
//         .batch();

//         tokenPoolRewardLambdaIndex.forEach(({index, name}: { index: number, name: string }) => {
//         batch.withContractCall(contract.methods.setLambda(name, tokenPoolRewardLambdas[index]))
//     });

//     const setupTokenPoolRewardLambdasOperation = await batch.send()
//     await confirmOperation(tezosToolkit, setupTokenPoolRewardLambdasOperation.opHash);
// };

export class TokenPoolReward {
    contract: TokenPoolRewardContractAbstraction;
    storage: tokenPoolRewardStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: TokenPoolRewardContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        treasuryAddress: string,
        tezos: TezosToolkit
    ): Promise<TokenPoolReward> {
        return new TokenPoolReward(
            await tezos.contract.at(treasuryAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: tokenPoolRewardStorageType
    ): Promise<TokenPoolReward> {      

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/tokenPoolReward.json`).toString()
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
    
        return new TokenPoolReward(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

  }
