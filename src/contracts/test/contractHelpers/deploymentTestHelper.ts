import {
    ContractAbstraction,
    ContractMethod,
    ContractMethodObject,
    ContractProvider,
    ContractView,
    OriginationOperation,
    TezosToolkit,
    Wallet
} from "@taquito/taquito"
import fs from "fs"

import env from "../../env"
import { confirmOperation } from "../../scripts/confirmation"
import { OnChainView } from "@taquito/taquito/dist/types/contract/contract-methods/contract-on-chain-view"


// import { doormanStorage }                       from "../../storage/doormanStorage"
// import { governanceStorage }                    from "../../storage/governanceStorage"
// import { delegationStorage }                    from "../../storage/delegationStorage"
// import { aggregatorStorage }                    from "../../storage/aggregatorStorage"
// import { vestingStorage }                       from "../../storage/vestingStorage"
// import { farmStorage }                          from "../../storage/farmStorage"
// import { emergencyGovernanceStorage }           from "../../storage/emergencyGovernanceStorage"

// Contracts Storage Type
import { governanceStorageType }                from "../types/governanceStorageType"
import { governanceProxyStorageType }           from "../types/governanceProxyStorageType"
import { governanceFinancialStorageType }       from "../types/governanceFinancialStorageType"
import { governanceSatelliteStorageType }       from "../types/governanceSatelliteStorageType"
import { doormanStorageType }                   from "../types/doormanStorageType"
import { delegationStorageType }                from "../types/delegationStorageType"
import { emergencyGovernanceStorageType }       from "../types/emergencyGovernanceStorageType"
import { vestingStorageType }                   from "../types/vestingStorageType"
import { councilStorageType }                   from "../types/councilStorageType"
import { breakGlassStorageType }                from "../types/breakGlassStorageType"
import { aggregatorStorageType }                from "../types/aggregatorStorageType"
import { aggregatorFactoryStorageType }         from "../types/aggregatorFactoryStorageType"
import { farmStorageType }                      from "../types/farmStorageType"
import { farmFactoryStorageType }               from "../types/farmFactoryStorageType"
import { treasuryStorageType }                  from "../types/treasuryStorageType"
import { treasuryFactoryStorageType }           from "../types/treasuryFactoryStorageType"
import { vaultStorageType }                     from "../types/vaultStorageType"
import { vaultFactoryStorageType }              from "../types/vaultFactoryStorageType"
import { lendingControllerStorageType }         from "../types/lendingControllerStorageType"
import { lendingControllerMockTimeStorageType } from "../types/lendingControllerMockTimeStorageType"

// Token Storage Type
import { mvkTokenStorageType }                  from "../types/mvkTokenStorageType"
import { mavrykFa2TokenStorageType }            from "../types/mavrykFa2TokenStorageType";
import { mavrykFa12TokenStorageType }           from "../types/mavrykFa12TokenStorageType";
import { mTokenStorageType }                    from "../types/mTokenStorageType";

// Contract Lambdas
import governanceLambdas                        from "../../build/lambdas/governanceLambdas.json"
import governanceProxyLambdas                   from "../../build/lambdas/governanceProxyLambdas.json"
import governanceFinancialLambdas               from "../../build/lambdas/governanceFinancialLambdas.json"
import governanceSatelliteLambdas               from "../../build/lambdas/governanceSatelliteLambdas.json"
import doormanLambdas                           from "../../build/lambdas/doormanLambdas.json"
import delegationLambdas                        from "../../build/lambdas/delegationLambdas.json"
import emergencyGovernanceLambdas               from "../../build/lambdas/emergencyGovernanceLambdas.json"
import vestingLambdas                           from "../../build/lambdas/vestingLambdas.json"
import councilLambdas                           from "../../build/lambdas/councilLambdas.json"
import breakGlassLambdas                        from "../../build/lambdas/breakGlassLambdas.json"
import aggregatorLambdas                        from "../../build/lambdas/aggregatorLambdas.json"
import aggregatorFactoryLambdas                 from "../../build/lambdas/aggregatorFactoryLambdas.json"
import farmLambdas                              from "../../build/lambdas/farmLambdas.json"
import farmFactoryLambdas                       from "../../build/lambdas/farmFactoryLambdas.json"
import treasuryLambdas                          from "../../build/lambdas/treasuryLambdas.json"
import treasuryFactoryLambdas                   from "../../build/lambdas/treasuryFactoryLambdas.json"
import vaultLambdas                             from "../../build/lambdas/vaultLambdas.json"
import vaultFactoryLambdas                      from "../../build/lambdas/vaultFactoryLambdas.json"
import lendingControllerLambdas                 from "../../build/lambdas/lendingControllerLambdas.json"
import lendingControllerMockTimeLambdas         from "../../build/lambdas/lendingControllerMockTimeLambdas.json"


const generalContractLambdas = {
    "governance"                : governanceLambdas,
    "governanceProxy"           : governanceProxyLambdas,
    "governanceFinancial"       : governanceFinancialLambdas,
    "governanceSatellite"       : governanceSatelliteLambdas,
    "doorman"                   : doormanLambdas,
    "delegation"                : delegationLambdas,
    "emergencyGovernance"       : emergencyGovernanceLambdas,
    "vesting"                   : vestingLambdas,
    "council"                   : councilLambdas,
    "breakGlass"                : breakGlassLambdas,
    "aggregator"                : aggregatorLambdas,
    "aggregatorFactory"         : aggregatorFactoryLambdas,
    "farm"                      : farmLambdas,
    "farmFactory"               : farmFactoryLambdas,
    "treasury"                  : treasuryLambdas,
    "treasuryFactory"           : treasuryFactoryLambdas,
    "vault"                     : vaultLambdas,
    "vaultFactory"              : vaultFactoryLambdas,
    "lendingController"         : lendingControllerLambdas,
    "lendingControllerMockTime" : lendingControllerMockTimeLambdas
}

type generalContractStorageType = 

    // contracts
    governanceStorageType |    
    governanceProxyStorageType |    
    governanceFinancialStorageType |    
    governanceSatelliteStorageType |    
    doormanStorageType |
    delegationStorageType |
    emergencyGovernanceStorageType | 
    vestingStorageType | 
    councilStorageType | 
    breakGlassStorageType | 
    aggregatorStorageType | 
    aggregatorFactoryStorageType | 
    farmStorageType | 
    farmFactoryStorageType |
    treasuryStorageType | 
    treasuryFactoryStorageType |
    vaultStorageType | 
    vaultFactoryStorageType |
    lendingControllerStorageType | 
    lendingControllerMockTimeStorageType |
    
    // tokens
    mvkTokenStorageType | 
    mavrykFa12TokenStorageType | 
    mavrykFa2TokenStorageType | 
    mTokenStorageType    


type GeneralContractContractMethods<T extends ContractProvider | Wallet> = {
    setLambda: (number, string) => ContractMethod<T>;
    setProductLambda: (number, string) => ContractMethod<T>;
    updateWhitelistContracts: (
        whitelistContractName       : string,
        whitelistContractAddress    : string
    ) => ContractMethod<T>;
    updateGeneralContracts: (
        generalContractName         : string,
        generalContractAddress      : string
    ) => ContractMethod<T>;
};

type GeneralContractContractMethodObject<T extends ContractProvider | Wallet> =
    Record<string, (...args: any[]) => ContractMethodObject<T>>;

type GeneralContractViews = Record<string, (...args: any[]) => ContractView>;

type GeneralContractOnChainViews = {
    decimals: () => OnChainView;
};

type GeneralContractAbstraction<T extends ContractProvider | Wallet = any> = ContractAbstraction<T,
    GeneralContractContractMethods<T>,
    GeneralContractContractMethodObject<T>,
    GeneralContractViews,
    GeneralContractOnChainViews,
    generalContractStorageType>;


export const setGeneralContractLambdas = async (tezosToolkit: TezosToolkit, contractName : string, contract: GeneralContractAbstraction) => {

    var lambdasPerBatch = 10;

    // lambdas for lending controller are much larger than other contracts
    if(contractName == "lendingController" || contractName == "lendingControllerMockTime"){
        lambdasPerBatch = 4;
    }

    const lambdas = generalContractLambdas[contractName];
    const lambdasCount  = Object.keys(lambdas).length;
    const batchesCount  = Math.ceil(lambdasCount / lambdasPerBatch);

    for(let i = 0; i < batchesCount; i++) {
        
        const batch = tezosToolkit.wallet.batch();
        var index   = 0;

        for (let lambdaName in lambdas) {
            let bytes   = lambdas[lambdaName]
            if(index < (lambdasPerBatch * (i + 1)) && (index >= lambdasPerBatch * i)){
                batch.withContractCall(contract.methods.setLambda(lambdaName, bytes))
            }
            index++;
        }

        const setupGeneralContractLambdasOperation = await batch.send()
        await confirmOperation(tezosToolkit, setupGeneralContractLambdasOperation.opHash);
    }

    // console log contract name in Title Case
    const rawName = contractName.substring(0, contractName.length);
    const addSpaces = rawName.replace(/([A-Z])/g, " $1");
    const formattedContractName = addSpaces.charAt(0).toUpperCase() + addSpaces.slice(1);
    console.log(`${formattedContractName} lambdas setup`)
    
};



export const setGeneralContractProductLambdas = async (tezosToolkit: TezosToolkit, contractName : string, contract: GeneralContractAbstraction) => {

    const lambdasPerBatch = 10;

    const productLambdas : any = {
        'aggregatorFactory'     : generalContractLambdas["aggregator"],
        'farmFactory'           : generalContractLambdas["farm"],
        'farmFactoryMToken'     : generalContractLambdas["farmMToken"],
        'treasuryFactory'       : generalContractLambdas["treasury"],
        'vaultFactory'          : generalContractLambdas["vault"],
    };

    const lambdas       = productLambdas[contractName];
    const lambdasCount  = Object.keys(lambdas).length;
    const batchesCount  = Math.ceil(lambdasCount / lambdasPerBatch);

    for(let i = 0; i < batchesCount; i++) {
        
        const batch = tezosToolkit.wallet.batch();
        var index   = 0;

        for (let lambdaName in lambdas) {
            let bytes   = lambdas[lambdaName]
            if(index < (lambdasPerBatch * (i + 1)) && (index >= lambdasPerBatch * i)){
                batch.withContractCall(contract.methods.setProductLambda(lambdaName, bytes))
            }
            index++;
        }

        const setupGeneralContractLambdasOperation = await batch.send()
        await confirmOperation(tezosToolkit, setupGeneralContractLambdasOperation.opHash);
    }

    // console log contract name in Title Case
    const rawName = contractName.substring(0, contractName.length);
    const addSpaces = rawName.replace(/([A-Z])/g, " $1");
    const formattedContractName = addSpaces.charAt(0).toUpperCase() + addSpaces.slice(1);
    console.log(`${formattedContractName} product lambdas setup`)
    
};


export class GeneralContract {
    
    contract        : GeneralContractAbstraction;
    storage         : generalContractStorageType;
    contractName    : string;
    tezos           : TezosToolkit;
  
    constructor(contract: GeneralContractAbstraction, contractName : string, tezos: TezosToolkit) {
        this.contract     = contract;
        this.contractName = contractName;
        this.tezos        = tezos;
    }
  
    static async init(
        generalContractAddress: string,
        contractName : string,
        tezos: TezosToolkit
    ): Promise<GeneralContract> {
        return new GeneralContract(
            await tezos.contract.at(generalContractAddress),
            contractName,
            tezos
        );
    }

    static async originate(
        tezos: TezosToolkit,
        contractName: string,
        storage: generalContractStorageType
    ): Promise<GeneralContract> {       

        const mTokenContracts = [
            "mTokenUsdt",
            "mTokenEurl",
            "mTokenXtz",
            "mTokenTzBtc"
        ];

        // For Token MultiAsset contracts
        if(mTokenContracts.includes(contractName)){
            contractName = "mToken"
        };


        // get contract artifacts
        const artifacts: any = JSON.parse(
            fs.readFileSync(`${env.buildDir}/${contractName}.json`).toString()
        );

        // get storage from array
        // const storage = generalControllerStorage[contractName];

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
  
        return new GeneralContract(
            await tezos.contract.at(operation.contractAddress),
            contractName,
            tezos
        );
    }

}
  