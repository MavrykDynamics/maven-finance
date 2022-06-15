// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

// Set Lambda Types
#include "../partials/functionalTypes/setLambdaTypes.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Delegation Types
#include "../partials/types/delegationTypes.ligo"

// Aggregator Types
#include "../partials/types/aggregatorTypes.ligo"

// ------------------------------------------------------------------------------

type aggregatorAction is

  | Default                              of (unit)

    // Housekeeping Entrypoints
  | SetAdmin                             of setAdminParams
  | SetGovernance                        of (address)
  | SetMaintainer                        of (address)
  | SetName                              of (string)
  | UpdateMetadata                       of updateMetadataType
  | UpdateConfig                         of aggregatorUpdateConfigParamsType
  | UpdateWhitelistContracts             of updateWhitelistContractsParams
  | UpdateGeneralContracts               of updateGeneralContractsParams

    // Admin Oracle Entrypoints
  | AddOracle                            of addOracleParams
  | RemoveOracle                         of address

    // Pause / Break Glass Entrypoints
  | PauseAll                             of (unit)
  | UnpauseAll                           of (unit)
  | TogglePauseRequestRateUpdate         of (unit)
  | TogglePauseRequestRateUpdateDev      of (unit)
  | TogglePauseSetObservationCommit      of (unit)
  | TogglePauseSetObservationReveal      of (unit)
  | TogglePauseWithdrawRewardXtz         of (unit)
  | TogglePauseWithdrawRewardSMvk        of (unit)

  // Maintainer Entrypoints
  | RequestRateUpdate                    of requestRateUpdateParams

  // Oracle Entrypoints
  | RequestRateUpdateDeviation           of requestRateUpdateDeviationParams
  | SetObservationCommit                 of setObservationCommitParams
  | SetObservationReveal                 of setObservationRevealParams
  
    // Reward Entrypoints
  | WithdrawRewardXtz                    of withdrawRewardXtzParams
  | WithdrawRewardStakedMvk              of withdrawRewardStakedMvkParams

    // Lambda Entrypoints
  | SetLambda                            of setLambdaType
  
const noOperations : list (operation) = nil;
type return is list (operation) * aggregatorStorage

// aggregator contract methods lambdas
type aggregatorUnpackLambdaFunctionType is (aggregatorLambdaActionType * aggregatorStorage) -> return


// ------------------------------------------------------------------------------
//
// Error Codes Begin
//
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

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

function checkSenderIsAllowed(var s : aggregatorStorage) : unit is
    if (Tezos.sender = s.admin or Tezos.sender = s.governanceAddress) then unit
        else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



function checkSenderIsAdmin(const s: aggregatorStorage): unit is
  if Tezos.sender =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
  else unit



function checkSenderIsGovernanceOrFactory(const s: aggregatorStorage): unit is
block {

    // First check because a aggregator without a factory should still be accessible
    if Tezos.sender = s.admin or Tezos.sender = s.governanceAddress then skip
    else{
        const aggregatorFactoryAddress: address = case s.whitelistContracts["aggregatorFactory"] of [
                Some (_address) -> _address
            |   None -> (failwith(error_ONLY_ADMIN_OR_AGGREGATOR_FACTORY_CONTRACT_ALLOWED): address)
        ];
        if Tezos.sender = aggregatorFactoryAddress then skip else failwith(error_ONLY_ADMIN_OR_AGGREGATOR_FACTORY_CONTRACT_ALLOWED);
    };

} with(unit)



function checkSenderIsGovernanceSatelliteOrGovernanceOrFactory(const s: aggregatorStorage): unit is
block {

    // First check because a aggregator without a factory should still be accessible
    if Tezos.sender = s.admin or Tezos.sender = s.governanceAddress then skip
    else {
        const aggregatorFactoryAddress: address = case s.whitelistContracts["aggregatorFactory"] of [
                Some (_address) -> _address
            |   None -> (failwith(error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND): address)
        ];

        const governanceSatelliteAddress: address = case s.whitelistContracts["governanceSatellite"] of [
                Some (_address) -> _address
            |   None -> (failwith(error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND): address)
        ];

        if Tezos.sender = aggregatorFactoryAddress or Tezos.sender = governanceSatelliteAddress then skip else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_OR_AGGREGATOR_FACTORY_CONTRACT_ALLOWED);
    };

} with(unit)



function checkMaintainership(const s: aggregatorStorage): unit is
  if Tezos.sender =/= s.maintainer then failwith(error_ONLY_MAINTAINER_ALLOWED)
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


function getDeviationTriggerBanOracle(const addressKey: address; const deviationTriggerBan: deviationTriggerBanType) : timestamp is
  case Map.find_opt(addressKey, deviationTriggerBan) of [
      Some (v) -> (v)
    | None -> (Tezos.now)
  ]


function checkOracleIsNotBannedForDeviationTrigger(const s: aggregatorStorage): unit is 
  if Tezos.now < (getDeviationTriggerBanOracle(Tezos.sender,s.deviationTriggerBan)) then failwith(error_NOT_ALLOWED_TO_TRIGGER_DEVIATION_BAN)
  else unit




// Whitelist Contracts: checkInWhitelistContracts, updateWhitelistContracts
#include "../partials/whitelistContractsMethod.ligo"



// General Contracts: checkInGeneralContracts, updateGeneralContracts
#include "../partials/generalContractsMethod.ligo"

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

function checkRequestRateUpdateIsNotPaused(var s : aggregatorStorage) : unit is
    if s.breakGlassConfig.requestRateUpdateIsPaused then failwith(error_REQUEST_RATE_UPDATE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED)
    else unit;

function checkRequestRateUpdateDeviationIsNotPaused(var s : aggregatorStorage) : unit is
    if s.breakGlassConfig.requestRateUpdateDeviationIsPaused then failwith(error_REQUEST_RATE_UPDATE_DEVIATION_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED)
    else unit;

function checkSetObservationCommitIsNotPaused(var s : aggregatorStorage) : unit is
    if s.breakGlassConfig.setObservationCommitIsPaused then failwith(error_SET_OBSERVATION_COMMIT_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED)
    else unit;

function checkSetObservationRevealIsNotPaused(var s : aggregatorStorage) : unit is
    if s.breakGlassConfig.setObservationRevealIsPaused then failwith(error_SET_OBSERVATION_REVEAL_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED)
    else unit;

function checkWithdrawRewardXtzIsNotPaused(var s : aggregatorStorage) : unit is
    if s.breakGlassConfig.withdrawRewardXtzIsPaused then failwith(error_WITHDRAW_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED)
    else unit;

function checkWithdrawRewardStakedMvkIsNotPaused(var s : aggregatorStorage) : unit is
    if s.breakGlassConfig.withdrawRewardStakedMvkIsPaused then failwith(error_WITHDRAW_REWARD_STAKED_MVK_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED)
    else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get distributeRewardXtz entrypoint in factory contract
function getDistributeRewardXtzInFactoryEntrypoint(const contractAddress : address) : contract(distributeRewardXtzType) is
case (Tezos.get_entrypoint_opt(
      "%distributeRewardXtz",
      contractAddress) : option(contract(distributeRewardXtzType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_DISTRIBUTE_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND) : contract(distributeRewardXtzType))
];



// helper function to get distributeRewardMvk entrypoint in factory contract
function getDistributeRewardStakedMvkInFactoryEntrypoint(const contractAddress : address) : contract(distributeRewardStakedMvkType) is
case (Tezos.get_entrypoint_opt(
      "%distributeRewardStakedMvk",
      contractAddress) : option(contract(distributeRewardStakedMvkType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_DISTRIBUTE_REWARD_STAKED_MVK_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND) : contract(distributeRewardStakedMvkType))
];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
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



function checkEnoughXtzInTheContract(const amountToSend: tez; const s: aggregatorStorage): unit is
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

function getRewardAmountStakedMvk(const oracleAddress: address; const s: aggregatorStorage) : nat is
  case Map.find_opt(oracleAddress, s.oracleRewardStakedMvk) of [
      Some (v) -> (v)
    | None -> 0n
  ]



function getRewardAmountXtz(const oracleAddress: address; const s: aggregatorStorage) : nat is
  case Map.find_opt(oracleAddress, s.oracleRewardXtz) of [
      Some (v) -> (v)
    | None -> 0n
  ]

function updateRewardsStakedMvk (const s: aggregatorStorage) : oracleRewardStakedMvkType is block {

  var tempSatellitesMap : map(address, nat) := map [];
  var total: nat := 0n;

  // loop over satellite oracles who have committed their price feed data, and calculate total voting power 
  // and store each satellite respective share in tempSatellitesMap
  // note: may result in slight discrepancies if some oracles do not reveal their price feed data
  for oracleAddress -> _value in map s.observationCommits block {

    // view call getSatelliteOpt to delegation contract
    const delegationAddressGeneralContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
    const delegationAddress: address = case delegationAddressGeneralContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
            ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];
    const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", oracleAddress, delegationAddress);
    const satelliteOpt : satelliteRecordType = case satelliteOptView of [
        Some (optionView) -> case optionView of [
            Some(_satelliteRecord)      -> _satelliteRecord
          | None                        -> failwith(error_SATELLITE_NOT_FOUND)
        ]
      | None -> failwith(error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
    ];

    // get total sum of all satellite oracles total voting power (to be used as denominator to determine each oracle's share of staked MVK rewards)
    if (satelliteOpt.status = "ACTIVE") then {

      // get votingPowerRatio from governance contract
      const governanceConfigView : option (governanceConfigType) = Tezos.call_view ("getConfig", unit, s.governanceAddress);
      const votingPowerRatio : nat = case governanceConfigView of [
            Some(_config) -> _config.votingPowerRatio
          | None -> failwith(error_GET_CONFIG_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
      ];

      // totalVotingPower calculation
      const maxTotalVotingPower = abs(satelliteOpt.stakedMvkBalance * 10000 / votingPowerRatio);
      const mvkBalanceAndTotalDelegatedAmount = satelliteOpt.stakedMvkBalance + satelliteOpt.totalDelegatedAmount; 
      
      var totalVotingPower : nat := 0n;
      if mvkBalanceAndTotalDelegatedAmount > maxTotalVotingPower then totalVotingPower := maxTotalVotingPower
      else totalVotingPower := mvkBalanceAndTotalDelegatedAmount;

      // totalVotingPower storage + total updated
      tempSatellitesMap := Map.update(oracleAddress, Some (totalVotingPower), tempSatellitesMap);
      total             := total + totalVotingPower;

    } else skip;

  };

  // get oracle reward staked mvk map (i.e. satellite addresses to reward amount they can claim)
  var newOracleRewardStakedMvk: oracleRewardStakedMvkType := s.oracleRewardStakedMvk;

  // get reward amount staked mvk
  const rewardAmountStakedMvk : nat = s.config.rewardAmountStakedMvk;

  // increment satellites' staked mvk reward amounts based on their share of total voting power (among other satellites for this observation reveal)
  for oracleAddress -> value in map tempSatellitesMap block {
    const newStakedMvkReward = (value / total) * rewardAmountStakedMvk;
    newOracleRewardStakedMvk := Map.update(oracleAddress, Some (getRewardAmountStakedMvk(Tezos.sender, s) + newStakedMvkReward), newOracleRewardStakedMvk);
  };

} with (newOracleRewardStakedMvk)



// function updateRewardsXtz (const s: aggregatorStorage) : oracleRewardXtzType is block {
//   var newOracleRewardXtz: oracleRewardXtzType := s.oracleRewardXtz;

//   for key -> _value in map s.observationReveals block {
//     newOracleRewardXtz := Map.update(key, Some (getRewardAmountXtz(key, s) + s.config.rewardAmountXtz), newOracleRewardXtz);
//   };
// } with (newOracleRewardXtz)

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
          |   None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND): contract(newTransferType))
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

(* View: get admin variable *)
[@view] function getAdmin(const _: unit; var s : aggregatorStorage) : address is
  s.admin



(* View: get config *)
[@view] function getConfig(const _: unit; var s : aggregatorStorage) : aggregatorConfigType is
  s.config



(* View: get Governance address *)
[@view] function getGovernanceAddress(const _: unit; var s : aggregatorStorage) : address is
  s.governanceAddress



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _: unit; var s : aggregatorStorage) : whitelistContractsType is
  s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _: unit; var s : aggregatorStorage) : generalContractsType is
  s.generalContracts



(* View: get Maintainer address *)
[@view] function getMaintainerAddress(const _: unit; var s : aggregatorStorage) : address is
  s.maintainer



(* View: get oracle addresses *)
[@view] function getOracleAddresses(const _: unit; var s : aggregatorStorage) : oracleAddressesType is
  s.oracleAddresses



(* View: get observation commits *)
[@view] function getObservationCommits(const _: unit; var s : aggregatorStorage) : observationCommitsType is
  s.observationCommits



(* View: get observation reveals *)
[@view] function getObservationReveals(const _: unit; var s : aggregatorStorage) : observationRevealsType is
  s.observationReveals



(* View: get deviation trigger infos *)
[@view] function getDeviationTriggerInfos(const _: unit; var s : aggregatorStorage) : deviationTriggerInfosType is
  s.deviationTriggerInfos



(* View: get deviation trigger ban *)
[@view] function getDeviationTriggerBan(const _: unit; var s : aggregatorStorage) : deviationTriggerBanType is
  s.deviationTriggerBan



(* View: get oracle reward staked MVK *)
[@view] function getOracleRewardStakedMvk(const _: unit; var s : aggregatorStorage) : oracleRewardStakedMvkType is
  s.oracleRewardStakedMvk



(* View: get oracle reward xtz *)
[@view] function getOracleRewardXtz(const _: unit; var s : aggregatorStorage) : oracleRewardXtzType is
  s.oracleRewardXtz



(* View: get last completed round price *)
[@view] function getLastCompletedRoundPrice (const _ : unit ; const s: aggregatorStorage) : lastCompletedRoundPriceReturnType is block {
  const withDecimal : lastCompletedRoundPriceReturnType = record [
    price                 = s.lastCompletedRoundPrice.price;
    percentOracleResponse = s.lastCompletedRoundPrice.percentOracleResponse;
    round                 = s.lastCompletedRoundPrice.round;
    decimals              = s.config.decimals;
    priceDateTime         = s.lastCompletedRoundPrice.priceDateTime;
  ]
} with (withDecimal)



(* View: get decimals *)
[@view] function getDecimals (const _ : unit ; const s: aggregatorStorage) : nat is s.config.decimals;



(* View: get round *)
[@view] function getRound (const _ : unit ; const s: aggregatorStorage) : nat is s.round;



(* View: get round start *)
[@view] function getRoundStart (const _ : unit ; const s: aggregatorStorage) : timestamp is s.roundStart;



(* View: get switchblock *)
[@view] function getSwitchBlock (const _ : unit ; const s: aggregatorStorage) : nat is s.switchBlock;



(* View: get name *)
[@view] function getContractName (const _ : unit ; const s: aggregatorStorage) : string is s.name;



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : aggregatorStorage) : option(bytes) is
  Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _: unit; var s : aggregatorStorage) : lambdaLedgerType is
  s.lambdaLedger

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



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : aggregatorStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  setMaintainer entrypoint *)
function setMaintainer(const newMaintainerAddress : address; var s : aggregatorStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetMaintainer"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaSetMaintainer(newMaintainerAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  setName entrypoint *)
function setName(const newContractName : string; var s : aggregatorStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetName"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaSetName(newContractName);

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
function updateConfig(const updateConfigParams: aggregatorUpdateConfigParamsType; const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: aggregatorStorage) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: aggregatorStorage) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Admin Oracle Entrypoints Begin
// ------------------------------------------------------------------------------

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
// Oracle Admin Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------

(*  pauseAll entrypoint  *)
function pauseAll(const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  unpauseAll entrypoint  *)
function unpauseAll(const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  togglePauseRequestRateUpdate entrypoint  *)
function togglePauseRequestRateUpdate(const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseReqRateUpd"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaTogglePauseReqRateUpd(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  togglePauseRequestRateUpdateDev entrypoint  *)
function togglePauseRequestRateUpdateDev(const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseReqRateUpdDev"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaTogglePauseReqRateUpdDev(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  togglePauseSetObservationCommit entrypoint  *)
function togglePauseSetObservationCommit(const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseSetObsCommit"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaTogglePauseSetObsCommit(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  togglePauseSetObservationReveal entrypoint  *)
function togglePauseSetObservationReveal(const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseSetObsReveal"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaTogglePauseSetObsReveal(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response


(*  togglePauseWithdrawRewardXtz entrypoint  *)
function togglePauseWithdrawRewardXtz(const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseRewardXtz"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaTogglePauseRewardXtz(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  togglePauseWithdrawRewardSMvk entrypoint  *)
function togglePauseWithdrawRewardSMvk(const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseRewardSMvk"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaTogglePauseRewardSMvk(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
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

(*  withdrawRewardXtz entrypoint  *)
function withdrawRewardXtz(const receiver: address; const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaWithdrawRewardXtz"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaWithdrawRewardXtz(receiver);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response


(*  withdrawRewardStakedMvk entrypoint  *)
function withdrawRewardStakedMvk(const receiver: address; const s: aggregatorStorage): return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaWithdrawRewardStakedMvk"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaWithdrawRewardStakedMvk(receiver);

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
function main (const action : aggregatorAction; const s : aggregatorStorage) : return is
  case action of [

    | Default (_parameters)                           -> default(s)
      
      // Housekeeping Entrypoints
    | SetAdmin (parameters)                           -> setAdmin(parameters, s)
    | SetGovernance(parameters)                       -> setGovernance(parameters, s) 
    | SetMaintainer(parameters)                       -> setMaintainer(parameters, s) 
    | SetName(parameters)                             -> setName(parameters, s) 
    | UpdateMetadata (parameters)                     -> updateMetadata(parameters, s)
    | UpdateConfig (parameters)                       -> updateConfig(parameters, s)
    | UpdateWhitelistContracts (parameters)           -> updateWhitelistContracts(parameters, s)
    | UpdateGeneralContracts (parameters)             -> updateGeneralContracts(parameters, s)

      // Admin Oracle Entrypoints
    | AddOracle (parameters)                          -> addOracle(parameters, s)
    | RemoveOracle (parameters)                       -> removeOracle(parameters, s)

      // Pause / Break Glass Entrypoints
    | PauseAll (_parameters)                          -> pauseAll(s)
    | UnpauseAll (_parameters)                        -> unpauseAll(s)
    | TogglePauseRequestRateUpdate (_parameters)      -> togglePauseRequestRateUpdate(s)
    | TogglePauseRequestRateUpdateDev (_parameters)   -> togglePauseRequestRateUpdateDev(s)
    | TogglePauseSetObservationCommit (_parameters)   -> togglePauseSetObservationCommit(s)
    | TogglePauseSetObservationReveal (_parameters)   -> togglePauseSetObservationReveal(s)
    | TogglePauseWithdrawRewardXtz (_parameters)      -> togglePauseWithdrawRewardXtz(s)
    | TogglePauseWithdrawRewardSMvk (_parameters)     -> togglePauseWithdrawRewardSMvk(s)

      // Oracle Entrypoints
    | RequestRateUpdate (_parameters)                 -> requestRateUpdate(s)
    | RequestRateUpdateDeviation (parameters)         -> requestRateUpdateDeviation(parameters, s)
    | SetObservationCommit (parameters)               -> setObservationCommit(parameters, s)
    | SetObservationReveal (parameters)               -> setObservationReveal(parameters, s)

      // Reward Entrypoints
    | WithdrawRewardXtz (parameters)                  -> withdrawRewardXtz(parameters, s)
    | WithdrawRewardStakedMvk (parameters)            -> withdrawRewardStakedMvk(parameters, s)

      // Lambda Entrypoints
    | SetLambda(parameters)                           -> setLambda(parameters, s)
  ];