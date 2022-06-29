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

// Treasury types
#include "../partials/types/mvkTokenTypes.ligo"

// Treasury types
#include "../partials/types/treasuryTypes.ligo"

// Treasury factory types
#include "../partials/types/treasuryFactoryTypes.ligo"

// ------------------------------------------------------------------------------

type treasuryFactoryAction is

        // Housekeeping Entrypoints
        SetAdmin                            of (address)
    |   UpdateMetadata                      of (string * bytes)
    |   UpdateWhitelistContracts            of updateWhitelistContractsParams
    |   UpdateWhitelistTokenContracts       of updateWhitelistTokenContractsParams
    |   UpdateGeneralContracts              of updateGeneralContractsParams

        // Pause / Break Glass Entrypoints
    |   PauseAll                            of (unit)
    |   UnpauseAll                          of (unit)
    |   TogglePauseCreateTreasury           of (unit)
    |   TogglePauseTrackTreasury            of (unit)
    |   TogglePauseUntrackTreasury          of (unit)

        // Treasury Factory Entrypoints
    |   CreateTreasury                      of string
    |   TrackTreasury                       of address
    |   UntrackTreasury                     of address

        // Lambda Entrypoints
    |   SetLambda                           of setLambdaType


type return is list (operation) * treasuryFactoryStorage
const noOperations: list (operation) = nil;


// ------------------------------------------------------------------------------
//
// Error Codes Begin
//
// ------------------------------------------------------------------------------

[@inline] const error_ONLY_ADMINISTRATOR_ALLOWED                                             = 0n;
[@inline] const error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ                                      = 1n;

[@inline] const error_CREATE_TREASURY_ENTRYPOINT_IS_PAUSED                                   = 2n;
[@inline] const error_TRACK_TREASURY_ENTRYPOINT_IS_PAUSED                                    = 3n;
[@inline] const error_UNTRACK_TREASURY_ENTRYPOINT_NOT_FOUND                                  = 4n;

[@inline] const error_LAMBDA_NOT_FOUND                                                       = 5n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                                                = 6n;

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

function checkSenderIsAdmin(const s: treasuryFactoryStorage): unit is
  if Tezos.sender =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
  else unit



function checkNoAmount(const _p: unit): unit is
  if Tezos.amount =/= 0tez then failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ)
  else unit



// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"



// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"



// Whitelist Token Contracts: checkInWhitelistTokenContracts, updateWhitelistTokenContracts
#include "../partials/whitelistTokenContractsMethod.ligo"

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

function checkCreateTreasuryIsNotPaused(var s : treasuryFactoryStorage) : unit is
    if s.breakGlassConfig.createTreasuryIsPaused then failwith(error_CREATE_TREASURY_ENTRYPOINT_IS_PAUSED)
    else unit;



function checkTrackTreasuryIsNotPaused(var s : treasuryFactoryStorage) : unit is
    if s.breakGlassConfig.trackTreasuryIsPaused then failwith(error_TRACK_TREASURY_ENTRYPOINT_IS_PAUSED)
    else unit;



function checkUntrackTreasuryIsNotPaused(var s : treasuryFactoryStorage) : unit is
    if s.breakGlassConfig.untrackTreasuryIsPaused then failwith(error_UNTRACK_TREASURY_ENTRYPOINT_NOT_FOUND)
    else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Helper Functions End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: checkTreasuryExists *)
[@view] function checkTreasuryExists (const treasuryContract: address; const s: treasuryFactoryStorage): bool is 
    Set.mem(treasuryContract, s.trackedTreasuries)

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

(* setAdmin entrypoint *)
function setAdmin(const newAdminAddress: address; var s: treasuryFactoryStorage): return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;

} with (noOperations, s)



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const metadataKey: string; const metadataHash: bytes; var s : treasuryFactoryStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)
    // Update metadata
    s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);

} with (noOperations, s)



(* updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: treasuryFactoryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);

} with (noOperations, s)



(* updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: treasuryFactoryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);

} with (noOperations, s)



(* updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams: updateWhitelistTokenContractsParams; var s: treasuryFactoryStorage): return is
block {
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    s.whitelistTokenContracts := updateWhitelistTokenContractsMap(updateWhitelistTokenContractsParams, s.whitelistTokenContracts);

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(* pauseAll entrypoint *)
function pauseAll(var s: treasuryFactoryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    // set all pause configs to True
    if s.breakGlassConfig.createTreasuryIsPaused then skip
    else s.breakGlassConfig.createTreasuryIsPaused := True;

    if s.breakGlassConfig.trackTreasuryIsPaused then skip
    else s.breakGlassConfig.trackTreasuryIsPaused := True;

    if s.breakGlassConfig.untrackTreasuryIsPaused then skip
    else s.breakGlassConfig.untrackTreasuryIsPaused := True;

    var operations: list(operation) := nil;

    for treasuryAddress in set s.trackedTreasuries
    block {
        case (Tezos.get_entrypoint_opt("%pauseAll", treasuryAddress): option(contract(unit))) of [
            Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
        |   None -> skip
        ];
    };

} with (operations, s)



(* unpauseAll entrypoint *)
function unpauseAll(var s: treasuryFactoryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    // set all pause configs to False
    if s.breakGlassConfig.createTreasuryIsPaused then s.breakGlassConfig.createTreasuryIsPaused := False
    else skip;

    if s.breakGlassConfig.trackTreasuryIsPaused then s.breakGlassConfig.trackTreasuryIsPaused := False
    else skip;

    if s.breakGlassConfig.untrackTreasuryIsPaused then s.breakGlassConfig.untrackTreasuryIsPaused := False
    else skip;

    var operations: list(operation) := nil;

    for treasuryAddress in set s.trackedTreasuries
    block {
        case (Tezos.get_entrypoint_opt("%unpauseAll", treasuryAddress): option(contract(unit))) of [
            Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
        |   None -> skip
        ];
    };

} with (operations, s)



(* togglePauseCreateTreasury entrypoint *)
function togglePauseCreateTreasury(var s: treasuryFactoryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    if s.breakGlassConfig.createTreasuryIsPaused then s.breakGlassConfig.createTreasuryIsPaused := False
    else s.breakGlassConfig.createTreasuryIsPaused := True;

} with (noOperations, s)



(* togglePauseUntrackTreasury entrypoint *)
function togglePauseUntrackTreasury(var s: treasuryFactoryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    if s.breakGlassConfig.untrackTreasuryIsPaused then s.breakGlassConfig.untrackTreasuryIsPaused := False
    else s.breakGlassConfig.untrackTreasuryIsPaused := True;

} with (noOperations, s)



(* togglePauseTrackTreasury entrypoint *)
function togglePauseTrackTreasury(var s: treasuryFactoryStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    if s.breakGlassConfig.trackTreasuryIsPaused then s.breakGlassConfig.trackTreasuryIsPaused := False
    else s.breakGlassConfig.trackTreasuryIsPaused := True;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Treasury Factory Entrypoints Begin
// ------------------------------------------------------------------------------

(* createTreasury entrypoint *)
function createTreasury(const treasuryName: string; var s: treasuryFactoryStorage): return is 
block{
    // Check if Sender is admin
    checkSenderIsAdmin(s);

    // Break glass check
    checkCreateTreasuryIsNotPaused(s);

    // Add TreasuryFactory Address to whitelistContracts of created treasury
    const treasuryWhitelistContracts : whitelistContractsType = map[
        ("treasuryFactory") -> (Tezos.self_address: address);
        ("governance") -> (s.admin : address);
    ];
    const treasuryWhitelistTokenContracts : whitelistTokenContractsType = s.whitelistTokenContracts;

    const delegationAddress: address = case s.generalContracts["delegation"] of [ 
        Some (_address) -> _address
    |   None -> failwith("Delegation contract not found in general contracts")
    ];
    const treasuryGeneralContracts : generalContractsType = map[
        ("delegation") -> (delegationAddress : address);
    ];

    const treasuryBreakGlassConfig: treasuryBreakGlassConfigType = record[
        transferIsPaused           = False;
        mintMvkAndTransferIsPaused = False;
        stakeIsPaused              = False;
        unstakeIsPaused            = False;
    ];

    // Prepare Treasury Metadata
    const treasuryMetadataDescription: string = "MAVRYK Treasury Contract";
    const treasuryMetadataVersion: string = "v1.0.0";
    const treasuryMetadataName: string = "MAVRYK " ^ treasuryName ^ " Treasury";
    const treasuryMetadataAuthors: string = "MAVRYK Dev Team <contact@mavryk.finance>";
    const treasuryMetadataPlain: treasuryMetadataType = record[
        name                    = treasuryMetadataName;
        description             = treasuryMetadataDescription;
        version                 = treasuryMetadataVersion;
        authors                 = treasuryMetadataAuthors;
    ];
    const treasuryMetadata: metadata = Big_map.literal (list [
        ("", Bytes.pack(treasuryMetadataPlain));
    ]);
    const treasuryLambdaLedger : big_map(string, bytes) = Big_map.empty;

    const originatedTreasuryStorage : treasuryStorage = record[
        admin                     = s.admin;                         // admin will be the governance contract
        mvkTokenAddress           = s.mvkTokenAddress;
        metadata                  = treasuryMetadata;

        breakGlassConfig          = treasuryBreakGlassConfig;

        whitelistContracts        = treasuryWhitelistContracts;      // whitelist of contracts that can access restricted entrypoints
        whitelistTokenContracts   = treasuryWhitelistTokenContracts;      
        generalContracts          = treasuryGeneralContracts;

        lambdaLedger              = treasuryLambdaLedger;
    ];

    const treasuryOrigination: (operation * address) = createTreasuryFunc(
        (None: option(key_hash)), 
        0tez,
        originatedTreasuryStorage
    );

    s.trackedTreasuries := Set.add(treasuryOrigination.1, s.trackedTreasuries);

} with(list[treasuryOrigination.0], s)



(* trackTreasury entrypoint *)
function trackTreasury (const treasuryContract: address; var s: treasuryFactoryStorage): return is 
block{

    // Check if Sender is admin
    checkSenderIsAdmin(s);

    // Break glass check
    checkTrackTreasuryIsNotPaused(s);

    s.trackedTreasuries := case Set.mem(treasuryContract, s.trackedTreasuries) of [
          True  -> (failwith("Error. The provided treasury contract already exists in the trackedTreasuries set"): set(address))
        | False -> Set.add(treasuryContract, s.trackedTreasuries)
    ];

} with(noOperations, s)



(* untrackTreasury entrypoint *)
function untrackTreasury (const treasuryContract: address; var s: treasuryFactoryStorage): return is 
block{

    // Check if Sender is admin
    checkSenderIsAdmin(s);

    // Break glass check
    checkUntrackTreasuryIsNotPaused(s);

    s.trackedTreasuries := case Set.mem(treasuryContract, s.trackedTreasuries) of [
          True  -> Set.remove(treasuryContract, s.trackedTreasuries)
        | False -> (failwith("Error. The provided treasury contract does not exist in the trackedTreasuries set"): set(address))
    ];

} with(noOperations, s)

// ------------------------------------------------------------------------------
// Treasury Factory Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams: setLambdaType; var s: treasuryFactoryStorage): return is
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

(* Main entrypoint *)
function main (const action: treasuryFactoryAction; var s: treasuryFactoryStorage): return is
  block{
    
    // Check that sender didn't send any tez while calling an entrypoint
    checkNoAmount(Unit);

  } with(

    case action of [

            // Housekeeping Entrypoints
            SetAdmin (parameters)                       -> setAdmin(parameters, s)
        |   UpdateMetadata (parameters)                 -> updateMetadata(parameters.0, parameters.1, s)
        |   UpdateWhitelistContracts (parameters)       -> updateWhitelistContracts(parameters, s)
        |   UpdateWhitelistTokenContracts (parameters)  -> updateWhitelistTokenContracts(parameters, s)
        |   UpdateGeneralContracts (parameters)         -> updateGeneralContracts(parameters, s)
        
            // Pause / Break Glass Entrypoints
        |   PauseAll (_parameters)                      -> pauseAll(s)
        |   UnpauseAll (_parameters)                    -> unpauseAll(s)
        |   TogglePauseCreateTreasury (_parameters)     -> togglePauseCreateTreasury(s)
        |   TogglePauseTrackTreasury (_parameters)      -> togglePauseTrackTreasury(s)
        |   TogglePauseUntrackTreasury (_parameters)    -> togglePauseUntrackTreasury(s)

            // Treasury Factory Entrypoints
        |   CreateTreasury (params)                     -> createTreasury(params, s)
        |   TrackTreasury (params)                      -> trackTreasury(params, s)
        |   UntrackTreasury (params)                    -> untrackTreasury(params, s)

            // Lambda Entrypoints
        |   SetLambda (params)                          -> setLambda(params, s)
    ]
)