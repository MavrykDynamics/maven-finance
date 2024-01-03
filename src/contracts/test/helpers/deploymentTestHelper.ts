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

// Contracts Storage Type
import { governanceStorageType }                from "../../storage/storageTypes/governanceStorageType"
import { governanceProxyStorageType }           from "../../storage/storageTypes/governanceProxyStorageType"
import { governanceFinancialStorageType }       from "../../storage/storageTypes/governanceFinancialStorageType"
import { governanceSatelliteStorageType }       from "../../storage/storageTypes/governanceSatelliteStorageType"
import { doormanStorageType }                   from "../../storage/storageTypes/doormanStorageType"
import { delegationStorageType }                from "../../storage/storageTypes/delegationStorageType"
import { emergencyGovernanceStorageType }       from "../../storage/storageTypes/emergencyGovernanceStorageType"
import { vestingStorageType }                   from "../../storage/storageTypes/vestingStorageType"
import { councilStorageType }                   from "../../storage/storageTypes/councilStorageType"
import { breakGlassStorageType }                from "../../storage/storageTypes/breakGlassStorageType"
import { aggregatorStorageType }                from "../../storage/storageTypes/aggregatorStorageType"
import { aggregatorFactoryStorageType }         from "../../storage/storageTypes/aggregatorFactoryStorageType"
import { farmStorageType }                      from "../../storage/storageTypes/farmStorageType"
import { farmMTokenStorageType }                from "../../storage/storageTypes/farmMTokenStorageType"
import { farmFactoryStorageType }               from "../../storage/storageTypes/farmFactoryStorageType"
import { treasuryStorageType }                  from "../../storage/storageTypes/treasuryStorageType"
import { treasuryFactoryStorageType }           from "../../storage/storageTypes/treasuryFactoryStorageType"
import { vaultStorageType }                     from "../../storage/storageTypes/vaultStorageType"
import { vaultFactoryStorageType }              from "../../storage/storageTypes/vaultFactoryStorageType"
import { lendingControllerStorageType }         from "../../storage/storageTypes/lendingControllerStorageType"
import { lendingControllerMockTimeStorageType } from "../../storage/storageTypes/lendingControllerMockTimeStorageType"
import { mvnFaucetStorageType }                 from "../../storage/storageTypes/mvnFaucetStorageType"

// Token Storage Type
import { mvnTokenStorageType }                  from "../../storage/storageTypes/mvnTokenStorageType"
import { mavenFa2TokenStorageType }            from "../../storage/storageTypes/mavenFa2TokenStorageType";
import { mavenFa12TokenStorageType }           from "../../storage/storageTypes/mavenFa12TokenStorageType";
import { mTokenStorageType }                    from "../../storage/storageTypes/mTokenStorageType";

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
import farmMTokenLambdas                        from "../../build/lambdas/farmMTokenLambdas.json"
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
    "farmMToken"                : farmMTokenLambdas,
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
    farmMTokenStorageType | 
    farmFactoryStorageType |
    treasuryStorageType | 
    treasuryFactoryStorageType |
    vaultStorageType | 
    vaultFactoryStorageType |
    lendingControllerStorageType | 
    lendingControllerMockTimeStorageType |
    mvnFaucetStorageType |
    
    // tokens
    mvnTokenStorageType | 
    mavenFa12TokenStorageType | 
    mavenFa2TokenStorageType | 
    mTokenStorageType    


// for Farm Factory -> farm product lambdas
type farmTypeType = "farm" | "mFarm"

type GeneralContractContractMethods<T extends ContractProvider | Wallet> = {
    setLambda: (lambdaName: string, lambdaBytes: string) => ContractMethod<T>;
    setProductLambda: (lambdaName: string, lambdaBytes: string, type?: farmTypeType)  => ContractMethod<T>;
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


export const setGeneralContractLambdas = async (tezosToolkit: TezosToolkit, contractName : string, contract: GeneralContractAbstraction, consoleLogBool = true ? true : false) => {

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

    if(consoleLogBool == true){
        // console log contract name in Title Case
        const rawName = contractName.substring(0, contractName.length);
        const addSpaces = rawName.replace(/([A-Z])/g, " $1");
        const formattedContractName = addSpaces.charAt(0).toUpperCase() + addSpaces.slice(1);
        console.log(`${formattedContractName} lambdas setup`)
    }
    
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

    if(contractName == "farmFactory" || contractName == "farmFactoryMToken"){

        const farmTypeType = contractName == "farmFactory" ? "farm" : "mFarm";

        for(let i = 0; i < batchesCount; i++) {
        
            const batch = tezosToolkit.wallet.batch();
            var index   = 0;
    
            for (let lambdaName in lambdas) {
                let bytes   = lambdas[lambdaName]
                if(index < (lambdasPerBatch * (i + 1)) && (index >= lambdasPerBatch * i)){
                    batch.withContractCall(contract.methods.setProductLambda(lambdaName, bytes, farmTypeType))
                }
                index++;
            }
    
            const setupGeneralContractLambdasOperation = await batch.send()
            await confirmOperation(tezosToolkit, setupGeneralContractLambdasOperation.opHash);
        }

    } else {

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
            "mTokenEurt",
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

        const operation : OriginationOperation = await tezos.contract
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
  