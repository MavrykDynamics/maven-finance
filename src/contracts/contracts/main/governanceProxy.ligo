// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Whitelist Token Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams 
#include "../partials/whitelistTokenContractsType.ligo"

// Set Lambda Types
#include "../partials/functionalTypes/setLambdaTypes.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Delegation Type for updateConfig
#include "../partials/types/delegationTypes.ligo"

// BreakGlass Type
#include "../partials/types/farmTypes.ligo"

// Break Glass Type
#include "../partials/types/breakGlassTypes.ligo"

// Emergency Governance Type
#include "../partials/types/emergencyGovernanceTypes.ligo"

// Council Type
#include "../partials/types/councilTypes.ligo"

// Governance Type
#include "../partials/types/governanceTypes.ligo"

// Farm Type
#include "../partials/types/farmTypes.ligo"

// FarmFactory Type
#include "../partials/types/farmFactoryTypes.ligo"

// Treasury Type
#include "../partials/types/treasuryTypes.ligo"

// TreasuryFactory Type
#include "../partials/types/treasuryFactoryTypes.ligo"

// Governance Proxy Types
#include "../partials/types/governanceProxyTypes.ligo"

// ------------------------------------------------------------------------------

type governanceProxyAction is 
  | SetProxyLambda               of setProxyLambdaType
  | ExecuteGovernanceAction      of (bytes)
  | DataPackingHelper            of executeActionType
  // | ExecuteGovernanceProposal    of proposalIdType
  // | CallGovernanceLambdaProxy    of executeActionType

const noOperations : list (operation) = nil;
type return is list (operation) * governanceProxyStorage

// proxy lambdas -> executing proposals to external contracts within MAVRYK system
type governanceProxyLambdaFunctionType is (executeActionType * governanceProxyStorage) -> return



// ------------------------------------------------------------------------------
//
// Error Codes Begin
//
// ------------------------------------------------------------------------------

[@inline] const error_ONLY_ADMINISTRATOR_ALLOWED                              = 0n;
[@inline] const error_ONLY_SELF_ALLOWED                                       = 1n;
[@inline] const error_ONLY_ADMIN_OR_SELF_ALLOWED                              = 2n;
[@inline] const error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ADDRESS_ALLOWED        = 3n;
[@inline] const error_ONLY_ADMIN_OR_SELF_OR_GOVERNANCE_ADDRESS_ALLOWED        = 4n;
[@inline] const error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ                       = 5n;

[@inline] const error_SET_ADMIN_ENTRYPOINT_NOT_FOUND                          = 6n;
[@inline] const error_SET_GOVERNANCE_ENTRYPOINT_NOT_FOUND                     = 7n;
[@inline] const error_SET_LAMBDA_ENTRYPOINT_NOT_FOUND                         = 8n;
[@inline] const error_UPDATE_METADATA_ENTRYPOINT_NOT_FOUND                    = 9n;
[@inline] const error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_NOT_FOUND         = 10n;
[@inline] const error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_NOT_FOUND           = 11n;
[@inline] const error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_NOT_FOUND   = 12n;

[@inline] const error_GOVERNANCE_PROPOSAL_RECORD_NOT_FOUND                    = 13n;
[@inline] const error_GET_PROPOSAL_RECORD_VIEW_NOT_FOUND                      = 14n;
[@inline] const error_GOVERNANCE_PROPOSAL_ALREADY_EXECUTED                    = 15n;
[@inline] const error_GOVERNANCE_PROPOSAL_DROPPED                             = 16n;
[@inline] const error_GOVERNANCE_PROPOSAL_NO_DATA_TO_EXECUTE                  = 17n;

[@inline] const error_LAMBDA_NOT_FOUND                                        = 18n;
[@inline] const error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA               = 19n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                                 = 20n;


// ------------------------------------------------------------------------------
//
// Error Codes End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

function checkSenderIsAdmin(var s : governanceProxyStorage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.sender = Tezos.self_address) then unit
    else failwith(error_ONLY_SELF_ALLOWED);



function checkSenderIsAdminOrSelf(var s : governanceProxyStorage) : unit is
    if (Tezos.sender = s.admin or Tezos.sender = Tezos.self_address) then unit
    else failwith(error_ONLY_ADMIN_OR_SELF_ALLOWED);



function checkSenderIsAdminOrGovernance(var s : governanceProxyStorage) : unit is
    if (Tezos.sender = s.admin or Tezos.sender = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ADDRESS_ALLOWED);



function checkSenderIsAdminOrSelfOrGovernance(var s : governanceProxyStorage) : unit is
    if (Tezos.sender = s.admin or Tezos.sender = Tezos.self_address or Tezos.sender = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMIN_OR_SELF_OR_GOVERNANCE_ADDRESS_ALLOWED);



function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Functions Begin
// ------------------------------------------------------------------------------

// governance proxy lamba helper function to get setAdmin entrypoint
function getSetAdminEntrypoint(const contractAddress : address) : contract(address) is
case (Tezos.get_entrypoint_opt(
      "%setAdmin",
      contractAddress) : option(contract(address))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_SET_ADMIN_ENTRYPOINT_NOT_FOUND) : contract(address))
      ];


// governance proxy lamba helper function to get setGovernance entrypoint
function getSetGovernanceEntrypoint(const contractAddress : address) : contract(address) is
case (Tezos.get_entrypoint_opt(
      "%setGovernance",
      contractAddress) : option(contract(address))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_SET_GOVERNANCE_ENTRYPOINT_NOT_FOUND) : contract(address))
      ];



// governance proxy lamba helper function to get setLambda entrypoint
function getSetLambdaEntrypoint(const contractAddress : address) : contract(setLambdaType) is
  case (Tezos.get_entrypoint_opt(
      "%setLambda",
      contractAddress) : option(contract(setLambdaType))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_SET_LAMBDA_ENTRYPOINT_NOT_FOUND) : contract(setLambdaType))
      ];



// governance proxy lamba helper function to get updateMetadata entrypoint
function getUpdateMetadataEntrypoint(const contractAddress : address) : contract(updateMetadataType) is
case (Tezos.get_entrypoint_opt(
      "%updateMetadata",
      contractAddress) : option(contract(updateMetadataType))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_UPDATE_METADATA_ENTRYPOINT_NOT_FOUND) : contract(updateMetadataType))
      ];



// governance proxy lamba helper function to get updateWhitelistContracts entrypoint
function getUpdateWhitelistContractsEntrypoint(const contractAddress : address) : contract(updateWhitelistContractsParams) is
case (Tezos.get_entrypoint_opt(
      "%updateWhitelistContracts",
      contractAddress) : option(contract(updateWhitelistContractsParams))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_NOT_FOUND) : contract(updateWhitelistContractsParams))
      ];



// governance proxy lamba helper function to get updateGeneralContracts entrypoint
function getUpdateGeneralContractsEntrypoint(const contractAddress : address) : contract(updateGeneralContractsParams) is
case (Tezos.get_entrypoint_opt(
      "%updateGeneralContracts",
      contractAddress) : option(contract(updateGeneralContractsParams))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_NOT_FOUND) : contract(updateGeneralContractsParams))
      ];



// governance proxy lamba helper function to get updateWhitelistTokenContracts entrypoint
function getUpdateWhitelistTokenContractsEntrypoint(const contractAddress : address) : contract(updateWhitelistTokenContractsParams) is
case (Tezos.get_entrypoint_opt(
      "%updateWhitelistTokenContracts",
      contractAddress) : option(contract(updateWhitelistTokenContractsParams))) of [
          Some(contr) -> contr
        | None        -> (failwith(error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_NOT_FOUND) : contract(updateWhitelistTokenContractsParams))
      ];

// ------------------------------------------------------------------------------
// Entrypoint Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// function unpackLambda(const lambdaBytes : bytes; const governanceProxyLambdaAction : governanceProxyLambdaFunctionType; var s : governanceProxyStorage) : return is 
// block {

//     const res : return = case (Bytes.unpack(lambdaBytes) : option(governanceProxyLambdaFunctionType)) of [
//         Some(f) -> f(governanceProxyLambdaAction, s)
//       | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
//     ];

// } with (res.0, res.1)

// ------------------------------------------------------------------------------
// Lambda Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Helper Functions End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Lambda Methods Begin
//
// ------------------------------------------------------------------------------

// Governance Proxy Lambdas:
#include "../partials/contractLambdas/governanceProxy/governanceProxyLambdas.ligo"

// ------------------------------------------------------------------------------
//
// Lambda Methods End
//
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

(* setProxyLambda entrypoint *)
function setProxyLambda(const setProxyLambdaParams: setProxyLambdaType; var s : governanceProxyStorage) : return is 
block {
    
    checkSenderIsAdminOrGovernance(s); // governance contract will also be the admin in most cases unless break glass
    
    // assign params to constants for better code readability
    const lambdaId      = setProxyLambdaParams.id;
    const lambdaBytes   = setProxyLambdaParams.func_bytes;

    // set lambda in lambdaLedger - allow override of lambdas
    s.proxyLambdaLedger[lambdaId] := lambdaBytes;

} with (noOperations, s)



(* executeGovernanceAction entrypoint *)
function executeGovernanceAction(const governanceActionBytes : bytes; var s : governanceProxyStorage) : return is 
block {
    
    checkSenderIsAdminOrGovernance(s); // governance contract will also be the admin in most cases unless break glass

    const governanceAction : executeActionType = case (Bytes.unpack(governanceActionBytes) : option(executeActionType)) of [
        Some(_action) -> _action
      | None          -> failwith(error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA)
    ];

    const executeGovernanceActionLambdaBytes : bytes = case s.proxyLambdaLedger[0n] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // reference: type governanceLambdaFunctionType is (executeActionType * governanceStorage) -> return
    const response : return = case (Bytes.unpack(executeGovernanceActionLambdaBytes) : option(governanceProxyLambdaFunctionType)) of [
        Some(f) -> f(governanceAction, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with response



(* dataDataPackingHelper entrypoint *)
function dataDataPackingHelper(const _governanceAction : executeActionType; var s : governanceProxyStorage) : return is 
  (noOperations, s)



// (* executeGovernanceProposal entrypoint *)
// function executeGovernanceProposal(const proposalId : nat; var s : governanceProxyStorage) : return is 
// block {
    
//     checkSenderIsAdmin(s); // governance contract in most cases unless break glass

//     const proposalRecordView : option (option(proposalRecordType)) = Tezos.call_view ("getProposalRecordView", proposalId, s.governanceAddress);
//     const proposal : proposalRecordType = case satelliteOptView of [
//         Some (value) -> case value of [
//             Some (_proposalRecord) -> _proposalRecord
//           | None                    -> failwith(error_GOVERNANCE_PROPOSAL_RECORD_NOT_FOUND)
//         ]
//       | None -> failwith (error_GET_PROPOSAL_RECORD_VIEW_NOT_FOUND)
//     ];

//     // executed check done on executeProposal in governance contract
    
//     // verify that proposal is active and has not been dropped
//     if proposal.status = "DROPPED" then failwith(error_GOVERNANCE_PROPOSAL_DROPPED)
//     else skip;

//     // check that there is at least one proposal metadata to execute
//     if Map.size(proposal.proposalMetadata) = 0n then failwith(error_GOVERNANCE_PROPOSAL_NO_DATA_TO_EXECUTE)
//     else skip;

    
//     // loop proposal metadata for execution
//     for _title -> metadataBytes in map proposal.proposalMetadata block {

//         const executeAction : executeActionType = case (Bytes.unpack(metadataBytes) : option(executeActionType)) of [
//               Some(_action) -> _action
//             | None          -> failwith(error_UNABLE_TO_UNPACK_PROPOSAL_METADATA)
//         ];

//         const sendActionToGovernanceLambdaOperation : operation = Tezos.transaction(
//             executeAction,
//             0tez,
//             sendOperationToCallGovernanceLambdaProxy(unit)
//         );

//         operations := sendActionToGovernanceLambdaOperation # operations;

//     };     

//     // loop payment metadata for execution
//     for _title -> metadataBytes in map proposal.paymentMetadata block {

//         const executeAction : executeActionType = case (Bytes.unpack(metadataBytes) : option(executeActionType)) of [
//               Some(_action) -> _action
//             | None    -> failwith(error_UNABLE_TO_UNPACK_PAYMENT_METADATA)
//         ];

//         const sendActionToGovernanceLambdaOperation : operation = Tezos.transaction(
//             executeAction,
//             0tez,
//             sendOperationToCallGovernanceLambdaProxy(unit)
//         );

//         operations := sendActionToGovernanceLambdaOperation # operations;
    
//     };     

// } with (operations, s)



(* callGovernanceLambdaProxy entrypoint *)
// function callGovernanceLambdaProxy(const executeAction : executeActionType; var s : governanceStorage) : return is
// block {
    
//     checkSenderIsAdminOrSelf(s);

//     const governanceLambdaBytes : bytes = case s.proxyLambdaLedger[0n] of [
//       | Some(_v) -> _v
//       | None     -> failwith(error_LAMBDA_NOT_FOUND)
//     ];

//     // reference: type governanceLambdaFunctionType is (executeActionType * governanceStorage) -> return
//     const res : return = case (Bytes.unpack(governanceLambdaBytes) : option(governanceProxyLambdaFunctionType)) of [
//         Some(f) -> f(executeAction, s)
//       | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
//     ];
  
// } with (res.0, res.1)


// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : governanceProxyAction; const s : governanceProxyStorage) : return is 
  block {

    checkNoAmount(Unit); // entrypoints should not receive any tez amount  

  } with (

    case action of [
        
        | SetProxyLambda(parameters)              -> setProxyLambda(parameters, s)
        | ExecuteGovernanceAction(parameters)     -> executeGovernanceAction(parameters, s)
        | DataPackingHelper(parameters)           -> dataDataPackingHelper(parameters, s)
        // | ExecuteGovernanceProposal(parameters)   -> executeGovernanceProposal(parameters, s)
        // | CallGovernanceLambdaProxy(parameters)   -> callGovernanceLambdaProxy(parameters, s)

    ]
  )