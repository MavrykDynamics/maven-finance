// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

type onStakeChangeParams is (address * nat * nat)
type updateSatelliteRecordParams is (string * string * string * nat)

// record for users choosing satellites 
type delegateRecordType is record [
    satelliteAddress     : address;
    delegatedDateTime    : timestamp;  
    // fee -> custom delegate fee for satellite
]
type delegateLedgerType is big_map (address, delegateRecordType)

// todo: add pointsystem

type newSatelliteRecordType is (string * string * string * nat) // name, description, image, satellite fee
type registerAsSatelliteCompleteParamsType  is (string * string * string * nat * nat) // name, description, image, satellite fee, staked MVK balance

// record for satellites
type satelliteRecordType is record [
    status                : nat;        // active: 1; inactive: 0; 
    stakedMvkBalance      : nat;        // bondAmount -> staked MVK Balance
    satelliteFee          : nat;        // fee that satellite charges to delegates ? to be clarified in terms of satellite distribution
    totalDelegatedAmount  : nat;        // record of total delegated amount from delegates
    
    name                  : string;     // string for name
    description           : string;     // string for description
    image                 : string;     // ipfs hash
    
    registeredDateTime    : timestamp;  

    // bondSufficiency       : nat;        // bond sufficiency flag - set to 1 if satellite has enough bond; set to 0 if satellite has not enough bond (over-delegated) when checked on governance action    
]
type satelliteLedgerType is big_map (address, satelliteRecordType)
type getSatelliteVotingPowerParamsType is (address * contract(address * nat * nat))

type requestSatelliteSnapshotType is  [@layout:comb] record [
    satelliteAddress      : address;
    requestId             : nat; 
    stakedMvkBalance      : nat; 
    totalDelegatedAmount  : nat; 
]
type getSatelliteRequestSnapshotType is [@layout:comb] record [
  satelliteAddress  : address;
  requestId         : nat; 
  callbackContract  : contract(requestSatelliteSnapshotType);
]

type configType is record [
    minimumStakedMvkBalance   : nat;   // minimumStakedMvkBalance - minimum amount of staked MVK required to register as delegate (in muMVK)
    delegationRatio           : nat;   // delegationRatio (tbd) -   percentage to determine if satellite is overdelegated (requires more staked MVK to be staked) or underdelegated    
    maxSatellites             : nat;   // 100 -> prevent any gaming of system with mass registration of satellites - can be changed through governance
]

type breakGlassConfigType is record [
    
    delegateToSatelliteIsPaused      : bool; 
    undelegateFromSatelliteIsPaused  : bool;

    registerAsSatelliteIsPaused      : bool;
    unregisterAsSatelliteIsPaused    : bool;

    updateSatelliteRecordIsPaused    : bool;
]

type storage is record [
    admin                : address;
    mvkTokenAddress      : address;

    config               : configType;

    whitelistContracts   : whitelistContractsType;      
    generalContracts     : generalContractsType;

    breakGlassConfig     : breakGlassConfigType;
    delegateLedger       : delegateLedgerType;
    satelliteLedger      : satelliteLedgerType;
]

type updateConfigNewValueType is nat
type updateConfigActionType is 
  ConfigMinimumStakedMvkBalance of unit
| ConfigDelegationRatio of unit
| ConfigMaxSatellites of unit
type updateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue: updateConfigNewValueType; 
  updateConfigAction: updateConfigActionType;
]

type delegationAction is 
    | SetAdmin of (address)
    | UpdateConfig of updateConfigParamsType

    | UpdateWhitelistContracts of updateWhitelistContractsParams
    | UpdateGeneralContracts of updateGeneralContractsParams

    | TogglePauseDelegateToSatellite of (unit)
    | TogglePauseUndelegateSatellite of (unit)
    | TogglePauseRegisterSatellite of (unit)
    | TogglePauseUnregisterSatellite of (unit)
    | TogglePauseUpdateSatellite of (unit)
    | PauseAll of (unit)
    | UnpauseAll of (unit)

    | DelegateToSatellite of (address)
    | DelegateToSatelliteComplete of (nat)
    | RedelegateSatellite of (address)

    | GetSatelliteVotingPower of getSatelliteVotingPowerParamsType
    | GetSatelliteRequestSnapshot of getSatelliteRequestSnapshotType
    
    | UndelegateFromSatellite of (unit)
    | UndelegateFromSatelliteComplete of (nat)
    
    | RegisterAsSatellite of newSatelliteRecordType
    | RegisterAsSatelliteComplete of registerAsSatelliteCompleteParamsType
    | UnregisterAsSatellite of (unit)

    | UpdateSatelliteRecord of (updateSatelliteRecordParams)
    | OnStakeChange of onStakeChangeParams

const noOperations : list (operation) = nil;
type return is list (operation) * storage


// admin helper functions begin ---------------------------------------------------------------------------------
function checkSenderIsAdmin(var s : storage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith("Only the administrator can call this entrypoint.");

function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.sender = Tezos.self_address) then unit
    else failwith("Only this contract can call this entrypoint.");

function checkSenderIsDoormanContract(var s : storage) : unit is
block{
  const doormanAddress : address = case s.generalContracts["doorman"] of
      Some(_address) -> _address
      | None -> failwith("Error. Doorman Contract is not found.")
  end;
  if (Tezos.sender = doormanAddress) then skip
  else failwith("Error. Only the Doorman Contract can call this entrypoint.");
} with unit

function checkSenderIsGovernanceContract(var s : storage) : unit is
block{
  const governanceAddress : address = case s.generalContracts["governance"] of
      Some(_address) -> _address
      | None -> failwith("Error. Governance Contract is not found.")
  end;
  if (Tezos.sender = governanceAddress) then skip
  else failwith("Error. Only the Governance Contract can call this entrypoint.");
} with unit

function checkNoAmount(const _p : unit) : unit is
  if (Tezos.amount = 0tez) then unit
  else failwith("This entrypoint should not receive any tez.");

// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"

// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

// admin helper functions end -----------------------------------------------------------------------------------

(* View function that forwards the satellite voting power to the Governance or other contract *)
function getSatelliteVotingPower(const satelliteAddress : address; const contr : contract(address * nat * nat); var s : storage) : return is
  block {
    const satelliteRecord : satelliteRecordType = case s.satelliteLedger[satelliteAddress] of
      None -> failwith("Satellite not found")
    | Some(instance) -> instance
    end;
  } with (list [transaction((satelliteAddress, satelliteRecord.stakedMvkBalance, satelliteRecord.totalDelegatedAmount), 0tz, contr)], s)

(* View function that forwards the satellite voting power and financial request id to the Governance contract *)
function getSatelliteRequestSnapshot(const satelliteRequestSnapshot : getSatelliteRequestSnapshotType; var s : storage) : return is
  block {
    const satelliteRecord : satelliteRecordType = case s.satelliteLedger[satelliteRequestSnapshot.satelliteAddress] of
      None -> failwith("Satellite not found")
    | Some(instance) -> instance
    end;

    const requestSatelliteSnapshotParams : requestSatelliteSnapshotType = record [
      satelliteAddress      = satelliteRequestSnapshot.satelliteAddress;
      requestId             = satelliteRequestSnapshot.requestId;
      stakedMvkBalance      = satelliteRecord.stakedMvkBalance;
      totalDelegatedAmount  = satelliteRecord.totalDelegatedAmount;
    ]

  } with (list [transaction(requestSatelliteSnapshotParams, 0tz, satelliteRequestSnapshot.callbackContract)], s)

// break glass: checkIsNotPaused helper functions begin ---------------------------------------------------------
function checkDelegateToSatelliteIsNotPaused(var s : storage) : unit is
    if s.breakGlassConfig.delegateToSatelliteIsPaused then failwith("DelegateToSatellite entrypoint is paused.")
    else unit;

function checkUndelegateFromSatelliteIsNotPaused(var s : storage) : unit is
    if s.breakGlassConfig.undelegateFromSatelliteIsPaused then failwith("UndelegateFromSatellite entrypoint is paused.")
    else unit;

  function checkRegisterAsSatelliteIsNotPaused(var s : storage) : unit is
    if s.breakGlassConfig.registerAsSatelliteIsPaused then failwith("RegisterAsSatellite entrypoint is paused.")
    else unit;

  function checkUnregisterAsSatelliteIsNotPaused(var s : storage) : unit is
    if s.breakGlassConfig.unregisterAsSatelliteIsPaused then failwith("UnregisterAsSatellite entrypoint is paused.")
    else unit;
  
  function checkUpdateSatelliteRecordIsNotPaused(var s : storage) : unit is
    if s.breakGlassConfig.updateSatelliteRecordIsPaused then failwith("UpdateSatelliteRecord entrypoint is paused.")
    else unit;
// break glass: checkIsNotPaused helper functions end -----------------------------------------------------------

// helper functions begin: --------------------------------------------------------------------------------------

// helper function to update governance satellite set
function updateGovernanceActiveSatellitesMap(const contractAddress : address) : contract(unit * address) is
  case (Tezos.get_entrypoint_opt(
      "%updateActiveSatellitesMap",
      contractAddress) : option(contract(unit * address))) of
    Some(contr) -> contr
  | None -> (failwith("UpdateActiveSatellitesMap entrypoint in Governance Contract not found") : contract(unit * address))
  end;

function fetchStakedMvkBalance(const tokenAddress : address) : contract(address * contract(nat)) is
  case (Tezos.get_entrypoint_opt(
      "%getStakedBalance",
      tokenAddress) : option(contract(address * contract(nat)))) of
    Some(contr) -> contr
  | None -> (failwith("GetStakedBalance entrypoint in Doorman Contract not found") : contract(address * contract(nat)))
  end;

function getSatelliteBalance(const contractAddress : address) : contract(address * string * string * string * nat * contract(registerAsSatelliteCompleteParamsType)) is
  case (Tezos.get_entrypoint_opt(
      "%getSatelliteBalance",
      contractAddress) : option(contract(address * string * string * string * nat * contract(registerAsSatelliteCompleteParamsType)))) of
    Some(contr) -> contr
  | None -> (failwith("GetSatelliteBalance entrypoint in Doorman Contract not found") : contract(address * string * string * string * nat * contract(registerAsSatelliteCompleteParamsType)))
  end;

function redelegateSatellite(const contractAddress : address) : contract(address) is
case (Tezos.get_entrypoint_opt(
    "%redelegateSatellite",
    contractAddress) : option(contract(address))) of
  Some(contr) -> contr
| None -> (failwith("redelgateSatellite entrypoint in Delegation Contract not found") : contract(address))
end;


// helper function to get satellite 
function getSatelliteRecord (const satelliteAddress : address; const s : storage) : satelliteRecordType is
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

    case s.satelliteLedger[satelliteAddress] of
      None -> failwith("Satellite not found.")
    | Some(instance) -> satelliteRecord := instance
    end;
  } with satelliteRecord

// helper function to get user delegate
function getDelegateRecord (const userAddress : address; const s : storage) : delegateRecordType is
  block {
    var delegateRecord : delegateRecordType :=
      record [
        satelliteAddress  = userAddress;
        delegatedDateTime = Tezos.now; 
      ];

    case s.delegateLedger[userAddress] of
      None -> failwith("Delegate not found.")
    | Some(instance) -> delegateRecord := instance
    end;
  } with delegateRecord

  // helper function to get user delegate
function getOrCreateDelegateRecord (const userAddress : address; const s : storage) : delegateRecordType is
  block {
    var delegateRecord : delegateRecordType :=
      record [
        satelliteAddress  = userAddress;
        delegatedDateTime = Tezos.now; 
      ];

    case s.delegateLedger[userAddress] of
      None -> skip
    | Some(instance) -> delegateRecord := instance
    end;
  } with delegateRecord

// helper functions end: ----------------------------------------------------------------------------------------

// housekeeping functions begin: --------------------------------------------------------------------------------

(*  set contract admin address *)
function setAdmin(const newAdminAddress : address; var s : storage) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)

    s.admin := newAdminAddress;

} with (noOperations, s)


function updateConfig(const updateConfigParams : updateConfigParamsType; var s : storage) : return is 
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  // checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)

  const updateConfigAction    : updateConfigActionType   = updateConfigParams.updateConfigAction;
  const updateConfigNewValue  : updateConfigNewValueType = updateConfigParams.updateConfigNewValue;

  case updateConfigAction of
    ConfigDelegationRatio (_v)         -> s.config.delegationRatio          := updateConfigNewValue
  | ConfigMinimumStakedMvkBalance (_v) -> s.config.minimumStakedMvkBalance  := updateConfigNewValue
  | ConfigMaxSatellites (_v)           -> s.config.maxSatellites            := updateConfigNewValue
  end;

} with (noOperations, s)


// break glass toggle entrypoints begin ---------------------------------------------------------
function togglePauseDelegateToSatellite(var s : storage) : return is
block {
    checkSenderIsAdmin(s); // check that sender is admin
    if s.breakGlassConfig.delegateToSatelliteIsPaused then s.breakGlassConfig.delegateToSatelliteIsPaused := False
      else s.breakGlassConfig.delegateToSatelliteIsPaused := True;
} with (noOperations, s)

function togglePauseUndelegateSatellite(var s : storage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin

    if s.breakGlassConfig.undelegateFromSatelliteIsPaused then s.breakGlassConfig.undelegateFromSatelliteIsPaused := False
      else s.breakGlassConfig.undelegateFromSatelliteIsPaused := True;

} with (noOperations, s)

function togglePauseRegisterSatellite(var s : storage) : return is
block {
    checkSenderIsAdmin(s); // check that sender is admin
    if s.breakGlassConfig.registerAsSatelliteIsPaused then s.breakGlassConfig.registerAsSatelliteIsPaused := False
      else s.breakGlassConfig.registerAsSatelliteIsPaused := True;

} with (noOperations, s)

// note: togglePauseUnregisterAsSatellite is too long and exceeds max length of 32 characters so togglePauseUnregisterSatellite is used instead
function togglePauseUnregisterSatellite(var s : storage) : return is
block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    if s.breakGlassConfig.unregisterAsSatelliteIsPaused then s.breakGlassConfig.unregisterAsSatelliteIsPaused := False
      else s.breakGlassConfig.unregisterAsSatelliteIsPaused := True;

} with (noOperations, s)

// note: togglePauseUpdateSatelliteRecord is too long and exceeds max length of 32 characters so togglePauseUpdateSatellite is used instead
function togglePauseUpdateSatellite(var s : storage) : return is
block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    if s.breakGlassConfig.updateSatelliteRecordIsPaused then s.breakGlassConfig.updateSatelliteRecordIsPaused := False
      else s.breakGlassConfig.updateSatelliteRecordIsPaused := True;

} with (noOperations, s)

function pauseAll(var s : storage) : return is
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

function unpauseAll(var s : storage) : return is
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

// break glass toggle entrypoints end ---------------------------------------------------------

// housekeeping functions end: --------------------------------------------------------------------------------

function delegateToSatellite(const satelliteAddress : address; var s : storage) : return is 
block {

    // Overall steps:
    // 1. check if satellite exists
    // 2. callback to doorman contract to fetch staked MVK (vMVK) balance
    // 3. save new user delegate record
    // 4. update satellite total delegated amount

    // entrypoint should not receive any tez amount
    checkNoAmount(Unit);

    // check that entrypoint is not paused
    checkDelegateToSatelliteIsNotPaused(s);
    
    // check if satellite exists
    var _checkSatelliteExists : satelliteRecordType := case s.satelliteLedger[satelliteAddress] of
         Some(_val) -> _val
        | None -> failwith("Satellite does not exist")
    end;

    const doormanAddress : address = case s.generalContracts["doorman"] of
      Some(_address) -> _address
      | None -> failwith("Error. Doorman Contract is not found")
    end;

    var operations : list(operation) := nil;

    // enable redelegation of satellites even if a user is delegated to a satellite already - easier alternative -> batch call undelegateFromSatellite, then delegateToSatellite
    // get delegate record if exists, if not create a new delegate record

    // check if user is delegated to a satellite or not
    if Big_map.mem(Tezos.sender, s.delegateLedger) then block {
      // user is already delegated to a satellite 
      var delegateRecord : delegateRecordType := case s.delegateLedger[Tezos.sender] of
          Some(_delegateRecord) -> _delegateRecord
        | None -> failwith("Delegate Record does not exist") // failwith should not be reached as conditional check is already cleared
      end;

      const previousSatellite : address = delegateRecord.satelliteAddress; 

      // check that new satellite is not the same as previously delegated satellite
      if previousSatellite = satelliteAddress then failwith("You are already delegated to this satellite")
        else skip;

      // update previously delegated satellite totalDelegatedAmount with decrease in user's vMVK balance
      const undelegateFromSatelliteCompleteCallback : contract(nat) = Tezos.self("%undelegateFromSatelliteComplete");
      const undelegateFromPreviousSatelliteOperation : operation = Tezos.transaction(
          (Tezos.sender, undelegateFromSatelliteCompleteCallback),
          0tez, 
          fetchStakedMvkBalance(doormanAddress)
          );

      // redelegate satellite
      const redelegateSatelliteOperation : operation = Tezos.transaction(
          satelliteAddress,
          0tez, 
          redelegateSatellite(Tezos.self_address)
          );

      // update new satellite totalDelegatedAmount with increase in user's vMVK balance
      const delegateToSatelliteCompleteCallback : contract(nat) = Tezos.self("%delegateToSatelliteComplete");
      const delegateToNewSatelliteOperation : operation = Tezos.transaction(
          (Tezos.sender, delegateToSatelliteCompleteCallback),
          0tez, 
          fetchStakedMvkBalance(doormanAddress)
          );    

      operations := delegateToNewSatelliteOperation # operations;          // runs second (after undelegateFromPreviousSatelliteOperation) 
      operations := redelegateSatelliteOperation # operations;
      operations := undelegateFromPreviousSatelliteOperation # operations; // runs first

    } else block {
      
      // user is not delegated to a satellite
      var delegateRecord : delegateRecordType := record [
          satelliteAddress  = satelliteAddress;
          delegatedDateTime = Tezos.now;
      ];

      s.delegateLedger[Tezos.sender] := delegateRecord;

      // update satellite totalDelegatedAmount with user's vMVK balance
      const delegateToSatelliteCompleteCallback : contract(nat) = Tezos.self("%delegateToSatelliteComplete");

      const delegateToSatelliteCompleteOperation : operation = Tezos.transaction(
          (Tezos.sender, delegateToSatelliteCompleteCallback),
          0tez, 
          fetchStakedMvkBalance(doormanAddress)
          );
    
      operations := delegateToSatelliteCompleteOperation # operations;

    }

} with (operations, s)

function redelegateSatellite(const newSatelliteAddress : address; var s : storage) : return is 
block {

    // check sender is self
    checkSenderIsSelf(Unit);

    // var delegateRecord : delegateRecordType := getOrCreateDelegateRecord(Tezos.source, s);
    const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg":address);

    var emptyDelegateRecord : delegateRecordType :=
      record [
        satelliteAddress  = zeroAddress;
        delegatedDateTime = Tezos.now; 
      ];

    var delegateRecord : delegateRecordType := case s.delegateLedger[Tezos.source] of
      None -> emptyDelegateRecord
    | Some(_record) -> _record
    end;

    delegateRecord.satelliteAddress := newSatelliteAddress;

    s.delegateLedger[Tezos.source] := delegateRecord;

} with (noOperations, s)

function delegateToSatelliteComplete(const stakedMvkBalance : nat; var s : storage) : return is 
block {

    // check sender is Doorman Contract
    checkSenderIsDoormanContract(s);

    // Retrieve delegate record from storage
    // var delegateRecord : delegateRecordType := getDelegateRecord(Tezos.source, s);
    var delegateRecord : delegateRecordType := getOrCreateDelegateRecord(Tezos.source, s);

    // Retrieve satellite account from storage
    var satelliteRecord : satelliteRecordType := getSatelliteRecord(delegateRecord.satelliteAddress, s);

    // update satellite totalDelegatedAmount balance
    satelliteRecord.totalDelegatedAmount := satelliteRecord.totalDelegatedAmount + stakedMvkBalance; 
    
    // update satellite ledger storage with new balance
    s.satelliteLedger[delegateRecord.satelliteAddress] := satelliteRecord;

} with (noOperations, s)

function undelegateFromSatellite(var s : storage) : return is
block {

    // Overall steps:
    // 1. check if user address exists in delegateLedger
    // 2. callback to doorman contract to fetch vMVK balance
    // 3a. if satellite exists, update satellite record with new balance and remove user from delegateLedger
    // 3b. if satellite does not exist, remove user from delegateLedger
    
    // entrypoint should not receive any tez amount
    checkNoAmount(Unit);

    // check that entrypoint is not paused
    checkUndelegateFromSatelliteIsNotPaused(s);

    var _delegateRecord : delegateRecordType := case s.delegateLedger[Tezos.sender] of
         Some(_val) -> _val
        | None -> failwith("Error. User address not found in delegateLedger.")
    end;

    const doormanAddress : address = case s.generalContracts["doorman"] of
      Some(_address) -> _address
      | None -> failwith("Error. Doorman Contract is not found")
    end;

    // update satellite totalDelegatedAmount - decrease total amount with user's vMVK balance
    const undelegateFromSatelliteCompleteCallback : contract(nat) = Tezos.self("%undelegateFromSatelliteComplete");
    const checkVMvkBalanceOperation : operation = Tezos.transaction(
        (Tezos.sender, undelegateFromSatelliteCompleteCallback),
         0tez, 
         fetchStakedMvkBalance(doormanAddress)
         );
    
    const operations : list(operation) = list [checkVMvkBalanceOperation];

} with (operations, s)


function undelegateFromSatelliteComplete(const stakedMvkBalance : nat; var s : storage) : return is 
block {

    // check sender is Doorman Contract
    checkSenderIsDoormanContract(s);

    // Retrieve delegate record from storage 
    var delegateRecord : delegateRecordType := getDelegateRecord(Tezos.source, s);    

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

    var _satelliteRecord : satelliteRecordType := case s.satelliteLedger[delegateRecord.satelliteAddress] of
      None -> emptySatelliteRecord
    | Some(_record) -> _record
    end;

    if _satelliteRecord.status = 1n then block {
      // satellite exists

      // check that vMVK balance does not exceed satellite's total delegated amount
        if stakedMvkBalance > _satelliteRecord.totalDelegatedAmount then failwith("Error. User's staked MVK balance exceeds satellite's total delegated amount.")
          else skip;
        
        // update satellite totalDelegatedAmount balance
        _satelliteRecord.totalDelegatedAmount := abs(_satelliteRecord.totalDelegatedAmount - stakedMvkBalance); 
        
        // update satellite ledger storage with new balance
        s.satelliteLedger[delegateRecord.satelliteAddress] := _satelliteRecord;

    } else skip;

    // remove user's address from delegateLedger
    remove (Tezos.source : address) from map s.delegateLedger;
    
} with (noOperations, s)

function updateSatelliteRecord(const name : string; const description : string; const image : string; const satelliteFee : nat; var s : storage) : return is
block {

    // Overall steps:
    // 1. check if sender's address exists in satelliteLedger
    // 2. update satellite records
    
    // entrypoint should not receive any tez amount
    checkNoAmount(Unit);

    var satelliteRecord : satelliteRecordType := case s.satelliteLedger[Tezos.sender] of
         Some(_val) -> _val
        | None -> failwith("Satellite does not exist")
    end;

    // update satellite details - validation checks should be done before submitting to smart contract
    satelliteRecord.name           := name;         
    satelliteRecord.description    := description;  
    satelliteRecord.image          := image;   
    satelliteRecord.satelliteFee   := satelliteFee;        
    
    // update satellite ledger storage with new information
    s.satelliteLedger[Tezos.sender] := satelliteRecord;

} with (noOperations, s)

// type newSatelliteRecordType is (string * string * string * nat) // name, description, image, satellite fee
// type registerAsSatelliteCompleteParamsType  is (string * string * string * nat * nat) // name, description, image, satellite fee, vMVK balance

function registerAsSatellite(const name : string; const description : string; const image : string; const satelliteFee : nat; var s : storage) : return is 
block {
    
    // Overall steps: 
    // 1. verify that satellite does not already exist (prevent double registration)
    // 2. callback to doorman contract to fetch vMVK balance
    // 3. if user vMVK balance is more than minimumDelegateBond, register as delegate
    // 4. add new satellite record and save to satelliteLedger

    // add the satellite fields here

    // entrypoint should not receive any tez amount
    checkNoAmount(Unit);

    // check that entrypoint is not paused
    checkRegisterAsSatelliteIsNotPaused(s);

    const satelliteExistsFlag : bool = Big_map.mem(Tezos.sender, s.satelliteLedger);

    // check if satellite record exists in the satellite ledger 
    if satelliteExistsFlag = True then block{

      var satelliteRecord : satelliteRecordType := case s.satelliteLedger[Tezos.sender] of
          None -> failwith("Satellite does not exist")  // will not be triggered
        | Some(_val) -> _val
      end;

      // check that satellite is not already active
      if satelliteRecord.status = 1n then failwith("Satellite already exists")
        else skip;
      
      // if satellite was previously unregistered (i.e. status = 0n), then register it again by setting status as 1n
      satelliteRecord.status := 1n;
      s.satelliteLedger[Tezos.sender] := satelliteRecord;

    } else skip;

    const doormanAddress : address = case s.generalContracts["doorman"] of
      Some(_address) -> _address
      | None -> failwith("Error. Doorman Contract is not found")
    end;

    // fetch and update MVK balance, and send satellite info (e.g. name, desc, fee) to callback 
    const registerAsSatelliteCompleteCallback : contract(registerAsSatelliteCompleteParamsType) = Tezos.self("%registerAsSatelliteComplete");
    const getSatelliteBalanceOperation : operation = Tezos.transaction(
        (Tezos.sender, name, description, image, satelliteFee, registerAsSatelliteCompleteCallback),
        0tez, 
        getSatelliteBalance(doormanAddress)
        );

    const operations : list(operation) = list [getSatelliteBalanceOperation];

} with (operations, s)

function registerAsSatelliteComplete(const satelliteParams : registerAsSatelliteCompleteParamsType; var s : storage) : return is 
block {
    
    // check sender is Doorman Contract
    checkSenderIsDoormanContract(s);

    // lock satellite's vMVK amount -> bond? 
    if satelliteParams.4 < s.config.minimumStakedMvkBalance then failwith("You do not have enough vMVK to meet the minimum delegate bond.")
      else skip;

    // // add new satellite record
    var newSatelliteRecord : satelliteRecordType := record[            
            status                = 1n;
            stakedMvkBalance      = satelliteParams.4;
            satelliteFee          = satelliteParams.3;
            totalDelegatedAmount  = 0n;

            name                  = satelliteParams.0;
            description           = satelliteParams.1;
            image                 = satelliteParams.2;
            
            registeredDateTime    = Tezos.now;
        ];

    s.satelliteLedger[Tezos.source] := newSatelliteRecord;

    const governanceAddress : address = case s.generalContracts["governance"] of
      Some(_address) -> _address
      | None -> failwith("Error. Governance Contract is not found")
    end;

    // add satellite address to governance contract satellite set
    const updateGovernanceActiveSatellitesMapOperation : operation = Tezos.transaction(
        (unit, Tezos.source),
         0tez, 
         updateGovernanceActiveSatellitesMap(governanceAddress)
         );
    
    const operations : list(operation) = list [updateGovernanceActiveSatellitesMapOperation];

} with (operations, s)


function unregisterAsSatellite(var s : storage) : return is
block {
    // Overall steps:
    // 1. check if satellite exists in satelliteLedger
    // 2. remove satellite address from satelliteLedger

    // entrypoint should not receive any tez amount
    checkNoAmount(Unit);

    // check that entrypoint is not paused
    checkUnregisterAsSatelliteIsNotPaused(s);
    
    var _checkSatelliteExists : satelliteRecordType := case s.satelliteLedger[Tezos.sender] of
          Some(_val) -> _val
        | None -> failwith("Satellite address does not exist.")
    end;

    // changing of status - to inactive instead of removing
    remove (Tezos.sender : address) from map s.satelliteLedger;
    
    // _checkSatelliteExists.status := 0n;
    // s.satelliteLedger[Tezos.sender] := _checkSatelliteExists;

    const governanceAddress : address = case s.generalContracts["governance"] of
      Some(_address) -> _address
      | None -> failwith("Error. Governance Contract is not found")
    end;

    // remove satellite address from governance contract satellite set
    const updateGovernanceActiveSatellitesMapOperation : operation = Tezos.transaction(
        (unit, Tezos.sender),
         0tez, 
         updateGovernanceActiveSatellitesMap(governanceAddress)
         );
    
    const operations : list(operation) = list [updateGovernanceActiveSatellitesMapOperation];

} with (operations, s)

function onStakeChange(const userAddress : address; const stakeAmount : nat; const stakeType : nat; var s : storage) : return is 
block {

    // Overall steps:
    // 1. check if user is a satellite 
    // 2a. if user is a satellite, update satellite's bond amount depending on stakeAmount and stakeType
    // 2b. if user is not a satellite, update satellite's total delegated amount depending on stakeAmount and stakeType
    // Note: stakeType 1n to increase, stakeType 0n to decrease

    // entrypoint should not receive any tez amount
    checkNoAmount(Unit);

    // check sender is Doorman Contract or Treasury Contract
    // checkSenderIsDoormanContract(s);
    if checkInWhitelistContracts(Tezos.sender, s) then skip else failwith("Error. Sender is not in whitelisted contracts.");

    const userIsSatelliteFlag : bool = Big_map.mem(userAddress, s.satelliteLedger);

    // check if user is a satellite
    if userIsSatelliteFlag = True then block{

        // Retrieve satellite account from storage 
        var satelliteRecord : satelliteRecordType := case s.satelliteLedger[userAddress] of
            Some(_val) -> _val
            | None -> failwith("Satellite does not exist")
        end;

        var totalMvkBalance : nat := satelliteRecord.stakedMvkBalance;

        if stakeType = 1n then totalMvkBalance := totalMvkBalance + stakeAmount
          else skip;

        // check that stakeAmount is less than totalDelegatedAmount (so that totalMvkBalance will not be negative)
        if stakeType = 0n then block{
            if stakeAmount > totalMvkBalance then failwith("Error: stakeAmount is larger than satellite's total mvk balance.")
              else skip;        

            totalMvkBalance := abs(totalMvkBalance - stakeAmount);

            // check that total bond amount after unstaking will not be less than the minimum satellite bond
            if totalMvkBalance < s.config.minimumStakedMvkBalance then failwith("Error: unstaking would exceed satellite minimum mvk balance.")
              else skip;

        } else skip;

        // // save satellite record
        satelliteRecord.stakedMvkBalance := totalMvkBalance; 
        s.satelliteLedger[userAddress] := satelliteRecord; 

    } else block {

        // user is not a satellite 
        
        // check if user has delegated to a satellite
        const userHasDelegatedToSatelliteFlag : bool = Big_map.mem(userAddress, s.delegateLedger);

        if userHasDelegatedToSatelliteFlag = True then block {

            // Retrieve delegate record from storage 
            var delegateRecord : delegateRecordType := case s.delegateLedger[userAddress] of
                Some(_val) -> _val
                | None -> failwith("Delegate does not exist") // failwith should not be reached based on prior if conditions
            end;
            
            // Retrieve satellite account from storage             
            var satelliteRecord : satelliteRecordType := case s.satelliteLedger[delegateRecord.satelliteAddress] of
                Some(_val) -> _val
                | None -> failwith("Satellite does not exist") // failwith should not be reached based on prior if conditions
            end;

            var totalDelegatedAmount : nat := satelliteRecord.totalDelegatedAmount;

            if stakeType = 1n then totalDelegatedAmount := totalDelegatedAmount + stakeAmount
               else skip;

            // check that stakeAmount is less than totalDelegatedAmount (so that totalDelegatedAmount will not be negative)
            if stakeType = 0n then block{
                if stakeAmount > totalDelegatedAmount then failwith("Error: stakeAmount is larger than satellite's total delegated amount.")
                else skip;

                totalDelegatedAmount := abs(totalDelegatedAmount - stakeAmount);

            } else skip;

            // // save satellite record
            satelliteRecord.totalDelegatedAmount := totalDelegatedAmount; 
            s.satelliteLedger[delegateRecord.satelliteAddress] := satelliteRecord; 
        
        } else skip;

    } 

} with (noOperations, s)

function main (const action : delegationAction; const s : storage) : return is 
    case action of    
        | SetAdmin(parameters) -> setAdmin(parameters, s)  
        | UpdateConfig(parameters) -> updateConfig(parameters, s)

        | UpdateWhitelistContracts(parameters) -> updateWhitelistContracts(parameters, s)
        | UpdateGeneralContracts(parameters) -> updateGeneralContracts(parameters, s)

        | TogglePauseDelegateToSatellite(_parameters) -> togglePauseDelegateToSatellite(s)
        | TogglePauseUndelegateSatellite(_parameters) -> togglePauseUndelegateSatellite(s)
        | TogglePauseRegisterSatellite(_parameters) -> togglePauseRegisterSatellite(s)
        | TogglePauseUnregisterSatellite(_parameters) -> togglePauseUnregisterSatellite(s)
        | TogglePauseUpdateSatellite(_parameters) -> togglePauseUpdateSatellite(s)
        | PauseAll(_parameters) -> pauseAll(s)
        | UnpauseAll(_parameters) -> unpauseAll(s)
        
        | DelegateToSatellite(parameters) -> delegateToSatellite(parameters, s)
        | DelegateToSatelliteComplete(parameters) -> delegateToSatelliteComplete(parameters, s)        
        | RedelegateSatellite(parameters) -> redelegateSatellite(parameters, s)
        
        | UndelegateFromSatellite(_parameters) -> undelegateFromSatellite(s)
        | UndelegateFromSatelliteComplete(parameters) -> undelegateFromSatelliteComplete(parameters, s)
        
        | RegisterAsSatellite(parameters) -> registerAsSatellite(parameters.0, parameters.1, parameters.2, parameters.3, s)
        | RegisterAsSatelliteComplete(parameters) -> registerAsSatelliteComplete((parameters.0, parameters.1, parameters.2, parameters.3, parameters.4), s)
        | UnregisterAsSatellite(_parameters) -> unregisterAsSatellite(s)

        | UpdateSatelliteRecord(parameters) -> updateSatelliteRecord(parameters.0, parameters.1, parameters.2, parameters.3, s)
        | GetSatelliteVotingPower(parameters) -> getSatelliteVotingPower(parameters.0, parameters.1, s)
        | GetSatelliteRequestSnapshot(parameters) -> getSatelliteRequestSnapshot(parameters, s)
        | OnStakeChange(parameters) -> onStakeChange(parameters.0, parameters.1, parameters.2, s)    
    end