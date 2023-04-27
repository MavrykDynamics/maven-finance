// ------------------------------------------------------------------------------
//
// Satellite Governance Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress); // verify that sender is admin or the Governance Contract address

    case governanceSatelliteLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress); // verify that sender is admin or the Governance Contract address

    case governanceSatelliteLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)


(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {

    verifySenderIsAdmin(s.admin); // verify that sender is admin

    case governanceSatelliteLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateConfig lambda  *)
function lambdaUpdateConfig(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is 
block {

  verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount  
  verifySenderIsAdmin(s.admin); // verify that sender is admin

  case governanceSatelliteLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {

                const updateConfigAction    : governanceSatelliteUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : governanceSatelliteUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    | ConfigApprovalPercentage (_v)         -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.governanceSatelliteApprovalPercentage  := updateConfigNewValue
                    | ConfigSatelliteDurationInDays (_v)    -> s.config.governanceSatelliteDurationInDays       := updateConfigNewValue
                    | ConfigPurposeMaxLength (_v)           -> s.config.governancePurposeMaxLength              := updateConfigNewValue
                    | ConfigMaxActionsPerSatellite (_v)     -> s.config.maxActionsPerSatellite                  := updateConfigNewValue
                ];

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda  *)
function lambdaUpdateWhitelistContracts(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {
    
    verifySenderIsAdmin(s.admin); // verify that sender is admin
    
    case governanceSatelliteLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda  *)
function lambdaUpdateGeneralContracts(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {
    
    verifySenderIsAdmin(s.admin); // verify that sender is admin
    
    case governanceSatelliteLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType): return is
block {

    var operations : list(operation) := nil;

    case governanceSatelliteLambdaAction of [
        | LambdaMistakenTransfer(destinationParams) -> {

                // verify if the sender is the governanceSatellite contract or admin
                verifySenderIsSelfOrAddress(s.admin);

                // Create transfer operations (transferOperationFold in transferHelpers)
                operations := List.fold_right(transferOperationFold, destinationParams, operations)
                
            }
        | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Satellite Governance Lambdas Begin
// ------------------------------------------------------------------------------

(*  suspendSatellite lambda *)
function lambdaSuspendSatellite(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that no tez is sent to the entrypoint
    // 2. Get necessary contracts and config info
    //      -   Get Doorman Contract address from the General Contracts Map on the Governance Contract
    //      -   Get Delegation Contract address from the General Contracts Map on the Governance Contract
    //      -   Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
    // 3. Get / Check Satellite Records
    //      -   Get satellite record for initiator
    //      -   Check if address given for satellite to be suspended is valid
    // 4. Take snapshot of current total staked MVK supply 
    // 5. Calculate staked MVK votes required for approval based on config's financial request approval percentage
    // 6. Create new governance satellite action record - "SUSPEND"
    // 6. Update storage with new records 
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        |   LambdaSuspendSatellite(suspendSatelliteParams) -> {

                // init params
                const satelliteToBeSuspended  : address = suspendSatelliteParams.satelliteToBeSuspended;
                const purpose                 : string  = suspendSatelliteParams.purpose;

                // init maps
                const dataMap : dataMapType = map [
                    ("satelliteToBeSuspended" : string) -> Bytes.pack(satelliteToBeSuspended)
                ];

                // create action
                s := createGovernanceSatelliteAction(
                    "SUSPEND",
                    dataMap,
                    purpose,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  banSatellite lambda *)
function lambdaBanSatellite(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that no tez is sent to the entrypoint
    // 2. Get necessary contracts and config info
    //      -   Get Doorman Contract address from the General Contracts Map on the Governance Contract
    //      -   Get Delegation Contract address from the General Contracts Map on the Governance Contract
    //      -   Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
    // 3. Get / Check Satellite Records
    //      -   Get satellite record for initiator
    //      -   Check if address given for satellite to be banned is valid
    // 4. Take snapshot of current total staked MVK supply 
    // 5. Calculate staked MVK votes required for approval based on config's financial request approval percentage
    // 6. Create new governance satellite action record - "BAN"
    // 6. Update storage with new records 
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        |   LambdaBanSatellite(banSatelliteParams) -> {

                // init params
                const satelliteToBeBanned  : address = banSatelliteParams.satelliteToBeBanned;
                const purpose              : string  = banSatelliteParams.purpose;

                // init maps
                const dataMap : dataMapType = map [
                    ("satelliteToBeBanned" : string) -> Bytes.pack(satelliteToBeBanned)
                ];

                // create action
                s := createGovernanceSatelliteAction(
                    "BAN",
                    dataMap,
                    purpose,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  restoreSatellite lambda *)
function lambdaRestoreSatellite(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that no tez is sent to the entrypoint
    // 2. Get necessary contracts and config info
    //      -   Get Doorman Contract address from the General Contracts Map on the Governance Contract
    //      -   Get Delegation Contract address from the General Contracts Map on the Governance Contract
    //      -   Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
    // 3. Get / Check Satellite Records
    //      -   Get satellite record for initiator
    //      -   Check if address given for satellite to be restored is valid
    // 4. Take snapshot of current total staked MVK supply 
    // 5. Calculate staked MVK votes required for approval based on config's financial request approval percentage
    // 6. Create new governance satellite action record - "RESTORE"
    // 6. Update storage with new records 
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        |   LambdaRestoreSatellite(restoreSatelliteParams) -> {

                // init params
                const satelliteToBeRestored    : address = restoreSatelliteParams.satelliteToBeRestored;
                const purpose                  : string  = restoreSatelliteParams.purpose;

                // init maps
                const dataMap : dataMapType = map [
                    ("satelliteToBeRestored" : string) -> Bytes.pack(satelliteToBeRestored);
                ];

                // create action
                s := createGovernanceSatelliteAction(
                    "RESTORE",
                    dataMap,
                    purpose,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Satellite Governance Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Satellite Oracle Governance Lambdas Begin
// ------------------------------------------------------------------------------

(*  removeAllSatelliteOracles lambda *)
function lambdaRemoveAllSatelliteOracles(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that no tez is sent to the entrypoint
    // 2. Get necessary contracts and config info
    //      -   Get Doorman Contract address from the General Contracts Map on the Governance Contract
    //      -   Get Delegation Contract address from the General Contracts Map on the Governance Contract
    //      -   Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
    // 3. Get / Check Satellite Records
    //      -   Get satellite record for initiator
    //      -   Check if address given for specified satellite is valid
    // 4. Take snapshot of current total staked MVK supply 
    // 5. Calculate staked MVK votes required for approval based on config's financial request approval percentage
    // 6. Create new governance satellite action record - "REMOVE_ALL_SATELLITE_ORACLES"
    // 6. Update storage with new records 
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        |   LambdaRemoveAllSatelliteOracles(removeAllSatelliteOraclesParams) -> {

                // init params
                const satelliteAddress    : address  = removeAllSatelliteOraclesParams.satelliteAddress;
                const purpose             : string   = removeAllSatelliteOraclesParams.purpose;

                // init maps
                const dataMap : dataMapType = map [
                    ("satelliteAddress" : string) -> Bytes.pack(satelliteAddress)
                ];

                // create action
                s := createGovernanceSatelliteAction(
                    "REMOVE_ALL_SATELLITE_ORACLES",
                    dataMap,
                    purpose,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  addOracleToAggregator lambda *)
function lambdaAddOracleToAggregator(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {
    
    // Steps Overview:    
    // 1. Check that no tez is sent to the entrypoint
    // 2. Get necessary contracts and config info
    //      -   Get Doorman Contract address from the General Contracts Map on the Governance Contract
    //      -   Get Delegation Contract address from the General Contracts Map on the Governance Contract
    //      -   Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
    // 3. Get / Check Satellite Records
    //      -   Get satellite record for initiator
    //      -   Check if address given for specified oracle is valid
    // 4. Take snapshot of current total staked MVK supply 
    // 5. Calculate staked MVK votes required for approval based on config's financial request approval percentage
    // 6. Create new governance satellite action record - "ADD_ORACLE_TO_AGGREGATOR"
    // 6. Update storage with new records 

    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        |   LambdaAddOracleToAggregator(addOracleToAggregatorParams) -> {

                // init params
                const oracleAddress      : address  = addOracleToAggregatorParams.oracleAddress;
                const aggregatorAddress  : address  = addOracleToAggregatorParams.aggregatorAddress;
                const purpose            : string   = addOracleToAggregatorParams.purpose;

                // init maps
                const dataMap : dataMapType = map [
                    ("oracleAddress"     : string) -> Bytes.pack(oracleAddress);
                    ("aggregatorAddress" : string) -> Bytes.pack(aggregatorAddress);
                ];

                // create action
                s := createGovernanceSatelliteAction(
                    "ADD_ORACLE_TO_AGGREGATOR",
                    dataMap,
                    purpose,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  removeOracleInAggregator lambda *)
function lambdaRemoveOracleInAggregator(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that no tez is sent to the entrypoint
    // 2. Get necessary contracts and config info
    //      -   Get Doorman Contract address from the General Contracts Map on the Governance Contract
    //      -   Get Delegation Contract address from the General Contracts Map on the Governance Contract
    //      -   Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
    // 3. Get / Check Satellite Records
    //      -   Get satellite record for initiator
    //      -   Check if address given for specified oracle is valid
    // 4. Take snapshot of current total staked MVK supply 
    // 5. Calculate staked MVK votes required for approval based on config's financial request approval percentage
    // 6. Create new governance satellite action record - "REMOVE_ORACLE_IN_AGGREGATOR"
    // 6. Update storage with new records 
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        |   LambdaRemoveOracleInAggregator(removeOracleInAggregatorParams) -> {

                // init params
                const oracleAddress        : address = removeOracleInAggregatorParams.oracleAddress;
                const aggregatorAddress    : address = removeOracleInAggregatorParams.aggregatorAddress;
                const purpose              : string  = removeOracleInAggregatorParams.purpose;

                // init maps
                const dataMap : dataMapType = map [
                    ("oracleAddress"     : string) -> Bytes.pack(oracleAddress);
                    ("aggregatorAddress" : string) -> Bytes.pack(aggregatorAddress);
                ];

                // create action
                s := createGovernanceSatelliteAction(
                    "REMOVE_ORACLE_IN_AGGREGATOR",
                    dataMap,
                    purpose,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Satellite Oracle Governance Lambdas End
// ------------------------------------------------------------------------------




// ------------------------------------------------------------------------------
// Aggregator Governance Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAggregatorReference lambda *)
function lambdaSetAggregatorReference(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {

    // Steps Overview:    
    // 1. Standard Checks
    //      -   Check that no tez is sent to the entrypoint
    //      -   Check that sender is admin, is whitelisted or is an aggregator
    // 2. Delete the entry associated with old name in the aggregatorLedger
    // 3. Create the entry associated with new name in the aggregatorLedger

    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount

    case governanceSatelliteLambdaAction of [
        |   LambdaSetAggregatorReference(setAggregatorReferenceParams) -> {

                // init params
                const aggregatorAddress : address   = setAggregatorReferenceParams.aggregatorAddress;
                const oldName           : string    = setAggregatorReferenceParams.oldName;
                const newName           : string    = setAggregatorReferenceParams.newName;

                // Check sender is admin, is whitelisted or is an aggregator
                if Tezos.get_sender() = s.admin or checkInWhitelistContracts(Tezos.get_sender(), s.whitelistContracts) then skip 
                else case Big_map.find_opt(oldName, s.aggregatorLedger) of [
                        Some (_a)   -> if Tezos.get_sender() = _a and Tezos.get_sender() = aggregatorAddress then skip else failwith(error_ONLY_ADMINISTRATOR_OR_WHITELISTED_ADDRESSES_OR_AGGREGATOR_ALLOWED)
                    |   None        -> failwith(error_AGGREGATOR_RECORD_IN_GOVERNANCE_SATELLITE_NOT_FOUND)
                ];

                // Update storage
                s.aggregatorLedger[newName] := case s.aggregatorLedger[oldName] of [
                        Some(_a) -> if _a = aggregatorAddress then aggregatorAddress else failwith(error_WRONG_AGGREGATOR_ADDRESS_PROVIDED)
                    |   None     -> if oldName = newName then aggregatorAddress else failwith(error_AGGREGATOR_RECORD_IN_GOVERNANCE_SATELLITE_NOT_FOUND)
                ];

                // Remove old entry from the ledger
                if oldName =/= newName then s.aggregatorLedger  := Big_map.remove(oldName, s.aggregatorLedger) else skip;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseAggregator lambda *)
function lambdaTogglePauseAggregator(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that no tez is sent to the entrypoint
    // 2. Get necessary contracts and config info
    //      -   Get Doorman Contract address from the General Contracts Map on the Governance Contract
    //      -   Get Delegation Contract address from the General Contracts Map on the Governance Contract
    //      -   Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
    // 3. Get / Check Satellite Records
    //      -   Get satellite record for initiator
    //      -   Check if address given for specified oracle is valid
    // 4. Take snapshot of current total staked MVK supply 
    // 5. Calculate staked MVK votes required for approval based on config's financial request approval percentage
    // 6. Create new governance satellite action record - "REMOVE_ORACLE_IN_AGGREGATOR"
    // 6. Update storage with new records 
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        |   LambdaTogglePauseAggregator(togglePauseAggregatorParams) -> {
                
                // init params
                const aggregatorAddress    : address                            = togglePauseAggregatorParams.aggregatorAddress;
                const status               : togglePauseAggregatorVariantType   = togglePauseAggregatorParams.status;
                const purpose              : string                             = togglePauseAggregatorParams.purpose;

                // init maps
                const dataMap : dataMapType = map [
                    ("aggregatorAddress" : string)  -> Bytes.pack(aggregatorAddress);
                    ("status"            : string)  -> Bytes.pack(status)
                ];

                // create action
                s := createGovernanceSatelliteAction(
                    "TOGGLE_PAUSE_AGGREGATOR",
                    dataMap,
                    purpose,
                    s
                );

            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Aggregator Governance Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Mistaken Transfer Governance Lambdas Begin
// ------------------------------------------------------------------------------

(*  fixMistakenTransfer lambda *)
function lambdaFixMistakenTransfer(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that no tez is sent to the entrypoint
    // 2. Get necessary contracts and config info
    //      -   Get Doorman Contract address from the General Contracts Map on the Governance Contract
    //      -   Get Delegation Contract address from the General Contracts Map on the Governance Contract
    //      -   Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
    // 3. Get / Check Satellite Records
    //      -   Get satellite record for initiator
    //      -   Check if address given for specified oracle is valid
    // 4. Take snapshot of current total staked MVK supply 
    // 5. Calculate staked MVK votes required for approval based on config's financial request approval percentage
    // 6. Create new governance satellite action record - "MISTAKEN_TRANSFER_FIX"
    // 6. Update storage with new records 
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        | LambdaFixMistakenTransfer(fixMistakenTransferParams) -> {
                
                // init params
                const targetContractAddress    : address             = fixMistakenTransferParams.targetContractAddress;
                const transferList             : transferActionType  = fixMistakenTransferParams.transferList;
                const purpose                  : string              = fixMistakenTransferParams.purpose;

                const dataMap : dataMapType = map [
                    ("targetContractAddress" : string) -> Bytes.pack(targetContractAddress);
                    ("transfer"              : string) -> Bytes.pack(transferList);
                ];

                // create action
                s := createGovernanceSatelliteAction(
                    "MISTAKEN_TRANSFER_FIX",
                    dataMap,
                    purpose,
                    s
                );

            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Mistaken Transfer Governance Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Action Lambdas Begin
// ------------------------------------------------------------------------------

(*  dropAction lambda *)
function lambdaDropAction(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that no tez is sent to the entrypoint
    // 2. Get necessary contracts and config info
    //      -   Get Delegation Contract address from the General Contracts Map on the Governance Contract
    // 3. Get / Check Satellite Records
    //      -   Get satellite record for initiator
    // 4. Get governance satellite action record 
    // 5. Validation checks
    //      -   Check that sender is the initiator of the governance satellite action
    //      -   Check that governance satellite action record has not been dropped already
    //      -   Check that governance satellite action record has not been executed
    //      -   Check that governance satellite action record has not expired
    // 6. Drop governance satellite action record  - update status to false
    // 7. Update storage - action ledger

    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        |   LambdaDropAction(dropActionParams) -> {
                
                // init params
                const dropActionId : nat = dropActionParams.dropActionId;

                // Verify sender is a satellite which is not suspended or banned
                verifySatelliteIsNotSuspendedOrBanned(Tezos.get_sender(), s);

                // Get governance satellite action record 
                var governanceSatelliteActionRecord : governanceSatelliteActionRecordType := getGovernanceSatelliteActionRecord(dropActionId, s);

                // Verify that sender is the initiator of the governance satellite action
                const initiator : address = governanceSatelliteActionRecord.initiator;
                verifySenderIsInitiator(initiator);

                // Check if the action can still be interacted with
                validateAction(governanceSatelliteActionRecord);

                // Drop governance satellite action record  - update status to false
                governanceSatelliteActionRecord.status := False;

                // Update storage - action ledger
                s.governanceSatelliteActionLedger[dropActionId] := governanceSatelliteActionRecord;

                // Remove the dropped action from the satellite's set
                var initiatorActions : set(actionIdType)    := case Big_map.find_opt(initiator, s.actionsInitiators) of [
                        Some (_actionsIds)  -> _actionsIds
                    |   None                -> failwith(error_INITIATOR_ACTIONS_NOT_FOUND)
                ];
                initiatorActions                := Set.remove(dropActionId, initiatorActions);
                s.actionsInitiators[initiator]  := initiatorActions;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  voteForAction lambda *)
function lambdaVoteForAction(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is a satellite and is not suspended or banned
    // 2. Validation Checks
    //      -   Check if governance satellite action exists
    //      -   Check if governance satellite action has been dropped
    //      -   Check if governance satellite action has already been executed
    //      -   Check if governance satellite action has expired
    // 3. Get snapshot of satellite voting power
    //      -   Get governance satellite action snapshot (of all active satellites and their voting power)
    //      -   Get satellite's snapshot record stored in governance satellite action snapshot
    // 4. Save and update satellite's vote record
    //      -   Remove previous vote if user already voted
    //      -   Init new vote record
    //      -   Update governance satellite action map of voters with new vote
    // 5. Compute governance satellite action's vote totals and execute governance satellite action if enough votes have been gathered
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount
    
    var operations : list(operation) := nil;

    case governanceSatelliteLambdaAction of [
        |   LambdaVoteForAction(voteForAction) -> {

                // init params
                const actionId : nat = voteForAction.actionId;
                
                // Get Delegation Contract address from the General Contracts Map on the Governance Contract
                const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

                // check satellite record of sender
                checkSatelliteStatus(Tezos.get_sender(), delegationAddress, True, True);

                // Get governance satellite action record
                var _governanceSatelliteActionRecord : governanceSatelliteActionRecordType := getGovernanceSatelliteActionRecord(actionId, s);
                const actionGovernanceCycleId : nat = _governanceSatelliteActionRecord.governanceCycleId;

                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------

                // Check if satellite can interact with the action
                validateAction(_governanceSatelliteActionRecord);

                // ------------------------------------------------------------------
                // Get snapshot of satellite voting power
                // ------------------------------------------------------------------

                // Get the satellite total voting power and check if it needs to be updated for the current cycle or not
                const totalVotingPowerAndSatelliteUpdate: (nat * list(operation))   = getTotalVotingPowerAndUpdateSnapshot(Tezos.get_sender(), actionGovernanceCycleId, operations, s);
                const totalVotingPower : nat                                        = totalVotingPowerAndSatelliteUpdate.0;

                // Update the satellite snapshot on the governance contract if it needs to
                operations                                                          := totalVotingPowerAndSatelliteUpdate.1;

                // ------------------------------------------------------------------
                // Compute vote
                // ------------------------------------------------------------------

                // Save and update satellite's vote record
                const voteType         : voteType   = voteForAction.vote;

                // Remove previous vote if user already voted
                case s.governanceSatelliteVoters[(actionId, Tezos.get_sender())] of [
                    
                        Some (_voteType) -> case _voteType of [

                                Yay(_v)   ->    if totalVotingPower > _governanceSatelliteActionRecord.yayVoteStakedMvkTotal 
                                                then failwith(error_CALCULATION_ERROR) 
                                                else _governanceSatelliteActionRecord.yayVoteStakedMvkTotal := abs(_governanceSatelliteActionRecord.yayVoteStakedMvkTotal - totalVotingPower)

                            |   Nay(_v)   ->    if totalVotingPower > _governanceSatelliteActionRecord.nayVoteStakedMvkTotal 
                                                then failwith(error_CALCULATION_ERROR) 
                                                else _governanceSatelliteActionRecord.nayVoteStakedMvkTotal := abs(_governanceSatelliteActionRecord.nayVoteStakedMvkTotal - totalVotingPower)

                            |   Pass(_v)  ->    if totalVotingPower > _governanceSatelliteActionRecord.passVoteStakedMvkTotal 
                                                then failwith(error_CALCULATION_ERROR) 
                                                else _governanceSatelliteActionRecord.passVoteStakedMvkTotal := abs(_governanceSatelliteActionRecord.passVoteStakedMvkTotal - totalVotingPower)
                        ]

                    |   None -> skip
                ];

                // Update governance satellite action map of voters with new vote
                s.governanceSatelliteVoters[(actionId, Tezos.get_sender())] := voteType;

                // Save voter in the storage
                _governanceSatelliteActionRecord.voters := Set.add(Tezos.get_sender(), _governanceSatelliteActionRecord.voters);

                // Compute governance satellite action vote totals and execute governance satellite action if enough votes have been gathered
                case voteType of [

                    Yay(_v) -> block {

                        // Compute new YAY vote total
                        const newYayVoteStakedMvkTotal : nat = _governanceSatelliteActionRecord.yayVoteStakedMvkTotal + totalVotingPower;

                        // Update governance satellite action with new vote total
                        _governanceSatelliteActionRecord.yayVoteStakedMvkTotal      := newYayVoteStakedMvkTotal;
                        s.governanceSatelliteActionLedger[actionId]                 := _governanceSatelliteActionRecord;

                        // Execute governance satellite action if total yay votes exceed staked MVK required for approval
                        if newYayVoteStakedMvkTotal > _governanceSatelliteActionRecord.stakedMvkRequiredForApproval then block {
                            const executeGovernanceSatelliteActionReturn : return   = executeGovernanceSatelliteAction(_governanceSatelliteActionRecord, actionId, operations, s);
                            s           := executeGovernanceSatelliteActionReturn.1;
                            operations := executeGovernanceSatelliteActionReturn.0;
                        }
                    }

                    | Nay(_v) -> block {
                        
                        // Compute new NAY vote total
                        const newNayVoteStakedMvkTotal : nat                        = _governanceSatelliteActionRecord.nayVoteStakedMvkTotal + totalVotingPower;
                        
                        // Update governance satellite action with new vote total
                        _governanceSatelliteActionRecord.nayVoteStakedMvkTotal      := newNayVoteStakedMvkTotal;
                        s.governanceSatelliteActionLedger[actionId]                 := _governanceSatelliteActionRecord;
                    }

                    | Pass(_v) -> block {

                        // Compute new PASS vote total
                        const newPassVoteStakedMvkTotal : nat                           = _governanceSatelliteActionRecord.passVoteStakedMvkTotal + totalVotingPower;

                        // Update governance satellite action with new vote total
                        _governanceSatelliteActionRecord.passVoteStakedMvkTotal         := newPassVoteStakedMvkTotal;
                        s.governanceSatelliteActionLedger[actionId]                     := _governanceSatelliteActionRecord;
                    }
                ];

            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Governance Action Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Satellite Governance Lambdas End
//
// ------------------------------------------------------------------------------
