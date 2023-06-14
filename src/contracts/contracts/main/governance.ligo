// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Helpers and Types
// ------------------------------------------------------------------------------

// Shared Helpers
#include "../partials/shared/sharedHelpers.ligo"

// Transfer Helpers
#include "../partials/shared/transferHelpers.ligo"

// Permission Helpers
#include "../partials/shared/permissionHelpers.ligo"

// Votes Helpers
#include "../partials/shared/voteHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Delegation Type
#include "../partials/contractTypes/delegationTypes.ligo"

// Governance Type
#include "../partials/contractTypes/governanceTypes.ligo"

type governanceAction is 

        // Break Glass Entrypoint
        BreakGlass                      of (unit)
    |   PropagateBreakGlass             of set(address)

        // Housekeeping Entrypoints
    |   SetAdmin                        of (address)
    |   SetGovernanceProxy              of (address)
    |   UpdateMetadata                  of updateMetadataType
    |   UpdateConfig                    of governanceUpdateConfigParamsType
    |   UpdateWhitelistContracts        of updateWhitelistContractsType
    |   UpdateGeneralContracts          of updateGeneralContractsType    
    |   UpdateWhitelistDevelopers       of (address)
    |   MistakenTransfer                of transferActionType
    |   SetContractAdmin                of setContractAdminType
    |   SetContractGovernance           of setContractGovernanceType
    
        // Governance Cycle Entrypoints
    |   UpdateSatellitesSnapshot        of updateSatellitesSnapshotType
    |   StartNextRound                  of bool
    |   Propose                         of newProposalType
    |   ProposalRoundVote               of actionIdType
    |   UpdateProposalData              of updateProposalType
    |   LockProposal                    of actionIdType
    |   VotingRoundVote                 of (votingRoundVoteType)
    |   ExecuteProposal                 of actionIdType
    |   ProcessProposalPayment          of actionIdType
    |   ProcessProposalSingleData       of actionIdType
    |   DistributeProposalRewards       of distributeProposalRewardsType
    |   DropProposal                    of actionIdType

        // Lambda Entrypoints
    |   SetLambda                       of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * governanceStorageType

// governance contract methods lambdas
type governanceUnpackLambdaFunctionType is (governanceLambdaActionType * governanceStorageType) -> return


// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// Governance Helpers:
#include "../partials/contractHelpers/governanceHelpers.ligo"

// ------------------------------------------------------------------------------
// Views
// ------------------------------------------------------------------------------

// Governance Views:
#include "../partials/contractViews/governanceViews.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// Governance Lambdas:
#include "../partials/contractLambdas/governanceLambdas.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// Governance Entrypoints:
#include "../partials/contractEntrypoints/governanceEntrypoints.ligo"


(* main entrypoint *)
function main (const action : governanceAction; const s : governanceStorageType) : return is 

    case action of [

            // Break Glass Entrypoint
        |   BreakGlass(_parameters)                     -> breakGlass(s)
        |   PropagateBreakGlass(parameters)             -> propagateBreakGlass(parameters, s)
        
            // Housekeeping Entrypoints
        |   SetAdmin(parameters)                        -> setAdmin(parameters, s)
        |   SetGovernanceProxy(parameters)              -> setGovernanceProxy(parameters, s)
        |   UpdateMetadata(parameters)                  -> updateMetadata(parameters, s)
        |   UpdateConfig(parameters)                    -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts(parameters)        -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)          -> updateGeneralContracts(parameters, s)        
        |   UpdateWhitelistDevelopers(parameters)       -> updateWhitelistDevelopers(parameters, s)
        |   MistakenTransfer(parameters)                -> mistakenTransfer(parameters, s)
        |   SetContractAdmin(parameters)                -> setContractAdmin(parameters, s)
        |   SetContractGovernance(parameters)           -> setContractGovernance(parameters, s)

            // Governance Cycle Entrypoints
        |   UpdateSatellitesSnapshot(parameters)        -> updateSatellitesSnapshot(parameters, s)
        |   StartNextRound(parameters)                  -> startNextRound(parameters, s)
        |   Propose(parameters)                         -> propose(parameters, s)
        |   ProposalRoundVote(parameters)               -> proposalRoundVote(parameters, s)
        |   UpdateProposalData(parameters)              -> updateProposalData(parameters, s)
        |   LockProposal(parameters)                    -> lockProposal(parameters, s)
        |   VotingRoundVote(parameters)                 -> votingRoundVote(parameters, s)
        |   ExecuteProposal(parameters)                 -> executeProposal(parameters, s)
        |   ProcessProposalPayment(parameters)          -> processProposalPayment(parameters, s)
        |   ProcessProposalSingleData(parameters)       -> processProposalSingleData(parameters, s)
        |   DistributeProposalRewards(parameters)       -> distributeProposalRewards(parameters, s)
        |   DropProposal(parameters)                    -> dropProposal(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                       -> setLambda(parameters, s)

    ]
