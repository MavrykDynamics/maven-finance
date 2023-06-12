// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to verify sender is governance satellite action initiator
function verifySenderIsInitiator(const initiatorAddrss : address) : unit is
block {
    
    if Tezos.get_sender() =/= initiatorAddrss then failwith(error_ONLY_INITIATOR_CAN_DROP_ACTION) else skip;

} with unit



// verify that satellite is not suspended or banned
function verifySatelliteIsNotSuspendedOrBanned(const satelliteAddress : address; const s : governanceSatelliteStorageType) : unit is 
block {

    const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);
    checkSatelliteStatus(satelliteAddress, delegationAddress, True, True);

} with unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get addOracle entrypoint in aggregator contract
function getAddOracleInAggregatorEntrypoint(const contractAddress : address) : contract(addOracleType) is
    case (Tezos.get_entrypoint_opt(
        "%addOracle",
        contractAddress) : option(contract(addOracleType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_ADD_ORACLE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND) : contract(addOracleType))
        ];



// helper function to get removeOracle entrypoint in aggregator contract
function getRemoveOracleInAggregatorEntrypoint(const contractAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%removeOracle",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_REMOVE_ORACLE_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND) : contract(address))
        ];



// helper function to get updateSatelliteStatus entrypoint in delegation contract
function getUpdateSatelliteStatusInDelegationEntrypoint(const contractAddress : address) : contract(updateSatelliteStatusParamsType) is
    case (Tezos.get_entrypoint_opt(
        "%updateSatelliteStatus",
        contractAddress) : option(contract(updateSatelliteStatusParamsType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_SATELLITE_STATUS_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(updateSatelliteStatusParamsType))
        ];



// helper function to get mistaken transfer entrypoint in contract
function getMistakenTransferEntrypoint(const contractAddress : address) : contract(transferActionType) is
case (Tezos.get_entrypoint_opt(
      "%mistakenTransfer",
      contractAddress) : option(contract(transferActionType))) of [
    Some(contr) -> contr
  | None -> (failwith(error_MISTAKEN_TRANSFER_ENTRYPOINT_NOT_FOUND) : contract(transferActionType))
];



// helper function to %updateSatelliteSnapshot entrypoint on the Governance contract
function sendUpdateSatelliteSnapshotOperationToGovernance(const governanceAddress : address) : contract(updateSatelliteSnapshotType) is
    case (Tezos.get_entrypoint_opt(
        "%updateSatelliteSnapshot",
        governanceAddress) : option(contract(updateSatelliteSnapshotType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_UPDATE_SATELLITE_SNAPSHOT_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(updateSatelliteSnapshotType))
        ];



// helper function to get pauseAll entrypoint in aggregator contract
function getPauseAllInAggregatorEntrypoint(const contractAddress : address) : contract(unit) is
    case (Tezos.get_entrypoint_opt(
        "%pauseAll",
        contractAddress) : option(contract(unit))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_PAUSE_ALL_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND) : contract(unit))
        ];



// helper function to get unpauseAll entrypoint in aggregator contract
function getUnpauseAllInAggregatorEntrypoint(const contractAddress : address) : contract(unit) is
    case (Tezos.get_entrypoint_opt(
        "%unpauseAll",
        contractAddress) : option(contract(unit))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UNPAUSE_ALL_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND) : contract(unit))
        ];


// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Operations Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to add oracle to aggregator
function addOracleToAggregatorOperation(const oracleAddress : address; const aggregatorAddress : address) : operation is 
block {

    const addOracleToAggregatorParams : addOracleType = record[
        oracleAddress = oracleAddress;
    ];
    
    const addOracleToAggregatorOperation : operation = Tezos.transaction(
        addOracleToAggregatorParams,
        0tez, 
        getAddOracleInAggregatorEntrypoint(aggregatorAddress)
    );

} with addOracleToAggregatorOperation



// helper function to remove oracle from aggregator
function removeOracleFromAggregatorOperation(const oracleAddress : address; const aggregatorAddress : address) : operation is 
block {

    const removeOracleFromAggregatorOperation : operation = Tezos.transaction(
        oracleAddress, 
        0tez, 
        getRemoveOracleInAggregatorEntrypoint(aggregatorAddress)
    );

} with removeOracleFromAggregatorOperation



// helper function to pause all entrypoints in aggregator
function pauseAllEntrypointsInAggregatorOperation(const aggregatorAddress : address) : operation is 
block {

    const pauseAllEntrypointsInAggregatorOperation : operation = Tezos.transaction(
        unit,
        0tez,
        getPauseAllInAggregatorEntrypoint(aggregatorAddress)
    );

} with pauseAllEntrypointsInAggregatorOperation



// helper function to unpause all entrypoints in aggregator
function unpauseAllEntrypointsInAggregatorOperation(const aggregatorAddress : address) : operation is 
block {

    const unpauseAllEntrypointsInAggregatorOperation : operation = Tezos.transaction(
        unit,
        0tez,
        getUnpauseAllInAggregatorEntrypoint(aggregatorAddress)
    );

} with unpauseAllEntrypointsInAggregatorOperation



// helper function to update satellite status
function updateSatelliteStatusOperation(const satelliteAddress : address; const status : string; const s : governanceSatelliteStorageType) : operation is
block {

    // Get the delegation address
    const delegationAddress: address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    // Create operation to update satellite status in Delegation Contract
    const updateSatelliteStatusParams : updateSatelliteStatusParamsType = record [
        satelliteAddress = satelliteAddress;
        newStatus        = status;
    ];

    const updateSatelliteStatusOperation : operation = Tezos.transaction(
        updateSatelliteStatusParams,
        0tez,
        getUpdateSatelliteStatusInDelegationEntrypoint(delegationAddress)
    );

} with updateSatelliteStatusOperation

// ------------------------------------------------------------------------------
// Operations Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get the current governance cycle counter
function getCurrentCycleCounter(const s : governanceSatelliteStorageType) : nat is 
block {

    // Get the current governance cycle counter from the governance contract
    const cycleCounterView : option (nat) = Tezos.call_view ("getCycleCounter", unit, s.governanceAddress);
    const currentCycle : nat = case cycleCounterView of [
            Some (_cycleCounter)   -> _cycleCounter
        |   None                   -> failwith (error_GET_CYCLE_COUNTER_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

} with currentCycle



// helper function to get staked mvk snapshot total supply based on the current governance cycle 
function getStakedMvkSnapshotTotalSupply(const currentCycleId : nat; const s : governanceSatelliteStorageType) : nat is 
block {

    const getStakedMvkSnapshotOptView : option(option(nat)) = Tezos.call_view ("getStakedMvkSnapshotOpt", currentCycleId, s.governanceAddress);
    const stakedMvkTotalSupply : nat = case getStakedMvkSnapshotOptView of [
            Some (_view)  -> case _view of [
                    Some(_value) -> _value
                |   None         -> failwith(error_STAKED_MVK_SNAPSHOT_FOR_CYCLE_NOT_FOUND)
            ]
        |   None          -> failwith(error_GET_STAKED_MVK_SNAPSHOT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

} with stakedMvkTotalSupply 



// helper function to unpack address from dataMap
function unpackAddress(const governanceSatelliteActionRecord : governanceSatelliteActionRecordType; const key : string; const errorCode : nat) : address is 
block {

    const unpackedAddress : address = case governanceSatelliteActionRecord.dataMap[key] of [
            Some(_address) -> case (Bytes.unpack(_address) : option(address)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None -> failwith(errorCode)
    ];

} with unpackedAddress



// helper function to unpack nat from dataMap
function unpackNat(const governanceSatelliteActionRecord : governanceSatelliteActionRecordType; const key : string; const errorCode : nat) : nat is 
block {

    const unpackedNat : nat = case governanceSatelliteActionRecord.dataMap[key] of [
            Some(_nat) -> case (Bytes.unpack(_nat) : option(nat)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None -> failwith(errorCode)
    ];

} with unpackedNat



// helper function to unpack transfer actions from dataMap
function upackTransferActions(const governanceSatelliteActionRecord : governanceSatelliteActionRecordType; const key : string; const errorCode : nat) : transferActionType is 
block {

    const transferActionsList : transferActionType = case governanceSatelliteActionRecord.dataMap[key] of [
            Some(_transferList) -> case (Bytes.unpack(_transferList) : option(transferActionType)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        | None -> failwith(errorCode)
    ];

} with transferActionsList



// helper function to unpack status bytes from dataMap
function unpackAggregatorStatusBytes(const governanceSatelliteActionRecord : governanceSatelliteActionRecordType) : togglePauseAggregatorVariantType is 
block {

    const unpackedAggregatorStatus : togglePauseAggregatorVariantType = case governanceSatelliteActionRecord.dataMap["status"] of [
            Some(_status) -> case (Bytes.unpack(_status) : option(togglePauseAggregatorVariantType)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None -> failwith(error_AGGREGATOR_NEW_STATUS_NOT_FOUND)
    ];

} with unpackedAggregatorStatus



// helper function to get governance satellite action record
function getGovernanceSatelliteActionRecord(const actionId : nat; const s : governanceSatelliteStorageType) : governanceSatelliteActionRecordType is 
block {

    const governanceSatelliteActionRecord : governanceSatelliteActionRecordType = case s.governanceSatelliteActionLedger[actionId] of [
            Some(_request) -> _request
        |   None           -> failwith(error_GOVERNANCE_SATELLITE_ACTION_NOT_FOUND)
    ];

} with governanceSatelliteActionRecord



// helper function to get subscribed aggregators of satellite (oracle)
function getSubscribedAggregators(const satelliteAddress : address; const s : governanceSatelliteStorageType) : subscribedAggregatorsType is 
block {

    const subscribedAggregators : subscribedAggregatorsType = case s.satelliteAggregatorLedger[satelliteAddress] of [
            Some(_record) -> _record
        |   None          -> failwith(error_SATELLITE_SUBSCRIBED_AGGREGATORS_NOT_FOUND)
    ];

} with subscribedAggregators



// helper function to get or create subscribed aggregators of satellite (oracle)
function getOrCreateSubscribedAggregators(const satelliteAddress : address; const s : governanceSatelliteStorageType) : subscribedAggregatorsType is 
block {

    const subscribedAggregators : subscribedAggregatorsType = case s.satelliteAggregatorLedger[satelliteAddress] of [
            Some(_record) -> _record
        |   None          -> (map[] : subscribedAggregatorsType)
    ];

} with subscribedAggregators



// helper function to check if a satellite can interact with an action
function validateAction(const actionRecord : governanceSatelliteActionRecordType) : unit is
block {

    // Check if governance satellite action has been dropeed
    if actionRecord.status    = False then failwith(error_GOVERNANCE_SATELLITE_ACTION_DROPPED)  else skip;

    // Check if governance satellite action has already been executed
    if actionRecord.executed  = True  then failwith(error_GOVERNANCE_SATELLITE_ACTION_EXECUTED) else skip;

    // Check if governance satellite action has expired
    if Tezos.get_now() > actionRecord.expiryDateTime then failwith(error_GOVERNANCE_SATELLITE_ACTION_EXPIRED) else skip;

} with (unit)





// ------------------------------------------------------------------------------
// Governance Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to create a governance satellite action
function createGovernanceSatelliteAction(const actionType : string; const dataMap : dataMapType; const purpose : string; var s : governanceSatelliteStorageType) : governanceSatelliteStorageType is
block {

    // Validate inputs
    validateStringLength(purpose, s.config.governancePurposeMaxLength, error_WRONG_INPUT_PROVIDED);

    // Get the current cycle from the governance contract
    const currentCycleId : nat = getCurrentCycleCounter(s);

    // ------------------------------------------------------------------
    // Get / Check Satellite Records
    // ------------------------------------------------------------------

    // Check if the satellite has created too many actions this governance cycle
    const satelliteActionKey : (nat * address) = (currentCycleId, Tezos.get_sender());
    var satelliteActions : set(actionIdType) := case Big_map.find_opt(satelliteActionKey, s.satelliteActions) of [
            Some (_actionsIds)  -> _actionsIds
        |   None                -> set []
    ];
    const satelliteActionsCount : nat =   Set.cardinal(satelliteActions);
    if satelliteActionsCount >= s.config.maxActionsPerSatellite then failwith(error_MAX_GOVERNANCE_SATELLITE_ACTIONS_REACHED) else skip;

    // Verify sender is a satellite which is not suspended or banned
    verifySatelliteIsNotSuspendedOrBanned(Tezos.get_sender(), s);

    // ------------------------------------------------------------------
    // Snapshot Staked MVK Total Supply
    // ------------------------------------------------------------------

    // Take snapshot of current total staked MVK supply 
    const snapshotStakedMvkTotalSupply : nat = getStakedMvkSnapshotTotalSupply(currentCycleId, s);

    // Calculate staked MVK votes required for approval based on config's approval percentage
    const stakedMvkRequiredForApproval : nat = abs((snapshotStakedMvkTotalSupply * s.config.approvalPercentage) / 10000);

    // ------------------------------------------------------------------
    // Create new Governance Satellite Action
    // ------------------------------------------------------------------

    // Create new governance satellite action record
    var newGovernanceSatelliteAction : governanceSatelliteActionRecordType := record [

        initiator                          = Tezos.get_sender();
        status                             = True;                  // status: True - "ACTIVE", False - "INACTIVE/DROPPED"
        executed                           = False;

        governanceType                     = actionType;
        governancePurpose                  = purpose;

        dataMap                            = dataMap;

        yayVoteStakedMvkTotal              = 0n;
        nayVoteStakedMvkTotal              = 0n;
        passVoteStakedMvkTotal             = 0n;

        governanceCycleId                  = currentCycleId;
        snapshotStakedMvkTotalSupply       = snapshotStakedMvkTotalSupply;
        stakedMvkPercentageForApproval     = s.config.approvalPercentage; 
        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

        startDateTime                      = Tezos.get_now();
        expiryDateTime                     = Tezos.get_now() + (86_400 * s.config.satelliteActionDurationInDays);
        executedDateTime                   = Tezos.get_now();
        
    ];

    // ------------------------------------------------------------------
    // Update Storage
    // ------------------------------------------------------------------

    // Get current action counter
    const actionId : nat = s.governanceSatelliteCounter;

    // Save action to governance satellite action ledger
    s.governanceSatelliteActionLedger[actionId] := newGovernanceSatelliteAction;

    // Add the new action to the satellite's set
    satelliteActions                            := Set.add(actionId, satelliteActions);
    s.satelliteActions[satelliteActionKey]      := satelliteActions;

    // Increment governance satellite action counter
    s.governanceSatelliteCounter := actionId + 1n;

} with (s)

// ------------------------------------------------------------------------------
// General Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Governance Snapshot Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get satellite record view from the delegation contract
function getSatelliteRecord(const satelliteAddress : address; const s : governanceSatelliteStorageType) : satelliteRecordType is 
block {

    // Get Delegation Contract address from the General Contracts Map on the Governance Contract
    const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", satelliteAddress, delegationAddress);
    const satelliteRecord : satelliteRecordType = case satelliteOptView of [
            Some (optionView) -> case optionView of [
                    Some(_satelliteRecord)      -> _satelliteRecord
                |   None                        -> failwith(error_SATELLITE_NOT_FOUND)
            ]
        |   None -> failwith(error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
    ];

} with satelliteRecord




// helper function to get satellite rewards record view from the delegation contract
function getSatelliteRewardsRecord(const satelliteAddress : address; const s : governanceSatelliteStorageType) : satelliteRewardsType is 
block {

    // Get Delegation Contract address from the General Contracts Map on the Governance Contract
    const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    const satelliteRewardsOptView : option (option(satelliteRewardsType)) = Tezos.call_view ("getSatelliteRewardsOpt", satelliteAddress, delegationAddress);
    const satelliteRewards : satelliteRewardsType = case satelliteRewardsOptView of [
            Some (optionView) -> case optionView of [
                    Some(_satelliteRewards)     -> _satelliteRewards
                |   None                        -> failwith(error_SATELLITE_REWARDS_NOT_FOUND)
            ]
        |   None -> failwith(error_GET_SATELLITE_REWARDS_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
    ];

} with satelliteRewards



// helper function to get delegation ratio from the delegation contract
function getDelegationRatio(const s : governanceSatelliteStorageType) : nat is 
block {

    // Get Delegation Contract address from the General Contracts Map on the Governance Contract
    const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    // Get the delegation ratio
    const configView : option (delegationConfigType)  = Tezos.call_view ("getConfig", unit, delegationAddress);
    const delegationRatio : nat = case configView of [
            Some (_config) -> _config.delegationRatio
        |   None -> failwith (error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
    ];

} with delegationRatio



// helper function to check if satellite snapshot exists
function createSatelliteSnapshotCheck(const currentCycle : nat; const satelliteAddress : address; const s : governanceSatelliteStorageType) : bool is
block {

    const snapshotOptView : option (option(governanceSatelliteSnapshotRecordType)) = Tezos.call_view ("getSnapshotOpt", (currentCycle, satelliteAddress), s.governanceAddress);
    const satelliteSnapshotOpt: option(governanceSatelliteSnapshotRecordType) = case snapshotOptView of [
            Some (_snapshotOpt) -> _snapshotOpt
        |   None                -> failwith (error_GET_SNAPSHOT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    const satelliteSnapshotExists : bool = case satelliteSnapshotOpt of [
            Some (_snapshot)    -> False
        |   None                -> True
    ];

} with satelliteSnapshotExists



// helper function to get satellite total voting power (default: 0)
function getSatelliteTotalVotingPower(const currentCycle : nat; const satelliteAddress : address; const s : governanceSatelliteStorageType) : nat is
block {

    const snapshotOptView : option (option(governanceSatelliteSnapshotRecordType)) = Tezos.call_view ("getSnapshotOpt", (currentCycle, satelliteAddress), s.governanceAddress);
    const satelliteSnapshotOpt: option(governanceSatelliteSnapshotRecordType) = case snapshotOptView of [
            Some (_snapshotOpt) -> _snapshotOpt
        |   None                -> failwith (error_GET_SNAPSHOT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    const totalVotingPower : nat = case satelliteSnapshotOpt of [
            Some (_snapshot)    -> _snapshot.totalVotingPower
        |   None                -> 0n
    ];

} with totalVotingPower



// helper function to update satellite snapshot
function updateSatelliteSnapshotOperation(const satelliteAddress : address; const ready : bool; const s : governanceSatelliteStorageType) : operation is 
block {

    // Get the satellite record and delgation ratio
    const satelliteRecord   : satelliteRecordType  = getSatelliteRecord(satelliteAddress, s);
    const satelliteRewards  : satelliteRewardsType = getSatelliteRewardsRecord(satelliteAddress, s);
    const delegationRatio   : nat                  = getDelegationRatio(s);

    // Create a snapshot
    const satelliteSnapshotParams : updateSatelliteSnapshotType  = record[
        satelliteAddress            = satelliteAddress;
        totalStakedMvkBalance       = satelliteRecord.stakedMvkBalance;
        totalDelegatedAmount        = satelliteRecord.totalDelegatedAmount;
        ready                       = ready;
        delegationRatio             = delegationRatio;
        accumulatedRewardsPerShare  = satelliteRewards.satelliteAccumulatedRewardsPerShare;
    ];

    // Send the snapshot to the governance contract
    const updateSatelliteSnapshotOperation : operation   = Tezos.transaction(
        (satelliteSnapshotParams),
        0tez, 
        sendUpdateSatelliteSnapshotOperationToGovernance(s.governanceAddress)
    );

} with updateSatelliteSnapshotOperation



// helper function to verify that satellite snapshot is ready
function verifySatelliteSnapshotIsReady(const currentCycle : nat; const satelliteAddress : address; const s : governanceSatelliteStorageType) : unit is
block {

    const snapshotOptView : option (option(governanceSatelliteSnapshotRecordType)) = Tezos.call_view ("getSnapshotOpt", (currentCycle, satelliteAddress), s.governanceAddress);
    const satelliteSnapshotOpt: option(governanceSatelliteSnapshotRecordType) = case snapshotOptView of [
            Some (_snapshotOpt) -> _snapshotOpt
        |   None                -> failwith (error_GET_SNAPSHOT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    case satelliteSnapshotOpt of [
            Some (_snapshot)    -> if _snapshot.ready then skip else failwith(error_SNAPSHOT_NOT_READY)
        |   None                -> skip
    ];

} with unit



// helper function to calculate voting power
function calculateVotingPower(const satelliteAddress : address; const s : governanceSatelliteStorageType) : nat is
block {

    // Get satellite record and delgation ratio
    const satelliteRecord       : satelliteRecordType = getSatelliteRecord(satelliteAddress, s);
    const delegationRatio       : nat                 = getDelegationRatio(s);

    var totalVotingPower : nat := 0n;
    if (satelliteRecord.status = "ACTIVE") then {
        
        totalVotingPower := voteHelperCalculateVotingPower(
            delegationRatio,                        // delegation ratio
            satelliteRecord.stakedMvkBalance,       // staked MVK balance
            satelliteRecord.totalDelegatedAmount    // total delegated amount
        );

    } else skip;

} with totalVotingPower



// helper function to get a satellite total voting power from its snapshot on the governance contract
function getTotalVotingPowerAndUpdateSnapshot(const satelliteAddress: address; const actionGovernanceCycleId : nat; var operations : list(operation); const s: governanceSatelliteStorageType): (nat * list(operation)) is 
block{

    // Get the current cycle from the governance contract to check if the snapshot is up to date
    const currentCycle : nat = getCurrentCycleCounter(s);

    // Check if a snapshot needs to be created
    const createSatelliteSnapshotCheck : bool = createSatelliteSnapshotCheck(actionGovernanceCycleId, satelliteAddress, s);

    // Get the total voting power from the snapshot (default 0 if snapshot has not been created)
    var totalVotingPower : nat := getSatelliteTotalVotingPower(actionGovernanceCycleId, satelliteAddress, s);

    // Create snapshot if it does not exist, verify snapshot is ready if it exists
    if createSatelliteSnapshotCheck then{

        // check if current governance cycle matches with governance cycle of financial request
        if currentCycle = actionGovernanceCycleId then block {

            // update satellite snapshot operation
            const updateSatelliteSnapshotOperation : operation = updateSatelliteSnapshotOperation(satelliteAddress, True, s);
            operations := updateSatelliteSnapshotOperation # operations;

            // Calculate the total voting power of the satellite
            totalVotingPower := calculateVotingPower(satelliteAddress, s);

        } else skip;

    } 
    // Check if satellite is ready to vote
    else {

        // Verify that satellite snapshot is ready
        verifySatelliteSnapshotIsReady(actionGovernanceCycleId, satelliteAddress, s);
    }

} with (totalVotingPower, operations)

// ------------------------------------------------------------------------------
// Governance Snapshot Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vote Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to add a remove an oracle from an aggregator
function updateOracleInAggregator(const oracleAddress : address; const addOracle : bool; var operations : list(operation); const s : governanceSatelliteStorageType) : list(operation) is
block {

    operations := case s.satelliteAggregatorLedger[oracleAddress] of [
            Some(_record) -> block {

                for aggregatorAddress -> _startDateTime in map _record {

                    const updateOperation : operation = case addOracle of [
                            True    ->  addOracleToAggregatorOperation(oracleAddress, aggregatorAddress)
                        |   False   ->  removeOracleFromAggregatorOperation(oracleAddress, aggregatorAddress)

                    ];

                    operations := updateOperation # operations;
                };                  

            } with operations
        |   None -> operations
    ];

} with (operations)



// helper function to trigger the suspend action during the vote
function triggerSuspendSatelliteAction(const actionRecord : governanceSatelliteActionRecordType; var operations : list(operation); const s : governanceSatelliteStorageType) : list(operation) is
block {

    // Get address of satellite to be suspended from governance satellite action record address map
    const satelliteToBeSuspended : address = unpackAddress(actionRecord, "satelliteToBeSuspended", error_SATELLITE_NOT_FOUND);

    // Update the satellite status
    const updateSatelliteStatusOperation : operation = updateSatelliteStatusOperation(satelliteToBeSuspended, "SUSPENDED", s);
    operations := updateSatelliteStatusOperation # operations;

    // if satellite has oracles, create operations to remove satellite oracles from aggregators
    operations := updateOracleInAggregator(satelliteToBeSuspended, False, operations, s);

} with (operations)



// helper function to trigger the ban action during the vote
function triggerBanSatelliteAction(const actionRecord : governanceSatelliteActionRecordType; var operations : list(operation); const s : governanceSatelliteStorageType) : list(operation) is
block {

    // Get address of satellite to be banned from governance satellite action record address map
    const satelliteToBeBanned : address = unpackAddress(actionRecord, "satelliteToBeBanned", error_SATELLITE_NOT_FOUND);

    // Update the satellite status
    const updateSatelliteStatusOperation : operation = updateSatelliteStatusOperation(satelliteToBeBanned, "BANNED", s);
    operations := updateSatelliteStatusOperation # operations;

    // if satellite has oracles, create operations to remove satellite oracles from aggregators
    operations := updateOracleInAggregator(satelliteToBeBanned, False, operations, s);

} with (operations)



// helper function to trigger the restore action during the vote
function triggerRestoreSatelliteAction(const actionRecord : governanceSatelliteActionRecordType; var operations : list(operation); const s : governanceSatelliteStorageType) : list(operation) is
block {

    // Get address of satellite to be restored from governance satellite action record address map
    const satelliteToBeRestored : address = unpackAddress(actionRecord, "satelliteToBeRestored", error_SATELLITE_NOT_FOUND);

    // Update the satellite status
    const updateSatelliteStatusOperation : operation = updateSatelliteStatusOperation(satelliteToBeRestored, "ACTIVE", s);
    operations := updateSatelliteStatusOperation # operations;

    // if satellite has oracles, create operations to add satellite oracles to aggregators
    operations := updateOracleInAggregator(satelliteToBeRestored, True, operations, s);

} with (operations)



// helper function to trigger the add oracle to aggregator action during the vote
function triggerAddOracleToAggregatorSatelliteAction(const actionRecord : governanceSatelliteActionRecordType; var operations : list(operation); var s : governanceSatelliteStorageType) : return is
block {

    // Get oracle address and aggregator address from governance satellite action record address map
    const oracleAddress     : address = unpackAddress(actionRecord, "oracleAddress"     , error_ORACLE_NOT_FOUND);
    const aggregatorAddress : address = unpackAddress(actionRecord, "aggregatorAddress" , error_AGGREGATOR_CONTRACT_NOT_FOUND);

    // Get or create satellite's subcribed aggregators map
    var subscribedAggregators : subscribedAggregatorsType := getOrCreateSubscribedAggregators(oracleAddress, s);

    // Update subscribed aggregators map with new aggregator
    subscribedAggregators[aggregatorAddress] := Tezos.get_now();

    // Update storage
    s.satelliteAggregatorLedger[oracleAddress] := subscribedAggregators;

    // Create operation to add oracle to aggregator
    const addOracleToAggregatorOperation : operation = addOracleToAggregatorOperation(oracleAddress, aggregatorAddress);
    operations := addOracleToAggregatorOperation # operations;

} with (operations, s)



// helper function to trigger the remove oracle to aggregator action during the vote
function triggerRemoveOracleInAggregatorSatelliteAction(const actionRecord : governanceSatelliteActionRecordType; var operations : list(operation); var s : governanceSatelliteStorageType) : return is
block {

    // Get oracle address from governance satellite action record address map
    const oracleAddress     : address = unpackAddress(actionRecord, "oracleAddress"     , error_ORACLE_NOT_FOUND);
    const aggregatorAddress : address = unpackAddress(actionRecord, "aggregatorAddress" , error_AGGREGATOR_CONTRACT_NOT_FOUND);

    const removeOracleFromAggregatorOperation : operation = removeOracleFromAggregatorOperation(oracleAddress, aggregatorAddress);
    operations := removeOracleFromAggregatorOperation # operations;

    // Get subscribed aggregators belonging to satellite (oracle)
    var subscribedAggregators : subscribedAggregatorsType := getSubscribedAggregators(oracleAddress, s);

    // Remove aggregator from satellite's (oracle) subscribed aggregators
    remove aggregatorAddress from map subscribedAggregators;

    // Update storage
    s.satelliteAggregatorLedger[oracleAddress] := subscribedAggregators;

} with (operations, s)



// helper function to trigger the remove all satellite oracles action during the vote
function triggerRemoveAllSatelliteOraclesSatelliteAction(const actionRecord : governanceSatelliteActionRecordType; var operations : list(operation); var s : governanceSatelliteStorageType) : return is
block {

    // Get satellite address from governance satellite action record address map
    const satelliteAddress : address = unpackAddress(actionRecord, "satelliteAddress", error_SATELLITE_NOT_FOUND);

    // Get satellite oracle record
    var subscribedAggregators : subscribedAggregatorsType := getSubscribedAggregators(satelliteAddress, s);

    // Loop to remove satellite's (i.e. oracle's) address in aggregators
    for aggregatorAddress -> _startDateTime in map subscribedAggregators {

        const removeOracleFromAggregatorOperation : operation = removeOracleFromAggregatorOperation(satelliteAddress, aggregatorAddress);
        operations := removeOracleFromAggregatorOperation # operations;

        remove aggregatorAddress from map subscribedAggregators;
    };      

    // Update satellite oracle record and ledger
    s.satelliteAggregatorLedger[satelliteAddress] := subscribedAggregators;

} with(operations, s)




// helper function to trigger the pause or unpause of all aggregator entrypoint action during the vote
function triggerTogglePauseAggregatorSatelliteAction(const actionRecord : governanceSatelliteActionRecordType; var operations : list(operation); var s : governanceSatelliteStorageType) : return is
block {

    // Get aggregator address from governance satellite action record address map
    const aggregatorAddress : address = unpackAddress(actionRecord, "aggregatorAddress", error_AGGREGATOR_CONTRACT_NOT_FOUND);

    // Get aggregator new status from governance satellite action record string map
    const toggleStatus : togglePauseAggregatorVariantType = unpackAggregatorStatusBytes(actionRecord);

    // Create operation to pause or unpause aggregator based on status input
    operations := case toggleStatus of [
            PauseAll    -> pauseAllEntrypointsInAggregatorOperation(aggregatorAddress) # operations
        |   UnpauseAll  -> unpauseAllEntrypointsInAggregatorOperation(aggregatorAddress) # operations
    ];

} with (operations, s)



// helper function to trigger the fix mistaken transfer action during the vote
function triggerFixMistakenTransferSatelliteAction(const actionRecord : governanceSatelliteActionRecordType; var operations : list(operation)) : list(operation) is
block {

    // get parameters
    const targetContractAddress : address = unpackAddress(actionRecord, "targetContractAddress", error_GOVERNANCE_SATELLITE_ACTION_PARAMETER_NOT_FOUND);
    const transferActionsList : transferActionType = upackTransferActions(actionRecord, "transfer", error_GOVERNANCE_SATELLITE_ACTION_PARAMETER_NOT_FOUND);

    // call mistaken transfer entrypoint
    const mistakenTransferOperation : operation = Tezos.transaction(
        transferActionsList,
        0tez,
        getMistakenTransferEntrypoint(targetContractAddress)
    );

    operations := mistakenTransferOperation # operations;

} with (operations)



// helper function to execute a governance action during the vote
function executeGovernanceSatelliteAction(var actionRecord : governanceSatelliteActionRecordType; const actionId : actionIdType; var operations : list(operation); var s : governanceSatelliteStorageType) : return is
block {

    // Governance: Suspend Satellite
    if actionRecord.governanceType = "SUSPEND" then operations                       := triggerSuspendSatelliteAction(actionRecord, operations, s) else skip;

    // Governance: Ban Satellite
    if actionRecord.governanceType = "BAN" then operations                           := triggerBanSatelliteAction(actionRecord, operations, s) else skip;

    // Governance: Restore Satellite
    if actionRecord.governanceType = "RESTORE" then operations                       := triggerRestoreSatelliteAction(actionRecord, operations, s) else skip;

    // Governance: Add Oracle To Aggregator
    if actionRecord.governanceType = "ADD_ORACLE_TO_AGGREGATOR" then block {
        const addOracleToAggregatorActionTrigger : return                               = triggerAddOracleToAggregatorSatelliteAction(actionRecord, operations, s);
        s           := addOracleToAggregatorActionTrigger.1;
        operations := addOracleToAggregatorActionTrigger.0;
    } else skip;

    // Governance: Remove Oracle In Aggregator
    if actionRecord.governanceType = "REMOVE_ORACLE_IN_AGGREGATOR" then block {
        const removeOracleInAggregatorActionTrigger : return                            = triggerRemoveOracleInAggregatorSatelliteAction(actionRecord, operations, s);
        s           := removeOracleInAggregatorActionTrigger.1;
        operations := removeOracleInAggregatorActionTrigger.0;
    } else skip;

    // Governance: Remove All Satellite Oracles (in aggregators)
    if actionRecord.governanceType = "REMOVE_ALL_SATELLITE_ORACLES" then block {
        const removeAllSatelliteOraclesActionTrigger : return                           = triggerRemoveAllSatelliteOraclesSatelliteAction(actionRecord, operations, s);
        s           := removeAllSatelliteOraclesActionTrigger.1;
        operations := removeAllSatelliteOraclesActionTrigger.0;
    } else skip;

    // Governance: Update Aggregator Status
    if actionRecord.governanceType = "TOGGLE_PAUSE_AGGREGATOR" then block {
        const togglePauseAggregatorActionTrigger : return                               = triggerTogglePauseAggregatorSatelliteAction(actionRecord, operations, s);
        s           := togglePauseAggregatorActionTrigger.1;
        operations := togglePauseAggregatorActionTrigger.0;
    } else skip;

    // Governance: Mistaken Transfer Fix
    if actionRecord.governanceType = "MISTAKEN_TRANSFER_FIX" then operations         := triggerFixMistakenTransferSatelliteAction(actionRecord, operations);

    actionRecord.executed                       := True;
    actionRecord.executedDateTime               := Tezos.get_now();
    s.governanceSatelliteActionLedger[actionId] := actionRecord;

    // Remove the executed action from the satellite's set
    const initiator : address                   = actionRecord.initiator;
    const governanceCycleId : nat               = actionRecord.governanceCycleId;
    const satelliteActionKey : (nat * address)  = (governanceCycleId, initiator);

    var satelliteActions : set(actionIdType)    := case s.satelliteActions[satelliteActionKey] of [
            Some (_actionsIds)  -> _actionsIds
        |   None                -> failwith(error_SATELLITE_ACTIONS_NOT_FOUND)
    ];
    satelliteActions                        := Set.remove(actionId, satelliteActions);
    s.satelliteActions[satelliteActionKey]  := satelliteActions;

} with (operations, s)

// ------------------------------------------------------------------------------
// Vote Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType; var s : governanceSatelliteStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(governanceSatelliteUnpackLambdaFunctionType)) of [
            Some(f) -> f(governanceSatelliteLambdaAction, s)
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