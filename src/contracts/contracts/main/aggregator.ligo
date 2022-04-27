// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Aggregator Types
#include "../partials/types/aggregatorTypes.ligo"

// ------------------------------------------------------------------------------

type aggegatorAction is

  | Default                       of defaultParams

    // Housekeeping Entrypoints
  | SetAdmin                      of setAdminParams
  | UpdateConfig                  of updateConfigParams
  | AddOracle                     of addOracleParams
  | RemoveOracle                  of address

    // Oracle Entrypoints
  | RequestRateUpdate             of requestRateUpdateParams
  | RequestRateUpdateDeviation    of requestRateUpdateDeviationParams
  | SetObservationCommit          of setObservationCommitParams
  | SetObservationReveal          of setObservationRevealParams
  
    // Reward Entrypoints
  | WithdrawRewardXTZ             of withdrawRewardXTZParams
  | WithdrawRewardMVK             of withdrawRewardMVKParams
  
const noOperations : list (operation) = nil;
type return is list (operation) * aggregatorStorage

// aggregator contract methods lambdas
type aggregatorUnpackLambdaFunctionType is (aggregatorLambdaActionType * aggregatorStorage) -> return



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

function checkSenderIsAdmin(const s: aggregatorStorage): unit is
  if Tezos.sender =/= s.admin then failwith("Only admin can do this action")
  else unit



function checkMaintainership(const s: aggregatorStorage): unit is
  if Tezos.sender =/= s.config.maintainer then failwith("Only maintainer can do this action")
  else unit



function checkIfWhiteListed(const s: aggregatorStorage): unit is
  if not Map.mem(Tezos.sender, s.oracleAddresses) then failwith("Only authorized oracle contract can do this action")
  else unit



function checkTezosAmount(const s: aggregatorStorage): unit is
  if Tezos.amount < (s.config.minimalTezosAmountDeviationTrigger * 1tez) then failwith("You should send XTZ to call this entrypoint")
  else unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Oracle Helper Functions Begin
// ------------------------------------------------------------------------------

function isOracleAddress(const contractAddress: address; const oracleAddresses: oracleAddressesType): bool is
  Map.mem(contractAddress, oracleAddresses)



function checkIfCorrectRound(const round: nat; const s: aggregatorStorage): unit is
  if round =/= s.round then failwith("Wrong round number")
  else unit



function checkIfLastRoundCompleted(const s: aggregatorStorage): unit is
  if s.lastCompletedRoundPrice.round =/= s.round then failwith("Last round is not completed")
  else unit



function checkIfTimeToCommit(const s: aggregatorStorage): unit is
  if (s.switchBlock =/= 0n and Tezos.level > s.switchBlock) then failwith("You cannot commit now")
  else unit



function checkIfTimeToReveal(const s: aggregatorStorage): unit is
  if (s.switchBlock = 0n or Tezos.level <= s.switchBlock) then failwith("You cannot reveal now")
  else unit



function checkEnoughXTZInTheContract(const amountToSend: tez; const s: aggregatorStorage): unit is
  if (Tezos.balance + s.deviationTriggerInfos.amount) < amountToSend then failwith("Not enought XTZ in the contract to withdraw")
  else unit



function checkIfOracleAlreadyAnsweredCommit(const s: aggregatorStorage): unit is
  if (Map.mem(Tezos.sender, s.observationCommits)) then failwith("Oracle already answer a commit")
  else unit



function checkIfOracleAlreadyAnsweredReveal(const s: aggregatorStorage): unit is
  if (Map.mem(Tezos.sender, s.observationReveals)) then failwith("Oracle already answer a reveal")
  else unit



function hasherman (const s : bytes) : bytes is Crypto.sha256 (s)



function getObservationCommit(const addressKey: address; const observationCommits: observationCommitsType) : bytes is
  case Map.find_opt(addressKey, observationCommits) of [
      Some (v) -> (v)
    | None -> failwith("Oracle didn't answer")
  ]



function getObservationsPriceUtils(const price: nat; const myMap: pivotedObservationsType) : nat is
  case Map.find_opt(price, myMap) of [
      Some (v) -> (v+1n)
    | None -> 1n
  ]



function getObservationsPrice(const addressKey: address; const observationReveals: observationRevealsType) : nat is
  case Map.find_opt(addressKey, observationReveals) of [
      Some (v) -> (v)
    | None -> 0n
  ]



function pivotObservationMap (var m : observationRevealsType) : pivotedObservationsType is block {
  (*
    Build a map of form:
      observationValue -> observationCount
    from of map of form:
      oracleAddress -> observationValue

    This is useful to compute the median later since
  *)
  var empty : pivotedObservationsType := map [];
  for _key -> value in map m block {
      var temp: nat := getObservationsPriceUtils(value, empty);
      empty := Map.update(value, Some (temp), empty);
  }
} with (empty)



function getMedianFromMap (var m : pivotedObservationsType; const sizeMap: nat) : nat is block {
  (*
    m is a map: observationValue -> observationCount, sorted by observation value
    Example:
      Observations are: 10, 10, 20, 30, 30, 40. The map will be:
      10 -> 2
      20 -> 1
      30 -> 2
      40 -> 1

    We want to extract the median of observation values.

    Since we know the number of observation (in the example: 6),
    we can iterate through the map while keeping a count of the passed observation count. This way, we know when we will hit the intresting values
    (n/2 for odd observation count, n/2 and n/2 + 1 for even observation)

    For the example above, we want to average the 3rd (6/2) and 4th (6/2 + 1) value.
    So we go though the map and accumulate the observation count:

    1st loop iteration (10 -> 2):
      // Nothing to do, no intresting values
      accumulator = 2

    2nd loop iteration (20 -> 1):
      // We have hit the first interesting value !
      median = 20 (first part of the median)
      accumulator = 3 (2 + 1)

    3rd loop iteration (30 -> 2)
      // We have hit the second interesting value!
      // Compute the median with the first part of the median:
      median = (median + 30) / 2
      accumulator = 5 (3 + 2)

    4rd loop iteration (40 -> 1)
      // Nothing to do, intresting values have already passed
      accumulator = 6 (5 + 1)

    The logic remains the same for odd number of observation, we just have to save one value
   *)

  const isEven: bool = (sizeMap mod 2n) = 0n;
  const medianIndex: nat = (sizeMap / 2n);
  var _observationCountAccumulator: nat := 0n;
  var median: nat := 0n;

  for observationValue -> observationCount in map m block {
    if isEven then {
      if (medianIndex >= _observationCountAccumulator + 1n and medianIndex < _observationCountAccumulator + observationCount + 1n) then
        median := observationValue
      else
        skip;

      if (medianIndex >= _observationCountAccumulator and medianIndex < _observationCountAccumulator + observationCount) then
        median := (median + observationValue) / 2n
      else
        skip;

    } else {
      if (medianIndex >= _observationCountAccumulator and medianIndex < _observationCountAccumulator + observationCount) then
        median := observationValue
      else
        skip;
    };

    _observationCountAccumulator := _observationCountAccumulator + observationCount;
  }
} with (median)

// ------------------------------------------------------------------------------
// Oracle Helper Functions Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Reward Helper Functions Begin
// ------------------------------------------------------------------------------

function getRewardAmountMVK(const oracleAddress: address; const s: aggregatorStorage) : nat is
  case Map.find_opt(oracleAddress, s.oracleRewardsMVK) of [
      Some (v) -> (v)
    | None -> 0n
  ]



function getRewardAmountXTZ(const oracleAddress: address; const s: aggregatorStorage) : nat is
  case Map.find_opt(oracleAddress, s.oracleRewardsXTZ) of [
      Some (v) -> (v)
    | None -> 0n
  ]



function updateRewards (const s: aggregatorStorage) : oracleRewardsMVKType is block {

  var empty : map(address, nat) := map [];
  var total: nat := 0n;
  for key -> _value in map s.observationReveals block {

    // view call getSatelliteOpt to delegation contract
    const satelliteOptView : option(satelliteRecordType) = Tezos.call_view ("getSatelliteOpt", key, s.mvkTokenAddress);
    const satelliteOpt: satelliteRecordType = case satelliteOptView of [
        Some (value) -> value
      | None -> (failwith ("Error. GetSatelliteOpt View not found in the Doorman Contract") : satelliteRecordType)
    ];

    // totalVotingPower calcultation
    const votingPowerRatio = 10000n;
    const maxTotalVotingPower = abs(satelliteOpt.stakedMvkBalance * 10000 / votingPowerRatio);
    const mvkBalanceAndTotalDelegatedAmount = satelliteOpt.stakedMvkBalance + satelliteOpt.totalDelegatedAmount; 
    var totalVotingPower : nat := 0n;
    if mvkBalanceAndTotalDelegatedAmount > maxTotalVotingPower then totalVotingPower := maxTotalVotingPower
    else totalVotingPower := mvkBalanceAndTotalDelegatedAmount;

    // totalVotingPower storage + total updated
    empty := Map.update(key, Some (totalVotingPower), empty);
    total := total + totalVotingPower;
  };
  var newOracleRewardsMVK: oracleRewardsMVKType := s.oracleRewardsMVK;

  for key -> value in map empty block {
    const reward = (value / total);
    newOracleRewardsMVK := Map.update(key, Some (getRewardAmountMVK(Tezos.sender, s) + reward), newOracleRewardsMVK);
  };
} with (newOracleRewardsMVK)

// ------------------------------------------------------------------------------
// Reward Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Transfer Helper Functions Begin
// ------------------------------------------------------------------------------

function transferFa2Token(const from_: address; const to_: address; const tokenAmount: nat; const tokenId: nat; const tokenContractAddress: address): operation is
block{
    const transferParams: newTransferType = list[
            record[
                from_=from_;
                txs=list[
                    record[
                        to_=to_;
                        token_id=tokenId;
                        amount=tokenAmount;
                    ]
                ]
            ]
        ];

    const tokenContract: contract(newTransferType) =
        case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(newTransferType))) of [
              Some (c) -> c
          |   None -> (failwith("Transfer entrypoint not found in Token contract"): contract(newTransferType))
        ];
} with (Tezos.transaction(transferParams, 0tez, tokenContract))

// ------------------------------------------------------------------------------
// Transfer Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

function unpackLambda(const lambdaBytes : bytes; const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorage) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(aggregatorUnpackLambdaFunctionType)) of [
        Some(f) -> f(aggregatorLambdaAction, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Lambda Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Helper Functions End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get last completed round price *)
[@view] function lastCompletedRoundPrice (const _ : unit ; const s: aggregatorStorage) : lastCompletedRoundPriceReturnType is block {
  const withDecimal : lastCompletedRoundPriceReturnType = record [
    price= s.lastCompletedRoundPrice.price;
    percentOracleResponse= s.lastCompletedRoundPrice.percentOracleResponse;
    round= s.lastCompletedRoundPrice.round;
    decimals= s.config.decimals;
  ]
} with (withDecimal)

(* View: get decimals *)
[@view] function decimals (const _ : unit ; const s: aggregatorStorage) : nat is s.config.decimals;

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------

  


// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  addOracle entrypoint  *)
function default(const s : aggregatorStorage) : return is
block {
    skip
} with (noOperations, s)



(*  setAdmin entrypoint  *)
function setAdmin(const newAdminAddress: adminType; const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  updateConfig entrypoint  *)
function updateConfig(const newConfig: aggregatorConfigType; const s: aggregatorStorage): return is
block{
  checkSenderIsAdmin(s);
} with (noOperations, s with record[config=newConfig])



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
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Oracle Entrypoints Begin
// ------------------------------------------------------------------------------

(*  requestRateUpdate entrypoint  *)
function requestRateUpdate(const s: aggregatorStorage): return is
block{

    checkMaintainership(s);
    
    const newRound: nat = s.round + 1n;
    const emptyMapCommit : observationCommitsType = map [];
    const emptyMapReveals : observationRevealsType = map [];
    var operations : list(operation) := nil;
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

} with (operations, s with record[round=newRound; observationReveals=emptyMapReveals; observationCommits=emptyMapCommit; deviationTriggerInfos=newDeviationTriggerInfos; switchBlock=0n; oracleRewardsXTZ=newOracleRewardsMVK; oracleRewardsXTZ = newOracleRewardsXTZ])



(*  requestRateUpdateDeviation entrypoint  *)
function requestRateUpdateDeviation(const params: setObservationCommitType; const s: aggregatorStorage): return is
block{

    checkIfWhiteListed(s);
    checkIfCorrectRound(abs(params.roundId - 1), s);
    checkIfLastRoundCompleted(s);
    checkTezosAmount(s);

    const newRound: nat = s.round + 1n;
    const newObservationCommits = map[
            ((Tezos.sender : address)) -> params.sign];
    const emptyMapReveals : observationRevealsType = map [];
    var operations : list(operation) := nil;

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

} with (operations, s with record[round=newRound; observationCommits=newObservationCommits; observationReveals=emptyMapReveals; deviationTriggerInfos=newDeviationTriggerInfos; switchBlock=0n; oracleRewardsXTZ=newOracleRewardsMVK; oracleRewardsXTZ = newOracleRewardsXTZ])



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
// Oracle Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Reward Entrypoints Begin
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
// Reward Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : aggegatorAction; const aggregatorStorage : aggregatorStorage) : return is
  case action of [

    | Default (_u)                          -> default(aggregatorStorage)
      
      // Housekeeping Entrypoints
    | SetAdmin (params)                     -> setAdmin(params, aggregatorStorage)
    | UpdateConfig (params)                 -> updateConfig(params, aggregatorStorage)
    | AddOracle (c)                         -> addOracle(c, aggregatorStorage)
    | RemoveOracle (c)                      -> removeOracle(c, aggregatorStorage)

      // Oracle Entrypoints
    | RequestRateUpdate (_u)                -> requestRateUpdate(aggregatorStorage)
    | RequestRateUpdateDeviation (params)   -> requestRateUpdateDeviation(params, aggregatorStorage)
    | SetObservationCommit (params)         -> setObservationCommit(params, aggregatorStorage)
    | SetObservationReveal (params)         -> setObservationReveal(params, aggregatorStorage)

      // Reward Entrypoints
    | WithdrawRewardXTZ (params)            -> withdrawRewardXTZ(params, aggregatorStorage)
    | WithdrawRewardMVK (params)            -> withdrawRewardMVK(params, aggregatorStorage)
  ];

(*
To add as STORAGE field to deplopy on https://ide.ligolang.org/

record [
  oracleAddresses=map[
    (("tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx" : address)) -> True;
    (("tz1e3CMVjAUZF1CbbnSZXhAae5fFxDdc6pSh" : address)) -> True;
    (("tz1ihvnEowDw3xZ96jVRJpsdMCZVo59Cbmoa" : address)) -> True
    ];
  round=0;
  decimals=8;
  percentOracleThreshold=100n;
  lastCompletedRoundPrice=record [
      round= 0n;
      price= 0n;
      percentOracleResponse= 0n;
  ];
  owner= ("tz1e3CMVjAUZF1CbbnSZXhAae5fFxDdc6pSh": address);
  observations=map[
    0 ->
      map[
    ("tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx" : address) -> 0]
  ];
]

*)
