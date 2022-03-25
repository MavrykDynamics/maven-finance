////
// TYPES INCLUDED
////
// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

////
// COMMON TYPES
////
type delegator is address
type tokenBalance is nat

////
// MICHELSON FARM TYPES
////
type delegatorRecord is [@layout:comb] record[
    balance: tokenBalance;
    participationMVKPerShare: tokenBalance;
    unclaimedRewards: tokenBalance;
]
type claimedRewards is [@layout:comb] record[
    unpaid: tokenBalance;
    paid: tokenBalance;
]
type plannedRewards is [@layout:comb] record[
    totalBlocks: nat;
    currentRewardPerBlock: tokenBalance;
    totalRewards: tokenBalance;
]
type lpStandard is
    Fa12 of unit
|   Fa2 of unit
type lpToken is [@layout:comb] record[
    tokenAddress: address;
    tokenId: nat;
    tokenStandard: lpStandard;
    tokenBalance: tokenBalance;
]

type farmBreakGlassConfigType is [@layout:comb] record [
    depositIsPaused        : bool;
    withdrawIsPaused       : bool;
    claimIsPaused          : bool;
]

type farmStorage is record[
    admin                   : address;
    mvkTokenAddress         : address;
    
    whitelistContracts      : whitelistContractsType;      // whitelist of contracts that can access restricted entrypoints
    generalContracts        : generalContractsType;

    breakGlassConfig        : farmBreakGlassConfigType;

    lastBlockUpdate         : nat;
    accumulatedMVKPerShare  : tokenBalance;
    claimedRewards          : claimedRewards;
    plannedRewards          : plannedRewards;
    delegators              : big_map(delegator, delegatorRecord);
    lpToken                 : lpToken;
    open                    : bool;
    init                    : bool;
    infinite                : bool;
    forceRewardFromTransfer : bool;
    initBlock               : nat;
    blocksPerMinute         : nat;
]

type farmLpToken is [@layout:comb] record [
    tokenAddress   : address;
    tokenId        : nat;
    tokenStandard  : lpStandard;
]

type farmPlannedRewards is [@layout:comb] record [
    totalBlocks: nat;
    currentRewardPerBlock: tokenBalance;
]

type farmStorageType is [@layout:comb] record[
    forceRewardFromTransfer : bool;
    infinite                : bool;
    plannedRewards          : farmPlannedRewards;
    lpToken                 : farmLpToken;
]

type createFarmFuncType is (option(key_hash) * tez * farmStorage) -> (operation * address)
const createFarmFunc: createFarmFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../compiled/farm.tz"
        ;
          PAIR } |}
: createFarmFuncType)];

type initFarmParamsType is record[
    totalBlocks: nat;
    currentRewardPerBlock: nat;
]

////
// STORAGE
////
type breakGlassConfigType is record [
    createFarmIsPaused     : bool;
    trackFarmIsPaused      : bool;
    untrackFarmIsPaused    : bool;
]

type storage is record[
    admin                  : address;
    mvkTokenAddress        : address;

    whitelistContracts     : whitelistContractsType;      // whitelist of contracts that can access restricted entrypoints
    generalContracts       : generalContractsType;

    breakGlassConfig       : breakGlassConfigType;

    trackedFarms           : set(address);
    blocksPerMinute        : nat;
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
type action is
    SetAdmin of (address)
|   UpdateWhitelistContracts of updateWhitelistContractsParams
|   UpdateGeneralContracts of updateGeneralContractsParams
|   UpdateBlocksPerMinute of (nat)

|   PauseAll of (unit)
|   UnpauseAll of (unit)
|   TogglePauseCreateFarm of (unit)
|   TogglePauseTrackFarm of (unit)
|   TogglePauseUntrackFarm of (unit)

|   CreateFarm of farmStorageType
|   TrackFarm of address
|   UntrackFarm of address

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
function checkCreateFarmIsNotPaused(var s : storage) : unit is
    if s.breakGlassConfig.createFarmIsPaused then failwith("CreateFarm entrypoint is paused.")
    else unit;

function checkTrackFarmIsNotPaused(var s : storage) : unit is
    if s.breakGlassConfig.trackFarmIsPaused then failwith("TrackFarm entrypoint is paused.")
    else unit;

function checkUntrackFarmIsNotPaused(var s : storage) : unit is
    if s.breakGlassConfig.untrackFarmIsPaused then failwith("UntrackFarm entrypoint is paused.")
    else unit;

////
// FUNCTIONS INCLUDED
////
// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

////
// BREAK GLASS FUNCTIONS
///
function pauseAll(var s: storage): return is
    block {
        // check that sender is admin
        checkSenderIsAdmin(s);

        // set all pause configs to True
        if s.breakGlassConfig.createFarmIsPaused then skip
        else s.breakGlassConfig.createFarmIsPaused := True;

        if s.breakGlassConfig.trackFarmIsPaused then skip
        else s.breakGlassConfig.trackFarmIsPaused := True;

        if s.breakGlassConfig.untrackFarmIsPaused then skip
        else s.breakGlassConfig.untrackFarmIsPaused := True;

        var operations: list(operation) := nil;

        for farmAddress in set s.trackedFarms 
        block {
            case (Tezos.get_entrypoint_opt("%pauseAll", farmAddress): option(contract(unit))) of [
                Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
            |   None -> skip
            ];
        };

    } with (operations, s)

function unpauseAll(var s: storage): return is
    block {
        // check that sender is admin
        checkSenderIsAdmin(s);

        // set all pause configs to False
        if s.breakGlassConfig.createFarmIsPaused then s.breakGlassConfig.createFarmIsPaused := False
        else skip;

        if s.breakGlassConfig.trackFarmIsPaused then s.breakGlassConfig.trackFarmIsPaused := False
        else skip;

        if s.breakGlassConfig.untrackFarmIsPaused then s.breakGlassConfig.untrackFarmIsPaused := False
        else skip;

        var operations: list(operation) := nil;

        for farmAddress in set s.trackedFarms 
        block {
            case (Tezos.get_entrypoint_opt("%unpauseAll", farmAddress): option(contract(unit))) of [
                Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
            |   None -> skip
            ];
        };

    } with (operations, s)

function togglePauseCreateFarm(var s: storage): return is
    block {
        // check that sender is admin
        checkSenderIsAdmin(s);

        if s.breakGlassConfig.createFarmIsPaused then s.breakGlassConfig.createFarmIsPaused := False
        else s.breakGlassConfig.createFarmIsPaused := True;

    } with (noOperations, s)

function togglePauseUntrackFarm(var s: storage): return is
    block {
        // check that sender is admin
        checkSenderIsAdmin(s);

        if s.breakGlassConfig.untrackFarmIsPaused then s.breakGlassConfig.untrackFarmIsPaused := False
        else s.breakGlassConfig.untrackFarmIsPaused := True;

    } with (noOperations, s)

function togglePauseTrackFarm(var s: storage): return is
    block {
        // check that sender is admin
        checkSenderIsAdmin(s);

        if s.breakGlassConfig.trackFarmIsPaused then s.breakGlassConfig.trackFarmIsPaused := False
        else s.breakGlassConfig.trackFarmIsPaused := True;

    } with (noOperations, s)

////
// ENTRYPOINTS FUNCTIONS
///
(*  UpdateBlocksPerMinute entrypoint *)
function updateBlocksPerMinute(const newBlocksPerMinutes: nat; var s: storage): return is
    block {
        // check that sender is admin
        checkSenderIsAdmin(s);

        var operations: list(operation) := nil;

        for farmAddress in set s.trackedFarms 
        block {
            case (Tezos.get_entrypoint_opt("%updateBlocksPerMinute", farmAddress): option(contract(nat))) of [
                Some(contr) -> operations := Tezos.transaction(newBlocksPerMinutes, 0tez, contr) # operations
            |   None -> skip
            ];
        };

        s.blocksPerMinute := newBlocksPerMinutes;

    } with (operations, s)

(*  set contract admin address *)
function setAdmin(const newAdminAddress: address; var s: storage): return is
block {
    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;
} with (noOperations, s)

(* CheckFarmExists view *)
[@view] function checkFarmExists (const farmContract: address; const s: storage): bool is 
    Set.mem(farmContract, s.trackedFarms)

(* CreateFarm entrypoint *)
function createFarm(const farmStorage: farmStorageType; var s: storage): return is 
    block{
        // Check if Sender is admin
        checkSenderIsAdmin(s);

        // Break glass check
        checkCreateFarmIsNotPaused(s);

        // Add FarmFactory Address to whitelistContracts of created farm
        const councilAddress: address = case s.whitelistContracts["council"] of [ 
            Some (_address) -> _address
        |   None -> failwith("Council contract not found in whitelist contracts")
        ];
        const farmWhitelistContract: whitelistContractsType = map[
            ("farmFactory") -> (Tezos.self_address: address);
            ("council") -> (councilAddress: address)
        ];

        // Add FarmFactory Address to doormanContracts of created farm
        const doormanAddress: address = case s.generalContracts["doorman"] of [ 
            Some (_address) -> _address
        |   None -> failwith("Doorman contract not found in general contracts")
        ];
        const farmGeneralContracts: generalContractsType = map[
            ("doorman") -> (doormanAddress: address)
        ];

        // Create needed records for farm contract
        const farmDelegators: big_map(delegator, delegatorRecord) = Big_map.empty;
        const farmClaimedRewards: claimedRewards = record[
            paid=0n;
            unpaid=0n;
        ];
        const farmForceRewardFromTransfer: bool = farmStorage.forceRewardFromTransfer;
        const farmInfinite: bool = farmStorage.infinite;
        const farmTotalRewards: nat = farmStorage.plannedRewards.totalBlocks*farmStorage.plannedRewards.currentRewardPerBlock;
        const farmPlannedRewards: plannedRewards = record[
            totalBlocks=farmStorage.plannedRewards.totalBlocks;
            currentRewardPerBlock=farmStorage.plannedRewards.currentRewardPerBlock;
            totalRewards=farmTotalRewards;
        ];
        const farmLPToken: lpToken = record[
            tokenAddress=farmStorage.lpToken.tokenAddress;
            tokenId=farmStorage.lpToken.tokenId;
            tokenStandard=farmStorage.lpToken.tokenStandard;
            tokenBalance=0n;
        ];
        const farmBreakGlassConfig: farmBreakGlassConfigType = record[
            depositIsPaused=False;
            withdrawIsPaused=False;
            claimIsPaused=False;
        ];

        // Check wether the farm is infinite or its total blocks has been set
        if not farmInfinite and farmStorage.plannedRewards.totalBlocks = 0n then failwith("This farm should be either infinite or have a specified duration") else skip;

        // Create a farm and auto init it?
        const originatedFarmStorage: farmStorage = record[
            admin                   = s.admin; // If governance is the admin, it makes sense that the factory passes its admin to the farm it creates
            mvkTokenAddress         = s.mvkTokenAddress;
            whitelistContracts      = farmWhitelistContract;      // whitelist of contracts that can access restricted entrypoints
            generalContracts        = farmGeneralContracts;

            breakGlassConfig        = farmBreakGlassConfig;

            lastBlockUpdate         = Tezos.level;
            accumulatedMVKPerShare  = 0n;
            claimedRewards          = farmClaimedRewards;
            plannedRewards          = farmPlannedRewards;
            delegators              = farmDelegators;
            lpToken                 = farmLPToken;
            open                    = True ;
            init                    = True;
            infinite                = farmInfinite;
            forceRewardFromTransfer = farmForceRewardFromTransfer;
            initBlock               = Tezos.level;
            blocksPerMinute         = s.blocksPerMinute;
        ];

        // Do we want to send tez to the farm contract?
        const farmOrigination: (operation * address) = createFarmFunc(
            (None: option(key_hash)), 
            0tez,
            originatedFarmStorage
        );

        s.trackedFarms := Set.add(farmOrigination.1, s.trackedFarms);

    } with(list[farmOrigination.0], s)

(* TrackFarm entrypoint *)
function trackFarm (const farmContract: address; var s: storage): return is 
    block{
        // Check if Sender is admin
        checkSenderIsAdmin(s);

        // Break glass check
        checkTrackFarmIsNotPaused(s);

        s.trackedFarms := case Set.mem(farmContract, s.trackedFarms) of [
            True -> (failwith("The provided farm contract already exists in the trackedFarms set"): set(address))
        |   False -> Set.add(farmContract, s.trackedFarms)
        ];
    } with(noOperations, s)

(* UntrackFarm entrypoint *)
function untrackFarm (const farmContract: address; var s: storage): return is 
    block{
        // Check if Sender is admin
        checkSenderIsAdmin(s);

        // Break glass check
        checkUntrackFarmIsNotPaused(s);

        s.trackedFarms := case Set.mem(farmContract, s.trackedFarms) of [
            True -> Set.remove(farmContract, s.trackedFarms)
        |   False -> (failwith("The provided farm contract does not exist in the trackedFarms set"): set(address))
        ];
    } with(noOperations, s)

(* Main entrypoint *)
function main (const action: action; var s: storage): return is
  block{
    // Check that sender didn't send Tezos while calling an entrypoint
    checkNoAmount(Unit);
  } with(
    case action of [
        SetAdmin (parameters) -> setAdmin(parameters, s)
    |   UpdateWhitelistContracts (parameters) -> updateWhitelistContracts(parameters, s)
    |   UpdateGeneralContracts (parameters) -> updateGeneralContracts(parameters, s)
    |   UpdateBlocksPerMinute (parameters) -> updateBlocksPerMinute(parameters, s)

    |   PauseAll (_parameters) -> pauseAll(s)
    |   UnpauseAll (_parameters) -> unpauseAll(s)
    |   TogglePauseCreateFarm (_parameters) -> togglePauseCreateFarm(s)
    |   TogglePauseTrackFarm (_parameters) -> togglePauseTrackFarm(s)
    |   TogglePauseUntrackFarm (_parameters) -> togglePauseUntrackFarm(s)

    |   CreateFarm (params) -> createFarm(params, s)
    |   TrackFarm (params) -> trackFarm(params, s)
    |   UntrackFarm (params) -> untrackFarm(params, s)
    ]
  )