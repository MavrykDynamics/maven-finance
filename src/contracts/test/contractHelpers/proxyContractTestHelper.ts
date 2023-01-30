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

import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";
import {BigNumber} from "bignumber.js";

// type proxyContractStorageType = {
//     admin : string;
// }

type proxyContractStorageType = string

type ProxyContractMethods<T extends ContractProvider | Wallet> = {
    dataPackingHelper: (any) => ContractMethod<T>;
};

type ProxyContractMethodObject<T extends ContractProvider | Wallet> =
    Record<proxyContractStorageType, (...args: any[]) => ContractMethodObject<T>>;

type ProxyContractViews = Record<proxyContractStorageType, (...args: any[]) => ContractView>;

type ProxyContractOnChainViews = {
    decimals: () => OnChainView;
};

export type ProxyContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    ProxyContractMethods<T>,
    ProxyContractMethodObject<T>,
    ProxyContractViews,
    ProxyContractOnChainViews,
    proxyContractStorageType>;



export class ProxyContract {
    contract: ProxyContractAbstraction;
    storage: proxyContractStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: ProxyContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        proxyContractAddress : proxyContractStorageType,
        tezos: TezosToolkit
    ): Promise<ProxyContract> {
        return new ProxyContract(
            await tezos.contract.at(proxyContractAddress),
            tezos
        );
    }

    static async originate(
        contractName : string,
        tezos: TezosToolkit,
        storage: proxyContractStorageType
    ): Promise<ProxyContract> {      

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/${contractName}.json`).toString()
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
    
        return new ProxyContract(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

  }
