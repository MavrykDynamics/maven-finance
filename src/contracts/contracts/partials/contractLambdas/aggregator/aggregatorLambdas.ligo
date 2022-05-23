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



(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)

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
function lambdaAddOracle(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage): return is
block {

    case aggregatorLambdaAction of [
        | LambdaAddOracle(oracleAddress) -> {
                
                if isOracleAddress(oracleAddress, s.oracleAddresses) then failwith ("You can't add an already present whitelisted oracle")
                else block{
                  checkSenderIsAdmin(s);
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
                
                if not isOracleAddress(oracleAddress, s.oracleAddresses) then failwith ("You can't remove a not present whitelisted oracle")
                else block{
                  checkSenderIsAdmin(s);
                  const updatedWhiteListedContract: oracleAddressesType = Map.remove(oracleAddress, s.oracleAddresses);
                  s.oracleAddresses := updatedWhiteListedContract;
                }

            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Oracle Lambdas Begin
// ------------------------------------------------------------------------------

(*  requestRateUpdate entrypoint  *)
function lambdaRequestRateUpdate(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage): return is
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
                    ((s.deviationTriggerInfos.roundPrice * 1000n * 2n + s.deviationTriggerInfos.roundPrice * s.config.perthousandDeviationTrigger) / (1000n * 2n) <= s.lastCompletedRoundPrice.price)
                    or
                    (abs(s.deviationTriggerInfos.roundPrice * 1000n * 2n - s.deviationTriggerInfos.roundPrice * s.config.perthousandDeviationTrigger) / (1000n * 2n) >= s.lastCompletedRoundPrice.price)
                    ) then {
                    const receiver : contract (unit) =
                      case (Tezos.get_contract_opt (s.deviationTriggerInfos.oracleAddress) : option(contract(unit))) of [
                        Some (contract) -> contract
                      | None  -> (failwith ("Not a contract") : contract (unit))
                      ];
                    const operation = Tezos.transaction(Unit, s.deviationTriggerInfos.amount, receiver);
                    operations := operation # operations;

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

} with (operations, s)



(*  requestRateUpdateDeviation entrypoint  *)
function lambdaRequestRateUpdateDeviation(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage): return is
block{

    var operations : list(operation) := nil;

    case aggregatorLambdaAction of [
        | LambdaRequestRateUpdDeviation(params) -> {

                checkIfWhiteListed(s);
                checkIfCorrectRound(abs(params.roundId - 1), s);
                checkIfLastRoundCompleted(s);
                checkTezosAmount(s);
                
                const newRound: nat = s.round + 1n;
                const newObservationCommits = map[
                        ((Tezos.sender : address)) -> params.sign];
                const emptyMapReveals : observationRevealsType = map [];
                

                if (
                    s.deviationTriggerInfos.amount =/= 0tez
                    and
                    (
                        ((s.deviationTriggerInfos.roundPrice * 1000n * 2n + s.deviationTriggerInfos.roundPrice * s.config.perthousandDeviationTrigger) / (1000n * 2n) <= s.lastCompletedRoundPrice.price)
                        or
                        (abs(s.deviationTriggerInfos.roundPrice * 1000n * 2n - s.deviationTriggerInfos.roundPrice * s.config.perthousandDeviationTrigger) / (1000n * 2n) >= s.lastCompletedRoundPrice.price)
                    )
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
                s.roundStart              := Tezos.now;
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
function lambdaSetObservationCommit(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage): return is
block{

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

(*  withdrawRewardXTZ entrypoint  *)
function lambdaWithdrawRewardXTZ(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage): return is
block{

    // checkIfWhiteListed(s);

    var operations : list(operation) := nil;

    case aggregatorLambdaAction of [
        | LambdaWithdrawRewardXTZ(receiver) -> {
                
                const reward: tez = getRewardAmountXTZ(Tezos.sender, s) * 1mutez;

                if (reward > 0mutez) then {

                checkEnoughXTZInTheContract(reward, s);

                const newOracleRewards = Map.update(Tezos.sender, Some (0n), s.oracleRewardsXTZ);
                const receiver : contract (unit) =
                case (Tezos.get_contract_opt (receiver) : option(contract(unit))) of [
                    Some (contract) -> contract
                  | None  -> (failwith ("Not a contract") : contract (unit))
                ];
                
                const withdrawRewardXtzOperation = Tezos.transaction(Unit, reward, receiver);

                operations := withdrawRewardXtzOperation # operations;
                
                s.oracleRewardsXTZ := newOracleRewards;

                } else skip;
            }
        | _ -> skip
    ];
    
} with (operations, s)



(*  withdrawRewardMVK entrypoint  *)
function lambdaWithdrawRewardMVK(const aggregatorLambdaAction : aggregatorLambdaActionType; var s: aggregatorStorage): return is
block{

    // checkIfWhiteListed(s);

    var operations : list(operation) := nil;

    case aggregatorLambdaAction of [
        | LambdaWithdrawRewardMVK(receiver) -> {
                
                const reward = getRewardAmountMVK(Tezos.sender, s) * s.config.rewardAmountMVK;
                if (reward > 0n) then {

                const newOracleRewards = Map.update(Tezos.sender, Some (0n), s.oracleRewardsMVK);
                
                const withdrawRewardMvkOperation : operation = transferFa2Token(Tezos.self_address, receiver, reward, 0n, s.mvkTokenAddress);

                operations := withdrawRewardMvkOperation # operations;

                s.oracleRewardsMVK := newOracleRewards;

                } else skip;
                
            }
        | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Reward Lambdas End
// ------------------------------------------------------------------------------
