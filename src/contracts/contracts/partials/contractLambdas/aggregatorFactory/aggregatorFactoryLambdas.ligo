// ------------------------------------------------------------------------------
//
// Aggregator Factory Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorage) : return is
block {
    
    checkNoAmount(Unit);    // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin

    case aggregatorFactoryLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorage) : return is
block {
    
    checkNoAmount(Unit);     // entrypoint should not receive any tez amount
    checkSenderIsAllowed(s);

    case aggregatorLambdaAction of [
        | LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateMetadata lambda  *)
function lambdaUpdateMetadata(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorage): return is
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



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorage): return is
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
function lambdaUpdateGeneralContracts(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorage): return is
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
function lambdaPauseAll(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorage): return is
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

                for aggregatorAddress in set s.trackedAggregators
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
function lambdaUnpauseAll(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorage): return is
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

                for aggregatorAddress in set s.trackedAggregators
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



(*  togglePauseCreateAgg lambda *)
function lambdaTogglePauseCreateAgg(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorage): return is
block {

    checkSenderIsAdmin(s);

    case aggregatorFactoryLambdaAction of [
        | LambdaTogglePauseCreateAgg(_parameters) -> {
                
                if s.breakGlassConfig.createAggregatorIsPaused then s.breakGlassConfig.createAggregatorIsPaused := False
                else s.breakGlassConfig.createAggregatorIsPaused := True;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseUntrackAgg lambda *)
function lambdaTogglePauseUntrackAgg(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorage): return is
block {

    checkSenderIsAdmin(s);

    case aggregatorFactoryLambdaAction of [
        | LambdaTogglePauseUntrackAgg(_parameters) -> {
                
                if s.breakGlassConfig.untrackAggregatorIsPaused then s.breakGlassConfig.untrackAggregatorIsPaused := False
                else s.breakGlassConfig.untrackAggregatorIsPaused := True;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseTrackAgg lambda *)
function lambdaTogglePauseTrackAgg(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorage): return is
block {

    checkSenderIsAdmin(s);

    case aggregatorFactoryLambdaAction of [
        | LambdaTogglePauseTrackAgg(_parameters) -> {
                
                if s.breakGlassConfig.trackAggregatorIsPaused then s.breakGlassConfig.trackAggregatorIsPaused := False
                else s.breakGlassConfig.trackAggregatorIsPaused := True;

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

(*  updateAggregatorAdmin lambda  *)
function lambdaUpdateAggregatorAdmin(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorage): return is
block{

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        | LambdaUpdateAggregatorAdmin(updateAggregatorAdminParams) -> {
                checkSenderIsAdmin(s);
                const updateAggregatorAdminOperation = updateAggregatorAdminOperation(updateAggregatorAdminParams.satelliteAddress, updateAggregatorAdminParams.adminAddress);
                operations := updateAggregatorAdminOperation # operations;
            }
        | _ -> skip
    ];    

} with (operations, s)



(*  updateAggregatorConfig lambda  *)
function lambdaUpdateAggregatorConfig(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorage): return is
block{

    var operations : list(operation) := nil;
    
    case aggregatorFactoryLambdaAction of [
        | LambdaUpdateAggregatorConfig(updateAggregatorConfigParams) -> {
                checkSenderIsAdmin(s);
                const updateAggregatorConfigOperation = updateAggregatorConfigOperation(updateAggregatorConfigParams.satelliteAddress, updateAggregatorConfigParams.aggregatorConfig);
                operations := updateAggregatorConfigOperation # operations;
            }
        | _ -> skip
    ];

} with (operations,s)



(*  addSatellite lambda  *)
function lambdaAddSatellite(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorage): return is
block{

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        | LambdaAddSatellite(satelliteAddress) -> {
                
                checkSenderIsAdmin(s);
                const newSet: trackedSatelliteType = Set.add (satelliteAddress, s.trackedSatellites);
                
                for _key -> value in map s.trackedAggregators block {
                    const operation = addOracleOperation(value, satelliteAddress);
                    operations := operation # operations;
                };

                s.trackedSatellites := newSet;

            }
        | _ -> skip
    ];

} with (operations, s)



(*  banSatellite lambda  *)
function lambdaBanSatellite(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorage): return is
block{

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        | LambdaBanSatellite(satelliteAddress) -> {
                
                checkSenderIsAdmin(s);
                checkIfAddressContainInTrackedSatelliteSet(satelliteAddress, s.trackedSatellites);

                const newSet: trackedSatelliteType = Set.remove (satelliteAddress, s.trackedSatellites);
                
                for _key -> value in map s.trackedAggregators block {
                    const operation = removeOracleOperation(value, satelliteAddress);
                    operations := operation # operations;
                };

                s.trackedSatellites := newSet;
            }
        | _ -> skip
    ];

} with (operations, s)


(*  createAggregator lambda  *)
function lambdaCreateAggregator(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorage): return is
block {

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        | LambdaCreateAggregator(createAggregatorParams) -> {
                
                checkSenderIsAdmin(s);

                // createAggregator parameters declaration
                const observationCommits: observationCommitsType = map[];
                const observationReveals: observationRevealsType = map[];
                const lastCompletedRoundPrice = record[
                      round= 0n;
                      price= 0n;
                      percentOracleResponse= 0n;
                      priceDateTime= Tezos.now;
                  ];
                const oracleRewardsXTZ: oracleRewardsXTZType = map[];
                const oracleRewardsMVK: oracleRewardsMVKType = map[];
                const deviationTriggerInfos: deviationTriggerInfosType = record[
                  oracleAddress=Tezos.sender;
                  amount=0tez;
                  roundPrice=0n;
                ];

                const aggregatorLambdaLedger : map(string, bytes) = s.aggregatorLambdaLedger;

                const aggregatorMetadataPlain : aggregatorMetadataType = record[
                    name                    = "MAVRYK Aggregator";
                    description             = "MAVRYK Aggregator Contract";
                    version                 =  "v1.0.0";
                    authors                 = "MAVRYK Dev Team <contact@mavryk.finance>";
                ];
                const aggregatorMetadata : metadataType = Big_map.literal (list [
                    ("", Bytes.pack(aggregatorMetadataPlain));
                ]);

                // new Aggregator Storage declaration
                const originatedAggregatorStorage : aggregatorStorage = record [

                  admin                     = createAggregatorParams.2.admin;
                  metadata                  = aggregatorMetadata;
                  config                    = createAggregatorParams.2.aggregatorConfig;
                  
                  mvkTokenAddress           = s.mvkTokenAddress;
                  delegationAddress         = s.delegationAddress;
                  governanceAddress         = s.governanceAddress;

                  round                     = 0n;
                  roundStart                = Tezos.now;
                  switchBlock               = 0n;

                  oracleAddresses           = createAggregatorParams.2.oracleAddresses;
                  
                  deviationTriggerInfos     = deviationTriggerInfos;
                  lastCompletedRoundPrice   = lastCompletedRoundPrice;
                  
                  observationCommits        = observationCommits;
                  observationReveals        = observationReveals;
                  
                  oracleRewardsXTZ          = oracleRewardsXTZ;
                  oracleRewardsMVK          = oracleRewardsMVK;      

                  lambdaLedger              = aggregatorLambdaLedger;
                  
                ];

                // contract origination
                const aggregatorOrigination: (operation * address) = createAggregatorFunc(
                    (None: option(key_hash)),
                    0tez,
                    originatedAggregatorStorage
                );
                s.trackedAggregators := Map.add((createAggregatorParams.0, createAggregatorParams.1), aggregatorOrigination.1, s.trackedAggregators);

                operations := aggregatorOrigination.0 # operations; 

            }
        | _ -> skip
    ];

} with(operations, s)

// ------------------------------------------------------------------------------
// Aggregator Factory Lambdas Begin
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Aggregator Factory Lambdas End
//
// ------------------------------------------------------------------------------
