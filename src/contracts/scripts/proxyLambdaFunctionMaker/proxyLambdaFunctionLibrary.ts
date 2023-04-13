import { addOperator, createCollateralToken, createLoanToken, fa12, fa2, oracleInformation, removeOperator, transferItem, updateCollateralToken, updateLoanToken } from './proxyLambdaFunctionInterface'

const proxyContract = (

    lambdaFunction: string

) => {
    return `// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../../contracts/partials/errors.ligo"

// Shared Types
#include "../../contracts/partials/shared/sharedTypes.ligo"

// Transfer Helpers
#include "../../contracts/partials/shared/transferHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Doorman types
#include "../../contracts/partials/contractTypes/doormanTypes.ligo"

// Delegation Types
#include "../../contracts/partials/contractTypes/delegationTypes.ligo"

// Farm types
#include "../../contracts/partials/contractTypes/farmTypes.ligo"

// FarmFactory Types
#include "../../contracts/partials/contractTypes/farmFactoryTypes.ligo"

// Treasury Type
#include "../../contracts/partials/contractTypes/treasuryTypes.ligo"

// TreasuryFactory Type
#include "../../contracts/partials/contractTypes/treasuryFactoryTypes.ligo"

// Aggregator Types
#include "../../contracts/partials/contractTypes/aggregatorTypes.ligo"

// Aggregator Factory Types
#include "../../contracts/partials/contractTypes/aggregatorFactoryTypes.ligo"

// Vestee Types
#include "../../contracts/partials/contractTypes/vestingTypes.ligo"

// Vault Types 
#include "../../contracts/partials/contractTypes/vaultTypes.ligo"

// Lending Controller Types
#include "../../contracts/partials/contractTypes/lendingControllerTypes.ligo"

// Governance Types
#include "../../contracts/partials/contractTypes/governanceTypes.ligo"

// Council Types
#include "../../contracts/partials/contractTypes/councilTypes.ligo"

// Emergency Governance Types
#include "../../contracts/partials/contractTypes/emergencyGovernanceTypes.ligo"

// BreakGlass Types
#include "../../contracts/partials/contractTypes/breakGlassTypes.ligo"

// Governance Financial Types
#include "../../contracts/partials/contractTypes/governanceFinancialTypes.ligo"

// Governance Satellite Types
#include "../../contracts/partials/contractTypes/governanceSatelliteTypes.ligo"

// Vault Factory Types
#include "../../contracts/partials/contractTypes/vaultFactoryTypes.ligo"

type actionType is 
        // Default Entrypoint to Receive Tez
        Default                       of unit
    |   Empty                         of unit

const noOperations : list (operation) = nil;
type return is list (operation) * unit;

(* lamdda function *)
${lambdaFunction}

(* main entrypoint *)
function main (const action : actionType; const s : unit) : return is

    case action of [

            // Housekeeping Entrypoints
            Default (_parameters)                -> (lambdaFunction(), s)
        |   Empty (_parameters)                  -> ((nil : list(operation)), s)

    ]

;`;
}

const setAdmin  = (

    targetContract: string,
    newAdminAddress: string

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        ("${newAdminAddress}": address),
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%setAdmin",
            ("${targetContract}": address)) : option(contract(address))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(address))
        ]
    );
} with list[contractOperation]`
};

const setGovernance  = (

    targetContract: string,
    newGovernanceAddress: string

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        ("${newGovernanceAddress}" : address),
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%setGovernance",
            ("${targetContract}" : address)) : option(contract(address))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(address))
        ]
    );
} with list[contractOperation]`
};

const setName  = (

    targetContract: string,
    newName: string

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        ("${newName}" : string),
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%setName",
            ("${targetContract}" : address)) : option(contract(string))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(string))
        ]
    );
} with list[contractOperation]`
};

const setLambda  = (

    targetContract: string,
    lambdaName: string,
    lambdaBytes: string

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record[
            name=("${lambdaName}" : string);
            func_bytes=("${lambdaBytes}": bytes)
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%setLambda",
            ("${targetContract}" : address)) : option(contract(setLambdaType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(setLambdaType))
        ]
    );
} with list[contractOperation]`
};

const setProductLambda  = (

    targetContract: string,
    lambdaName: string,
    lambdaBytes: string

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record[
            name=("${lambdaName}" : string);
            func_bytes=("${lambdaBytes}": bytes)
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%setProductLambda",
            ("${targetContract}" : address)) : option(contract(setLambdaType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(setLambdaType))
        ]
    );
} with list[contractOperation]`
};

const updateMetadata  = (

    targetContract: string,
    metadataKey: string,
    metadataHash: string

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record[
            metadataKey=("${metadataKey}" : string);
            metadataHash=("${metadataHash}": bytes)
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%updateMetadata",
            ("${targetContract}" : address)) : option(contract(updateMetadataType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(updateMetadataType))
        ]
    );
} with list[contractOperation]`
};

const updateWhitelistContracts  = (

    targetContract: string,
    whitelistContractName: string,
    whitelistContractAddress: string,
    updateType: "Update" | "Remove"

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record [
            whitelistContractName     = "${whitelistContractName}";
            whitelistContractAddress  = ("${whitelistContractAddress}" : address);
            updateType                = (${updateType} : updateType);
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%updateWhitelistContracts",
            ("${targetContract}" : address)) : option(contract(updateWhitelistContractsType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(updateWhitelistContractsType))
        ]
    );
} with list[contractOperation]`
};

const updateGeneralContracts  = (

    targetContract: string,
    generalContractName: string,
    generalContractAddress: string,
    updateType: "Update" | "Remove"

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record [
            generalContractName     = "${generalContractName}";
            generalContractAddress  = ("${generalContractAddress}" : address);
            updateType              = (${updateType} : updateType);
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%updateGeneralContracts",
            ("${targetContract}" : address)) : option(contract(updateGeneralContractsType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(updateGeneralContractsType))
        ]
    );
} with list[contractOperation]`
};

const updateWhitelistTokenContracts  = (

    targetContract: string,
    tokenContractName: string,
    tokenContractAddress: string,
    updateType: "Update" | "Remove"

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record [
            tokenContractName     = "${tokenContractName}";
            tokenContractAddress  = ("${tokenContractAddress}" : address);
            updateType            = (${updateType} : updateType);
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%updateWhitelistTokenContracts",
            ("${targetContract}" : address)) : option(contract(updateWhitelistTokenContractsType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(updateWhitelistTokenContractsType))
        ]
    );
} with list[contractOperation]`
};

const updateConfig  = (

    targetContract: string,
    targetContractType: "aggregator" | "aggregatorFactory" | "breakGlass" | "council" | "delegation" | "doorman" | "emergencyGovernance" | "farm" | "farmFactory" | "governance" | "governanceFinancial" | "governanceSatellite" | "lendingController" | "treasuryFactory" | "vaultFactory",
    updateConfigAction: string,
    updateConfigNewValue: number

) => {

    // Generate the ligo return type based on the chosen contract
    var ligoReturnType: string
    var ligoConfigActionType: string
    switch(targetContractType){
        case "aggregator":
            ligoReturnType          = "aggregatorUpdateConfigParamsType"
            ligoConfigActionType    = "aggregatorUpdateConfigActionType"
            break;
        case "aggregatorFactory":
            ligoReturnType          = "aggregatorFactoryUpdateConfigParamsType"
            ligoConfigActionType    = "aggregatorFactoryUpdateConfigActionType"
            break;
        case "breakGlass":
            ligoReturnType          = "breakGlassUpdateConfigParamsType"
            ligoConfigActionType    = "breakGlassUpdateConfigActionType"
            break;
        case "council":
            ligoReturnType          = "councilUpdateConfigParamsType"
            ligoConfigActionType    = "councilUpdateConfigActionType"
            break;
        case "delegation":
            ligoReturnType          = "delegationUpdateConfigParamsType"
            ligoConfigActionType    = "delegationUpdateConfigActionType"
            break;
        case "doorman":
            ligoReturnType          = "doormanUpdateConfigParamsType"
            ligoConfigActionType    = "doormanUpdateConfigActionType"
            break;
        case "emergencyGovernance":
            ligoReturnType          = "emergencyUpdateConfigParamsType"
            ligoConfigActionType    = "emergencyUpdateConfigActionType"
            break;
        case "farm":
            ligoReturnType          = "farmUpdateConfigParamsType"
            ligoConfigActionType    = "farmUpdateConfigActionType"
            break;
        case "farmFactory":
            ligoReturnType          = "farmFactoryUpdateConfigParamsType"
            ligoConfigActionType    = "farmFactoryUpdateConfigActionType"
            break;
        case "governance":
            ligoReturnType          = "governanceUpdateConfigParamsType"
            ligoConfigActionType    = "governanceUpdateConfigActionType"
            break;
        case "governanceFinancial":
            ligoReturnType          = "governanceFinancialUpdateConfigParamsType"
            ligoConfigActionType    = "governanceFinancialUpdateConfigActionType"
            break;
        case "governanceSatellite":
            ligoReturnType          = "governanceSatelliteUpdateConfigParamsType"
            ligoConfigActionType    = "governanceSatelliteUpdateConfigActionType"
            break;
        case "lendingController":
            ligoReturnType          = "lendingControllerUpdateConfigParamsType"
            ligoConfigActionType    = "lendingControllerUpdateConfigActionType"
            break;
        case "treasuryFactory":
            ligoReturnType          = "treasuryFactoryUpdateConfigParamsType"
            ligoConfigActionType    = "treasuryFactoryUpdateConfigActionType"
            break;
        case "vaultFactory":
            ligoReturnType          = "vaultFactoryUpdateConfigParamsType"
            ligoConfigActionType    = "vaultFactoryUpdateConfigActionType"
            break;
    }

    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record [
            updateConfigNewValue    = ${updateConfigNewValue}n; 
            updateConfigAction      = (${updateConfigAction}: ${ligoConfigActionType})
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%updateConfig",
            ("${targetContract}" : address)) : option(contract(${ligoReturnType}))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(${ligoReturnType}))
        ]
    );
} with list[contractOperation]`
};

const pauseAll  = (

    targetContract: string

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        unit,
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%pauseAll",
            ("${targetContract}" : address)) : option(contract(unit))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(unit))
        ]
    );
} with list[contractOperation]`
};

const unpauseAll  = (

    targetContract: string

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        unit,
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%unpauseAll",
            ("${targetContract}" : address)) : option(contract(unit))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(unit))
        ]
    );
} with list[contractOperation]`
};

const togglePauseEntrypoint  = (

    targetContract: string,
    targetContractType: "aggregator" | "aggregatorFactory" | "delegation" | "doorman" | "farm" | "farmFactory" | "lendingController" | "treasury" | "treasuryFactory" | "vaultFactory",
    targetEntrypoint: string,
    pause: boolean

) => {

    // Generate the ligo return type based on the chosen contract
    var ligoReturnType: string
    var ligoPausableEntrypointType: string
    switch(targetContractType){
        case "aggregator":
            ligoReturnType              = "aggregatorTogglePauseEntrypointType"
            ligoPausableEntrypointType  = "aggregatorPausableEntrypointType"
            break;
        case "aggregatorFactory":
            ligoReturnType              = "aggregatorFactoryTogglePauseEntrypointType"
            ligoPausableEntrypointType  = "aggregatorFactoryPausableEntrypointType"
            break;
        case "delegation":
            ligoReturnType              = "delegationTogglePauseEntrypointType"
            ligoPausableEntrypointType  = "delegationPausableEntrypointType"
            break;
        case "doorman":
            ligoReturnType              = "doormanTogglePauseEntrypointType"
            ligoPausableEntrypointType  = "doormanPausableEntrypointType"
            break;
        case "farm":
            ligoReturnType              = "farmTogglePauseEntrypointType"
            ligoPausableEntrypointType  = "farmPausableEntrypointType"
            break;
        case "farmFactory":
            ligoReturnType              = "farmFactoryTogglePauseEntrypointType"
            ligoPausableEntrypointType  = "farmFactoryPausableEntrypointType"
            break;
        case "lendingController":
            ligoReturnType              = "lendingControllerTogglePauseEntrypointType"
            ligoPausableEntrypointType  = "lendingControllerPausableEntrypointType"
            break;
        case "treasury":
            ligoReturnType              = "treasuryTogglePauseEntrypointType"
            ligoPausableEntrypointType  = "treasuryPausableEntrypointType"
            break;
        case "treasuryFactory":
            ligoReturnType              = "treasuryFactoryTogglePauseEntrypointType"
            ligoPausableEntrypointType  = "treasuryFactoryPausableEntrypointType"
            break;
        case "vaultFactory":
            ligoReturnType              = "vaultFactoryTogglePauseEntrypointType"
            ligoPausableEntrypointType  = "vaultFactoryPausableEntrypointType"
            break;
    }

    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record [
            targetEntrypoint  = (${targetEntrypoint}(${pause ? "True" : "False"}): ${ligoPausableEntrypointType});
            empty             = Unit;
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%togglePauseEntrypoint",
            ("${targetContract}" : address)) : option(contract(${ligoReturnType}))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(${ligoReturnType}))
        ]
    );
} with list[contractOperation]`
};

const updateWhitelistDevelopers  = (

    targetContract: string,
    whitelistedDeveloperAddress: string

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        ("${whitelistedDeveloperAddress}" : address),
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%updateWhitelistDevelopers",
            ("${targetContract}" : address)) : option(contract(address))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(address))
        ]
    );
} with list[contractOperation]`
};

const setGovernanceProxy  = (

    targetContract: string,
    governanceProxyAddress: string

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        ("${governanceProxyAddress}" : address),
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%setGovernanceProxy",
            ("${targetContract}" : address)) : option(contract(address))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(address))
        ]
    );
} with list[contractOperation]`
};

const createFarm  = (

    targetContract          : string,
    farmName                : string,
    addToGeneralContracts   : boolean,
    forceRewardFromTransfer : boolean,
    infinite                : boolean,
    totalBlocks             : number,
    currentRewardPerBlock   : number,
    metadata                : string,
    lpTokenAddress          : string,
    lpTokenId               : number,
    lpTokenStandard         : "fa12" | "fa2"

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record[
            name                     = "${farmName}";
            addToGeneralContracts    = ${addToGeneralContracts ? "True" : "False"};
            forceRewardFromTransfer  = ${forceRewardFromTransfer ? "True" : "False"};
            infinite                 = ${infinite ? "True" : "False"};
            plannedRewards           = record[
                totalBlocks              = (${totalBlocks}n: nat);
                currentRewardPerBlock    = ${currentRewardPerBlock}n;
            ];
            metadata                 = ("${metadata}": bytes);
            lpToken                  = record[
                tokenAddress             = ("${lpTokenAddress}" : address);
                tokenId                  = ${lpTokenId}n;
                tokenStandard            = (${lpTokenStandard == "fa12" ? "Fa12" : "Fa2"}: lpStandardType);
            ];
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%createFarm",
            ("${targetContract}" : address)) : option(contract(createFarmType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(createFarmType))
        ]
    );
} with list[contractOperation]`
};

const initFarm  = (

    targetContract          : string,
    totalBlocks             : number,
    currentRewardPerBlock   : number,
    forceRewardFromTransfer : boolean,
    infinite                : boolean,

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record[
            totalBlocks                 = ${totalBlocks}n;
            currentRewardPerBlock       = ${currentRewardPerBlock}n;
            forceRewardFromTransfer     = ${forceRewardFromTransfer ? "True" : "False"};
            infinite                    = ${infinite ? "True" : "False"};
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%initFarm",
            ("${targetContract}" : address)) : option(contract(initFarmParamsType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(initFarmParamsType))
        ]
    );
} with list[contractOperation]`
};

const closeFarm  = (

    targetContract          : string

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        unit,
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%closeFarm",
            ("${targetContract}" : address)) : option(contract(unit))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(unit))
        ]
    );
} with list[contractOperation]`
};

const createTreasury  = (

    targetContract          : string,
    baker                   : string | undefined,
    treasuryName            : string,
    addToGeneralContracts   : boolean,
    metadata                : string

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        (record[
            baker                   = (${baker ? "Some((\"" + baker + "\": key_hash))" : "None"} : option(key_hash));
            name                    = "${treasuryName}";
            addToGeneralContracts   = ${addToGeneralContracts ? "True" : "False"};
            metadata                = ("${metadata}": bytes);
        ] : createTreasuryType),
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%createTreasury",
            ("${targetContract}" : address)) : option(contract(createTreasuryType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(createTreasuryType))
        ]
    );
} with list[contractOperation]`
};

const transfer  = (

    targetContract          : string,
    transfers               : Array<transferItem>

) => {

    // Create the transfer record list
    var transfersRecord: string = "";
    transfers.forEach((transfer) => {
        
        // Create the token type
        const tokenTypeFa12 = transfer.token as fa12;
        const tokenTypeFa2  = transfer.token as fa2;
        var tokenType: any;
        if(transfer.token === "tez"){
            tokenType       = "Tez";
        }
        else if("fa12" in transfer.token){
            tokenType       = `Fa12(("${tokenTypeFa12.fa12}": address))`;
        }
        else if("fa2" in transfer.token){
            tokenType       = `Fa2(record[
                    tokenContractAddress    = ("${tokenTypeFa2.fa2.tokenContractAddress}": address);
                    tokenId                 = ${tokenTypeFa2.fa2.tokenId}n;
                ])`;
        }
        
        // Create and append the transfer record
        transfersRecord     += `
            record[
                to_       = ("${transfer.to_}" : address);
                amount    = ${transfer.amount}n;
                token     = ${tokenType};
            ];
        `;
    });

    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        list[
            ${transfersRecord}
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%transfer",
            ("${targetContract}" : address)) : option(contract(transferActionType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(transferActionType))
        ]
    );
} with list[contractOperation]`
};

const mintMvkAndTransfer  = (

    targetContract          : string,
    to_                     : string,
    amount                  : number

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record [
            to_ = ("${to_}" : address);
            amt = ${amount}n;
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%mintMvkAndTransfer",
            ("${targetContract}" : address)) : option(contract(mintMvkAndTransferType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(mintMvkAndTransferType))
        ]
    );
} with list[contractOperation]`
};

const updateMvkOperators  = (

    targetContract          : string,
    operators               : Array<addOperator | removeOperator>

) => {

    // Create the update operator list
    var operatorRecord: string = "";
    operators.forEach((operator) => {
        if("addOperator" in operator){
            const addOperatorItem: addOperator  = operator as addOperator;
            operatorRecord  += `
            Add_operator(record[
                owner    = ("${addOperatorItem.addOperator.owner}" : address);
                operator = ("${addOperatorItem.addOperator.operator}" : address);
                token_id = ${addOperatorItem.addOperator.tokenId}n;
            ]);
            `
        }
        else {
            const removeOperatorItem: removeOperator  = operator as removeOperator;
            operatorRecord  += `
            Remove_operator(record[
                owner    = ("${removeOperatorItem.removeOperator.owner}" : address);
                operator = ("${removeOperatorItem.removeOperator.operator}" : address);
                token_id = ${removeOperatorItem.removeOperator.tokenId}n;
            ]);
            `
        }
    });

    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        list[
            ${operatorRecord}
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%updateMvkOperators",
            ("${targetContract}" : address)) : option(contract(updateOperatorsType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(updateOperatorsType))
        ]
    );
} with list[contractOperation]`
};

const stakeMvk  = (

    targetContract          : string,
    amount                  : number

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        ${amount}n,
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%stakeMvk",
            ("${targetContract}" : address)) : option(contract(nat))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(nat))
        ]
    );
} with list[contractOperation]`
};

const unstakeMvk  = (

    targetContract          : string,
    amount                  : number

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        ${amount}n,
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%unstakeMvk",
            ("${targetContract}" : address)) : option(contract(nat))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(nat))
        ]
    );
} with list[contractOperation]`
};

const createAggregator  = (

    targetContract          : string,
    aggregatorName          : string,
    addToGeneralContracts   : boolean,
    oraclesInformation      : Array<oracleInformation>,
    decimals                : number,
    alphaPercentPerThousand : number,
    percentOracleThreshold  : number,
    heartBeatSeconds        : number,
    rewardAmountStakedMvk   : number,
    rewardAmountXtz         : number,
    metadata                : string

) => {

    // Create the oracle informations
    var oracleLedger: string = "";
    oraclesInformation.forEach((information: oracleInformation) => {
        oracleLedger += `
            ("${information.oracleAddress}" : address) -> record [
                    oraclePublicKey = ("${information.oraclePublicKey}" : key);
                    oraclePeerId    = "${information.oraclePeerId}";
                ];`;
    });

    const lambda =  `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        (record[
            name                  = "${aggregatorName}";
            addToGeneralContracts = ${addToGeneralContracts ? "True" : "False"};
            oracleLedger          = map[${oracleLedger}
            ];
            aggregatorConfig      = record [
                decimals                = ${decimals}n;
                alphaPercentPerThousand = ${alphaPercentPerThousand}n;
                percentOracleThreshold  = ${percentOracleThreshold}n;
                heartBeatSeconds        = ${heartBeatSeconds}n;
                rewardAmountStakedMvk   = ${rewardAmountStakedMvk}n;
                rewardAmountXtz         = ${rewardAmountXtz}n;
            ];
            metadata              = ("${metadata}": bytes);
        ] : createAggregatorParamsType),
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%createAggregator",
            ("${targetContract}" : address)) : option(contract(createAggregatorParamsType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(createAggregatorParamsType))
        ]
    );
} with list[contractOperation]`
return lambda
};

const updateInflationRate  = (

    targetContract          : string,
    inflationRate           : number

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        ${inflationRate}n,
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%updateInflationRate",
            ("${targetContract}" : address)) : option(contract(nat))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(nat))
        ]
    );
} with list[contractOperation]`
};

const triggerInflation  = (

    targetContract          : string

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        unit,
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%triggerInflation",
            ("${targetContract}" : address)) : option(contract(unit))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(unit))
        ]
    );
} with list[contractOperation]`
};

const trackProductContract  = (

    targetContract          : string,
    productContractType     : "aggregator" | "farm" | "treasury",
    productContractAddress  : string

) => {

    // Choose the track entrypoint
    var trackEntrypoint: string;
    switch(productContractType){
        case "aggregator":
            trackEntrypoint = "%trackAggregator";
            break;
        case "farm":
            trackEntrypoint = "%trackFarm";
            break;
        case "treasury":
            trackEntrypoint = "%trackTreasury";
            break;
    }

    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        ("${productContractAddress}" : address),
        0tez,
        case (Tezos.get_entrypoint_opt(
            "${trackEntrypoint}",
            ("${targetContract}" : address)) : option(contract(address))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(address))
        ]
    );
} with list[contractOperation]`
};

const untrackProductContract  = (

    targetContract          : string,
    productContractType     : "aggregator" | "farm" | "treasury",
    productContractAddress  : string

) => {

    // Choose the track entrypoint
    var trackEntrypoint: string;
    switch(productContractType){
        case "aggregator":
            trackEntrypoint = "%untrackAggregator";
            break;
        case "farm":
            trackEntrypoint = "%untrackFarm";
            break;
        case "treasury":
            trackEntrypoint = "%untrackTreasury";
            break;
    }

    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        ("${productContractAddress}" : address),
        0tez,
        case (Tezos.get_entrypoint_opt(
            "${trackEntrypoint}",
            ("${targetContract}" : address)) : option(contract(address))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(address))
        ]
    );
} with list[contractOperation]`
};

const addVestee  = (

    targetContract          : string,
    vesteeAddress           : string,
    totalAllocatedAmount    : number,
    cliffInMonths           : number,
    vestingInMonths         : number

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record [
            vesteeAddress        = ("${vesteeAddress}" : address);
            totalAllocatedAmount = ${totalAllocatedAmount}n;
            cliffInMonths        = ${cliffInMonths}n;
            vestingInMonths      = ${vestingInMonths}n;
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%addVestee",
            ("${targetContract}" : address)) : option(contract(addVesteeType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(addVesteeType))
        ]
    );
} with list[contractOperation]`
};

const removeVestee  = (

    targetContract          : string,
    vesteeAddress           : string

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        ("${vesteeAddress}" : address),
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%removeVestee",
            ("${targetContract}" : address)) : option(contract(address))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(address))
        ]
    );
} with list[contractOperation]`
};

const updateVestee  = (

    targetContract          : string,
    vesteeAddress           : string,
    newTotalAllocatedAmount : number,
    newCliffInMonths        : number,
    newVestingInMonths      : number

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record [
            vesteeAddress           = ("${vesteeAddress}" : address);
            newTotalAllocatedAmount = ${newTotalAllocatedAmount}n;
            newCliffInMonths        = ${newCliffInMonths}n;
            newVestingInMonths      = ${newVestingInMonths}n;
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%updateVestee",
            ("${targetContract}" : address)) : option(contract(updateVesteeType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(updateVesteeType))
        ]
    );
} with list[contractOperation]`
};

const toggleVesteeLock  = (

    targetContract          : string,
    vesteeAddress           : string

) => {
    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        ("${vesteeAddress}" : address),
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%toggleVesteeLock",
            ("${targetContract}" : address)) : option(contract(address))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(address))
        ]
    );
} with list[contractOperation]`
};

const setLoanToken  = (

    targetContract          : string,
    setLoanTokenAction      : createLoanToken | updateLoanToken

) => {

    // Parse loan token action
    var loanTokenActionRecord: string;

    if("createLoanToken" in setLoanTokenAction){
        // Cast the action
        const actionCast            = setLoanTokenAction as createLoanToken;
        const createLoanTokenAction = actionCast.createLoanToken;
        
        // Prepare the token type
        const tokenTypeFa12 = createLoanTokenAction.tokenType as fa12;
        const tokenTypeFa2  = createLoanTokenAction.tokenType as fa2;
        var tokenType: any;
        if(createLoanTokenAction.tokenType === "tez"){
            tokenType       = "Tez";
        }
        else if("fa12" in createLoanTokenAction.tokenType){
            tokenType       = `Fa12(("${tokenTypeFa12.fa12}": address))`;
        }
        else if("fa2" in createLoanTokenAction.tokenType){
            tokenType       = `Fa2(record[
                tokenContractAddress    = ("${tokenTypeFa2.fa2.tokenContractAddress}": address);
                tokenId                 = ${tokenTypeFa2.fa2.tokenId}n;
            ])`;
        }

        // Prepare the loan token record
        loanTokenActionRecord   = `CreateLoanToken(record [
                tokenName                           = ("${createLoanTokenAction.tokenName}" : string);
                tokenDecimals                       = (${createLoanTokenAction.tokenDecimals}n : nat);
                oracleAddress                       = ("${createLoanTokenAction.oracleAddress}" : address);
                mTokenAddress                       = ("${createLoanTokenAction.mTokenAddress}" : address);
                reserveRatio                        = (${createLoanTokenAction.reserveRatio}n : nat);
                optimalUtilisationRate              = (${createLoanTokenAction.optimalUtilisationRate}n : nat);
                baseInterestRate                    = (${createLoanTokenAction.baseInterestRate}n : nat);
                maxInterestRate                     = (${createLoanTokenAction.maxInterestRate}n : nat);
                interestRateBelowOptimalUtilisation = (${createLoanTokenAction.interestRateBelowOptimalUtilisation}n : nat);
                interestRateAboveOptimalUtilisation = (${createLoanTokenAction.interestRateAboveOptimalUtilisation}n : nat);
                minRepaymentAmount                  = (${createLoanTokenAction.minRepaymentAmount}n : nat);
                tokenType                           = (${tokenType} : tokenType);
            ])`;
    }
    else {
        // Cast the action
        const actionCast                    = setLoanTokenAction as updateLoanToken;
        const updateCollateralTokenAction   = actionCast.updateLoanToken;

        // Prepare the loan token record
        loanTokenActionRecord   = `UpdateLoanToken(record [
                tokenName                               = ("${updateCollateralTokenAction.tokenName}" : string);
                oracleAddress                           = ("${updateCollateralTokenAction.oracleAddress}" : address);
                reserveRatio                            = (${updateCollateralTokenAction.reserveRatio}n : nat);
                optimalUtilisationRate                  = (${updateCollateralTokenAction.optimalUtilisationRate}n : nat);
                baseInterestRate                        = (${updateCollateralTokenAction.baseInterestRate}n : nat);
                maxInterestRate                         = (${updateCollateralTokenAction.maxInterestRate}n : nat);
                interestRateBelowOptimalUtilisation     = (${updateCollateralTokenAction.interestRateBelowOptimalUtilisation}n : nat);
                interestRateAboveOptimalUtilisation     = (${updateCollateralTokenAction.interestRateAboveOptimalUtilisation}n : nat);
                minRepaymentAmount                      = (${updateCollateralTokenAction.minRepaymentAmount}n : nat);
                isPaused                                = (${updateCollateralTokenAction.isPaused} : bool);
            ])`;
    }

    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record [
            action = ${loanTokenActionRecord};
            empty  = Unit;
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%setLoanToken",
            ("${targetContract}" : address)) : option(contract(setLoanTokenActionType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(setLoanTokenActionType))
        ]
    );
} with list[contractOperation]`
};

const setCollateralToken  = (

    targetContract              : string,
    setCollateralTokenAction    : createCollateralToken | updateCollateralToken

) => {

    // Parse loan token action
    var loanTokenActionRecord: string;

    if("createCollateralToken" in setCollateralTokenAction){
        // Cast the action
        const actionCast                    = setCollateralTokenAction as createCollateralToken;
        const createCollateralTokenAction   = actionCast.createCollateralToken;
        
        // Prepare the token type
        const tokenTypeFa12 = createCollateralTokenAction.tokenType as fa12;
        const tokenTypeFa2  = createCollateralTokenAction.tokenType as fa2;
        var tokenType: any;
        if(createCollateralTokenAction.tokenType === "tez"){
            tokenType       = "Tez";
        }
        else if("fa12" in createCollateralTokenAction.tokenType){
            tokenType       = `Fa12(("${tokenTypeFa12.fa12}": address))`;
        }
        else if("fa2" in createCollateralTokenAction.tokenType){
            tokenType       = `Fa2(record[
                tokenContractAddress    = ("${tokenTypeFa2.fa2.tokenContractAddress}": address);
                tokenId                 = ${tokenTypeFa2.fa2.tokenId}n;
            ])`;
        }

        // Prepare the loan token record
        loanTokenActionRecord   = `CreateCollateralToken(record [
                tokenName              = "${createCollateralTokenAction.tokenName}";
                tokenContractAddress   = ("${createCollateralTokenAction.tokenContractAddress}" : address);
                tokenDecimals          = ${createCollateralTokenAction.tokenDecimals}n;
                oracleAddress          = ("${createCollateralTokenAction.oracleAddress}" : address);
                protected              = ${createCollateralTokenAction.protected ? "True" : "False"};
                isScaledToken          = ${createCollateralTokenAction.isScaledToken ? "True" : "False"};
                isStakedToken          = ${createCollateralTokenAction.isStakedToken ? "True" : "False"};
                stakingContractAddress = ${createCollateralTokenAction.stakingContractAddress ? "Some((\"" + createCollateralTokenAction.stakingContractAddress + "\" : address))" : "None"};
                maxDepositAmount       = ${createCollateralTokenAction.maxDepositAmount ? "Some(" + createCollateralTokenAction.maxDepositAmount + "n)" : "None"};
                tokenType              = ${tokenType};
            ]);`;
    }
    else {
        // Cast the action
        const actionCast            = setCollateralTokenAction as updateCollateralToken;
        const updateLoanTokenAction = actionCast.updateCollateralToken;

        // Prepare the loan token record
        loanTokenActionRecord   = `UpdateCollateralToken(record [
                tokenName              = "${updateLoanTokenAction.tokenName}";
                oracleAddress          = ("${updateLoanTokenAction.oracleAddress}" : address);
                isPaused               = ${updateLoanTokenAction.isPaused ? "True" : "False"};
                stakingContractAddress = ${updateLoanTokenAction.stakingContractAddress ? "Some((\"" + updateLoanTokenAction.stakingContractAddress + "\" : address))" : "None"};
                maxDepositAmount       = ${updateLoanTokenAction.maxDepositAmount ? "Some(" + updateLoanTokenAction.maxDepositAmount + "n)" : "None"};
            ]);`;
    }

    return `function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        record [
            action = ${loanTokenActionRecord}
            empty  = Unit;
        ],
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%setCollateralToken",
            ("${targetContract}" : address)) : option(contract(setCollateralTokenActionType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(setCollateralTokenActionType))
        ]
    );
} with list[contractOperation]`
};

export const generateProxyContract = (

    lambdaFunctionName: string,
    lambdaFunctionParameters: Array<any> = []

) => {
    // Create the function call
    var functionCall: string  = lambdaFunctionName + "(";
    lambdaFunctionParameters.forEach((parameter: any) => {
        var formattedParameter: string  = parameter;
        var parameterType: string       = typeof(parameter);
        switch(parameterType){
            case "string":
                formattedParameter  = `"${formattedParameter}"`;
                break;
            case "object":
                formattedParameter  = (JSON.stringify(parameter));
                break;
            default:
        }
        functionCall += formattedParameter + ","
    })
    functionCall = functionCall.slice(0, -1) + ")";
    
    // Return the generated contract
    return proxyContract(eval(functionCall));
}
