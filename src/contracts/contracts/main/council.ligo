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

// MvkToken types for transfer
#include "../partials/types/mvkTokenTypes.ligo"

// // Vesting types for vesting council actions
#include "../partials/types/vestingTypes.ligo"

// Treasury types for transfer and mint
#include "../partials/types/treasuryTypes.ligo"

// Council Types
#include "../partials/types/councilTypes.ligo"

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
  | UpdateWhitelistContracts                    of updateWhitelistContractsParams
  | UpdateGeneralContracts                      of updateGeneralContractsParams
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
  | FlushAction                                 of flushActionType
  | SignAction                                  of signActionType                

    // Lambda Entrypoints
  | SetLambda                                   of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * councilStorage

// council contract methods lambdas
type councilUnpackLambdaFunctionType is (councilLambdaActionType * councilStorage) -> return



// ------------------------------------------------------------------------------
//
// Error Codes Begin
//
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

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
function checkSenderIsAllowed(var s : councilStorage) : unit is
    if (Tezos.sender = s.admin or Tezos.sender = s.governanceAddress) then unit
        else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



function checkSenderIsAdmin(var s : councilStorage) : unit is
    if (Tezos.sender = s.admin) then unit
        else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



function checkSenderIsCouncilMember(var s : councilStorage) : unit is
    if Map.mem(Tezos.sender, s.councilMembers) then unit 
        else failwith(error_ONLY_COUNCIL_MEMBERS_ALLOWED);



function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
        else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);



// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"



// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"


// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

function sendUpdateBlocksPerMinuteParams(const contractAddress : address) : contract(nat) is
  case (Tezos.get_entrypoint_opt(
      "%updateBlocksPerMinute",
      contractAddress) : option(contract(nat))) of [
    Some(contr) -> contr
  | None -> (failwith(error_UPDATE_BLOCKS_PER_MIN_ENTRYPOINT_IN_NOT_FOUND) : contract(nat))
];



function sendAddVesteeParams(const contractAddress : address) : contract(addVesteeType) is
  case (Tezos.get_entrypoint_opt(
      "%addVestee",
      contractAddress) : option(contract(addVesteeType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_ADD_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(addVesteeType))
];



function sendRemoveVesteeParams(const contractAddress : address) : contract(address) is
  case (Tezos.get_entrypoint_opt(
      "%removeVestee",
      contractAddress) : option(contract(address))) of [
    Some(contr) -> contr
  | None -> (failwith(error_REMOVE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(address))
];



function sendUpdateVesteeParams(const contractAddress : address) : contract(updateVesteeType) is
case (Tezos.get_entrypoint_opt(
    "%updateVestee",
    contractAddress) : option(contract(updateVesteeType))) of [
Some(contr) -> contr
| None -> (failwith(error_UPDATE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(updateVesteeType))
];



function sendToggleVesteeLockParams(const contractAddress : address) : contract(address) is
case (Tezos.get_entrypoint_opt(
    "%toggleVesteeLock",
    contractAddress) : option(contract(address))) of [
Some(contr) -> contr
| None -> (failwith(error_TOGGLE_VESTEE_LOCK_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(address))
];



function sendRequestTokensParams(const contractAddress : address) : contract(councilActionRequestTokensType) is
  case (Tezos.get_entrypoint_opt(
      "%requestTokens",
      contractAddress) : option(contract(councilActionRequestTokensType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_REQUEST_TOKENS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(councilActionRequestTokensType))
];



function sendRequestMintParams(const contractAddress : address) : contract(councilActionRequestMintType) is
  case (Tezos.get_entrypoint_opt(
      "%requestMint",
      contractAddress) : option(contract(councilActionRequestMintType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_REQUEST_MINT_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(councilActionRequestMintType))
];



function sendDropFinancialRequestParams(const contractAddress : address) : contract(nat) is
  case (Tezos.get_entrypoint_opt(
      "%dropFinancialRequest",
      contractAddress) : option(contract(nat))) of [
    Some(contr) -> contr
  | None -> (failwith(error_DROP_FINANCIAL_REQUEST_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(nat))
];


function sendContractBakerParams(const contractAddress : address) : contract(councilActionSetContractBakerType) is
  case (Tezos.get_entrypoint_opt(
      "%setContractBaker",
      contractAddress) : option(contract(councilActionSetContractBakerType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_SET_CONTRACT_BAKER_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(councilActionSetContractBakerType))
];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Transfer Helper Functions Begin
// ------------------------------------------------------------------------------

function transferTez(const to_ : contract(unit); const amt : nat) : operation is Tezos.transaction(unit, amt * 1mutez, to_)

function transferFa12Token(const from_: address; const to_: address; const tokenAmount: tokenBalance; const tokenContractAddress: address): operation is
    block{
        const transferParams: fa12TransferType = (from_,(to_,tokenAmount));

        const tokenContract: contract(fa12TransferType) =
            case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(fa12TransferType))) of [
                Some (c) -> c
            |   None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_FA12_CONTRACT_NOT_FOUND): contract(fa12TransferType))
            ];
    } with (Tezos.transaction(transferParams, 0tez, tokenContract))

function transferFa2Token(const from_: address; const to_: address; const tokenAmount: tokenBalance; const tokenId: nat; const tokenContractAddress: address): operation is
block{
    const transferParams: fa2TransferType = list[
            record[
                from_ = from_;
                txs = list[
                    record[
                        to_      = to_;
                        token_id = tokenId;
                        amount   = tokenAmount;
                    ]
                ]
            ]
        ];

    const tokenContract: contract(fa2TransferType) =
        case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(fa2TransferType))) of [
            Some (c) -> c
        |   None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND): contract(fa2TransferType))
        ];
} with (Tezos.transaction(transferParams, 0tez, tokenContract))

// ------------------------------------------------------------------------------
// Transfer Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

function unpackLambda(const lambdaBytes : bytes; const councilLambdaAction : councilLambdaActionType; var s : councilStorage) : return is 
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

(* View: get config *)
[@view] function getConfig(const _: unit; var s : councilStorage) : councilConfigType is
  s.config



(* View: get council members *)
[@view] function getCouncilMembers(const _: unit; var s : councilStorage) : councilMembersType is
  s.councilMembers



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _: unit; var s : councilStorage) : whitelistContractsType is
  s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _: unit; var s : councilStorage) : generalContractsType is
  s.generalContracts



(* View: get a council action *)
[@view] function getCouncilActionOpt(const actionId: nat; var s : councilStorage) : option(councilActionRecordType) is
  Big_map.find_opt(actionId, s.councilActionsLedger)



(* View: get the action counter *)
[@view] function getActionCounter(const _: unit; var s : councilStorage) : nat is
  s.actionCounter



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : councilStorage) : option(bytes) is
  Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _: unit; var s : councilStorage) : lambdaLedgerType is
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
function setAdmin(const newAdminAddress : address; var s : councilStorage) : return is
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
function setGovernance(const newGovernanceAddress : address; var s : councilStorage) : return is
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
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : councilStorage) : return is
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
function updateConfig(const updateConfigParams : councilUpdateConfigParamsType; var s : councilStorage) : return is 
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
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: councilStorage): return is
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
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: councilStorage): return is
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
function updateCouncilMemberInfo(const councilMemberInfo: councilMemberInfoType; var s : councilStorage) : return is
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
function councilActionAddMember(const newCouncilMember : councilActionAddMemberType ; var s : councilStorage) : return is 
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
function councilActionRemoveMember(const councilMemberAddress : address ; var s : councilStorage) : return is 
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
function councilActionChangeMember(const councilActionChangeMemberParams : councilActionChangeMemberType; var s : councilStorage) : return is 
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
function councilActionSetBaker(const councilActionSetBakerParams : setBakerType; var s : councilStorage) : return is 
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
function councilActionUpdateBlocksPerMinute(const councilActionUpdateBlocksPerMinParam : councilActionUpdateBlocksPerMinType ; var s : councilStorage) : return is 
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
function councilActionAddVestee(const addVesteeParams : addVesteeType ; var s : councilStorage) : return is 
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
function councilActionRemoveVestee(const vesteeAddress : address ; var s : councilStorage) : return is 
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
function councilActionUpdateVestee(const updateVesteeParams : updateVesteeType; var s : councilStorage) : return is 
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
function councilActionToggleVesteeLock(const vesteeAddress : address ; var s : councilStorage) : return is 
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
function councilActionTransfer(const councilActionTransferParams : councilActionTransferType; var s : councilStorage) : return is 
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
function councilActionRequestTokens(const councilActionRequestTokensParams : councilActionRequestTokensType ; var s : councilStorage) : return is 
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
function councilActionRequestMint(const councilActionRequestMintParams : councilActionRequestMintType ; var s : councilStorage) : return is 
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
function councilActionSetContractBaker(const councilActionSetContractBakerParams : councilActionSetContractBakerType ; var s : councilStorage) : return is 
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
function councilActionDropFinancialRequest(const requestId : nat ; var s : councilStorage) : return is 
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
function flushAction(const actionId: flushActionType; var s : councilStorage) : return is 
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
function signAction(const actionId: signActionType; var s : councilStorage) : return is 
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
function setLambda(const setLambdaParams: setLambdaType; var s: councilStorage): return is
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
function main (const action : councilAction; const s : councilStorage) : return is 

    case action of [
      
          // Default Entrypoint to Receive Tez
          Default(_params)                              -> ((nil : list(operation)), s)

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