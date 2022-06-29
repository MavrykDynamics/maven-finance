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
  if s.breakGlassConfig.undelegateFromSatelliteIsPaused then failwith(error_UNDELEGATE_FROM_SATELLITE_IS_PAUSED)
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

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)
    s.admin := newAdminAddress;

} with (noOperations, s)



(* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const metadataKey: string; const metadataHash: bytes; var s : delegationStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)  
    s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);

} with (noOperations, s)



(* updateConfig entrypoint *)
function updateConfig(const updateConfigParams : delegationUpdateConfigParamsType; var s : delegationStorage) : return is 
block {

  checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)

  const updateConfigAction    : delegationUpdateConfigActionType   = updateConfigParams.updateConfigAction;
  const updateConfigNewValue  : delegationUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

  case updateConfigAction of [
      ConfigDelegationRatio (_v)         -> if updateConfigNewValue > 10_000n then failwith("Error. This config value cannot exceed 100%") else s.config.delegationRatio          := updateConfigNewValue
    | ConfigMinimumStakedMvkBalance (_v) -> if updateConfigNewValue < 100_000_000n then failwith("Error. This config value cannot go below 0.1SMVK") else s.config.minimumStakedMvkBalance  := updateConfigNewValue
    | ConfigMaxSatellites (_v)           -> s.config.maxSatellites            := updateConfigNewValue
  ];

} with (noOperations, s)



(* updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: delegationStorage): return is
block {
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);

} with (noOperations, s)



(* updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: delegationStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(* pauseAll entrypoint *)
function pauseAll(var s : delegationStorage) : return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    // set all pause configs to True

    if s.breakGlassConfig.delegateToSatelliteIsPaused then skip
    else s.breakGlassConfig.delegateToSatelliteIsPaused := True;

    if s.breakGlassConfig.undelegateFromSatelliteIsPaused then skip
    else s.breakGlassConfig.undelegateFromSatelliteIsPaused := True;

    if s.breakGlassConfig.registerAsSatelliteIsPaused then skip
    else s.breakGlassConfig.registerAsSatelliteIsPaused := True;

    if s.breakGlassConfig.unregisterAsSatelliteIsPaused then skip
    else s.breakGlassConfig.unregisterAsSatelliteIsPaused := True;

    if s.breakGlassConfig.updateSatelliteRecordIsPaused then skip
    else s.breakGlassConfig.updateSatelliteRecordIsPaused := True;

} with (noOperations, s)



(* unpauseAll entrypoint *)
function unpauseAll(var s : delegationStorage) : return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);

    // set all pause configs to False

    if s.breakGlassConfig.delegateToSatelliteIsPaused then s.breakGlassConfig.delegateToSatelliteIsPaused := False
    else skip;

    if s.breakGlassConfig.undelegateFromSatelliteIsPaused then s.breakGlassConfig.undelegateFromSatelliteIsPaused := False
    else skip;

    if s.breakGlassConfig.registerAsSatelliteIsPaused then s.breakGlassConfig.registerAsSatelliteIsPaused := False
    else skip;

    if s.breakGlassConfig.unregisterAsSatelliteIsPaused then s.breakGlassConfig.unregisterAsSatelliteIsPaused := False
    else skip;

    if s.breakGlassConfig.updateSatelliteRecordIsPaused then s.breakGlassConfig.updateSatelliteRecordIsPaused := False
    else skip;

} with (noOperations, s)



(* togglePauseDelegateToSatellite entrypoint *)
function togglePauseDelegateToSatellite(var s : delegationStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin
    if s.breakGlassConfig.delegateToSatelliteIsPaused then s.breakGlassConfig.delegateToSatelliteIsPaused := False
    else s.breakGlassConfig.delegateToSatelliteIsPaused := True;

} with (noOperations, s)



(* togglePauseUndelegateSatellite entrypoint *)
function togglePauseUndelegateSatellite(var s : delegationStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin
    if s.breakGlassConfig.undelegateFromSatelliteIsPaused then s.breakGlassConfig.undelegateFromSatelliteIsPaused := False
    else s.breakGlassConfig.undelegateFromSatelliteIsPaused := True;

} with (noOperations, s)



(* togglePauseRegisterSatellite entrypoint *)
function togglePauseRegisterSatellite(var s : delegationStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin
    if s.breakGlassConfig.registerAsSatelliteIsPaused then s.breakGlassConfig.registerAsSatelliteIsPaused := False
    else s.breakGlassConfig.registerAsSatelliteIsPaused := True;

} with (noOperations, s)



(* togglePauseUnregisterSatellite entrypoint *)
function togglePauseUnregisterSatellite(var s : delegationStorage) : return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    if s.breakGlassConfig.unregisterAsSatelliteIsPaused then s.breakGlassConfig.unregisterAsSatelliteIsPaused := False
    else s.breakGlassConfig.unregisterAsSatelliteIsPaused := True;

} with (noOperations, s)



(* togglePauseUpdateSatellite entrypoint *)
function togglePauseUpdateSatellite(var s : delegationStorage) : return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    if s.breakGlassConfig.updateSatelliteRecordIsPaused then s.breakGlassConfig.updateSatelliteRecordIsPaused := False
    else s.breakGlassConfig.updateSatelliteRecordIsPaused := True;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Delegation Entrypoints Begin
// ------------------------------------------------------------------------------

(* delegateToSatellite entrypoint *)
function delegateToSatellite(const satelliteAddress : address; var s : delegationStorage) : return is 
block {

    // Overall steps:
    // 1. check if satellite exists
    // 2. callback to doorman contract to fetch staked MVK (sMVK) balance
    // 3. save new user delegate record
    // 4. update satellite total delegated amount

    // check that entrypoint is not paused
    checkDelegateToSatelliteIsNotPaused(s);

    // check that sender is not a satellite
    checkSenderIsNotSatellite(s);
    
    // check if satellite exists
    var _checkSatelliteExists : satelliteRecordType := case s.satelliteLedger[satelliteAddress] of [
         Some(_val) -> _val
        | None -> failwith("Satellite does not exist")
    ];

    const doormanAddress : address = case s.generalContracts["doorman"] of [
      Some(_address) -> _address
      | None -> failwith("Error. Doorman Contract is not found")
    ];

    var operations : list(operation) := nil;

    // enable redelegation of satellites even if a user is delegated to a satellite already - easier alternative -> batch call undelegateFromSatellite, then delegateToSatellite
    // get delegate record if exists, if not create a new delegate record

    // check if user is delegated to a satellite or not
    if Big_map.mem(Tezos.source, s.delegateLedger) then block {
      // user is already delegated to a satellite 
      var delegateRecord : delegateRecordType := case s.delegateLedger[Tezos.source] of [
          Some(_delegateRecord) -> _delegateRecord
        | None -> failwith("Delegate Record does not exist") // failwith should not be reached as conditional check is already cleared
      ];

      const previousSatellite : address = delegateRecord.satelliteAddress; 

      // check that new satellite is not the same as previously delegated satellite
      if previousSatellite = satelliteAddress then failwith("You are already delegated to this satellite")
        else skip;

      const delegateFromSatellite : contract(address) = Tezos.self("%delegateToSatellite");
      const delegateFromSatelliteOperation : operation = Tezos.transaction(
        (satelliteAddress),
        0tez, 
        delegateFromSatellite
      );

      operations  := delegateFromSatelliteOperation # operations;

      const undelegateFromSatellite : contract(unit) = Tezos.self("%undelegateFromSatellite");
      const undelegateFromSatelliteOperation : operation = Tezos.transaction(
        (unit),
        0tez, 
        undelegateFromSatellite
      );

      operations  := undelegateFromSatelliteOperation # operations;

    } else block {

      const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", Tezos.source, doormanAddress);
      const stakedMvkBalance: nat = case stakedMvkBalanceView of [
        Some (value) -> value
      | None -> (failwith ("Error. GetStakedBalance View not found in the Doorman Contract") : nat)
      ];
      
      // user is not delegated to a satellite
      var delegateRecord : delegateRecordType := record [
          satelliteAddress  = satelliteAddress;
          delegatedDateTime = Tezos.now;
          delegatedSMvkBalance     = stakedMvkBalance;
      ];

      s.delegateLedger[Tezos.source] := delegateRecord;
      // Retrieve satellite account from delegationStorage
      var satelliteRecord : satelliteRecordType := getSatelliteRecord(satelliteAddress, s);

      // update satellite totalDelegatedAmount balance
      satelliteRecord.totalDelegatedAmount := satelliteRecord.totalDelegatedAmount + stakedMvkBalance; 
      
      // update satellite ledger delegationStorage with new balance
      s.satelliteLedger[satelliteAddress] := satelliteRecord;

    }

} with (operations, s)



(* undelegateFromSatellite entrypoint *)
function undelegateFromSatellite(var s : delegationStorage) : return is
block {

    // Overall steps:
    // 1. check if user address exists in delegateLedger
    // 2. callback to doorman contract to fetch sMVK balance
    // 3a. if satellite exists, update satellite record with new balance and remove user from delegateLedger
    // 3b. if satellite does not exist, remove user from delegateLedger

    // check that entrypoint is not paused
    checkUndelegateFromSatelliteIsNotPaused(s);

    var _delegateRecord : delegateRecordType := case s.delegateLedger[Tezos.source] of [
        Some(_val) -> _val
      | None -> failwith("Error. User address not found in delegateLedger.")
    ];

    const doormanAddress : address = case s.generalContracts["doorman"] of [
        Some(_address) -> _address
      | None -> failwith("Error. Doorman Contract is not found")
    ];

    const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", Tezos.source, doormanAddress);
    const stakedMvkBalance: nat = case stakedMvkBalanceView of [
        Some (value) -> value
      | None -> (failwith ("Error. GetStakedBalance View not found in the Doorman Contract") : nat)
    ];

    var emptySatelliteRecord : satelliteRecordType :=
      record [
        status                = 0n;        
        stakedMvkBalance      = 0n;       
        satelliteFee          = 0n;    
        totalDelegatedAmount  = 0n;
        
        name                  = "Empty Satellite";
        description           = "Empty Satellite";
        image                 = ""; 

        registeredDateTime    = Tezos.now;
      ];

    var _satelliteRecord : satelliteRecordType := case s.satelliteLedger[_delegateRecord.satelliteAddress] of [
        None -> emptySatelliteRecord
      | Some(_record) -> _record
    ];

    if _satelliteRecord.status = 1n then block {
      // satellite exists

      // check that sMVK balance does not exceed satellite's total delegated amount
        if stakedMvkBalance > _satelliteRecord.totalDelegatedAmount then failwith("Error. User's staked MVK balance exceeds satellite's total delegated amount.")
        else skip;
        
        // update satellite totalDelegatedAmount balance
        _satelliteRecord.totalDelegatedAmount := abs(_satelliteRecord.totalDelegatedAmount - stakedMvkBalance); 
        
        // update satellite ledger delegationStorage with new balance
        s.satelliteLedger[_delegateRecord.satelliteAddress] := _satelliteRecord;

    } else skip;

    // remove user's address from delegateLedger
    remove (Tezos.source : address) from map s.delegateLedger;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Delegation Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Satellite Entrypoints Begin
// ------------------------------------------------------------------------------

(* registerAsSatellite entrypoint *)
function registerAsSatellite(const registerAsSatelliteParams : newSatelliteRecordType; var s : delegationStorage) : return is 
block {
    
    // Overall steps: 
    // 1. verify that satellite does not already exist (prevent double registration)
    // 2. callback to doorman contract to fetch sMVK balance
    // 3. if user sMVK balance is more than minimumDelegateBond, register as delegate
    // 4. add new satellite record and save to satelliteLedger

    // add the satellite fields here

    // check that entrypoint is not paused
    checkRegisterAsSatelliteIsNotPaused(s);

    // Get user stake balance
    const doormanAddress : address = case s.generalContracts["doorman"] of [
        Some(_address) -> _address
      | None -> failwith("Error. Doorman Contract is not found")
    ];

    const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", Tezos.source, doormanAddress);
    const stakedMvkBalance: nat = case stakedMvkBalanceView of [
        Some (value) -> value
      | None -> (failwith ("Error. GetStakedBalance View not found in the Doorman Contract") : nat)
    ];

    // check if satellite has sufficient staked MVK balance
    if stakedMvkBalance < s.config.minimumStakedMvkBalance then failwith("You do not have enough sMVK to meet the minimum delegate bond.")
      else skip;

    // init new satellite record params
    const name          : string  = registerAsSatelliteParams.name;
    const description   : string  = registerAsSatelliteParams.description;
    const image         : string  = registerAsSatelliteParams.image;
    const satelliteFee  : nat     = registerAsSatelliteParams.satelliteFee;

    const satelliteRecord: satelliteRecordType = case Map.find_opt(Tezos.source, s.satelliteLedger) of [
        Some (_satellite) -> (failwith("Satellite already exists"): satelliteRecordType)
      | None -> record [            
            status                = 1n;
            stakedMvkBalance      = stakedMvkBalance;
            satelliteFee          = satelliteFee;
            totalDelegatedAmount  = 0n;

            name                  = name;
            description           = description;
            image                 = image;
            
            registeredDateTime    = Tezos.now;
        ]
    ];

    // Update satellite's record
    s.satelliteLedger[Tezos.source] := satelliteRecord;

} with (noOperations, s)



(* unregisterAsSatellite entrypoint *)
function unregisterAsSatellite(var s : delegationStorage) : return is
block {

    // Overall steps:
    // 1. check if satellite exists in satelliteLedger
    // 2. remove satellite address from satelliteLedger

    // check that entrypoint is not paused
    checkUnregisterAsSatelliteIsNotPaused(s);

    // check sender is satellite
    checkSenderIsSatellite(s);
    
    // remove sender from satellite ledger
    remove (Tezos.sender : address) from map s.satelliteLedger;

    // todo: oracles check

} with (noOperations, s)



(* updateSatelliteRecord entrypoint *)
function updateSatelliteRecord(const updateSatelliteRecordParams : updateSatelliteRecordType; var s : delegationStorage) : return is
block {

    // Overall steps:
    // 1. check if sender's address exists in satelliteLedger
    // 2. update satellite records

    checkUpdateSatelliteRecordIsNotPaused(s);

    var satelliteRecord : satelliteRecordType := case s.satelliteLedger[Tezos.sender] of [
        Some(_val) -> _val
      | None -> failwith("Satellite does not exist")
    ];

    // init updated satellite record params
    const name          : string  = updateSatelliteRecordParams.name;
    const description   : string  = updateSatelliteRecordParams.description;
    const image         : string  = updateSatelliteRecordParams.image;
    const satelliteFee  : nat     = updateSatelliteRecordParams.satelliteFee;

    // update satellite details - validation checks should be done before submitting to smart contract
    satelliteRecord.name           := name;         
    satelliteRecord.description    := description;  
    satelliteRecord.image          := image;   
    satelliteRecord.satelliteFee   := satelliteFee;        
    
    // update satellite ledger delegationStorage with new information
    s.satelliteLedger[Tezos.sender] := satelliteRecord;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Satellite Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Entrypoints Begin
// ------------------------------------------------------------------------------

(* onStakeChange entrypoint *)
function onStakeChange(const userAddress : address; var s : delegationStorage) : return is 
block {

    // Overall steps:
    // 1. check if user is a satellite 
    // 2a. if user is a satellite, update satellite's bond amount
    // 2b. if user is not a satellite, update satellite's total delegated amount

    // check sender is Doorman Contract or Treasury Contract
    // checkSenderIsDoormanContract(s);
    
    if checkInWhitelistContracts(Tezos.sender, s.whitelistContracts) then skip else failwith("Error. Sender is not in whitelisted contracts.");

    const userIsSatellite: bool = Map.mem(userAddress, s.satelliteLedger);

    var operations: list(operation) := nil;

    // check if user is a satellite
    if userIsSatellite then block {

      // Find doorman address
      const doormanAddress : address = case s.generalContracts["doorman"] of [
          Some(_address) -> _address
        | None -> failwith("Error. Doorman Contract is not found")
      ];

      // Get user SMVK Balance
      const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", Tezos.source, doormanAddress);
      const stakedMvkBalance: nat = case stakedMvkBalanceView of [
          Some (value) -> value
        | None -> (failwith ("Error. GetStakedBalance View not found in the Doorman Contract") : nat)
      ];

      var satelliteRecord: satelliteRecordType := case Map.find_opt(userAddress, s.satelliteLedger) of [
          Some (_satellite) -> _satellite
        | None -> failwith("Error: satellite record not found.")
      ];

      // Save satellite
      satelliteRecord.stakedMvkBalance := stakedMvkBalance;
      s.satelliteLedger := Map.update(userAddress, Some(satelliteRecord), s.satelliteLedger);
    
    } else block {

      // check if user has delegated to a satellite
      const userIsDelegator: bool = Big_map.mem(userAddress, s.delegateLedger);
      
      if userIsDelegator then block {
        // Retrieve satellite account from delegationStorage
        var _delegatorRecord: delegateRecordType := case Big_map.find_opt(userAddress, s.delegateLedger) of [
          Some (_delegate) -> _delegate
        | None -> failwith("Error: delegate record not found.")
        ];

        const userHasActiveSatellite: bool = Map.mem(_delegatorRecord.satelliteAddress, s.satelliteLedger);
        if userHasActiveSatellite then block {
          // Find doorman address
          const doormanAddress : address = case s.generalContracts["doorman"] of [
            Some(_address) -> _address
            | None -> failwith("Error. Doorman Contract is not found")
          ];

          // Get user SMVK Balance
          const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", Tezos.source, doormanAddress);
          const stakedMvkBalance: nat = case stakedMvkBalanceView of [
            Some (value) -> value
          | None -> (failwith ("Error. GetStakedBalance View not found in the Doorman Contract") : nat)
          ];

          var userSatellite: satelliteRecordType := case Map.find_opt(_delegatorRecord.satelliteAddress, s.satelliteLedger) of [
            Some (_delegatedSatellite) -> _delegatedSatellite
          | None -> failwith("Error: satellite record not found.")
          ];

          const stakeAmount: nat = abs(_delegatorRecord.delegatedSMvkBalance - stakedMvkBalance);

          // Save satellite
          if stakedMvkBalance > _delegatorRecord.delegatedSMvkBalance then userSatellite.totalDelegatedAmount := userSatellite.totalDelegatedAmount + stakeAmount
          else if stakeAmount > userSatellite.totalDelegatedAmount then failwith("Error: stakeAmount is larger than satellite's total delegated amount.")
          else userSatellite.totalDelegatedAmount := abs(userSatellite.totalDelegatedAmount - stakeAmount);

          _delegatorRecord.delegatedSMvkBalance  := stakedMvkBalance;
          s.delegateLedger   := Map.update(userAddress, Some(_delegatorRecord), s.delegateLedger);
          s.satelliteLedger  := Map.update(_delegatorRecord.satelliteAddress, Some(userSatellite), s.satelliteLedger);
        } 
        // Force User to undelegate if it does not have an active satellite anymore
        else operations := Tezos.transaction((unit), 0tez, (Tezos.self("%undelegateFromSatellite"): contract(unit))) # operations;
      }

      else skip
    }

} with (operations, s)

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


function main (const action : delegationAction; const s : delegationStorage) : return is 
  block{

    // Check that sender didn't send any tez while calling an entrypoint
    checkNoAmount(unit);

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