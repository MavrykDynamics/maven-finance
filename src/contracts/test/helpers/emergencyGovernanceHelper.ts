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
import { emergencyGovernanceStorageType } from "../types/emergencyGovernanceStorageType";

import emergencyGovernanceLambdaIndex
    from '../../../contracts/contracts/partials/contractLambdas/emergencyGovernance/emergencyGovernanceLambdaIndex.json';
import emergencyGovernanceLambdas from "../../build/lambdas/emergencyGovernanceLambdas.json";
import {OnChainView} from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view";

type EmergencyGovernanceContractMethods<T extends ContractProvider | Wallet> = {
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

type EmergencyGovernanceContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type EmergencyGovernanceViews = Record<string, (...args: any[]) => ContractView>;

type EmergencyGovernanceOnChainViews = {
    decimals: () => OnChainView;
};

type EmergencyGovernanceContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    EmergencyGovernanceContractMethods<T>,
    EmergencyGovernanceContractMethodObject<T>,
    EmergencyGovernanceViews,
    EmergencyGovernanceOnChainViews,
    emergencyGovernanceStorageType>;


export const setEmergencyGovernanceLambdas = async (tezosToolkit: TezosToolkit, contract: EmergencyGovernanceContractAbstraction) => {
    const batch = tezosToolkit.wallet
        .batch();

    emergencyGovernanceLambdaIndex.forEach(({index, name}: { index: number, name: string }) => {
        batch.withContractCall(contract.methods.setLambda(name, emergencyGovernanceLambdas[index]))
    });

    const setupEmergencyGovernanceLambdasOperation = await batch.send()
    await confirmOperation(tezosToolkit, setupEmergencyGovernanceLambdasOperation.opHash);
};


export class EmergencyGovernance {
    contract: EmergencyGovernanceContractAbstraction;
    storage: emergencyGovernanceStorageType;
    tezos: TezosToolkit;
  
    constructor(contract: EmergencyGovernanceContractAbstraction, tezos: TezosToolkit) {
        this.contract = contract;
        this.tezos = tezos;
    }
  
    static async init(
        emergencyGovernanceContractAddress: string,
        tezos: TezosToolkit
    ): Promise<EmergencyGovernance> {
        return new EmergencyGovernance(
            await tezos.contract.at(emergencyGovernanceContractAddress),
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        storage: emergencyGovernanceStorageType
    ): Promise<EmergencyGovernance> {       

        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/emergencyGovernance.json`).toString()
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
    
        return new EmergencyGovernance(
            await tezos.contract.at(operation.contractAddress),
            tezos
        );
    }

  }
