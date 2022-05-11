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

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
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

                  round                     = 0n;
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
