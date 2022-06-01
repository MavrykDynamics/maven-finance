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

    case aggregatorFactoryLambdaAction of [
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



(*  togglePauseDisRewardXtz lambda *)
function lambdaTogglePauseDisRewardXtz(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorage): return is
block {

    checkSenderIsAdmin(s);

    case aggregatorFactoryLambdaAction of [
        | LambdaTogglePauseDisRewardXtz(_parameters) -> {
                
                if s.breakGlassConfig.distributeRewardXtzIsPaused then s.breakGlassConfig.distributeRewardXtzIsPaused := False
                else s.breakGlassConfig.distributeRewardXtzIsPaused := True;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseDisRewardSMvk lambda *)
function lambdaTogglePauseDisRewardSMvk(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorage): return is
block {

    checkSenderIsAdmin(s);

    case aggregatorFactoryLambdaAction of [
        | LambdaTogglePauseDisRewardSMvk(_parameters) -> {
                
                if s.breakGlassConfig.distributeRewardMvkIsPaused then s.breakGlassConfig.distributeRewardMvkIsPaused := False
                else s.breakGlassConfig.distributeRewardMvkIsPaused := True;

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
function lambdaCreateAggregator(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorage): return is
block {

    // break glass check
    checkCreateAggregatorIsNotPaused(s);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        | LambdaCreateAggregator(createAggregatorParams) -> {
                
                checkSenderIsAdmin(s);

                // createAggregator parameters declaration
                const observationCommits  : observationCommitsType  = map[];
                const observationReveals  : observationRevealsType  = map[];
                const lastCompletedRoundPrice = record[
                      round= 0n;
                      price= 0n;
                      percentOracleResponse= 0n;
                      priceDateTime= Tezos.now;
                  ];
                const oracleRewardXtz        : oracleRewardXtzType        = map[];
                const oracleRewardStakedMvk  : oracleRewardStakedMvkType  = map[];
                const deviationTriggerInfos  : deviationTriggerInfosType  = record[
                  oracleAddress=Tezos.sender;
                  amount=0tez;
                  roundPrice=0n;
                ];

                const aggregatorWhitelistContracts : whitelistContractsType = map[
                    ("aggregatorFactory")  -> (Tezos.self_address: address);
                ];
                const delegationAddress : address = case s.generalContracts["delegation"] of [ 
                        Some (_address) -> _address
                    |   None            -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];
                const aggregatorGeneralContracts : generalContractsType = map[
                    ("delegation") -> (delegationAddress: address)
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
                const aggregatorBreakGlassConfig : aggregatorBreakGlassConfigType = record[
                    requestRateUpdateIsPaused           = False;
                    requestRateUpdateDeviationIsPaused  = False;
                    setObservationCommitIsPaused        = False;
                    setObservationRevealIsPaused        = False;
                    withdrawRewardXtzIsPaused           = False;
                    withdrawRewardStakedMvkIsPaused     = False;
                ];

                // new Aggregator Storage declaration
                const originatedAggregatorStorage : aggregatorStorage = record [

                  admin                     = createAggregatorParams.2.admin;
                  metadata                  = aggregatorMetadata;
                  config                    = createAggregatorParams.2.aggregatorConfig;
                  breakGlassConfig          = aggregatorBreakGlassConfig;

                  whitelistContracts        = aggregatorWhitelistContracts;      
                  generalContracts          = aggregatorGeneralContracts;
                  
                  mvkTokenAddress           = s.mvkTokenAddress;
                  governanceAddress         = s.governanceAddress;

                  round                     = 0n;
                  roundStart                = Tezos.now;
                  switchBlock               = 0n;

                  oracleAddresses           = createAggregatorParams.2.oracleAddresses;
                  
                  deviationTriggerInfos     = deviationTriggerInfos;
                  lastCompletedRoundPrice   = lastCompletedRoundPrice;
                  
                  observationCommits        = observationCommits;
                  observationReveals        = observationReveals;
                  
                  oracleRewardXtz          = oracleRewardXtz;
                  oracleRewardStakedMvk    = oracleRewardStakedMvk;      

                  lambdaLedger              = aggregatorLambdaLedger;
                  
                ];

                // contract origination
                const aggregatorOrigination: (operation * address) = createAggregatorFunc(
                    (None: option(key_hash)),
                    0tez,
                    originatedAggregatorStorage
                );
                // s.trackedAggregators := Map.add((createAggregatorParams.0, createAggregatorParams.1), aggregatorOrigination.1, s.trackedAggregators);
                s.trackedAggregators := Set.add(aggregatorOrigination.1, s.trackedAggregators);

                operations := aggregatorOrigination.0 # operations; 

            }
        | _ -> skip
    ];

} with(operations, s)



(*  trackAggregator lambda  *)
function lambdaTrackAggregator(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorage): return is
block{

    // Check if sender is admin
    checkSenderIsAdmin(s);

    // Break glass check
    checkTrackAggregatorIsNotPaused(s);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        | LambdaTrackAggregator(aggregatorContract) -> {
                
                s.trackedAggregators := case Set.mem(aggregatorContract, s.trackedAggregators) of [
                        True  -> (failwith(error_AGGREGATOR_ALREADY_TRACKED): set(address))
                    |   False -> Set.add(aggregatorContract, s.trackedAggregators)
                ];

            }
        | _ -> skip
    ];

} with (operations, s)



(*  untrackAggregator lambda  *)
function lambdaUntrackAggregator(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorage): return is
block{

    // Check if sender is admin
    checkSenderIsAdmin(s);

    // Break glass check
    checkUntrackAggregatorIsNotPaused(s);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        | LambdaUntrackAggregator(aggregatorContract) -> {
                
                s.trackedAggregators := case Set.mem(aggregatorContract, s.trackedAggregators) of [
                        True  -> Set.remove(aggregatorContract, s.trackedAggregators)
                    |   False -> (failwith(error_AGGREGATOR_NOT_TRACKED): set(address))
                ];

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
function lambdaDistributeRewardXtz(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorage): return is
block{

    // Break glass check
    checkDistributeRewardXtzIsNotPaused(s);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        | LambdaDistributeRewardXtz(distributeRewardXtzParams) -> {
                
                // check that sender is from a tracked aggregator
                case Set.mem(Tezos.sender, s.trackedAggregators) of [
                        True  -> skip
                    |   False -> failwith(error_SENDER_IS_NOT_TRACKED_AGGREGATOR)
                ];

                const recipient          : address    = distributeRewardXtzParams.recipient;
                const reward             : nat        = distributeRewardXtzParams.reward;
                const tokenTransferType  : tokenType  = Tez;

                const treasuryAddress : address = case s.generalContracts["aggregatorTreasury"] of [
                      Some(_address) -> _address
                    | None -> failwith(error_TREASURY_CONTRACT_NOT_FOUND)
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
function lambdaDistributeRewardStakedMvk(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorage): return is
block{

    // Break glass check
    checkDistributeRewardMvkIsNotPaused(s);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        | LambdaDistributeRewardStakedMvk(distributeRewardStakedMvkParams) -> {
                
                // check that sender is from a tracked aggregator
                case Set.mem(Tezos.sender, s.trackedAggregators) of [
                        True  -> skip
                    |   False -> failwith(error_SENDER_IS_NOT_TRACKED_AGGREGATOR)
                ];

                const delegationAddress : address = case s.generalContracts["delegation"] of [
                      Some(_address) -> _address
                    | None -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
                ];

                const distributeRewardStakedMvkOperation : operation = Tezos.transaction(
                    distributeRewardStakedMvkParams,
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
