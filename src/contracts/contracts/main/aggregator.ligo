// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Helpers and Types
// ------------------------------------------------------------------------------

// Shared Helpers
#include "../partials/shared/sharedHelpers.ligo"

// Transfer Helpers
#include "../partials/shared/transferHelpers.ligo"

// Permission Helpers
#include "../partials/shared/permissionHelpers.ligo"

// Votes Helpers
#include "../partials/shared/voteHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Delegation Types
#include "../partials/contractTypes/delegationTypes.ligo"

// Governance Types
#include "../partials/contractTypes/governanceTypes.ligo"

// Aggregator Types
#include "../partials/contractTypes/aggregatorTypes.ligo"

// Aggregator Factory Types
#include "../partials/contractTypes/aggregatorFactoryTypes.ligo"

// ------------------------------------------------------------------------------

type aggregatorAction is

        // Housekeeping Entrypoints
    |   SetAdmin                             of (address)
    |   SetGovernance                        of (address)
    |   SetName                              of (string)
    |   UpdateMetadata                       of updateMetadataType
    |   UpdateConfig                         of aggregatorUpdateConfigParamsType
    |   UpdateWhitelistContracts             of updateWhitelistContractsType
    |   UpdateGeneralContracts               of updateGeneralContractsType
    |   MistakenTransfer                     of transferActionType

        // Admin Oracle Entrypoints
    |   AddOracle                            of addOracleType
    |   RemoveOracle                         of address

        // Pause / Break Glass Entrypoints
    |   PauseAll                             of (unit)
    |   UnpauseAll                           of (unit)
    |   TogglePauseEntrypoint                of aggregatorTogglePauseEntrypointType

        // Oracle Entrypoints
    |   UpdateData                   of updateDataType
    
        // Reward Entrypoints
    |   WithdrawRewardXtz                    of withdrawRewardXtzType
    |   WithdrawRewardStakedMvk              of withdrawRewardStakedMvkType

        // Lambda Entrypoints
    |   SetLambda                            of setLambdaType
  

const noOperations : list (operation) = nil;
type return is list (operation) * aggregatorStorageType

// aggregator contract methods lambdas
type aggregatorUnpackLambdaFunctionType is (aggregatorLambdaActionType * aggregatorStorageType) -> return



// ------------------------------------------------------------------------------
//
// Constants Begin
//
// ------------------------------------------------------------------------------

const fixedPointAccuracy : nat = 1_000_000_000_000_000_000_000_000n // 10^24

// ------------------------------------------------------------------------------
//
// Constants End
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

// Allowed Senders : Admin, Governance Contract
function checkSenderIsAllowed(var s : aggregatorStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



// Allowed Senders : Admin
function checkSenderIsAdmin(const s : aggregatorStorageType) : unit is
    if Tezos.get_sender() =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit



// Allowed Senders : Admin, Governance Satellite Contract
function checkSenderIsAdminOrGovernanceSatellite(const s : aggregatorStorageType) : unit is
block {

    if Tezos.get_sender() = s.admin then skip
    else{
        const governanceSatelliteAddress : address = case s.whitelistContracts["governanceSatellite"] of [
                Some (_address) -> _address
            |   None            -> (failwith(error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND) : address)
        ];

        if Tezos.get_sender() = governanceSatelliteAddress then skip else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_ALLOWED);
    };

} with(unit)



function checkSenderIsAdminOrGovernanceSatelliteContract(var s : aggregatorStorageType) : unit is
block{
  if Tezos.get_sender() = s.admin then skip
  else {
    const governanceSatelliteAddress: address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);

    if Tezos.get_sender() = governanceSatelliteAddress then skip
      else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED);
  }
} with unit



function checkSenderIsAdminOrGovernanceOrGovernanceSatelliteOrFactory(const s: aggregatorStorageType): unit is
block {

    if Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress then skip
    else {
        const aggregatorFactoryAddress : address = case s.whitelistContracts["aggregatorFactory"] of [
                Some (_address) -> _address
            |   None            -> (failwith(error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND) : address)
        ];

        const governanceSatelliteAddress : address = case s.whitelistContracts["governanceSatellite"] of [
                Some (_address) -> _address
            |   None            -> (failwith(error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND) : address)
        ];

        if Tezos.get_sender() = aggregatorFactoryAddress or Tezos.get_sender() = governanceSatelliteAddress then skip else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_SATELLITE_OR_AGGREGATOR_FACTORY_CONTRACT_ALLOWED);
    };

} with(unit)



// Allowed Senders : Admin, Governance Satellite Contract, Aggregator Factory Contract
function checkSenderIsAdminOrGovernanceSatelliteOrFactory(const s : aggregatorStorageType) : unit is
block {

    if Tezos.get_sender() = s.admin then skip
    else {
        const aggregatorFactoryAddress : address = case s.whitelistContracts["aggregatorFactory"] of [
                Some (_address) -> _address
            |   None            -> (failwith(error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND) : address)
        ];

        const governanceSatelliteAddress : address = case s.whitelistContracts["governanceSatellite"] of [
                Some (_address) -> _address
            |   None            -> (failwith(error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND) : address)
        ];

        if Tezos.get_sender() = aggregatorFactoryAddress or Tezos.get_sender() = governanceSatelliteAddress then skip else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_OR_GOVERNANCE_SATELLITE_OR_AGGREGATOR_FACTORY_CONTRACT_ALLOWED);
    };

} with(unit)


// Allowed Senders : Oracle address
function checkSenderIsOracle(const s : aggregatorStorageType) : unit is
    if not Map.mem(Tezos.get_sender(), s.oracleAddresses) then failwith(error_ONLY_AUTHORIZED_ORACLES_ALLOWED)
    else unit



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if (Tezos.get_amount() = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check that the %updateData entrypoint is not paused
function checkUpdateDataIsNotPaused(var s : aggregatorStorageType) : unit is
    if s.breakGlassConfig.updateDataIsPaused then failwith(error_UPDATE_DATA_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED)
    else unit;

// helper function to check that the %withdrawRewardXtz entrypoint is not paused
function checkWithdrawRewardXtzIsNotPaused(var s : aggregatorStorageType) : unit is
    if s.breakGlassConfig.withdrawRewardXtzIsPaused then failwith(error_WITHDRAW_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_PAUSED)
    else unit;

// helper function to check that the %withdrawRewardStakedMvk entrypoint is not paused
function checkWithdrawRewardStakedMvkIsNotPaused(var s : aggregatorStorageType) : unit is
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
            |   None -> (failwith(error_DISTRIBUTE_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND) : contract(distributeRewardXtzType))
        ];



// helper function to get distributeRewardMvk entrypoint in factory contract
function getDistributeRewardStakedMvkInFactoryEntrypoint(const contractAddress : address) : contract(distributeRewardStakedMvkType) is
    case (Tezos.get_entrypoint_opt(
        "%distributeRewardStakedMvk",
        contractAddress) : option(contract(distributeRewardStakedMvkType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_DISTRIBUTE_REWARD_STAKED_MVK_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND) : contract(distributeRewardStakedMvkType))
        ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Oracle Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check that address belongs to an oracle
function isOracleAddress(const address : address; const oracleAddresses : oracleAddressesType) : bool is
    Map.mem(address, oracleAddresses)

// helper function to hash bytes input
function hasherman (const s : bytes) : bytes is Crypto.sha256 (s)

// helper function to get observations data utils
function getObservationsDataUtils(const data : nat; const myMap : pivotedObservationsType) : nat is
    case Map.find_opt(data, myMap) of [
            Some (v) -> (v+1n)
        |   None -> 1n
    ]

// helper function to get the oracle public key from oracle address
function getOraclePublicKey(const addressKey: address; const oracleAddresses: oracleAddressesType) : key is
  case Map.find_opt(addressKey, oracleAddresses) of [
      Some (v) -> (v.oraclePublicKey)
    | None -> failwith(error_ACTION_FAILED_AS_ORACLE_IS_NOT_REGISTERED)
  ]

// helper function to check if the signature is correct
function checkSignature(const pk : key; const signed : signature; const msg : bytes) : bool is 
    Crypto.check (pk, signed, msg)

// helper function to verify all the responses from oracles signatures
function verifyAllResponsesSignature(const oracleAddress: address; const oracleSignatures: signature; const oracleObservations: map (address, oracleObservationType); const store: aggregatorStorageType): unit is
    if (not checkSignature(
        getOraclePublicKey(oracleAddress, store.oracleAddresses),
        oracleSignatures,
        Bytes.pack(oracleObservations)))
        then failwith(error_WRONG_SIGNATURE_IN_OBSERVATIONS_MAP)
    else unit

// helper function to verify signatures and oracleObservations maps sizes
function verifyMapsSizes(const leaderReponse : updateDataType; const s: aggregatorStorageType) : unit is block {

    // Byzantine faults check
    // see: https://research.chain.link/ocr.pdf
    const f: int = (Map.size(s.oracleAddresses) - 1) / 3n;
    if (int(Map.size(leaderReponse.signatures)) < f)
        then failwith(error_WRONG_SIGNATURES_MAP_SIZE)
    else skip;
    if (int(Map.size(leaderReponse.oracleObservations)) <= (2 * f))
        then failwith(error_WRONG_OBSERVATIONS_MAP_SIZE)
    else skip

} with unit;

// helper function to verify informations from the observations
function verifyInfosFromObservations(const oracleObservations: map (address, oracleObservationType); const store: aggregatorStorageType): (nat * nat) is block {
    
    var epoch: nat := 0n;
    var round: nat := 0n;

    for key -> value in map oracleObservations block {

        // Check the aggregator specified in the observation is the current aggregator
        if Tezos.get_self_address() =/= value.aggregatorAddress then failwith(error_WRONG_AGGREGATOR_ADDRESS_IN_OBSERVATIONS_MAP);

        // Check the observation was made by a known oracle
        if not isOracleAddress(key, store.oracleAddresses) then failwith (error_OBSERVATION_MADE_BY_WRONG_ORACLE);

        // Check the epoch is the same for all observations (set the epoch to the first observation epoch)
        if epoch = 0n then epoch    := value.epoch;
        if epoch =/= value.epoch then failwith(error_DIFFERENT_EPOCH_IN_OBSERVATIONS_MAP);

        // Check the round  is the same for all observations (set the round to the first observation epoch)
        if round = 0n then round    := value.round;
        if round =/= value.round then failwith(error_DIFFERENT_ROUND_IN_OBSERVATIONS_MAP);

    };

    // Check the current epoch is greater than the previous one
    if (epoch < store.lastCompletedData.epoch) then failwith(error_EPOCH_SHOULD_BE_GREATER_THAN_PREVIOUS_RESULT)
    else if (epoch = store.lastCompletedData.epoch) then {
        // Check the round if the epoch is the same as the previous one
        if (round <= store.lastCompletedData.round) then failwith(error_ROUND_SHOULD_BE_GREATER_THAN_PREVIOUS_RESULT)
        else skip;
    }
    else skip;

} with (epoch, round)

// helper function to pivot observations for calculation of median later
function pivotObservationMap (var m : map (address, oracleObservationType)) : pivotedObservationsType is block {
  (*
    Build a map of form:
      observationValue -> observationCount
    from of map of form:
      oracleAddress -> observationValue

    This is useful to compute the median later since
  *)
    var empty : pivotedObservationsType := map [];
    for _key -> value in map m block {
        var temp: nat := getObservationsDataUtils(value.data, empty);
        empty := Map.update(value.data, Some (temp), empty);
    }
} with (empty)



// helper function to get median data
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

    1st loop iteration (10 -> 2) :
      // Nothing to do, no intresting values
      accumulator = 2

    2nd loop iteration (20 -> 1) :
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

  const isEven                      : bool  = (sizeMap mod 2n) = 0n;
  const medianIndex                 : nat   = (sizeMap / 2n);
  var _observationCountAccumulator  : nat   := 0n;
  var median                        : nat   := 0n;

  for observationValue -> observationCount in map m block {
        if isEven then {

            if (medianIndex >= _observationCountAccumulator + 1n and medianIndex < _observationCountAccumulator + observationCount + 1n) then
                median := observationValue
            else skip;

            if (medianIndex >= _observationCountAccumulator and medianIndex < _observationCountAccumulator + observationCount) then
                median := (median + observationValue) / 2n
            else skip;

        } else {

            if (medianIndex >= _observationCountAccumulator and medianIndex < _observationCountAccumulator + observationCount) then
                median := observationValue
            else skip;

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

// helper function to get oracle's staked MVK reward amount 
function getRewardAmountStakedMvk(const oracleAddress : address; const s : aggregatorStorageType) : nat is
    case Map.find_opt(oracleAddress, s.oracleRewardStakedMvk) of [
            Some (v) -> (v)
        |   None     -> 0n
    ]



// helper function to get oracle's XTZ reward amount 
function getRewardAmountXtz(const oracleAddress : address; const s : aggregatorStorageType) : nat is
    case Map.find_opt(oracleAddress, s.oracleRewardXtz) of [
            Some (v) -> (v)
        |   None     -> 0n
    ]



// helper function to update specified oracle's staked MVK rewards
function updateRewardsStakedMvk (const oracleObservations : map (address, oracleObservationType); var s : aggregatorStorageType) : aggregatorStorageType is 
block {

    // init params
    var tempSatellitesMap   : map(address, nat) := map [];
    var total               : nat               := 0n;

    // Get Delegation Contract address from the General Contracts Map on the Governance Contract
    const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    // Get delegation ratio from Delegation contract config through on-chain view (delegationRatio equivalent to votingPowerRatio)
    const configView: option(delegationConfigType)  = Tezos.call_view ("getConfig", unit, delegationAddress);
    const votingPowerRatio: nat                     = case configView of [
                Some (_optionConfig) -> _optionConfig.delegationRatio
            |   None -> failwith (error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
    ];

    // loop over satellite oracles who have committed their data feed data, and calculate total voting power 
    // and store each satellite respective share in tempSatellitesMap
    for oracleAddress -> _value in map oracleObservations block {

        // View call getSatelliteOpt to delegation contract
        const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", oracleAddress, delegationAddress);
        const satelliteOpt : satelliteRecordType = case satelliteOptView of [
                Some (optionView) -> case optionView of [
                        Some(_satelliteRecord)      -> _satelliteRecord
                    |   None                        -> failwith(error_SATELLITE_NOT_FOUND)
                ]
            |   None -> failwith(error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
        ];

        // Get total sum of all satellite oracles total voting power (to be used as denominator to determine each oracle's share of staked MVK rewards)
        if (satelliteOpt.status = "ACTIVE") then {

            // totalVotingPower calculation
            const totalVotingPower : nat    = calculateVotingPower(votingPowerRatio, satelliteOpt.stakedMvkBalance, satelliteOpt.totalDelegatedAmount);

            // totalVotingPower storage + total updated
            tempSatellitesMap := Map.update(oracleAddress, Some (totalVotingPower), tempSatellitesMap);
            total             := total + totalVotingPower;

        } else skip;

    };

    // get reward amount staked mvk
    const rewardAmountStakedMvk : nat = s.config.rewardAmountStakedMvk;

    // total voting power has been calculated, so update amount for each oracle
    for oracleAddress -> _value in map oracleObservations block {

        // increment satellites' staked mvk reward amounts based on their share of total voting power (among other satellites for this observation reveal)
        const oracleShare : nat = case tempSatellitesMap[oracleAddress] of [
                    Some(_value) -> _value
                |   None -> failwith(error_SATELLITE_NOT_FOUND)
        ];

        const newStakedMvkRewardShare = ((oracleShare * fixedPointAccuracy) / total) * rewardAmountStakedMvk;
        const newStakedMvkRewardAmount = newStakedMvkRewardShare / fixedPointAccuracy;

        var oracleRewardStakedMvk : nat := case s.oracleRewardStakedMvk[oracleAddress] of [
                    Some(_value) -> _value
                |   None -> 0n
        ];

        oracleRewardStakedMvk := oracleRewardStakedMvk + newStakedMvkRewardAmount; 
        s.oracleRewardStakedMvk[oracleAddress] := oracleRewardStakedMvk;

    }

} with (s)

// ------------------------------------------------------------------------------
// Reward Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(aggregatorUnpackLambdaFunctionType)) of [
            Some(f) -> f(aggregatorLambdaAction, s)
        |   None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
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
// Lambda Helpers Begin
//
// ------------------------------------------------------------------------------

// Aggregator Lambdas :
#include "../partials/contractLambdas/aggregator/aggregatorLambdas.ligo"

// ------------------------------------------------------------------------------
//
// Lambda Helpers End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; var s : aggregatorStorageType) : address is
    s.admin



(* View: get name variable *)
[@view] function getName(const _ : unit; var s : aggregatorStorageType) : string is
    s.name


(* View: get config *)
[@view] function getConfig(const _ : unit; var s : aggregatorStorageType) : aggregatorConfigType is
    s.config



(* View: get Governance address *)
[@view] function getGovernanceAddress(const _ : unit; var s : aggregatorStorageType) : address is
    s.governanceAddress



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; var s : aggregatorStorageType) : whitelistContractsType is
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; var s : aggregatorStorageType) : generalContractsType is
    s.generalContracts



(* View: get oracle addresses *)
[@view] function getOracleAddresses(const _ : unit; var s : aggregatorStorageType) : oracleAddressesType is
    s.oracleAddresses


(* View: get oracle reward staked MVK *)
[@view] function getOracleRewardStakedMvk(const _ : unit; var s : aggregatorStorageType) : oracleRewardStakedMvkType is
    s.oracleRewardStakedMvk



(* View: get oracle reward xtz *)
[@view] function getOracleRewardXtz(const _ : unit; var s : aggregatorStorageType) : oracleRewardXtzType is
    s.oracleRewardXtz



(* View: get last completed data *)
[@view] function getlastCompletedData (const _ : unit ; const s : aggregatorStorageType) : lastCompletedDataReturnType is block {
    const withDecimal : lastCompletedDataReturnType = record [
        data                  = s.lastCompletedData.data;
        percentOracleResponse = s.lastCompletedData.percentOracleResponse;
        round                 = s.lastCompletedData.round;
        epoch                 = s.lastCompletedData.epoch;
        decimals              = s.config.decimals;
        lastUpdatedAt         = s.lastCompletedData.lastUpdatedAt;
    ]
} with (withDecimal)



(* View: get decimals *)
[@view] function getDecimals (const _ : unit ; const s : aggregatorStorageType) : nat is s.config.decimals;



(* View: get name *)
[@view] function getContractName (const _ : unit ; const s : aggregatorStorageType) : string is s.name;



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : aggregatorStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : aggregatorStorageType) : lambdaLedgerType is
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

(*  setAdmin entrypoint  *)
function setAdmin(const newAdminAddress : address; const s : aggregatorStorageType) : return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : aggregatorStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  setName entrypoint *)
function setName(const newContractName : string; var s : aggregatorStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetName"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaSetName(newContractName);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  updateMetadata entrypoint  *)
function updateMetadata(const updateMetadataParams : updateMetadataType; const s : aggregatorStorageType) : return is
block{

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : aggregatorUpdateConfigParamsType; const s : aggregatorStorageType) : return is
block{
  
  const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : aggregatorStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : aggregatorStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);  

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams: transferActionType; var s: aggregatorStorageType): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMistakenTransfer"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaMistakenTransfer(destinationParams);

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
function addOracle(const addOracleParams : addOracleType; const s : aggregatorStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaAddOracle"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaAddOracle(addOracleParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  removeOracle entrypoint  *)
function removeOracle(const oracleAddress : address; const s : aggregatorStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveOracle"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
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
function pauseAll(const s : aggregatorStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaPauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  unpauseAll entrypoint  *)
function unpauseAll(const s : aggregatorStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUnpauseAll"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaUnpauseAll(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



(*  togglePauseEntrypoint entrypoint  *)
function togglePauseEntrypoint(const targetEntrypoint: aggregatorTogglePauseEntrypointType; const s : aggregatorStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseEntrypoint"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaTogglePauseEntrypoint(targetEntrypoint);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response



// ------------------------------------------------------------------------------
// Pause / Break Glass Entrypoints Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Oracle Entrypoints Begin
// ------------------------------------------------------------------------------

(*  updateData entrypoint  *)
function updateData(const params : updateDataType; const s : aggregatorStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateData"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaUpdateData(params);

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
function withdrawRewardXtz(const receiver: address; const s : aggregatorStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaWithdrawRewardXtz"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init aggregator lambda action
    const aggregatorLambdaAction : aggregatorLambdaActionType = LambdaWithdrawRewardXtz(receiver);

    // init response
    const response : return = unpackLambda(lambdaBytes, aggregatorLambdaAction, s);

} with response


(*  withdrawRewardStakedMvk entrypoint  *)
function withdrawRewardStakedMvk(const receiver: address; const s : aggregatorStorageType) : return is
block{
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaWithdrawRewardStakedMvk"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
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
function setLambda(const setLambdaParams : setLambdaType; var s : aggregatorStorageType) : return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Lambda Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : aggregatorAction; const s : aggregatorStorageType) : return is
    block {
        // Check that entrypoint should not receive any tez amount   
        checkNoAmount(Unit);
    } with(
        case action of [
            
                // Housekeeping Entrypoints
            |   SetAdmin (parameters)                           -> setAdmin(parameters, s)
            |   SetGovernance (parameters)                      -> setGovernance(parameters, s) 
            |   SetName (parameters)                            -> setName(parameters, s) 
            |   UpdateMetadata (parameters)                     -> updateMetadata(parameters, s)
            |   UpdateConfig (parameters)                       -> updateConfig(parameters, s)
            |   UpdateWhitelistContracts (parameters)           -> updateWhitelistContracts(parameters, s)
            |   UpdateGeneralContracts (parameters)             -> updateGeneralContracts(parameters, s)
            |   MistakenTransfer (parameters)                   -> mistakenTransfer(parameters, s)

                // Admin Oracle Entrypoints
            |   AddOracle (parameters)                          -> addOracle(parameters, s)
            |   RemoveOracle (parameters)                       -> removeOracle(parameters, s)

                // Pause / Break Glass Entrypoints
            |   PauseAll (_parameters)                          -> pauseAll(s)
            |   UnpauseAll (_parameters)                        -> unpauseAll(s)
            |   TogglePauseEntrypoint (parameters)              -> togglePauseEntrypoint(parameters, s)

                // Oracle Entrypoints
            |   UpdateData (parameters)                       -> updateData(parameters, s)

                // Reward Entrypoints
            |   WithdrawRewardXtz (parameters)                  -> withdrawRewardXtz(parameters, s)
            |   WithdrawRewardStakedMvk (parameters)            -> withdrawRewardStakedMvk(parameters, s)

                // Lambda Entrypoints
            |   SetLambda (parameters)                          -> setLambda(parameters, s)
        ]
    );
