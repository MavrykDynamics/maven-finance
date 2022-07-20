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
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address   

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
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address   

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

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance Proxy Contract address)

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

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  checkSenderIsAdmin(s); // check that sender is admin

  case governanceSatelliteLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {

                const updateConfigAction    : governanceSatelliteUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : governanceSatelliteUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    | ConfigApprovalPercentage (_v)         -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.governanceSatelliteApprovalPercentage  := updateConfigNewValue
                    | ConfigSatelliteDurationInDays (_v)    -> s.config.governanceSatelliteDurationInDays       := updateConfigNewValue
                    | ConfigPurposeMaxLength (_v)           -> s.config.governancePurposeMaxLength              := updateConfigNewValue  
                ];

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda  *)
function lambdaUpdateWhitelistContracts(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin
    
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
    
    checkSenderIsAdmin(s); // check that sender is admin
    
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

                // Check if the sender is the governanceSatellite contract
                checkSenderIsAdminOrSelf(s);

                // Create transfer operations
                function transferOperationFold(const transferParam: transferDestinationType; const operationList: list(operation)): list(operation) is
                  block{
                    // Check if token is not MVK (it would break SMVK) before creating the transfer operation
                    const transferTokenOperation : operation = case transferParam.token of [
                        | Tez         -> transferTez((Tezos.get_contract_with_error(transferParam.to_, "Error. Contract not found at given address"): contract(unit)), transferParam.amount * 1mutez)
                        | Fa12(token) -> transferFa12Token(Tezos.get_self_address(), transferParam.to_, transferParam.amount, token)
                        | Fa2(token)  -> transferFa2Token(Tezos.get_self_address(), transferParam.to_, transferParam.amount, token.tokenId, token.tokenContractAddress)
                    ];
                  } with(transferTokenOperation # operationList);
                
                operations  := List.fold_right(transferOperationFold, destinationParams, operations)
                
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
    // 7. Take snapshot of current active satellites' total voting power and update governanceSatelliteSnapshotLedger
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        |   LambdaSuspendSatellite(suspendSatelliteParams) -> {

                // init params
                const satelliteToBeSuspended  : address = suspendSatelliteParams.satelliteToBeSuspended;
                const purpose                 : string  = suspendSatelliteParams.purpose;

                // Validate inputs
                if String.length(purpose)    > s.config.governancePurposeMaxLength    then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // ------------------------------------------------------------------
                // Get necessary contracts and info
                // ------------------------------------------------------------------

                // Get Doorman Contract address from the General Contracts Map on the Governance Contract
                const doormanAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress : address = case doormanAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get Delegation Contract address from the General Contracts Map on the Governance Contract
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress : address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
                const configView : option(delegationConfigType)  = Tezos.call_view ("getConfig", unit, delegationAddress);
                const delegationRatio : nat                     = case configView of [
                        Some (_optionConfig) -> _optionConfig.delegationRatio
                    |   None                 -> failwith (error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Get / Check Satellite Records
                // ------------------------------------------------------------------

                // Get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.get_sender(), delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                                Some (_satellite) -> if _satellite.status = "SUSPENDED" then failwith(error_SATELLITE_SUSPENDED) else if _satellite.status = "BANNED" then failwith(error_SATELLITE_BANNED) else skip
                            |   None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
                        ]
                    |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Check if address given for satellite to be suspended is valid
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", satelliteToBeSuspended, delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                                Some (_satellite) -> skip
                            |   None              -> failwith(error_SATELLITE_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Snapshot Staked MVK Total Supply
                // ------------------------------------------------------------------

                // Take snapshot of current total staked MVK supply 
                const getBalanceView : option (nat) = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply : nat = case getBalanceView of [
                        Some (value) -> value
                    |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Calculate staked MVK votes required for approval based on config's approval percentage
                const stakedMvkRequiredForApproval : nat     = abs((snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                // ------------------------------------------------------------------
                // Create new Governance Satellite Action
                // ------------------------------------------------------------------

                // init empty voters map
                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                // init maps
                const addressMap        : addressMapType     = map [
                    ("satelliteToBeSuspended" : string) -> satelliteToBeSuspended
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];
                const emptyTransferList : transferActionType = list [];

                // Create new governance satellite action record
                var newGovernanceSatelliteAction : governanceSatelliteActionRecordType := record [

                    initiator                          = Tezos.get_sender();
                    status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                    executed                           = False;

                    governanceType                     = "SUSPEND";
                    governancePurpose                  = purpose;
                    voters                             = emptyVotersMap;

                    addressMap                         = addressMap;
                    stringMap                          = emptyStringMap;
                    natMap                             = emptyNatMap;

                    transferList                       = emptyTransferList;

                    yayVoteStakedMvkTotal              = 0n;
                    nayVoteStakedMvkTotal              = 0n;
                    passVoteStakedMvkTotal             = 0n;

                    snapshotStakedMvkTotalSupply       = snapshotStakedMvkTotalSupply;
                    stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                    stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                    startDateTime                      = Tezos.get_now();            
                    expiryDateTime                     = Tezos.get_now() + (86_400 * s.config.governanceSatelliteDurationInDays);
                    
                ];

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Get current action counter
                const actionId : nat = s.governanceSatelliteCounter;

                // Save action to governance satellite action ledger
                s.governanceSatelliteActionLedger[actionId] := newGovernanceSatelliteAction;

                // Create snapshot in governanceSatelliteSnapshotLedger (to be filled with satellite's total voting power at this snapshot)
                const emptyGovernanceSatelliteActionSnapshotMap  : governanceSatelliteSnapshotMapType     = map [];
                s.governanceSatelliteSnapshotLedger[actionId] := emptyGovernanceSatelliteActionSnapshotMap;

                // Increment governance satellite action counter
                s.governanceSatelliteCounter := actionId + 1n;

                // ------------------------------------------------------------------
                // Satellite Snapshot
                // ------------------------------------------------------------------

                // Get map of active satellites from the Delegation Contract
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites : map(address, satelliteRecordType) = case activeSatellitesView of [
                        Some (value) -> value
                    |   None         -> failwith (error_GET_ACTIVE_SATELLITES_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                for satelliteAddress -> satellite in map activeSatellites block {
                    
                    const satelliteSnapshot : actionSatelliteSnapshotType = record [
                        satelliteAddress      = satelliteAddress;
                        actionId              = actionId;
                        stakedMvkBalance      = satellite.stakedMvkBalance;
                        totalDelegatedAmount  = satellite.totalDelegatedAmount;
                    ];

                    s := setSatelliteSnapshot(satelliteSnapshot, delegationRatio, s);

                }; 

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  unsuspendSatellite lambda *)
function lambdaUnsuspendSatellite(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that no tez is sent to the entrypoint
    // 2. Get necessary contracts and config info
    //      -   Get Doorman Contract address from the General Contracts Map on the Governance Contract
    //      -   Get Delegation Contract address from the General Contracts Map on the Governance Contract
    //      -   Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
    // 3. Get / Check Satellite Records
    //      -   Get satellite record for initiator
    //      -   Check if address given for satellite to be unsuspended is valid
    // 4. Take snapshot of current total staked MVK supply 
    // 5. Calculate staked MVK votes required for approval based on config's financial request approval percentage
    // 6. Create new governance satellite action record - "UNSUSPEND"
    // 6. Update storage with new records 
    // 7. Take snapshot of current active satellites' total voting power and update governanceSatelliteSnapshotLedger
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        |   LambdaUnsuspendSatellite(unsuspendSatelliteParams) -> {

                // init params
                const satelliteToBeUnsuspended  : address = unsuspendSatelliteParams.satelliteToBeUnsuspended;
                const purpose                   : string  = unsuspendSatelliteParams.purpose;

                // Validate inputs
                if String.length(purpose)    > s.config.governancePurposeMaxLength    then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // ------------------------------------------------------------------
                // Get necessary contracts and info
                // ------------------------------------------------------------------

                // Get Doorman Contract address from the General Contracts Map on the Governance Contract
                const doormanAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress : address = case doormanAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get Delegation Contract address from the General Contracts Map on the Governance Contract
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress : address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
                const configView : option(delegationConfigType)  = Tezos.call_view ("getConfig", unit, delegationAddress);
                const delegationRatio : nat                     = case configView of [
                        Some (_optionConfig) -> _optionConfig.delegationRatio
                    |   None                 -> failwith (error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Get / Check Satellite Records
                // ------------------------------------------------------------------

                // Get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.get_sender(), delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                                Some (_satellite) -> if _satellite.status = "SUSPENDED" then failwith(error_SATELLITE_SUSPENDED) else if _satellite.status = "BANNED" then failwith(error_SATELLITE_BANNED) else skip
                            |   None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
                        ]
                    |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Check if address given for satellite to be unsuspended is valid
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", satelliteToBeUnsuspended, delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                                Some (_satellite) -> skip
                            |   None              -> failwith(error_SATELLITE_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Snapshot Staked MVK Total Supply
                // ------------------------------------------------------------------

                // Take snapshot of current total staked MVK supply 
                const getBalanceView : option (nat) = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply : nat = case getBalanceView of [
                        Some (value) -> value
                    |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Calculate staked MVK votes required for approval based on config's approval percentage
                const stakedMvkRequiredForApproval : nat     = abs((snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                // ------------------------------------------------------------------
                // Create new Governance Satellite Action
                // ------------------------------------------------------------------

                // init empty voters map
                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                // init maps
                const addressMap        : addressMapType     = map [
                    ("satelliteToBeUnsuspended" : string) -> satelliteToBeUnsuspended
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];
                const emptyTransferList : transferActionType = list [];

                // Create new governance satellite action record
                var newGovernanceSatelliteAction : governanceSatelliteActionRecordType := record [

                    initiator                          = Tezos.get_sender();
                    status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                    executed                           = False;

                    governanceType                     = "UNSUSPEND";
                    governancePurpose                  = purpose;
                    voters                             = emptyVotersMap;

                    addressMap                         = addressMap;
                    stringMap                          = emptyStringMap;
                    natMap                             = emptyNatMap;

                    transferList                       = emptyTransferList;

                    yayVoteStakedMvkTotal              = 0n;
                    nayVoteStakedMvkTotal              = 0n;
                    passVoteStakedMvkTotal             = 0n;

                    snapshotStakedMvkTotalSupply       = snapshotStakedMvkTotalSupply;
                    stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                    stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                    startDateTime                      = Tezos.get_now();            
                    expiryDateTime                     = Tezos.get_now() + (86_400 * s.config.governanceSatelliteDurationInDays);

                ];
                
                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Get current action counter
                const actionId : nat = s.governanceSatelliteCounter;

                // Save action to governance satellite ledger
                s.governanceSatelliteActionLedger[actionId] := newGovernanceSatelliteAction;

                // Create snapshot in governanceSatelliteSnapshotLedger (to be filled with satellite's total voting power at this snapshot)
                const emptyGovernanceSatelliteActionSnapshotMap  : governanceSatelliteSnapshotMapType     = map [];
                s.governanceSatelliteSnapshotLedger[actionId] := emptyGovernanceSatelliteActionSnapshotMap;

                // Increment governance satellite counter
                s.governanceSatelliteCounter := actionId + 1n;

                // ------------------------------------------------------------------
                // Satellite Snapshot
                // ------------------------------------------------------------------

                // Get map of active satellites from the Delegation Contract
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites : map(address, satelliteRecordType) = case activeSatellitesView of [
                        Some (value) -> value
                    |   None         -> failwith (error_GET_ACTIVE_SATELLITES_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                for satelliteAddress -> satellite in map activeSatellites block {

                    const satelliteSnapshot : actionSatelliteSnapshotType = record [
                        satelliteAddress      = satelliteAddress;
                        actionId              = actionId;
                        stakedMvkBalance      = satellite.stakedMvkBalance;
                        totalDelegatedAmount  = satellite.totalDelegatedAmount;
                    ];

                    s := setSatelliteSnapshot(satelliteSnapshot, delegationRatio, s);

                }; 

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
    // 7. Take snapshot of current active satellites' total voting power and update governanceSatelliteSnapshotLedger
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        |   LambdaBanSatellite(banSatelliteParams) -> {

                // init params
                const satelliteToBeBanned      : address = banSatelliteParams.satelliteToBeBanned;
                const purpose                  : string  = banSatelliteParams.purpose;

                // Validate inputs
                if String.length(purpose)    > s.config.governancePurposeMaxLength    then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // ------------------------------------------------------------------
                // Get necessary contracts and info
                // ------------------------------------------------------------------
                
                // Get Doorman Contract address from the General Contracts Map on the Governance Contract
                const doormanAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress : address = case doormanAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];
                
                // Get Delegation Contract address from the General Contracts Map on the Governance Contract
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress : address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
                const configView : option(delegationConfigType)  = Tezos.call_view ("getConfig", unit, delegationAddress);
                const delegationRatio : nat                     = case configView of [
                        Some (_optionConfig) -> _optionConfig.delegationRatio
                    |   None                 -> failwith (error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Get / Check Satellite Records
                // ------------------------------------------------------------------

                // Get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.get_sender(), delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                                Some (_satellite) -> if _satellite.status = "SUSPENDED" then failwith(error_SATELLITE_SUSPENDED) else if _satellite.status = "BANNED" then failwith(error_SATELLITE_BANNED) else skip
                            |   None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
                        ]
                    |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Check if address given for satellite to be banned is valid
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", satelliteToBeBanned, delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                                Some (_satellite) -> skip
                            |   None              -> failwith(error_SATELLITE_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Snapshot Staked MVK Total Supply
                // ------------------------------------------------------------------

                // Take snapshot of current total staked MVK supply 
                const getBalanceView : option (nat) = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply : nat = case getBalanceView of [
                        Some (value) -> value
                    |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Calculate staked MVK votes required for approval based on config's approval percentage
                const stakedMvkRequiredForApproval : nat     = abs((snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                // ------------------------------------------------------------------
                // Create new Governance Satellite Action
                // ------------------------------------------------------------------

                // init empty voters map
                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                // init maps
                const addressMap        : addressMapType     = map [
                    ("satelliteToBeBanned" : string) -> satelliteToBeBanned
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];
                const emptyTransferList : transferActionType = list [];

                // Create new governance satellite action record
                var newGovernanceSatelliteAction : governanceSatelliteActionRecordType := record [

                    initiator                          = Tezos.get_sender();
                    status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                    executed                           = False;

                    governanceType                     = "BAN";
                    governancePurpose                  = purpose;
                    voters                             = emptyVotersMap;

                    addressMap                         = addressMap;
                    stringMap                          = emptyStringMap;
                    natMap                             = emptyNatMap;

                    transferList                       = emptyTransferList;
                    
                    yayVoteStakedMvkTotal              = 0n;
                    nayVoteStakedMvkTotal              = 0n;
                    passVoteStakedMvkTotal             = 0n;

                    snapshotStakedMvkTotalSupply       = snapshotStakedMvkTotalSupply;
                    stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                    stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                    startDateTime                      = Tezos.get_now();            
                    expiryDateTime                     = Tezos.get_now() + (86_400 * s.config.governanceSatelliteDurationInDays);

                ];

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Get current action counter
                const actionId : nat = s.governanceSatelliteCounter;

                // Save action to governance satellite ledger
                s.governanceSatelliteActionLedger[actionId] := newGovernanceSatelliteAction;

                // Create snapshot in governanceSatelliteSnapshotLedger (to be filled with satellite's total voting power at this snapshot)
                const emptyGovernanceSatelliteActionSnapshotMap  : governanceSatelliteSnapshotMapType     = map [];
                s.governanceSatelliteSnapshotLedger[actionId] := emptyGovernanceSatelliteActionSnapshotMap;

                // Increment governance satellite counter
                s.governanceSatelliteCounter := actionId + 1n;

                // ------------------------------------------------------------------
                // Satellite Snapshot
                // ------------------------------------------------------------------

                // Get map of active satellites from the Delegation Contract
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites : map(address, satelliteRecordType) = case activeSatellitesView of [
                        Some (value) -> value
                    |   None         -> failwith (error_GET_ACTIVE_SATELLITES_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                for satelliteAddress -> satellite in map activeSatellites block {

                    const satelliteSnapshot : actionSatelliteSnapshotType = record [
                        satelliteAddress      = satelliteAddress;
                        actionId              = actionId;
                        stakedMvkBalance      = satellite.stakedMvkBalance;
                        totalDelegatedAmount  = satellite.totalDelegatedAmount;
                    ];

                    s := setSatelliteSnapshot(satelliteSnapshot, delegationRatio, s);

                }; 

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  unbanSatellite lambda *)
function lambdaUnbanSatellite(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that no tez is sent to the entrypoint
    // 2. Get necessary contracts and config info
    //      -   Get Doorman Contract address from the General Contracts Map on the Governance Contract
    //      -   Get Delegation Contract address from the General Contracts Map on the Governance Contract
    //      -   Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
    // 3. Get / Check Satellite Records
    //      -   Get satellite record for initiator
    //      -   Check if address given for satellite to be unbanned is valid
    // 4. Take snapshot of current total staked MVK supply 
    // 5. Calculate staked MVK votes required for approval based on config's financial request approval percentage
    // 6. Create new governance satellite action record - "UNBAN"
    // 6. Update storage with new records 
    // 7. Take snapshot of current active satellites' total voting power and update governanceSatelliteSnapshotLedger    
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        |   LambdaUnbanSatellite(unbanSatelliteParams) -> {

                // init params
                const satelliteToBeUnbanned    : address = unbanSatelliteParams.satelliteToBeUnbanned;
                const purpose                  : string  = unbanSatelliteParams.purpose;

                // Validate inputs
                if String.length(purpose)    > s.config.governancePurposeMaxLength    then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // ------------------------------------------------------------------
                // Get necessary contracts and info
                // ------------------------------------------------------------------

                // Get Doorman Contract address from the General Contracts Map on the Governance Contract
                const doormanAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress : address = case doormanAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get Delegation Contract address from the General Contracts Map on the Governance Contract
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress : address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
                const configView : option(delegationConfigType)  = Tezos.call_view ("getConfig", unit, delegationAddress);
                const delegationRatio : nat                     = case configView of [
                        Some (_optionConfig) -> _optionConfig.delegationRatio
                    |   None                 -> failwith (error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Get / Check Satellite Records
                // ------------------------------------------------------------------

                // Get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.get_sender(), delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                                Some (_satellite) -> if _satellite.status = "SUSPENDED" then failwith(error_SATELLITE_SUSPENDED) else if _satellite.status = "BANNED" then failwith(error_SATELLITE_BANNED) else skip
                            |   None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
                        ]
                    |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                //  Check if address given for satellite to be unbanned is valid
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", satelliteToBeUnbanned, delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                                Some (_satellite) -> skip
                            |   None              -> failwith(error_SATELLITE_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Snapshot Staked MVK Total Supply
                // ------------------------------------------------------------------

                // Take snapshot of current total staked MVK supply 
                const getBalanceView : option (nat) = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply : nat = case getBalanceView of [
                        Some (value) -> value
                    |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Calculate staked MVK votes required for approval based on config's approval percentage
                const stakedMvkRequiredForApproval : nat     = abs((snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                // ------------------------------------------------------------------
                // Create new Governance Satellite Action
                // ------------------------------------------------------------------

                // init empty voters map
                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                // init maps
                const addressMap        : addressMapType     = map [
                    ("satelliteToBeUnbanned" : string) -> satelliteToBeUnbanned
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];
                const emptyTransferList : transferActionType = list [];

                // Create new governance satellite action record
                var newGovernanceSatelliteAction : governanceSatelliteActionRecordType := record [

                    initiator                          = Tezos.get_sender();
                    status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                    executed                           = False;

                    governanceType                     = "UNBAN";
                    governancePurpose                  = purpose;
                    voters                             = emptyVotersMap;

                    addressMap                         = addressMap;
                    stringMap                          = emptyStringMap;
                    natMap                             = emptyNatMap;
                        
                    transferList                       = emptyTransferList;

                    yayVoteStakedMvkTotal              = 0n;
                    nayVoteStakedMvkTotal              = 0n;
                    passVoteStakedMvkTotal             = 0n;

                    snapshotStakedMvkTotalSupply       = snapshotStakedMvkTotalSupply;
                    stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                    stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                    startDateTime                      = Tezos.get_now();            
                    expiryDateTime                     = Tezos.get_now() + (86_400 * s.config.governanceSatelliteDurationInDays);

                ];

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Get current action counter
                const actionId : nat = s.governanceSatelliteCounter;

                // Save action to governance satellite ledger
                s.governanceSatelliteActionLedger[actionId] := newGovernanceSatelliteAction;

                // Create snapshot in governanceSatelliteSnapshotLedger (to be filled with satellite's total voting power at this snapshot)
                const emptyGovernanceSatelliteActionSnapshotMap  : governanceSatelliteSnapshotMapType     = map [];
                s.governanceSatelliteSnapshotLedger[actionId] := emptyGovernanceSatelliteActionSnapshotMap;

                // Increment governance satellite counter
                s.governanceSatelliteCounter := actionId + 1n;

                // ------------------------------------------------------------------
                // Satellite Snapshot
                // ------------------------------------------------------------------

                // Get map of active satellites from the Delegation Contract
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites : map(address, satelliteRecordType) = case activeSatellitesView of [
                        Some (value) -> value
                    |   None         -> failwith (error_GET_ACTIVE_SATELLITES_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                for satelliteAddress -> satellite in map activeSatellites block {

                    const satelliteSnapshot : actionSatelliteSnapshotType = record [
                        satelliteAddress      = satelliteAddress;
                        actionId              = actionId;
                        stakedMvkBalance      = satellite.stakedMvkBalance;
                        totalDelegatedAmount  = satellite.totalDelegatedAmount;
                    ];

                    s := setSatelliteSnapshot(satelliteSnapshot, delegationRatio, s);

                }; 

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
    // 7. Take snapshot of current active satellites' total voting power and update governanceSatelliteSnapshotLedger
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        |   LambdaRemoveAllSatelliteOracles(removeAllSatelliteOraclesParams) -> {

                // init params
                const satelliteAddress    : address = removeAllSatelliteOraclesParams.satelliteAddress;
                const purpose             : string  = removeAllSatelliteOraclesParams.purpose;

                // Validate inputs
                if String.length(purpose)    > s.config.governancePurposeMaxLength    then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                
                // ------------------------------------------------------------------
                // Get necessary contracts and info
                // ------------------------------------------------------------------

                // Get Doorman Contract address from the General Contracts Map on the Governance Contract
                const doormanAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress : address = case doormanAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get Delegation Contract address from the General Contracts Map on the Governance Contract
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress : address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
                const configView : option(delegationConfigType)  = Tezos.call_view ("getConfig", unit, delegationAddress);
                const delegationRatio : nat                     = case configView of [
                        Some (_optionConfig) -> _optionConfig.delegationRatio
                    |   None                 -> failwith (error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Get / Check Satellite Records
                // ------------------------------------------------------------------

                // Get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.get_sender(), delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                                Some (_satellite) -> if _satellite.status = "SUSPENDED" then failwith(error_SATELLITE_SUSPENDED) else if _satellite.status = "BANNED" then failwith(error_SATELLITE_BANNED) else skip
                            |   None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
                        ]
                    |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Check if address given for specified satellite is valid
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", satelliteAddress, delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                                Some (_satellite) -> skip
                            |   None              -> failwith(error_SATELLITE_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Snapshot Staked MVK Total Supply
                // ------------------------------------------------------------------

                // Take snapshot of current total staked MVK supply 
                const getBalanceView : option (nat) = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply : nat = case getBalanceView of [
                        Some (value) -> value
                    |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Calculate staked MVK votes required for approval based on config's approval percentage
                const stakedMvkRequiredForApproval : nat     = abs((snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                // ------------------------------------------------------------------
                // Create new Governance Satellite Action
                // ------------------------------------------------------------------

                // init empty voters map
                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                // init maps
                const addressMap        : addressMapType     = map [
                    ("satelliteAddress" : string) -> satelliteAddress
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];
                const emptyTransferList : transferActionType = list [];

                // Create new governance satellite action record
                var newGovernanceSatelliteAction : governanceSatelliteActionRecordType := record [

                    initiator                          = Tezos.get_sender();
                    status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                    executed                           = False;

                    governanceType                     = "REMOVE_ALL_SATELLITE_ORACLES";
                    governancePurpose                  = purpose;
                    voters                             = emptyVotersMap;

                    addressMap                         = addressMap;
                    stringMap                          = emptyStringMap;
                    natMap                             = emptyNatMap;
                    
                    transferList                       = emptyTransferList;

                    yayVoteStakedMvkTotal              = 0n;
                    nayVoteStakedMvkTotal              = 0n;
                    passVoteStakedMvkTotal             = 0n;

                    snapshotStakedMvkTotalSupply       = snapshotStakedMvkTotalSupply;
                    stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                    stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                    startDateTime                      = Tezos.get_now();            
                    expiryDateTime                     = Tezos.get_now() + (86_400 * s.config.governanceSatelliteDurationInDays);

                ];

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Get current action counter
                const actionId : nat = s.governanceSatelliteCounter;

                // Save action to governance satellite ledger
                s.governanceSatelliteActionLedger[actionId] := newGovernanceSatelliteAction;

                // Create snapshot in governanceSatelliteSnapshotLedger (to be filled with satellite's total voting power at this snapshot)
                const emptyGovernanceSatelliteActionSnapshotMap  : governanceSatelliteSnapshotMapType     = map [];
                s.governanceSatelliteSnapshotLedger[actionId] := emptyGovernanceSatelliteActionSnapshotMap;

                // Increment governance satellite counter
                s.governanceSatelliteCounter := actionId + 1n;

                // ------------------------------------------------------------------
                // Satellite Snapshot
                // ------------------------------------------------------------------

                // Get map of active satellites from the Delegation Contract
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites : map(address, satelliteRecordType) = case activeSatellitesView of [
                        Some (value) -> value
                    |   None         -> failwith (error_GET_ACTIVE_SATELLITES_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                for satelliteAddress -> satellite in map activeSatellites block {

                    const satelliteSnapshot : actionSatelliteSnapshotType = record [
                        satelliteAddress      = satelliteAddress;
                        actionId              = actionId;
                        stakedMvkBalance      = satellite.stakedMvkBalance;
                        totalDelegatedAmount  = satellite.totalDelegatedAmount;
                    ];

                    s := setSatelliteSnapshot(satelliteSnapshot, delegationRatio, s);

                }; 

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
    // 7. Take snapshot of current active satellites' total voting power and update governanceSatelliteSnapshotLedger

    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        |   LambdaAddOracleToAggregator(addOracleToAggregatorParams) -> {

                // init params
                const oracleAddress      : address = addOracleToAggregatorParams.oracleAddress;
                const aggregatorAddress  : address = addOracleToAggregatorParams.aggregatorAddress;
                const purpose            : string  = addOracleToAggregatorParams.purpose;

                // Validate inputs
                if String.length(purpose)    > s.config.governancePurposeMaxLength    then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // ------------------------------------------------------------------
                // Get necessary contracts and info
                // ------------------------------------------------------------------

                // Get Doorman Contract address from the General Contracts Map on the Governance Contract
                const doormanAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress : address = case doormanAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get Delegation Contract address from the General Contracts Map on the Governance Contract
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress : address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
                const configView : option(delegationConfigType)  = Tezos.call_view ("getConfig", unit, delegationAddress);
                const delegationRatio : nat                     = case configView of [
                        Some (_optionConfig) -> _optionConfig.delegationRatio
                    |   None                 -> failwith (error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Get / Check Satellite Records
                // ------------------------------------------------------------------

                // Get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.get_sender(), delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                                Some (_satellite) -> if _satellite.status = "SUSPENDED" then failwith(error_SATELLITE_SUSPENDED) else if _satellite.status = "BANNED" then failwith(error_SATELLITE_BANNED) else skip
                            |   None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
                        ]
                    |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Check if address given for specified oracle is valid
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", oracleAddress, delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                                Some (_satellite) -> skip
                            |   None              -> failwith(error_SATELLITE_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Snapshot Staked MVK Total Supply
                // ------------------------------------------------------------------

                // Take snapshot of current total staked MVK supply 
                const getBalanceView : option (nat) = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply : nat = case getBalanceView of [
                        Some (value) -> value
                    |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Calculate staked MVK votes required for approval based on config's approval percentage
                const stakedMvkRequiredForApproval : nat     = abs((snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                // ------------------------------------------------------------------
                // Create new Governance Satellite Action
                // ------------------------------------------------------------------

                // init empty voters map
                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                // init maps
                const addressMap        : addressMapType     = map [
                    ("oracleAddress"     : string)   -> oracleAddress;
                    ("aggregatorAddress" : string)   -> aggregatorAddress;
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];
                const emptyTransferList : transferActionType = list [];
            
                // Create new governance satellite action record
                var newGovernanceSatelliteAction : governanceSatelliteActionRecordType := record [

                    initiator                          = Tezos.get_sender();
                    status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                    executed                           = False;

                    governanceType                     = "ADD_ORACLE_TO_AGGREGATOR";
                    governancePurpose                  = purpose;
                    voters                             = emptyVotersMap;

                    addressMap                         = addressMap;
                    stringMap                          = emptyStringMap;
                    natMap                             = emptyNatMap;
                        
                    transferList                       = emptyTransferList;

                    yayVoteStakedMvkTotal              = 0n;
                    nayVoteStakedMvkTotal              = 0n;
                    passVoteStakedMvkTotal             = 0n;

                    snapshotStakedMvkTotalSupply       = snapshotStakedMvkTotalSupply;
                    stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                    stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                    startDateTime                      = Tezos.get_now();            
                    expiryDateTime                     = Tezos.get_now() + (86_400 * s.config.governanceSatelliteDurationInDays);

                ];

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Get current action counter
                const actionId : nat = s.governanceSatelliteCounter;

                // Save action to governance satellite ledger
                s.governanceSatelliteActionLedger[actionId] := newGovernanceSatelliteAction;

                // Create snapshot in governanceSatelliteSnapshotLedger (to be filled with satellite's total voting power at this snapshot)
                const emptyGovernanceSatelliteActionSnapshotMap  : governanceSatelliteSnapshotMapType     = map [];
                s.governanceSatelliteSnapshotLedger[actionId] := emptyGovernanceSatelliteActionSnapshotMap;

                // Increment governance satellite counter
                s.governanceSatelliteCounter := actionId + 1n;

                // ------------------------------------------------------------------
                // Satellite Snapshot
                // ------------------------------------------------------------------

                // Get map of active satellites from the Delegation Contract
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites : map(address, satelliteRecordType) = case activeSatellitesView of [
                        Some (value) -> value
                    |   None         -> failwith (error_GET_ACTIVE_SATELLITES_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                for satelliteAddress -> satellite in map activeSatellites block {

                    const satelliteSnapshot : actionSatelliteSnapshotType = record [
                        satelliteAddress      = satelliteAddress;
                        actionId              = actionId;
                        stakedMvkBalance      = satellite.stakedMvkBalance;
                        totalDelegatedAmount  = satellite.totalDelegatedAmount;
                    ];

                    s := setSatelliteSnapshot(satelliteSnapshot, delegationRatio, s);

                }; 

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
    // 7. Take snapshot of current active satellites' total voting power and update governanceSatelliteSnapshotLedger
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        |   LambdaRemoveOracleInAggregator(removeOracleInAggregatorParams) -> {

                // init params
                const oracleAddress        : address = removeOracleInAggregatorParams.oracleAddress;
                const aggregatorAddress    : address = removeOracleInAggregatorParams.aggregatorAddress;
                const purpose              : string  = removeOracleInAggregatorParams.purpose;

                // Validate inputs
                if String.length(purpose)    > s.config.governancePurposeMaxLength    then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // ------------------------------------------------------------------
                // Get necessary contracts and info
                // ------------------------------------------------------------------

                // Get Doorman Contract address from the General Contracts Map on the Governance Contract
                const doormanAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress : address = case doormanAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get Delegation Contract address from the General Contracts Map on the Governance Contract
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress : address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
                const configView : option(delegationConfigType)  = Tezos.call_view ("getConfig", unit, delegationAddress);
                const delegationRatio : nat                     = case configView of [
                        Some (_optionConfig) -> _optionConfig.delegationRatio
                    |   None -> failwith (error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Get / Check Satellite Records
                // ------------------------------------------------------------------

                // Get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.get_sender(), delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                                Some (_satellite) -> if _satellite.status = "SUSPENDED" then failwith(error_SATELLITE_SUSPENDED) else if _satellite.status = "BANNED" then failwith(error_SATELLITE_BANNED) else skip
                            |   None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
                        ]
                    |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Check if address given for specified oracle is valid
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", oracleAddress, delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                                Some (_satellite) -> skip
                            |   None              -> failwith(error_SATELLITE_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Snapshot Staked MVK Total Supply
                // ------------------------------------------------------------------

                // Take snapshot of current total staked MVK supply 
                const getBalanceView : option (nat) = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply : nat = case getBalanceView of [
                        Some (value) -> value
                    |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Calculate staked MVK votes required for approval based on config's approval percentage
                const stakedMvkRequiredForApproval : nat     = abs((snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                // ------------------------------------------------------------------
                // Create new Governance Satellite Action
                // ------------------------------------------------------------------

                // init empty voters map
                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                // init maps
                const addressMap        : addressMapType     = map [
                    ("oracleAddress"     : string)   -> oracleAddress;
                    ("aggregatorAddress" : string)   -> aggregatorAddress;
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];
                const emptyTransferList : transferActionType = list [];

                // Create new governance satellite action record
                var newGovernanceSatelliteAction : governanceSatelliteActionRecordType := record [

                    initiator                          = Tezos.get_sender();
                    status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                    executed                           = False;

                    governanceType                     = "REMOVE_ORACLE_IN_AGGREGATOR";
                    governancePurpose                  = purpose;
                    voters                             = emptyVotersMap;

                    addressMap                         = addressMap;
                    stringMap                          = emptyStringMap;
                    natMap                             = emptyNatMap;

                    transferList                       = emptyTransferList;

                    yayVoteStakedMvkTotal              = 0n;
                    nayVoteStakedMvkTotal              = 0n;
                    passVoteStakedMvkTotal             = 0n;

                    snapshotStakedMvkTotalSupply       = snapshotStakedMvkTotalSupply;
                    stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                    stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                    startDateTime                      = Tezos.get_now();            
                    expiryDateTime                     = Tezos.get_now() + (86_400 * s.config.governanceSatelliteDurationInDays);

                ];

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Get current action counter
                const actionId : nat = s.governanceSatelliteCounter;

                // Save action to governance satellite ledger
                s.governanceSatelliteActionLedger[actionId] := newGovernanceSatelliteAction;

                // Create snapshot in governanceSatelliteSnapshotLedger (to be filled with satellite's total voting power at this snapshot)
                const emptyGovernanceSatelliteActionSnapshotMap  : governanceSatelliteSnapshotMapType     = map [];
                s.governanceSatelliteSnapshotLedger[actionId] := emptyGovernanceSatelliteActionSnapshotMap;

                // Increment governance satellite counter
                s.governanceSatelliteCounter := actionId + 1n;

                // ------------------------------------------------------------------
                // Satellite Snapshot
                // ------------------------------------------------------------------

                // Get map of active satellites from the Delegation Contract
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites : map(address, satelliteRecordType) = case activeSatellitesView of [
                        Some (value) -> value
                    |   None         -> failwith (error_GET_ACTIVE_SATELLITES_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                for satelliteAddress -> satellite in map activeSatellites block {

                    const satelliteSnapshot : actionSatelliteSnapshotType = record [
                        satelliteAddress      = satelliteAddress;
                        actionId              = actionId;
                        stakedMvkBalance      = satellite.stakedMvkBalance;
                        totalDelegatedAmount  = satellite.totalDelegatedAmount;
                    ];

                    s := setSatelliteSnapshot(satelliteSnapshot, delegationRatio, s);

                }; 

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

(*  setAggregatorMaintainer lambda *)
function lambdaSetAggregatorMaintainer(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that no tez is sent to the entrypoint
    // 2. Get necessary contracts and config info
    //      -   Get Doorman Contract address from the General Contracts Map on the Governance Contract
    //      -   Get Delegation Contract address from the General Contracts Map on the Governance Contract
    //      -   Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
    // 3. Get / Check Satellite Records
    //      -   Get satellite record for initiator
    // 4. Take snapshot of current total staked MVK supply 
    // 5. Calculate staked MVK votes required for approval based on config's financial request approval percentage
    // 6. Create new governance satellite action record - "SET_AGGREGATOR_MAINTAINER"
    // 6. Update storage with new records 
    // 7. Take snapshot of current active satellites' total voting power and update governanceSatelliteSnapshotLedger
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        |   LambdaSetAggregatorMaintainer(setAggregatorMaintainerParams) -> {

                // init params
                const aggregatorAddress    : address  = setAggregatorMaintainerParams.aggregatorAddress;
                const maintainerAddress    : address  = setAggregatorMaintainerParams.maintainerAddress;
                const purpose              : string   = setAggregatorMaintainerParams.purpose;

                // Validate inputs
                if String.length(purpose)    > s.config.governancePurposeMaxLength    then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // ------------------------------------------------------------------
                // Get necessary contracts and info
                // ------------------------------------------------------------------

                // Get Doorman Contract address from the General Contracts Map on the Governance Contract
                const doormanAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress : address = case doormanAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get Delegation Contract address from the General Contracts Map on the Governance Contract
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress : address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
                const configView : option(delegationConfigType)  = Tezos.call_view ("getConfig", unit, delegationAddress);
                const delegationRatio : nat                     = case configView of [
                        Some (_optionConfig) -> _optionConfig.delegationRatio
                    |   None                 -> failwith (error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Get / Check Satellite Records
                // ------------------------------------------------------------------

                // Get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.get_sender(), delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                                Some (_satellite) -> if _satellite.status = "SUSPENDED" then failwith(error_SATELLITE_SUSPENDED) else if _satellite.status = "BANNED" then failwith(error_SATELLITE_BANNED) else skip
                            |   None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
                        ]
                    |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Snapshot Staked MVK Total Supply
                // ------------------------------------------------------------------

                // Take snapshot of current total staked MVK supply 
                const getBalanceView : option (nat) = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply : nat = case getBalanceView of [
                        Some (value) -> value
                    |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Calculate staked MVK votes required for approval based on config's approval percentage
                const stakedMvkRequiredForApproval : nat     = abs((snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                // ------------------------------------------------------------------
                // Create new Governance Satellite Action
                // ------------------------------------------------------------------

                // init empty voters map
                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                // init maps
                const addressMap        : addressMapType     = map [
                    ("aggregatorAddress" : string)   -> aggregatorAddress;
                    ("maintainerAddress" : string)   -> maintainerAddress;
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];
                const emptyTransferList : transferActionType = list [];

                // Create new governance satellite action record
                var newGovernanceSatelliteAction : governanceSatelliteActionRecordType := record [

                    initiator                          = Tezos.get_sender();
                    status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                    executed                           = False;

                    governanceType                     = "SET_AGGREGATOR_MAINTAINER";
                    governancePurpose                  = purpose;
                    voters                             = emptyVotersMap;

                    addressMap                         = addressMap;
                    stringMap                          = emptyStringMap;
                    natMap                             = emptyNatMap;

                    transferList                       = emptyTransferList;

                    yayVoteStakedMvkTotal              = 0n;
                    nayVoteStakedMvkTotal              = 0n;
                    passVoteStakedMvkTotal             = 0n;

                    snapshotStakedMvkTotalSupply       = snapshotStakedMvkTotalSupply;
                    stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                    stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                    startDateTime                      = Tezos.get_now();            
                    expiryDateTime                     = Tezos.get_now() + (86_400 * s.config.governanceSatelliteDurationInDays);

                ];

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Get current action counter
                const actionId : nat = s.governanceSatelliteCounter;

                // Save action to governance satellite ledger
                s.governanceSatelliteActionLedger[actionId] := newGovernanceSatelliteAction;

                // Create snapshot in governanceSatelliteSnapshotLedger (to be filled with satellite's total voting power at this snapshot)
                const emptyGovernanceSatelliteActionSnapshotMap  : governanceSatelliteSnapshotMapType     = map [];
                s.governanceSatelliteSnapshotLedger[actionId] := emptyGovernanceSatelliteActionSnapshotMap;

                // Increment governance satellite counter
                s.governanceSatelliteCounter := actionId + 1n;

                // ------------------------------------------------------------------
                // Satellite Snapshot
                // ------------------------------------------------------------------

                // Get map of active satellites from the Delegation Contract
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites : map(address, satelliteRecordType) = case activeSatellitesView of [
                        Some (value) -> value
                    |   None         -> failwith (error_GET_ACTIVE_SATELLITES_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                for satelliteAddress -> satellite in map activeSatellites block {

                    const satelliteSnapshot : actionSatelliteSnapshotType = record [
                        satelliteAddress      = satelliteAddress;
                        actionId              = actionId;
                        stakedMvkBalance      = satellite.stakedMvkBalance;
                        totalDelegatedAmount  = satellite.totalDelegatedAmount;
                    ];

                    s := setSatelliteSnapshot(satelliteSnapshot, delegationRatio, s);

                }; 

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  registerAggregator lambda *)
function lambdaRegisterAggregator(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
block {

    // Steps Overview:    
    // 1. Standard Checks
    //      -   Check that no tez is sent to the entrypoint
    //      -   Check that sender is admin or is whitelisted
    // 2. Check if Aggregator record already exists in storage ledger
    // 3. Create new Aggregator Record
    // 4. Update Aggregator ledger storage
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount

    // Check sender is admin or is whitelisted
    if Tezos.get_sender() = s.admin or checkInWhitelistContracts(Tezos.get_sender(), s.whitelistContracts) then skip else failwith(error_ONLY_ADMINISTRATOR_OR_WHITELISTED_ADDRESSES_ALLOWED);
    
    case governanceSatelliteLambdaAction of [
        |   LambdaRegisterAggregator(registerAggregatorParams) -> {
                
                // init params
                const aggregatorAddress    : address          = registerAggregatorParams.aggregatorAddress;
                const aggregatorPair       : string * string  = registerAggregatorParams.aggregatorPair;

                // Check if Aggregator record already exists in storage ledger
                case s.aggregatorLedger[aggregatorAddress] of [
                        Some(_v) -> failwith(error_AGGREGATOR_CONTRACT_EXISTS)
                    |   None     -> skip
                ];

                // Create new Aggregator record
                const emptyOracleSet : set(address) = set[];
                const aggregatorRecord : aggregatorRecordType = record [
                    aggregatorPair    = aggregatorPair;
                    status            = "ACTIVE";
                    createdTimestamp  = Tezos.get_now();
                    oracles           = emptyOracleSet;
                ];

                // Update Aggregator ledger storage
                s.aggregatorLedger[aggregatorAddress] := aggregatorRecord;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateAggregatorStatus lambda *)
function lambdaUpdateAggregatorStatus(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is
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
    // 7. Take snapshot of current active satellites' total voting power and update governanceSatelliteSnapshotLedger
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        |   LambdaUpdateAggregatorStatus(updateAggregatorStatusParams) -> {
                
                // init params
                const aggregatorAddress    : address = updateAggregatorStatusParams.aggregatorAddress;
                const status               : string  = updateAggregatorStatusParams.status;
                const purpose              : string  = updateAggregatorStatusParams.purpose;

                // Validate inputs
                if String.length(purpose)    > s.config.governancePurposeMaxLength    then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // ------------------------------------------------------------------
                // Get necessary contracts and info
                // ------------------------------------------------------------------

                // Get Doorman Contract address from the General Contracts Map on the Governance Contract
                const doormanAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress : address = case doormanAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get Delegation Contract address from the General Contracts Map on the Governance Contract
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress : address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get delegation ratio (i.e. voting power ratio) from Delegation Contract Config
                const configView : option(delegationConfigType)  = Tezos.call_view ("getConfig", unit, delegationAddress);
                const delegationRatio : nat                     = case configView of [
                        Some (_optionConfig) -> _optionConfig.delegationRatio
                    |   None -> failwith (error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Get / Check Satellite Records
                // ------------------------------------------------------------------

                // Get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.get_sender(), delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                                Some (_satellite) -> if _satellite.status = "SUSPENDED" then failwith(error_SATELLITE_SUSPENDED) else if _satellite.status = "BANNED" then failwith(error_SATELLITE_BANNED) else skip
                            |   None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
                        ]
                    |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Snapshot Staked MVK Total Supply
                // ------------------------------------------------------------------

                // Take snapshot of current total staked MVK supply 
                const getBalanceView : option (nat) = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply : nat = case getBalanceView of [
                        Some (value) -> value
                    |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // Calculate staked MVK votes required for approval based on config's approval percentage
                const stakedMvkRequiredForApproval : nat     = abs((snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                // ------------------------------------------------------------------
                // Create new Governance Satellite Action
                // ------------------------------------------------------------------

                // init empty voters map
                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                // init maps
                const addressMap        : addressMapType     = map [
                    ("aggregatorAddress" : string)   -> aggregatorAddress;
                ];
                const stringMap    : stringMapType      = map [
                    ("status" : string)              -> status
                ];
                const emptyNatMap       : natMapType         = map [];
                const emptyTransferList : transferActionType = list [];

                // Create new governance satellite action record
                var newGovernanceSatelliteAction : governanceSatelliteActionRecordType := record [

                    initiator                          = Tezos.get_sender();
                    status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                    executed                           = False;

                    governanceType                     = "UPDATE_AGGREGATOR_STATUS";
                    governancePurpose                  = purpose;
                    voters                             = emptyVotersMap;

                    addressMap                         = addressMap;
                    stringMap                          = stringMap;
                    natMap                             = emptyNatMap;
                    
                    transferList                       = emptyTransferList;

                    yayVoteStakedMvkTotal              = 0n;
                    nayVoteStakedMvkTotal              = 0n;
                    passVoteStakedMvkTotal             = 0n;

                    snapshotStakedMvkTotalSupply       = snapshotStakedMvkTotalSupply;
                    stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                    stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                    startDateTime                      = Tezos.get_now();            
                    expiryDateTime                     = Tezos.get_now() + (86_400 * s.config.governanceSatelliteDurationInDays);

                ];

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Get current action counter
                const actionId : nat = s.governanceSatelliteCounter;

                // Save action to governance satellite ledger
                s.governanceSatelliteActionLedger[actionId] := newGovernanceSatelliteAction;

                // Create snapshot in governanceSatelliteSnapshotLedger (to be filled with satellite's total voting power at this snapshot)
                const emptyGovernanceSatelliteActionSnapshotMap  : governanceSatelliteSnapshotMapType     = map [];
                s.governanceSatelliteSnapshotLedger[actionId] := emptyGovernanceSatelliteActionSnapshotMap;

                // Increment governance satellite counter
                s.governanceSatelliteCounter := actionId + 1n;

                // ------------------------------------------------------------------
                // Satellite Snapshot
                // ------------------------------------------------------------------

                // Get map of active satellites from the Delegation Contract
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites : map(address, satelliteRecordType) = case activeSatellitesView of [
                        Some (value) -> value
                    |   None         -> failwith (error_GET_ACTIVE_SATELLITES_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                for satelliteAddress -> satellite in map activeSatellites block {

                    const satelliteSnapshot : actionSatelliteSnapshotType = record [
                        satelliteAddress      = satelliteAddress;
                        actionId              = actionId;
                        stakedMvkBalance      = satellite.stakedMvkBalance;
                        totalDelegatedAmount  = satellite.totalDelegatedAmount;
                    ];

                    s := setSatelliteSnapshot(satelliteSnapshot, delegationRatio, s);

                }; 

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
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        | LambdaFixMistakenTransfer(fixMistakenTransferParams) -> {
                
                // init params
                const targetContractAddress    : address                = fixMistakenTransferParams.targetContractAddress;
                const transferList             : transferActionType     = fixMistakenTransferParams.transferList;
                const purpose                  : string                 = fixMistakenTransferParams.purpose;

                // Validate inputs
                if String.length(purpose)    > s.config.governancePurposeMaxLength    then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // get delegation address
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress: address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // get voting power ratio
                const configView: option(delegationConfigType)  = Tezos.call_view ("getConfig", unit, delegationAddress);
                const votingPowerRatio: nat                     = case configView of [
                        Some (_optionConfig) -> _optionConfig.delegationRatio
                    |   None -> failwith (error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.get_sender(), delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> if _satellite.status = "SUSPENDED" then failwith(error_SATELLITE_SUSPENDED) else if _satellite.status = "BANNED" then failwith(error_SATELLITE_BANNED) else skip
                        | None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
                      ]
                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                const emptyVotersMap  : governanceSatelliteVotersMapType    = map [];
                const addressMap      : addressMapType     = map [
                    ("targetContractAddress" : string)   -> targetContractAddress;
                ];
                const emptyStringMap  : stringMapType                       = map [];
                const emptyNatMap     : natMapType                          = map [];

                // get doorman contract address
                const doormanAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress: address = case doormanAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // get staked MVK total supply
                const getBalanceView : option (nat) = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply : nat = case getBalanceView of [
                      Some (value) -> value
                    | None -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                const stakedMvkRequiredForApproval: nat = abs((snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                var newGovernanceSatelliteAction : governanceSatelliteActionRecordType := record [

                        initiator                          = Tezos.get_sender();
                        status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                        executed                           = False;

                        governanceType                     = "MISTAKEN_TRANSFER_FIX";
                        governancePurpose                  = purpose;
                        voters                             = emptyVotersMap;

                        addressMap                         = addressMap;
                        stringMap                          = emptyStringMap;
                        natMap                             = emptyNatMap;

                        transferList                       = transferList;

                        yayVoteStakedMvkTotal              = 0n;
                        nayVoteStakedMvkTotal              = 0n;
                        passVoteStakedMvkTotal             = 0n;

                        snapshotStakedMvkTotalSupply       = snapshotStakedMvkTotalSupply;
                        stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                        startDateTime                      = Tezos.get_now();            
                        expiryDateTime                     = Tezos.get_now() + (86_400 * s.config.governanceSatelliteDurationInDays);
                    ];

                const actionId : nat = s.governanceSatelliteCounter;

                // save action to governance satellite ledger
                s.governanceSatelliteActionLedger[actionId] := newGovernanceSatelliteAction;

                // increment governance satellite counter
                s.governanceSatelliteCounter := actionId + 1n;

                // create snapshot in governanceSatelliteSnapshotLedger (to be filled with satellite's )
                const emptyGovernanceSatelliteActionSnapshotMap  : governanceSatelliteSnapshotMapType     = map [];
                s.governanceSatelliteSnapshotLedger[actionId] := emptyGovernanceSatelliteActionSnapshotMap;

                // loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites: map(address, satelliteRecordType) = case activeSatellitesView of [
                      Some (value) -> value
                    | None -> failwith (error_GET_ACTIVE_SATELLITES_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                for satelliteAddress -> satellite in map activeSatellites block {
                    const satelliteSnapshot : actionSatelliteSnapshotType = record [
                        satelliteAddress      = satelliteAddress;
                        actionId              = actionId;
                        stakedMvkBalance      = satellite.stakedMvkBalance;
                        totalDelegatedAmount  = satellite.totalDelegatedAmount;
                    ];

                    s := setSatelliteSnapshot(satelliteSnapshot, votingPowerRatio, s);
                }; 

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

    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        |   LambdaDropAction(dropActionParams) -> {
                
                // init params
                const dropActionId     : nat     = dropActionParams.dropActionId;

                // Get Delegation Contract address from the General Contracts Map on the Governance Contract
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress : address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.get_sender(), delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                                Some (_satellite) -> if _satellite.status = "SUSPENDED" then failwith(error_SATELLITE_SUSPENDED) else if _satellite.status = "BANNED" then failwith(error_SATELLITE_BANNED) else skip
                            |   None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
                        ]
                    |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Get governance satellite action record 
                var governanceSatelliteActionRecord : governanceSatelliteActionRecordType := case s.governanceSatelliteActionLedger[dropActionId] of [
                        Some(_request) -> _request
                    |   None           -> failwith(error_GOVERNANCE_SATELLITE_ACTION_NOT_FOUND)
                ];

                // Check that sender is the initiator of the governance satellite action
                if Tezos.get_sender() =/= governanceSatelliteActionRecord.initiator then failwith(error_ONLY_INITIATOR_CAN_DROP_ACTION) else skip;

                // Check that governance satellite action record has not been dropped already
                if governanceSatelliteActionRecord.status = False then failwith(error_GOVERNANCE_SATELLITE_ACTION_DROPPED) else skip;

                // Check that governance satellite action record has not been executed
                if governanceSatelliteActionRecord.executed then failwith(error_GOVERNANCE_SATELLITE_ACTION_EXECUTED) else skip;

                // Check that governance satellite action record has not expired
                if Tezos.get_now() > governanceSatelliteActionRecord.expiryDateTime then failwith(error_GOVERNANCE_SATELLITE_ACTION_EXPIRED) else skip;

                // Drop governance satellite action record  - update status to false
                governanceSatelliteActionRecord.status := False;

                // Update storage - action ledger
                s.governanceSatelliteActionLedger[dropActionId] := governanceSatelliteActionRecord;

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
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    var operations : list(operation) := nil;

    case governanceSatelliteLambdaAction of [
        |   LambdaVoteForAction(voteForAction) -> {

                // init params
                const actionId : nat = voteForAction.actionId;
                
                // Get Delegation Contract address from the General Contracts Map on the Governance Contract
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress : address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get satellite record of sender
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.get_sender(), delegationAddress);
                case satelliteOptView of [
                        Some (value) -> case value of [
                                Some (_satellite) -> if _satellite.status = "SUSPENDED" then failwith(error_SATELLITE_SUSPENDED) else if _satellite.status = "BANNED" then failwith(error_SATELLITE_BANNED) else skip
                            |   None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_VOTE_FOR_GOVERNANCE_ACTION)
                        ]
                    |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // Get governance satellite action record
                var _governanceSatelliteActionRecord : governanceSatelliteActionRecordType := case s.governanceSatelliteActionLedger[actionId] of [
                        Some(_request) -> _request
                    |   None           -> failwith(error_GOVERNANCE_SATELLITE_ACTION_NOT_FOUND)
                ];

                // ------------------------------------------------------------------
                // Validation Checks
                // ------------------------------------------------------------------

                // Check if governance satellite action has been dropeed
                if _governanceSatelliteActionRecord.status    = False then failwith(error_GOVERNANCE_SATELLITE_ACTION_DROPPED)  else skip;

                // Check if governance satellite action has already been executed
                if _governanceSatelliteActionRecord.executed  = True  then failwith(error_GOVERNANCE_SATELLITE_ACTION_EXECUTED) else skip;

                // Check if governance satellite action has expired
                if Tezos.get_now() > _governanceSatelliteActionRecord.expiryDateTime then failwith(error_GOVERNANCE_SATELLITE_ACTION_EXPIRED) else skip;

                // ------------------------------------------------------------------
                // Get snapshot of satellite voting power
                // ------------------------------------------------------------------

                // Get governance satellite action snapshot (of all active satellites and their voting power)
                const governanceSatelliteActionSnapshot : governanceSatelliteSnapshotMapType = case s.governanceSatelliteSnapshotLedger[actionId] of [
                        Some(_snapshot) -> _snapshot
                    |   None            -> failwith(error_GOVERNANCE_SATELLITE_ACTION_SNAPSHOT_NOT_FOUND)
                ]; 

                // Get satellite's snapshot record stored in financial request snapshot
                const satelliteSnapshotRecord : satelliteSnapshotRecordType = case governanceSatelliteActionSnapshot[Tezos.get_sender()] of [ 
                        Some(_record) -> _record
                    |   None          -> failwith(error_SATELLITE_NOT_FOUND_IN_ACTION_SNAPSHOT)
                ];

                // ------------------------------------------------------------------
                // Compute vote
                // ------------------------------------------------------------------

                // Save and update satellite's vote record
                const voteType         : voteType   = voteForAction.vote;
                const totalVotingPower : nat                                 = satelliteSnapshotRecord.totalVotingPower;

                // Remove previous vote if user already voted
                case _governanceSatelliteActionRecord.voters[Tezos.get_sender()] of [
                    
                        Some (_voteRecord) -> case _voteRecord.vote of [

                                Yay(_v)   ->    if _voteRecord.totalVotingPower > _governanceSatelliteActionRecord.yayVoteStakedMvkTotal 
                                                then failwith(error_CALCULATION_ERROR) 
                                                else _governanceSatelliteActionRecord.yayVoteStakedMvkTotal := abs(_governanceSatelliteActionRecord.yayVoteStakedMvkTotal - _voteRecord.totalVotingPower)

                            |   Nay(_v)   ->    if _voteRecord.totalVotingPower > _governanceSatelliteActionRecord.nayVoteStakedMvkTotal 
                                                then failwith(error_CALCULATION_ERROR) 
                                                else _governanceSatelliteActionRecord.nayVoteStakedMvkTotal := abs(_governanceSatelliteActionRecord.nayVoteStakedMvkTotal - _voteRecord.totalVotingPower)

                            |   Pass(_v)  ->    if _voteRecord.totalVotingPower > _governanceSatelliteActionRecord.passVoteStakedMvkTotal 
                                                then failwith(error_CALCULATION_ERROR) 
                                                else _governanceSatelliteActionRecord.passVoteStakedMvkTotal := abs(_governanceSatelliteActionRecord.passVoteStakedMvkTotal - _voteRecord.totalVotingPower)
                        ]

                    |   None -> skip
                ];

                // init new vote record
                const newVoteRecord : governanceSatelliteVoteType     = record [
                    vote             = voteType;
                    totalVotingPower = totalVotingPower;
                    timeVoted        = Tezos.get_now();
                ];

                // Update governance satellite action map of voters with new vote
                _governanceSatelliteActionRecord.voters[Tezos.get_sender()] := newVoteRecord;
                
                // Compute governance satellite action vote totals and execute governance satellite action if enough votes have been gathered
                case voteType of [

                    Yay(_v) -> block {

                        // Compute new YAY vote total
                        const newYayVoteStakedMvkTotal : nat = _governanceSatelliteActionRecord.yayVoteStakedMvkTotal + totalVotingPower;

                        // Update governance satellite action with new vote total
                        _governanceSatelliteActionRecord.yayVoteStakedMvkTotal  := newYayVoteStakedMvkTotal;
                        s.governanceSatelliteActionLedger[actionId]             := _governanceSatelliteActionRecord;

                        // Execute governance satellite action if total yay votes exceed staked MVK required for approval
                        if newYayVoteStakedMvkTotal > _governanceSatelliteActionRecord.stakedMvkRequiredForApproval then block {

                                // Governance: Suspend Satellite
                                if _governanceSatelliteActionRecord.governanceType = "SUSPEND" then block {

                                    // Get address of satellite to be suspended from governance satellite action record address map
                                    const satelliteToBeSuspended : address = case _governanceSatelliteActionRecord.addressMap["satelliteToBeSuspended"] of [
                                            Some(_address) -> _address
                                        |   None           -> failwith(error_SATELLITE_NOT_FOUND)
                                    ];

                                    // Create operation to update satellite status in Delegation Contract
                                    const updateSatelliteStatusParams : updateSatelliteStatusParamsType = record [
                                        satelliteAddress = satelliteToBeSuspended;
                                        newStatus        = "SUSPENDED";
                                    ];

                                    const updateSatelliteStatusOperation : operation = Tezos.transaction(
                                        updateSatelliteStatusParams,
                                        0tez,
                                        getUpdateSatelliteStatusInDelegationEntrypoint(delegationAddress)
                                    );

                                    operations := updateSatelliteStatusOperation # operations;

                                    // if satellite has oracles, create operations to remove satellite oracles from aggregators
                                    operations := case s.satelliteOracleLedger[satelliteToBeSuspended] of [
                                            Some(_record) -> block {

                                                for aggregatorAddress -> _aggregatorRecord in map _record.aggregatorPairs {

                                                    const removeOracleInAggregatorOperation : operation = Tezos.transaction(
                                                        satelliteToBeSuspended, 
                                                        0tez, 
                                                        getRemoveOracleInAggregatorEntrypoint(aggregatorAddress)
                                                    );

                                                    operations := removeOracleInAggregatorOperation # operations;
                                                };                  

                                            } with operations
                                        |   None -> operations
                                    ];

                                } else skip;



                                // Governance: Unsuspend Satellite
                                if _governanceSatelliteActionRecord.governanceType = "UNSUSPEND" then block {

                                    // Get address of satellite to be unsuspended from governance satellite action record address map
                                    const satelliteToBeUnsuspended : address = case _governanceSatelliteActionRecord.addressMap["satelliteToBeUnsuspended"] of [
                                            Some(_address) -> _address
                                        |   None           -> failwith(error_SATELLITE_NOT_FOUND)
                                    ];

                                    // Create operation to update satellite status in Delegation Contract
                                    const updateSatelliteStatusParams : updateSatelliteStatusParamsType = record [
                                        satelliteAddress = satelliteToBeUnsuspended;
                                        newStatus        = "ACTIVE";
                                    ];

                                    const updateSatelliteStatusOperation : operation = Tezos.transaction(
                                        updateSatelliteStatusParams,
                                        0tez,
                                        getUpdateSatelliteStatusInDelegationEntrypoint(delegationAddress)
                                    );

                                    operations := updateSatelliteStatusOperation # operations;

                                    // if satellite has oracles, create operations to add satellite oracles to aggregators
                                    operations := case s.satelliteOracleLedger[satelliteToBeUnsuspended] of [
                                            Some(_record) -> block {

                                                for aggregatorAddress -> _aggregatorRecord in map _record.aggregatorPairs {

                                                    const addOracleToAggregatorOperation : operation = Tezos.transaction(
                                                        satelliteToBeUnsuspended, 
                                                        0tez, 
                                                        getAddOracleInAggregatorEntrypoint(aggregatorAddress)
                                                    );

                                                    operations := addOracleToAggregatorOperation # operations;
                                                };                  

                                            } with operations
                                        |   None -> operations
                                    ];

                                } else skip;



                                // Governance: Ban Satellite
                                if _governanceSatelliteActionRecord.governanceType = "BAN" then block {

                                    // Get address of satellite to be banned from governance satellite action record address map
                                    const satelliteToBeBanned : address = case _governanceSatelliteActionRecord.addressMap["satelliteToBeBanned"] of [
                                            Some(_address) -> _address
                                        |   None           -> failwith(error_SATELLITE_NOT_FOUND)
                                    ];

                                    // Create operation to update satellite status in Delegation Contract
                                    const updateSatelliteStatusParams : updateSatelliteStatusParamsType = record [
                                        satelliteAddress = satelliteToBeBanned;
                                        newStatus        = "BANNED";
                                    ];

                                    const updateSatelliteStatusOperation : operation = Tezos.transaction(
                                        updateSatelliteStatusParams,
                                        0tez,
                                        getUpdateSatelliteStatusInDelegationEntrypoint(delegationAddress)
                                    );

                                    operations := updateSatelliteStatusOperation # operations;

                                    // if satellite has oracles, create operations to remove satellite oracles from aggregators
                                    operations := case s.satelliteOracleLedger[satelliteToBeBanned] of [
                                            Some(_record) -> block {

                                                for aggregatorAddress -> _aggregatorRecord in map _record.aggregatorPairs {

                                                    const removeOracleInAggregatorOperation : operation = Tezos.transaction(
                                                        satelliteToBeBanned, 
                                                        0tez, 
                                                        getRemoveOracleInAggregatorEntrypoint(aggregatorAddress)
                                                    );

                                                    operations := removeOracleInAggregatorOperation # operations;
                                                };                  

                                            } with operations
                                        |   None -> operations
                                    ];

                                } else skip;



                                // Governance: Unban Satellite
                                if _governanceSatelliteActionRecord.governanceType = "UNBAN" then block {

                                    // Get address of satellite to be unbanned from governance satellite action record address map
                                    const satelliteToBeUnbanned : address = case _governanceSatelliteActionRecord.addressMap["satelliteToBeUnbanned"] of [
                                            Some(_address) -> _address
                                        |   None           -> failwith(error_SATELLITE_NOT_FOUND)
                                    ];

                                    // Create operation to update satellite status in Delegation Contract
                                    const updateSatelliteStatusParams : updateSatelliteStatusParamsType = record [
                                        satelliteAddress = satelliteToBeUnbanned;
                                        newStatus        = "ACTIVE";
                                    ];

                                    const updateSatelliteStatusOperation : operation = Tezos.transaction(
                                        updateSatelliteStatusParams,
                                        0tez,
                                        getUpdateSatelliteStatusInDelegationEntrypoint(delegationAddress)
                                    );

                                    operations := updateSatelliteStatusOperation # operations;

                                    // if satellite has oracles, create operations to add satellite oracles to aggregators
                                    operations := case s.satelliteOracleLedger[satelliteToBeUnbanned] of [
                                            Some(_record) -> block {

                                                for aggregatorAddress -> _aggregatorRecord in map _record.aggregatorPairs {

                                                    const addOracleToAggregatorOperation : operation = Tezos.transaction(
                                                        satelliteToBeUnbanned, 
                                                        0tez, 
                                                        getAddOracleInAggregatorEntrypoint(aggregatorAddress)
                                                    );

                                                    operations := addOracleToAggregatorOperation # operations;
                                                };                  

                                            } with operations
                                        |   None -> operations
                                    ];
                                
                                } else skip;



                                // Governance: Add Oracle To Aggregator
                                if _governanceSatelliteActionRecord.governanceType = "ADD_ORACLE_TO_AGGREGATOR" then block {

                                    // Get oracle address from governance satellite action record address map
                                    const oracleAddress : address = case _governanceSatelliteActionRecord.addressMap["oracleAddress"] of [
                                            Some(_address) -> _address
                                        |   None            -> failwith(error_ORACLE_NOT_FOUND)
                                    ];

                                    // Get aggregator address from governance satellite action record address map
                                    const aggregatorAddress : address = case _governanceSatelliteActionRecord.addressMap["aggregatorAddress"] of [
                                            Some(_address) -> _address
                                        |   None           -> failwith(error_AGGREGATOR_CONTRACT_NOT_FOUND)
                                    ];

                                    // Get aggregator record and add satellite to oracles set
                                    var aggregatorRecord : aggregatorRecordType := case s.aggregatorLedger[aggregatorAddress] of [
                                            Some(_record) -> _record
                                        |   None          -> failwith(error_AGGREGATOR_RECORD_IN_GOVERNANCE_SATELLITE_NOT_FOUND)
                                    ];
                                    aggregatorRecord.oracles := Set.add(oracleAddress, aggregatorRecord.oracles);

                                    // Get or create satellite oracle record
                                    var satelliteOracleRecord : satelliteOracleRecordType := case s.satelliteOracleLedger[oracleAddress] of [
                                            Some(_record) -> _record
                                        |   None -> record [
                                                aggregatorsSubscribed = 0n;
                                                aggregatorPairs       = (map[] : aggregatorPairsMapType);
                                            ]
                                    ];

                                    // Update satellite oracle record with new aggregator
                                    satelliteOracleRecord.aggregatorsSubscribed  := satelliteOracleRecord.aggregatorsSubscribed + 1n;
                                    satelliteOracleRecord.aggregatorPairs[aggregatorAddress] := record [
                                        aggregatorPair      = aggregatorRecord.aggregatorPair;
                                        aggregatorAddress   = aggregatorAddress;
                                        startDateTime       = Tezos.get_now();
                                    ];

                                    // Update storage
                                    s.satelliteOracleLedger[oracleAddress] := satelliteOracleRecord;
                                    s.aggregatorLedger[aggregatorAddress]  := aggregatorRecord;

                                    // Create operation to add oracle to aggregator
                                    const addOracleInAggregatorOperation : operation = Tezos.transaction(
                                        oracleAddress, 
                                        0tez, 
                                        getAddOracleInAggregatorEntrypoint(aggregatorAddress)
                                    );

                                    operations := addOracleInAggregatorOperation # operations;

                                } else skip;



                                // Governance: Remove Oracle In Aggregator
                                if _governanceSatelliteActionRecord.governanceType = "REMOVE_ORACLE_IN_AGGREGATOR" then block {

                                    // Get oracle address from governance satellite action record address map
                                    const oracleAddress : address = case _governanceSatelliteActionRecord.addressMap["oracleAddress"] of [
                                            Some(_address) -> _address
                                        |   None           -> failwith(error_ORACLE_NOT_FOUND)
                                    ];

                                    // Get aggregator address from governance satellite action record address map
                                    const aggregatorAddress : address = case _governanceSatelliteActionRecord.addressMap["aggregatorAddress"] of [
                                            Some(_address) -> _address
                                        |   None           -> failwith(error_AGGREGATOR_CONTRACT_NOT_FOUND)
                                    ];
                                
                                    const removeOracleInAggregatorOperation : operation = Tezos.transaction(
                                        oracleAddress, 
                                        0tez, 
                                        getRemoveOracleInAggregatorEntrypoint(aggregatorAddress)
                                    );

                                    operations := removeOracleInAggregatorOperation # operations;

                                    // Get satellite oracle record
                                    var satelliteOracleRecord : satelliteOracleRecordType := case s.satelliteOracleLedger[oracleAddress] of [
                                            Some(_record) -> _record
                                        |   None          -> failwith(error_SATELLITE_ORACLE_RECORD_NOT_FOUND)
                                    ];
                                    
                                    // check that number of aggregators subscribed is not zero, before subtracting
                                    if satelliteOracleRecord.aggregatorsSubscribed < 1n then failwith(error_SATELLITE_AGGREGATORS_SUBSCRIBED_CALCULATION_ERROR) else skip;
                                    satelliteOracleRecord.aggregatorsSubscribed  := abs(satelliteOracleRecord.aggregatorsSubscribed - 1n);

                                    // Remove aggregator from satellite oracle record
                                    remove aggregatorAddress from map satelliteOracleRecord.aggregatorPairs;

                                    // Update storage
                                    s.satelliteOracleLedger[oracleAddress] := satelliteOracleRecord;

                                } else skip;



                                // Governance: Remove All Satellite Oracles (in aggregators)
                                if _governanceSatelliteActionRecord.governanceType = "REMOVE_ALL_SATELLITE_ORACLES" then block {

                                    // Get satellite address from governance satellite action record address map
                                    const satelliteAddress : address = case _governanceSatelliteActionRecord.addressMap["satelliteAddress"] of [
                                            Some(_address) -> _address
                                        |   None           -> failwith(error_SATELLITE_NOT_FOUND)
                                    ];

                                    // Get satellite oracle record
                                    var satelliteOracleRecord : satelliteOracleRecordType := case s.satelliteOracleLedger[satelliteAddress] of [
                                            Some(_record) -> _record
                                        |   None          -> failwith(error_SATELLITE_ORACLE_RECORD_NOT_FOUND)
                                    ];

                                    // Loop to remove satellite's (i.e. oracle's) address in aggregators
                                    for aggregatorAddress -> _aggregatorRecord in map satelliteOracleRecord.aggregatorPairs {

                                        const removeOracleInAggregatorOperation : operation = Tezos.transaction(
                                            satelliteAddress, 
                                            0tez, 
                                            getRemoveOracleInAggregatorEntrypoint(aggregatorAddress)
                                        );

                                        operations := removeOracleInAggregatorOperation # operations;

                                        remove aggregatorAddress from map satelliteOracleRecord.aggregatorPairs;
                                    };      

                                    // Update satellite oracle record and ledger
                                    satelliteOracleRecord.aggregatorsSubscribed  := 0n;
                                    s.satelliteOracleLedger[satelliteAddress] := satelliteOracleRecord;

                                } else skip;



                                // Governance: Set new Aggregator Maintainer
                                if _governanceSatelliteActionRecord.governanceType = "SET_AGGREGATOR_MAINTAINER" then block {

                                    // Get aggregator address from governance satellite action record address map
                                    const aggregatorAddress : address = case _governanceSatelliteActionRecord.addressMap["aggregatorAddress"] of [
                                            Some(_address) -> _address
                                        |   None           -> failwith(error_AGGREGATOR_CONTRACT_NOT_FOUND)
                                    ];

                                    // Get maintainer address from governance satellite action record address map
                                    const newMaintainerAddress : address = case _governanceSatelliteActionRecord.addressMap["maintainerAddress"] of [
                                            Some(_address) -> _address
                                        |   None           -> failwith(error_MAINTAINER_ADDRESS_NOT_FOUND)
                                    ];

                                    // Create operation to set aggregator new maintainer
                                    const setNewMaintainerOperation : operation = Tezos.transaction(
                                        newMaintainerAddress,
                                        0tez,
                                        getSetMaintainerInAggregatorEntrypoint(aggregatorAddress)
                                    );

                                    operations := setNewMaintainerOperation # operations;
                                
                                } else skip;



                                // Governance: Update Aggregator Status
                                if _governanceSatelliteActionRecord.governanceType = "UPDATE_AGGREGATOR_STATUS" then block {

                                    // Get aggregator address from governance satellite action record address map
                                    const aggregatorAddress : address = case _governanceSatelliteActionRecord.addressMap["aggregatorAddress"] of [
                                            Some(_address) -> _address
                                        |   None           -> failwith(error_AGGREGATOR_CONTRACT_NOT_FOUND)
                                    ];

                                    // Get aggregator new status from governance satellite action record string map
                                    const aggregatorNewStatus : string = case _governanceSatelliteActionRecord.stringMap["status"] of [
                                            Some(_status) -> _status
                                        |   None          -> failwith(error_AGGREGATOR_NEW_STATUS_NOT_FOUND)
                                    ];

                                    // Get aggregator record
                                    var aggregatorRecord : aggregatorRecordType := case s.aggregatorLedger[aggregatorAddress] of [
                                            Some(_record) -> _record
                                        |   None          -> failwith(error_AGGREGATOR_RECORD_IN_GOVERNANCE_SATELLITE_NOT_FOUND)
                                    ];

                                    // Create operation to pause or unpause aggregator based on status input
                                    if aggregatorNewStatus = "ACTIVE" then block {

                                        // unpause all entrypoints in aggregator
                                        const unpauseAllInAggregatorOperation : operation = Tezos.transaction(
                                            unit,
                                            0tez,
                                            getUnpauseAllInAggregatorEntrypoint(aggregatorAddress)
                                        );

                                        operations := unpauseAllInAggregatorOperation # operations;

                                    } else if aggregatorNewStatus = "INACTIVE" then block {

                                        // pause all entrypoints in aggregator
                                        const pauseAllInAggregatorOperation : operation = Tezos.transaction(
                                            unit,
                                            0tez,
                                            getPauseAllInAggregatorEntrypoint(aggregatorAddress)
                                        );

                                        operations := pauseAllInAggregatorOperation # operations;

                                    } else skip;

                                    // Update aggregator status
                                    aggregatorRecord.status               := aggregatorNewStatus;
                                    s.aggregatorLedger[aggregatorAddress] := aggregatorRecord;

                                } else skip;

                                // Governance: Mistaken Transfer Fix
                                if _governanceSatelliteActionRecord.governanceType = "MISTAKEN_TRANSFER_FIX" then block {

                                    // get parameters
                                    const targetContractAddress : address = case _governanceSatelliteActionRecord.addressMap["targetContractAddress"] of [
                                         Some(_address) -> _address
                                       | None -> failwith(error_GOVERNANCE_SATELLITE_ACTION_PARAMETER_NOT_FOUND)
                                    ];

                                    const transferList : transferActionType = _governanceSatelliteActionRecord.transferList;

                                    // call mistaken transfer entrypoint
                                    const mistakenTransferOperation : operation = Tezos.transaction(
                                        transferList,
                                        0tez,
                                        getMistakenTransferEntrypoint(targetContractAddress)
                                    );

                                    operations := mistakenTransferOperation # operations;
                                    

                                } else skip;

                            _governanceSatelliteActionRecord.executed   := True;
                            s.governanceSatelliteActionLedger[actionId] := _governanceSatelliteActionRecord;

                        }
                    }

                    | Nay(_v) -> block {
                        
                        // Compute new NAY vote total
                        const newNayVoteStakedMvkTotal : nat                        = _governanceSatelliteActionRecord.nayVoteStakedMvkTotal + totalVotingPower;
                        
                        // Update governance satellite action with new vote total
                        _governanceSatelliteActionRecord.nayVoteStakedMvkTotal      := newNayVoteStakedMvkTotal;
                        s.governanceSatelliteActionLedger[actionId]      := _governanceSatelliteActionRecord;
                    }

                    | Pass(_v) -> block {

                        // Compute new PASS vote total
                        const newPassVoteStakedMvkTotal : nat                           = _governanceSatelliteActionRecord.passVoteStakedMvkTotal + totalVotingPower;

                        // Update governance satellite action with new vote total
                        _governanceSatelliteActionRecord.passVoteStakedMvkTotal         := newPassVoteStakedMvkTotal;
                        s.governanceSatelliteActionLedger[actionId]          := _governanceSatelliteActionRecord;
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
