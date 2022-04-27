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
    
    checkNoAmount(Unit);    // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin

    case aggregatorLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateConfig entrypoint  *)
function updateConfig(const newConfig: aggregatorConfigType; const s: aggregatorStorage): return is
block{

    checkNoAmount(Unit);    // entrypoint should not receive any tez amount
    checkSenderIsAdmin(s); // check that sender is admin

    case aggregatorLambdaAction of [
        | LambdaUpdateConfig(newConfig) -> {
                s.config := newConfig;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  addOracle entrypoint  *)
function addOracle(const oracleAddress: address; const s: aggregatorStorage): return is

  if isOracleAddress(oracleAddress, s.oracleAddresses) then failwith ("You can't add an already present whitelisted oracle")
  else block{
    checkSenderIsAdmin(s);
    const updatedWhiteListedContract: oracleAddressesType = Map.update(oracleAddress, Some( True), s.oracleAddresses);
  } with (noOperations, s with record[oracleAddresses = updatedWhiteListedContract])



(*  removeOracle entrypoint  *)
function removeOracle(const oracleAddress: address; const s: aggregatorStorage): return is

  if not isOracleAddress(oracleAddress, s.oracleAddresses) then failwith ("You can't remove a not present whitelisted oracle")
  else block{
    checkSenderIsAdmin(s);
    const updatedWhiteListedContract: oracleAddressesType = Map.remove(oracleAddress, s.oracleAddresses);
  } with (noOperations, s with record[ oracleAddresses = updatedWhiteListedContract ])


// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Oracle Lambdas Begin
// ------------------------------------------------------------------------------

(*  requestRateUpdate entrypoint  *)
function requestRateUpdate(const s: aggregatorStorage): return is
block{

    checkMaintainership(s);

    var operations : list(operation) := nil;

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
                    (s.lastCompletedRoundPrice.price * (10000n + s.config.perthousandDeviationTrigger) / 10000n > s.deviationTriggerInfos.roundPrice) or
                    (s.lastCompletedRoundPrice.price * abs (10000n - s.config.perthousandDeviationTrigger) / 10000n < s.deviationTriggerInfos.roundPrice)) then {
                    const receiver : contract (unit) =
                      case (Tezos.get_contract_opt (s.deviationTriggerInfos.oracleAddress) : option(contract(unit))) of [
                        Some (contract) -> contract
                      | None  -> (failwith ("Not a contract") : contract (unit))
                      ];
                    const operation = Tezos.transaction(Unit, s.deviationTriggerInfos.amount, receiver);
                    operations := operation # operations;

                  } else skip;
                } else skip;

                const newOracleRewardsMVK: oracleRewardsMVKType = updateRewards(s);
                const newOracleRewardsXTZ = Map.update(Tezos.sender, Some (getRewardAmountXTZ(Tezos.sender, s) + s.config.rewardAmountXTZ), s.oracleRewardsXTZ);

                s.round                   := newRound;
                s.observationReveals      := emptyMapReveals;
                s.observationCommits      := emptyMapCommit;
                s.deviationTriggerInfos   := newDeviationTriggerInfos;
                s.switchBlock             := 0n;
                s.oracleRewardsMVK        := newOracleRewardsMVK;
                s.oracleRewardsXTZ        := newOracleRewardsXTZ;

            }
        | _ -> skip
    ];

} with (operations, s)



(*  requestRateUpdateDeviation entrypoint  *)
function requestRateUpdateDeviation(const params: setObservationCommitType; const s: aggregatorStorage): return is
block{

    checkIfWhiteListed(s);
    checkIfCorrectRound(abs(params.roundId - 1), s);
    checkIfLastRoundCompleted(s);
    checkTezosAmount(s);

    var operations : list(operation) := nil;

    case aggregatorLambdaAction of [
        | LambdaRequestRateUpdDeviation(params) -> {
                
                const newRound: nat = s.round + 1n;
                const newObservationCommits = map[
                        ((Tezos.sender : address)) -> params.sign];
                const emptyMapReveals : observationRevealsType = map [];
                

                if (s.deviationTriggerInfos.amount =/= 0tez and
                (
                (s.lastCompletedRoundPrice.price * (10000n + s.config.perthousandDeviationTrigger / 2n) / 10000n < s.deviationTriggerInfos.roundPrice)
                or
                (s.lastCompletedRoundPrice.price * abs (10000n - s.config.perthousandDeviationTrigger / 2n) / 10000n > s.deviationTriggerInfos.roundPrice))
                ) then { // -> previous round = deviation trigger
                    const receiver : contract (unit) =
                      case (Tezos.get_contract_opt (s.deviationTriggerInfos.oracleAddress) : option(contract(unit))) of [
                        Some (contract) -> contract
                      | None  -> (failwith ("Not a contract") : contract (unit))
                      ];
                    const operation = Tezos.transaction(Unit, s.deviationTriggerInfos.amount, receiver);
                    operations := operation # operations;

                } else skip;

                const newDeviationTriggerInfos: deviationTriggerInfosType =
                      record[
                          oracleAddress=Tezos.sender;
                          amount=Tezos.amount;
                          roundPrice= s.lastCompletedRoundPrice.price;
                      ];
                
                const newOracleRewardsMVK: oracleRewardsMVKType = updateRewards(s);
                const newOracleRewardsXTZ = Map.update(Tezos.sender, Some (getRewardAmountXTZ(Tezos.sender, s) + s.config.rewardAmountXTZ), s.oracleRewardsXTZ);

                s.round                   := newRound;
                s.observationReveals      := emptyMapReveals;
                s.observationCommits      := newObservationCommits;
                s.deviationTriggerInfos   := newDeviationTriggerInfos;
                s.switchBlock             := 0n;
                s.oracleRewardsMVK        := newOracleRewardsMVK;
                s.oracleRewardsXTZ        := newOracleRewardsXTZ;

            }
        | _ -> skip
    ];

} with (operations, s)



(*  setObservationCommit entrypoint  *)
function setObservationCommit(const params: setObservationCommitType; const s: aggregatorStorage): return is
block{

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
   } else skip 

} with (noOperations, s with record[observationCommits=observationsDataUpdated; switchBlock=newSwitchBlock])



(*  setObservationReveal entrypoint  *)
function setObservationReveal(const params: setObservationRevealType; const s: aggregatorStorage): return is
block{

   checkIfWhiteListed(s);
   checkIfTimeToReveal(s);
   checkIfCorrectRound(params.roundId, s);
   checkIfOracleAlreadyAnsweredReveal(s);

    const oracleCommit: bytes = getObservationCommit(Tezos.sender, s.observationCommits);
    const hashedPack: bytes = hasherman(Bytes.pack (params.priceSalted));
    if (hashedPack = oracleCommit)
    then failwith("This reveal does not match your commitment")
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
    ];
   } else skip

} with (noOperations, s with record[observationReveals=observationsDataUpdated; lastCompletedRoundPrice = newLastCompletedRoundPrice])

// ------------------------------------------------------------------------------
// Oracle Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Reward Lambdas Begin
// ------------------------------------------------------------------------------

(*  withdrawRewardXTZ entrypoint  *)
function withdrawRewardXTZ(const receiver_: address; const s: aggregatorStorage): return is
block{

    checkIfWhiteListed(s);

    const reward: tez = getRewardAmountXTZ(Tezos.sender, s) * 1mutez;
    checkEnoughXTZInTheContract(reward, s);
    const newOracleRewards = Map.update(Tezos.sender, Some (0n), s.oracleRewardsXTZ);
    const receiver : contract (unit) =
    case (Tezos.get_contract_opt (receiver_) : option(contract(unit))) of [
        Some (contract) -> contract
      | None  -> (failwith ("Not a contract") : contract (unit))
    ];
    
    const operation = Tezos.transaction(Unit, reward, receiver);
    
} with (list[operation],s with record[oracleRewardsXTZ = newOracleRewards])



(*  withdrawRewardMVK entrypoint  *)
function withdrawRewardMVK(const receiver: address; const s: aggregatorStorage): return is
block{

    checkIfWhiteListed(s);

    const reward = getRewardAmountMVK(Tezos.sender, s) * s.config.rewardAmountMVK;
    const newOracleRewards = Map.update(Tezos.sender, Some (0n), s.oracleRewardsMVK);
    const operation: operation = transferFa2Token(Tezos.self_address, receiver, reward, 0n, s.mvkTokenAddress);

} with (list[operation],s with record[oracleRewardsMVK = newOracleRewards])

// ------------------------------------------------------------------------------
// Reward Lambdas End
// ------------------------------------------------------------------------------