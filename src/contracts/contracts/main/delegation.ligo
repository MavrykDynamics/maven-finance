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

// Delegation Types
#include "../partials/contractTypes/delegationTypes.ligo"

// MVK Token Type
#include "../partials/contractTypes/mvkTokenTypes.ligo"

// Treasury Type
#include "../partials/contractTypes/treasuryTypes.ligo"

// ------------------------------------------------------------------------------

type delegationAction is 

      // Housekeeping Entrypoints
    | SetAdmin                          of (address)
    | SetGovernance                     of (address)
    | UpdateMetadata                    of updateMetadataType
    | UpdateConfig                      of delegationUpdateConfigParamsType
    | UpdateWhitelistContracts          of updateWhitelistContractsType
    | UpdateGeneralContracts            of updateGeneralContractsType
    | MistakenTransfer                  of transferActionType

      // Pause / Break Glass Entrypoints
    | PauseAll                          of (unit)
    | UnpauseAll                        of (unit)
    | TogglePauseEntrypoint            of delegationTogglePauseEntrypointType

      // Delegation Entrypoints
    | DelegateToSatellite               of delegateToSatelliteType    
    | UndelegateFromSatellite           of (address)
    
      // Satellite Entrypoints
    | RegisterAsSatellite               of newSatelliteRecordType
    | UnregisterAsSatellite             of (address)
    | UpdateSatelliteRecord             of updateSatelliteRecordType
    | DistributeReward                  of distributeRewardStakedMvkType

      // General Entrypoints
    | OnStakeChange                     of onStakeChangeType
    | UpdateSatelliteStatus             of updateSatelliteStatusParamsType

      // Lambda Entrypoints
    | SetLambda                         of setLambdaType

const fixedPointAccuracy: nat = 1_000_000_000_000_000_000_000_000_000_000_000_000n // 10^36
const noOperations : list (operation) = nil;
type return is list (operation) * delegationStorageType

// delegation contract methods lambdas
type delegationUnpackLambdaFunctionType is (delegationLambdaActionType * delegationStorageType) -> return



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
  if (Tezos.sender = s.admin or Tezos.sender = s.governanceAddress) then unit
  else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



// Allowed Senders: Admin
function checkSenderIsAdmin(var s : delegationStorageType) : unit is
  if (Tezos.sender = s.admin) then unit
  else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



// Allowed Senders: Self
function checkSenderIsSelf(const _p : unit) : unit is
  if (Tezos.sender = Tezos.self_address) then unit
  else failwith(error_ONLY_SELF_ALLOWED);



// Allowed Senders: Doorman Contract
function checkSenderIsDoormanContract(var s : delegationStorageType) : unit is
block{
  const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
  const doormanAddress: address = case generalContractsOptView of [
      Some (_optionContract) -> case _optionContract of [
              Some (_contract)    -> _contract
          |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
          ]
  |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
  ];
  if (Tezos.sender = doormanAddress) then skip
  else failwith(error_ONLY_DOORMAN_CONTRACT_ALLOWED);
} with unit



// Allowed Senders: Governance Contract 
function checkSenderIsGovernanceContract(var s : delegationStorageType) : unit is
block{
  const governanceAddress : address = s.governanceAddress;
  if (Tezos.sender = governanceAddress) then skip
  else failwith(error_ONLY_GOVERNANCE_CONTRACT_ALLOWED);
} with unit



// Allowed Senders: Admin, Governance Satellite Contract
function checkSenderIsAdminOrGovernanceSatelliteContract(var s : delegationStorageType) : unit is
block{
  if Tezos.sender = s.admin then skip
  else {
    const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "governanceSatellite", s.governanceAddress);
    const governanceSatelliteAddress: address = case generalContractsOptView of [
        Some (_optionContract) -> case _optionContract of [
                Some (_contract)    -> _contract
            |   None                -> failwith (error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND)
            ]
    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];
    if Tezos.sender = governanceSatelliteAddress then skip
    else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED);
  }
} with unit



// Check User is a Satellite
function checkUserIsSatellite(const userAddress: address; var s : delegationStorageType) : unit is 
  if (Map.mem(userAddress, s.satelliteLedger)) then unit
  else failwith(error_ONLY_SATELLITE_ALLOWED);



// Check User is not a Satellite
function checkUserIsNotSatellite(const userAddress: address; var s : delegationStorageType) : unit is 
  if (Map.mem(userAddress, s.satelliteLedger)) then failwith(error_SATELLITE_NOT_ALLOWED)
  else unit;



// Check User is not delegated to a satellite
function checkUserIsNotDelegate(const userAddress: address; var s : delegationStorageType) : unit is 
  if (Big_map.mem(userAddress, s.delegateLedger)) then failwith(error_DELEGATE_NOT_ALLOWED)
  else unit;



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
  if (Tezos.amount = 0tez) then unit
  else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Rewards Helper Functions Begin
// ------------------------------------------------------------------------------

function updateRewards(const userAddress: address; var s: delegationStorageType): delegationStorageType is
  block{
    if Big_map.mem(userAddress, s.satelliteRewardsLedger) then {
      var satelliteRewardsRecord: satelliteRewardsType  := case Big_map.find_opt(userAddress, s.satelliteRewardsLedger) of [
        Some (_record) -> _record
      | None -> failwith(error_SATELLITE_REWARDS_NOT_FOUND)
      ];

      const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
      const doormanAddress: address = case generalContractsOptView of [
          Some (_optionContract) -> case _optionContract of [
                  Some (_contract)    -> _contract
              |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
              ]
      |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
      ];

      const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
      const stakedMvkBalance: nat = case stakedMvkBalanceView of [
          Some (value) -> value
        | None -> (failwith (error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND) : nat)
      ];

      const _satelliteReferenceRewardsRecord: satelliteRewardsType  = case Big_map.find_opt(satelliteRewardsRecord.satelliteReferenceAddress, s.satelliteRewardsLedger) of [
        Some (_referenceRecord) -> _referenceRecord
      | None -> failwith(error_REFERENCE_SATELLITE_REWARDS_RECORD_NOT_FOUND)
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

function checkDelegateToSatelliteIsNotPaused(var s : delegationStorageType) : unit is
  if s.breakGlassConfig.delegateToSatelliteIsPaused then failwith(error_DELEGATE_TO_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED)
  else unit;

    

function checkUndelegateFromSatelliteIsNotPaused(var s : delegationStorageType) : unit is
  if s.breakGlassConfig.undelegateFromSatelliteIsPaused then failwith(error_UNDELEGATE_FROM_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED)
  else unit;



function checkRegisterAsSatelliteIsNotPaused(var s : delegationStorageType) : unit is
  if s.breakGlassConfig.registerAsSatelliteIsPaused then failwith(error_REGISTER_AS_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED)
  else unit;



function checkUnregisterAsSatelliteIsNotPaused(var s : delegationStorageType) : unit is
  if s.breakGlassConfig.unregisterAsSatelliteIsPaused then failwith(error_UNREGISTER_AS_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED)
  else unit;



function checkUpdateSatelliteRecordIsNotPaused(var s : delegationStorageType) : unit is
  if s.breakGlassConfig.updateSatelliteRecordIsPaused then failwith(error_UPDATE_SATELLITE_RECORD_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED)
  else unit;



function checkDistributeRewardIsNotPaused(var s : delegationStorageType) : unit is
  if s.breakGlassConfig.distributeRewardIsPaused then failwith(error_DISTRIBUTE_REWARD_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED)
  else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Satellite Status Helper Functions
// ------------------------------------------------------------------------------

function checkSatelliteIsNotSuspended(const satelliteAddress: address; var s : delegationStorageType) : unit is
  case Map.find_opt(satelliteAddress, s.satelliteLedger) of [
    Some (_satellite) -> if _satellite.status = "SUSPENDED" then failwith(error_SATELLITE_SUSPENDED) else unit
  | None              -> failwith(error_SATELLITE_NOT_FOUND)
  ];



function checkSatelliteIsNotBanned(const satelliteAddress: address; var s : delegationStorageType) : unit is
  case Map.find_opt(satelliteAddress, s.satelliteLedger) of [
    Some (_satellite) -> if _satellite.status = "BANNED" then failwith(error_SATELLITE_BANNED) else unit
  | None              -> failwith(error_SATELLITE_NOT_FOUND)
  ];



function checkSatelliteIsNotSuspendedOrBanned(const satelliteAddress: address; var s : delegationStorageType) : unit is
  case Map.find_opt(satelliteAddress, s.satelliteLedger) of [
    Some (_satellite) -> if _satellite.status = "SUSPENDED" then failwith(error_SATELLITE_SUSPENDED) else if _satellite.status = "BANNED" then failwith(error_SATELLITE_BANNED) else unit
  | None              -> failwith(error_SATELLITE_NOT_FOUND)
  ];

// ------------------------------------------------------------------------------
// Satellite Status Helper Functions
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

function getDelegateToSatelliteEntrypoint(const delegationAddress : address) : contract(delegateToSatelliteType) is
  case (Tezos.get_entrypoint_opt(
      "%delegateToSatellite",
      delegationAddress) : option(contract(delegateToSatelliteType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_DELEGATE_TO_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(delegateToSatelliteType))
];



function getUndelegateFromSatelliteEntrypoint(const delegationAddress : address) : contract(address) is
  case (Tezos.get_entrypoint_opt(
      "%undelegateFromSatellite",
      delegationAddress) : option(contract(address))) of [
    Some(contr) -> contr
  | None -> (failwith(error_UNDELEGATE_FROM_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(address))
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

function getSatelliteRecord (const satelliteAddress : address; const s : delegationStorageType) : satelliteRecordType is
block {

    var satelliteRecord : satelliteRecordType :=
      record [
        status                = "ACTIVE";        
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

function unpackLambda(const lambdaBytes : bytes; const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is 
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

(* View: get admin variable *)
[@view] function getAdmin(const _: unit; var s : delegationStorageType) : address is
  s.admin



(* View: get Config *)
[@view] function getConfig(const _: unit; var s : delegationStorageType) : delegationConfigType is
  s.config



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _: unit; var s : delegationStorageType) : whitelistContractsType is
  s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _: unit; var s : delegationStorageType) : generalContractsType is
  s.generalContracts



(* View: get break glass config *)
[@view] function getBreakGlassConfig(const _: unit; var s : delegationStorageType) : delegationBreakGlassConfigType is
  s.breakGlassConfig



(* View: get Satellite Record *)
[@view] function getDelegateOpt(const delegateAddress: address; var s : delegationStorageType) : option(delegateRecordType) is
  Big_map.find_opt(delegateAddress, s.delegateLedger)



(* View: get Satellite Record *)
[@view] function getSatelliteOpt(const satelliteAddress: address; var s : delegationStorageType) : option(satelliteRecordType) is
  Map.find_opt(satelliteAddress, s.satelliteLedger)



(* View: get User reward *)
[@view] function getSatelliteRewardsOpt(const userAddress: address; var s : delegationStorageType) : option(satelliteRewardsType) is
  Big_map.find_opt(userAddress, s.satelliteRewardsLedger)



(* View: get map of active satellites *)
[@view] function getActiveSatellites(const _: unit; var s : delegationStorageType) : map(address, satelliteRecordType) is
block {

    var activeSatellites: map(address, satelliteRecordType) := Map.empty; 

    function findActiveSatellite(const activeSatellites: map(address, satelliteRecordType); const satellite: address * satelliteRecordType): map(address, satelliteRecordType) is
      if satellite.1.status = "ACTIVE" then Map.add(satellite.0, satellite.1, activeSatellites)
      else activeSatellites;

    var activeSatellites: map(address, satelliteRecordType) := Map.fold(findActiveSatellite, s.satelliteLedger, activeSatellites)

} with(activeSatellites)



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : delegationStorageType) : option(bytes) is
  Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _: unit; var s : delegationStorageType) : lambdaLedgerType is
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
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
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
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
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
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
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
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsType; var s: delegationStorageType): return is
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
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsType; var s: delegationStorageType): return is
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



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams: transferActionType; var s: delegationStorageType): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMistakenTransfer"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
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
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
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
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint: delegationTogglePauseEntrypointType; const s: delegationStorageType): return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseEntrypoint"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
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
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaDelegateToSatellite(delegateToSatelliteParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);

} with response



(* undelegateFromSatellite entrypoint *)
function undelegateFromSatellite(const undelegateToSatelliteParams: address; var s : delegationStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUndelegateFromSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
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
function registerAsSatellite(const registerAsSatelliteParams : newSatelliteRecordType; var s : delegationStorageType) : return is 
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
function unregisterAsSatellite(const userAddress: address; var s : delegationStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnregisterAsSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
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
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init delegation lambda action
    const delegationLambdaAction : delegationLambdaActionType = LambdaUpdateSatelliteRecord(updateSatelliteRecordParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, delegationLambdaAction, s);
    
} with response



(* distributeReward entrypoint *)
function distributeReward(const distributeRewardParams: distributeRewardStakedMvkType; var s: delegationStorageType) : return is
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
function onStakeChange(const userAddress : address; var s : delegationStorageType) : return is 
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



(* updateSatelliteStatus entrypoint *)
function updateSatelliteStatus(const updateSatelliteStatusParams : updateSatelliteStatusParamsType; var s : delegationStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateSatelliteStatus"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
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
function setLambda(const setLambdaParams: setLambdaType; var s: delegationStorageType): return is
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
function main (const action : delegationAction; const s : delegationStorageType) : return is 
  block{

    checkNoAmount(unit); // entrypoints should not receive any tez amount  

  } with (case action of [    

          // Housekeeping Entrypoints
          SetAdmin(parameters)                          -> setAdmin(parameters, s) 
        | SetGovernance(parameters)                     -> setGovernance(parameters, s) 
        | UpdateMetadata(parameters)                    -> updateMetadata(parameters, s)
        | UpdateConfig(parameters)                      -> updateConfig(parameters, s)
        | UpdateWhitelistContracts(parameters)          -> updateWhitelistContracts(parameters, s)
        | UpdateGeneralContracts(parameters)            -> updateGeneralContracts(parameters, s)
        | MistakenTransfer(parameters)                  -> mistakenTransfer(parameters, s)

          // Pause / Break Glass Entrypoints
        | PauseAll(_parameters)                         -> pauseAll(s)
        | UnpauseAll(_parameters)                       -> unpauseAll(s)
        | TogglePauseEntrypoint(parameters)            -> togglePauseEntrypoint(parameters, s)
        
          // Delegation Entrypoints
        | DelegateToSatellite(parameters)               -> delegateToSatellite(parameters, s)
        | UndelegateFromSatellite(parameters)           -> undelegateFromSatellite(parameters, s)
        
          // Satellite Entrypoints
        | RegisterAsSatellite(parameters)               -> registerAsSatellite(parameters, s)
        | UnregisterAsSatellite(parameters)             -> unregisterAsSatellite(parameters, s)
        | UpdateSatelliteRecord(parameters)             -> updateSatelliteRecord(parameters, s)
        | DistributeReward(parameters)                  -> distributeReward(parameters, s)

          // General Entrypoints
        | OnStakeChange(parameters)                     -> onStakeChange(parameters, s)
        | UpdateSatelliteStatus(parameters)             -> updateSatelliteStatus(parameters, s)

          // Lambda Entrypoints
        | SetLambda(parameters)                         -> setLambda(parameters, s)    
    ]
  )
