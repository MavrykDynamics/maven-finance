// ------------------------------------------------------------------------------
//
// Satellite Governance Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin

    case governanceSatelliteLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount
    checkSenderIsAllowed(s); // check that sender is admin

    case governanceSatelliteLambdaAction of [
        | LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)


(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)

    case governanceSatelliteLambdaAction of [
        | LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateConfig lambda  *)
function lambdaUpdateConfig(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is 
block {

  checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
  checkSenderIsAdmin(s); // check that sender is admin

  case governanceSatelliteLambdaAction of [
        | LambdaUpdateConfig(updateConfigParams) -> {

                const updateConfigAction    : governanceSatelliteUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : governanceSatelliteUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    | ConfigVotingPowerRatio (_v)           -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.votingPowerRatio                       := updateConfigNewValue
                    | ConfigApprovalPercentage (_v)         -> if updateConfigNewValue > 10_000n then failwith(error_CONFIG_VALUE_TOO_HIGH) else s.config.governanceSatelliteApprovalPercentage  := updateConfigNewValue
                    | ConfigSatelliteDurationInDays (_v)    -> s.config.governanceSatelliteDurationInDays       := updateConfigNewValue
                    | ConfigPurposeMaxLength (_v)           -> s.config.governancePurposeMaxLength              := updateConfigNewValue  
                ];

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda  *)
function lambdaUpdateWhitelistContracts(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage): return is
block {
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    case governanceSatelliteLambdaAction of [
        | LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda  *)
function lambdaUpdateGeneralContracts(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage): return is
block {
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    case governanceSatelliteLambdaAction of [
        | LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Satellite Governance Lambdas Begin
// ------------------------------------------------------------------------------

(*  suspendSatellite lambda *)
function lambdaSuspendSatellite(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceSatelliteLambdaAction of [
        | LambdaSuspendSatellite(suspendSatelliteParams) -> {

                // init params
                const satelliteToBeSuspended  : address = suspendSatelliteParams.satelliteToBeSuspended;
                const purpose                 : string  = suspendSatelliteParams.purpose;

                // get delegation address
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress: address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
                      ]
                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // get satellite record for satellite to be suspended
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", satelliteToBeSuspended, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith(error_SATELLITE_NOT_FOUND)
                      ]
                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                const addressMap        : addressMapType     = map [
                    ("satelliteToBeSuspended" : string) -> satelliteToBeSuspended
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];

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
                const getBalanceView : option (nat) = Tezos.call_view ("getBalance", doormanAddress, s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply : nat = case getBalanceView of [
                      Some (value) -> value
                    | None -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                // getStakedMvkTotalSupply
                const stakedMvkRequiredForApproval: nat     = abs((snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                var newGovernanceSatelliteAction : governanceSatelliteActionRecordType := record [

                        initiator                          = Tezos.sender;
                        status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                        executed                           = False;

                        governanceType                     = "SUSPEND";
                        governancePurpose                  = purpose;
                        voters                             = emptyVotersMap;

                        addressMap                         = addressMap;
                        stringMap                          = emptyStringMap;
                        natMap                             = emptyNatMap;

                        yayVoteTotal                       = 0n;
                        nayVoteTotal                       = 0n;
                        passVoteTotal                      = 0n;

                        snapshotStakedMvkTotalSupply       = snapshotStakedMvkTotalSupply;
                        stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                        startDateTime                      = Tezos.now;            
                        expiryDateTime                     = Tezos.now + (86_400 * s.config.governanceSatelliteDurationInDays);
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

                    s := setSatelliteSnapshot(satelliteSnapshot,s);
                }; 

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  unsuspendSatellite lambda *)
function lambdaUnsuspendSatellite(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceSatelliteLambdaAction of [
        | LambdaUnsuspendSatellite(unsuspendSatelliteParams) -> {

                // init params
                const satelliteToBeUnsuspended  : address = unsuspendSatelliteParams.satelliteToBeUnsuspended;
                const purpose                   : string  = unsuspendSatelliteParams.purpose;

                // get delegation address
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress: address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
                      ]
                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // get satellite record for satellite to be suspended
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", satelliteToBeUnsuspended, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith(error_SATELLITE_NOT_FOUND)
                      ]
                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                const addressMap        : addressMapType     = map [
                    ("satelliteToBeUnsuspended" : string) -> satelliteToBeUnsuspended
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];

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
                const getBalanceView : option (nat) = Tezos.call_view ("getBalance", doormanAddress, s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply : nat = case getBalanceView of [
                      Some (value) -> value
                    | None -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                const stakedMvkRequiredForApproval: nat     = abs((snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                var newGovernanceSatelliteAction : governanceSatelliteActionRecordType := record [

                        initiator                          = Tezos.sender;
                        status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                        executed                           = False;

                        governanceType                     = "UNSUSPEND";
                        governancePurpose                  = purpose;
                        voters                             = emptyVotersMap;

                        addressMap                         = addressMap;
                        stringMap                          = emptyStringMap;
                        natMap                             = emptyNatMap;

                        yayVoteTotal                       = 0n;
                        nayVoteTotal                       = 0n;
                        passVoteTotal                      = 0n;

                        snapshotStakedMvkTotalSupply       = snapshotStakedMvkTotalSupply;
                        stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                        startDateTime                      = Tezos.now;            
                        expiryDateTime                     = Tezos.now + (86_400 * s.config.governanceSatelliteDurationInDays);
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

                    s := setSatelliteSnapshot(satelliteSnapshot,s);
                }; 

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  banSatellite lambda *)
function lambdaBanSatellite(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceSatelliteLambdaAction of [
        | LambdaBanSatellite(banSatelliteParams) -> {
                
                // init params
                const satelliteToBeBanned      : address = banSatelliteParams.satelliteToBeBanned;
                const purpose                  : string  = banSatelliteParams.purpose;

                // get delegation address
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress: address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
                      ]
                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // get satellite record for satellite to be suspended
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", satelliteToBeBanned, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith(error_SATELLITE_NOT_FOUND)
                      ]
                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                const addressMap        : addressMapType     = map [
                    ("satelliteToBeBanned" : string) -> satelliteToBeBanned
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];

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
                const getBalanceView : option (nat) = Tezos.call_view ("getBalance", doormanAddress, s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply : nat = case getBalanceView of [
                      Some (value) -> value
                    | None -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                const stakedMvkRequiredForApproval: nat     = abs((snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                var newGovernanceSatelliteAction : governanceSatelliteActionRecordType := record [

                        initiator                          = Tezos.sender;
                        status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                        executed                           = False;

                        governanceType                     = "BAN";
                        governancePurpose                  = purpose;
                        voters                             = emptyVotersMap;

                        addressMap                         = addressMap;
                        stringMap                          = emptyStringMap;
                        natMap                             = emptyNatMap;

                        yayVoteTotal                       = 0n;
                        nayVoteTotal                       = 0n;
                        passVoteTotal                      = 0n;

                        snapshotStakedMvkTotalSupply       = snapshotStakedMvkTotalSupply;
                        stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                        startDateTime                      = Tezos.now;            
                        expiryDateTime                     = Tezos.now + (86_400 * s.config.governanceSatelliteDurationInDays);
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

                    s := setSatelliteSnapshot(satelliteSnapshot,s);
                }; 

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  unbanSatellite lambda *)
function lambdaUnbanSatellite(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceSatelliteLambdaAction of [
        | LambdaUnbanSatellite(unbanSatelliteParams) -> {
                
                // init params
                const satelliteToBeUnbanned    : address = unbanSatelliteParams.satelliteToBeUnbanned;
                const purpose                  : string  = unbanSatelliteParams.purpose;

                // get delegation address
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress: address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
                      ]
                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // get satellite record for satellite to be suspended
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", satelliteToBeUnbanned, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith(error_SATELLITE_NOT_FOUND)
                      ]
                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                const addressMap        : addressMapType     = map [
                    ("satelliteToBeUnbanned" : string) -> satelliteToBeUnbanned
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];

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
                const getBalanceView : option (nat) = Tezos.call_view ("getBalance", doormanAddress, s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply : nat = case getBalanceView of [
                      Some (value) -> value
                    | None -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                const stakedMvkRequiredForApproval: nat     = abs((snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                var newGovernanceSatelliteAction : governanceSatelliteActionRecordType := record [

                        initiator                          = Tezos.sender;
                        status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                        executed                           = False;

                        governanceType                     = "UNBAN";
                        governancePurpose                  = purpose;
                        voters                             = emptyVotersMap;

                        addressMap                         = addressMap;
                        stringMap                          = emptyStringMap;
                        natMap                             = emptyNatMap;

                        yayVoteTotal                       = 0n;
                        nayVoteTotal                       = 0n;
                        passVoteTotal                      = 0n;

                        snapshotStakedMvkTotalSupply       = snapshotStakedMvkTotalSupply;
                        stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                        startDateTime                      = Tezos.now;            
                        expiryDateTime                     = Tezos.now + (86_400 * s.config.governanceSatelliteDurationInDays);
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

                    s := setSatelliteSnapshot(satelliteSnapshot,s);
                }; 

            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Satellite Governance Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Satellite Oracle Governance Lambdas Begin
// ------------------------------------------------------------------------------

(*  removeAllSatelliteOracles lambda *)
function lambdaRemoveAllSatelliteOracles(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceSatelliteLambdaAction of [
        | LambdaRemoveAllSatelliteOracles(removeAllSatelliteOraclesParams) -> {
                
                // init params
                const satelliteAddress    : address = removeAllSatelliteOraclesParams.satelliteAddress;
                const purpose             : string  = removeAllSatelliteOraclesParams.purpose;

                // get delegation address
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress: address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
                      ]
                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                // get satellite record for satellite in question
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", satelliteAddress, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith(error_SATELLITE_NOT_FOUND)
                      ]
                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                const addressMap        : addressMapType     = map [
                    ("satelliteAddress" : string) -> satelliteAddress
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];

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
                const getBalanceView : option (nat) = Tezos.call_view ("getBalance", doormanAddress, s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply : nat = case getBalanceView of [
                      Some (value) -> value
                    | None -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                const stakedMvkRequiredForApproval: nat     = abs((snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                var newGovernanceSatelliteAction : governanceSatelliteActionRecordType := record [

                        initiator                          = Tezos.sender;
                        status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                        executed                           = False;

                        governanceType                     = "REMOVE_ALL_SATELLITE_ORACLES";
                        governancePurpose                  = purpose;
                        voters                             = emptyVotersMap;

                        addressMap                         = addressMap;
                        stringMap                          = emptyStringMap;
                        natMap                             = emptyNatMap;

                        yayVoteTotal                       = 0n;
                        nayVoteTotal                       = 0n;
                        passVoteTotal                      = 0n;

                        snapshotStakedMvkTotalSupply       = snapshotStakedMvkTotalSupply;
                        stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                        startDateTime                      = Tezos.now;            
                        expiryDateTime                     = Tezos.now + (86_400 * s.config.governanceSatelliteDurationInDays);
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

                    s := setSatelliteSnapshot(satelliteSnapshot,s);
                }; 

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  addOracleToAggregator lambda *)
function lambdaAddOracleToAggregator(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceSatelliteLambdaAction of [
        | LambdaAddOracleToAggregator(addOracleToAggregatorParams) -> {
                
                // init params
                const oracleAddress      : address = addOracleToAggregatorParams.oracleAddress;
                const aggregatorAddress  : address = addOracleToAggregatorParams.aggregatorAddress;
                const purpose            : string  = addOracleToAggregatorParams.purpose;

                // get delegation address
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress: address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
                      ]
                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                const addressMap        : addressMapType     = map [
                    ("oracleAddress"     : string)   -> oracleAddress;
                    ("aggregatorAddress" : string)   -> aggregatorAddress;
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];

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
                const getBalanceView : option (nat) = Tezos.call_view ("getBalance", doormanAddress, s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply : nat = case getBalanceView of [
                      Some (value) -> value
                    | None -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                const stakedMvkRequiredForApproval: nat     = abs((snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                var newGovernanceSatelliteAction : governanceSatelliteActionRecordType := record [

                        initiator                          = Tezos.sender;
                        status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                        executed                           = False;

                        governanceType                     = "ADD_ORACLE_TO_AGGREGATOR";
                        governancePurpose                  = purpose;
                        voters                             = emptyVotersMap;

                        addressMap                         = addressMap;
                        stringMap                          = emptyStringMap;
                        natMap                             = emptyNatMap;

                        yayVoteTotal                       = 0n;
                        nayVoteTotal                       = 0n;
                        passVoteTotal                      = 0n;

                        snapshotStakedMvkTotalSupply       = snapshotStakedMvkTotalSupply;
                        stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                        startDateTime                      = Tezos.now;            
                        expiryDateTime                     = Tezos.now + (86_400 * s.config.governanceSatelliteDurationInDays);
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

                    s := setSatelliteSnapshot(satelliteSnapshot,s);
                }; 

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  removeOracleInAggregator lambda *)
function lambdaRemoveOracleInAggregator(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceSatelliteLambdaAction of [
        | LambdaRemoveOracleInAggregator(removeOracleInAggregatorParams) -> {
                
                // init params
                const oracleAddress        : address = removeOracleInAggregatorParams.oracleAddress;
                const aggregatorAddress    : address = removeOracleInAggregatorParams.aggregatorAddress;
                const purpose              : string  = removeOracleInAggregatorParams.purpose;

                // get delegation address
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress: address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
                      ]
                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                const addressMap        : addressMapType     = map [
                    ("oracleAddress"     : string)   -> oracleAddress;
                    ("aggregatorAddress" : string)   -> aggregatorAddress;
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];

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
                const getBalanceView : option (nat) = Tezos.call_view ("getBalance", doormanAddress, s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply : nat = case getBalanceView of [
                      Some (value) -> value
                    | None -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                const stakedMvkRequiredForApproval: nat     = abs((snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                var newGovernanceSatelliteAction : governanceSatelliteActionRecordType := record [

                        initiator                          = Tezos.sender;
                        status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                        executed                           = False;

                        governanceType                     = "REMOVE_ORACLE_IN_AGGREGATOR";
                        governancePurpose                  = purpose;
                        voters                             = emptyVotersMap;

                        addressMap                         = addressMap;
                        stringMap                          = emptyStringMap;
                        natMap                             = emptyNatMap;

                        yayVoteTotal                       = 0n;
                        nayVoteTotal                       = 0n;
                        passVoteTotal                      = 0n;

                        snapshotStakedMvkTotalSupply       = snapshotStakedMvkTotalSupply;
                        stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                        startDateTime                      = Tezos.now;            
                        expiryDateTime                     = Tezos.now + (86_400 * s.config.governanceSatelliteDurationInDays);
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

                    s := setSatelliteSnapshot(satelliteSnapshot,s);
                }; 

            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Satellite Oracle Governance Lambdas End
// ------------------------------------------------------------------------------




// ------------------------------------------------------------------------------
// Aggregator Governance Lambdas Begin
// ------------------------------------------------------------------------------

(*  registerAggregator lambda *)
function lambdaRegisterAggregator(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount

    // check sender is admin or is whitelisted
    if Tezos.sender = s.admin or checkInWhitelistContracts(Tezos.sender, s.whitelistContracts) then skip else failwith(error_ONLY_ADMIN_OR_AGGREGATOR_FACTORY_CONTRACT_ALLOWED);
    
    case governanceSatelliteLambdaAction of [
        | LambdaRegisterAggregator(registerAggregatorParams) -> {
                
                // init params
                const aggregatorAddress    : address          = registerAggregatorParams.aggregatorAddress;
                const aggregatorPair       : string * string  = registerAggregatorParams.aggregatorPair;

                // check if aggregator already exists
                case s.aggregatorLedger[aggregatorAddress] of [
                      Some(_v) -> failwith(error_AGGREGATOR_CONTRACT_EXISTS)
                    | None -> skip
                ];

                // create new aggregator record
                const emptyOracleSet : set(address) = set[];
                const aggregatorRecord : aggregatorRecordType = record [
                    aggregatorPair    = aggregatorPair;
                    status            = "ACTIVE";
                    createdTimestamp  = Tezos.now;
                    oracles           = emptyOracleSet;
                ];

                // update aggregator ledger
                s.aggregatorLedger[aggregatorAddress] := aggregatorRecord;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateAggregatorStatus lambda *)
function lambdaUpdateAggregatorStatus(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceSatelliteLambdaAction of [
        | LambdaUpdateAggregatorStatus(updateAggregatorStatusParams) -> {
                
                // init params
                const aggregatorAddress    : address = updateAggregatorStatusParams.aggregatorAddress;
                const status               : string  = updateAggregatorStatusParams.status;
                const purpose              : string  = updateAggregatorStatusParams.purpose;

                // get delegation address
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress: address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
                      ]
                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                const addressMap        : addressMapType     = map [
                    ("aggregatorAddress" : string)   -> aggregatorAddress;
                ];
                const stringMap    : stringMapType      = map [
                    ("status" : string)              -> status
                ];
                const emptyNatMap       : natMapType         = map [];

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
                const getBalanceView : option (nat) = Tezos.call_view ("getBalance", doormanAddress, s.mvkTokenAddress);
                const snapshotStakedMvkTotalSupply : nat = case getBalanceView of [
                      Some (value) -> value
                    | None -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
                ];

                const stakedMvkRequiredForApproval: nat = abs((snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                var newGovernanceSatelliteAction : governanceSatelliteActionRecordType := record [

                        initiator                          = Tezos.sender;
                        status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                        executed                           = False;

                        governanceType                     = "UPDATE_AGGREGATOR_STATUS";
                        governancePurpose                  = purpose;
                        voters                             = emptyVotersMap;

                        addressMap                         = addressMap;
                        stringMap                          = stringMap;
                        natMap                             = emptyNatMap;

                        yayVoteTotal                       = 0n;
                        nayVoteTotal                       = 0n;
                        passVoteTotal                      = 0n;

                        snapshotStakedMvkTotalSupply       = snapshotStakedMvkTotalSupply;
                        stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                        startDateTime                      = Tezos.now;            
                        expiryDateTime                     = Tezos.now + (86_400 * s.config.governanceSatelliteDurationInDays);
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

                    s := setSatelliteSnapshot(satelliteSnapshot,s);
                }; 

            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Aggregator Governance Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Action Lambdas Begin
// ------------------------------------------------------------------------------

(*  dropAction lambda *)
function lambdaDropAction(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    case governanceSatelliteLambdaAction of [
        | LambdaDropAction(dropActionParams) -> {
                
                // init params
                const dropActionId     : nat     = dropActionParams.dropActionId;

                // get delegation address
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress: address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
                      ]
                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                var governanceSatelliteActionRecord : governanceSatelliteActionRecordType := case s.governanceSatelliteActionLedger[dropActionId] of [
                      Some(_request) -> _request
                    | None           -> failwith(error_GOVERNANCE_SATELLITE_ACTION_NOT_FOUND)
                ];

                if Tezos.sender =/= governanceSatelliteActionRecord.initiator then failwith(error_ONLY_INITIATOR_CAN_DROP_ACTION) else skip;

                if governanceSatelliteActionRecord.status    = False then failwith(error_GOVERNANCE_SATELLITE_ACTION_DROPPED) else skip;

                if governanceSatelliteActionRecord.executed then failwith(error_GOVERNANCE_SATELLITE_ACTION_EXECUTED) else skip;

                if Tezos.now > governanceSatelliteActionRecord.expiryDateTime then failwith(error_GOVERNANCE_SATELLITE_ACTION_EXPIRED) else skip;

                governanceSatelliteActionRecord.status := False;
                s.governanceSatelliteActionLedger[dropActionId] := governanceSatelliteActionRecord;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  voteForAction lambda *)
function lambdaVoteForAction(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    var operations : list(operation) := nil;

    case governanceSatelliteLambdaAction of [
        | LambdaVoteForAction(voteForAction) -> {
                
                // get delegation address
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress: address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // get satellite record
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_VOTE_FOR_GOVERNANCE_ACTION)
                      ]
                    | None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                const actionId : nat = voteForAction.actionId;

                var _governanceSatelliteActionRecord : governanceSatelliteActionRecordType := case s.governanceSatelliteActionLedger[actionId] of [
                      Some(_request) -> _request
                    | None           -> failwith(error_GOVERNANCE_SATELLITE_ACTION_NOT_FOUND)
                ];

                if _governanceSatelliteActionRecord.status    = False then failwith(error_GOVERNANCE_SATELLITE_ACTION_DROPPED)  else skip;
                if _governanceSatelliteActionRecord.executed  = True  then failwith(error_GOVERNANCE_SATELLITE_ACTION_EXECUTED) else skip;

                if Tezos.now > _governanceSatelliteActionRecord.expiryDateTime then failwith(error_GOVERNANCE_SATELLITE_ACTION_EXPIRED) else skip;

                const governanceSatelliteActionSnapshot : governanceSatelliteSnapshotMapType = case s.governanceSatelliteSnapshotLedger[actionId] of [
                      Some(_snapshot) -> _snapshot
                    | None            -> failwith(error_GOVERNANCE_SATELLITE_ACTION_SNAPSHOT_NOT_FOUND)
                ]; 

                const satelliteSnapshotRecord : governanceSatelliteSnapshotRecordType = case governanceSatelliteActionSnapshot[Tezos.sender] of [ 
                      Some(_record) -> _record
                    | None          -> failwith(error_SATELLITE_NOT_FOUND_IN_ACTION_SNAPSHOT)
                ];

                // Save and update satellite's vote record
                const voteType         : governanceSatelliteVoteChoiceType   = voteForAction.vote;
                const totalVotingPower : nat                                 = satelliteSnapshotRecord.totalVotingPower;

                // Remove previous vote if user already voted
                case _governanceSatelliteActionRecord.voters[Tezos.sender] of [
                    
                    Some (_voteRecord) -> case _voteRecord.vote of [

                          Yay(_v) ->  if _voteRecord.totalVotingPower > _governanceSatelliteActionRecord.yayVoteTotal 
                                        then failwith(error_CALCULATION_ERROR) 
                                        else _governanceSatelliteActionRecord.yayVoteTotal := abs(_governanceSatelliteActionRecord.yayVoteTotal - _voteRecord.totalVotingPower)

                        | Nay(_v) -> if _voteRecord.totalVotingPower > _governanceSatelliteActionRecord.nayVoteTotal 
                                        then failwith(error_CALCULATION_ERROR) 
                                        else _governanceSatelliteActionRecord.nayVoteTotal := abs(_governanceSatelliteActionRecord.nayVoteTotal - _voteRecord.totalVotingPower)

                        | Pass(_v) -> if _voteRecord.totalVotingPower > _governanceSatelliteActionRecord.passVoteTotal 
                                        then failwith(error_CALCULATION_ERROR) 
                                        else _governanceSatelliteActionRecord.passVoteTotal := abs(_governanceSatelliteActionRecord.passVoteTotal - _voteRecord.totalVotingPower)
                    ]
                    | None -> skip
                ];

                const newVoteRecord : governanceSatelliteVoteType     = record [
                    vote             = voteType;
                    totalVotingPower = totalVotingPower;
                    timeVoted        = Tezos.now;
                ];

                _governanceSatelliteActionRecord.voters[Tezos.sender] := newVoteRecord;

                
                // Satellite cast vote and governance action is executed if sufficient votes are gathered
                case voteType of [

                    Yay(_v) -> block {

                        const newYayVoteTotal : nat = _governanceSatelliteActionRecord.yayVoteTotal + totalVotingPower;

                        _governanceSatelliteActionRecord.yayVoteTotal       := newYayVoteTotal;
                        s.governanceSatelliteActionLedger[actionId]         := _governanceSatelliteActionRecord;

                        // send action operation if total approved votes exceed staked MVK required for approval
                        if newYayVoteTotal > _governanceSatelliteActionRecord.stakedMvkRequiredForApproval then block {


                                // Governance: Suspend Satellite
                                if _governanceSatelliteActionRecord.governanceType = "SUSPEND" then block {

                                    const satelliteToBeSuspended : address = case _governanceSatelliteActionRecord.addressMap["satelliteToBeSuspended"] of [
                                        Some(_address) -> _address
                                      | None -> failwith(error_SATELLITE_NOT_FOUND)
                                    ];

                                    // update satellite status in delegation contract
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
                                        | None -> operations
                                    ];

                                } else skip;



                                // Governance: Unsuspend Satellite
                                if _governanceSatelliteActionRecord.governanceType = "UNSUSPEND" then block {

                                    const satelliteToBeUnsuspended : address = case _governanceSatelliteActionRecord.addressMap["satelliteToBeUnsuspended"] of [
                                         Some(_address) -> _address
                                       | None -> failwith(error_SATELLITE_NOT_FOUND)
                                    ];

                                    // update satellite status in delegation contract
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
                                        | None -> operations
                                    ];

                                } else skip;



                                // Governance: Ban Satellite
                                if _governanceSatelliteActionRecord.governanceType = "BAN" then block {

                                    const satelliteToBeBanned : address = case _governanceSatelliteActionRecord.addressMap["satelliteToBeBanned"] of [
                                         Some(_address) -> _address
                                       | None -> failwith(error_SATELLITE_NOT_FOUND)
                                    ];

                                    // update satellite status in delegation contract
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
                                        | None -> operations
                                    ];

                                } else skip;



                                // Governance: Unban Satellite
                                if _governanceSatelliteActionRecord.governanceType = "UNBAN" then block {

                                    const satelliteToBeUnbanned : address = case _governanceSatelliteActionRecord.addressMap["satelliteToBeUnbanned"] of [
                                        Some(_address) -> _address
                                      | None -> failwith(error_SATELLITE_NOT_FOUND)
                                    ];

                                    // update satellite status in delegation contract
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
                                        | None -> operations
                                    ];
                                
                                } else skip;



                                // Governance: Add Oracle To Aggregator
                                if _governanceSatelliteActionRecord.governanceType = "ADD_ORACLE_TO_AGGREGATOR" then block {

                                    const oracleAddress : address = case _governanceSatelliteActionRecord.addressMap["oracleAddress"] of [
                                        Some(_address) -> _address
                                      | None            -> failwith(error_ORACLE_NOT_FOUND)
                                    ];

                                    const aggregatorAddress : address = case _governanceSatelliteActionRecord.addressMap["aggregatorAddress"] of [
                                         Some(_address) -> _address
                                       | None           -> failwith(error_AGGREGATOR_CONTRACT_NOT_FOUND)
                                    ];

                                    // get aggregator record and add satellite to oracles set
                                    var aggregatorRecord : aggregatorRecordType := case s.aggregatorLedger[aggregatorAddress] of [
                                          Some(_record) -> _record
                                        | None          -> failwith(error_AGGREGATOR_RECORD_IN_GOVERNANCE_SATELLITE_NOT_FOUND)
                                    ];
                                    aggregatorRecord.oracles := Set.add(oracleAddress, aggregatorRecord.oracles);

                                    // update satellite oracle record
                                    var satelliteOracleRecord : satelliteOracleRecordType := case s.satelliteOracleLedger[oracleAddress] of [
                                          Some(_record) -> _record
                                        | None -> record [
                                            aggregatorsSubscribed = 0n;
                                            aggregatorPairs       = (map[] : aggregatorPairsMapType);
                                        ]
                                    ];

                                    satelliteOracleRecord.aggregatorsSubscribed  := satelliteOracleRecord.aggregatorsSubscribed  + 1n;
                                    satelliteOracleRecord.aggregatorPairs[aggregatorAddress] := record [
                                        aggregatorPair      = aggregatorRecord.aggregatorPair;
                                        aggregatorAddress   = aggregatorAddress;
                                        startDateTime       = Tezos.now;
                                    ];

                                    // update storage
                                    s.satelliteOracleLedger[oracleAddress] := satelliteOracleRecord;
                                    s.aggregatorLedger[aggregatorAddress]  := aggregatorRecord;

                                    // operation to add oracle to aggregator
                                    const addOracleInAggregatorOperation : operation = Tezos.transaction(
                                        oracleAddress, 
                                        0tez, 
                                        getAddOracleInAggregatorEntrypoint(aggregatorAddress)
                                    );

                                    operations := addOracleInAggregatorOperation # operations;

                                } else skip;



                                // Governance: Remove Oracle In Aggregator
                                if _governanceSatelliteActionRecord.governanceType = "REMOVE_ORACLE_IN_AGGREGATOR" then block {

                                    const oracleAddress : address = case _governanceSatelliteActionRecord.addressMap["oracleAddress"] of [
                                        Some(_address) -> _address
                                      | None -> failwith(error_ORACLE_NOT_FOUND)
                                    ];

                                    const aggregatorAddress : address = case _governanceSatelliteActionRecord.addressMap["aggregatorAddress"] of [
                                        Some(_address) -> _address
                                      | None -> failwith(error_AGGREGATOR_CONTRACT_NOT_FOUND)
                                    ];
                                
                                    const removeOracleInAggregatorOperation : operation = Tezos.transaction(
                                        oracleAddress, 
                                        0tez, 
                                        getRemoveOracleInAggregatorEntrypoint(aggregatorAddress)
                                    );

                                    operations := removeOracleInAggregatorOperation # operations;

                                    // remove aggregator from satellite oracle record
                                    var satelliteOracleRecord : satelliteOracleRecordType := case s.satelliteOracleLedger[oracleAddress] of [
                                          Some(_record) -> _record
                                        | None -> failwith(error_SATELLITE_ORACLE_RECORD_NOT_FOUND)
                                    ];
                                    
                                    // check that number of aggregators subscribed is not zero, before subtracting
                                    if satelliteOracleRecord.aggregatorsSubscribed < 1n then failwith(error_SATELLITE_AGGREGATORS_SUBSCRIBED_CALCULATION_ERROR) else skip;
                                    satelliteOracleRecord.aggregatorsSubscribed  := abs(satelliteOracleRecord.aggregatorsSubscribed - 1n);

                                    remove aggregatorAddress from map satelliteOracleRecord.aggregatorPairs;

                                    s.satelliteOracleLedger[oracleAddress] := satelliteOracleRecord;

                                } else skip;



                                // Governance: Remove All Satellite Oracles (in aggregators)
                                if _governanceSatelliteActionRecord.governanceType = "REMOVE_ALL_SATELLITE_ORACLES" then block {

                                    const satelliteAddress : address = case _governanceSatelliteActionRecord.addressMap["satelliteAddress"] of [
                                         Some(_address) -> _address
                                       | None -> failwith(error_SATELLITE_NOT_FOUND)
                                    ];

                                    var satelliteOracleRecord : satelliteOracleRecordType := case s.satelliteOracleLedger[satelliteAddress] of [
                                          Some(_record) -> _record
                                        | None -> failwith(error_SATELLITE_ORACLE_RECORD_NOT_FOUND)
                                    ];

                                    // remove satellite oracles in aggregators
                                    for aggregatorAddress -> _aggregatorRecord in map satelliteOracleRecord.aggregatorPairs {

                                        const removeOracleInAggregatorOperation : operation = Tezos.transaction(
                                            satelliteAddress, 
                                            0tez, 
                                            getRemoveOracleInAggregatorEntrypoint(aggregatorAddress)
                                        );

                                        operations := removeOracleInAggregatorOperation # operations;

                                        remove aggregatorAddress from map satelliteOracleRecord.aggregatorPairs;
                                    };      

                                    // update satellite oracle record and ledger
                                    satelliteOracleRecord.aggregatorsSubscribed  := 0n;
                                    s.satelliteOracleLedger[satelliteAddress] := satelliteOracleRecord;

                                } else skip;



                                // Governance: Update Aggregator Status
                                if _governanceSatelliteActionRecord.governanceType = "UPDATE_AGGREGATOR_STATUS" then block {

                                    const aggregatorAddress : address = case _governanceSatelliteActionRecord.addressMap["aggregatorAddress"] of [
                                         Some(_address) -> _address
                                       | None -> failwith(error_AGGREGATOR_CONTRACT_NOT_FOUND)
                                    ];

                                    const aggregatorNewStatus : string = case _governanceSatelliteActionRecord.stringMap["status"] of [
                                         Some(_status) -> _status
                                       | None -> failwith(error_AGGREGATOR_NEW_STATUS_NOT_FOUND)
                                    ];

                                    var aggregatorRecord : aggregatorRecordType := case s.aggregatorLedger[aggregatorAddress] of [
                                          Some(_record) -> _record
                                        | None -> failwith(error_AGGREGATOR_RECORD_IN_GOVERNANCE_SATELLITE_NOT_FOUND)
                                    ];

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

                                    // update aggregator status
                                    aggregatorRecord.status := aggregatorNewStatus;
                                    s.aggregatorLedger[aggregatorAddress] := aggregatorRecord;

                                } else skip;

                            _governanceSatelliteActionRecord.executed   := True;
                            s.governanceSatelliteActionLedger[actionId] := _governanceSatelliteActionRecord;

                        }
                    }

                    | Nay(_v) -> block {
                        const newNayVoteTotal : nat                       = _governanceSatelliteActionRecord.nayVoteTotal + totalVotingPower;
                        _governanceSatelliteActionRecord.nayVoteTotal    := newNayVoteTotal;
                        s.governanceSatelliteActionLedger[actionId]      := _governanceSatelliteActionRecord;
                    }

                    | Pass(_v) -> block {
                        const newPassVoteTotal : nat                          = _governanceSatelliteActionRecord.passVoteTotal + totalVotingPower;
                        _governanceSatelliteActionRecord.passVoteTotal       := newPassVoteTotal;
                        s.governanceSatelliteActionLedger[actionId]          := _governanceSatelliteActionRecord;
                    }
                ];

            }
        | _ -> skip
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
