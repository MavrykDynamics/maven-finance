// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders : Admin, Governance Satellite Contract
function verifySenderIsAdminOrGovernanceSatelliteContract(const s : aggregatorStorageType) : unit is
block {

    const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[s.admin; governanceSatelliteAddress], error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED)

} with(unit)



// Allowed Senders : Admin, Governance Contract, Governance Satellite Contract, Aggregator Factory Contract
function verifySenderIsAdminOrGovernanceOrGovernanceSatelliteOrFactory(const s: aggregatorStorageType): unit is
block {

    const aggregatorFactoryAddress    : address = getContractAddressFromGovernanceContract("aggregatorFactory", s.governanceAddress, error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND);
    const governanceSatelliteAddress  : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[s.admin; s.governanceAddress; governanceSatelliteAddress; aggregatorFactoryAddress], error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_SATELLITE_OR_AGGREGATOR_FACTORY_CONTRACT_ALLOWED)

} with(unit)



// verify that sender is registered oracle on this aggregator
function verifySenderIsRegisteredOracle(const s : aggregatorStorageType) : unit is
block {

    if Map.mem(Mavryk.get_sender(), s.oracleLedger) 
    then skip 
    else failwith(error_ORACLE_NOT_PRESENT_IN_AGGREGATOR);

} with unit



// verify that satellite is registered oracle on this aggregator
function verifySatelliteIsRegisteredOracle(const satellite : address; const s : aggregatorStorageType) : unit is
block {

    if Map.mem(satellite, s.oracleLedger) 
    then skip 
    else failwith(error_ORACLE_NOT_PRESENT_IN_AGGREGATOR);

} with unit



// verify that satellite is not a registered oracle on this aggregator
function verifySatelliteIsNotRegisteredOracle(const satellite : address; const s : aggregatorStorageType) : unit is
block {

    if Map.mem(satellite, s.oracleLedger) 
    then failwith(error_ORACLE_ALREADY_ADDED_TO_AGGREGATOR);

} with unit
    


// helper function to verify correct aggregator address is sent
function verifyCorrectAggregatorAddress(const aggregatorAddress : address) : unit is
block {
    
    if Mavryk.get_self_address() =/= aggregatorAddress 
    then failwith(error_WRONG_AGGREGATOR_ADDRESS_IN_OBSERVATIONS_MAP);

} with unit



// helper function to verify correct epoch
function verifyCorrectEpoch(const currentEpoch : nat; const observationEpoch : nat) : unit is
block {

    if currentEpoch =/= observationEpoch 
    then failwith(error_DIFFERENT_EPOCH_IN_OBSERVATIONS_MAP);

} with unit



// helper function to verify correct round
function verifyCorrectRound(const currentRound : nat; const observationRound : nat) : unit is
block {

    if currentRound =/= observationRound
    then failwith(error_DIFFERENT_ROUND_IN_OBSERVATIONS_MAP);

} with unit



// helper function to verify epoch is equal or greater than previous epoch
function verifyEpochIsEqualOrGreaterThanPreviousEpoch(const currentEpoch : nat; const s : aggregatorStorageType) : unit is
block {
    
    verifyGreaterThanOrEqual(currentEpoch, s.lastCompletedData.epoch, error_EPOCH_SHOULD_BE_GREATER_THAN_PREVIOUS_RESULT);

} with unit



// helper function to verify round is greater than previous round
function verifyRoundIsStrictlyGreaterThanPreviousRound(const currentEpoch : nat; const currentRound : nat; const s : aggregatorStorageType) : unit is
block {

    if (currentEpoch = s.lastCompletedData.epoch) then {
        
        if (currentRound <= s.lastCompletedData.round) 
        then failwith(error_ROUND_SHOULD_BE_GREATER_THAN_PREVIOUS_RESULT);

    } else skip;
    
} with unit



// verify that satellite is not suspended or banned
function verifySatelliteIsNotSuspendedOrBanned(const satelliteAddress : address; const s : aggregatorStorageType) : unit is 
block {

    const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);
    checkSatelliteStatus(satelliteAddress, delegationAddress, True, True);

} with unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / BreakGlass Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to pause all entrypoints
function pauseAllAggregatorEntrypoints(var s : aggregatorStorageType) : aggregatorStorageType is 
block {

    // set all pause configs to True
    if s.breakGlassConfig.updateDataIsPaused then skip
    else s.breakGlassConfig.updateDataIsPaused := True;

    if s.breakGlassConfig.withdrawRewardXtzIsPaused then skip
    else s.breakGlassConfig.withdrawRewardXtzIsPaused := True;

    if s.breakGlassConfig.withdrawRewardStakedMvkIsPaused then skip
    else s.breakGlassConfig.withdrawRewardStakedMvkIsPaused := True;

} with s



// helper function to unpause all entrypoints
function unpauseAllAggregatorEntrypoints(var s : aggregatorStorageType) : aggregatorStorageType is 
block {

    // set all pause configs to False
    if s.breakGlassConfig.updateDataIsPaused then s.breakGlassConfig.updateDataIsPaused := False
    else skip;

    if s.breakGlassConfig.withdrawRewardXtzIsPaused then s.breakGlassConfig.withdrawRewardXtzIsPaused := False
    else skip;

    if s.breakGlassConfig.withdrawRewardStakedMvkIsPaused then s.breakGlassConfig.withdrawRewardStakedMvkIsPaused := False
    else skip;

} with s

// ------------------------------------------------------------------------------
// Pause / BreakGlass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get distributeRewardXtz entrypoint in factory contract
function getDistributeRewardXtzInFactoryEntrypoint(const contractAddress : address) : contract(distributeRewardXtzType) is
    case (Mavryk.get_entrypoint_opt(
        "%distributeRewardXtz",
        contractAddress) : option(contract(distributeRewardXtzType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_DISTRIBUTE_REWARD_XTZ_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND) : contract(distributeRewardXtzType))
        ];



// helper function to get distributeRewardMvk entrypoint in factory contract
function getDistributeRewardStakedMvkInFactoryEntrypoint(const contractAddress : address) : contract(distributeRewardStakedMvkType) is
    case (Mavryk.get_entrypoint_opt(
        "%distributeRewardStakedMvk",
        contractAddress) : option(contract(distributeRewardStakedMvkType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_DISTRIBUTE_REWARD_STAKED_MVK_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND) : contract(distributeRewardStakedMvkType))
        ];



// helper function to get setAggregatorReference entrypoint in governanceSatellite contract
function getSetAggregatorReferenceInGovernanceSatelliteEntrypoint(const contractAddress : address) : contract(setAggregatorReferenceType) is
    case (Mavryk.get_entrypoint_opt(
        "%setAggregatorReference",
        contractAddress) : option(contract(setAggregatorReferenceType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_AGGREGATOR_REFERENCE_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND) : contract(setAggregatorReferenceType))
        ];  

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Operation Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to distribute xtz rewards
function distributeRewardXtzOperation(const oracleAddress : address; const rewardAmount : nat; const s : aggregatorStorageType) : operation is
block {

    const factoryAddress : address = getContractAddressFromGovernanceContract("aggregatorFactory", s.governanceAddress, error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND);
    
    const distributeRewardXtzParams : distributeRewardXtzType = record [
        recipient = oracleAddress;
        reward    = rewardAmount;
    ];

    const distributeRewardXtzOperation : operation = Mavryk.transaction(
        distributeRewardXtzParams,
        0mav,
        getDistributeRewardXtzInFactoryEntrypoint(factoryAddress)
    );

} with distributeRewardXtzOperation



// helper function to distribute staked MVK rewards
function distributeRewardStakedMvkOperation(const oracleAddress : address; const rewardAmount : nat; const s : aggregatorStorageType) : operation is
block {

    const factoryAddress : address = getContractAddressFromGovernanceContract("aggregatorFactory", s.governanceAddress, error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND);
    
    const distributeRewardMvkParams : distributeRewardStakedMvkType = record [
        eligibleSatellites     = set[oracleAddress];
        totalStakedMvkReward   = rewardAmount;
    ];

    const distributeRewardMvkOperation : operation = Mavryk.transaction(
        distributeRewardMvkParams,
        0mav,
        getDistributeRewardStakedMvkInFactoryEntrypoint(factoryAddress)
    );

} with distributeRewardMvkOperation


// ------------------------------------------------------------------------------
// Operation Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Oracle Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get satellite record view from the delegation contract
function getSatelliteRecord(const satelliteAddress : address; const s : aggregatorStorageType) : satelliteRecordType is 
block {

    // Get Delegation Contract address from the General Contracts Map on the Governance Contract
    const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    const satelliteOptView : option (option(satelliteRecordType)) = Mavryk.call_view ("getSatelliteOpt", satelliteAddress, delegationAddress);
    const satelliteRecord : satelliteRecordType = case satelliteOptView of [
            Some (optionView) -> case optionView of [
                    Some(_satelliteRecord)      -> _satelliteRecord
                |   None                        -> failwith(error_SATELLITE_NOT_FOUND)
            ]
        |   None -> failwith(error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
    ];

} with satelliteRecord



// helper function to get oracle information record from the delegation contract
function getOracleInformation(const oracleAddress : address; const s : aggregatorStorageType) : oracleInformationType is 
block {

    const satelliteRecord : satelliteRecordType = getSatelliteRecord(oracleAddress, s);

    // set oracle information record
    const oracleInformationRecord : oracleInformationType = record [
        oraclePublicKey  = satelliteRecord.oraclePublicKey;
        oraclePeerId     = satelliteRecord.oraclePeerId;
    ];
    
} with oracleInformationRecord



// helper function to get current oracle xtz rewards
function getOracleXtzRewards(const oracleAddress : address; const s : aggregatorStorageType) : nat is 
block {

    const oracleXtzRewards : nat = case s.oracleRewardXtz[oracleAddress] of [
            Some (_amount) -> (_amount) 
        |   None           -> 0n 
    ];

} with oracleXtzRewards



// helper function to get current oracle staked MVK rewards
function getOracleStakedMvkRewards(const oracleAddress : address; const s : aggregatorStorageType) : nat is 
block {

    const oracleStakedMvkRewards : nat = case s.oracleRewardStakedMvk[oracleAddress] of [
            Some (_amount) -> (_amount) 
        |   None           -> 0n 
    ];

} with oracleStakedMvkRewards



// helper function to hash bytes input
function hasherman (const s : bytes) : bytes is Crypto.sha256 (s)



// helper function to get observations data utils
function getObservationsDataUtils(const data : nat; const myMap : pivotedObservationsType) : nat is
    case Map.find_opt(data, myMap) of [
            Some (v) -> (v + 1n)
        |   None     -> 1n
    ]



// helper function to get the oracle public key from oracle address
function getOraclePublicKey(const oracleAddress : address; const s : aggregatorStorageType) : key is
block {

    const publicKey : key = case s.oracleLedger[oracleAddress] of [
            Some (_oracle) -> (_oracle.oraclePublicKey)
        |   None           -> failwith(error_ACTION_FAILED_AS_ORACLE_IS_NOT_REGISTERED)
    ]

} with publicKey

    

// helper function to check if the signature is correct
function checkSignature(const publicKey : key; const satelliteSignature : signature; const data : bytes) : bool is 
    Crypto.check (publicKey, satelliteSignature, data)



// helper function to verify all the responses from oracles signatures
function verifyAllResponsesSignature(const oracleAddress : address; const oracleSignatures : signature; const oracleObservations : oracleObservationsType; const s : aggregatorStorageType) : unit is
block {

    if (not checkSignature(
            getOraclePublicKey(oracleAddress, s),
            oracleSignatures,
            Bytes.pack(oracleObservations)
        )
    )
    then failwith(error_WRONG_SIGNATURE_IN_OBSERVATIONS_MAP);

} with unit
    



// helper function to verify signatures and oracleObservations map sizes
function verifyEqualMapSizes(const leaderReponse : updateDataType; const s : aggregatorStorageType) : unit is block {

    // Byzantine faults check
    // see: https://research.chain.link/ocr.pdf
    const f: int                = ((Map.size(s.oracleLedger) - 1)) / 3n;
    const signaturesSize: int   = int(Map.size(leaderReponse.signatures));
    const observationsSize: int = int(Map.size(leaderReponse.oracleObservations));
    if (signaturesSize < f)
        then failwith(error_WRONG_SIGNATURES_MAP_SIZE)
    else skip;
    if (observationsSize <= (2 * f))
        then failwith(error_WRONG_OBSERVATIONS_MAP_SIZE)
    else skip

} with unit;



// helper function to verify informations from the observations
function verifyInfosFromObservations(const oracleObservations : oracleObservationsType; const s : aggregatorStorageType): (nat * nat) is block {
    
    var epoch: nat := 0n;
    var round: nat := 0n;

    for key -> value in map oracleObservations block {

        // Check the aggregator specified in the observation is the current aggregator
        verifyCorrectAggregatorAddress(value.aggregatorAddress);

        // Verify the observation was made by a registered satellite on this aggregator as an oracle
        verifySatelliteIsRegisteredOracle(key, s);

        // Verify that the epoch is the same for all observations (set the epoch to the first observation epoch)
        if epoch = 0n then epoch := value.epoch;
        verifyCorrectEpoch(epoch, value.epoch);

        // Verify that the round  is the same for all observations (set the round to the first observation epoch)
        if round = 0n then round := value.round;
        verifyCorrectRound(round, value.round);

    };

    // Verify that the current epoch is equal or greater than the previous one
    verifyEpochIsEqualOrGreaterThanPreviousEpoch(epoch, s);

    // If epoch is equal to previous epoch, verify that the round is strictly greater than the previous round
    // If epoch is greater than previous epoch, then skip
    verifyRoundIsStrictlyGreaterThanPreviousRound(epoch, round, s);

} with (epoch, round)



// helper function to pivot observations for calculation of median later
function pivotObservationMap (var m : oracleObservationsType) : pivotedObservationsType is block {
  (*
    Build a map of form:
      observationValue -> observationCount
    from of map of form:
      oracleAddress -> observationValue

    This is useful to compute the median later since
  *)
    var empty : pivotedObservationsType := map [];
    for _key -> value in map m block {
        var temp : nat := getObservationsDataUtils(value.data, empty);
        empty[value.data] := temp;
    }
} with (empty)



// helper function to get median data
function getMedianFromMap (const m : pivotedObservationsType; const sizeMap: nat) : nat is block {
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

// helper function to get delegation ratio from the delegation contract
function getDelegationRatio(const delegationAddress : address) : nat is 
block {

    // Get the delegation ratio
    const configView : option (delegationConfigType)  = Mavryk.call_view ("getConfig", unit, delegationAddress);
    const delegationRatio : nat = case configView of [
            Some (_config) -> _config.delegationRatio
        |   None -> failwith (error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
    ];

} with delegationRatio



// helper function to calculate voting power
function calculateSatelliteVotingPower(const satelliteRecord : satelliteRecordType; const delegationRatio : nat) : nat is
block {

    var oracleVotingPower : nat := 0n;
    oracleVotingPower := voteHelperCalculateVotingPower(
        delegationRatio,                        // delegation ratio
        satelliteRecord.stakedMvkBalance,       // staked MVK balance
        satelliteRecord.totalDelegatedAmount    // total delegated amount
    );

} with oracleVotingPower



// helper function to calculate proportional reward amount
function calculateProportionalRewardAmount(const oracleShare : nat; const totalVotingPower : nat; const rewardAmount : nat) : nat is
block {

    const stakedMvkRewardShare = ((oracleShare * fixedPointAccuracy) / totalVotingPower) * rewardAmount;
    const incrementStakedMvkRewardAmount = stakedMvkRewardShare / fixedPointAccuracy;

} with incrementStakedMvkRewardAmount



// helper function to update specified oracle's staked MVK rewards
function updateRewardsStakedMvk (const oracleObservations : oracleObservationsType; const oracleVotingPowerMap : map(address, nat); const totalVotingPower : nat; var s : aggregatorStorageType) : aggregatorStorageType is 
block {

    // get reward amount staked mvk
    const rewardAmountStakedMvk : nat = s.config.rewardAmountStakedMvk;

    // total voting power has been calculated, so update amount for each oracle
    for oracleAddress -> _value in map oracleObservations block {

        // increment satellites' staked mvk reward amounts based on their share of total voting power (among other satellites for this observation reveal)
        const oracleShare : nat = case oracleVotingPowerMap[oracleAddress] of [
                Some(_value) -> _value
            |   None         -> failwith(error_SATELLITE_NOT_FOUND)
        ];

        // calculate increase to staked MVK rewards
        const incrementStakedMvkRewardAmount = calculateProportionalRewardAmount(oracleShare, totalVotingPower, rewardAmountStakedMvk);

        // get oracle's current staked MVK rewards
        const oracleRewardStakedMvk : nat = getOracleStakedMvkRewards(oracleAddress, s);
        
        // update oracle staked MVK rewards
        s.oracleRewardStakedMvk[oracleAddress] := oracleRewardStakedMvk + incrementStakedMvkRewardAmount;

    }

} with (s)



// helper function to update sender's XTZ rewards
function updateRewardsXtz (var s : aggregatorStorageType) : aggregatorStorageType is 
block {
    
    // Set XTZ reward for oracle
    const rewardAmountXtz : nat  = s.config.rewardAmountXtz;
    if rewardAmountXtz > 0n then {

        // get current oracle xtz rewards
        const currentOracleXtzRewards : nat = getOracleXtzRewards(Mavryk.get_sender(), s);

        // increment oracle rewards in storage
        s.oracleRewardXtz[Mavryk.get_sender()] := currentOracleXtzRewards + rewardAmountXtz;

    } else skip;

} with (s)

// ------------------------------------------------------------------------------
// Reward Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Update Data Helper Functions Begin
// ------------------------------------------------------------------------------

// refresh the oracle ledger
function refreshStorage(const updateDataParams : updateDataType; var s : aggregatorStorageType) : (updateDataType * aggregatorStorageType) is
block {

    // parse parameters
    const satelliteAddress : address                    = Mavryk.get_sender();
    var updateDataUpdatedParams : updateDataType        := updateDataParams;
    var tempOracleVotingPowerMap   : map(address, nat)  := map [];
    var totalVotingPower           : nat                := 0n;

    // verify the sender is still an oracle
    verifySenderIsRegisteredOracle(s);

    // verify the sender is still a satellite and that it's not banned or suspended
    const delegationAddress : address                   = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    // get the delegation ratio from the 
    const delegationRatio   : nat                       = getDelegationRatio(delegationAddress);

    // Check if the sender is valid
    var satelliteOptView : option (option(satelliteRecordType))     := Mavryk.call_view ("getSatelliteOpt", satelliteAddress, delegationAddress);
    const satelliteRecordOpt : option(satelliteRecordType)          = case satelliteOptView of [
            Some (optionView) -> optionView
        |   None -> failwith(error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
    ];
    const senderIsValidSatellite : bool                             = case satelliteRecordOpt of [
            Some(_satelliteRecord)      -> if _satelliteRecord.status = "SUSPENDED" or _satelliteRecord.status = "BANNED" then False else True
        |   None                        -> False
    ];

    // refresh the ledger
    if senderIsValidSatellite then {
        // get satellite record
        const satelliteRecord : satelliteRecordType = case satelliteRecordOpt of [
                Some(_satelliteRecord)      -> _satelliteRecord
            |   None                        -> failwith(error_SATELLITE_NOT_FOUND)
        ];

        // oracleVotingPower calculation
        const oracleVotingPower : nat               = calculateSatelliteVotingPower(satelliteRecord, delegationRatio);

        // totalVotingPower storage + total updated
        tempOracleVotingPowerMap[satelliteAddress]  := oracleVotingPower;
        totalVotingPower                            := totalVotingPower + oracleVotingPower;
    }
    else {
        s.oracleLedger                      := Map.remove(satelliteAddress, s.oracleLedger);
        updateDataUpdatedParams.oracleObservations := Map.remove(satelliteAddress, updateDataUpdatedParams.oracleObservations);
        updateDataUpdatedParams.signatures         := Map.remove(satelliteAddress, updateDataUpdatedParams.signatures);
    };

    // Check if the observations are valid
    const oracleObservationsTemp : oracleObservationsType   = updateDataUpdatedParams.oracleObservations;
    for oracleAddress -> _oracleObservation in map oracleObservationsTemp block {

        // Save gas by removing the sender if its not a satellite
        if oracleAddress = satelliteAddress then skip
        else{
            // Check oracle is valid
            satelliteOptView                                        := Mavryk.call_view ("getSatelliteOpt", oracleAddress, delegationAddress);
            const satelliteRecordOpt : option(satelliteRecordType)  = case satelliteOptView of [
                    Some (optionView) -> optionView
                |   None -> failwith(error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
            ];
            const oracleIsValidSatellite : bool                     = case satelliteRecordOpt of [
                    Some(_satelliteRecord)      -> if _satelliteRecord.status = "SUSPENDED" or _satelliteRecord.status = "BANNED" then False else True
                |   None                        -> False
            ];

            // refresh the ledger and the observations
            if oracleIsValidSatellite then{
                // get satellite record
                const satelliteRecord : satelliteRecordType = case satelliteRecordOpt of [
                        Some(_satelliteRecord)      -> _satelliteRecord
                    |   None                        -> failwith(error_SATELLITE_NOT_FOUND)
                ];

                // oracleVotingPower calculation
                const oracleVotingPower : nat               = calculateSatelliteVotingPower(satelliteRecord, delegationRatio);

                // totalVotingPower storage + total updated
                tempOracleVotingPowerMap[oracleAddress]     := oracleVotingPower;
                totalVotingPower                            := totalVotingPower + oracleVotingPower;
            }
            else {
                s.oracleLedger                              := Map.remove(oracleAddress, s.oracleLedger);
                updateDataUpdatedParams.oracleObservations         := Map.remove(oracleAddress, updateDataUpdatedParams.oracleObservations);
                updateDataUpdatedParams.signatures                 := Map.remove(oracleAddress, updateDataUpdatedParams.signatures);
            }
        };
    };

    // If the sender is still an oracle, the rewards can be calculated
    if Map.mem(satelliteAddress, s.oracleLedger) then {
        s   := updateRewardsStakedMvk(updateDataUpdatedParams.oracleObservations, tempOracleVotingPowerMap, totalVotingPower, s);
        s   := updateRewardsXtz(s);
    }

} with (updateDataUpdatedParams, s)

// ------------------------------------------------------------------------------
// Update Data Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const aggregatorLambdaAction : aggregatorLambdaActionType; var s : aggregatorStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(aggregatorUnpackLambdaFunctionType)) of [
            Some(f) -> f((aggregatorLambdaAction, s))
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