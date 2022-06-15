// ------------------------------------------------------------------------------
//
// Aggregator Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorage) : return is
block {
    
    checkNoAmount(Unit);   
    checkSenderIsAdmin(s); 

    case aggregatorLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorage) : return is
block {
    
    checkNoAmount(Unit);     
    checkSenderIsAllowed(s);

    case aggregatorLambdaAction of [
        | LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setMaintainer lambda *)
function lambdaSetMaintainer(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorage) : return is
block {
    
    checkNoAmount(Unit);     
    
    // allowed: admin (governance proxy in most cases), governance contract, governance satellite contract, aggregator factory contract
    checkSenderIsGovernanceSatelliteOrGovernanceOrFactory(s); 

    case aggregatorLambdaAction of [
        | LambdaSetMaintainer(newMaintainerAddress) -> {
                s.maintainer := newMaintainerAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setName lambda *)
function lambdaSetName(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorage) : return is
block {
    
    checkNoAmount(Unit);     
    
    // allowed: admin (governance proxy in most cases), governance contract, governance satellite contract, aggregator factory contract
    checkSenderIsGovernanceSatelliteOrGovernanceOrFactory(s); 

    case aggregatorLambdaAction of [
        | LambdaSetName(updatedName) -> {

                // get aggregator factory address
                const aggregatorFactoryAddress : address = case s.whitelistContracts["aggregatorFactory"] of [
                      Some(_address) -> _address
                    | None -> failwith(error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND)
                ];
            
                // get aggregator name max length from factory contract
                const aggregatorFactoryConfigView : option (aggregatorFactoryConfigType) = Tezos.call_view ("getConfig", unit, aggregatorFactoryAddress);
                const aggregatorNameMaxLength : nat = case aggregatorFactoryConfigView of [
                        Some (_config) -> _config.aggregatorNameMaxLength
                    |   None -> failwith (error_GET_CONFIG_VIEW_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND)
                ];

                // set new name on aggregator contract if nameMaxLength is not exceeded
                if String.length(updatedName) > aggregatorNameMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else skip;
                s.name := updatedName;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorage) : return is
block {

    checkSenderIsAdmin(s); 

    case aggregatorLambdaAction of [
        | LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        | _ -> skip
    ];

} with (noOperations, s)




(*  updateConfig entrypoint  *)
function lambdaUpdateConfig(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage): return is
block{

    checkNoAmount(Unit);  
    checkSenderIsAdmin(s);

    case aggregatorLambdaAction of [
        | LambdaUpdateConfig(updateConfigParams) -> {

                const updateConfigAction    : aggregatorUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : aggregatorUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    | ConfigDecimals (_v)                  -> s.config.decimals                             := updateConfigNewValue
                    | ConfigNumberBlocksDelay (_v)         -> s.config.numberBlocksDelay                    := updateConfigNewValue
                    
                    | ConfigDevTriggerBanDuration (_v)     -> s.config.deviationTriggerBanDuration         := updateConfigNewValue
                    | ConfigPerThousandDevTrigger (_v)     -> s.config.perThousandDeviationTrigger          := updateConfigNewValue
                    | ConfigPercentOracleThreshold (_v)    -> s.config.percentOracleThreshold               := updateConfigNewValue

                    | ConfigRequestRateDevDepositFee (_v)  -> s.config.requestRateDeviationDepositFee       := updateConfigNewValue
                    
                    | ConfigDeviationRewardStakedMvk (_v)  -> s.config.deviationRewardStakedMvk             := updateConfigNewValue
                    | ConfigDeviationRewardAmountXtz (_v)  -> s.config.deviationRewardAmountXtz             := updateConfigNewValue
                    | ConfigRewardAmountStakedMvk (_v)     -> s.config.rewardAmountStakedMvk                := updateConfigNewValue
                    | ConfigRewardAmountXtz (_v)           -> s.config.rewardAmountXtz                      := updateConfigNewValue
                ];
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage): return is
block {
    
    checkNoAmount(Unit);  
    checkSenderIsAdmin(s);
    
    case aggregatorLambdaAction of [
        | LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage): return is
block {

    checkNoAmount(Unit);
    checkSenderIsAdmin(s);
    
    case aggregatorLambdaAction of [
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
// Admin Oracle Lambdas Begin
// ------------------------------------------------------------------------------

(*  addOracle entrypoint  *)
function lambdaAddOracle(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage): return is
block {

    case aggregatorLambdaAction of [
        | LambdaAddOracle(oracleAddress) -> {
                
                if isOracleAddress(oracleAddress, s.oracleAddresses) then failwith (error_ORACLE_ALREADY_ADDED_TO_AGGREGATOR)
                // if isOracleAddress(oracleAddress, s.oracleAddresses) then skip
                else block{
                  checkSenderIsGovernanceSatelliteOrGovernanceOrFactory(s);
                  const updatedWhiteListedContract: oracleAddressesType = Map.update(oracleAddress, Some( True), s.oracleAddresses);
                  s.oracleAddresses := updatedWhiteListedContract;
                }

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  removeOracle entrypoint  *)
function lambdaRemoveOracle(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage): return is
block {

    case aggregatorLambdaAction of [
        | LambdaRemoveOracle(oracleAddress) -> {
                
                if not isOracleAddress(oracleAddress, s.oracleAddresses) then failwith (error_ORACLE_NOT_PRESENT_IN_AGGREGATOR)
                // if not isOracleAddress(oracleAddress, s.oracleAddresses) then skip
                else block{
                  checkSenderIsGovernanceSatelliteOrGovernanceOrFactory(s);
                  const updatedWhiteListedContract: oracleAddressesType = Map.remove(oracleAddress, s.oracleAddresses);
                  s.oracleAddresses := updatedWhiteListedContract;
                }

            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Admin Oracle Lambdas Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(*  pauseAll lambda *)
function lambdaPauseAll(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage) : return is
block {
    
    checkSenderIsGovernanceSatelliteOrGovernanceOrFactory(s);

    case aggregatorLambdaAction of [
        | LambdaPauseAll(_parameters) -> {
                
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
        | _ -> skip
    ];
    
} with (noOperations, s)



(*  unpauseAll lambda *)
function lambdaUnpauseAll(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage) : return is
block {

    checkSenderIsGovernanceSatelliteOrGovernanceOrFactory(s);

    case aggregatorLambdaAction of [
        | LambdaUnpauseAll(_parameters) -> {
                
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
        | _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseReqRateUpd lambda *)
function lambdaTogglePauseReqRateUpd(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage) : return is
block {

    checkSenderIsGovernanceOrFactory(s);

    case aggregatorLambdaAction of [
        | LambdaTogglePauseReqRateUpd(_parameters) -> {
                
                if s.breakGlassConfig.requestRateUpdateIsPaused then s.breakGlassConfig.requestRateUpdateIsPaused := False
                else s.breakGlassConfig.requestRateUpdateIsPaused := True;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseReqRateUpdDev lambda *)
function lambdaTogglePauseReqRateUpdDev(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage) : return is
block {

    checkSenderIsGovernanceOrFactory(s);

    case aggregatorLambdaAction of [
        | LambdaTogglePauseReqRateUpdDev(_parameters) -> {
                
                if s.breakGlassConfig.requestRateUpdateDeviationIsPaused then s.breakGlassConfig.requestRateUpdateDeviationIsPaused := False
                else s.breakGlassConfig.requestRateUpdateDeviationIsPaused := True;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseSetObsCommit lambda *)
function lambdaTogglePauseSetObsCommit(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage) : return is
block {

    checkSenderIsGovernanceOrFactory(s);

    case aggregatorLambdaAction of [
        | LambdaTogglePauseSetObsCommit(_parameters) -> {
                
                if s.breakGlassConfig.setObservationCommitIsPaused then s.breakGlassConfig.setObservationCommitIsPaused := False
                else s.breakGlassConfig.setObservationCommitIsPaused := True;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseSetObsReveal lambda *)
function lambdaTogglePauseSetObsReveal(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage) : return is
block {

    checkSenderIsGovernanceOrFactory(s);

    case aggregatorLambdaAction of [
        | LambdaTogglePauseSetObsReveal(_parameters) -> {
                
                if s.breakGlassConfig.setObservationRevealIsPaused then s.breakGlassConfig.setObservationRevealIsPaused := False
                else s.breakGlassConfig.setObservationRevealIsPaused := True;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseRewardXtz lambda *)
function lambdaTogglePauseRewardXtz(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage) : return is
block {

    checkSenderIsGovernanceOrFactory(s);

    case aggregatorLambdaAction of [
        | LambdaTogglePauseRewardXtz(_parameters) -> {
                
                if s.breakGlassConfig.withdrawRewardXtzIsPaused then s.breakGlassConfig.withdrawRewardXtzIsPaused := False
                else s.breakGlassConfig.withdrawRewardXtzIsPaused := True;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseRewardSMvk lambda *)
function lambdaTogglePauseRewardSMvk(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage) : return is
block {

    checkSenderIsGovernanceOrFactory(s);

    case aggregatorLambdaAction of [
        | LambdaTogglePauseRewardSMvk(_parameters) -> {
                
                if s.breakGlassConfig.withdrawRewardStakedMvkIsPaused then s.breakGlassConfig.withdrawRewardStakedMvkIsPaused := False
                else s.breakGlassConfig.withdrawRewardStakedMvkIsPaused := True;

            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Oracle Lambdas Begin
// ------------------------------------------------------------------------------

(*  requestRateUpdate entrypoint  *)
function lambdaRequestRateUpdate(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage): return is
block{

    // pause / break glass check
    checkRequestRateUpdateIsNotPaused(s);

    checkMaintainership(s);

    case aggregatorLambdaAction of [
        | LambdaRequestRateUpdate(_parameters) -> {
                
                const newRound: nat = s.round + 1n;
                const emptyMapCommit : observationCommitsType = map [];
                const emptyMapReveals : observationRevealsType = map [];
                
                var newDeviationTriggerInfos: deviationTriggerInfosType := s.deviationTriggerInfos;
                if (s.deviationTriggerInfos.amount =/= 0tez) then { // -> previous round = deviation trigger
                  newDeviationTriggerInfos :=
                        record[
                            oracleAddress = Tezos.sender;
                            amount        = 0tez;
                            roundPrice    = 0n;
                        ];
                  if ( // if deviation > or < % deviation trigger
                    ((s.deviationTriggerInfos.roundPrice * 1000n * 2n + s.deviationTriggerInfos.roundPrice * s.config.perThousandDeviationTrigger) / (1000n * 2n) > s.lastCompletedRoundPrice.price)
                    or
                    (abs(s.deviationTriggerInfos.roundPrice * 1000n * 2n - s.deviationTriggerInfos.roundPrice * s.config.perThousandDeviationTrigger) / (1000n * 2n) < s.lastCompletedRoundPrice.price)
                    ) then {
                        const updatedDeviationTriggerBan: deviationTriggerBanType = Map.update(s.deviationTriggerInfos.oracleAddress, Some( Tezos.now + int (s.config.deviationTriggerBanDuration)), s.deviationTriggerBan);
                        s.deviationTriggerBan := updatedDeviationTriggerBan;

                  } else skip;
                } else skip;

                s.round                   := newRound;
                s.roundStart              := Tezos.now;
                s.observationReveals      := emptyMapReveals;
                s.observationCommits      := emptyMapCommit;
                s.deviationTriggerInfos   := newDeviationTriggerInfos;
                s.switchBlock             := 0n;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  requestRateUpdateDeviation entrypoint  *)
function lambdaRequestRateUpdateDeviation(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage): return is
block{

    // pause / break glass check
    checkRequestRateUpdateDeviationIsNotPaused(s);

    case aggregatorLambdaAction of [
        | LambdaRequestRateUpdDeviation(params) -> {

                checkIfWhiteListed(s);
                checkIfCorrectRound(abs(params.roundId - 1), s);
                checkIfLastRoundCompleted(s);
                checkOracleIsNotBannedForDeviationTrigger(s);

                // check if Tez sent is equal to request rate deposit fee (if any)
                const requestRateDeviationDepositFee : nat = s.config.requestRateDeviationDepositFee;
                if requestRateDeviationDepositFee =/= 0n and (requestRateDeviationDepositFee * 1mutez) =/= Tezos.amount then failwith(error_TEZOS_SENT_IS_NOT_EQUAL_TO_REQUEST_RATE_DEVIATION_DEPOSIT_FEE) 
                else if requestRateDeviationDepositFee = 0n and Tezos.amount > (requestRateDeviationDepositFee * 1mutez) then failwith(error_NO_REQUEST_RATE_DEVIATION_DEPOSIT_FEE_REQUIRED)
                else skip;
                
                // init new round, new empty map reveals, and set new observation commit of sender
                const newRound: nat = s.round + 1n;
                const emptyMapReveals : observationRevealsType = map [];
                const newObservationCommits = map[
                    ((Tezos.sender : address)) -> params.sign
                ];
                
                if (
                    s.deviationTriggerInfos.amount =/= 0tez
                    and
                    (
                        ((s.deviationTriggerInfos.roundPrice * 1000n * 2n + s.deviationTriggerInfos.roundPrice * s.config.perThousandDeviationTrigger) / (1000n * 2n) > s.lastCompletedRoundPrice.price)
                        or
                        (abs(s.deviationTriggerInfos.roundPrice * 1000n * 2n - s.deviationTriggerInfos.roundPrice * s.config.perThousandDeviationTrigger) / (1000n * 2n) < s.lastCompletedRoundPrice.price)
                    )
                ) then { // -> previous round = deviation trigger + deviation NOT trigger
                    
                    const updatedDeviationTriggerBan: deviationTriggerBanType = Map.update(s.deviationTriggerInfos.oracleAddress, Some( Tezos.now + int (s.config.deviationTriggerBanDuration)), s.deviationTriggerBan);
                    s.deviationTriggerBan := updatedDeviationTriggerBan;

                } else skip;

                const newDeviationTriggerInfos: deviationTriggerInfosType =
                      record[
                          oracleAddress = Tezos.sender;
                          amount        = Tezos.amount;
                          roundPrice    = s.lastCompletedRoundPrice.price;
                      ];

                const deviationRewardStakedMvk  : nat = s.config.deviationRewardStakedMvk;
                const deviationRewardXtz        : nat = s.config.deviationRewardAmountXtz;

                // if deviation reward staked MVK is not 0, then increment oracle staked MVK rewards
                if deviationRewardStakedMvk =/= 0n then {

                    var currentOracleStakedMvkRewards : nat := case s.oracleRewardStakedMvk[Tezos.sender] of [
                          Some (_amount) -> (_amount) 
                        | None -> 0n 
                    ];
                    s.oracleRewardStakedMvk[Tezos.sender]   := currentOracleStakedMvkRewards + deviationRewardStakedMvk;
                    
                } else skip;

                // if deviation reward xtz is not 0, then increment oracle xtz rewards
                if deviationRewardXtz =/= 0n then {

                    var currentOracleXtzRewards : nat := case s.oracleRewardXtz[Tezos.sender] of [
                          Some (_amount) -> (_amount) 
                        | None -> 0n 
                    ];
                    s.oracleRewardXtz[Tezos.sender]   := currentOracleXtzRewards + deviationRewardXtz;

                } else skip;

                // update storage 
                s.round                   := newRound;
                s.roundStart              := Tezos.now;
                s.observationReveals      := emptyMapReveals;
                s.observationCommits      := newObservationCommits;
                s.deviationTriggerInfos   := newDeviationTriggerInfos;
                s.switchBlock             := 0n;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setObservationCommit entrypoint  *)
function lambdaSetObservationCommit(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage): return is
block{

    // pause / break glass check
    checkSetObservationCommitIsNotPaused(s);

   case aggregatorLambdaAction of [
        | LambdaSetObservationCommit(params) -> {

                checkIfWhiteListed(s);
                checkIfTimeToCommit(s);
                checkIfCorrectRound(params.roundId, s);
                checkIfOracleAlreadyAnsweredCommit(s);
                
                const observationsDataUpdated      : observationCommitsType  = Map.update(( Tezos.sender ), Some( params.sign ), s.observationCommits);
                const numberOfObservationForRound  : nat                     = Map.size (observationsDataUpdated);
                
                var percentOracleResponse := numberOfObservationForRound * 100n / Map.size (s.oracleAddresses);
                var newSwitchBlock : nat := s.switchBlock;

                if ((percentOracleResponse >= s.config.percentOracleThreshold) and s.switchBlock = 0n) then {
                  newSwitchBlock := Tezos.level + s.config.numberBlocksDelay;
                } else skip;

                s.observationCommits  := observationsDataUpdated;
                s.switchBlock         := newSwitchBlock;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setObservationReveal entrypoint  *)
function lambdaSetObservationReveal(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage): return is
block{

    // pause / break glass check
    checkSetObservationRevealIsNotPaused(s);

   case aggregatorLambdaAction of [
        | LambdaSetObservationReveal(params) -> {

                checkIfWhiteListed(s);
                checkIfTimeToReveal(s);
                checkIfCorrectRound(params.roundId, s);
                checkIfOracleAlreadyAnsweredReveal(s);
                
                const oracleCommit: bytes = getObservationCommit(Tezos.sender, s.observationCommits);
                const hashedPack: bytes = hasherman(Bytes.pack (params.priceSalted));
                if (hashedPack =/= oracleCommit)
                then failwith(error_REVEAL_DOES_NOT_MATCH_COMMITMENT)
                else skip;

                if (params.priceSalted.2 =/= Tezos.sender)
                then failwith(error_TEZOS_ADDRESS_NOT_PRESENT_IN_HASH_COMMIT)
                else skip;

                const price: nat = params.priceSalted.0;
                const observationsDataUpdated: observationRevealsType = Map.update(( Tezos.sender ), Some( price ), s.observationReveals);
                const oracleWhiteListedSize: nat = Map.size (s.oracleAddresses);
                const numberOfObservationForRound: nat = Map.size (observationsDataUpdated);

                var newLastCompletedRoundPrice := s.lastCompletedRoundPrice;
                var percentOracleResponse := numberOfObservationForRound * 100n / oracleWhiteListedSize;

                // set rewards for oracles
                const newOracleRewardStakedMvk : oracleRewardStakedMvkType = updateRewardsStakedMvk(s);
                s.oracleRewardStakedMvk   := newOracleRewardStakedMvk;    

                const rewardAmountXtz        : nat = s.config.rewardAmountXtz;
                var currentOracleXtzRewards : nat := case s.oracleRewardXtz[Tezos.sender] of [
                          Some (_amount) -> (_amount) 
                        | None -> 0n 
                    ];
                s.oracleRewardXtz[Tezos.sender]   := currentOracleXtzRewards + rewardAmountXtz;

                // const newOracleRewardStakedMvk : oracleRewardStakedMvkType = updateRewardsStakedMvk(s);
                // const newOracleRewardXtz = Map.update(Tezos.sender, Some (getRewardAmountXtz(Tezos.sender, s) + s.config.rewardAmountXtz), updateRewardsXtz(s));

                // set new completed round price once percentOracleThreshold is reached
                if (percentOracleResponse >= s.config.percentOracleThreshold) then {
                  const median: nat = getMedianFromMap(pivotObservationMap(observationsDataUpdated), numberOfObservationForRound);
                  newLastCompletedRoundPrice := record [
                    round                 = s.round;
                    price                 = median;
                    percentOracleResponse = percentOracleResponse;
                    priceDateTime         = Tezos.now;
                  ];
                } else skip;

                s.observationReveals        := observationsDataUpdated;
                s.lastCompletedRoundPrice   := newLastCompletedRoundPrice;

            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Oracle Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Reward Lambdas Begin
// ------------------------------------------------------------------------------

(*  withdrawRewardXtz entrypoint  *)
function lambdaWithdrawRewardXtz(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage): return is
block{

    // pause / break glass check
    checkWithdrawRewardXtzIsNotPaused(s);

    var operations : list(operation) := nil;

    case aggregatorLambdaAction of [
        | LambdaWithdrawRewardXtz(oracleAddress) -> {
                
                const reward : nat = getRewardAmountXtz(oracleAddress, s);

                if (reward > 0n) then {

                    const factoryAddress : address = case s.whitelistContracts["aggregatorFactory"] of [
                          Some(_address) -> _address
                        | None -> failwith(error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND)
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
                    
                    // update oracle xtz rewards to zero
                    const newOracleRewardXtz = Map.update(oracleAddress, Some (0n), s.oracleRewardXtz);
                    s.oracleRewardXtz := newOracleRewardXtz;

                } else skip;
            }
        | _ -> skip
    ];
    
} with (operations, s)



(*  withdrawRewardStakedMvk entrypoint  *)
function lambdaWithdrawRewardStakedMvk(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage): return is
block{

    // pause / break glass check
    checkWithdrawRewardStakedMvkIsNotPaused(s);

    var operations : list(operation) := nil;

    case aggregatorLambdaAction of [
        | LambdaWithdrawRewardStakedMvk(oracleAddress) -> {
                
                const reward = getRewardAmountStakedMvk(oracleAddress, s);

                if (reward > 0n) then {

                    const factoryAddress : address = case s.whitelistContracts["aggregatorFactory"] of [
                        Some(_address) -> _address
                        | None -> failwith(error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND)
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

                    // update oracle mvk rewards to zero
                    const newOracleRewardStakedMvk = Map.update(oracleAddress, Some (0n), s.oracleRewardStakedMvk);
                    s.oracleRewardStakedMvk := newOracleRewardStakedMvk;

                } else skip;
                
            }
        | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Reward Lambdas End
// ------------------------------------------------------------------------------
