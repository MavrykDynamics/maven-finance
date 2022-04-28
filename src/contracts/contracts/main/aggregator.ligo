// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

// Set Lambda Types
#include "../partials/functionalTypes/setLambdaTypes.ligo"

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
  | UpdateMetadata                of updateMetadataType
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

    // Lambda Entrypoints
  | SetLambda                     of setLambdaType
  
const noOperations : list (operation) = nil;
type return is list (operation) * aggregatorStorage

// aggregator contract methods lambdas
type aggregatorUnpackLambdaFunctionType is (aggregatorLambdaActionType * aggregatorStorage) -> return



// ------------------------------------------------------------------------------
//
// Error Codes Begin
//
// ------------------------------------------------------------------------------

[@inline] const error_ONLY_ADMINISTRATOR_ALLOWED                             = 0n;
[@inline] const error_ONLY_MAINTAINER_ALLOWED                                = 1n;
[@inline] const error_ONLY_AUTHORIZED_ORACLES_ALLOWED                        = 2n;
[@inline] const error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ                      = 3n;
[@inline] const error_NOT_ENOUGH_TEZ_RECEIVED                                = 4n;

[@inline] const error_WRONG_ROUND_NUMBER                                     = 5n;
[@inline] const error_LAST_ROUND_IS_NOT_COMPLETE                             = 6n;
[@inline] const error_YOU_CANNOT_COMMIT_NOW                                  = 7n;
[@inline] const error_YOU_CANNOT_REVEAL_NOW                                  = 8n;
[@inline] const error_NOT_ENOUGH_TEZ_IN_CONTRACT_TO_WITHDRAW                 = 9n;
[@inline] const error_ORACLE_HAS_ALREADY_ANSWERED_COMMIT                     = 10n;
[@inline] const error_ORACLE_HAS_ALREADY_ANSWERED_REVEAL                     = 11n;
[@inline] const error_ORACLE_DID_NOT_ANSWER                                  = 12n;

[@inline] const error_GET_SATELLITE_OPT_VIEW_NOT_FOUND                       = 13n;
[@inline] const error_TRANSFER_ENTRYPOINT_IN_TOKEN_CONTRACT_NOT_FOUND        = 14n;

[@inline] const error_LAMBDA_NOT_FOUND                                       = 15n;
[@inline] const error_UNABLE_TO_UNPACK_LAMBDA                                = 16n;

// ------------------------------------------------------------------------------
//
// Error Codes End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

function checkSenderIsAdmin(const s: aggregatorStorage): unit is
  if Tezos.sender =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
  else unit



function checkMaintainership(const s: aggregatorStorage): unit is
  if Tezos.sender =/= s.config.maintainer then failwith(error_ONLY_MAINTAINER_ALLOWED)
  else unit



function checkIfWhiteListed(const s: aggregatorStorage): unit is
  if not Map.mem(Tezos.sender, s.oracleAddresses) then failwith(error_ONLY_AUTHORIZED_ORACLES_ALLOWED)
  else unit



function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------


function checkTezosAmount(const s: aggregatorStorage): unit is
  if Tezos.amount < (s.config.minimalTezosAmountDeviationTrigger * 1tez) then failwith(error_NOT_ENOUGH_TEZ_RECEIVED)
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
  if round =/= s.round then failwith(error_WRONG_ROUND_NUMBER)
  else unit



function checkIfLastRoundCompleted(const s: aggregatorStorage): unit is
  if s.lastCompletedRoundPrice.round =/= s.round then failwith(error_LAST_ROUND_IS_NOT_COMPLETE)
  else unit



function checkIfTimeToCommit(const s: aggregatorStorage): unit is
  if (s.switchBlock =/= 0n and Tezos.level > s.switchBlock) then failwith(error_YOU_CANNOT_COMMIT_NOW)
  else unit



function checkIfTimeToReveal(const s: aggregatorStorage): unit is
  if (s.switchBlock = 0n or Tezos.level <= s.switchBlock) then failwith(error_YOU_CANNOT_REVEAL_NOW)
  else unit



function checkEnoughXTZInTheContract(const amountToSend: tez; const s: aggregatorStorage): unit is
  if (Tezos.balance + s.deviationTriggerInfos.amount) < amountToSend then failwith(error_NOT_ENOUGH_TEZ_IN_CONTRACT_TO_WITHDRAW)
  else unit



function checkIfOracleAlreadyAnsweredCommit(const s: aggregatorStorage): unit is
  if (Map.mem(Tezos.sender, s.observationCommits)) then failwith(error_ORACLE_HAS_ALREADY_ANSWERED_COMMIT)
  else unit



function checkIfOracleAlreadyAnsweredReveal(const s: aggregatorStorage): unit is
  if (Map.mem(Tezos.sender, s.observationReveals)) then failwith(error_ORACLE_HAS_ALREADY_ANSWERED_REVEAL)
  else unit



function hasherman (const s : bytes) : bytes is Crypto.sha256 (s)



function getObservationCommit(const addressKey: address; const observationCommits: observationCommitsType) : bytes is
  case Map.find_opt(addressKey, observationCommits) of [
      Some (v) -> (v)
    | None -> failwith(error_ORACLE_DID_NOT_ANSWER)
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

function getRewardAmountXTZ(const oracleAddress: address; const s: aggregatorStorage) : nat is
  case Map.find_opt(oracleAddress, s.oracleRewardsXTZ) of [
      Some (v) -> (v)
    | None -> 0n
  ]


function updateRewards (const s: aggregatorStorage) : oracleRewardsMVKType is block {

  var empty : map(address, nat) := map [];
  var total: nat := 0n;
  for key -> _value in map s.observationReveals block {

    const emptySatelliteRecord: satelliteRecordType = record[
          status = 0n;
          stakedMvkBalance = 0n;
          satelliteFee = 0n;
          totalDelegatedAmount  = 0n;
          name  = "";
          description = "";
          image = "";
          website = "";
          registeredDateTime = Tezos.now;
      ];

    // view call getSatelliteOpt to delegation contract
    const satelliteOptView : option(satelliteRecordType) = Tezos.call_view ("getSatelliteOpt", key, s.delegationAddress);
    const satelliteOpt: satelliteRecordType = case satelliteOptView of [
        Some (value) -> value
      | None -> (emptySatelliteRecord)
    ];

    if (satelliteOpt.status =/= 0n) then {
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
    } else skip;


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
          |   None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TOKEN_CONTRACT_NOT_FOUND): contract(newTransferType))
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
    priceDateTime= s.lastCompletedRoundPrice.priceDateTime;
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
// Lambda Methods Begin
//
// ------------------------------------------------------------------------------

// Aggregator Lambdas:
#include "../partials/contractLambdas/aggregator/aggregatorLambdas.ligo"

// ------------------------------------------------------------------------------
//
// Lambda Methods End
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
// Lambda Methods Begin
//
// ------------------------------------------------------------------------------

// Aggregator Lambdas:
#include "../partials/contractLambdas/aggregator/aggregatorLambdas.ligo"

// ------------------------------------------------------------------------------
//
// Lambda Methods End
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



(*  updateMetadata entrypoint  *)
function updateMetadata(const updateMetadataParams: updateMetadataType; const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  updateConfig entrypoint  *)
function updateConfig(const newConfig: aggregatorConfigType; const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaUpdateConfig(newConfig);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  addOracle entrypoint  *)
function addOracle(const oracleAddress: address; const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaAddOracle"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaAddOracle(oracleAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  removeOracle entrypoint  *)
function removeOracle(const oracleAddress: address; const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveOracle"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaRemoveOracle(oracleAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Oracle Entrypoints Begin
// ------------------------------------------------------------------------------

(*  requestRateUpdate entrypoint  *)
function requestRateUpdate(const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaRequestRateUpdate"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaRequestRateUpdate(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  requestRateUpdateDeviation entrypoint  *)
function requestRateUpdateDeviation(const params: setObservationCommitType; const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaRequestRateUpdateDeviation"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaRequestRateUpdDeviation(params);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  setObservationCommit entrypoint  *)
function setObservationCommit(const params: setObservationCommitType; const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetObservationCommit"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaSetObservationCommit(params);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  setObservationReveal entrypoint  *)
function setObservationReveal(const params: setObservationRevealType; const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetObservationReveal"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaSetObservationReveal(params);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Oracle Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Reward Entrypoints Begin
// ------------------------------------------------------------------------------

(*  withdrawRewardXTZ entrypoint  *)
function withdrawRewardXTZ(const receiver: address; const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaWithdrawRewardXTZ"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaWithdrawRewardXTZ(receiver);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response


(*  withdrawRewardMVK entrypoint  *)
function withdrawRewardMVK(const receiver: address; const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaWithdrawRewardMVK"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaWithdrawRewardMVK(receiver);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Reward Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : aggregatorStorage): return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with(noOperations, s)

// ------------------------------------------------------------------------------
// Lambda Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Reward Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : aggregatorStorage): return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with(noOperations, s)

// ------------------------------------------------------------------------------
// Lambda Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : aggegatorAction; const s : aggregatorStorage) : return is
  case action of [

    | Default (_parameters)                     -> default(s)
      
      // Housekeeping Entrypoints
    | SetAdmin (parameters)                     -> setAdmin(parameters, s)
    | UpdateMetadata (parameters)               -> updateMetadata(parameters, s)
    | UpdateConfig (parameters)                 -> updateConfig(parameters, s)
    | AddOracle (parameters)                    -> addOracle(parameters, s)
    | RemoveOracle (parameters)                 -> removeOracle(parameters, s)

      // Oracle Entrypoints
    | RequestRateUpdate (_parameters)           -> requestRateUpdate(s)
    | RequestRateUpdateDeviation (parameters)   -> requestRateUpdateDeviation(parameters, s)
    | SetObservationCommit (parameters)         -> setObservationCommit(parameters, s)
    | SetObservationReveal (parameters)         -> setObservationReveal(parameters, s)

      // Reward Entrypoints
    | WithdrawRewardXTZ (parameters)            -> withdrawRewardXTZ(parameters, s)
    | WithdrawRewardMVK (parameters)            -> withdrawRewardMVK(parameters, s)

      // Lambda Entrypoints
    | SetLambda(parameters)                     -> setLambda(parameters, s)
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
