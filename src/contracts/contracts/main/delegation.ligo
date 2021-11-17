type onStakeChangeParams is (address * nat * nat)
type updateSatelliteRecordParams is (string * string * string)

type delegationAction is 
    | SetVMvkTokenAddress of (address)

    | TogglePauseSetSatellite of (unit)
    | TogglePauseUnsetSatellite of (unit)
    | TogglePauseRegisterSatellite of (unit)
    | TogglePauseUnregisterSatellite of (unit)
    | TogglePauseUpdateSatellite of (unit)
    | PauseAll of (unit)
    | UnpauseAll of (unit)

    | SetSatellite of (address)
    | SetSatelliteComplete of (nat)
    
    | UnsetSatellite of (unit)
    | UnsetSatelliteComplete of (nat)
    
    | RegisterAsSatellite of (unit)
    | RegisterAsSatelliteComplete of (nat)
    | UnregisterAsSatellite of (unit)

    | UpdateSatelliteRecord of (updateSatelliteRecordParams)
    
    | OnStakeChange of onStakeChangeParams
    | OnGovernanceAction of (address)      // todo: callback to check if satellite has sufficient bond and is not overdelegated

// record for users choosing satellites 
type delegateRecordType is record [
    satelliteAddress     : address;
    delegatedDateTime    : timestamp;  
]
type delegateLedgerType is big_map (address, delegateRecordType)

// record for satellites
type satelliteRecordType is record [
    status                : nat;        // active: 1; ...
    bondAmount            : nat;        // to be removed? use vMVK balance as single source of truth  - sMVK
    bondSufficiency       : nat;        // bond sufficiency flag - set to 1 if satellite has enough bond; set to 0 if satellite has not enough bond (over-delegated) when checked on governance action    
    satelliteFee          : nat;        // fee that satellite charges to delegates ? to be clarified in terms of satellite distribution
    totalDelegatedAmount  : nat;        // record of total delegated amount from delegates
    name                  : string;     // string for name
    description           : string;     // string for description
    image                 : string;     // ipfs hash
    registeredDateTime    : timestamp;
]
type satelliteLedgerType is big_map (address, satelliteRecordType)

type configType is record [
    minimumSatelliteBond   : nat;  // minimum amount of vMVK required as bong to register as delegate (in muMVK)
    selfBondPercentage     : nat;  // percentage to determine if satellite is overdelegated (requires more vMVK to be staked) or underdelegated    
]

type breakGlassConfigType is record [
    setSatelliteIsPaused           : bool;
    unsetSatelliteIsPaused         : bool;
    registerAsSatelliteIsPaused    : bool;
    unregisterAsSatelliteIsPaused  : bool;
    updateSatelliteRecordIsPaused  : bool;
]

type storage is record [
    admin                : address;
    config               : configType;
    breakGlassConfig     : breakGlassConfigType;
    delegateLedger       : delegateLedgerType;
    satelliteLedger      : satelliteLedgerType;
    vMvkTokenAddress     : address;
    sMvkTokenAddress     : address;  
]

const noOperations : list (operation) = nil;
type return is list (operation) * storage


// admin helper functions begin ---------------------------------------------------------
function checkSenderIsAdmin(var s : storage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith("Only the administrator can call this entrypoint.");

function checkSenderIsVMvkTokenContract(var s : storage) : unit is
    if (Tezos.sender = s.vMvkTokenAddress) then unit
    else failwith("Only the vMVK Token Contract can call this entrypoint.");

  function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith("This entrypoint should not receive any tez.");
// admin helper functions end ---------------------------------------------------------


// break glass check if paused helper functions begin ---------------------------------------------------------
function checkSetSatelliteIsNotPaused(var s : storage) : unit is
    if s.breakGlassConfig.setSatelliteIsPaused then failwith("SetSatellite entrypoint is paused.")
    else unit;

function checkUnsetSatelliteIsNotPaused(var s : storage) : unit is
    if s.breakGlassConfig.unsetSatelliteIsPaused then failwith("UnsetSatellite entrypoint is paused.")
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
// break glass check if paused helper functions end ---------------------------------------------------------


// helper function to get User's vMVK balance for delegation 
function updateUserVMvkBalanceForDelegation(const tokenAddress : address) : contract(address * address) is
  case (Tezos.get_entrypoint_opt(
      "%updateVMvkBalanceForDelegate",
      tokenAddress) : option(contract(address * address))) of
    Some(contr) -> contr
  | None -> (failwith("UpdateVMvkBalanceForDelegate entrypoint in vMVK Token Contract not found") : contract(address * address))
  end;

// helper function to get User's vMVK balance from vMVK token address
function fetchVMvkBalance(const tokenAddress : address) : contract(address * contract(nat)) is
  case (Tezos.get_entrypoint_opt(
      "%getBalance",
      tokenAddress) : option(contract(address * contract(nat)))) of
    Some(contr) -> contr
  | None -> (failwith("GetBalance entrypoint in vMVK Token Contract not found") : contract(address * contract(nat)))
  end;

(* Helper function to get satellite *)
function getSatelliteRecord (const satelliteAddress : address; const s : storage) : satelliteRecordType is
  block {
    var satelliteRecord : satelliteRecordType :=
      record [
        status                = 0n;        
        bondAmount            = 0n;        
        bondSufficiency       = 0n;        
        registeredDateTime    = Tezos.now;
        satelliteFee          = 0n;    
        totalDelegatedAmount  = 0n;
        name                  = "Mavryk Satellite";
        description           = "Mavryk Satellite";
        image                 = "";
      ];

    case s.satelliteLedger[satelliteAddress] of
      None -> skip
    | Some(instance) -> satelliteRecord := instance
    end;
  } with satelliteRecord


(* Helper function to get user delegate *)
function getDelegateRecord (const userAddress : address; const s : storage) : delegateRecordType is
  block {
    var delegateRecord : delegateRecordType :=
      record [
        satelliteAddress  = userAddress; // change to null?
        delegatedDateTime = Tezos.now; 
      ];

    case s.delegateLedger[userAddress] of
      None -> skip
    | Some(instance) -> delegateRecord := instance
    end;
  } with delegateRecord

(* Housekeeping functions *)

(* set vMvk contract address *)
function setVMvkTokenAddress(const parameters : address; var s : storage) : return is
block {
  
    // check that sender is admin
    checkSenderIsAdmin(s);

    s.vMvkTokenAddress := parameters;
} with (noOperations, s)

// break glass toggle entrypoints begin ---------------------------------------------------------

function togglePauseSetSatellite(var s : storage) : return is
block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    if s.breakGlassConfig.setSatelliteIsPaused then s.breakGlassConfig.setSatelliteIsPaused := False
      else s.breakGlassConfig.setSatelliteIsPaused := True;

} with (noOperations, s)

function togglePauseUnsetSatellite(var s : storage) : return is
block {
    // check that sender is admin
    checkSenderIsAdmin(s);

    if s.breakGlassConfig.unsetSatelliteIsPaused then s.breakGlassConfig.unsetSatelliteIsPaused := False
      else s.breakGlassConfig.unsetSatelliteIsPaused := True;

} with (noOperations, s)

function togglePauseRegisterSatellite(var s : storage) : return is
block {
    // check that sender is admin
    checkSenderIsAdmin(s);

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

    if s.breakGlassConfig.unsetSatelliteIsPaused then skip
        else s.breakGlassConfig.unsetSatelliteIsPaused := True;

    if s.breakGlassConfig.unsetSatelliteIsPaused then skip
          else s.breakGlassConfig.unsetSatelliteIsPaused := True;

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

    if s.breakGlassConfig.unsetSatelliteIsPaused then s.breakGlassConfig.unsetSatelliteIsPaused := False
      else skip;

    if s.breakGlassConfig.unsetSatelliteIsPaused then s.breakGlassConfig.unsetSatelliteIsPaused := False
      else skip;

    if s.breakGlassConfig.registerAsSatelliteIsPaused then s.breakGlassConfig.registerAsSatelliteIsPaused := False
      else skip;

    if s.breakGlassConfig.unregisterAsSatelliteIsPaused then s.breakGlassConfig.unregisterAsSatelliteIsPaused := False
      else skip;

    if s.breakGlassConfig.updateSatelliteRecordIsPaused then s.breakGlassConfig.updateSatelliteRecordIsPaused := False
      else skip;

} with (noOperations, s)


// break glass toggle entrypoints end ---------------------------------------------------------


function setSatellite(const satelliteAddress : address; var s : storage) : return is 
block {

    // Overall steps:
    // 1. check if satellite exists
    // 2. callback to vMVK token contract to fetch vMVK balance
    // 3. save new user delegate record
    // 4. update satellite total delegated amount

    // entrypoint should not receive any tez amount
    checkNoAmount(Unit);

    // check that entrypoint is not paused
    checkSetSatelliteIsNotPaused(s);

    var _checkSatelliteExists : satelliteRecordType := case s.satelliteLedger[satelliteAddress] of
         Some(_val) -> _val
        | None -> failwith("Satellite does not exist")
    end;

    var delegateRecord : delegateRecordType := record [
        satelliteAddress  = satelliteAddress;
        delegatedDateTime = Tezos.now;
    ];

    s.delegateLedger[Tezos.sender] := delegateRecord;

    // update satellite totalDelegatedAmount with user's vMVK balance
    const setSatelliteCompleteCallback : contract(nat) = Tezos.self("%setSatelliteComplete");

    const checkVMvkBalanceOperation : operation = Tezos.transaction(
        (Tezos.sender, setSatelliteCompleteCallback),
         0tez, 
         fetchVMvkBalance(s.vMvkTokenAddress)
         );
    
    const operations : list(operation) = list [checkVMvkBalanceOperation];

} with (operations, s)

function setSatelliteComplete(const vMvkBalance : nat; var s : storage) : return is 
block {

    // check sender is VMvk Token Contract
    checkSenderIsVMvkTokenContract(s);

    // Retrieve delegate record from storage
    var delegateRecord : delegateRecordType := getDelegateRecord(Tezos.source, s);

    // Retrieve satellite account from storage
    var satelliteRecord : satelliteRecordType := getSatelliteRecord(delegateRecord.satelliteAddress, s);

    // update satellite totalDelegatedAmount balance
    satelliteRecord.totalDelegatedAmount := satelliteRecord.totalDelegatedAmount + vMvkBalance; 
    
    // update satellite ledger storage with new balance
    s.satelliteLedger[delegateRecord.satelliteAddress] := satelliteRecord;

} with (noOperations, s)

function unsetSatellite(var s : storage) : return is
block {

    // Overall steps:
    // 1. check if user address exists in delegateLedger
    // 2. callback to vMVK token contract to fetch vMVK balance
    // 3a. if satellite exists, update satellite record with new balance and remove user from delegateLedger
    // 3b. if satellite does not exist, remove user from delegateLedger
    
    // entrypoint should not receive any tez amount
    checkNoAmount(Unit);

    // check that entrypoint is not paused
    checkUnsetSatelliteIsNotPaused(s);

    var _delegateRecord : delegateRecordType := case s.delegateLedger[Tezos.sender] of
         Some(_val) -> _val
        | None -> failwith("User address not found in delegateLedger.")
    end;

    // update satellite totalDelegatedAmount - decrease total amount with user's vMVK balance
    const unsetSatelliteCompleteCallback : contract(nat) = Tezos.self("%unsetSatelliteComplete");

    const checkVMvkBalanceOperation : operation = Tezos.transaction(
        (Tezos.sender, unsetSatelliteCompleteCallback),
         0tez, 
         fetchVMvkBalance(s.vMvkTokenAddress)
         );
    
    const operations : list(operation) = list [checkVMvkBalanceOperation];

} with (operations, s)


function unsetSatelliteComplete(const vMvkBalance : nat; var s : storage) : return is 
block {

    // check sender is VMvk Token Contract
    checkSenderIsVMvkTokenContract(s);

    // Retrieve delegate record from storage 
    var delegateRecord : delegateRecordType := getDelegateRecord(Tezos.source, s);

    // Retrieve satellite account from storage
    var _satelliteRecord : satelliteRecordType := getSatelliteRecord(delegateRecord.satelliteAddress, s);

    // check that satellite record exists - e.g. in the edge case that satellite has unregistered
    if Big_map.mem(delegateRecord.satelliteAddress, s.satelliteLedger) then block{

        // satellite exists

        // check that vMVK balance does not exceed satellite's total delegated amount
        if vMvkBalance > _satelliteRecord.totalDelegatedAmount then failwith("Error: vMVK balance exceeds satellite's total delegated amount.")
        else skip;
        
        // update satellite totalDelegatedAmount balance
        _satelliteRecord.totalDelegatedAmount := abs(_satelliteRecord.totalDelegatedAmount - vMvkBalance); 
        
        // update satellite ledger storage with new balance
        s.satelliteLedger[delegateRecord.satelliteAddress] := _satelliteRecord;

        // remove user's address from delegateLedger
        remove (Tezos.source : address) from map s.delegateLedger

    } else block {

        // satellite no longer exists

        // remove user's address from delegateLedger
        remove (Tezos.source : address) from map s.delegateLedger
    };

} with (noOperations, s)

function updateSatelliteRecord(var name : string; var description : string; var image : string; var s : storage) : return is
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
    
    // update satellite ledger storage with new information
    s.satelliteLedger[Tezos.sender] := satelliteRecord;

} with (noOperations, s)


function registerAsSatellite(var s : storage) : return is 
block {
    
    // Overall steps: 
    // 1. verify that satellite does not already exist (prevent double registration)
    // 2. callback to vMVK token contract to fetch vMVK balance
    // 3. if user vMVK balance is more than minimumDelegateBond, register as delegate
    // 4. add new satellite record and save to satelliteLedger

    // entrypoint should not receive any tez amount
    checkNoAmount(Unit);

    // check that entrypoint is not paused
    checkRegisterAsSatelliteIsNotPaused(s);

    case s.satelliteLedger[Tezos.sender] of
          None -> skip
        | Some(_val) -> failwith("Satellite address already exists.")
    end;

    const registerDelegateCompleteCallback : contract(nat) = Tezos.self("%registerAsSatelliteComplete");

    const checkVMvkBalanceOperation : operation = Tezos.transaction(
        (Tezos.sender, registerDelegateCompleteCallback),
         0tez, 
         fetchVMvkBalance(s.vMvkTokenAddress)
         );
    
    const operations : list(operation) = list [checkVMvkBalanceOperation];

} with (operations, s)

function registerAsSatelliteComplete(const vMvkBalance : nat; var s : storage) : return is 
block {
    
    // check sender is VMvk Token Contract
    checkSenderIsVMvkTokenContract(s);

    // lock satellite's vMVK amount -> bond? 
    if vMvkBalance < s.config.minimumSatelliteBond then failwith("You do not have enough vMVK to meet the minimum delegate bond.")
      else skip;

    // add new satellite record
    var newSatelliteRecord : satelliteRecordType := record[            
            status                = 1n;
            bondAmount            = vMvkBalance;  // bond - all locked
            bondSufficiency       = 1n;
            registeredDateTime    = Tezos.now;
            satelliteFee          = 0n;
            totalDelegatedAmount  = 0n;
            name                  = "Mavryk Satellite";
            description           = "Mavryk Satellite";
            image                 = "";
        ];

    s.satelliteLedger[Tezos.source] := newSatelliteRecord;

} with (noOperations, s)

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

    remove (Tezos.sender : address) from map s.satelliteLedger

} with (noOperations, s)

function onStakeChange(const userAddress : address; const stakeAmount : nat; const stakeType : nat; var s : storage) : return is 
block {

    // Overall steps:
    // 1. check if user is a satellite 
    // 2a. if user is a satellite, update satellite's bond amount depending on stakeAmount and stakeType
    // 2b. if user is not a satellite, update satellite's total delegated amount depending on stakeAmount and stakeType
    // Note: stakeType 1n to increase, stakeType 0n to decrease

    // entrypoint should not receive any tez amount
    checkNoAmount(Unit);

    const userIsSatelliteFlag : bool = Big_map.mem(userAddress, s.satelliteLedger);

    // check if user is a satellite
    if userIsSatelliteFlag = True then block{

        // Retrieve satellite account from storage 
        var satelliteRecord : satelliteRecordType := case s.satelliteLedger[userAddress] of
            Some(_val) -> _val
            | None -> failwith("Satellite does not exist")
        end;

        var totalBondAmount : nat := satelliteRecord.bondAmount;

        if stakeType = 1n then totalBondAmount := totalBondAmount + stakeAmount
          else skip;

        // check that stakeAmount <= totalDelegatedAmount
        if stakeType = 0n then block{
            if stakeAmount > totalBondAmount then failwith("Error: stakeAmount is larger than satellite's total bond amount.")
              else skip;        

            totalBondAmount := abs(totalBondAmount - stakeAmount);

            // check that total bond amount after unstaking will not be less than the minimum satellite bond
            if totalBondAmount < s.config.minimumSatelliteBond then failwith("Error: unstaking would exceed satellite minimum bond amount.")
              else skip;

        } else skip;

        // // save satellite record
        satelliteRecord.bondAmount := totalBondAmount; 
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

function onGovernanceAction(const satelliteAddress : address; var s : storage) : return is 
block {

    // todo: - will be based on governance contract 
    
    // Overall steps:
    // 1. check if satellite has sufficient bond
    //    - needs a loop to find all delegates of the satellite, and retrieve vMVK balance for each delegate
    // 2. perform governance action if satellite has sufficient bond - proxy call to governance contract to execute? 
    //    - pass back a callback operation

    // Retrieve satellite account from storage
    var satelliteRecord : satelliteRecordType := getSatelliteRecord(satelliteAddress, s);

    // check if minimum bond has been reached (units are in mu)
    if satelliteRecord.bondAmount < s.config.minimumSatelliteBond then failwith("Insufficient satellite bond - minimum bond not reached.")
      else skip;

    // check bond sufficiency using fixed point arithmetic 
    // percentage stored: 10% -> 10000
    // total amount that can be staked = bond / delegationPercentage 
    // check for division accuracy

    const bondAmount : nat             = satelliteRecord.bondAmount;
    const _totalDelegatedAmount : nat  = satelliteRecord.totalDelegatedAmount;
    const selfBondPercentage : nat     = s.config.selfBondPercentage; 

    const _totalDelegatedAmountAllowed =  (bondAmount * 1000000n) / selfBondPercentage;

    // if totalDelegatedAmount > totalDelegatedAmountAllowed then failwith("Satellite is over-delegated. Please increase bond amount.")
    //   else skip;

    // set satellite bond sufficiency flag to true
    satelliteRecord.bondSufficiency := 1n; 
    s.satelliteLedger[satelliteAddress] := satelliteRecord;

} with (noOperations, s)

function main (const action : delegationAction; const s : storage) : return is 
    case action of    
        | SetVMvkTokenAddress(parameters) -> setVMvkTokenAddress(parameters, s)  

        | TogglePauseSetSatellite(_parameters) -> togglePauseSetSatellite(s)
        | TogglePauseUnsetSatellite(_parameters) -> togglePauseUnsetSatellite(s)
        | TogglePauseRegisterSatellite(_parameters) -> togglePauseRegisterSatellite(s)
        | TogglePauseUnregisterSatellite(_parameters) -> togglePauseUnregisterSatellite(s)
        | TogglePauseUpdateSatellite(_parameters) -> togglePauseUpdateSatellite(s)
        | PauseAll(_parameters) -> pauseAll(s)
        | UnpauseAll(_parameters) -> unpauseAll(s)
        
        | SetSatellite(parameters) -> setSatellite(parameters, s)
        | SetSatelliteComplete(parameters) -> setSatelliteComplete(parameters, s)        
        
        | UnsetSatellite(_parameters) -> unsetSatellite(s)
        | UnsetSatelliteComplete(parameters) -> unsetSatelliteComplete(parameters, s)
        
        | RegisterAsSatellite(_parameters) -> registerAsSatellite(s)
        | RegisterAsSatelliteComplete(parameters) -> registerAsSatelliteComplete(parameters, s)
        | UnregisterAsSatellite(_parameters) -> unregisterAsSatellite(s)

        | UpdateSatelliteRecord(parameters) -> updateSatelliteRecord(parameters.0, parameters.1, parameters.2, s)

        | OnStakeChange(parameters) -> onStakeChange(parameters.0, parameters.1, parameters.2, s)    
        | OnGovernanceAction(parameters) -> onGovernanceAction(parameters, s)
    end