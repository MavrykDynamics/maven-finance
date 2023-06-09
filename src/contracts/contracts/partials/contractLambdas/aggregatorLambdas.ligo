// ------------------------------------------------------------------------------
//
// Aggregator Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);  

    case aggregatorLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);  

    case aggregatorLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setName lambda *)
function lambdaSetName(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block {

    // Steps Overview: 
    // 1. Check that no tez is sent to this entrypoint
    // 2. Check that sender is admin (i.e. Governance Proxy Contract address)
    // 3. Get Aggregator Factory address
    // 4. Get Config from Aggregator Factory through on-chain views, and get aggregatorNameMaxLength variable
    // 5. Validate that new name input does not exceed aggregatorNameMaxLength
    // 6. Set new name on Aggregator Contract
    
    // verify that sender is admin (i.e. Governance Proxy Contract address)
    verifySenderIsAdmin(s.admin); 

    var operations : list(operation) := nil;

    case aggregatorLambdaAction of [
        |   LambdaSetName(updatedName) -> {

                // Get Governance Satellite Contract Address from the General Contracts Map on the Governance Contract
                const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);

                // Update the reference in the governanceSatellite contract
                const setAggregatorReferenceParams : setAggregatorReferenceType = record [
                    aggregatorAddress   = Tezos.get_self_address();
                    oldName             = s.name;
                    newName             = updatedName;
                ];

                operations :=  Tezos.transaction(
                    setAggregatorReferenceParams,
                    0tez,
                    getSetAggregatorReferenceInGovernanceSatelliteEntrypoint(governanceSatelliteAddress)
                ) # operations;

                // Get aggregator factory address
                const aggregatorFactoryAddress : address = getContractAddressFromGovernanceContract("aggregatorFactory", s.governanceAddress, error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND);
            
                // Get aggregator name max length from factory contract
                const aggregatorFactoryConfigView : option (aggregatorFactoryConfigType) = Tezos.call_view ("getConfig", unit, aggregatorFactoryAddress);
                const aggregatorNameMaxLength : nat = case aggregatorFactoryConfigView of [
                        Some (_config) -> _config.aggregatorNameMaxLength
                    |   None           -> failwith (error_GET_CONFIG_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND)
                ];

                // Set new name on aggregator contract if nameMaxLength is not exceeded
                if String.length(updatedName) > aggregatorNameMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                s.name := updatedName;

            }
        |   _ -> skip
    ];

} with (operations, s)



(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block {
    
    // check that sender is admin 
    verifySenderIsAdmin(s.admin); 

    case aggregatorLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        |   _ -> skip
    ];

} with (noOperations, s)




(*  updateConfig entrypoint  *)
function lambdaUpdateConfig(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block{

    // check that sender is admin
    verifySenderIsAdmin(s.admin);

    case aggregatorLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {

                const updateConfigAction    : aggregatorUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : aggregatorUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    |   ConfigDecimals (_v)                  -> s.config.decimals                             := updateConfigNewValue
                    |   ConfigAlphaPercentPerThousand (_v)   -> s.config.alphaPercentPerThousand              := updateConfigNewValue

                    |   ConfigPercentOracleThreshold (_v)    -> s.config.percentOracleThreshold               := updateConfigNewValue
                    |   ConfigHeartBeatSeconds (_v)          -> s.config.heartBeatSeconds                     := updateConfigNewValue
                    
                    |   ConfigRewardAmountStakedMvk (_v)     -> s.config.rewardAmountStakedMvk                := updateConfigNewValue
                    |   ConfigRewardAmountXtz (_v)           -> s.config.rewardAmountXtz                      := updateConfigNewValue
                ];
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block {
    
    // check that sender is admin
    verifySenderIsAdmin(s.admin); 
    
    case aggregatorLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block {

    // check that sender is admin
    verifySenderIsAdmin(s.admin); 
    
    case aggregatorLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorageType): return is
block {

    var operations : list(operation) := nil;

    case aggregatorLambdaAction of [
        | LambdaMistakenTransfer(destinationParams) -> {

                // Check if the sender is the governanceSatellite contract
                verifySenderIsAdminOrGovernanceSatelliteContract(s);

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
// Admin Oracle Lambdas Begin
// ------------------------------------------------------------------------------

(*  addOracle entrypoint  *)
function lambdaAddOracle(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block {
    
    // verify sender is admin or governance satellite contract
    verifySenderIsAdminOrGovernanceSatelliteContract(s);  

    case aggregatorLambdaAction of [
        |   LambdaAddOracle(addOracleParams) -> {
                
                const oracleAddress : address = addOracleParams.oracleAddress;

                // Verify that satellite is not already a registered oracle on this aggregator
                verifySatelliteIsNotRegisteredOracle(oracleAddress, s);

                // get oracle infromation from the delegation contract
                const oracleInformation : oracleInformationType = getOracleInformation(oracleAddress, s);
                
                // update storage
                s.oracleLedger[oracleAddress]   := oracleInformation;
                s.oracleLedgerSize              := s.oracleLedgerSize + 1n;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateOracle entrypoint  *)
function lambdaUpdateOracle(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block {
    
    case aggregatorLambdaAction of [
        |   LambdaUpdateOracle(_parameters) -> {

                // Verify that sender is a registered oracle on this aggregator
                verifySenderIsRegisteredOracle(s);
                
                // Get oracle infromation from the delegation contract
                const oracleInformation : oracleInformationType = getOracleInformation(Tezos.get_sender(), s);
                
                // Update storage
                s.oracleLedger[Tezos.get_sender()]  := oracleInformation;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  removeOracle entrypoint  *)
function lambdaRemoveOracle(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block {
    
    // verify sender is admin or governance satellite contract
    verifySenderIsAdminOrGovernanceSatelliteContract(s);

    case aggregatorLambdaAction of [
        |   LambdaRemoveOracle(oracleAddress) -> {

                // Verify that address is a registered oracle
                verifySatelliteIsRegisteredOracle(oracleAddress, s);

                // Remove oracle from oracle addresses
                s.oracleLedger      := Big_map.remove(oracleAddress, s.oracleLedger);
                s.oracleLedgerSize  := abs(s.oracleLedgerSize - 1n);

            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Admin Oracle Lambdas Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(*  pauseAll lambda *)
function lambdaPauseAll(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block {  

    // verify that sender is admin, the Governance Contract, the Governance Satellite Contract, or the Aggregator Factory Contract
    verifySenderIsAdminOrGovernanceOrGovernanceSatelliteOrFactory(s);

    case aggregatorLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
                
                // set all pause configs to True
                s := pauseAllAggregatorEntrypoints(s);

            }
        |   _ -> skip
    ];
    
} with (noOperations, s)



(*  unpauseAll lambda *)
function lambdaUnpauseAll(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block {
    
    // verify that sender is admin, the Governance Contract, the Governance Satellite Contract, or the Aggregator Factory Contract
    verifySenderIsAdminOrGovernanceOrGovernanceSatelliteOrFactory(s);

    case aggregatorLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
                
                // set all pause configs to False
                s := unpauseAllAggregatorEntrypoints(s);

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block {
    
    // verify that sender is admin 
    verifySenderIsAdmin(s.admin);

    case aggregatorLambdaAction of [
        |   LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [
                        UpdateData (_v)                     -> s.breakGlassConfig.updateDataIsPaused                  := _v
                    |   WithdrawRewardXtz (_v)              -> s.breakGlassConfig.withdrawRewardXtzIsPaused           := _v
                    |   WithdrawRewardStakedMvk (_v)        -> s.breakGlassConfig.withdrawRewardStakedMvkIsPaused     := _v
                ]
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Oracle Lambdas Begin
// ------------------------------------------------------------------------------

(*  updateData entrypoint  *)
function lambdaUpdateData(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block{

    // Steps Overview:
    // 1. Standard checks
    //    - Check that %updateData entrypoint is not paused (e.g. glass broken)
    //    - Check that entrypoint should not receive any tez amount   
    //    - Check that sender is oracle
    //    - Check that satellite is not suspended or banned
    // 2. Verify the observations and signatures maps sizes
    // 3. Verify the observations informations + get epoch and round
    // 4. Verify the signatures
    // 5. update rewards
    // 6. Update storage with lastCompletedData

    // Check that %updateData entrypoint is not paused (e.g. glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.updateDataIsPaused, error_UPDATE_DATA_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED);

    case aggregatorLambdaAction of [
        |   LambdaUpdateData(params) -> {

                // Verify that sender is an oracle registered on the aggregator
                verifySenderIsRegisteredOracle(s);

                // Verify that satellite is not suspended or banned
                verifySatelliteIsNotSuspendedOrBanned(Tezos.get_sender(), s);

                // verify obervations and signatures have the same size
                verifyEqualMapSizes(params, s);

                // verify for each observations -> epoch and round are the same + different from previous
                var epochAndRound: nat*nat := verifyInfosFromObservations(params.oracleObservations, s);

                // verify oracles signatures
                for key -> value in map params.signatures block {
                    verifyAllResponsesSignature(key, value, params.oracleObservations, s)
                };

                // get median
                const median: nat = getMedianFromMap(pivotObservationMap(params.oracleObservations), Map.size (params.oracleObservations));

                // calculate percent oracle response
                const percentOracleResponse: nat    = Map.size (params.oracleObservations) * 100_00n / s.oracleLedgerSize;

                var newlastCompletedData := record [
                    round                   = epochAndRound.1;
                    epoch                   = epochAndRound.0;
                    data                    = median;
                    percentOracleResponse   = percentOracleResponse;
                    lastUpdatedAt           = Tezos.get_now();
                ];

                // -----------------------------------------
                // Set rewards for oracle
                // -----------------------------------------

                // Set staked MVK reward for oracle
                s := updateRewardsStakedMvk(params.oracleObservations, s);

                // Set XTZ reward for oracle
                const rewardAmountXtz : nat  = s.config.rewardAmountXtz;
                if rewardAmountXtz > 0n then {

                    // get current oracle xtz rewards
                    const currentOracleXtzRewards : nat = getOracleXtzRewards(Tezos.get_sender(), s);

                    // increment oracle rewards in storage
                    s.oracleRewardXtz[Tezos.get_sender()] := currentOracleXtzRewards + rewardAmountXtz;

                } else skip;

                // Update storage with lastCompletedData
                s.lastCompletedData   := newlastCompletedData;
            }
        |   _ -> skip
    ];

} with (noOperations, s)


// ------------------------------------------------------------------------------
// Oracle Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Reward Lambdas Begin
// ------------------------------------------------------------------------------

(*  withdrawRewardXtz entrypoint  *)
function lambdaWithdrawRewardXtz(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block{

  // Steps Overview:
    // 1. Standard checks
    //    - Check that %withdrawRewardXtz entrypoint is not paused (e.g. glass broken)
    //    - Check that entrypoint should not receive any tez amount   
    //    - Check that sender is an oracle registered on the aggregator
    //    - Check that satellite is not suspended or banned
    // 2. Get oracle's XTZ reward amount 
    // 3. If reward amount is greater than 0, create an operation to the Aggregator Factory Contract to distribute the rewards
    //    - Reset oracle XTZ rewards to zero and update storage

    // Check that %withdrawRewardXtz entrypoint is not paused (e.g. glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.withdrawRewardXtzIsPaused, error_WITHDRAW_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    case aggregatorLambdaAction of [
        |   LambdaWithdrawRewardXtz(oracleAddress) -> {

                // Verify that satellite is not suspended or banned
                verifySatelliteIsNotSuspendedOrBanned(oracleAddress, s);
                
                // Get oracle's XTZ reward amount 
                const reward : nat = getOracleXtzRewards(oracleAddress, s);

                // If reward amount is greater than 0, create an operation to the Aggregator Factory Contract to distribute the rewards
                if (reward > 0n) then {

                    // distribute reward xtz operation to oracle
                    const distributeRewardXtzOperation : operation = distributeRewardXtzOperation(oracleAddress, reward, s);
                    operations := distributeRewardXtzOperation # operations;
                    
                    // Reset oracle XTZ rewards to zero and update storage
                    s.oracleRewardXtz[oracleAddress] := 0n;

                } else skip;
            }
        |   _ -> skip
    ];
    
} with (operations, s)



(*  withdrawRewardStakedMvk entrypoint  *)
function lambdaWithdrawRewardStakedMvk(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block{

    // Steps Overview:
    // 1. Standard checks
    //    - Check that %withdrawRewardStakedMvk entrypoint is not paused (e.g. glass broken)
    //    - Check that entrypoint should not receive any tez amount   
    //    - Check that sender is an oracle registered on the aggregator
    //    - Check that satellite is not suspended or banned
    // 2. Get oracle's staked MVK reward amount 
    // 3. If reward amount is greater than 0, create an operation to the Aggregator Factory Contract to distribute the rewards
    //    - Reset oracle staked MVK rewards to zero and update storage


    // Check that %withdrawRewardStakedMvk entrypoint is not paused (e.g. glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.withdrawRewardStakedMvkIsPaused, error_WITHDRAW_REWARD_STAKED_MVK_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED);
    
    var operations : list(operation) := nil;

    case aggregatorLambdaAction of [
        |   LambdaWithdrawRewardStakedMvk(oracleAddress) -> {

                // Verify that satellite is not suspended or banned
                verifySatelliteIsNotSuspendedOrBanned(oracleAddress, s);

                // Get oracle's staked MVK reward amount 
                const reward = getOracleStakedMvkRewards(oracleAddress, s);

                // If reward amount is greater than 0, create an operation to the Aggregator Factory Contract to distribute the rewards
                if (reward > 0n) then {

                    // distribute reward staked mvk operation to oracle
                    const distributeRewardStakedMvkOperation : operation = distributeRewardStakedMvkOperation(oracleAddress, reward, s);
                    operations := distributeRewardStakedMvkOperation # operations;

                    // Reset oracle staked MVK rewards to zero and update storage
                    s.oracleRewardStakedMvk[oracleAddress] := 0n;

                } else skip;
                
            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Reward Lambdas End
// ------------------------------------------------------------------------------
