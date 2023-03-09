const proxyContract = (

    lambdaFunction: string

) => {
    return `// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// Shared Types
#include "../partials/shared/sharedTypes.ligo"

// Transfer Helpers
#include "../partials/shared/transferHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Doorman types
#include "../partials/contractTypes/doormanTypes.ligo"

// Delegation Types
#include "../partials/contractTypes/delegationTypes.ligo"

// Farm types
#include "../partials/contractTypes/farmTypes.ligo"

// FarmFactory Types
#include "../partials/contractTypes/farmFactoryTypes.ligo"

// Treasury Type
#include "../partials/contractTypes/treasuryTypes.ligo"

// TreasuryFactory Type
#include "../partials/contractTypes/treasuryFactoryTypes.ligo"

// Aggregator Types
#include "../partials/contractTypes/aggregatorTypes.ligo"

// Aggregator Factory Types
#include "../partials/contractTypes/aggregatorFactoryTypes.ligo"

// Vestee Types
#include "../partials/contractTypes/vestingTypes.ligo"

// Vault Types 
#include "../partials/contractTypes/vaultTypes.ligo"

// Lending Controller Types
#include "../partials/contractTypes/lendingControllerTypes.ligo"

// Governance Types
#include "../partials/contractTypes/governanceTypes.ligo"

// Council Types
#include "../partials/contractTypes/councilTypes.ligo"

// Emergency Governance Types
#include "../partials/contractTypes/emergencyGovernanceTypes.ligo"

// BreakGlass Types
#include "../partials/contractTypes/breakGlassTypes.ligo"

// Governance Financial Types
#include "../partials/contractTypes/governanceFinancialTypes.ligo"

// Governance Satellite Types
#include "../partials/contractTypes/governanceSatelliteTypes.ligo"

// Token Sale Types
#include "../partials/contractTypes/tokenSaleTypes.ligo"

// Vault Factory Types
#include "../partials/contractTypes/vaultFactoryTypes.ligo"

type actionType is 
        // Default Entrypoint to Receive Tez
        Default                       of unit
    |   Empty                         of unit

const noOperations : list (operation) = nil;
type return is list (operation) * unit

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

interface fa12 {
    fa12                                    : string;
}

interface fa2 {
    fa2                                     : {
        tokenContractAddress                    : string;
        tokenId                                 : number;
    }
}

interface createLoanToken {
    createLoanToken                         : {
        tokenName                               : string;
        tokenDecimals                           : number;
        oracleAddress                           : string;
        mTokenAddress                           : string;
        reserveRatio                            : number;
        optimalUtilisationRate                  : number;
        baseInterestRate                        : number;
        maxInterestRate                         : number;
        interestRateBelowOptimalUtilisation     : number;
        interestRateAboveOptimalUtilisation     : number;
        minRepaymentAmount                      : number;
        tokenType                               : fa12 | fa2 | "tez"; 
    }
} 

interface updateLoanToken {
    updateLoanToken                         : {
        tokenName                               : string;
        oracleAddress                           : string;
        reserveRatio                            : number;
        optimalUtilisationRate                  : number;
        baseInterestRate                        : number;
        maxInterestRate                         : number;
        interestRateBelowOptimalUtilisation     : number;
        interestRateAboveOptimalUtilisation     : number;
        minRepaymentAmount                      : number;
        isPaused                                : boolean;
    }
} 

const setLoanToken  = (

    targetContract: string,
    setLoanTokenAction: createLoanToken | updateLoanToken

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
        else if(typeof(createLoanTokenAction.tokenType) === "string"){
            tokenType       = `Fa12(("${tokenTypeFa12.fa12}": address))`;
        }
        else{
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
        const actionCast            = setLoanTokenAction as updateLoanToken;
        const updateLoanTokenAction = actionCast.updateLoanToken;

        // Prepare the loan token record
        loanTokenActionRecord   = `UpdateLoanToken(record [
                tokenName                               = ("${updateLoanTokenAction.tokenName}" : string);
                oracleAddress                           = ("${updateLoanTokenAction.oracleAddress}" : address);
                reserveRatio                            = (${updateLoanTokenAction.reserveRatio}n : nat);
                optimalUtilisationRate                  = (${updateLoanTokenAction.optimalUtilisationRate}n : nat);
                baseInterestRate                        = (${updateLoanTokenAction.baseInterestRate}n : nat);
                maxInterestRate                         = (${updateLoanTokenAction.maxInterestRate}n : nat);
                interestRateBelowOptimalUtilisation     = (${updateLoanTokenAction.interestRateBelowOptimalUtilisation}n : nat);
                interestRateAboveOptimalUtilisation     = (${updateLoanTokenAction.interestRateAboveOptimalUtilisation}n : nat);
                minRepaymentAmount                      = (${updateLoanTokenAction.minRepaymentAmount}n : nat);
                isPaused                                = (${updateLoanTokenAction.isPaused} : bool);
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
                formattedParameter = `"${formattedParameter}"`;
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
