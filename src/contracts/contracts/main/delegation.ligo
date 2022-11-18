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

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Delegation Types
#include "../partials/contractTypes/delegationTypes.ligo"

// MVK Token Type
#include "../partials/contractTypes/mvkTokenTypes.ligo"

// Treasury Type
#include "../partials/contractTypes/treasuryTypes.ligo"

// Governance Type
#include "../partials/contractTypes/governanceTypes.ligo"

// ------------------------------------------------------------------------------

type delegationAction is 

        // Housekeeping Entrypoints
    |   SetAdmin                          of (address)
    |   SetGovernance                     of (address)
    |   UpdateMetadata                    of updateMetadataType
    |   UpdateConfig                      of delegationUpdateConfigParamsType
    |   UpdateWhitelistContracts          of updateWhitelistContractsType
    |   UpdateGeneralContracts            of updateGeneralContractsType
    |   MistakenTransfer                  of transferActionType

        // Pause / Break Glass Entrypoints
    |   PauseAll                          of (unit)
    |   UnpauseAll                        of (unit)
    |   TogglePauseEntrypoint             of delegationTogglePauseEntrypointType

        // Delegation Entrypoints
    |   DelegateToSatellite               of delegateToSatelliteType    
    |   UndelegateFromSatellite           of (address)
    
        // Satellite Entrypoints
    |   RegisterAsSatellite               of registerAsSatelliteParamsType
    |   UnregisterAsSatellite             of (address)
    |   UpdateSatelliteRecord             of updateSatelliteRecordType
    |   DistributeReward                  of distributeRewardStakedMvkType

        // General Entrypoints
    |   OnStakeChange                     of onStakeChangeType
    |   UpdateSatelliteStatus             of updateSatelliteStatusParamsType

        // Lambda Entrypoints
    |   SetLambda                         of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * delegationStorageType

// delegation contract methods lambdas
type delegationUnpackLambdaFunctionType is (delegationLambdaActionType * delegationStorageType) -> return



// ------------------------------------------------------------------------------
//
// Constants Begin
//
// ------------------------------------------------------------------------------

const fixedPointAccuracy : nat = 1_000_000_000_000_000_000_000_000_000_000_000_000n // 10^36

// ------------------------------------------------------------------------------
//
// Constants End
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

// Allowed Senders: Admin, Governance Contract
function checkSenderIsAllowed(var s : delegationStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



// Allowed Senders: Admin
function checkSenderIsAdmin(var s : delegationStorageType) : unit is
    if (Tezos.get_sender() = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



// Allowed Senders: Self
function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.get_sender() = Tezos.get_self_address()) then unit
    else failwith(error_ONLY_SELF_ALLOWED);



// Allowed Senders: Doorman Contract
function checkSenderIsDoormanContract(var s : delegationStorageType) : unit is
block{

    const doormanAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    if (Tezos.get_sender() = doormanAddress) then skip
    else failwith(error_ONLY_DOORMAN_CONTRACT_ALLOWED);

} with unit



// Allowed Senders: Governance Contract 
function checkSenderIsGovernanceContract(var s : delegationStorageType) : unit is
block{
    
    const governanceAddress : address = s.governanceAddress;
    
    if (Tezos.get_sender() = governanceAddress) then skip
    else failwith(error_ONLY_GOVERNANCE_CONTRACT_ALLOWED);

} with unit



// Allowed Senders: Admin, Governance Satellite Contract
function checkSenderIsAdminOrGovernanceSatelliteContract(var s : delegationStorageType) : unit is
block{
        
    if Tezos.get_sender() = s.admin then skip
    else {

        const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);

        if Tezos.get_sender() = governanceSatelliteAddress then skip
        else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED);
    }

} with unit



// Check User is a Satellite
function checkUserIsSatellite(const userAddress : address; var s : delegationStorageType) : unit is 
    if (Big_map.mem(userAddress, s.satelliteLedger)) then unit
    else failwith(error_ONLY_SATELLITE_ALLOWED);



// Check User is not a Satellite
function checkUserIsNotSatellite(const userAddress : address; var s : delegationStorageType) : unit is 
    if (Big_map.mem(userAddress, s.satelliteLedger)) then failwith(error_SATELLITE_NOT_ALLOWED)
    else unit;



// Check User is not delegated to a satellite
function checkUserIsNotDelegate(const userAddress : address; var s : delegationStorageType) : unit is 
    if (Big_map.mem(userAddress, s.delegateLedger)) then failwith(error_DELEGATE_NOT_ALLOWED)
    else unit;



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if (Tezos.get_amount() = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Rewards Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to update rewards
function updateRewards(const userAddress : address; var s : delegationStorageType) : delegationStorageType is
block{

        // Steps Overview:
        // 1. Check if user is recorded in the Satellite Rewards Ledger
        // 2. Get Doorman Contract Address from the General Contracts Map on the Governance Contract
        // 3. Get user's staked MVK balance from the Doorman Contract
        // 4. Get satellite rewards record of satellite that user is delegated to (for reference)
        // 5. Calculate satellite unclaimed rewards
        //    - calculate rewards ratio: difference between satellite's accumulatedRewardsPerShare and user's current participationRewardsPerShare
        //    - user's satellite rewards is equal to his staked MVK balance multiplied by rewards ratio
        // 6. Update user's satellite rewards record 
        //    - set participationRewardsPerShare to satellite's accumulatedRewardsPerShare
        //    - increment user's unpaid rewards by the calculated rewards

        // Check if user is recorded in the Satellite Rewards Ledger
        if Big_map.mem(userAddress, s.satelliteRewardsLedger) then {

            // Get user's satellite rewards record
            var satelliteRewardsRecord : satelliteRewardsType  := case Big_map.find_opt(userAddress, s.satelliteRewardsLedger) of [
                    Some (_record) -> _record
                |   None           -> failwith(error_SATELLITE_REWARDS_NOT_FOUND)
            ];

            // Get Doorman Contract Address from the General Contracts Map on the Governance Contract
            const doormanAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

            // Get user's staked MVK balance from the Doorman Contract
            const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
            const stakedMvkBalance : nat = case stakedMvkBalanceView of [
                    Some (value) -> value
                |   None         -> (failwith (error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND) : nat)
            ];

            // Get satellite rewards record of satellite that user is delegated to
            const _satelliteReferenceRewardsRecord : satelliteRewardsType  = case Big_map.find_opt(satelliteRewardsRecord.satelliteReferenceAddress, s.satelliteRewardsLedger) of [
                    Some (_referenceRecord) -> _referenceRecord
                |   None                    -> failwith(error_REFERENCE_SATELLITE_REWARDS_RECORD_NOT_FOUND)
            ];

            // Calculate satellite unclaimed rewards
            // - calculate rewards ratio: difference between satellite's accumulatedRewardsPerShare and user's current participationRewardsPerShare
            // - user's satellite rewards is equal to his staked MVK balance multiplied by rewards ratio
            
            const satelliteRewardsRatio : nat  = abs(_satelliteReferenceRewardsRecord.satelliteAccumulatedRewardsPerShare - satelliteRewardsRecord.participationRewardsPerShare);
            const satelliteRewards : nat       = (stakedMvkBalance * satelliteRewardsRatio) / fixedPointAccuracy;

            // Update user's satellite rewards record 
            // - set participationRewardsPerShare to satellite's accumulatedRewardsPerShare
            // - increment user's unpaid rewards by the calculated rewards

            satelliteRewardsRecord.participationRewardsPerShare    := _satelliteReferenceRewardsRecord.satelliteAccumulatedRewardsPerShare;
            satelliteRewardsRecord.unpaid                          := satelliteRewardsRecord.unpaid + satelliteRewards;
            s.satelliteRewardsLedger[userAddress]                  := satelliteRewardsRecord;

        } else skip;

  } with(s)

// ------------------------------------------------------------------------------
// Rewards Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check that the %delegateToSatellite entrypoint is not paused
function checkDelegateToSatelliteIsNotPaused(var s : delegationStorageType) : unit is
    if s.breakGlassConfig.delegateToSatelliteIsPaused then failwith(error_DELEGATE_TO_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED)
    else unit;

    

// helper function to check that the %undelegateFromSatellite entrypoint is not paused
function checkUndelegateFromSatelliteIsNotPaused(var s : delegationStorageType) : unit is
    if s.breakGlassConfig.undelegateFromSatelliteIsPaused then failwith(error_UNDELEGATE_FROM_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %registerAsSatellite entrypoint is not paused
function checkRegisterAsSatelliteIsNotPaused(var s : delegationStorageType) : unit is
    if s.breakGlassConfig.registerAsSatelliteIsPaused then failwith(error_REGISTER_AS_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %unregisterAsSatellite entrypoint is not paused
function checkUnregisterAsSatelliteIsNotPaused(var s : delegationStorageType) : unit is
    if s.breakGlassConfig.unregisterAsSatelliteIsPaused then failwith(error_UNREGISTER_AS_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %updateSatelliteRecord entrypoint is not paused
function checkUpdateSatelliteRecordIsNotPaused(var s : delegationStorageType) : unit is
    if s.breakGlassConfig.updateSatelliteRecordIsPaused then failwith(error_UPDATE_SATELLITE_RECORD_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %distributeReward entrypoint is not paused
function checkDistributeRewardIsNotPaused(var s : delegationStorageType) : unit is
    if s.breakGlassConfig.distributeRewardIsPaused then failwith(error_DISTRIBUTE_REWARD_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED)
    else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to %delegatetoSatellite entrypoint on the Delegation contract
function getDelegateToSatelliteEntrypoint(const delegationAddress : address) : contract(delegateToSatelliteType) is
    case (Tezos.get_entrypoint_opt(
        "%delegateToSatellite",
        delegationAddress) : option(contract(delegateToSatelliteType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_DELEGATE_TO_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(delegateToSatelliteType))
        ];



// helper function to %undelegateFromSatellite entrypoint on the Delegation contract
function getUndelegateFromSatelliteEntrypoint(const delegationAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%undelegateFromSatellite",
        delegationAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UNDELEGATE_FROM_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(address))
        ];



// helper function to %transfer entrypoint on a Treasury contract
function sendTransferOperationToTreasury(const contractAddress : address) : contract(transferActionType) is
    case (Tezos.get_entrypoint_opt(
        "%transfer",
        contractAddress) : option(contract(transferActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(transferActionType))
        ];



// helper function to %updateSatelliteSnapshot entrypoint on the Governance contract
function sendUpdateSatelliteSnapshotOperationToGovernance(const governanceAddress : address) : contract(updateSatelliteSnapshotType) is
    case (Tezos.get_entrypoint_opt(
        "%updateSatelliteSnapshot",
        governanceAddress) : option(contract(updateSatelliteSnapshotType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_UPDATE_SATELLITE_SNAPSHOT_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(updateSatelliteSnapshotType))
        ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Satellite Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get a satellite's record
function getSatelliteRecord (const satelliteAddress : address; const s : delegationStorageType) : satelliteRecordType is
block {

    var satelliteRecord : satelliteRecordType := record [
        status                = "ACTIVE";        
        stakedMvkBalance      = 0n;        
        satelliteFee          = 0n;    
        totalDelegatedAmount  = 0n;

        name                  = "Mavryk Satellite";
        description           = "Mavryk Satellite";
        image                 = "";
        website               = "";

        registeredDateTime    = Tezos.get_now();

        oraclePublicKey       = ("edpku8CdxqUzHhL8X3fgpCX5CfmqxUU7JWBTmXwqUATt78dGijvqWd" : key); // random default public key
        oraclePeerId          = "peerId";
    ];

    case s.satelliteLedger[satelliteAddress] of [
            None            -> failwith(error_SATELLITE_NOT_FOUND)
        |   Some(instance)  -> satelliteRecord := instance
    ];

} with satelliteRecord

// helper function to refresh a satellite governance snapshot
function updateGovernanceSnapshot (const satelliteAddress : address; const ready : bool; var operations : list(operation); const s : delegationStorageType) : list(operation) is
block {

    // Get the current round and the satellite snapshot opt
    const cycleIdView : option (nat) = Tezos.call_view ("getCycleCounter", unit, s.governanceAddress);
    const currentCycle: nat = case cycleIdView of [
            Some (_cycle)   -> _cycle
        |   None            -> failwith (error_GET_CYCLE_COUNTER_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];
    const snapshotOptView : option (option(governanceSatelliteSnapshotRecordType)) = Tezos.call_view ("getSnapshotOpt", (currentCycle,satelliteAddress), s.governanceAddress);
    const satelliteSnapshotOpt: option(governanceSatelliteSnapshotRecordType) = case snapshotOptView of [
            Some (_snapshotOpt) -> _snapshotOpt
        |   None                -> failwith (error_GET_SNAPSHOT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    // Check if a snapshot needs to be created
    const createSatelliteSnapshot: bool = case satelliteSnapshotOpt of [
        Some (_snapshot)    -> False
    |   None                -> True
    ];

    // Create or not a snapshot
    if createSatelliteSnapshot and Big_map.mem(satelliteAddress, s.satelliteLedger) then{

        // Get the satellite record
        const _satelliteRecord: satelliteRecordType = case Big_map.find_opt(satelliteAddress, s.satelliteLedger) of [
            Some (_satellite)   -> _satellite
        |   None                -> failwith(error_SATELLITE_NOT_FOUND)
        ];

        // Create a snapshot
        const satelliteSnapshotParams: updateSatelliteSnapshotType  = record[
            satelliteAddress    = satelliteAddress;
            satelliteRecord     = _satelliteRecord;
            ready               = ready;
            delegationRatio     = s.config.delegationRatio;
        ];

        // Send the snapshot to the governance contract
        const updateSnapshotOperation : operation   = Tezos.transaction(
            (satelliteSnapshotParams),
            0tez, 
            sendUpdateSatelliteSnapshotOperationToGovernance(s.governanceAddress)
        );

        operations   := updateSnapshotOperation # operations;

    } else skip;

} with(operations)

// ------------------------------------------------------------------------------
// Satellite Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(delegationUnpackLambdaFunctionType)) of [
            Some(f) -> f(delegationLambdaAction, s)
        |   None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
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
// Lambda Helpers Begin
//
// ------------------------------------------------------------------------------

// Delegation Lambdas:
#include "../partials/contractLambdas/delegation/delegationLambdas.ligo"

// ------------------------------------------------------------------------------
//
// Lambda Helpers End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; var s : delegationStorageType) : address is
    s.admin



(* View: get Config *)
[@view] function getConfig(const _ : unit; var s : delegationStorageType) : delegationConfigType is
    s.config



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; var s : delegationStorageType) : whitelistContractsType is
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; var s : delegationStorageType) : generalContractsType is
    s.generalContracts



(* View: get break glass config *)
[@view] function getBreakGlassConfig(const _ : unit; var s : delegationStorageType) : delegationBreakGlassConfigType is
    s.breakGlassConfig



(* View: get Satellite Record *)
[@view] function getDelegateOpt(const delegateAddress : address; var s : delegationStorageType) : option(delegateRecordType) is
    Big_map.find_opt(delegateAddress, s.delegateLedger)



(* View: get Satellite Record *)
[@view] function getSatelliteOpt(const satelliteAddress : address; var s : delegationStorageType) : option(satelliteRecordType) is
    Big_map.find_opt(satelliteAddress, s.satelliteLedger)



(* View: get User reward *)
[@view] function getSatelliteRewardsOpt(const userAddress : address; var s : delegationStorageType) : option(satelliteRewardsType) is
    Big_map.find_opt(userAddress, s.satelliteRewardsLedger)



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : delegationStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : delegationStorageType) : lambdaLedgerType is
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

(* setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : delegationStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];
    
    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);
    
} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : delegationStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : delegationStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* updateConfig entrypoint *)
function updateConfig(const updateConfigParams : delegationUpdateConfigParamsType; var s : delegationStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : delegationStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : delegationStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams : transferActionType; var s : delegationStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMistakenTransfer"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(* pauseAll entrypoint *)
function pauseAll(var s : delegationStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* unpauseAll entrypoint *)
function unpauseAll(var s : delegationStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint : delegationTogglePauseEntrypointType; const s : delegationStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseEntrypoint"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Delegation Entrypoints Begin
// ------------------------------------------------------------------------------

(* delegateToSatellite entrypoint *)
function delegateToSatellite(const delegateToSatelliteParams : delegateToSatelliteType; var s : delegationStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDelegateToSatellite"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaDelegateToSatellite(delegateToSatelliteParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* undelegateFromSatellite entrypoint *)
function undelegateFromSatellite(const undelegateToSatelliteParams : address; var s : delegationStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUndelegateFromSatellite"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUndelegateFromSatellite(undelegateToSatelliteParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Delegation Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Satellite Entrypoints Begin
// ------------------------------------------------------------------------------

(* registerAsSatellite entrypoint *)
function registerAsSatellite(const registerAsSatelliteParams : registerAsSatelliteParamsType; var s : delegationStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRegisterAsSatellite"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaRegisterAsSatellite(registerAsSatelliteParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* unregisterAsSatellite entrypoint *)
function unregisterAsSatellite(const userAddress : address; var s : delegationStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnregisterAsSatellite"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUnregisterAsSatellite(userAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* updateSatelliteRecord entrypoint *)
function updateSatelliteRecord(const updateSatelliteRecordParams : updateSatelliteRecordType; var s : delegationStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateSatelliteRecord"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUpdateSatelliteRecord(updateSatelliteRecordParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);
    
} with response



(* distributeReward entrypoint *)
function distributeReward(const distributeRewardParams : distributeRewardStakedMvkType; var s : delegationStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDistributeReward"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaDistributeReward(distributeRewardParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);
    
} with response

// ------------------------------------------------------------------------------
// Satellite Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Entrypoints Begin
// ------------------------------------------------------------------------------

(* onStakeChange entrypoint *)
function onStakeChange(const userAddress : address; var s : delegationStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaOnStakeChange"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaOnStakeChange(userAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* updateSatelliteStatus entrypoint *)
function updateSatelliteStatus(const updateSatelliteStatusParams : updateSatelliteStatusParamsType; var s : delegationStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateSatelliteStatus"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUpdateSatelliteStatus(updateSatelliteStatusParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// General Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : delegationStorageType) : return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Lambda Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : delegationAction; const s : delegationStorageType) : return is 
block{

    checkNoAmount(unit); // entrypoints should not receive any tez amount  

} with (case action of [    

            // Housekeeping Entrypoints
            SetAdmin(parameters)                          -> setAdmin(parameters, s) 
        |   SetGovernance(parameters)                     -> setGovernance(parameters, s) 
        |   UpdateMetadata(parameters)                    -> updateMetadata(parameters, s)
        |   UpdateConfig(parameters)                      -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts(parameters)          -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)            -> updateGeneralContracts(parameters, s)
        |   MistakenTransfer(parameters)                  -> mistakenTransfer(parameters, s)

            // Pause / Break Glass Entrypoints
        |   PauseAll(_parameters)                         -> pauseAll(s)
        |   UnpauseAll(_parameters)                       -> unpauseAll(s)
        |   TogglePauseEntrypoint(parameters)            -> togglePauseEntrypoint(parameters, s)
        
            // Delegation Entrypoints
        |   DelegateToSatellite(parameters)               -> delegateToSatellite(parameters, s)
        |   UndelegateFromSatellite(parameters)           -> undelegateFromSatellite(parameters, s)
        
            // Satellite Entrypoints
        |   RegisterAsSatellite(parameters)               -> registerAsSatellite(parameters, s)
        |   UnregisterAsSatellite(parameters)             -> unregisterAsSatellite(parameters, s)
        |   UpdateSatelliteRecord(parameters)             -> updateSatelliteRecord(parameters, s)
        |   DistributeReward(parameters)                  -> distributeReward(parameters, s)

            // General Entrypoints
        |   OnStakeChange(parameters)                     -> onStakeChange(parameters, s)
        |   UpdateSatelliteStatus(parameters)             -> updateSatelliteStatus(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                         -> setLambda(parameters, s)    
    ]
)
