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
                      ConfigNameMaxLength (_v)             -> s.config.nameMaxLength                        := updateConfigNewValue
                    | ConfigDecimals (_v)                  -> s.config.decimals                             := updateConfigNewValue
                    | ConfigNumberBlocksDelay (_v)         -> s.config.numberBlocksDelay                    := updateConfigNewValue
                    
                    | ConfigDeviationTriggerTimestamp (_v) -> s.config.deviationTriggerBanTimestamp         := updateConfigNewValue
                    | ConfigPerThousandDevTrigger (_v)     -> s.config.perThousandDeviationTrigger          := updateConfigNewValue
                    | ConfigPercentOracleThreshold (_v)    -> s.config.percentOracleThreshold               := updateConfigNewValue

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
                
                // if isOracleAddress(oracleAddress, s.oracleAddresses) then failwith ("You can't add an already present whitelisted oracle")
                if isOracleAddress(oracleAddress, s.oracleAddresses) then skip
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
                
                // if not isOracleAddress(oracleAddress, s.oracleAddresses) then failwith ("You can't remove a not present whitelisted oracle")
                if not isOracleAddress(oracleAddress, s.oracleAddresses) then skip
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
                            oracleAddress=Tezos.sender;
                            amount=0tez;
                            roundPrice=0n;
                        ];
                  if ( // if deviation > or < % deviation trigger
                    ((s.deviationTriggerInfos.roundPrice * 1000n * 2n + s.deviationTriggerInfos.roundPrice * s.config.perThousandDeviationTrigger) / (1000n * 2n) > s.lastCompletedRoundPrice.price)
                    or
                    (abs(s.deviationTriggerInfos.roundPrice * 1000n * 2n - s.deviationTriggerInfos.roundPrice * s.config.perThousandDeviationTrigger) / (1000n * 2n) < s.lastCompletedRoundPrice.price)
                    ) then {
                        const updatedDeviationTriggerBan: deviationTriggerBanType = Map.update(s.deviationTriggerInfos.oracleAddress, Some( Tezos.now + int (s.config.deviationTriggerBanTimestamp)), s.deviationTriggerBan);
                        s.deviationTriggerBan := updatedDeviationTriggerBan;

                  } else skip;
                } else skip;

                const newOracleRewardStakedMvk : oracleRewardStakedMvkType = updateRewards(s);
                const newOracleRewardXtz = Map.update(Tezos.sender, Some (getRewardAmountXtz(Tezos.sender, s) + s.config.deviationRewardAmountXtz), updateRewardsXtz(s));

                s.round                   := newRound;
                s.roundStart              := Tezos.now;
                s.observationReveals      := emptyMapReveals;
                s.observationCommits      := emptyMapCommit;
                s.deviationTriggerInfos   := newDeviationTriggerInfos;
                s.switchBlock             := 0n;
                s.oracleRewardStakedMvk   := newOracleRewardStakedMvk;
                s.oracleRewardXtz         := newOracleRewardXtz;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  requestRateUpdateDeviation entrypoint  *)
function lambdaRequestRateUpdateDeviation(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage): return is
block{

    // pause / break glass check
    checkRequestRateUpdateDeviationIsNotPaused(s);

    // var operations : list(operation) := nil;

    case aggregatorLambdaAction of [
        | LambdaRequestRateUpdDeviation(params) -> {

                checkIfWhiteListed(s);
                checkIfCorrectRound(abs(params.roundId - 1), s);
                checkIfLastRoundCompleted(s);
                checkOracleIsNotBanForDeviationTrigger(s);
                
                const newRound: nat = s.round + 1n;
                const newObservationCommits = map[
                        ((Tezos.sender : address)) -> params.sign];
                const emptyMapReveals : observationRevealsType = map [];
                

                if (
                    s.deviationTriggerInfos.amount =/= 0tez
                    and
                    (
                        ((s.deviationTriggerInfos.roundPrice * 1000n * 2n + s.deviationTriggerInfos.roundPrice * s.config.perThousandDeviationTrigger) / (1000n * 2n) > s.lastCompletedRoundPrice.price)
                        or
                        (abs(s.deviationTriggerInfos.roundPrice * 1000n * 2n - s.deviationTriggerInfos.roundPrice * s.config.perThousandDeviationTrigger) / (1000n * 2n) < s.lastCompletedRoundPrice.price)
                    )
                ) then { // -> previous round = deviation trigger + deviation NOT trigger
                    
                    const updatedDeviationTriggerBan: deviationTriggerBanType = Map.update(s.deviationTriggerInfos.oracleAddress, Some( Tezos.now + int (s.config.deviationTriggerBanTimestamp)), s.deviationTriggerBan);
                    s.deviationTriggerBan := updatedDeviationTriggerBan;

                } else skip;

                const newDeviationTriggerInfos: deviationTriggerInfosType =
                      record[
                          oracleAddress = Tezos.sender;
                          amount        = Tezos.amount;
                          roundPrice    = s.lastCompletedRoundPrice.price;
                      ];
                
                const newOracleRewardStakedMvk : oracleRewardStakedMvkType = updateRewards(s);
                const newOracleRewardXtz = Map.update(Tezos.sender, Some (getRewardAmountXtz(Tezos.sender, s) + s.config.deviationRewardAmountXtz), updateRewardsXtz(s));

                s.round                   := newRound;
                s.roundStart              := Tezos.now;
                s.observationReveals      := emptyMapReveals;
                s.observationCommits      := newObservationCommits;
                s.deviationTriggerInfos   := newDeviationTriggerInfos;
                s.switchBlock             := 0n;
                s.oracleRewardStakedMvk   := newOracleRewardStakedMvk;
                s.oracleRewardXtz         := newOracleRewardXtz;

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
                
                const observationsDataUpdated: observationCommitsType = Map.update(( Tezos.sender ), Some( params.sign ), s.observationCommits);
                const numberOfObservationForRound: nat = Map.size (observationsDataUpdated);
                var percentOracleResponse := numberOfObservationForRound * 100n / Map.size (s.oracleAddresses);
                var newSwitchBlock: nat := s.switchBlock;

                if ((percentOracleResponse >= s.config.percentOracleThreshold) and s.switchBlock = 0n) then {
                  newSwitchBlock := Tezos.level + s.config.numberBlocksDelay;
                } else skip;

                s.observationCommits  := observationsDataUpdated;
                s.switchBlock          := newSwitchBlock;

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
                then failwith("This reveal does not match your commitment")
                else skip;

                if (params.priceSalted.2 =/= Tezos.sender)
                then failwith("your tezos address was not present in your hash commit")
                else skip;

                const price: nat = params.priceSalted.0;
                const observationsDataUpdated: observationRevealsType = Map.update(( Tezos.sender ), Some( price ), s.observationReveals);
                const oracleWhiteListedSize: nat = Map.size (s.oracleAddresses);
                const numberOfObservationForRound: nat = Map.size (observationsDataUpdated);

                var newLastCompletedRoundPrice := s.lastCompletedRoundPrice;
                var percentOracleResponse := numberOfObservationForRound * 100n / oracleWhiteListedSize;

                if (percentOracleResponse >= s.config.percentOracleThreshold) then {
                  const median: nat = getMedianFromMap(pivotObservationMap(observationsDataUpdated), numberOfObservationForRound);
                  newLastCompletedRoundPrice := record [
                    round= s.round;
                    price= median;
                    percentOracleResponse= percentOracleResponse;
                    priceDateTime= Tezos.now;
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
        | LambdaWithdrawRewardXtz(_receiver) -> {
                
                const reward : nat = getRewardAmountXtz(Tezos.sender, s);

                if (reward > 0n) then {

                    const factoryAddress : address = case s.whitelistContracts["aggregatorFactory"] of [
                        Some(_address) -> _address
                        | None -> failwith(error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND)
                    ];
                    
                    const distributeRewardXtzParams : distributeRewardXtzType = record [
                        recipient = Tezos.sender;
                        reward    = reward;
                    ];

                    const distributeRewardXtzOperation : operation = Tezos.transaction(
                        distributeRewardXtzParams,
                        0tez,
                        getDistributeRewardXtzInFactoryEntrypoint(factoryAddress)
                    );

                    operations := distributeRewardXtzOperation # operations;
                    
                    // update oracle xtz rewards to zero
                    const newOracleRewardXtz = Map.update(Tezos.sender, Some (0n), s.oracleRewardXtz);
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
        | LambdaWithdrawRewardStakedMvk(_receiver) -> {
                
                const reward = getRewardAmountStakedMvk(Tezos.sender, s) * s.config.rewardAmountStakedMvk;
                if (reward > 0n) then {

                    const factoryAddress : address = case s.whitelistContracts["aggregatorFactory"] of [
                        Some(_address) -> _address
                        | None -> failwith(error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND)
                    ];
                    
                    const distributeRewardMvkParams : distributeRewardMvkType = record [
                        eligibleSatellites     = set[Tezos.sender];
                        totalStakedMvkReward   = reward;
                    ];

                    const distributeRewardMvkOperation : operation = Tezos.transaction(
                        distributeRewardMvkParams,
                        0tez,
                        getDistributeRewardMvkInFactoryEntrypoint(factoryAddress)
                    );

                    operations := distributeRewardMvkOperation # operations;

                    // update oracle mvk rewards to zero
                    const newOracleRewardStakedMvk = Map.update(Tezos.sender, Some (0n), s.oracleRewardStakedMvk);
                    s.oracleRewardStakedMvk := newOracleRewardStakedMvk;

                } else skip;
                
            }
        | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Reward Lambdas End
// ------------------------------------------------------------------------------
