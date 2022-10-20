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
    
    checkSenderIsAllowed(s);  // check that sender is admin or the Governance Contract address

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
    
    checkSenderIsAllowed(s);  // check that sender is admin or the Governance Contract address

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
    
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance Proxy Contract address)

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

                operations  :=  Tezos.transaction(
                    setAggregatorReferenceParams,
                    0tez,
                    getSetAggregatorReferenceInGovernanceSatelliteEntrypoint(governanceSatelliteAddress)
                ) # operations;

                // Get aggregator factory address
                const aggregatorFactoryAddress : address = case s.whitelistContracts["aggregatorFactory"] of [
                        Some(_address) -> _address
                    |   None           -> failwith(error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND)
                ];
            
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
    
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance Proxy Contract address)

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

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance Proxy Contract address)

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
    
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance Proxy Contract address)
    
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

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance Proxy Contract address)
    
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
// Admin Oracle Lambdas Begin
// ------------------------------------------------------------------------------

(*  addOracle entrypoint  *)
function lambdaAddOracle(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block {
    
    checkSenderIsAdminOrGovernanceSatellite(s);  

    case aggregatorLambdaAction of [
        |   LambdaAddOracle(addOracleParams) -> {
                
                if isOracleAddress(addOracleParams.oracleAddress, s.oracleAddresses) then failwith (error_ORACLE_ALREADY_ADDED_TO_AGGREGATOR)
                else block{
                    
                    const oracleAddress : address = addOracleParams.oracleAddress;
                    const satelliteRecord : satelliteRecordType = getSatelliteRecord(oracleAddress, s);

                    const oracleInformation : oracleInformationType = record [
                        oraclePublicKey  = satelliteRecord.oraclePublicKey;
                        oraclePeerId     = satelliteRecord.oraclePeerId;
                    ];
                    
                    s.oracleAddresses[oracleAddress] := oracleInformation;
                }   

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateOracle entrypoint  *)
function lambdaUpdateOracle(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block {
    
    case aggregatorLambdaAction of [
        |   LambdaUpdateOracle(_parameters) -> {
                
                if isOracleAddress(Tezos.get_sender(), s.oracleAddresses) then block{
                    
                    const oracleAddress : address = Tezos.get_sender();
                    const satelliteRecord : satelliteRecordType = getSatelliteRecord(oracleAddress, s);

                    const oracleInformation : oracleInformationType = record [
                        oraclePublicKey  = satelliteRecord.oraclePublicKey;
                        oraclePeerId     = satelliteRecord.oraclePeerId;
                    ];
                    
                    s.oracleAddresses[oracleAddress] := oracleInformation;
                
                }  else failwith(error_ORACLE_NOT_PRESENT_IN_AGGREGATOR) 

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  removeOracle entrypoint  *)
function lambdaRemoveOracle(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block {
    
    checkSenderIsAdminOrGovernanceSatellite(s);

    case aggregatorLambdaAction of [
        |   LambdaRemoveOracle(oracleAddress) -> {
                
                if not isOracleAddress(oracleAddress, s.oracleAddresses) then failwith (error_ORACLE_NOT_PRESENT_IN_AGGREGATOR)
                else block{
                    s.oracleAddresses := Map.remove(oracleAddress, s.oracleAddresses);
                }

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

    // check that sender is admin, the Governance Contract, the Governance Satellite Contract, or the Aggregator Factory Contract
    checkSenderIsAdminOrGovernanceOrGovernanceSatelliteOrFactory(s);

    case aggregatorLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
                
                // set all pause configs to True
                if s.breakGlassConfig.updateDataIsPaused then skip
                else s.breakGlassConfig.updateDataIsPaused := True;

                if s.breakGlassConfig.withdrawRewardXtzIsPaused then skip
                else s.breakGlassConfig.withdrawRewardXtzIsPaused := True;

                if s.breakGlassConfig.withdrawRewardStakedMvkIsPaused then skip
                else s.breakGlassConfig.withdrawRewardStakedMvkIsPaused := True;

            }
        |   _ -> skip
    ];
    
} with (noOperations, s)



(*  unpauseAll lambda *)
function lambdaUnpauseAll(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block {
    
    // check that sender is admin, the Governance Contract, the Governance Satellite Contract, or the Aggregator Factory Contract
    checkSenderIsAdminOrGovernanceOrGovernanceSatelliteOrFactory(s);

    case aggregatorLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
                
                // set all pause configs to False
                if s.breakGlassConfig.updateDataIsPaused then s.breakGlassConfig.updateDataIsPaused := False
                else skip;

                if s.breakGlassConfig.withdrawRewardXtzIsPaused then s.breakGlassConfig.withdrawRewardXtzIsPaused := False
                else skip;

                if s.breakGlassConfig.withdrawRewardStakedMvkIsPaused then s.breakGlassConfig.withdrawRewardStakedMvkIsPaused := False
                else skip;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance Proxy Contract address)

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
    checkUpdateDataIsNotPaused(s); 

    case aggregatorLambdaAction of [
        |   LambdaUpdateData(params) -> {

                // Get Delegation Contract address from the General Contracts Map on the Governance Contract
                const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

                checkSenderIsOracle(s);
                checkSatelliteStatus(Tezos.get_sender(), delegationAddress, True, True);

                // verify obervations and signatures have the same size
                verifyMapsSizes(params, s);

                // verify for each observations -> epoch and round are the same + different from previous
                var epochAndRound: nat*nat := verifyInfosFromObservations(params.oracleObservations, s);

                // verify oracles signatures
                for key -> value in map params.signatures block {
                    verifyAllResponsesSignature(key, value, params.oracleObservations, s)
                };

                // get median
                const median: nat = getMedianFromMap(pivotObservationMap(params.oracleObservations), Map.size (params.oracleObservations));

                // implement weight data over x entries

                var newlastCompletedData := record [
                    round                   = epochAndRound.1;
                    epoch                   = epochAndRound.0;
                    data                    = median;
                    percentOracleResponse   = Map.size (params.oracleObservations);
                    lastUpdatedAt           = Tezos.get_now();
                ];

                // -----------------------------------------
                // Set rewards for oracle
                // -----------------------------------------

                // Set staked MVK reward for oracle
                s := updateRewardsStakedMvk(params.oracleObservations, s);

                // Set XTZ reward for oracle
                const rewardAmountXtz        : nat  = s.config.rewardAmountXtz;
                if rewardAmountXtz > 0n then {
                    var currentOracleXtzRewards  : nat := case s.oracleRewardXtz[Tezos.get_sender()] of [
                            Some (_amount) -> (_amount) 
                        |   None           -> 0n 
                    ];
                    s.oracleRewardXtz[Tezos.get_sender()]   := currentOracleXtzRewards + rewardAmountXtz;
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
    checkWithdrawRewardXtzIsNotPaused(s);

    var operations : list(operation) := nil;

    case aggregatorLambdaAction of [
        |   LambdaWithdrawRewardXtz(oracleAddress) -> {

                // Check that sender is an oracle registered on the aggregator
                if Map.mem(oracleAddress, s.oracleAddresses) then skip else failwith(error_ORACLE_NOT_PRESENT_IN_AGGREGATOR);

                // Check that satellite is not suspended or banned
                const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);
                checkSatelliteStatus(oracleAddress, delegationAddress, True, True);
                
                // Get oracle's XTZ reward amount 
                const reward : nat = getRewardAmountXtz(oracleAddress, s);

                // If reward amount is greater than 0, create an operation to the Aggregator Factory Contract to distribute the rewards
                if (reward > 0n) then {

                    const factoryAddress : address = case s.whitelistContracts["aggregatorFactory"] of [
                            Some(_address) -> _address
                        |   None           -> failwith(error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND)
                    ];
                    
                    const distributeRewardXtzParams : distributeRewardXtzType = record [
                        recipient = oracleAddress;
                        reward    = reward;
                    ];

                    const distributeRewardXtzOperation : operation = Tezos.transaction(
                        distributeRewardXtzParams,
                        0tez,
                        getDistributeRewardXtzInFactoryEntrypoint(factoryAddress)
                    );

                    operations := distributeRewardXtzOperation # operations;
                    
                    // Reset oracle XTZ rewards to zero and update storage
                    const newOracleRewardXtz = Map.update(oracleAddress, Some (0n), s.oracleRewardXtz);
                    s.oracleRewardXtz := newOracleRewardXtz;

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
    checkWithdrawRewardStakedMvkIsNotPaused(s);
    
    var operations : list(operation) := nil;

    case aggregatorLambdaAction of [
        |   LambdaWithdrawRewardStakedMvk(oracleAddress) -> {
                
                // Check that sender is an oracle registered on the aggregator
                if Map.mem(oracleAddress, s.oracleAddresses) then skip else failwith(error_ORACLE_NOT_PRESENT_IN_AGGREGATOR);

                // Check that satellite is not suspended or banned
                const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);
                checkSatelliteStatus(oracleAddress, delegationAddress, True, True);

                // Get oracle's staked MVK reward amount 
                const reward = getRewardAmountStakedMvk(oracleAddress, s);

                // If reward amount is greater than 0, create an operation to the Aggregator Factory Contract to distribute the rewards
                if (reward > 0n) then {

                    const factoryAddress : address = case s.whitelistContracts["aggregatorFactory"] of [
                            Some(_address) -> _address
                        |   None           -> failwith(error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND)
                    ];
                    
                    const distributeRewardMvkParams : distributeRewardStakedMvkType = record [
                        eligibleSatellites     = set[oracleAddress];
                        totalStakedMvkReward   = reward;
                    ];

                    const distributeRewardMvkOperation : operation = Tezos.transaction(
                        distributeRewardMvkParams,
                        0tez,
                        getDistributeRewardStakedMvkInFactoryEntrypoint(factoryAddress)
                    );

                    operations := distributeRewardMvkOperation # operations;

                    // Reset oracle staked MVK rewards to zero and update storage
                    const newOracleRewardStakedMvk = Map.update(oracleAddress, Some (0n), s.oracleRewardStakedMvk);
                    s.oracleRewardStakedMvk := newOracleRewardStakedMvk;

                } else skip;
                
            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Reward Lambdas End
// ------------------------------------------------------------------------------
