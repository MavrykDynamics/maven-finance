////
// TYPES INCLUDED
////
// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Whitelist Token Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams 
#include "../partials/whitelistTokenContractsType.ligo"

////
// COMMON TYPES
////
// type delegator is address
// type tokenBalance is nat

////
// MICHELSON Treasury TYPES
////

type treasuryBreakGlassConfigType is [@layout:comb] record [
    transferIsPaused            : bool; 
    mintMvkAndTransferIsPaused  : bool;
]

type treasuryStorageType is [@layout:comb] record[
    admin                        : address;
    mvkTokenAddress              : address;

    breakGlassConfig             : treasuryBreakGlassConfigType;
    
    whitelistContracts           : whitelistContractsType;      
    whitelistTokenContracts      : whitelistTokenContractsType;      
    generalContracts             : generalContractsType;
]


type createTreasuryActionType is [@layout:comb] record[
    transferIsPaused            : bool; 
    mintMvkAndTransferIsPaused  : bool;
]

type createTreasuryFuncType is (option(key_hash) * tez * treasuryStorageType) -> (operation * address)
const createTreasuryFunc: createTreasuryFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../compiled/treasury.tz"
        ;
          PAIR } |}
: createTreasuryFuncType)];

////
// STORAGE
////
type breakGlassConfigType is record [
    createTreasuryIsPaused     : bool;
    trackTreasuryIsPaused      : bool;
    untrackTreasuryIsPaused    : bool;
]

type storage is record[
    admin                      : address;
    mvkTokenAddress            : address;

    trackedTreasuries          : set(address);
    breakGlassConfig           : breakGlassConfigType;

    whitelistContracts         : whitelistContractsType;      // whitelist of contracts that can access restricted entrypoints
    whitelistTokenContracts    : whitelistTokenContractsType;
    generalContracts           : generalContractsType;
]

////
// RETURN TYPES
////
(* define return for readability *)
type return is list (operation) * storage
(* define noop for readability *)
const noOperations: list (operation) = nil;

////
// INPUTS
////

////
// ENTRYPOINTS
////
type treasuryFactoryAction is
        SetAdmin of (address)
    |   UpdateWhitelistContracts of updateWhitelistContractsParams
    |   UpdateWhitelistTokenContracts of updateWhitelistTokenContractsParams
    |   UpdateGeneralContracts of updateGeneralContractsParams

    |   PauseAll of (unit)
    |   UnpauseAll of (unit)
    |   TogglePauseCreateTreasury of (unit)
    |   TogglePauseTrackTreasury of (unit)
    |   TogglePauseUntrackTreasury of (unit)

    |   CreateTreasury of createTreasuryActionType
    |   TrackTreasury of address
    |   UntrackTreasury of address
    |   CheckTreasuryExists of address

////
// HELPER FUNCTIONS
///
(* Checks functions *)
function checkNoAmount(const _p: unit): unit is
  if Tezos.amount =/= 0tez then failwith("THIS_ENTRYPOINT_SHOULD_NOT_RECEIVE_XTZ")
  else unit

function checkSenderIsAdmin(const s: storage): unit is
  if Tezos.sender =/= s.admin then failwith("ONLY_ADMINISTRATOR_ALLOWED")
  else unit

////
// BREAK GLASS CHECKS
////

// break glass: checkIsNotPaused helper functions begin ---------------------------------------------------------
function checkCreateTreasuryIsNotPaused(var s : storage) : unit is
    if s.breakGlassConfig.createTreasuryIsPaused then failwith("Error. CreateTreasury entrypoint is paused.")
    else unit;

function checkTrackTreasuryIsNotPaused(var s : storage) : unit is
    if s.breakGlassConfig.trackTreasuryIsPaused then failwith("TrackTreasury entrypoint is paused.")
    else unit;

function checkUntrackTreasuryIsNotPaused(var s : storage) : unit is
    if s.breakGlassConfig.untrackTreasuryIsPaused then failwith("UntrackTreasury entrypoint is paused.")
    else unit;

////
// FUNCTIONS INCLUDED
////
// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

// Whitelist Token Contracts: checkInWhitelistTokenContracts, updateWhitelistTokenContracts
#include "../partials/whitelistTokenContractsMethod.ligo"

////
// BREAK GLASS FUNCTIONS
///
function pauseAll(var s: storage): return is
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
            case (Tezos.get_entrypoint_opt("%pauseAll", treasuryAddress): option(contract(unit))) of
                Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
            |   None -> skip
            end;
        };

    } with (operations, s)

function unpauseAll(var s: storage): return is
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
            case (Tezos.get_entrypoint_opt("%unpauseAll", treasuryAddress): option(contract(unit))) of
                Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
            |   None -> skip
            end;
        };

    } with (operations, s)

function togglePauseCreateTreasury(var s: storage): return is
    block {
        // check that sender is admin
        checkSenderIsAdmin(s);

        if s.breakGlassConfig.createTreasuryIsPaused then s.breakGlassConfig.createTreasuryIsPaused := False
        else s.breakGlassConfig.createTreasuryIsPaused := True;

    } with (noOperations, s)

function togglePauseUntrackTreasury(var s: storage): return is
    block {
        // check that sender is admin
        checkSenderIsAdmin(s);

        if s.breakGlassConfig.untrackTreasuryIsPaused then s.breakGlassConfig.untrackTreasuryIsPaused := False
        else s.breakGlassConfig.untrackTreasuryIsPaused := True;

    } with (noOperations, s)

function togglePauseTrackTreasury(var s: storage): return is
    block {
        // check that sender is admin
        checkSenderIsAdmin(s);

        if s.breakGlassConfig.trackTreasuryIsPaused then s.breakGlassConfig.trackTreasuryIsPaused := False
        else s.breakGlassConfig.trackTreasuryIsPaused := True;

    } with (noOperations, s)

////
// ENTRYPOINTS FUNCTIONS
///

(*  set contract admin address *)
function setAdmin(const newAdminAddress: address; var s: storage): return is
block {
    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;
} with (noOperations, s)

(* CreateTreasury entrypoint *)
function createTreasury(const createTreasuryParams: createTreasuryActionType; var s: storage): return is 
    block{
        // Check if Sender is admin
        checkSenderIsAdmin(s);

        // Break glass check
        checkCreateTreasuryIsNotPaused(s);

        const transferIsPaused            : bool  = createTreasuryParams.transferIsPaused;
        const mintMvkAndTransferIsPaused  : bool  = createTreasuryParams.mintMvkAndTransferIsPaused;

        // Add TreasuryFactory Address to whitelistContracts of created treasury
        const treasuryWhitelistContracts : whitelistContractsType = map[
            ("treasuryFactory") -> (Tezos.self_address: address);
            ("governance") -> (s.admin : address);
        ];

        const treasuryWhitelistTokenContracts : whitelistTokenContractsType = s.whitelistTokenContracts;

        const treasuryGeneralContracts : generalContractsType = map[];

        const treasuryBreakGlassConfig: treasuryBreakGlassConfigType = record[
            transferIsPaused           = transferIsPaused;
            mintMvkAndTransferIsPaused = mintMvkAndTransferIsPaused;
        ];

        const originatedTreasuryStorage : treasuryStorageType = record[
            admin                   = s.admin;                    // admin will be the governance contract
            mvkTokenAddress         = s.mvkTokenAddress;

            breakGlassConfig        = treasuryBreakGlassConfig;

            whitelistContracts        = treasuryWhitelistContracts;      // whitelist of contracts that can access restricted entrypoints
            whitelistTokenContracts   = treasuryWhitelistTokenContracts;      
            generalContracts          = treasuryGeneralContracts;
        ];


        const treasuryOrigination: (operation * address) = createTreasuryFunc(
            (None: option(key_hash)), 
            0tez,
            originatedTreasuryStorage
        );

        s.trackedTreasuries := Set.add(treasuryOrigination.1, s.trackedTreasuries);

    } with(list[treasuryOrigination.0], s)

(* CheckTreasuryExists entrypoint *)
function checkTreasuryExists (const treasuryContract: address; const s: storage): return is 
    case Set.mem(treasuryContract, s.trackedTreasuries) of
        True -> (noOperations, s)
    |   False -> failwith("Error. The provided treasury contract does not exist in the trackedTreasuries set")
    end

(* TrackTreasury entrypoint *)
function trackTreasury (const treasuryContract: address; var s: storage): return is 
    block{
        // Check if Sender is admin
        checkSenderIsAdmin(s);

        // Break glass check
        checkTrackTreasuryIsNotPaused(s);

        s.trackedTreasuries := case Set.mem(treasuryContract, s.trackedTreasuries) of
            True -> (failwith("Error. The provided treasury contract already exists in the trackedTreasuries set"): set(address))
        |   False -> Set.add(treasuryContract, s.trackedTreasuries)
        end;

    } with(noOperations, s)

(* UntrackTreasury entrypoint *)
function untrackTreasury (const treasuryContract: address; var s: storage): return is 
    block{
        // Check if Sender is admin
        checkSenderIsAdmin(s);

        // Break glass check
        checkUntrackTreasuryIsNotPaused(s);

        s.trackedTreasuries := case Set.mem(treasuryContract, s.trackedTreasuries) of
            True -> Set.remove(treasuryContract, s.trackedTreasuries)
        |   False -> (failwith("Error. The provided treasury contract does not exist in the trackedTreasuries set"): set(address))
        end;
    } with(noOperations, s)

(* Main entrypoint *)
function main (const action: treasuryFactoryAction; var s: storage): return is
  block{
    // Check that sender didn't send Tezos while calling an entrypoint
    checkNoAmount(Unit);
  } with(
    case action of
        SetAdmin (parameters) -> setAdmin(parameters, s)
    |   UpdateWhitelistContracts (parameters) -> updateWhitelistContracts(parameters, s)
    |   UpdateWhitelistTokenContracts(parameters) -> updateWhitelistTokenContracts(parameters, s)
    |   UpdateGeneralContracts (parameters) -> updateGeneralContracts(parameters, s)
    
    |   PauseAll (_parameters) -> pauseAll(s)
    |   UnpauseAll (_parameters) -> unpauseAll(s)
    |   TogglePauseCreateTreasury (_parameters) -> togglePauseCreateTreasury(s)
    |   TogglePauseTrackTreasury (_parameters) -> togglePauseTrackTreasury(s)
    |   TogglePauseUntrackTreasury (_parameters) -> togglePauseUntrackTreasury(s)

    |   CreateTreasury (params) -> createTreasury(params, s)
    |   TrackTreasury (params) -> trackTreasury(params, s)
    |   UntrackTreasury (params) -> untrackTreasury(params, s)

    |   CheckTreasuryExists (params) -> checkTreasuryExists(params, s)
    end
  )