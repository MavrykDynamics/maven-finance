////
// TYPES INCLUDED
////
// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Set Lambda Types
#include "../partials/functionalTypes/setLambdaTypes.ligo"

// Farm Types
#include "../partials/types/farmTypes.ligo"

// FarmFactory Types
#include "../partials/types/farmFactoryTypes.ligo"

////
// RETURN TYPES
////
(* define return for readability *)
type return is list (operation) * farmFactoryStorage
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
|   UpdateMetadata of (string * bytes)
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

function checkSenderIsAdmin(const s: farmFactoryStorage): unit is
  if Tezos.sender =/= s.admin then failwith("ONLY_ADMINISTRATOR_ALLOWED")
  else unit

function checkSenderOrSourceIsCouncil(const s: farmFactoryStorage): unit is
    block {
        const councilAddress: address = case s.whitelistContracts["council"] of [
            Some (_address) -> _address
        |   None -> (failwith("Council contract not found in whitelist contracts"): address)
        ];

        if Tezos.source = councilAddress or Tezos.sender = councilAddress then skip
        else failwith("Only Council contract allowed");
    } with(unit)

////
// BREAK GLASS CHECKS
////

// break glass: checkIsNotPaused helper functions begin ---------------------------------------------------------
function checkCreateFarmIsNotPaused(var s : farmFactoryStorage) : unit is
    if s.breakGlassConfig.createFarmIsPaused then failwith("CreateFarm entrypoint is paused.")
    else unit;

function checkTrackFarmIsNotPaused(var s : farmFactoryStorage) : unit is
    if s.breakGlassConfig.trackFarmIsPaused then failwith("TrackFarm entrypoint is paused.")
    else unit;

function checkUntrackFarmIsNotPaused(var s : farmFactoryStorage) : unit is
    if s.breakGlassConfig.untrackFarmIsPaused then failwith("UntrackFarm entrypoint is paused.")
    else unit;

////
// FUNCTIONS INCLUDED
////
// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: farmFactoryStorage): return is
  block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
  } with (noOperations, s)

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: farmFactoryStorage): return is
  block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
  } with (noOperations, s)

////
// BREAK GLASS FUNCTIONS
///
function pauseAll(var s: farmFactoryStorage): return is
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

function unpauseAll(var s: farmFactoryStorage): return is
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

function togglePauseCreateFarm(var s: farmFactoryStorage): return is
    block {
        // check that sender is admin
        checkSenderIsAdmin(s);

        if s.breakGlassConfig.createFarmIsPaused then s.breakGlassConfig.createFarmIsPaused := False
        else s.breakGlassConfig.createFarmIsPaused := True;

    } with (noOperations, s)

function togglePauseUntrackFarm(var s: farmFactoryStorage): return is
    block {
        // check that sender is admin
        checkSenderIsAdmin(s);

        if s.breakGlassConfig.untrackFarmIsPaused then s.breakGlassConfig.untrackFarmIsPaused := False
        else s.breakGlassConfig.untrackFarmIsPaused := True;

    } with (noOperations, s)

function togglePauseTrackFarm(var s: farmFactoryStorage): return is
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
function updateBlocksPerMinute(const newBlocksPerMinutes: nat; var s: farmFactoryStorage): return is
    block {
        // check that source is admin or factory
        checkSenderOrSourceIsCouncil(s);

        var operations: list(operation) := nil;

        for farmAddress in set s.trackedFarms 
        block {
            case (Tezos.get_entrypoint_opt("%updateBlocksPerMinute", farmAddress): option(contract(nat))) of [
                Some(contr) -> operations := Tezos.transaction(newBlocksPerMinutes, 0tez, contr) # operations
            |   None -> skip
            ];
        };

        s.config.blocksPerMinute := newBlocksPerMinutes;

    } with (operations, s)

(*  set contract admin address *)
function setAdmin(const newAdminAddress: address; var s: farmFactoryStorage): return is
block {
    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;
} with (noOperations, s)

(*  update the metadata at a given key *)
function updateMetadata(const metadataKey: string; const metadataHash: bytes; var s : farmFactoryStorage) : return is
block {
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)
    
    // Update metadata
    s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
} with (noOperations, s)

(* CheckFarmExists view *)
[@view] function checkFarmExists (const farmContract: address; const s: farmFactoryStorage): bool is 
    Set.mem(farmContract, s.trackedFarms)

(* CreateFarm entrypoint *)
function createFarm(const farmStorage: farmStorageType; var s: farmFactoryStorage): return is 
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
        const farmDelegators : big_map(delegator, delegatorRecord) = Big_map.empty;
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
        const farmConfig: farmConfigType = record[
            lpToken=farmLPToken;
            infinite=farmInfinite;
            forceRewardFromTransfer=farmForceRewardFromTransfer;
            blocksPerMinute=s.config.blocksPerMinute;
            plannedRewards=farmPlannedRewards;
        ];

        // Prepare Farm Metadata
        const farmMetadataDescription: string = "MAVRYK Farm Contract";
        const farmMetadataVersion: string = "v1.0.0";
        const farmMetadataLPAddress: address = farmLPToken.tokenAddress;
        const farmMetadataLPOrigin: string = farmStorage.lpTokenOrigin;
        const farmMetadataToken0Symbol: string = farmStorage.tokenPair.token0.symbol;
        const farmMetadataToken1Symbol: string = farmStorage.tokenPair.token1.symbol ;
        const farmMetadataName: string = "MAVRYK " ^ farmMetadataToken0Symbol ^ "-" ^ farmMetadataToken1Symbol ^ " Farm";
        const farmMetadataAuthors: string = "MAVRYK Dev Team <contact@mavryk.finance>";
        const farmMetadataPlain: farmMetadataType = record[
            name                    = farmMetadataName;
            description             = farmMetadataDescription;
            version                 = farmMetadataVersion;
            liquidityPairToken      = record[
                tokenAddress        = farmMetadataLPAddress;
                origin              = farmMetadataLPOrigin;
                token0              = farmStorage.tokenPair.token0;
                token1              = farmStorage.tokenPair.token1;
            ];
            authors                 = farmMetadataAuthors;
        ];
        const farmMetadata: metadata = Big_map.literal (list [
            ("", Bytes.pack(farmMetadataPlain));
        ]);
        const farmLambdaLedger : big_map(string, bytes) = Big_map.empty;

        // Check wether the farm is infinite or its total blocks has been set
        if not farmInfinite and farmStorage.plannedRewards.totalBlocks = 0n then failwith("This farm should be either infinite or have a specified duration") else skip;

        // Create a farm and auto init it?
        const originatedFarmStorage : farmStorage = record[
            admin                   = s.admin; // If governance is the admin, it makes sense that the factory passes its admin to the farm it creates
            mvkTokenAddress         = s.mvkTokenAddress;
            metadata                = farmMetadata;

            config                  = farmConfig;
            
            whitelistContracts      = farmWhitelistContract;      // whitelist of contracts that can access restricted entrypoints
            generalContracts        = farmGeneralContracts;

            breakGlassConfig        = farmBreakGlassConfig;

            lastBlockUpdate         = Tezos.level;
            accumulatedMVKPerShare  = 0n;
            claimedRewards          = farmClaimedRewards;
            delegators              = farmDelegators;
            open                    = True ;
            init                    = True;
            initBlock               = Tezos.level;

            lambdaLedger            = farmLambdaLedger;
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
function trackFarm (const farmContract: address; var s: farmFactoryStorage): return is 
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
function untrackFarm (const farmContract: address; var s: farmFactoryStorage): return is 
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
function main (const action: action; var s: farmFactoryStorage): return is
  block{
    // Check that sender didn't send Tezos while calling an entrypoint
    checkNoAmount(Unit);
  } with(
    case action of [
        SetAdmin (parameters) -> setAdmin(parameters, s)
    |   UpdateMetadata (parameters) -> updateMetadata(parameters.0, parameters.1, s)
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