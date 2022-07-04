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
    
    checkNoAmount(Unit);      // entrypoint should not receive any tez amount
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
    
    checkNoAmount(Unit);      // entrypoint should not receive any tez amount
    checkSenderIsAllowed(s);  // check that sender is admin or the Governance Contract address

    case aggregatorLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setMaintainer lambda *)
function lambdaSetMaintainer(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block {
    
    checkNoAmount(Unit);                        // entrypoint should not receive any tez amount
    checkSenderIsAdminOrGovernanceSatellite(s); // check that sender is admin or the Governance Satellite Contract address 

    case aggregatorLambdaAction of [
        |   LambdaSetMaintainer(newMaintainerAddress) -> {
                s.maintainer := newMaintainerAddress;
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
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount   
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance Proxy Contract address)

    case aggregatorLambdaAction of [
        |   LambdaSetName(updatedName) -> {

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

} with (noOperations, s)



(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount   
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

    checkNoAmount(Unit);   // entrypoint should not receive any tez amount   
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance Proxy Contract address)

    case aggregatorLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {

                const updateConfigAction    : aggregatorUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : aggregatorUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    |   ConfigDecimals (_v)                  -> s.config.decimals                             := updateConfigNewValue
                    |   ConfigNumberBlocksDelay (_v)         -> s.config.numberBlocksDelay                    := updateConfigNewValue
                    
                    |   ConfigDevTriggerBanDuration (_v)     -> s.config.deviationTriggerBanDuration          := updateConfigNewValue
                    |   ConfigPerThousandDevTrigger (_v)     -> s.config.perThousandDeviationTrigger          := updateConfigNewValue
                    |   ConfigPercentOracleThreshold (_v)    -> s.config.percentOracleThreshold               := updateConfigNewValue

                    |   ConfigRequestRateDevDepositFee (_v)  -> s.config.requestRateDeviationDepositFee       := updateConfigNewValue
                    
                    |   ConfigDeviationRewardStakedMvk (_v)  -> s.config.deviationRewardStakedMvk             := updateConfigNewValue
                    |   ConfigDeviationRewardAmountXtz (_v)  -> s.config.deviationRewardAmountXtz             := updateConfigNewValue
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
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount   
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

    checkNoAmount(Unit);   // entrypoint should not receive any tez amount   
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
                        | Fa12(token) -> transferFa12Token(Tezos.self_address, transferParam.to_, transferParam.amount, token)
                        | Fa2(token)  -> transferFa2Token(Tezos.self_address, transferParam.to_, transferParam.amount, token.tokenId, token.tokenContractAddress)
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
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount   

    case aggregatorLambdaAction of [
        |   LambdaAddOracle(oracleAddress) -> {
                
                if isOracleAddress(oracleAddress, s.oracleAddresses) then failwith (error_ORACLE_ALREADY_ADDED_TO_AGGREGATOR)
                else block{
                    checkSenderIsAdminOrGovernanceSatellite(s);
                    const updatedWhiteListedContract: oracleAddressesType = Map.update(oracleAddress, Some( True), s.oracleAddresses);
                    s.oracleAddresses := updatedWhiteListedContract;
                }   

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  removeOracle entrypoint  *)
function lambdaRemoveOracle(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount   

    case aggregatorLambdaAction of [
        |   LambdaRemoveOracle(oracleAddress) -> {
                
                if not isOracleAddress(oracleAddress, s.oracleAddresses) then failwith (error_ORACLE_NOT_PRESENT_IN_AGGREGATOR)
                else block{
                    checkSenderIsAdminOrGovernanceSatellite(s);
                    const updatedWhiteListedContract: oracleAddressesType = Map.remove(oracleAddress, s.oracleAddresses);
                    s.oracleAddresses := updatedWhiteListedContract;
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
    
    // entrypoint should not receive any tez amount   
    checkNoAmount(Unit);   

    // check that sender is admin, the Governance Contract, the Governance Satellite Contract, or the Aggregator Factory Contract
    checkSenderIsAdminOrGovernanceOrGovernanceSatelliteOrFactory(s);

    case aggregatorLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
                
                // set all pause configs to True
                if s.breakGlassConfig.requestRateUpdateIsPaused then skip
                else s.breakGlassConfig.requestRateUpdateIsPaused := True;

                if s.breakGlassConfig.requestRateUpdateDeviationIsPaused then skip
                else s.breakGlassConfig.requestRateUpdateDeviationIsPaused := True;

                if s.breakGlassConfig.setObservationCommitIsPaused then skip
                else s.breakGlassConfig.setObservationCommitIsPaused := True;

                if s.breakGlassConfig.setObservationRevealIsPaused then skip
                else s.breakGlassConfig.setObservationRevealIsPaused := True;

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

    // entrypoint should not receive any tez amount   
    checkNoAmount(Unit);

    // check that sender is admin, the Governance Contract, the Governance Satellite Contract, or the Aggregator Factory Contract
    checkSenderIsAdminOrGovernanceOrGovernanceSatelliteOrFactory(s);

    case aggregatorLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
                
                // set all pause configs to False
                if s.breakGlassConfig.requestRateUpdateIsPaused then s.breakGlassConfig.requestRateUpdateIsPaused := False
                else skip;

                if s.breakGlassConfig.requestRateUpdateDeviationIsPaused then s.breakGlassConfig.requestRateUpdateDeviationIsPaused := False
                else skip;

                if s.breakGlassConfig.setObservationCommitIsPaused then s.breakGlassConfig.setObservationCommitIsPaused := False
                else skip;

                if s.breakGlassConfig.setObservationRevealIsPaused then s.breakGlassConfig.setObservationRevealIsPaused := False
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

    checkNoAmount(Unit);   // entrypoint should not receive any tez amount   
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance Proxy Contract address)

    case aggregatorLambdaAction of [
        |   LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [
                        RequestRateUpdate (_v)              -> s.breakGlassConfig.requestRateUpdateIsPaused           := _v
                    |   RequestRateUpdateDeviation (_v)     -> s.breakGlassConfig.requestRateUpdateDeviationIsPaused  := _v
                    |   SetObservationCommit (_v)           -> s.breakGlassConfig.setObservationCommitIsPaused        := _v
                    |   SetObservationReveal (_v)           -> s.breakGlassConfig.setObservationRevealIsPaused        := _v
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

(*  requestRateUpdate entrypoint  *)
function lambdaRequestRateUpdate(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block{

    // Steps Overview:
    // 1. Standard checks
    //    - Check that %requestRateUpdate entrypoint is not paused (e.g. glass broken)
    //    - Check that entrypoint should not receive any tez amount   
    //    - Check that sender is the maintainer address
    // 2. Init Params for New Round
    // 3. Get the current newDeviationTriggerInfos and its round price
    // 4. If previous round is a deviation trigger
    //    - Reset deviationTriggerInfos for a new deviation round
    //    - Check if round price is within acceptable deviation boundaries 
    //    - If price is not within acceptable deviation boundaries, impose a penalty on the oracle that triggered the deviation round
    //      -   Exception of maintainer that should not be penalised
    // 5. Update storage with new round parameters

    checkRequestRateUpdateIsNotPaused(s); // Check that %requestRateUpdate entrypoint is not paused (e.g. glass broken)
    checkNoAmount(Unit);                  // entrypoint should not receive any tez amount   
    checkMaintainership(s);               // check that sender is the maintainer address

    case aggregatorLambdaAction of [
        |   LambdaRequestRateUpdate(_parameters) -> {
                
                // init params for new round
                const newRound          : nat                     = s.round + 1n;
                const emptyMapCommit    : observationCommitsType  = map [];
                const emptyMapReveals   : observationRevealsType  = map [];
                
                // Get the current newDeviationTriggerInfos and its round price
                var newDeviationTriggerInfos      : deviationTriggerInfosType := s.deviationTriggerInfos;
                const deviationTriggerRoundPrice  : nat = s.deviationTriggerInfos.roundPrice;

                // Check if previous round is a deviation trigger
                if (deviationTriggerRoundPrice =/= 0n) then { 
                    
                    // Reset deviationTriggerInfos for a new deviation round
                    newDeviationTriggerInfos := record[
                        oracleAddress = Tezos.get_sender();
                        roundPrice    = 0n;
                    ];

                    // // Init parameters for significant deviation boundaries check
                    // const deviationRoundPriceDoubled       : nat = deviationTriggerRoundPrice * 1000n * 2n; 
                    // const deviationRoundPriceTriggerBound  : nat = deviationTriggerRoundPrice * s.config.perThousandDeviationTrigger;

                    // // E.g. if perThousandDeviationTrigger is 2, then upperBound will be 100.2% of deviation round price, and lowerBound will be 99.8% of deviation round price.
                    // const upperBound : nat = (deviationRoundPriceDoubled + deviationRoundPriceTriggerBound) / (1000n * 2n);
                    // const lowerBound : nat = (abs(deviationRoundPriceDoubled - deviationRoundPriceTriggerBound)) / (1000n * 2n);

                    // // Check if round price has significantly deviated or not 
                    // // - i.e. false deviation round if it was triggered but price did not deviate much, and ban oracle if so
                    // // - check if deviation round price has significantly deviated from last completed round price (e.g. by more than 0.2% if perThousandDeviationTrigger is 2)
                    // // - i.e. deviation round price > or < % deviation trigger
                    // if ( 
                    //   (upperBound > s.lastCompletedRoundPrice.price)
                    //   or
                    //   (lowerBound < s.lastCompletedRoundPrice.price)
                    // ) then {

                    //       // if price did not significantly deviate, impose a penalty on the oracle that triggered the deviation round
                    //       // - exception will be the maintainer address 
                    //       // check that maintainer should not be banned

                    //       if s.deviationTriggerInfos.oracleAddress =/= s.maintainer then {                           

                    //         // add oracle that triggered deviation into the deviation trigger ban for a short duration of time to prevent any abuse 
                    //         const updatedDeviationTriggerBan: deviationTriggerBanType = Map.update(s.deviationTriggerInfos.oracleAddress, Some( Tezos.get_now() + int (s.config.deviationTriggerBanDuration)), s.deviationTriggerBan);
                    //         s.deviationTriggerBan := updatedDeviationTriggerBan;

                    //       } else skip;

                    // } else skip;

                    // Init parameters for significant deviation boundaries check
                    const lastCompletedRoundPrice              : nat = s.lastCompletedRoundPrice.price;
                    const lastCompletedRoundPriceToThousands   : nat = lastCompletedRoundPrice * 1000n;
                    const lastCompletedRoundPriceDifferential  : nat = lastCompletedRoundPrice * s.config.perThousandDeviationTrigger;

                    // If s.config.perThousandDeviationTrigger is 5, calculate 100.25% and 99.75% of last completed round price
                    const upperBound : nat = (lastCompletedRoundPriceToThousands + lastCompletedRoundPriceDifferential) / 1000n;
                    const lowerBound : nat = abs(lastCompletedRoundPriceToThousands - lastCompletedRoundPriceDifferential) / 1000n;

                    // Check if round price has significantly deviated or not 
                    // - i.e. false deviation round if it was triggered but price did not deviate much, and ban oracle if so
                    //
                    //                  non-significant change
                    //                 <---------------------->  
                    //   -------- 99.9% -------- 100% -------- 100.1% --------
                    //                       last price     
                    //
                    //  check if deviation round price has significantly deviated from last completed round price 
                    //  - e.g. by more than 0.2% if perThousandDeviationTrigger is 2
                    //  - i.e. deviation trigger round price falls within the non-significant change area

                    if ( 
                        (upperBound > deviationTriggerRoundPrice)
                        and
                        (lowerBound < deviationTriggerRoundPrice)
                    ) then {

                        // if price did not significantly deviate, impose a penalty on the oracle that triggered the deviation round
                        // - exception will be the maintainer address 
                        // check that maintainer should not be banned

                        if s.deviationTriggerInfos.oracleAddress =/= s.maintainer then {                           

                            // add oracle that triggered deviation into the deviation trigger ban for a short duration of time to prevent any abuse 
                            const updatedDeviationTriggerBan: deviationTriggerBanType = Map.update(s.deviationTriggerInfos.oracleAddress, Some( Tezos.get_now() + int (s.config.deviationTriggerBanDuration)), s.deviationTriggerBan);
                            s.deviationTriggerBan := updatedDeviationTriggerBan;

                        } else skip;

                    } else skip;

                } else skip;

                // Update storage with new round parameters
                s.round                   := newRound;
                s.roundStart              := Tezos.get_now();
                s.observationReveals      := emptyMapReveals;
                s.observationCommits      := emptyMapCommit;
                s.deviationTriggerInfos   := newDeviationTriggerInfos;
                s.switchBlock             := 0n;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  requestRateUpdateDeviation entrypoint  *)
function lambdaRequestRateUpdateDeviation(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block{

    // Steps Overview:
    // 1. Standard checks
    //    - Check that %requestRateUpdate entrypoint is not paused (e.g. glass broken)
    //    - Check that sender is oracle
    //    - Check that this is the correct round oracle 
    //    - Check that oracle is not banned for deviation trigger
    //    - Check that satellite is not suspended or banned
    // 2. Check if Tez sent is equal to request rate deposit fee (if any)
    // 3. Init new round, new empty map reveals, and set new observation commit of sender
    // 4. Check if previous round was a failed deviation round and ban oracle if so
    // 5. Set new deviation trigger info and reward oracle that requested rate update deviation
    //    - If deviation reward staked MVK is not 0, then increment oracle staked MVK rewards
    //    - If deviation reward XTZ is not 0, then increment oracle XTZ rewards
    // 6. Update storage with new round parameters

    // Check that %requestRateUpdateDeviation entrypoint is not paused (e.g. glass broken)
    checkRequestRateUpdateDeviationIsNotPaused(s);

    case aggregatorLambdaAction of [
        |   LambdaRequestRateUpdDeviation(params) -> {

                checkSenderIsOracle(s);
                checkIfCorrectRound(abs(params.roundId - 1), s);
                checkIfLastRoundCompleted(s);
                checkOracleIsNotBannedForDeviationTrigger(s);
                checkSatelliteIsNotSuspendedOrBanned(Tezos.get_sender(), s);

                // Check if Tez sent is equal to request rate deposit fee (if any)
                const requestRateDeviationDepositFee : nat = s.config.requestRateDeviationDepositFee;
                if requestRateDeviationDepositFee =/= 0n and (requestRateDeviationDepositFee * 1mutez) =/= Tezos.get_amount() then failwith(error_TEZOS_SENT_IS_NOT_EQUAL_TO_REQUEST_RATE_DEVIATION_DEPOSIT_FEE) 
                else if requestRateDeviationDepositFee = 0n and Tezos.get_amount() > (requestRateDeviationDepositFee * 1mutez) then failwith(error_NO_REQUEST_RATE_DEVIATION_DEPOSIT_FEE_REQUIRED)
                else skip;
                
                // Init new round, empty reveals map, and set new observation commit of sender
                const newRound               : nat                    = s.round + 1n;
                const emptyMapReveals        : observationRevealsType = map [];
                const newObservationCommits  : observationCommitsType = map [
                    ((Tezos.get_sender() : address)) -> params.sign
                ];
                
                // Get previous round deviation trigger
                const deviationTriggerRoundPrice : nat = s.deviationTriggerInfos.roundPrice;

                // Init parameters for acceptable deviation boundaries check
                // const deviationRoundPriceDoubled       : nat = deviationTriggerRoundPrice * 1000n * 2n; 
                // const deviationRoundPriceTriggerBound  : nat = deviationTriggerRoundPrice * s.config.perThousandDeviationTrigger;

                // // E.g. if perThousandDeviationTrigger is 2, then upperBound will be 100.2% of deviation round price, and lowerBound will be 99.8% of deviation round price.
                // const upperBound : nat = (deviationRoundPriceDoubled + deviationRoundPriceTriggerBound) / (1000n * 2n);
                // const lowerBound : nat = (abs(deviationRoundPriceDoubled - deviationRoundPriceTriggerBound)) / (1000n * 2n);

                // // Check if round price has significantly deviated or not 
                // // - i.e. false deviation round if it was triggered but price did not deviate much, and ban oracle if so
                // // - check if deviation round price has significantly deviated from last completed round price (e.g. by more than 0.2% if perThousandDeviationTrigger is 2)
                // // - i.e. deviation round price > or < % deviation trigger
                // if (
                //     deviationTriggerRoundPrice =/= 0n
                //     and
                //     (
                //       (upperBound > s.lastCompletedRoundPrice.price)
                //       or
                //       (lowerBound < s.lastCompletedRoundPrice.price)
                //     )
                // ) then { 

                //     // if price did not significantly deviate, impose a penalty on the oracle that triggered the deviation round
                //     // - exception will be the maintainer address 
                //     // check that maintainer should not be banned
                  
                //     if s.deviationTriggerInfos.oracleAddress =/= s.maintainer then {                           

                //       // add oracle that triggered deviation into the deviation trigger ban for a short duration of time to prevent any abuse 
                //       const updatedDeviationTriggerBan: deviationTriggerBanType = Map.update(s.deviationTriggerInfos.oracleAddress, Some( Tezos.get_now() + int (s.config.deviationTriggerBanDuration)), s.deviationTriggerBan);
                //       s.deviationTriggerBan := updatedDeviationTriggerBan;

                //     } else skip;

                // } else skip;

                // Init parameters for significant deviation boundaries check
                const lastCompletedRoundPrice              : nat = s.lastCompletedRoundPrice.price;
                const lastCompletedRoundPriceToThousands   : nat = lastCompletedRoundPrice * 1000n;
                const lastCompletedRoundPriceDifferential  : nat = lastCompletedRoundPrice * s.config.perThousandDeviationTrigger;

                // If s.config.perThousandDeviationTrigger is 5, calculate 100.25% and 99.75% of last completed round price
                const upperBound : nat = (lastCompletedRoundPriceToThousands + lastCompletedRoundPriceDifferential) / 1000n;
                const lowerBound : nat = abs(lastCompletedRoundPriceToThousands - lastCompletedRoundPriceDifferential) / 1000n;

                // Check if round price has significantly deviated or not 
                // - i.e. false deviation round if it was triggered but price did not deviate much, and ban oracle if so
                //
                //                  non-significant change
                //                 <---------------------->  
                //   -------- 99.8% -------- 100% -------- 100.2% --------
                //                       last price     
                //
                //  check if deviation roundint() price has significantly deviated from last completed round price 
                //  - e.g. by more than 0.2% if perThousandDeviationTrigger is 2
                //  - i.e. deviation trigger round price falls within the non-significant change area

                if ( 
                    (upperBound > deviationTriggerRoundPrice)
                    and 
                    (lowerBound < deviationTriggerRoundPrice)
                ) then {

                      // if price did not significantly deviate, impose a penalty on the oracle that triggered the deviation round
                      // - exception will be the maintainer address 
                      // check that maintainer should not be banned

                    if s.deviationTriggerInfos.oracleAddress =/= s.maintainer then {                           

                        // add oracle that triggered deviation into the deviation trigger ban for a short duration of time to prevent any abuse 
                        const updatedDeviationTriggerBan : deviationTriggerBanType = Map.update(s.deviationTriggerInfos.oracleAddress, Some( Tezos.get_now() + int (s.config.deviationTriggerBanDuration)), s.deviationTriggerBan);
                        s.deviationTriggerBan := updatedDeviationTriggerBan;

                    } else skip;

                } else skip;

                // Set new deviation trigger info
                const newDeviationTriggerInfos : deviationTriggerInfosType = record[
                    oracleAddress = Tezos.get_sender();
                    roundPrice    = s.lastCompletedRoundPrice.price;
                ];

                // Init deviation rewards
                const deviationRewardStakedMvk  : nat = s.config.deviationRewardStakedMvk;
                const deviationRewardXtz        : nat = s.config.deviationRewardAmountXtz;

                // If deviation reward staked MVK is not 0, then increment oracle staked MVK rewards
                if deviationRewardStakedMvk =/= 0n then {

                    var currentOracleStakedMvkRewards : nat := case s.oracleRewardStakedMvk[Tezos.get_sender()] of [
                            Some (_amount) -> (_amount) 
                        |   None           -> 0n 
                    ];
                    s.oracleRewardStakedMvk[Tezos.get_sender()]   := currentOracleStakedMvkRewards + deviationRewardStakedMvk;
                    
                } else skip;

                // If deviation reward XTZ is not 0, then increment oracle XTZ rewards
                if deviationRewardXtz =/= 0n then {

                    var currentOracleXtzRewards : nat := case s.oracleRewardXtz[Tezos.get_sender()] of [
                            Some (_amount) -> (_amount) 
                        |   None           -> 0n 
                    ];
                    s.oracleRewardXtz[Tezos.get_sender()]   := currentOracleXtzRewards + deviationRewardXtz;

                } else skip;

                // Update storage with new round
                s.round                   := newRound;
                s.roundStart              := Tezos.get_now();
                s.observationReveals      := emptyMapReveals;
                s.observationCommits      := newObservationCommits;
                s.deviationTriggerInfos   := newDeviationTriggerInfos;
                s.switchBlock             := 0n;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setObservationCommit entrypoint  *)
function lambdaSetObservationCommit(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block{

    // Steps Overview:
    // 1. Standard checks
    //    - Check that %setObservationCommit entrypoint is not paused (e.g. glass broken)
    //    - Check that entrypoint should not receive any tez amount   
    //    - Check that sender is oracle
    //    - Check if it is the correct time to commit
    //    - Check if it is the correct round
    //    - Check if oracle has already answered commit
    //    - Check that satellite is not suspended or banned
    // 2. Update Observation Commits map with new observation from oracle
    // 3. Calculate percent threshold of oracles that have answered vs total oracles
    // 4. Update switchBlock from zero if threshold is reached and sufficient oracles have committed 
    // 5. Update storage with observation commits and switch block

    // Check that %setObservationCommit entrypoint is not paused (e.g. glass broken)
    checkSetObservationCommitIsNotPaused(s); 

    // Check that entrypoint should not receive any tez amount   
    checkNoAmount(Unit);

    case aggregatorLambdaAction of [
        |   LambdaSetObservationCommit(params) -> {

                checkSenderIsOracle(s);
                checkIfTimeToCommit(s);
                checkIfCorrectRound(params.roundId, s);
                checkIfOracleAlreadyAnsweredCommit(s);
                checkSatelliteIsNotSuspendedOrBanned(Tezos.get_sender(), s);
                
                // Update Observation Commits map with new observation from oracle
                const observationsDataUpdated       : observationCommitsType  = Map.update(( Tezos.get_sender() ), Some( params.sign ), s.observationCommits);

                // Get number of observations 
                const numberOfObservationsForRound  : nat                     = Map.size (observationsDataUpdated);
                
                // Calculate percent threshold of oracles that have answered vs total oracles
                var percentOracleResponse := numberOfObservationsForRound * 100n / Map.size (s.oracleAddresses);
                var newSwitchBlock : nat := s.switchBlock;

                // Update switchBlock from zero if threshold is reached and sufficient oracles have committed 
                if ((percentOracleResponse >= s.config.percentOracleThreshold) and s.switchBlock = 0n) then {
                    newSwitchBlock := Tezos.get_level() + s.config.numberBlocksDelay;
                } else skip;

                // Update storage with observation commits and switch block
                s.observationCommits  := observationsDataUpdated;
                s.switchBlock         := newSwitchBlock;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setObservationReveal entrypoint  *)
function lambdaSetObservationReveal(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is
block{

    // Steps Overview:
    // 1. Standard checks
    //    - Check that %setObservationCommit entrypoint is not paused (e.g. glass broken)
    //    - Check that entrypoint should not receive any tez amount   
    //    - Check that sender is oracle
    //    - Check if it is the correct time to reveal
    //    - Check if it is the correct round
    //    - Check if oracle has already answered reveal
    //    - Check that satellite is not suspended or banned
    // 2. Fetch oracle commit and compare it with bytes of reveal price salted 
    //    - Check if reveal matches commit
    //    - Check if Tezos address is present in commit Hash
    // 3. Update observation reveals map
    // 4. Set rewards for oracle
    // 5. Calculate percent threshold of oracles that have revealed vs total oracles 
    // 6. Set new completed round price once percentOracleThreshold is reached
    // 7. Update storage with observation reveals and last completed round price

    // Check that %setObservationReveal entrypoint is not paused (e.g. glass broken)
    checkSetObservationRevealIsNotPaused(s);

    // Check that entrypoint should not receive any tez amount   
    checkNoAmount(Unit);

    case aggregatorLambdaAction of [
        |   LambdaSetObservationReveal(params) -> {

                checkSenderIsOracle(s);
                checkIfTimeToReveal(s);
                checkIfCorrectRound(params.roundId, s);
                checkIfOracleAlreadyAnsweredReveal(s);
                checkSatelliteIsNotSuspendedOrBanned(Tezos.get_sender(), s);
                
                // Fetch oracle commit and compare it with bytes of reveal price salted 
                const oracleCommit  : bytes = getObservationCommit(Tezos.get_sender(), s.observationCommits);
                const hashedPack    : bytes = hasherman(Bytes.pack (params.priceSalted));

                // Check if reveal matches commit
                if (hashedPack =/= oracleCommit)
                then failwith(error_REVEAL_DOES_NOT_MATCH_COMMITMENT)
                else skip;

                // Check if Tezos address is present in commit Hash
                if (params.priceSalted.2 =/= Tezos.get_sender())
                then failwith(error_TEZOS_ADDRESS_NOT_PRESENT_IN_HASH_COMMIT)
                else skip;

                // Get oracle reveal price
                const price                        : nat = params.priceSalted.0;

                // Update observation reveals map
                const observationsDataUpdated      : observationRevealsType = Map.update(( Tezos.get_sender() ), Some( price ), s.observationReveals);
                
                // -----------------------------------------
                // Set rewards for oracle
                // -----------------------------------------

                // Set staked MVK reward for oracle
                s := updateRewardsStakedMvk(Tezos.get_sender(), s);

                // Set XTZ reward for oracle
                const rewardAmountXtz        : nat  = s.config.rewardAmountXtz;
                var currentOracleXtzRewards  : nat := case s.oracleRewardXtz[Tezos.get_sender()] of [
                        Some (_amount) -> (_amount) 
                    |   None           -> 0n 
                ];
                s.oracleRewardXtz[Tezos.get_sender()]   := currentOracleXtzRewards + rewardAmountXtz;

                // Calculate percent threshold of oracles that have revealed vs total oracles 
                const oracleWhiteListedSize        : nat = Map.size (s.oracleAddresses);
                const numberOfObservationForRound  : nat = Map.size (observationsDataUpdated);
                
                var newLastCompletedRoundPrice  := s.lastCompletedRoundPrice;
                var percentOracleResponse       := numberOfObservationForRound * 100n / oracleWhiteListedSize;

                // Set new completed round price once percentOracleThreshold is reached
                if (percentOracleResponse >= s.config.percentOracleThreshold) then {
                  
                    // Calculate median price from price observations submitted
                    const median: nat = getMedianFromMap(pivotObservationMap(observationsDataUpdated), numberOfObservationForRound);

                    // Update last completed round price with new median price
                    newLastCompletedRoundPrice := record [
                        round                 = s.round;
                        price                 = median;
                        percentOracleResponse = percentOracleResponse;
                        priceDateTime         = Tezos.get_now();
                    ];

                } else skip;

                // Update storage with observation reveals and last completed round price
                s.observationReveals        := observationsDataUpdated;
                s.lastCompletedRoundPrice   := newLastCompletedRoundPrice;

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

    // Check that entrypoint should not receive any tez amount   
    checkNoAmount(Unit);

    var operations : list(operation) := nil;

    case aggregatorLambdaAction of [
        |   LambdaWithdrawRewardXtz(oracleAddress) -> {

                // Check that sender is an oracle registered on the aggregator
                if Map.mem(oracleAddress, s.oracleAddresses) then skip else failwith(error_ORACLE_NOT_PRESENT_IN_AGGREGATOR);

                // Check that satellite is not suspended or banned
                checkSatelliteIsNotSuspendedOrBanned(oracleAddress, s);
                
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

    // Check that entrypoint should not receive any tez amount   
    checkNoAmount(Unit);
    
    var operations : list(operation) := nil;

    case aggregatorLambdaAction of [
        |   LambdaWithdrawRewardStakedMvk(oracleAddress) -> {
                
                // Check that sender is an oracle registered on the aggregator
                if Map.mem(oracleAddress, s.oracleAddresses) then skip else failwith(error_ORACLE_NOT_PRESENT_IN_AGGREGATOR);

                // Check that satellite is not suspended or banned
                checkSatelliteIsNotSuspendedOrBanned(oracleAddress, s);

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
