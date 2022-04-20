// ------------------------------------------------------------------------------
//
// Delegation Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const newAdminAddress : address; var s : delegationStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)
    s.admin := newAdminAddress;

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const metadataKey: string; const metadataHash: bytes; var s : delegationStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)  
    s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);

} with (noOperations, s)



(* updateConfig lambda *)
function lambdaUpdateConfig(const updateConfigParams : delegationUpdateConfigParamsType; var s : delegationStorage) : return is 
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



(* updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: delegationStorage): return is
block {
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);

} with (noOperations, s)



(* updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: delegationStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(* pauseAll lambda *)
function lambdaPauseAll(var s : delegationStorage) : return is
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



(* unpauseAll lambda *)
function lambdaUnpauseAll(var s : delegationStorage) : return is
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



(* togglePauseDelegateToSatellite lambda *)
function lambdaTogglePauseDelegateToSatellite(var s : delegationStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin
    if s.breakGlassConfig.delegateToSatelliteIsPaused then s.breakGlassConfig.delegateToSatelliteIsPaused := False
    else s.breakGlassConfig.delegateToSatelliteIsPaused := True;

} with (noOperations, s)



(* togglePauseUndelegateSatellite lambda *)
function lambdaTogglePauseUndelegateSatellite(var s : delegationStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin
    if s.breakGlassConfig.undelegateFromSatelliteIsPaused then s.breakGlassConfig.undelegateFromSatelliteIsPaused := False
    else s.breakGlassConfig.undelegateFromSatelliteIsPaused := True;

} with (noOperations, s)



(* togglePauseRegisterSatellite lambda *)
function lambdaTogglePauseRegisterSatellite(var s : delegationStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin
    if s.breakGlassConfig.registerAsSatelliteIsPaused then s.breakGlassConfig.registerAsSatelliteIsPaused := False
    else s.breakGlassConfig.registerAsSatelliteIsPaused := True;

} with (noOperations, s)



(* togglePauseUnregisterSatellite lambda *)
function lambdaTogglePauseUnregisterSatellite(var s : delegationStorage) : return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    if s.breakGlassConfig.unregisterAsSatelliteIsPaused then s.breakGlassConfig.unregisterAsSatelliteIsPaused := False
    else s.breakGlassConfig.unregisterAsSatelliteIsPaused := True;

} with (noOperations, s)



(* togglePauseUpdateSatellite lambda *)
function lambdaTogglePauseUpdateSatellite(var s : delegationStorage) : return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    if s.breakGlassConfig.updateSatelliteRecordIsPaused then s.breakGlassConfig.updateSatelliteRecordIsPaused := False
    else s.breakGlassConfig.updateSatelliteRecordIsPaused := True;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Delegation Lambdas Begin
// ------------------------------------------------------------------------------

(* delegateToSatellite lambda *)
function lambdaDelegateToSatellite(const satelliteAddress : address; var s : delegationStorage) : return is 
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

    //   const delegateToSatellite : contract(address) = Tezos.self("%delegateToSatellite");
      const delegateToSatelliteOperation : operation = Tezos.transaction(
        (satelliteAddress),
        0tez, 
        // delegateToSatellite
        getDelegateToSatelliteEntrypoint(Tezos.self_address)
      );

      operations  := delegateToSatelliteOperation # operations;

    //   const undelegateFromSatellite : contract(unit) = Tezos.self("%undelegateFromSatellite");
      const undelegateFromSatelliteOperation : operation = Tezos.transaction(
        (unit),
        0tez, 
        // undelegateFromSatellite
        getUndelegateFromSatelliteEntrypoint(Tezos.self_address)
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



(* undelegateFromSatellite lambda *)
function lambdaUndelegateFromSatellite(var s : delegationStorage) : return is
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
// Delegation Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Satellite Lambdas Begin
// ------------------------------------------------------------------------------

(* registerAsSatellite lambda *)
function lambdaRegisterAsSatellite(const registerAsSatelliteParams : newSatelliteRecordType; var s : delegationStorage) : return is 
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



(* unregisterAsSatellite lambda *)
function lambdaUnregisterAsSatellite(var s : delegationStorage) : return is
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



(* updateSatelliteRecord lambda *)
function lambdaUpdateSatelliteRecord(const updateSatelliteRecordParams : updateSatelliteRecordType; var s : delegationStorage) : return is
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
// Satellite Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Lambdas Begin
// ------------------------------------------------------------------------------

(* onStakeChange lambda *)
function lambdaOnStakeChange(const userAddress : address; var s : delegationStorage) : return is 
block {

    // Overall steps:
    // 1. check if user is a satellite 
    // 2a. if user is a satellite, update satellite's bond amount depending on stakeAmount and stakeType
    // 2b. if user is not a satellite, update satellite's total delegated amount depending on stakeAmount and stakeType
    // Note: stakeType 1n to increase, stakeType 0n to decrease

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
        // else operations := Tezos.transaction((unit), 0tez, (Tezos.self("%undelegateFromSatellite"): contract(unit))) # operations;
        else operations := Tezos.transaction(
            (unit), 
            0tez, 
            getUndelegateFromSatelliteEntrypoint(Tezos.self_address)
            ) # operations;
      }

      else skip
    }

} with (operations, s)

// ------------------------------------------------------------------------------
// General Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Delegation Lambdas End
//
// ------------------------------------------------------------------------------