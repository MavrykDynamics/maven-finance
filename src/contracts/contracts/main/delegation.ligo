// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Set Lambda Types
#include "../partials/functionalTypes/setLambdaTypes.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Delegation Type
#include "../partials/types/delegationTypes.ligo"

// ------------------------------------------------------------------------------

type delegationAction is 

      // Housekeeping Entrypoints
    | SetAdmin                          of (address)
    | UpdateMetadata                    of (string * bytes)
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

      // Delegation Entrypoints
    | DelegateToSatellite               of (address)    
    | UndelegateFromSatellite           of (unit)
    
      // Satellite Entrypoints
    | RegisterAsSatellite               of newSatelliteRecordType
    | UnregisterAsSatellite             of (unit)
    | UpdateSatelliteRecord             of updateSatelliteRecordType

      // General Entrypoints
    | OnStakeChange                     of onStakeChangeParams

      // Lambda Entrypoints
    | SetLambda                         of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * delegationStorage


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

[@inline] const error_LAMBDA_NOT_FOUND                                      = 17n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                               = 18n;

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
// Admin Helper Functions Begin
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

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

function delegateToSatelliteEntrypoint(const delegationAddress : address) : contract(address) is
  case (Tezos.get_entrypoint_opt(
      "%delegateToSatellite",
      delegationAddress) : option(contract(address))) of [
    Some(contr) -> contr
  | None -> (failwith(error_DELEGATE_TO_SATELLITE_ENTRYPOINT_NOT_FOUND) : contract(address))
];

function undelegateFromSatelliteEntrypoint(const delegationAddress : address) : contract(unit) is
  case (Tezos.get_entrypoint_opt(
      "%undelegateFromSatellite",
      delegationAddress) : option(contract(unit))) of [
    Some(contr) -> contr
  | None -> (failwith(error_UNDELEGATE_FROM_SATELLITE_ENTRYPOINT_NOT_FOUND) : contract(unit))
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
  s.satelliteLedger[satelliteAddress]



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
    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * delegationStorage) -> return )) of [
      | Some(f) -> f(newAdminAddress, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];
    
} with (res.0, res.1)



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const metadataKey: string; const metadataHash: bytes; var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((string * bytes * delegationStorage) -> return )) of [
      | Some(f) -> f(metadataKey, metadataHash, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* updateConfig entrypoint *)
function updateConfig(const updateConfigParams : delegationUpdateConfigParamsType; var s : delegationStorage) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((delegationUpdateConfigParamsType * delegationStorage) -> return )) of [
      | Some(f) -> f(updateConfigParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: delegationStorage): return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((updateWhitelistContractsParams * delegationStorage) -> return )) of [
      | Some(f) -> f(updateWhitelistContractsParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: delegationStorage): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((updateGeneralContractsParams * delegationStorage) -> return )) of [
      | Some(f) -> f(updateGeneralContractsParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

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

    const res : return = case (Bytes.unpack(lambdaBytes) : option((delegationStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* unpauseAll entrypoint *)
function unpauseAll(var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((delegationStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* togglePauseDelegateToSatellite entrypoint *)
function togglePauseDelegateToSatellite(var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseDelegateToSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((delegationStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* togglePauseUndelegateSatellite entrypoint *)
function togglePauseUndelegateSatellite(var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseUndelegateSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((delegationStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* togglePauseRegisterSatellite entrypoint *)
function togglePauseRegisterSatellite(var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseRegisterSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((delegationStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* togglePauseUnregisterSatellite entrypoint *)
function togglePauseUnregisterSatellite(var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseUnregisterSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((delegationStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* togglePauseUpdateSatellite entrypoint *)
function togglePauseUpdateSatellite(var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseUpdateSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((delegationStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

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

    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * delegationStorage) -> return )) of [
      | Some(f) -> f(satelliteAddress, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* undelegateFromSatellite entrypoint *)
function undelegateFromSatellite(var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUndelegateFromSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((delegationStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

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

    const res : return = case (Bytes.unpack(lambdaBytes) : option((newSatelliteRecordType * delegationStorage) -> return )) of [
      | Some(f) -> f(registerAsSatelliteParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* unregisterAsSatellite entrypoint *)
function unregisterAsSatellite(var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnregisterAsSatellite"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((delegationStorage) -> return )) of [
      | Some(f) -> f(s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)



(* updateSatelliteRecord entrypoint *)
function updateSatelliteRecord(const updateSatelliteRecordParams : updateSatelliteRecordType; var s : delegationStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateSatelliteRecord"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    const res : return = case (Bytes.unpack(lambdaBytes) : option((updateSatelliteRecordType * delegationStorage) -> return )) of [
      | Some(f) -> f(updateSatelliteRecordParams, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];
    
} with (res.0, res.1)

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

    const res : return = case (Bytes.unpack(lambdaBytes) : option((address * delegationStorage) -> return )) of [
      | Some(f) -> f(userAddress, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

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
        | UpdateMetadata(parameters)                    -> updateMetadata(parameters.0, parameters.1, s)
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
        
          // Delegation Entrypoints
        | DelegateToSatellite(parameters)               -> delegateToSatellite(parameters, s)
        | UndelegateFromSatellite(_parameters)          -> undelegateFromSatellite(s)
        
          // Satellite Entrypoints
        | RegisterAsSatellite(parameters)               -> registerAsSatellite(parameters, s)
        | UnregisterAsSatellite(_parameters)            -> unregisterAsSatellite(s)
        | UpdateSatelliteRecord(parameters)             -> updateSatelliteRecord(parameters, s)

          // General Entrypoints
        | OnStakeChange(parameters)                     -> onStakeChange(parameters, s)    

          // Lambda Entrypoints
        | SetLambda(parameters)                         -> setLambda(parameters, s)    
    ]
  )