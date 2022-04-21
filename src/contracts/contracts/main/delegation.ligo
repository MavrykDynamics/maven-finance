// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// General Contracts: whitelistTokenContractsType, updateWhitelistTokenContractsParams
#include "../partials/whitelistTokenContractsType.ligo"

// Set Lambda Types
#include "../partials/functionalTypes/setLambdaTypes.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Delegation Types
#include "../partials/types/delegationTypes.ligo"

// MVK Token Type
#include "../partials/types/mvkTokenTypes.ligo"

// Treasury Type
#include "../partials/types/treasuryTypes.ligo"

// ------------------------------------------------------------------------------

type delegationAction is 

      // Housekeeping Entrypoints
    | SetAdmin                          of (address)
    | UpdateMetadata                    of updateMetadataType
    | UpdateConfig                      of delegationUpdateConfigParamsType
    | UpdateWhitelistContracts          of updateWhitelistContractsParams
    | UpdateGeneralContracts            of updateGeneralContractsParams

      // Pause / Break Glass Entrypoints
    | PauseAll                          of (unit)
    | UnpauseAll                        of (unit)
    | TogglePauseDelegateToSatellite    of (unit)
    | TogglePauseUndelegateSatellite    of (unit)
    | TogglePauseRegisterSatellite      of (unit)
    | TogglePauseUnregisterSatellite    of (unit)
    | TogglePauseUpdateSatellite        of (unit)
    | TogglePauseDistributeReward       of (unit)

      // Delegation Entrypoints
    | DelegateToSatellite               of (address)    
    | UndelegateFromSatellite           of (unit)
    
      // Satellite Entrypoints
    | RegisterAsSatellite               of newSatelliteRecordType
    | UnregisterAsSatellite             of (unit)
    | UpdateSatelliteRecord             of updateSatelliteRecordType
    | DistributeReward                  of distributeRewardTypes

      // General Entrypoints
    | OnStakeChange                     of onStakeChangeParams
    | OnSatelliteRewardPaid             of address

      // Lambda Entrypoints
    | SetLambda                         of setLambdaType

const fixedPointAccuracy: nat = 1_000_000_000_000_000_000_000_000_000_000_000_000n // 10^36
const noOperations : list (operation) = nil;
type return is list (operation) * delegationStorage

// delegation contract methods lambdas
type delegationUnpackLambdaFunctionType is (delegationLambdaActionType * delegationStorage) -> return



// ------------------------------------------------------------------------------
//
// Error Codes Begin
//
// ------------------------------------------------------------------------------

[@inline] const error_ONLY_ADMINISTRATOR_ALLOWED                            = 0n;
[@inline] const error_ONLY_SELF_ALLOWED                                     = 1n;
[@inline] const error_ONLY_DOORMAN_CONTRACT_ALLOWED                         = 2n;
[@inline] const error_ONLY_GOVERNANCE_CONTRACT_ALLOWED                      = 3n;
[@inline] const error_ONLY_SATELLITE_ALLOWED                                = 4n;
[@inline] const error_SATELLITE_NOT_ALLOWED                                 = 5n;
[@inline] const error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ                     = 6n;

[@inline] const error_SATELLITE_NOT_FOUND                                   = 7n;
[@inline] const error_DOORMAN_CONTRACT_NOT_FOUND                            = 8n;
[@inline] const error_GOVERNANCE_CONTRACT_NOT_FOUND                         = 9n;

[@inline] const error_DELEGATE_TO_SATELLITE_ENTRYPOINT_NOT_FOUND            = 10n;
[@inline] const error_UNDELEGATE_FROM_SATELLITE_ENTRYPOINT_NOT_FOUND        = 11n;

[@inline] const error_DELEGATE_TO_SATELLITE_ENTRYPOINT_IS_PAUSED            = 12n;
[@inline] const error_UNDELEGATE_FROM_SATELLITE_ENTRYPOINT_IS_PAUSED        = 13n;
[@inline] const error_REGISTER_AS_SATELLITE_ENTRYPOINT_IS_PAUSED            = 14n;
[@inline] const error_UNREGISTER_AS_SATELLITE_ENTRYPOINT_IS_PAUSED          = 15n;
[@inline] const error_UPDATE_SATELLITE_RECORD_ENTRYPOINT_IS_PAUSED          = 16n;
[@inline] const error_DISTRIBUTE_REWARD_ENTRYPOINT_IS_PAUSED                = 17n;

[@inline] const error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND    = 18n;

[@inline] const error_LAMBDA_NOT_FOUND                                      = 18n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                               = 19n;

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

function checkSenderIsAdmin(var s : delegationStorage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.sender = Tezos.self_address) then unit
    else failwith(error_ONLY_SELF_ALLOWED);



function checkSenderIsSatellite(var s : delegationStorage) : unit is 
  if (Map.mem(Tezos.sender, s.satelliteLedger)) then unit
  else failwith(error_ONLY_SATELLITE_ALLOWED);



function checkSenderIsNotSatellite(var s : delegationStorage) : unit is 
  if (Map.mem(Tezos.sender, s.satelliteLedger)) then failwith(error_SATELLITE_NOT_ALLOWED)
  else unit;



function checkSenderIsDoormanContract(var s : delegationStorage) : unit is
block{
  const doormanAddress : address = case s.generalContracts["doorman"] of [
      Some(_address) -> _address
      | None -> failwith(error_DOORMAN_CONTRACT_NOT_FOUND)
  ];
  if (Tezos.sender = doormanAddress) then skip
  else failwith(error_ONLY_DOORMAN_CONTRACT_ALLOWED);
} with unit



function checkSenderIsGovernanceContract(var s : delegationStorage) : unit is
block{
  const governanceAddress : address = case s.generalContracts["governance"] of [
      Some(_address) -> _address
      | None -> failwith(error_GOVERNANCE_CONTRACT_NOT_FOUND)
  ];
  if (Tezos.sender = governanceAddress) then skip
  else failwith(error_ONLY_GOVERNANCE_CONTRACT_ALLOWED);
} with unit



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
// Rewards Helper Functions Begin
// ------------------------------------------------------------------------------

function updateRewards(var s: delegationStorage): delegationStorage is
  block{
    // Get address
    const userAddress: address      = Tezos.source;

    if Big_map.mem(userAddress, s.satelliteRewardsLedger) then {
      var satelliteRewardsRecord: satelliteRewards  := case Big_map.find_opt(userAddress, s.satelliteRewardsLedger) of [
        Some (_record) -> _record
      | None -> failwith("Error. Rewards record not found")
      ];

      const doormanAddress : address = case s.generalContracts["doorman"] of [
          Some(_address) -> _address
        | None -> failwith("Error. Doorman Contract is not found")
      ];

      const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
      const stakedMvkBalance: nat = case stakedMvkBalanceView of [
          Some (value) -> value
        | None -> (failwith ("Error. GetStakedBalance View not found in the Doorman Contract") : nat)
      ];

      const _satelliteReferenceRewardsRecord: satelliteRewards  = case Big_map.find_opt(satelliteRewardsRecord.satelliteReferenceAddress, s.satelliteRewardsLedger) of [
        Some (_referenceRecord) -> _referenceRecord
      | None -> failwith("Error. Satellite reference rewards record not found")
      ];

      // Calculate satellite unclaim rewards
      const satelliteRewardsRatio: nat  = abs(_satelliteReferenceRewardsRecord.satelliteAccumulatedRewardsPerShare - satelliteRewardsRecord.participationRewardsPerShare);
      const satelliteRewards: nat       = (stakedMvkBalance * satelliteRewardsRatio) / fixedPointAccuracy;

      // Update satellite
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

function checkDelegateToSatelliteIsNotPaused(var s : delegationStorage) : unit is
  if s.breakGlassConfig.delegateToSatelliteIsPaused then failwith(error_DELEGATE_TO_SATELLITE_ENTRYPOINT_IS_PAUSED)
  else unit;

    

function checkUndelegateFromSatelliteIsNotPaused(var s : delegationStorage) : unit is
  if s.breakGlassConfig.undelegateFromSatelliteIsPaused then failwith(error_UNDELEGATE_FROM_SATELLITE_ENTRYPOINT_IS_PAUSED)
  else unit;



function checkRegisterAsSatelliteIsNotPaused(var s : delegationStorage) : unit is
  if s.breakGlassConfig.registerAsSatelliteIsPaused then failwith(error_REGISTER_AS_SATELLITE_ENTRYPOINT_IS_PAUSED)
  else unit;



function checkUnregisterAsSatelliteIsNotPaused(var s : delegationStorage) : unit is
  if s.breakGlassConfig.unregisterAsSatelliteIsPaused then failwith(error_UNREGISTER_AS_SATELLITE_ENTRYPOINT_IS_PAUSED)
  else unit;



function checkUpdateSatelliteRecordIsNotPaused(var s : delegationStorage) : unit is
  if s.breakGlassConfig.updateSatelliteRecordIsPaused then failwith(error_UPDATE_SATELLITE_RECORD_ENTRYPOINT_IS_PAUSED)
  else unit;



function checkDistributeRewardIsNotPaused(var s : delegationStorage) : unit is
  if s.breakGlassConfig.distributeRewardIsPaused then failwith(error_DISTRIBUTE_REWARD_ENTRYPOINT_IS_PAUSED)
  else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

function getDelegateToSatelliteEntrypoint(const delegationAddress : address) : contract(address) is
  case (Tezos.get_entrypoint_opt(
      "%delegateToSatellite",
      delegationAddress) : option(contract(address))) of [
    Some(contr) -> contr
  | None -> (failwith(error_DELEGATE_TO_SATELLITE_ENTRYPOINT_NOT_FOUND) : contract(address))
];



function getUndelegateFromSatelliteEntrypoint(const delegationAddress : address) : contract(unit) is
  case (Tezos.get_entrypoint_opt(
      "%undelegateFromSatellite",
      delegationAddress) : option(contract(unit))) of [
    Some(contr) -> contr
  | None -> (failwith(error_UNDELEGATE_FROM_SATELLITE_ENTRYPOINT_NOT_FOUND) : contract(unit))
];



function sendTransferOperationToTreasury(const contractAddress : address) : contract(transferActionType) is
  case (Tezos.get_entrypoint_opt(
      "%transfer",
      contractAddress) : option(contract(transferActionType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(transferActionType))
  ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Satellite Helper Functions Begin
// ------------------------------------------------------------------------------

function getSatelliteRecord (const satelliteAddress : address; const s : delegationStorage) : satelliteRecordType is
block {

    var satelliteRecord : satelliteRecordType :=
      record [
        status                = 0n;        
        stakedMvkBalance      = 0n;        
        satelliteFee          = 0n;    
        totalDelegatedAmount  = 0n;

        name                  = "Mavryk Satellite";
        description           = "Mavryk Satellite";
        image                 = "";
        website               = "";

        registeredDateTime    = Tezos.now;
      ];

    case s.satelliteLedger[satelliteAddress] of [
        None -> failwith(error_SATELLITE_NOT_FOUND)
      | Some(instance) -> satelliteRecord := instance
    ];

} with satelliteRecord

// ------------------------------------------------------------------------------
// Satellite Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

function unpackLambda(const lambdaBytes : bytes; const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorage) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(delegationUnpackLambdaFunctionType)) of [
        Some(f) -> f(delegationLambdaAction, s)
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

// Delegation Lambdas:
#include "../partials/contractLambdas/delegation/delegationLambdas.ligo"

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

(* View: get Satellite Record *)
[@view] function getSatelliteOpt(const satelliteAddress: address; var s : delegationStorage) : option(satelliteRecordType) is
  Map.find_opt(satelliteAddress, s.satelliteLedger)



(* View: get Satellite Record *)
[@view] function getDelegateOpt(const delegateAddress: address; var s : delegationStorage) : option(delegateRecordType) is
  Big_map.find_opt(delegateAddress, s.delegateLedger)



(* View: get User reward *)
[@view] function getUserRewardOpt(const userAddress: address; var s : delegationStorage) : option(satelliteRewards) is
  Big_map.find_opt(userAddress, s.satelliteRewardsLedger)



(* View: get Satellite Record *)
[@view] function getDelegateOpt(const delegateAddress: address; var s : delegationStorage) : option(delegateRecordType) is
  s.delegateLedger[delegateAddress]



(* View: get User reward *)
[@view] function getUserRewardOpt(const userAddress: address; var s : delegationStorage) : option(satelliteRewards) is
  s.satelliteRewardsLedger[userAddress]



(* View: get User unpaid reward *)
[@view] function getUserUnpaidReward(const userAddress: address; var s : delegationStorage) : nat is
  block{
    // Check if user is satellite or delegate
    const userIsSatellite: bool = Map.mem(userAddress, s.satelliteLedger);
    const userIsDelegator: bool = Big_map.mem(userAddress, s.delegateLedger);

    // Reward
    var unpaidReward: nat := 0n;

    // Update unclaimedRewards
    if userIsSatellite then {
      // Get Satellite
      var satelliteRecord: satelliteRecordType := case Map.find_opt(userAddress, s.satelliteLedger) of [
        Some (_record) -> _record
      | None -> failwith("Error. Satellite not found")
      ];

      var satelliteRewardsRecord: satelliteRewards  := case Big_map.find_opt(userAddress, s.satelliteRewardsLedger) of [
        Some (_record) -> _record
      | None -> failwith("Error. Rewards record not found")
      ];

      // Calculate satellite unclaim rewards
      const satelliteRewardsRatio: nat  = abs(satelliteRewardsRecord.accumulatedRewardsPerShare - satelliteRewardsRecord.participationRewardsPerShare);
      const satelliteRewards: nat       = satelliteRecord.stakedMvkBalance * satelliteRewardsRatio;

      // Update satellite
      unpaidReward                          := satelliteRewardsRecord.unpaid + satelliteRewards / fixedPointAccuracy;
    } else if userIsDelegator then {
      // Get Delegate
      var delegateRecord: delegateRecordType := case Big_map.find_opt(userAddress, s.delegateLedger) of [
        Some (_record) -> _record
      | None -> failwith("Error. Delegate not found")
      ];

      var delegateRewardsRecord: satelliteRewards  := case Big_map.find_opt(userAddress, s.satelliteRewardsLedger) of [
        Some (_record) -> _record
      | None -> failwith("Error. Rewards record not found")
      ];

      // Get Delegate satellite rewards
      var satelliteRewardsRecord: satelliteRewards  := case Big_map.find_opt(delegateRecord.satelliteAddress, s.satelliteRewardsLedger) of [
        Some (_record) -> _record
      | None -> failwith("Error. Rewards record not found")
      ];

      // Calculate satellite unclaim rewards
      const delegateRewardsRatio: nat  = abs(satelliteRewardsRecord.accumulatedRewardsPerShare - delegateRewardsRecord.participationRewardsPerShare);
      const delegateRewards: nat       = delegateRecord.delegatedSMvkBalance * delegateRewardsRatio;

      // Update satellite
      unpaidReward                         := delegateRewardsRecord.unpaid + delegateRewards / fixedPointAccuracy;
    } else skip;
  } with(unpaidReward)



(* View: get map of active satellites *)
[@view] function getActiveSatellites(const _: unit; var s : delegationStorage) : map(address, satelliteRecordType) is
block {

    var activeSatellites: map(address, satelliteRecordType) := Map.empty; 

    function findActiveSatellite(const activeSatellites: map(address, satelliteRecordType); const satellite: address * satelliteRecordType): map(address, satelliteRecordType) is
      if satellite.1.status = 1n then Map.add(satellite.0, satellite.1, activeSatellites)
      else activeSatellites;

    var activeSatellites: map(address, satelliteRecordType) := Map.fold(findActiveSatellite, s.satelliteLedger, activeSatellites)

} with(activeSatellites)

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
function setAdmin(const newAdminAddress : address; var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];
    
    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);
    
} with response



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* updateConfig entrypoint *)
function updateConfig(const updateConfigParams : delegationUpdateConfigParamsType; var s : delegationStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: delegationStorage): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: delegationStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

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
function pauseAll(var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* unpauseAll entrypoint *)
function unpauseAll(var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* togglePauseDelegateToSatellite entrypoint *)
function togglePauseDelegateToSatellite(var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseDelegateToSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaPauseDelegateToSatellite(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* togglePauseUndelegateSatellite entrypoint *)
function togglePauseUndelegateSatellite(var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseUndelegateSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaPauseUndelegateSatellite(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response


(* togglePauseRegisterSatellite entrypoint *)
function togglePauseRegisterSatellite(var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseRegisterSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaPauseRegisterSatellite(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* togglePauseUnregisterSatellite entrypoint *)
function togglePauseUnregisterSatellite(var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseUnregisterSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaPauseUnregisterSatellite(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response


(* togglePauseUpdateSatellite entrypoint *)
function togglePauseUpdateSatellite(var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseUpdateSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaPauseUpdateSatellite(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* togglePauseDistributeReward entrypoint *)
function togglePauseDistributeReward(var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseDistributeReward"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaPauseDistributeReward(unit);

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
function delegateToSatellite(const satelliteAddress : address; var s : delegationStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDelegateToSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaDelegateToSatellite(satelliteAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* undelegateFromSatellite entrypoint *)
function undelegateFromSatellite(var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUndelegateFromSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUndelegateFromSatellite(unit);

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
function registerAsSatellite(const registerAsSatelliteParams : newSatelliteRecordType; var s : delegationStorage) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRegisterAsSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaRegisterAsSatellite(registerAsSatelliteParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* unregisterAsSatellite entrypoint *)
function unregisterAsSatellite(var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnregisterAsSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUnregisterAsSatellite(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* updateSatelliteRecord entrypoint *)
function updateSatelliteRecord(const updateSatelliteRecordParams : updateSatelliteRecordType; var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateSatelliteRecord"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUpdateSatelliteRecord(updateSatelliteRecordParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);
    
} with response



(* distributeReward entrypoint *)
function distributeReward(const distributeRewardParams: distributeRewardTypes; var s: delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDistributeReward"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
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
function onStakeChange(const userAddress : address; var s : delegationStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaOnStakeChange"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaOnStakeChange(userAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* onSatelliteRewardPaid entrypoint *)
function onSatelliteRewardPaid(const userAddress : address; var s : delegationStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaOnSatelliteRewardPaid"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaOnSatelliteRewardPaid(userAddress);

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
function setLambda(const setLambdaParams: setLambdaType; var s: delegationStorage): return is
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
function main (const action : delegationAction; const s : delegationStorage) : return is 
  block{

    checkNoAmount(unit); // entrypoints should not receive any tez amount  

  } with (case action of [    

          // Housekeeping Entrypoints
        | SetAdmin(parameters)                          -> setAdmin(parameters, s)  
        | UpdateMetadata(parameters)                    -> updateMetadata(parameters, s)
        | UpdateConfig(parameters)                      -> updateConfig(parameters, s)
        | UpdateWhitelistContracts(parameters)          -> updateWhitelistContracts(parameters, s)
        | UpdateGeneralContracts(parameters)            -> updateGeneralContracts(parameters, s)

          // Pause / Break Glass Entrypoints
        | PauseAll(_parameters)                         -> pauseAll(s)
        | UnpauseAll(_parameters)                       -> unpauseAll(s)
        | TogglePauseDelegateToSatellite(_parameters)   -> togglePauseDelegateToSatellite(s)
        | TogglePauseUndelegateSatellite(_parameters)   -> togglePauseUndelegateSatellite(s)
        | TogglePauseRegisterSatellite(_parameters)     -> togglePauseRegisterSatellite(s)
        | TogglePauseUnregisterSatellite(_parameters)   -> togglePauseUnregisterSatellite(s)
        | TogglePauseUpdateSatellite(_parameters)       -> togglePauseUpdateSatellite(s)
        | TogglePauseDistributeReward(_parameters)      -> togglePauseDistributeReward(s)
        
          // Delegation Entrypoints
        | DelegateToSatellite(parameters)               -> delegateToSatellite(parameters, s)
        | UndelegateFromSatellite(_parameters)          -> undelegateFromSatellite(s)
        
          // Satellite Entrypoints
        | RegisterAsSatellite(parameters)               -> registerAsSatellite(parameters, s)
        | UnregisterAsSatellite(_parameters)            -> unregisterAsSatellite(s)
        | UpdateSatelliteRecord(parameters)             -> updateSatelliteRecord(parameters, s)
        | DistributeReward(parameters)                  -> distributeReward(parameters, s)

          // General Entrypoints
        | OnStakeChange(parameters)                     -> onStakeChange(parameters, s)
        | OnSatelliteRewardPaid(parameters)             -> onSatelliteRewardPaid(parameters, s)

          // Lambda Entrypoints
        | SetLambda(parameters)                         -> setLambda(parameters, s)    
    ]
  )
