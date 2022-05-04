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
                    | ConfigApprovalPercentage (_v)         -> s.config.governanceSatelliteApprovalPercentage   := updateConfigNewValue  
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

                // check if delegation contract exists
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None           -> failwith("Error. Delegation Contract is not found")
                ];

                // get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith("Error. You need to be a satellite to initiate a governance satellite action.")
                      ]
                    | None -> failwith ("Error. GetSatelliteOpt View not found in the Delegation Contract")
                ];

                // get satellite record for satellite to be suspended
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", satelliteToBeSuspended, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith("Error. Satellite to be suspended is not found.")
                      ]
                    | None -> failwith ("Error. GetSatelliteOpt View not found in the Delegation Contract")
                ];

                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                const addressMap        : addressMapType     = map [
                    ("satelliteToBeSuspended" : string) -> satelliteToBeSuspended
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];

                const stakedMvkRequiredForApproval: nat     = abs((s.snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                var newGovernanceSatelliteAction : governanceSatelliteRecordType := record [

                        initiator                          = Tezos.sender;
                        status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                        executed                           = False;

                        governanceType                     = "suspendSatellite";
                        governancePurpose                  = "";
                        voters                             = emptyVotersMap;

                        addressMap                         = addressMap;
                        stringMap                          = emptyStringMap;
                        natMap                             = emptyNatMap;

                        approveVoteTotal                   = 0n;
                        disapproveVoteTotal                = 0n;

                        snapshotStakedMvkTotalSupply       = s.snapshotStakedMvkTotalSupply;
                        stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                        startDateTime                      = Tezos.now;            
                        expiryDateTime                     = Tezos.now + (86_400 * s.config.governanceSatelliteDurationInDays);
                    ];

                const actionId : nat = s.governanceSatelliteCounter;

                // save action to governance satellite ledger
                s.governanceSatelliteLedger[actionId] := newGovernanceSatelliteAction;

                // increment governance satellite counter
                s.governanceSatelliteCounter := actionId + 1n;

                // create snapshot in governanceSatelliteSnapshotLedger (to be filled with satellite's )
                const emptyGovernanceSatelliteActionSnapshotMap  : governanceSatelliteSnapshotMapType     = map [];
                s.governanceSatelliteSnapshotLedger[actionId] := emptyGovernanceSatelliteActionSnapshotMap;

                // loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites: map(address, satelliteRecordType) = case activeSatellitesView of [
                      Some (value) -> value
                    | None -> failwith ("Error. GetActiveSatellites View not found in the Delegation Contract")
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

                // check if delegation contract exists
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None           -> failwith("Error. Delegation Contract is not found")
                ];

                // get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith("Error. You need to be a satellite to initiate a governance satellite action.")
                      ]
                    | None -> failwith ("Error. GetSatelliteOpt View not found in the Delegation Contract")
                ];

                // get satellite record for satellite to be suspended
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", satelliteToBeUnsuspended, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith("Error. Satellite to be unsuspended is not found.")
                      ]
                    | None -> failwith ("Error. GetSatelliteOpt View not found in the Delegation Contract")
                ];

                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                const addressMap        : addressMapType     = map [
                    ("satelliteToBeUnsuspended" : string) -> satelliteToBeUnsuspended
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];

                const stakedMvkRequiredForApproval: nat     = abs((s.snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                var newGovernanceSatelliteAction : governanceSatelliteRecordType := record [

                        initiator                          = Tezos.sender;
                        status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                        executed                           = False;

                        governanceType                     = "unsuspendSatellite";
                        governancePurpose                  = "";
                        voters                             = emptyVotersMap;

                        addressMap                         = addressMap;
                        stringMap                          = emptyStringMap;
                        natMap                             = emptyNatMap;

                        approveVoteTotal                   = 0n;
                        disapproveVoteTotal                = 0n;

                        snapshotStakedMvkTotalSupply       = s.snapshotStakedMvkTotalSupply;
                        stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                        startDateTime                      = Tezos.now;            
                        expiryDateTime                     = Tezos.now + (86_400 * s.config.governanceSatelliteDurationInDays);
                    ];

                const actionId : nat = s.governanceSatelliteCounter;

                // save action to governance satellite ledger
                s.governanceSatelliteLedger[actionId] := newGovernanceSatelliteAction;

                // increment governance satellite counter
                s.governanceSatelliteCounter := actionId + 1n;

                // create snapshot in governanceSatelliteSnapshotLedger (to be filled with satellite's )
                const emptyGovernanceSatelliteActionSnapshotMap  : governanceSatelliteSnapshotMapType     = map [];
                s.governanceSatelliteSnapshotLedger[actionId] := emptyGovernanceSatelliteActionSnapshotMap;

                // loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites: map(address, satelliteRecordType) = case activeSatellitesView of [
                      Some (value) -> value
                    | None -> failwith ("Error. GetActiveSatellites View not found in the Delegation Contract")
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

                // check if delegation contract exists
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None           -> failwith("Error. Delegation Contract is not found")
                ];

                // get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith("Error. You need to be a satellite to initiate a governance satellite action.")
                      ]
                    | None -> failwith ("Error. GetSatelliteOpt View not found in the Delegation Contract")
                ];

                // get satellite record for satellite to be suspended
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", satelliteToBeBanned, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith("Error. Satellite to be banned is not found.")
                      ]
                    | None -> failwith ("Error. GetSatelliteOpt View not found in the Delegation Contract")
                ];

                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                const addressMap        : addressMapType     = map [
                    ("satelliteToBeBanned" : string) -> satelliteToBeBanned
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];

                const stakedMvkRequiredForApproval: nat     = abs((s.snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                var newGovernanceSatelliteAction : governanceSatelliteRecordType := record [

                        initiator                          = Tezos.sender;
                        status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                        executed                           = False;

                        governanceType                     = "banSatellite";
                        governancePurpose                  = "";
                        voters                             = emptyVotersMap;

                        addressMap                         = addressMap;
                        stringMap                          = emptyStringMap;
                        natMap                             = emptyNatMap;

                        approveVoteTotal                   = 0n;
                        disapproveVoteTotal                = 0n;

                        snapshotStakedMvkTotalSupply       = s.snapshotStakedMvkTotalSupply;
                        stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                        startDateTime                      = Tezos.now;            
                        expiryDateTime                     = Tezos.now + (86_400 * s.config.governanceSatelliteDurationInDays);
                    ];

                const actionId : nat = s.governanceSatelliteCounter;

                // save action to governance satellite ledger
                s.governanceSatelliteLedger[actionId] := newGovernanceSatelliteAction;

                // increment governance satellite counter
                s.governanceSatelliteCounter := actionId + 1n;

                // create snapshot in governanceSatelliteSnapshotLedger (to be filled with satellite's )
                const emptyGovernanceSatelliteActionSnapshotMap  : governanceSatelliteSnapshotMapType     = map [];
                s.governanceSatelliteSnapshotLedger[actionId] := emptyGovernanceSatelliteActionSnapshotMap;

                // loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites: map(address, satelliteRecordType) = case activeSatellitesView of [
                      Some (value) -> value
                    | None -> failwith ("Error. GetActiveSatellites View not found in the Delegation Contract")
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

                // check if delegation contract exists
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None           -> failwith("Error. Delegation Contract is not found")
                ];

                // get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith("Error. You need to be a satellite to initiate a governance satellite action.")
                      ]
                    | None -> failwith ("Error. GetSatelliteOpt View not found in the Delegation Contract")
                ];

                // get satellite record for satellite to be suspended
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", satelliteToBeUnbanned, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith("Error. Satellite to be unbanned is not found.")
                      ]
                    | None -> failwith ("Error. GetSatelliteOpt View not found in the Delegation Contract")
                ];

                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                const addressMap        : addressMapType     = map [
                    ("satelliteToBeUnbanned" : string) -> satelliteToBeUnbanned
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];

                const stakedMvkRequiredForApproval: nat     = abs((s.snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                var newGovernanceSatelliteAction : governanceSatelliteRecordType := record [

                        initiator                          = Tezos.sender;
                        status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                        executed                           = False;

                        governanceType                     = "unbanSatellite";
                        governancePurpose                  = "";
                        voters                             = emptyVotersMap;

                        addressMap                         = addressMap;
                        stringMap                          = emptyStringMap;
                        natMap                             = emptyNatMap;

                        approveVoteTotal                   = 0n;
                        disapproveVoteTotal                = 0n;

                        snapshotStakedMvkTotalSupply       = s.snapshotStakedMvkTotalSupply;
                        stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                        startDateTime                      = Tezos.now;            
                        expiryDateTime                     = Tezos.now + (86_400 * s.config.governanceSatelliteDurationInDays);
                    ];

                const actionId : nat = s.governanceSatelliteCounter;

                // save action to governance satellite ledger
                s.governanceSatelliteLedger[actionId] := newGovernanceSatelliteAction;

                // increment governance satellite counter
                s.governanceSatelliteCounter := actionId + 1n;

                // create snapshot in governanceSatelliteSnapshotLedger (to be filled with satellite's )
                const emptyGovernanceSatelliteActionSnapshotMap  : governanceSatelliteSnapshotMapType     = map [];
                s.governanceSatelliteSnapshotLedger[actionId] := emptyGovernanceSatelliteActionSnapshotMap;

                // loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites: map(address, satelliteRecordType) = case activeSatellitesView of [
                      Some (value) -> value
                    | None -> failwith ("Error. GetActiveSatellites View not found in the Delegation Contract")
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

                // check if delegation contract exists
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None           -> failwith("Error. Delegation Contract is not found")
                ];

                // get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith("Error. You need to be a satellite to initiate a governance satellite action.")
                      ]
                    | None -> failwith ("Error. GetSatelliteOpt View not found in the Delegation Contract")
                ];

                // get satellite record for satellite in question
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", satelliteAddress, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith("Error. Satellite is not found.")
                      ]
                    | None -> failwith ("Error. GetSatelliteOpt View not found in the Delegation Contract")
                ];

                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                const addressMap        : addressMapType     = map [
                    ("satelliteAddress" : string) -> satelliteAddress
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];

                const stakedMvkRequiredForApproval: nat     = abs((s.snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                var newGovernanceSatelliteAction : governanceSatelliteRecordType := record [

                        initiator                          = Tezos.sender;
                        status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                        executed                           = False;

                        governanceType                     = "removeAllSatelliteOracles";
                        governancePurpose                  = "";
                        voters                             = emptyVotersMap;

                        addressMap                         = addressMap;
                        stringMap                          = emptyStringMap;
                        natMap                             = emptyNatMap;

                        approveVoteTotal                   = 0n;
                        disapproveVoteTotal                = 0n;

                        snapshotStakedMvkTotalSupply       = s.snapshotStakedMvkTotalSupply;
                        stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                        startDateTime                      = Tezos.now;            
                        expiryDateTime                     = Tezos.now + (86_400 * s.config.governanceSatelliteDurationInDays);
                    ];

                const actionId : nat = s.governanceSatelliteCounter;

                // save action to governance satellite ledger
                s.governanceSatelliteLedger[actionId] := newGovernanceSatelliteAction;

                // increment governance satellite counter
                s.governanceSatelliteCounter := actionId + 1n;

                // create snapshot in governanceSatelliteSnapshotLedger (to be filled with satellite's )
                const emptyGovernanceSatelliteActionSnapshotMap  : governanceSatelliteSnapshotMapType     = map [];
                s.governanceSatelliteSnapshotLedger[actionId] := emptyGovernanceSatelliteActionSnapshotMap;

                // loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites: map(address, satelliteRecordType) = case activeSatellitesView of [
                      Some (value) -> value
                    | None -> failwith ("Error. GetActiveSatellites View not found in the Delegation Contract")
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

                // check if delegation contract exists
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None           -> failwith("Error. Delegation Contract is not found")
                ];

                // get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith("Error. You need to be a satellite to initiate a governance satellite action.")
                      ]
                    | None -> failwith ("Error. GetSatelliteOpt View not found in the Delegation Contract")
                ];

                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                const addressMap        : addressMapType     = map [
                    ("oracleAddress"     : string)   -> oracleAddress;
                    ("aggregatorAddress" : string)   -> aggregatorAddress;
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];

                const stakedMvkRequiredForApproval: nat     = abs((s.snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                var newGovernanceSatelliteAction : governanceSatelliteRecordType := record [

                        initiator                          = Tezos.sender;
                        status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                        executed                           = False;

                        governanceType                     = "addOracleToAggregator";
                        governancePurpose                  = "";
                        voters                             = emptyVotersMap;

                        addressMap                         = addressMap;
                        stringMap                          = emptyStringMap;
                        natMap                             = emptyNatMap;

                        approveVoteTotal                   = 0n;
                        disapproveVoteTotal                = 0n;

                        snapshotStakedMvkTotalSupply       = s.snapshotStakedMvkTotalSupply;
                        stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                        startDateTime                      = Tezos.now;            
                        expiryDateTime                     = Tezos.now + (86_400 * s.config.governanceSatelliteDurationInDays);
                    ];

                const actionId : nat = s.governanceSatelliteCounter;

                // save action to governance satellite ledger
                s.governanceSatelliteLedger[actionId] := newGovernanceSatelliteAction;

                // increment governance satellite counter
                s.governanceSatelliteCounter := actionId + 1n;

                // create snapshot in governanceSatelliteSnapshotLedger (to be filled with satellite's )
                const emptyGovernanceSatelliteActionSnapshotMap  : governanceSatelliteSnapshotMapType     = map [];
                s.governanceSatelliteSnapshotLedger[actionId] := emptyGovernanceSatelliteActionSnapshotMap;

                // loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites: map(address, satelliteRecordType) = case activeSatellitesView of [
                      Some (value) -> value
                    | None -> failwith ("Error. GetActiveSatellites View not found in the Delegation Contract")
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

                // check if delegation contract exists
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None           -> failwith("Error. Delegation Contract is not found")
                ];

                // get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith("Error. You need to be a satellite to initiate a governance satellite action.")
                      ]
                    | None -> failwith ("Error. GetSatelliteOpt View not found in the Delegation Contract")
                ];

                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                const addressMap        : addressMapType     = map [
                    ("oracleAddress"     : string)   -> oracleAddress;
                    ("aggregatorAddress" : string)   -> aggregatorAddress;
                ];
                const emptyStringMap    : stringMapType      = map [];
                const emptyNatMap       : natMapType         = map [];

                const stakedMvkRequiredForApproval: nat     = abs((s.snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                var newGovernanceSatelliteAction : governanceSatelliteRecordType := record [

                        initiator                          = Tezos.sender;
                        status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                        executed                           = False;

                        governanceType                     = "removeOracleinAggregator";
                        governancePurpose                  = "";
                        voters                             = emptyVotersMap;

                        addressMap                         = addressMap;
                        stringMap                          = emptyStringMap;
                        natMap                             = emptyNatMap;

                        approveVoteTotal                   = 0n;
                        disapproveVoteTotal                = 0n;

                        snapshotStakedMvkTotalSupply       = s.snapshotStakedMvkTotalSupply;
                        stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                        startDateTime                      = Tezos.now;            
                        expiryDateTime                     = Tezos.now + (86_400 * s.config.governanceSatelliteDurationInDays);
                    ];

                const actionId : nat = s.governanceSatelliteCounter;

                // save action to governance satellite ledger
                s.governanceSatelliteLedger[actionId] := newGovernanceSatelliteAction;

                // increment governance satellite counter
                s.governanceSatelliteCounter := actionId + 1n;

                // create snapshot in governanceSatelliteSnapshotLedger (to be filled with satellite's )
                const emptyGovernanceSatelliteActionSnapshotMap  : governanceSatelliteSnapshotMapType     = map [];
                s.governanceSatelliteSnapshotLedger[actionId] := emptyGovernanceSatelliteActionSnapshotMap;

                // loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites: map(address, satelliteRecordType) = case activeSatellitesView of [
                      Some (value) -> value
                    | None -> failwith ("Error. GetActiveSatellites View not found in the Delegation Contract")
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
// Governance Action Lambdas Begin
// ------------------------------------------------------------------------------

(*  dropAction lambda *)
function lambdaDropAction(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceSatelliteLambdaAction of [
        | LambdaDropAction(dropActionParams) -> {
                
                // init params
                const dropActionId     : nat     = dropActionParams.dropActionId;
                const purpose          : string  = dropActionParams.purpose;

                // check if delegation contract exists
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None           -> failwith("Error. Delegation Contract is not found")
                ];

                // get satellite record for initiator
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith("Error. You need to be a satellite to initiate a governance satellite action.")
                      ]
                    | None -> failwith ("Error. GetSatelliteOpt View not found in the Delegation Contract")
                ];

                const emptyVotersMap  : governanceSatelliteVotersMapType     = map [];

                const emptyAddressMap   : addressMapType     = map [];
                const emptyStringMap    : stringMapType      = map [];
                const natMap            : natMapType         = map [
                  ("dropActionId"     : string)   -> dropActionId;
                ];                

                const stakedMvkRequiredForApproval: nat     = abs((s.snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

                var newGovernanceSatelliteAction : governanceSatelliteRecordType := record [

                        initiator                          = Tezos.sender;
                        status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
                        executed                           = False;

                        governanceType                     = "dropAction";
                        governancePurpose                  = "";
                        voters                             = emptyVotersMap;

                        addressMap                         = emptyAddressMap;
                        stringMap                          = emptyStringMap;
                        natMap                             = natMap;

                        approveVoteTotal                   = 0n;
                        disapproveVoteTotal                = 0n;

                        snapshotStakedMvkTotalSupply       = s.snapshotStakedMvkTotalSupply;
                        stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
                        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

                        startDateTime                      = Tezos.now;            
                        expiryDateTime                     = Tezos.now + (86_400 * s.config.governanceSatelliteDurationInDays);
                    ];

                const actionId : nat = s.governanceSatelliteCounter;

                // save action to governance satellite ledger
                s.governanceSatelliteLedger[actionId] := newGovernanceSatelliteAction;

                // create snapshot in governanceSatelliteSnapshotLedger (to be filled with satellite's )
                const emptyGovernanceSatelliteActionSnapshotMap  : governanceSatelliteSnapshotMapType     = map [];
                s.governanceSatelliteSnapshotLedger[actionId] := emptyGovernanceSatelliteActionSnapshotMap;

                // loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
                const activeSatellitesView : option (map(address, satelliteRecordType)) = Tezos.call_view ("getActiveSatellites", unit, delegationAddress);
                const activeSatellites: map(address, satelliteRecordType) = case activeSatellitesView of [
                      Some (value) -> value
                    | None -> failwith ("Error. GetActiveSatellites View not found in the Delegation Contract")
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

                // increment governance satellite counter
                s.governanceSatelliteCounter := actionId + 1n;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  voteForAction lambda *)
function lambdaVoteForAction(const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorage) : return is
block {
    
    checkNoAmount(Unit); // entrypoint should not receive any tez amount
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case governanceSatelliteLambdaAction of [
        | LambdaVoteForAction(voteForAction) -> {
                
                // check if delegation contract exists
                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None           -> failwith("Error. Delegation Contract is not found")
                ];

                // get satellite record
                const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.sender, delegationAddress);
                case satelliteOptView of [
                      Some (value) -> case value of [
                          Some (_satellite) -> skip
                        | None              -> failwith("Error. You need to be a satellite to vote for a request.")
                      ]
                    | None -> failwith ("Error. GetSatelliteOpt View not found in the Delegation Contract")
                ];

                const actionId : nat = voteForAction.actionId;

                var _governanceSatelliteRecord : governanceSatelliteRecordType := case s.governanceSatelliteLedger[actionId] of [
                      Some(_request) -> _request
                    | None           -> failwith("Error. Governance Satellite Record not found. ")
                ];

                if _governanceSatelliteRecord.status    = False then failwith("Error. Governance Satellite Action has been dropped.")          else skip;
                if _governanceSatelliteRecord.executed  = True  then failwith("Error. Governance Satellite Action has already been executed.") else skip;

                if Tezos.now > _governanceSatelliteRecord.expiryDateTime then failwith("Error. Governance Satellite Action has expired") else skip;

                const governanceSatelliteActionSnapshot : governanceSatelliteSnapshotMapType = case s.governanceSatelliteSnapshotLedger[actionId] of [
                      Some(_snapshot) -> _snapshot
                    | None            -> failwith("Error. Governance Satellite Action snapshot not found.")
                ]; 

                const satelliteSnapshotRecord : governanceSatelliteSnapshotRecordType = case governanceSatelliteActionSnapshot[Tezos.sender] of [ 
                      Some(_record) -> _record
                    | None          -> failwith("Error. Satellite not found in Governance Satellite Action snapshot.")
                ];

                // Save and update satellite's vote record
                const voteType         : governanceSatelliteVoteChoiceType   = voteForAction.vote;
                const totalVotingPower : nat                                 = satelliteSnapshotRecord.totalVotingPower;

            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Governance Action Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Satellite Governance Lambdas End
//
// ------------------------------------------------------------------------------
