// ------------------------------------------------------------------------------
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
function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Tezos.transaction(
        ("tz1Rf4qAP6ZK19hR6Xwcwqz5778PnwNLPDBM" : address),
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%setGovernance",
            ("KT1JE9SBnHva7ti55HwCAgSrBgBGmX81etAn" : address)) : option(contract(address))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(address))
        ]
    );
} with list[contractOperation]

(* main entrypoint *)
function main (const action : actionType; const s : unit) : return is

    case action of [

            // Housekeeping Entrypoints
            Default (_parameters)                -> (lambdaFunction(), s)
        |   Empty (_parameters)                  -> ((nil : list(operation)), s)

    ]

;