// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// MvkToken types for transfer
#include "../partials/types/mvkTokenTypes.ligo"

// Vesting types for vesting council actions
#include "../partials/types/vestingTypes.ligo"

// Whitelist Token Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams 
#include "../partials/whitelistTokenContractsType.ligo"

// Treasury types for transfer and mint
#include "../partials/types/treasuryTypes.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/types/councilTypes.ligo"

type councilAction is 
    | Default                           of unit

    // Housekeeping Actions
    | SetAdmin                          of address
    | UpdateMetadata                    of (string * bytes)
    | UpdateConfig                      of councilUpdateConfigParamsType
    | UpdateWhitelistContracts          of updateWhitelistContractsParams
    | UpdateGeneralContracts            of updateGeneralContractsParams
    | UpdateCouncilMemberInfo           of councilMemberInfoType

    // Council Actions for Internal Control
    | CouncilActionAddMember            of councilActionAddMemberType
    | CouncilActionRemoveMember         of address
    | CouncilActionChangeMember         of councilActionChangeMemberType

    // Council Actions for Contracts
    | CouncilActionUpdateBlocksPerMin   of councilActionUpdateBlocksPerMinType

    // Council Actions for Vesting
    | CouncilActionAddVestee            of addVesteeType
    | CouncilActionRemoveVestee         of address
    | CouncilActionUpdateVestee         of updateVesteeType
    | CouncilActionToggleVesteeLock     of address

    // Council Actions for Financial Governance
    | CouncilActionTransfer             of councilActionTransferType
    | CouncilActionRequestTokens        of councilActionRequestTokensType
    | CouncilActionRequestMint          of councilActionRequestMintType
    | CouncilActionDropFinancialReq     of nat

    // Council Signing of Actions
    | FlushAction                       of flushActionType
    | SignAction                        of signActionType                

    // Lambda Entrypoints
    | SetLambda                         of setLambdaType

const noOperations : list (operation) = nil;
type return is list (operation) * councilStorage


// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

function checkSenderIsAdmin(var s : councilStorage) : unit is
    if (Tezos.sender = s.admin) then unit
        else failwith("Only the administrator can call this entrypoint.");



function checkSenderIsCouncilMember(var s : councilStorage) : unit is
    if Map.mem(Tezos.sender, s.councilMembers) then unit 
        else failwith("Only council members can call this entrypoint.");



function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
        else failwith("This entrypoint should not receive any tez.");



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
  | None -> (failwith("updateBlocksPerMinutes entrypoint in Contract not found") : contract(nat))
];



function sendAddVesteeParams(const contractAddress : address) : contract(addVesteeType) is
  case (Tezos.get_entrypoint_opt(
      "%addVestee",
      contractAddress) : option(contract(addVesteeType))) of [
    Some(contr) -> contr
  | None -> (failwith("addVestee entrypoint in Vesting Contract not found") : contract(addVesteeType))
];



function sendRemoveVesteeParams(const contractAddress : address) : contract(address) is
  case (Tezos.get_entrypoint_opt(
      "%removeVestee",
      contractAddress) : option(contract(address))) of [
    Some(contr) -> contr
  | None -> (failwith("removeVestee entrypoint in Vesting Contract not found") : contract(address))
];



function sendUpdateVesteeParams(const contractAddress : address) : contract(updateVesteeType) is
case (Tezos.get_entrypoint_opt(
    "%updateVestee",
    contractAddress) : option(contract(updateVesteeType))) of [
Some(contr) -> contr
| None -> (failwith("updateVestee entrypoint in Vesting Contract not found") : contract(updateVesteeType))
];



function sendToggleVesteeLockParams(const contractAddress : address) : contract(address) is
case (Tezos.get_entrypoint_opt(
    "%toggleVesteeLock",
    contractAddress) : option(contract(address))) of [
Some(contr) -> contr
| None -> (failwith("toggleVesteeLock entrypoint in Vesting Contract not found") : contract(address))
];



function sendRequestTokensParams(const contractAddress : address) : contract(councilActionRequestTokensType) is
  case (Tezos.get_entrypoint_opt(
      "%requestTokens",
      contractAddress) : option(contract(councilActionRequestTokensType))) of [
    Some(contr) -> contr
  | None -> (failwith("requestTokens entrypoint in Governance Contract not found") : contract(councilActionRequestTokensType))
];



function sendRequestMintParams(const contractAddress : address) : contract(councilActionRequestMintType) is
  case (Tezos.get_entrypoint_opt(
      "%requestMint",
      contractAddress) : option(contract(councilActionRequestMintType))) of [
    Some(contr) -> contr
  | None -> (failwith("requestMint entrypoint in Governance Contract not found") : contract(councilActionRequestMintType))
];



function sendDropFinancialRequestParams(const contractAddress : address) : contract(nat) is
  case (Tezos.get_entrypoint_opt(
      "%dropFinancialRequest",
      contractAddress) : option(contract(nat))) of [
    Some(contr) -> contr
  | None -> (failwith("dropFinancialRequest entrypoint in Governance Contract not found") : contract(nat))
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
            |   None -> (failwith("Error. Transfer entrypoint not found in FA12 Token contract"): contract(fa12TransferType))
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
        |   None -> (failwith("Error. Transfer entrypoint not found in FA2 Token contract"): contract(fa2TransferType))
        ];
} with (Tezos.transaction(transferParams, 0tez, tokenContract))

// ------------------------------------------------------------------------------
// Transfer Helper Functions End
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
      | None     -> failwith("Error. setAdmin Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * councilStorage) -> return )) of [
      | Some(f) -> f(newAdminAddress, s)
      | None    -> failwith("Error. Unable to unpack Council setAdmin Lambda.")
    ];

} with (res.0, res.1)



(*  updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const metadataKey: string; const metadataHash: bytes; var s : councilStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. updateMetadata Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((string * bytes * councilStorage) -> return )) of [
      | Some(f) -> f(metadataKey, metadataHash, s)
      | None    -> failwith("Error. Unable to unpack Council updateMetadata Lambda.")
    ];

} with (res.0, res.1)



(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : councilUpdateConfigParamsType; var s : councilStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. updateConfig Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((councilUpdateConfigParamsType * councilStorage) -> return )) of [
      | Some(f) -> f(updateConfigParams, s)
      | None    -> failwith("Error. Unable to unpack Council updateConfig Lambda.")
    ];

} with (res.0, res.1)



(*  updateWhitelistContracts entrypoint  *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: councilStorage): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. updateWhitelistContracts Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((updateWhitelistContractsParams * councilStorage) -> return )) of [
      | Some(f) -> f(updateWhitelistContractsParams, s)
      | None    -> failwith("Error. Unable to unpack Council updateWhitelistContracts Lambda.")
    ];

} with (res.0, res.1)



(*  updateGeneralContracts entrypoint  *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: councilStorage): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. updateGeneralContracts Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((updateGeneralContractsParams * councilStorage) -> return )) of [
      | Some(f) -> f(updateGeneralContractsParams, s)
      | None    -> failwith("Error. Unable to unpack Council updateGeneralContracts Lambda.")
    ];

} with (res.0, res.1)



(*  updateCouncilMemberInfo entrypoint - update the info of a council member *)
function updateCouncilMemberInfo(const councilMemberInfo: councilMemberInfoType; var s : councilStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateCouncilMemberInfo"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. updateCouncilMemberInfo Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((councilMemberInfoType * councilStorage) -> return )) of [
      | Some(f) -> f(councilMemberInfo, s)
      | None    -> failwith("Error. Unable to unpack Council updateCouncilMemberInfo Lambda.")
    ];

} with (res.0, res.1)

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
      | None     -> failwith("Error. councilActionAddMember Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((councilActionAddMemberType * councilStorage) -> return )) of [
      | Some(f) -> f(newCouncilMember, s)
      | None    -> failwith("Error. Unable to unpack Council councilActionAddMember Lambda.")
    ];

} with (res.0, res.1)



(*  councilActionRemoveMember entrypoint  *)
function councilActionRemoveMember(const councilMemberAddress : address ; var s : councilStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionRemoveMember"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. councilActionRemoveMember Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * councilStorage) -> return )) of [
      | Some(f) -> f(councilMemberAddress, s)
      | None    -> failwith("Error. Unable to unpack Council councilActionRemoveMember Lambda.")
    ];

} with (res.0, res.1)



(*  councilActionChangeMember entrypoint  *)
function councilActionChangeMember(const councilActionChangeMemberParams : councilActionChangeMemberType; var s : councilStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionChangeMember"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. councilActionChangeMember Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((councilActionChangeMemberType * councilStorage) -> return )) of [
      | Some(f) -> f(councilActionChangeMemberParams, s)
      | None    -> failwith("Error. Unable to unpack Council councilActionChangeMember Lambda.")
    ];

} with (res.0, res.1)



(*  councilActionTransfer entrypoint  *)
function councilActionTransfer(const councilActionTransferParams : councilActionTransferType; var s : councilStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionTransfer"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. councilActionTransfer Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((councilActionTransferType * councilStorage) -> return )) of [
      | Some(f) -> f(councilActionTransferParams, s)
      | None    -> failwith("Error. Unable to unpack Council councilActionTransfer Lambda.")
    ];

} with (res.0, res.1)

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
      | None     -> failwith("Error. councilActionUpdateBlocksPerMinute Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((councilActionUpdateBlocksPerMinType * councilStorage) -> return )) of [
      | Some(f) -> f(councilActionUpdateBlocksPerMinParam, s)
      | None    -> failwith("Error. Unable to unpack Council councilActionUpdateBlocksPerMinute Lambda.")
    ];

} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Council Actions for Contracts Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Council Actions for Vesting Entrypoints Begin
// ------------------------------------------------------------------------------

(*  councilActionAddVestee entrypoint  *)
function councilActionAddVestee(const addVestee : addVesteeType ; var s : councilStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionAddVestee"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. councilActionAddVestee Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((addVesteeType * councilStorage) -> return )) of [
      | Some(f) -> f(addVestee, s)
      | None    -> failwith("Error. Unable to unpack Council councilActionAddVestee Lambda.")
    ];

} with (res.0, res.1)



(*  councilActionRemoveVestee entrypoint  *)
function councilActionRemoveVestee(const vesteeAddress : address ; var s : councilStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionRemoveVestee"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. councilActionRemoveVestee Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * councilStorage) -> return )) of [
      | Some(f) -> f(vesteeAddress, s)
      | None    -> failwith("Error. Unable to unpack Council councilActionRemoveVestee Lambda.")
    ];

} with (res.0, res.1)



(*  councilActionUpdateVestee entrypoint  *)
function councilActionUpdateVestee(const updateVestee : updateVesteeType; var s : councilStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionUpdateVestee"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. councilActionUpdateVestee Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((updateVesteeType * councilStorage) -> return )) of [
      | Some(f) -> f(updateVestee, s)
      | None    -> failwith("Error. Unable to unpack Council councilActionUpdateVestee Lambda.")
    ];

} with (res.0, res.1)



(*  councilActionToggleVesteeLock entrypoint  *)
function councilActionToggleVesteeLock(const vesteeAddress : address ; var s : councilStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionToggleVesteeLock"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. councilActionToggleVesteeLock Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * councilStorage) -> return )) of [
      | Some(f) -> f(vesteeAddress, s)
      | None    -> failwith("Error. Unable to unpack Council councilActionToggleVesteeLock Lambda.")
    ];

} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Council Actions for Vesting Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Council Actions for Financial Governance Begin
// ------------------------------------------------------------------------------

(*  councilActionRequestTokens entrypoint  *)
function councilActionRequestTokens(const councilActionRequestTokensParams : councilActionRequestTokensType ; var s : councilStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionRequestTokens"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. councilActionRequestTokens Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((councilActionRequestTokensType * councilStorage) -> return )) of [
      | Some(f) -> f(councilActionRequestTokensParams, s)
      | None    -> failwith("Error. Unable to unpack Council councilActionRequestTokens Lambda.")
    ];

} with (res.0, res.1)



(*  councilActionRequestMint entrypoint  *)
function councilActionRequestMint(const councilActionRequestMintParams : councilActionRequestMintType ; var s : councilStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionRequestMint"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. councilActionRequestMint Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((councilActionRequestMintType * councilStorage) -> return )) of [
      | Some(f) -> f(councilActionRequestMintParams, s)
      | None    -> failwith("Error. Unable to unpack Council councilActionRequestMint Lambda.")
    ];

} with (res.0, res.1)



(*  councilActionDropFinancialRequest entrypoint  *)
function councilActionDropFinancialRequest(const requestId : nat ; var s : councilStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaCouncilActionDropFinancialRequest"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. councilActionDropFinancialRequest Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((nat * councilStorage) -> return )) of [
      | Some(f) -> f(requestId, s)
      | None    -> failwith("Error. Unable to unpack Council councilActionDropFinancialRequest Lambda.")
    ];

} with (res.0, res.1)

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
      | None     -> failwith("Error. flushAction Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((flushActionType * councilStorage) -> return )) of [
      | Some(f) -> f(actionId, s)
      | None    -> failwith("Error. Unable to unpack Council flushAction Lambda.")
    ];

} with (res.0, res.1)



(*  signAction entrypoint  *)
function signAction(const actionId: signActionType; var s : councilStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSignAction"] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. signAction Lambda not found.")
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((signActionType * councilStorage) -> return )) of [
      | Some(f) -> f(actionId, s)
      | None    -> failwith("Error. Unable to unpack Council signAction Lambda.")
    ];

} with (res.0, res.1)

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



function main (const action : councilAction; const s : councilStorage) : return is 
    case action of [
        | Default(_params)                              -> ((nil : list(operation)), s)

        // Housekeeping Actions
        | SetAdmin(parameters)                          -> setAdmin(parameters, s)
        | UpdateMetadata(parameters)                    -> updateMetadata(parameters.0, parameters.1, s)  
        | UpdateConfig(parameters)                      -> updateConfig(parameters, s)
        | UpdateWhitelistContracts(parameters)          -> updateWhitelistContracts(parameters, s)
        | UpdateGeneralContracts(parameters)            -> updateGeneralContracts(parameters, s)
        | UpdateCouncilMemberInfo(parameters)           -> updateCouncilMemberInfo(parameters, s)
        
        // Council Actions for Internal Control
        | CouncilActionAddMember(parameters)            -> councilActionAddMember(parameters, s)
        | CouncilActionRemoveMember(parameters)         -> councilActionRemoveMember(parameters, s)
        | CouncilActionChangeMember(parameters)         -> councilActionChangeMember(parameters, s)

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
        | CouncilActionDropFinancialReq(parameters)     -> councilActionDropFinancialRequest(parameters, s)

        // Council Signing of Actions 
        | FlushAction(parameters)                       -> flushAction(parameters, s)
        | SignAction(parameters)                        -> signAction(parameters, s)

        // Lambda Entrypoints
        | SetLambda(parameters)                         -> setLambda(parameters, s)
    ]