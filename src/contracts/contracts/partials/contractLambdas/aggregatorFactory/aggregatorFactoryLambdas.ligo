// ------------------------------------------------------------------------------
//
// Aggregator Factory Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block {
    
    checkSenderIsAllowed(s); // check that sender is admin

    case aggregatorFactoryLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block {
    
    checkSenderIsAllowed(s);

    case aggregatorFactoryLambdaAction of [
        | LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateMetadata lambda  *)
function lambdaUpdateMetadata(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorageType): return is
block{
  
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)

    case aggregatorFactoryLambdaAction of [
        | LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateConfig entrypoint  *)
function lambdaUpdateConfig(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorageType): return is
block{

    checkSenderIsAdmin(s);

    case aggregatorFactoryLambdaAction of [
        | LambdaUpdateConfig(updateConfigParams) -> {

                const updateConfigAction    : aggregatorFactoryUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : aggregatorFactoryUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    | ConfigAggregatorNameMaxLength (_v)  -> s.config.aggregatorNameMaxLength  := updateConfigNewValue
                    | Empty (_v)                          -> skip
                ];
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorageType): return is
block {
    
    checkSenderIsAdmin(s);
    
    case aggregatorFactoryLambdaAction of [
        | LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorageType): return is
block {
    
    checkSenderIsAdmin(s);
    
    case aggregatorFactoryLambdaAction of [
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
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(*  pauseAll lambda *)
function lambdaPauseAll(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType): return is
block {

    checkSenderIsAllowed(s);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        | LambdaPauseAll(_parameters) -> {
                
                // set all pause configs to True
                if s.breakGlassConfig.createAggregatorIsPaused then skip
                else s.breakGlassConfig.createAggregatorIsPaused := True;

                if s.breakGlassConfig.trackAggregatorIsPaused then skip
                else s.breakGlassConfig.trackAggregatorIsPaused := True;

                if s.breakGlassConfig.untrackAggregatorIsPaused then skip
                else s.breakGlassConfig.untrackAggregatorIsPaused := True;

                if s.breakGlassConfig.distributeRewardStakedMvkIsPaused then skip
                else s.breakGlassConfig.distributeRewardStakedMvkIsPaused := True;

                if s.breakGlassConfig.distributeRewardXtzIsPaused then skip
                else s.breakGlassConfig.distributeRewardXtzIsPaused := True;

                for _key -> aggregatorAddress in map s.trackedAggregators
                block {
                    case (Tezos.get_entrypoint_opt("%pauseAll", aggregatorAddress): option(contract(unit))) of [
                            Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
                        |   None        -> skip
                    ];
                };

            }
        | _ -> skip
    ];

} with (operations, s)



(*  unpauseAll lambda *)
function lambdaUnpauseAll(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType): return is
block {

    checkSenderIsAllowed(s);

    var operations: list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        | LambdaUnpauseAll(_parameters) -> {
                
                // set all pause configs to False
                if s.breakGlassConfig.createAggregatorIsPaused then s.breakGlassConfig.createAggregatorIsPaused := False
                else skip;

                if s.breakGlassConfig.trackAggregatorIsPaused then s.breakGlassConfig.trackAggregatorIsPaused := False
                else skip;

                if s.breakGlassConfig.untrackAggregatorIsPaused then s.breakGlassConfig.untrackAggregatorIsPaused := False
                else skip;

                if s.breakGlassConfig.distributeRewardStakedMvkIsPaused then s.breakGlassConfig.distributeRewardStakedMvkIsPaused := False
                else skip;

                if s.breakGlassConfig.distributeRewardXtzIsPaused then s.breakGlassConfig.distributeRewardXtzIsPaused := False
                else skip;

                for _key -> aggregatorAddress in map s.trackedAggregators
                block {
                    case (Tezos.get_entrypoint_opt("%unpauseAll", aggregatorAddress): option(contract(unit))) of [
                            Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
                        |   None        -> skip
                    ];
                };

            }
        | _ -> skip
    ];
    
} with (operations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorageType) : return is
block {

    checkNoAmount(Unit);
    checkSenderIsAdmin(s);

    case aggregatorFactoryLambdaAction of [
        | LambdaTogglePauseEntrypoint(targetEntrypoint) -> {

                case targetEntrypoint of [
                    ToggleCreateAggregator (_v)             -> s.breakGlassConfig.createAggregatorIsPaused := _v
                |   ToggleUntrackAggregator (_v)            -> s.breakGlassConfig.untrackAggregatorIsPaused := _v
                |   ToggleTrackAggregator (_v)              -> s.breakGlassConfig.trackAggregatorIsPaused := _v
                |   ToggleDistributeRewardXtz (_v)          -> s.breakGlassConfig.distributeRewardXtzIsPaused := _v
                |   ToggleDistributeRewardSmvk (_v)         -> s.breakGlassConfig.distributeRewardStakedMvkIsPaused := _v
                ]
                
            }
        | _ -> skip
    ];

} with (noOperations, s)



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Aggregator Factory Lambdas Begin
// ------------------------------------------------------------------------------

(*  createAggregator lambda  *)
function lambdaCreateAggregator(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorageType): return is
block {

    // break glass check
    checkCreateAggregatorIsNotPaused(s);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        | LambdaCreateAggregator(createAggregatorParams) -> {
                
                checkSenderIsAdmin(s);

                // createAggregator parameters declaration
                const observationCommits   : observationCommitsType   = map[];
                const observationReveals   : observationRevealsType   = map[];
                const deviationTriggerBan  : deviationTriggerBanType  = map[];
                
                const lastCompletedRoundPrice = record[
                      round                 = 0n;
                      price                 = 0n;
                      percentOracleResponse = 0n;
                      priceDateTime         = Tezos.now;
                  ];
                const oracleRewardXtz        : oracleRewardXtzType        = map[];
                const oracleRewardStakedMvk  : oracleRewardStakedMvkType  = map[];
                const deviationTriggerInfos  : deviationTriggerInfosType  = record[
                  oracleAddress             = Tezos.sender;
                  roundPrice                = 0n;
                ];

                // get governance satellite address
                const governanceSatelliteAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "governanceSatellite", s.governanceAddress);
                const governanceSatelliteAddress: address = case governanceSatelliteAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                const aggregatorWhitelistContracts : whitelistContractsType = map[
                    ("aggregatorFactory")   -> (Tezos.self_address : address);
                    ("governanceSatellite") -> (governanceSatelliteAddress : address);
                ];
                
                const aggregatorGeneralContracts : generalContractsType = map[];

                const aggregatorLambdaLedger : lambdaLedgerType = s.aggregatorLambdaLedger;

                const aggregatorBreakGlassConfig : aggregatorBreakGlassConfigType = record[
                    requestRateUpdateIsPaused           = False;
                    requestRateUpdateDeviationIsPaused  = False;
                    setObservationCommitIsPaused        = False;
                    setObservationRevealIsPaused        = False;
                    withdrawRewardXtzIsPaused           = False;
                    withdrawRewardStakedMvkIsPaused     = False;
                ];

                // Prepare Aggregator Metadata
                const aggregatorMetadata: metadataType = Big_map.literal (list [
                    ("", Bytes.pack("tezos-storage:data"));
                    ("data", createAggregatorParams.2.metadata);
                ]); 

                // check name length
                const aggregatorName : string = createAggregatorParams.2.name;
                if String.length(aggregatorName) > s.config.aggregatorNameMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // new Aggregator Storage declaration
                const originatedaggregatorStorageType : aggregatorStorageType = record [

                    admin                     = s.admin;                                      // If governance proxy is the admin, it makes sense that the factory passes its admin to the farm it creates
                    metadata                  = aggregatorMetadata;
                    name                      = aggregatorName;
                    config                    = createAggregatorParams.2.aggregatorConfig;
                    breakGlassConfig          = aggregatorBreakGlassConfig;

                    maintainer                = createAggregatorParams.2.maintainer;
                    mvkTokenAddress           = s.mvkTokenAddress;
                    governanceAddress         = s.governanceAddress;

                    whitelistContracts        = aggregatorWhitelistContracts;      
                    generalContracts          = aggregatorGeneralContracts;

                    round                     = 0n;
                    roundStart                = Tezos.now;
                    switchBlock               = 0n;

                    oracleAddresses           = createAggregatorParams.2.oracleAddresses;
                    
                    deviationTriggerInfos     = deviationTriggerInfos;
                    lastCompletedRoundPrice   = lastCompletedRoundPrice;
                    
                    observationCommits        = observationCommits;
                    observationReveals        = observationReveals;
                    deviationTriggerBan       = deviationTriggerBan;
                    
                    oracleRewardXtz           = oracleRewardXtz;
                    oracleRewardStakedMvk     = oracleRewardStakedMvk;      

                    lambdaLedger              = aggregatorLambdaLedger;
                ];

                // contract origination
                const aggregatorOrigination : (operation * address) = createAggregatorFunc(
                    (None: option(key_hash)),
                    0tez,
                    originatedaggregatorStorageType
                );
                
                s.trackedAggregators := Map.add((createAggregatorParams.0, createAggregatorParams.1), aggregatorOrigination.1, s.trackedAggregators);

                operations := aggregatorOrigination.0 # operations; 

                // register aggregator operation to governance satellite contract
                const registerAggregatorParams : registerAggregatorActionType = record [
                    aggregatorPair      = (createAggregatorParams.0, createAggregatorParams.1);
                    aggregatorAddress   = aggregatorOrigination.1
                ];
                
                const registerAggregatorOperation : operation = Tezos.transaction(
                    registerAggregatorParams,
                    0tez,
                    getRegisterAggregatorInGovernanceSatelliteEntrypoint(governanceSatelliteAddress)
                );

                // Add the aggregator to the governance general contracts map
                if createAggregatorParams.2.addToGeneralContracts = True then {
                    
                    const updateGeneralMapRecord : updateGeneralContractsType = record [
                        generalContractName    = aggregatorName;
                        generalContractAddress = aggregatorOrigination.1;
                    ];

                    const updateContractGeneralMapEntrypoint: contract(updateGeneralContractsType) = case (Tezos.get_entrypoint_opt("%updateGeneralContracts", s.governanceAddress): option(contract(updateGeneralContractsType))) of [
                            Some (contr) -> contr
                        |   None        -> (failwith(error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_NOT_FOUND) : contract(updateGeneralContractsType))
                    ];

                    // updateContractGeneralMap operation
                    const updateContractGeneralMapOperation : operation = Tezos.transaction(
                        updateGeneralMapRecord,
                        0tez, 
                        updateContractGeneralMapEntrypoint
                    );

                    operations := updateContractGeneralMapOperation # operations;

                }
                else skip;

                operations := registerAggregatorOperation # operations;

            }
        | _ -> skip
    ];

} with(operations, s)



(*  trackAggregator lambda  *)
function lambdaTrackAggregator(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorageType): return is
block{

    // Check if sender is admin
    checkSenderIsAdmin(s);

    // Break glass check
    checkTrackAggregatorIsNotPaused(s);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        | LambdaTrackAggregator(trackAggregatorParams) -> {
                
                s.trackedAggregators := case Map.mem((trackAggregatorParams.pairFirst, trackAggregatorParams.pairSecond), s.trackedAggregators) of [
                        True  -> failwith(error_AGGREGATOR_ALREADY_TRACKED)
                    |   False -> Map.add((trackAggregatorParams.pairFirst, trackAggregatorParams.pairSecond), trackAggregatorParams.aggregatorAddress, s.trackedAggregators)
                ];

            }
        | _ -> skip
    ];

} with (operations, s)



(*  untrackAggregator lambda  *)
function lambdaUntrackAggregator(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorageType): return is
block{

    // Check if sender is admin
    checkSenderIsAdmin(s);

    // Break glass check
    checkUntrackAggregatorIsNotPaused(s);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        | LambdaUntrackAggregator(untrackAggregatorParams) -> {

                s.trackedAggregators := Map.update((untrackAggregatorParams.pairFirst, untrackAggregatorParams.pairSecond), (None : option(address)), s.trackedAggregators);

            }
        | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Aggregator Factory Lambdas End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Aggregator Lambdas Begin
// ------------------------------------------------------------------------------

(*  distributeRewardXtz lambda  *)
function lambdaDistributeRewardXtz(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorageType): return is
block{

    // Break glass check
    checkDistributeRewardXtzIsNotPaused(s);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        | LambdaDistributeRewardXtz(distributeRewardXtzParams) -> {
                
                // check that sender is from a tracked aggregator
                if checkInTrackedAggregators(Tezos.sender, s) = True then skip else failwith(error_SENDER_IS_NOT_TRACKED_AGGREGATOR);

                const recipient          : address    = distributeRewardXtzParams.recipient;
                const reward             : nat        = distributeRewardXtzParams.reward;
                const tokenTransferType  : tokenType  = Tez;

                // get aggregator treasury address
                const aggregatorTreasuryGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "aggregatorTreasury", s.governanceAddress);
                const treasuryAddress: address = case aggregatorTreasuryGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_TREASURY_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                const transferTokenParams : transferActionType = list[
                    record [
                        to_        = recipient;
                        token      = tokenTransferType;
                        amount     = reward;
                    ]
                ];

                const treasuryTransferOperation : operation = Tezos.transaction(
                    transferTokenParams, 
                    0tez, 
                    sendTransferOperationToTreasury(treasuryAddress)
                );

                operations := treasuryTransferOperation # operations;

            }
        | _ -> skip
    ];    

} with (operations, s)



(*  distributeRewardStakedMvk lambda  *)
function lambdaDistributeRewardStakedMvk(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorageType): return is
block{

    // Break glass check
    checkDistributeRewardStakedMvkIsNotPaused(s);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        | LambdaDistributeRewardStakedMvk(distributeRewardStakedMvkParams) -> {
                
                // check that sender is from a tracked aggregator
                if checkInTrackedAggregators(Tezos.sender, s) = True then skip else failwith(error_SENDER_IS_NOT_TRACKED_AGGREGATOR);

                // get delegation address
                const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
                const delegationAddress: address = case delegationAddressGeneralContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                const rewardParams : distributeRewardStakedMvkType = record [
                    eligibleSatellites   = distributeRewardStakedMvkParams.eligibleSatellites;
                    totalStakedMvkReward = distributeRewardStakedMvkParams.totalStakedMvkReward;
                ];

                const distributeRewardStakedMvkOperation : operation = Tezos.transaction(
                    rewardParams,
                    0tez,
                    getDistributeRewardInDelegationEntrypoint(delegationAddress)
                );

                operations := distributeRewardStakedMvkOperation # operations;

            }
        | _ -> skip
    ];    

} with (operations, s)

// ------------------------------------------------------------------------------
// Aggregator Lambdas End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
//
// Aggregator Factory Lambdas End
//
// ------------------------------------------------------------------------------
