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

// Aggregator Types
#include "../partials/contractTypes/aggregatorTypes.ligo"

// Aggregator Factory Types
#include "../partials/contractTypes/aggregatorFactoryTypes.ligo"

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
        (record[
            name                  = "AggregatorProxyTest";
            addToGeneralContracts = True;
            oracleLedger          = map[];
            aggregatorConfig      = record [
                decimals                = 6n;
                alphaPercentPerThousand = 10n;
                percentOracleThreshold  = 10n;
                heartBeatSeconds        = 5n;
                rewardAmountStakedMvk   = 100n;
                rewardAmountXtz         = 100n;
            ];
            metadata              = ("7b226e616d65223a224d415652594b2041676772656761746f7220436f6e7472616374222c2269636f6e223a2268747470733a2f2f6c6f676f2e636861696e6269742e78797a2f78747a222c2276657273696f6e223a2276312e302e30222c22617574686f7273223a5b224d415652594b20446576205465616d203c636f6e74616374406d617672796b2e66696e616e63653e225d7d": bytes);
        ] : createAggregatorParamsType),
        0tez,
        case (Tezos.get_entrypoint_opt(
            "%createAggregator",
            ("KT1FZCEsSbmQPWrQgyKnhQG7oEpWdjrZiCfU" : address)) : option(contract(createAggregatorParamsType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith(0n) : contract(createAggregatorParamsType))
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