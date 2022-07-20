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
import { vaultControllerStorageType } from "../types/vaultControllerStorageType";

import vaultControllerLambdaIndex
    from '../../../contracts/contracts/partials/contractLambdas/vaultController/vaultControllerLambdaIndex.json';
import vaultControllerLambdas from "../../build/lambdas/vaultControllerLambdas.json";
import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";

type VaultControllerContractMethods<T extends ContractProvider | Wallet> = {
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

type VaultControllerContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type VaultControllerViews = Record<string, (...args: any[]) => ContractView>;

type VaultControllerOnChainViews = {
    decimals: () => OnChainView;
};

type VaultControllerContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    VaultControllerContractMethods<T>,
    VaultControllerContractMethodObject<T>,
    VaultControllerViews,
    VaultControllerOnChainViews,
    vaultControllerStorageType>;


export const setVaultControllerLambdas = async (tezosToolkit: TezosToolkit, contract: VaultControllerContractAbstraction) => {
  const batch = tezosToolkit.wallet
      .batch();

    vaultControllerLambdaIndex.forEach(({index, name}: { index: number, name: string }) => {
        batch.withContractCall(contract.methods.setLambda(name, vaultControllerLambdas[index]))
    });

    const setupVaultControllerLambdasOperation = await batch.send()
    await confirmOperation(tezosToolkit, setupVaultControllerLambdasOperation.opHash);
};

export class VaultController {
    contract: VaultControllerContractAbstraction;
    storage: vaultControllerStorageType;
    tezos: TezosToolkit;

    constructor(contract: VaultControllerContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }

    static async init(
        vaultControllerContractAddress: string,
        tezos: TezosToolkit
    ): Promise<VaultController> {
        return new VaultController(
            await tezos.contract.at(vaultControllerContractAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: vaultControllerStorageType
    ): Promise<VaultController> {       

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/vaultController.json`).toString()
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

        return new VaultController(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

}
