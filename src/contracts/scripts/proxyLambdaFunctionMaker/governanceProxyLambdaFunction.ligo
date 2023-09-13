// ------------------------------------------------------------------------------
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
function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Mavryk.transaction(
        record [
            updateConfigNewValue    = 1234n; 
            updateConfigAction      = (ConfigActionExpiryDays(Unit) : councilUpdateConfigActionType)
        ],
        0mav,
        case (Mavryk.get_entrypoint_opt(
            "%updateConfig",
            ("KT1XPXDxZ3LusKbWnC7EH3HqKcwzwNbGVVe6" : address)) : option(contract(councilUpdateConfigParamsType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith("error_UPDATE_CONFIG_THROUGH_PROXY_LAMBDA_FAIL"))
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