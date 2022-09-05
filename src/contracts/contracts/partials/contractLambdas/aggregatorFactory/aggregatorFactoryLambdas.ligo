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
    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

    case aggregatorFactoryLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block {
    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

    case aggregatorFactoryLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateMetadata lambda  *)
function lambdaUpdateMetadata(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block{
  
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance Proxy Contract address)

    case aggregatorFactoryLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateConfig entrypoint  *)
function lambdaUpdateConfig(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block{

    checkSenderIsAdmin(s); // check that sender is admin 

    case aggregatorFactoryLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {

                const updateConfigAction    : aggregatorFactoryUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : aggregatorFactoryUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    |   ConfigAggregatorNameMaxLength (_v)  -> s.config.aggregatorNameMaxLength  := updateConfigNewValue
                    |   Empty (_v)                          -> skip
                ];
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin 
    
    case aggregatorFactoryLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block {
    
    checkSenderIsAdmin(s);  // check that sender is admin
    
    case aggregatorFactoryLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s: aggregatorFactoryStorageType): return is
block {

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        | LambdaMistakenTransfer(destinationParams) -> {

                // Check if the sender is the governanceSatellite contract
                checkSenderIsAdminOrGovernanceSatelliteContract(s);

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
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(*  pauseAll lambda *)
function lambdaPauseAll(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block {

    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
                
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
                    case (Tezos.get_entrypoint_opt("%pauseAll", aggregatorAddress) : option(contract(unit))) of [
                            Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
                        |   None        -> skip
                    ];
                };

            }
        |   _ -> skip
    ];

} with (operations, s)



(*  unpauseAll lambda *)
function lambdaUnpauseAll(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block {

    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
                
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
                    case (Tezos.get_entrypoint_opt("%unpauseAll", aggregatorAddress) : option(contract(unit))) of [
                            Some(contr) -> operations := Tezos.transaction(Unit, 0tez, contr) # operations
                        |   None        -> skip
                    ];
                };

            }
        |   _ -> skip
    ];
    
} with (operations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block {

    checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s); // check that sender is admin

    case aggregatorFactoryLambdaAction of [
        |   LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [
                        CreateAggregator (_v)             -> s.breakGlassConfig.createAggregatorIsPaused := _v
                    |   UntrackAggregator (_v)            -> s.breakGlassConfig.untrackAggregatorIsPaused := _v
                    |   TrackAggregator (_v)              -> s.breakGlassConfig.trackAggregatorIsPaused := _v
                    |   DistributeRewardXtz (_v)          -> s.breakGlassConfig.distributeRewardXtzIsPaused := _v
                    |   DistributeRewardStakedMvk (_v)    -> s.breakGlassConfig.distributeRewardStakedMvkIsPaused := _v
                ]
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Aggregator Factory Lambdas Begin
// ------------------------------------------------------------------------------

(*  createAggregator lambda  *)
function lambdaCreateAggregator(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block {

    // Steps Overview:
    // 1. Standard checks
    //      -   Check that %createAggregator entrypoint is not paused (e.g. glass broken)
    //      -   Check that sender is admin
    // 2. Initialise parameters for new Aggregator Contract
    //      -   Get Governance Satellite Contract Address from the General Contracts Map on the Governance Contract
    //      -   Add Aggregator Factory Contract and Governance Satellite Contract to Whitelisted Contracts Map on the new Aggregator Contract
    //      -   Prepare Aggregator Metadata
    //      -   Validate name input does not exceed max length
    //      -   Declare new Aggregator Storage 
    // 3. Contract origination
    // 4. Add new Aggregator to Tracked Aggregators map on Aggregator Factory
    // 5. Register Aggregator operation to Governance Satellite Contract
    // 6. If addToGeneralContracts boolean is True - add new Aggregator to the Governance Contract - General Contracts Map
    // 7. Execute operations
    
    
    // Check that %createAggregator entrypoint is not paused (e.g. glass broken)
    checkCreateAggregatorIsNotPaused(s);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        |   LambdaCreateAggregator(createAggregatorParams) -> {
                
                checkSenderIsAdmin(s); // check that sender is admin

                // createAggregator parameters declaration
                const deviationTriggerBan  : deviationTriggerBanType  = map[];
                
                const lastCompletedPrice = record[
                      round                 = 0n;
                      epoch                 = 0n;
                      price                 = 0n;
                      percentOracleResponse = 0n;
                      priceDateTime         = Tezos.get_now();
                  ];
                const oracleRewardXtz        : oracleRewardXtzType        = map[];
                const oracleRewardStakedMvk  : oracleRewardStakedMvkType  = map[];


                // Get Governance Satellite Contract Address from the General Contracts Map on the Governance Contract
                const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);

                // Add Aggregator Factory Contract and Governance Satellite Contract to Whitelisted Contracts Map on the new Aggregator Contract
                const aggregatorWhitelistContracts : whitelistContractsType = map[
                    ("aggregatorFactory")   -> (Tezos.get_self_address() : address);
                    ("governanceSatellite") -> (governanceSatelliteAddress : address);
                ];
                
                const aggregatorGeneralContracts : generalContractsType = map[];

                const aggregatorLambdaLedger : lambdaLedgerType = s.aggregatorLambdaLedger;

                const aggregatorBreakGlassConfig : aggregatorBreakGlassConfigType = record[
                    updatePriceIsPaused                 = False;
                    withdrawRewardXtzIsPaused           = False;
                    withdrawRewardStakedMvkIsPaused     = False;
                ];

                // Prepare Aggregator Metadata
                const aggregatorMetadata: metadataType = Big_map.literal (list [
                    ("", Bytes.pack("tezos-storage:data"));
                    ("data", createAggregatorParams.2.metadata);
                ]); 

                // Validate name input does not exceed max length
                const aggregatorName : string = createAggregatorParams.2.name;
                if String.length(aggregatorName) > s.config.aggregatorNameMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;

                // Declare new Aggregator Storage 
                const originatedaggregatorStorageType : aggregatorStorageType = record [

                    admin                     = s.admin;                                      // If governance proxy is the admin, it makes sense that the factory passes its admin to the farm it creates
                    metadata                  = aggregatorMetadata;
                    name                      = aggregatorName;
                    config                    = createAggregatorParams.2.aggregatorConfig;
                    breakGlassConfig          = aggregatorBreakGlassConfig;

                    mvkTokenAddress           = s.mvkTokenAddress;
                    governanceAddress         = s.governanceAddress;

                    whitelistContracts        = aggregatorWhitelistContracts;      
                    generalContracts          = aggregatorGeneralContracts;

                    oracleAddresses           = createAggregatorParams.2.oracleAddresses;
                    
                    lastCompletedPrice        = lastCompletedPrice;
                    
                    deviationTriggerBan       = deviationTriggerBan;
                    
                    oracleRewardXtz           = oracleRewardXtz;
                    oracleRewardStakedMvk     = oracleRewardStakedMvk;      

                    lambdaLedger              = aggregatorLambdaLedger;
                ];

                // Contract origination
                const aggregatorOrigination : (operation * address) = createAggregatorFunc(
                    (None: option(key_hash)),
                    0tez,
                    originatedaggregatorStorageType
                );
                
                // Add new Aggregator to Tracked Aggregators map on Aggregator Factory
                s.trackedAggregators := Map.add((createAggregatorParams.0, createAggregatorParams.1), aggregatorOrigination.1, s.trackedAggregators);

                operations := aggregatorOrigination.0 # operations; 

                // Register Aggregator operation to Governance Satellite Contract
                const registerAggregatorParams : registerAggregatorActionType = record [
                    aggregatorPair      = (createAggregatorParams.0, createAggregatorParams.1);
                    aggregatorAddress   = aggregatorOrigination.1
                ];
                
                const registerAggregatorOperation : operation = Tezos.transaction(
                    registerAggregatorParams,
                    0tez,
                    getRegisterAggregatorInGovernanceSatelliteEntrypoint(governanceSatelliteAddress)
                );

                // If addToGeneralContracts boolean is True - add new Aggregator to the Governance Contract - General Contracts Map
                if createAggregatorParams.2.addToGeneralContracts = True then {
                    
                    const updateGeneralMapRecord : updateGeneralContractsType = record [
                        generalContractName    = aggregatorName;
                        generalContractAddress = aggregatorOrigination.1;
                    ];

                    const updateContractGeneralMapEntrypoint: contract(updateGeneralContractsType) = case (Tezos.get_entrypoint_opt("%updateGeneralContracts", s.governanceAddress) : option(contract(updateGeneralContractsType))) of [
                            Some (contr) -> contr
                        |   None         -> (failwith(error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_NOT_FOUND) : contract(updateGeneralContractsType))
                    ];

                    // Operation to update General Contracts Map on the Governance Contract
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
        |   _ -> skip
    ];

} with (operations, s)



(*  trackAggregator lambda  *)
function lambdaTrackAggregator(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block{

    // Steps Overview:
    // 1. Standard checks
    //      -   Check that %trackAggregator entrypoint is not paused (e.g. glass broken)
    //      -   Check that sender is admin
    // 2. Check if Aggregator Pair exists (e.g. BTC/USD) 
    //      -   Add Aggregator Contract to Tracked Aggregators Map if Aggregator Pair does not exist

    // Check that %trackAggregator entrypoint is not paused (e.g. glass broken)
    checkTrackAggregatorIsNotPaused(s);

    // Check if sender is admin
    checkSenderIsAdmin(s);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        |   LambdaTrackAggregator(trackAggregatorParams) -> {
                
                s.trackedAggregators := case Map.mem((trackAggregatorParams.pairFirst, trackAggregatorParams.pairSecond), s.trackedAggregators) of [
                        True  -> failwith(error_AGGREGATOR_ALREADY_TRACKED)
                    |   False -> Map.add((trackAggregatorParams.pairFirst, trackAggregatorParams.pairSecond), trackAggregatorParams.aggregatorAddress, s.trackedAggregators)
                ];

            }
        |   _ -> skip
    ];

} with (operations, s)



(*  untrackAggregator lambda  *)
function lambdaUntrackAggregator(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block{

    // Steps Overview:
    // 1. Standard checks
    //      -   Check that %untrackAggregator entrypoint is not paused (e.g. glass broken)
    //      -   Check that sender is admin
    // 2. Remove Aggregator Contract from Tracked Aggregators Map 

    // Check that %untrackAggregator entrypoint is not paused (e.g. glass broken)
    checkUntrackAggregatorIsNotPaused(s);

    // Check if sender is admin
    checkSenderIsAdmin(s);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        |   LambdaUntrackAggregator(untrackAggregatorParams) -> {

                s.trackedAggregators := Map.update((untrackAggregatorParams.pairFirst, untrackAggregatorParams.pairSecond), (None : option(address)), s.trackedAggregators);

            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Aggregator Factory Lambdas End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Aggregator Lambdas Begin
// ------------------------------------------------------------------------------

(*  distributeRewardXtz lambda  *)
function lambdaDistributeRewardXtz(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block{

    // Steps Overview:
    // 1. Standard checks
    //      -   Check that %distributeRewardXtz entrypoint is not paused (e.g. glass broken)
    //      -   Check that sender is from a tracked Aggregator Contract
    // 2. Get Aggregator Treasury Contract Address from the General Contracts Map on the Governance Contract
    // 3. Create operation to transfer XTZ reward from Aggregator Treasury to oracle recipient


    // Check that %distributeRewardXtz entrypoint is not paused (e.g. glass broken)
    checkDistributeRewardXtzIsNotPaused(s);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        |   LambdaDistributeRewardXtz(distributeRewardXtzParams) -> {
                
                // Check that sender is from a tracked Aggregator Contract
                if checkInTrackedAggregators(Tezos.get_sender(), s) = True then skip else failwith(error_SENDER_IS_NOT_TRACKED_AGGREGATOR);

                // init params
                const recipient          : address    = distributeRewardXtzParams.recipient;
                const reward             : nat        = distributeRewardXtzParams.reward;
                const tokenTransferType  : tokenType  = Tez;

                // Get Aggregator Treasury Contract Address from the General Contracts Map on the Governance Contract
                const treasuryAddress : address = getContractAddressFromGovernanceContract("aggregatorTreasury", s.governanceAddress, error_TREASURY_CONTRACT_NOT_FOUND);

                // Create operation to transfer XTZ reward from Aggregator Treasury to oracle recipient
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
        |   _ -> skip
    ];    

} with (operations, s)



(*  distributeRewardStakedMvk lambda  *)
function lambdaDistributeRewardStakedMvk(const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is
block{

    // Steps Overview:
    // 1. Standard checks
    //      -   Check that %distributeRewardStakedMvk entrypoint is not paused (e.g. glass broken)
    //      -   Check that sender is from a tracked Aggregator Contract
    // 2. Get Delegation Contract Address from the General Contracts Map on the Governance Contract
    // 3. Create operation to distribute staked MVK reward to oracle recipient through the %distributeReward entrypoint on the Delegation Contract

    // Check that %distributeRewardStakedMvk entrypoint is not paused (e.g. glass broken)
    checkDistributeRewardStakedMvkIsNotPaused(s);

    var operations : list(operation) := nil;

    case aggregatorFactoryLambdaAction of [
        |   LambdaDistributeRewardStakedMvk(distributeRewardStakedMvkParams) -> {
                
                // Check that sender is from a tracked Aggregator Contract
                if checkInTrackedAggregators(Tezos.get_sender(), s) = True then skip else failwith(error_SENDER_IS_NOT_TRACKED_AGGREGATOR);

                // Get Delegation Contract Address from the General Contracts Map on the Governance Contract
                const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

                // Create operation to distribute staked MVK reward to oracle recipient through the %distributeReward entrypoint on the Delegation Contract
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
        |   _ -> skip
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
