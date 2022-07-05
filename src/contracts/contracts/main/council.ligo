// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Methods and Types
// ------------------------------------------------------------------------------

// Shared Methods
#include "../partials/shared/sharedMethods.ligo"

// Transfer Methods
#include "../partials/shared/transferMethods.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// MvkToken types for transfer
#include "../partials/contractTypes/mvkTokenTypes.ligo"

// // Vesting types for vesting council actions
#include "../partials/contractTypes/vestingTypes.ligo"

// Treasury types for transfer and mint
#include "../partials/contractTypes/treasuryTypes.ligo"

// Council Types
#include "../partials/contractTypes/councilTypes.ligo"

// ------------------------------------------------------------------------------

// Council Main Entrypoint Actions
type councilAction is 

    // Default Entrypoint to Receive Tez
    Default                                     of unit

    // Housekeeping Actions
  | SetAdmin                                    of address
  | SetGovernance                               of (address)
  | UpdateMetadata                              of updateMetadataType
  | UpdateConfig                                of councilUpdateConfigParamsType
  | UpdateWhitelistContracts                    of updateWhitelistContractsType
  | UpdateGeneralContracts                      of updateGeneralContractsType
  | UpdateCouncilMemberInfo                     of councilMemberInfoType

    // Council Actions for Internal Control
  | CouncilActionAddMember                      of councilActionAddMemberType
  | CouncilActionRemoveMember                   of address
  | CouncilActionChangeMember                   of councilActionChangeMemberType
  | CouncilActionSetBaker                       of setBakerType

    // Council Actions for Contracts
  | CouncilActionUpdateBlocksPerMin             of councilActionUpdateBlocksPerMinType

    // Council Actions for Vesting
  | CouncilActionAddVestee                      of addVesteeType
  | CouncilActionRemoveVestee                   of address
  | CouncilActionUpdateVestee                   of updateVesteeType
  | CouncilActionToggleVesteeLock               of address

    // Council Actions for Financial Governance
  | CouncilActionTransfer                       of councilActionTransferType
  | CouncilActionRequestTokens                  of councilActionRequestTokensType
  | CouncilActionRequestMint                    of councilActionRequestMintType
  | CouncilActionSetContractBaker               of councilActionSetContractBakerType
  | CouncilActionDropFinancialReq               of nat

    // Council Signing of Actions
  | FlushAction                                 of actionIdType
  | SignAction                                  of actionIdType                

    // Lambda Entrypoints
  | SetLambda                                   of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * councilStorageType

// council contract methods lambdas
type councilUnpackLambdaFunctionType is (councilLambdaActionType * councilStorageType) -> return



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Admin, Governance Contract
function checkSenderIsAllowed(var s : councilStorageType) : unit is
  if (Tezos.sender = s.admin or Tezos.sender = s.governanceAddress) then unit
  else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



// Allowed Senders: Admin
function checkSenderIsAdmin(var s : councilStorageType) : unit is
  if (Tezos.sender = s.admin) then unit
  else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



// Allowed Senders: Council Member address
function checkSenderIsCouncilMember(var s : councilStorageType) : unit is
  if Map.mem(Tezos.sender, s.councilMembers) then unit 
  else failwith(error_ONLY_COUNCIL_MEMBERS_ALLOWED);



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
  if (Tezos.amount = 0tez) then unit
  else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to update blocksPerMinute on a specified contract
function sendUpdateBlocksPerMinuteParams(const contractAddress : address) : contract(nat) is
  case (Tezos.get_entrypoint_opt(
      "%updateBlocksPerMinute",
      contractAddress) : option(contract(nat))) of [
        Some(contr) -> contr
      | None -> (failwith(error_UPDATE_BLOCKS_PER_MIN_ENTRYPOINT_IN_NOT_FOUND) : contract(nat))
    ];



// helper function to %addVestee entrypoint to add a new vestee on the Vesting contract
function sendAddVesteeParams(const contractAddress : address) : contract(addVesteeType) is
  case (Tezos.get_entrypoint_opt(
      "%addVestee",
      contractAddress) : option(contract(addVesteeType))) of [
          Some(contr) -> contr
        | None -> (failwith(error_ADD_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(addVesteeType))
      ];



// helper function to %removeVestee entrypoint to remove a vestee on the Vesting contract
function sendRemoveVesteeParams(const contractAddress : address) : contract(address) is
  case (Tezos.get_entrypoint_opt(
      "%removeVestee",
      contractAddress) : option(contract(address))) of [
          Some(contr) -> contr
        | None -> (failwith(error_REMOVE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(address))
      ];



// helper function to %updateVestee entrypoint to update a vestee on the Vesting contract
function sendUpdateVesteeParams(const contractAddress : address) : contract(updateVesteeType) is
case (Tezos.get_entrypoint_opt(
    "%updateVestee",
    contractAddress) : option(contract(updateVesteeType))) of [
        Some(contr) -> contr
      | None -> (failwith(error_UPDATE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(updateVesteeType))
    ];



// helper function to %toggleVesteeLock entrypoint to lock or unlock a vestee on the Vesting contract
function sendToggleVesteeLockParams(const contractAddress : address) : contract(address) is
case (Tezos.get_entrypoint_opt(
    "%toggleVesteeLock",
    contractAddress) : option(contract(address))) of [
        Some(contr) -> contr
      | None -> (failwith(error_TOGGLE_VESTEE_LOCK_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(address))
    ];



// helper function to %requestTokens entrypoint on the Governance Financial contract
function sendRequestTokensParams(const contractAddress : address) : contract(councilActionRequestTokensType) is
  case (Tezos.get_entrypoint_opt(
      "%requestTokens",
      contractAddress) : option(contract(councilActionRequestTokensType))) of [
          Some(contr) -> contr
        | None -> (failwith(error_REQUEST_TOKENS_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND) : contract(councilActionRequestTokensType))
      ];



// helper function to %requestMint entrypoint on the Governance Financial contract
function sendRequestMintParams(const contractAddress : address) : contract(councilActionRequestMintType) is
  case (Tezos.get_entrypoint_opt(
      "%requestMint",
      contractAddress) : option(contract(councilActionRequestMintType))) of [
          Some(contr) -> contr
        | None -> (failwith(error_REQUEST_MINT_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND) : contract(councilActionRequestMintType))
      ];



// helper function to %dropFinancialRequest entrypoint on the Governance Financial contract
function sendDropFinancialRequestParams(const contractAddress : address) : contract(nat) is
  case (Tezos.get_entrypoint_opt(
      "%dropFinancialRequest",
      contractAddress) : option(contract(nat))) of [
          Some(contr) -> contr
        | None -> (failwith(error_DROP_FINANCIAL_REQUEST_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND) : contract(nat))
      ];



// helper function to %setContractBaker entrypoint on the Governance Financial contract
function sendSetContractBakerParams(const contractAddress : address) : contract(councilActionSetContractBakerType) is
  case (Tezos.get_entrypoint_opt(
      "%setContractBaker",
      contractAddress) : option(contract(councilActionSetContractBakerType))) of [
          Some(contr) -> contr
        | None -> (failwith(error_SET_CONTRACT_BAKER_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND) : contract(councilActionSetContractBakerType))
      ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const councilLambdaAction : councilLambdaActionType; var s : councilStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(councilUnpackLambdaFunctionType)) of [
        Some(f) -> f(councilLambdaAction, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

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

// Council Lambdas:
#include "../partials/contractLambdas/council/councilLambdas.ligo"

// ------------------------------------------------------------------------------
//
// Lambda Methods End
//
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _: unit; var s : councilStorageType) : address is
  s.admin



(* View: get config *)
[@view] function getConfig(const _: unit; var s : councilStorageType) : councilConfigType is
  s.config



(* View: get council members *)
[@view] function getCouncilMembers(const _: unit; var s : councilStorageType) : councilMembersType is
  s.councilMembers



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _: unit; var s : councilStorageType) : whitelistContractsType is
  s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _: unit; var s : councilStorageType) : generalContractsType is
  s.generalContracts



(* View: get a council action *)
[@view] function getCouncilActionOpt(const actionId: nat; var s : councilStorageType) : option(councilActionRecordType) is
  Big_map.find_opt(actionId, s.councilActionsLedger)



(* View: get the action counter *)
[@view] function getActionCounter(const _: unit; var s : councilStorageType) : nat is
  s.actionCounter



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : councilStorageType) : option(bytes) is
  Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _: unit; var s : councilStorageType) : lambdaLedgerType is
  s.lambdaLedger

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : councilStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : councilStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : councilStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : councilUpdateConfigParamsType; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint  *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsType; var s: councilStorageType): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  updateGeneralContracts entrypoint  *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsType; var s: councilStorageType): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  updateCouncilMemberInfo entrypoint - update the info of a council member *)
function updateCouncilMemberInfo(const councilMemberInfo: councilMemberInfoType; var s : councilStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateCouncilMemberInfo"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaUpdateCouncilMemberInfo(councilMemberInfo);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Council Actions for Internal Control Entrypoints Begin
// ------------------------------------------------------------------------------

(*  councilActionAddMember entrypoint  *)
function councilActionAddMember(const newCouncilMember : councilActionAddMemberType ; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionAddMember"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilActionAddMember(newCouncilMember);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionRemoveMember entrypoint  *)
function councilActionRemoveMember(const councilMemberAddress : address ; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionRemoveMember"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilActionRemoveMember(councilMemberAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionChangeMember entrypoint  *)
function councilActionChangeMember(const councilActionChangeMemberParams : councilActionChangeMemberType; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionChangeMember"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilActionChangeMember(councilActionChangeMemberParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionSetBaker entrypoint  *)
function councilActionSetBaker(const councilActionSetBakerParams : setBakerType; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionSetBaker"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilActionSetBaker(councilActionSetBakerParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Council Actions for Internal Control Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Council Actions for Contracts Entrypoints Begin
// ------------------------------------------------------------------------------

(*  councilActionUpdateBlocksPerMinute entrypoint  *)
function councilActionUpdateBlocksPerMinute(const councilActionUpdateBlocksPerMinParam : councilActionUpdateBlocksPerMinType ; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionUpdateBlocksPerMinute"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilUpdateBlocksPerMin(councilActionUpdateBlocksPerMinParam);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Council Actions for Contracts Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Council Actions for Vesting Entrypoints Begin
// ------------------------------------------------------------------------------

(*  councilActionAddVestee entrypoint  *)
function councilActionAddVestee(const addVesteeParams : addVesteeType ; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionAddVestee"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilActionAddVestee(addVesteeParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionRemoveVestee entrypoint  *)
function councilActionRemoveVestee(const vesteeAddress : address ; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionRemoveVestee"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilActionRemoveVestee(vesteeAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionUpdateVestee entrypoint  *)
function councilActionUpdateVestee(const updateVesteeParams : updateVesteeType; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionUpdateVestee"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilActionUpdateVestee(updateVesteeParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionToggleVesteeLock entrypoint  *)
function councilActionToggleVesteeLock(const vesteeAddress : address ; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionToggleVesteeLock"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilToggleVesteeLock(vesteeAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Council Actions for Vesting Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Council Actions for Financial Governance Begin
// ------------------------------------------------------------------------------

(*  councilActionTransfer entrypoint  *)
function councilActionTransfer(const councilActionTransferParams : councilActionTransferType; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionTransfer"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilActionTransfer(councilActionTransferParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionRequestTokens entrypoint  *)
function councilActionRequestTokens(const councilActionRequestTokensParams : councilActionRequestTokensType ; var s : councilStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionRequestTokens"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilRequestTokens(councilActionRequestTokensParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionRequestMint entrypoint  *)
function councilActionRequestMint(const councilActionRequestMintParams : councilActionRequestMintType ; var s : councilStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionRequestMint"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilRequestMint(councilActionRequestMintParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionSetContractBaker entrypoint  *)
function councilActionSetContractBaker(const councilActionSetContractBakerParams : councilActionSetContractBakerType ; var s : councilStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionSetContractBaker"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilSetContractBaker(councilActionSetContractBakerParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  councilActionDropFinancialRequest entrypoint  *)
function councilActionDropFinancialRequest(const requestId : nat ; var s : councilStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionDropFinancialRequest"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaCouncilDropFinancialReq(requestId);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Council Actions for Financial Governance End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Council Signing of Actions Entrypoints Begin
// ------------------------------------------------------------------------------

(*  flushAction entrypoint  *)
function flushAction(const actionId: actionIdType; var s : councilStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaFlushAction"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaFlushAction(actionId);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response



(*  signAction entrypoint  *)
function signAction(const actionId: actionIdType; var s : councilStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSignAction"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init council lambda action
    const councilLambdaAction : councilLambdaActionType = LambdaSignAction(actionId);

    // init response
    const response : return = unpackLambda(lambdaBytes, councilLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Council Signing of Actions Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams: setLambdaType; var s: councilStorageType): return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with(noOperations, s)

// ------------------------------------------------------------------------------
// Lambda Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : councilAction; const s : councilStorageType) : return is 

    case action of [
      
          // Default Entrypoint to Receive Tez
          Default(_parameters)                          -> ((nil : list(operation)), s)

        // Housekeeping Actions
        | SetAdmin(parameters)                          -> setAdmin(parameters, s)
        | SetGovernance(parameters)                     -> setGovernance(parameters, s)
        | UpdateMetadata(parameters)                    -> updateMetadata(parameters, s)  
        | UpdateConfig(parameters)                      -> updateConfig(parameters, s)
        | UpdateWhitelistContracts(parameters)          -> updateWhitelistContracts(parameters, s)
        | UpdateGeneralContracts(parameters)            -> updateGeneralContracts(parameters, s)
        | UpdateCouncilMemberInfo(parameters)           -> updateCouncilMemberInfo(parameters, s)
        
        // Council Actions for Internal Control
        | CouncilActionAddMember(parameters)            -> councilActionAddMember(parameters, s)
        | CouncilActionRemoveMember(parameters)         -> councilActionRemoveMember(parameters, s)
        | CouncilActionChangeMember(parameters)         -> councilActionChangeMember(parameters, s)
        | CouncilActionSetBaker(parameters)             -> councilActionSetBaker(parameters, s)

        // Council actions for Contracts
        | CouncilActionUpdateBlocksPerMin(parameters)   -> councilActionUpdateBlocksPerMinute(parameters, s)

        // Council Actions for Vesting
        | CouncilActionAddVestee(parameters)            -> councilActionAddVestee(parameters, s)
        | CouncilActionRemoveVestee(parameters)         -> councilActionRemoveVestee(parameters, s)
        | CouncilActionUpdateVestee(parameters)         -> councilActionUpdateVestee(parameters, s)
        | CouncilActionToggleVesteeLock(parameters)     -> councilActionToggleVesteeLock(parameters, s)
        
        // Council Actions for Financial Governance
        | CouncilActionTransfer(parameters)             -> councilActionTransfer(parameters, s)
        | CouncilActionRequestTokens(parameters)        -> councilActionRequestTokens(parameters, s)
        | CouncilActionRequestMint(parameters)          -> councilActionRequestMint(parameters, s)
        | CouncilActionSetContractBaker(parameters)     -> councilActionSetContractBaker(parameters, s)
        | CouncilActionDropFinancialReq(parameters)     -> councilActionDropFinancialRequest(parameters, s)

        // Council Signing of Actions 
        | FlushAction(parameters)                       -> flushAction(parameters, s)
        | SignAction(parameters)                        -> signAction(parameters, s)

        // Lambda Entrypoints
        | SetLambda(parameters)                         -> setLambda(parameters, s)
    ]