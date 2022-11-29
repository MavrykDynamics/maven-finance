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

// Governance Satellite Types
#include "../partials/contractTypes/governanceSatelliteTypes.ligo"

// ------------------------------------------------------------------------------


type governanceSatelliteAction is 
      
        // Housekeeping Actions
    |   SetAdmin                      of address
    |   SetGovernance                 of address
    |   UpdateMetadata                of updateMetadataType
    |   UpdateConfig                  of governanceSatelliteUpdateConfigParamsType
    |   UpdateWhitelistContracts      of updateWhitelistContractsType
    |   UpdateGeneralContracts        of updateGeneralContractsType
    |   MistakenTransfer              of transferActionType

        // Satellite Governance
    |   SuspendSatellite              of suspendSatelliteActionType
    |   BanSatellite                  of banSatelliteActionType
    |   RestoreSatellite              of restoreSatelliteActionType

        // Satellite Oracle Governance
    |   RemoveAllSatelliteOracles     of removeAllSatelliteOraclesActionType
    |   AddOracleToAggregator         of addOracleToAggregatorActionType
    |   RemoveOracleInAggregator      of removeOracleInAggregatorActionType

        // Aggregator Governance
    |   SetAggregatorReference        of setAggregatorReferenceType
    |   TogglePauseAggregator         of togglePauseAggregatorActionType

        // Mistaken Transfer Governance
    |   FixMistakenTransfer           of fixMistakenTransferParamsType

        // Governance Vote Actions
    |   DropAction                    of dropActionType
    |   VoteForAction                 of voteForActionType

        // Lambda Entrypoints
    |   SetLambda                     of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * governanceSatelliteStorageType

// governance satellite contract methods lambdas
type governanceSatelliteUnpackLambdaFunctionType is (governanceSatelliteLambdaActionType * governanceSatelliteStorageType) -> return



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders : Admin, Governance Contract
function checkSenderIsAllowed(var s : governanceSatelliteStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



// Allowed Senders : Admin
function checkSenderIsAdmin(const s : governanceSatelliteStorageType) : unit is
    if Tezos.get_sender() =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit



// Allowed Senders : Admin, Self
function checkSenderIsAdminOrSelf(var s : governanceSatelliteStorageType) : unit is
block{
    if Tezos.get_sender() = s.admin then skip
    else {
        if Tezos.get_sender() = Tezos.get_self_address() then skip
        else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED);
    }
} with Unit



function checkNoAmount(const _p : unit) : unit is
    if (Tezos.get_amount() = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

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

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------

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



// helper function to get a satellite total voting power from its snapshot on the governance contract
function getTotalVotingPowerAndUpdateSnapshot(const satelliteAddress: address; var operations : list(operation); const s: governanceSatelliteStorageType): (nat * list(operation)) is 
block{

    // Get the governance cycle counter
    const cycleIdView : option (nat) = Tezos.call_view ("getCycleCounter", unit, s.governanceAddress);
    const currentCycle: nat = case cycleIdView of [
            Some (_cycle)   -> _cycle
        |   None            -> failwith (error_GET_CYCLE_COUNTER_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    // Get the snapshot from the governance contract
    const snapshotOptView : option (option(governanceSatelliteSnapshotRecordType)) = Tezos.call_view ("getSnapshotOpt", (currentCycle,satelliteAddress), s.governanceAddress);
    const satelliteSnapshotOpt: option(governanceSatelliteSnapshotRecordType) = case snapshotOptView of [
            Some (_snapshotOpt) -> _snapshotOpt
        |   None                -> failwith (error_GET_SNAPSHOT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    // Check if a snapshot needs to be created
    const createSatelliteSnapshot: bool = case satelliteSnapshotOpt of [
        Some (_snapshot)    -> False
    |   None                -> True
    ];

    // Get the total voting power from the snapshot
    var totalVotingPower: nat   := case satelliteSnapshotOpt of [
        Some (_snapshot)    -> _snapshot.totalVotingPower
    |   None                -> 0n
    ];

    // Create or not a snapshot
    if createSatelliteSnapshot then{

        // Get the delegation address
        const delegationAddress: address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

        // Get the satellite record
        const satelliteOptView : option (option(satelliteRecordType))   = Tezos.call_view ("getSatelliteOpt", satelliteAddress, delegationAddress);
        const _satelliteRecord: satelliteRecordType                     = case satelliteOptView of [
                Some (value) -> case value of [
                        Some (_satellite) -> _satellite
                    |   None              -> failwith(error_SATELLITE_NOT_FOUND)
                ]
            |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
        ];

        // Get the delegation ratio
        const configView : option (delegationConfigType)    = Tezos.call_view ("getConfig", unit, delegationAddress);
        const delegationRatio: nat                          = case configView of [
                Some (_config) -> _config.delegationRatio
            |   None -> failwith (error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
        ];

        // Create a snapshot
        const satelliteSnapshotParams: updateSatelliteSnapshotType  = record[
            satelliteAddress    = satelliteAddress;
            satelliteRecord     = _satelliteRecord;
            ready               = True;
            delegationRatio     = delegationRatio;
        ];

        // Send the snapshot to the governance contract
        const updateSnapshotOperation : operation   = Tezos.transaction(
            (satelliteSnapshotParams),
            0tez, 
            sendUpdateSatelliteSnapshotOperationToGovernance(s.governanceAddress)
        );
        operations   := updateSnapshotOperation # operations;

        // Pre-calculate the total voting power of the satellite
        totalVotingPower    := calculateVotingPower(delegationRatio, _satelliteRecord.stakedMvkBalance, _satelliteRecord.totalDelegatedAmount);

    } 
    // Check if satellite is ready to vote
    else case satelliteSnapshotOpt of [
        Some (_snapshot)    -> if _snapshot.ready then skip else failwith(error_SNAPSHOT_NOT_READY)
    |   None                -> skip
    ];

} with(totalVotingPower, operations)



// helper function to create a governance satellite action
function createGovernanceSatelliteAction(const actionType : string; const dataMap : dataMapType; const purpose : string; var s : governanceSatelliteStorageType) : governanceSatelliteStorageType is
block {

    // Validate inputs
    if String.length(purpose)    > s.config.governancePurposeMaxLength    then failwith(error_WRONG_INPUT_PROVIDED) else skip;

    // ------------------------------------------------------------------
    // Get necessary contracts and info
    // ------------------------------------------------------------------

    // Get Doorman Contract address from the General Contracts Map on the Governance Contract
    const doormanAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    // Get Delegation Contract address from the General Contracts Map on the Governance Contract
    const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    // ------------------------------------------------------------------
    // Get / Check Satellite Records
    // ------------------------------------------------------------------

    // Check if the satellite created too much actions this cycle
    var initiatorActions : set(actionIdType)    := case Big_map.find_opt(Tezos.get_sender(), s.actionsInitiators) of [
            Some (_actionsIds)  -> _actionsIds
        |   None                -> set []
    ];
    const createdActionsAmount: nat =   Set.cardinal(initiatorActions);
    if createdActionsAmount >= s.config.maxActionsPerSatellite then failwith(error_MAX_GOVERNANCE_SATELLITE_ACTION_REACHED) else skip;

    // Get satellite record for initiator
    const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", Tezos.get_sender(), delegationAddress);
    case satelliteOptView of [
            Some (value) -> case value of [
                    Some (_satellite) -> if _satellite.status = "SUSPENDED" then failwith(error_SATELLITE_SUSPENDED) else if _satellite.status = "BANNED" then failwith(error_SATELLITE_BANNED) else skip
                |   None              -> failwith(error_ONLY_SATELLITES_ALLOWED_TO_INITIATE_GOVERNANCE_ACTION)
            ]
        |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
    ];

    // ------------------------------------------------------------------
    // Snapshot Staked MVK Total Supply
    // ------------------------------------------------------------------

    // Take snapshot of current total staked MVK supply 
    const getBalanceView : option (nat) = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
    const snapshotStakedMvkTotalSupply : nat = case getBalanceView of [
            Some (value) -> value
        |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
    ];

    // Calculate staked MVK votes required for approval based on config's approval percentage
    const stakedMvkRequiredForApproval : nat     = abs((snapshotStakedMvkTotalSupply * s.config.governanceSatelliteApprovalPercentage) / 10000);

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
        voters                             = set [];

        dataMap                            = dataMap;

        yayVoteStakedMvkTotal              = 0n;
        nayVoteStakedMvkTotal              = 0n;
        passVoteStakedMvkTotal             = 0n;

        snapshotStakedMvkTotalSupply       = snapshotStakedMvkTotalSupply;
        stakedMvkPercentageForApproval     = s.config.governanceSatelliteApprovalPercentage; 
        stakedMvkRequiredForApproval       = stakedMvkRequiredForApproval; 

        startDateTime                      = Tezos.get_now();            
        expiryDateTime                     = Tezos.get_now() + (86_400 * s.config.governanceSatelliteDurationInDays);
        
    ];

    // ------------------------------------------------------------------
    // Update Storage
    // ------------------------------------------------------------------

    // Get current action counter
    const actionId : nat = s.governanceSatelliteCounter;

    // Save action to governance satellite action ledger
    s.governanceSatelliteActionLedger[actionId] := newGovernanceSatelliteAction;

    // Add the new action to the satellite's set
    initiatorActions                            := Set.add(actionId, initiatorActions);
    s.actionsInitiators[Tezos.get_sender()]     := initiatorActions;

    // Increment governance satellite action counter
    s.governanceSatelliteCounter := actionId + 1n;

} with (s)

// ------------------------------------------------------------------------------
// General Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vote Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to create an operation to a satellite status
function updateSatelliteStatus(const targetSatellite : address; const newStatus : string; const delegationAddress : address; var operations : list(operation)) : list(operation) is
block {

    // Create operation to update satellite status in Delegation Contract
    const updateSatelliteStatusParams : updateSatelliteStatusParamsType = record [
        satelliteAddress = targetSatellite;
        newStatus        = newStatus;
    ];

    const updateSatelliteStatusOperation : operation = Tezos.transaction(
        updateSatelliteStatusParams,
        0tez,
        getUpdateSatelliteStatusInDelegationEntrypoint(delegationAddress)
    );

    operations := updateSatelliteStatusOperation # operations;

} with (operations)



// helper function to add a remove an oracle from an aggregator
function updateOracleInAggregator(const oracleAddress : address; const addOracle : bool; var operations : list(operation); const s : governanceSatelliteStorageType) : list(operation) is
block {

    operations := case s.satelliteOracleLedger[oracleAddress] of [
            Some(_record) -> block {

                for aggregatorAddress -> _startDateTime in map _record {

                    const updateOperation : operation = case addOracle of [
                            True    ->  block {
                                            const addOracleParams : addOracleType   = record[
                                                oracleAddress       = oracleAddress;
                                            ];
                                            
                                            const addOracleOperation : operation = Tezos.transaction(
                                                addOracleParams,
                                                0tez, 
                                                getAddOracleInAggregatorEntrypoint(aggregatorAddress)
                                            );

                                        } with addOracleOperation
                        |   False   ->  block {
                                            const removeOracleOperation : operation = Tezos.transaction(
                                                oracleAddress, 
                                                0tez, 
                                                getRemoveOracleInAggregatorEntrypoint(aggregatorAddress)
                                            )
                                        } with removeOracleOperation

                    ];

                    operations := updateOperation # operations;
                };                  

            } with operations
        |   None -> operations
    ];

} with (operations)



// helper function to trigger the suspend action during the vote
function triggerSuspendSatelliteAction(const actionRecord : governanceSatelliteActionRecordType; const delegationAddress : address; var operations : list(operation); const s : governanceSatelliteStorageType) : list(operation) is
block {

    // Get address of satellite to be suspended from governance satellite action record address map
    const satelliteToBeSuspended : address = case actionRecord.dataMap["satelliteToBeSuspended"] of [
            Some(_address) -> case (Bytes.unpack(_address) : option(address)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None           -> failwith(error_SATELLITE_NOT_FOUND)
    ];

    // Update the satellite status
    operations   := updateSatelliteStatus(satelliteToBeSuspended, "SUSPENDED", delegationAddress, operations);

    // if satellite has oracles, create operations to remove satellite oracles from aggregators
    operations   := updateOracleInAggregator(satelliteToBeSuspended, False, operations, s);

} with (operations)



// helper function to trigger the ban action during the vote
function triggerBanSatelliteAction(const actionRecord : governanceSatelliteActionRecordType; const delegationAddress : address; var operations : list(operation); const s : governanceSatelliteStorageType) : list(operation) is
block {

    // Get address of satellite to be banned from governance satellite action record address map
    const satelliteToBeBanned : address = case actionRecord.dataMap["satelliteToBeBanned"] of [
            Some(_address) -> case (Bytes.unpack(_address) : option(address)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None           -> failwith(error_SATELLITE_NOT_FOUND)
    ];

    // Update the satellite status
    operations   := updateSatelliteStatus(satelliteToBeBanned, "BANNED", delegationAddress, operations);

    // if satellite has oracles, create operations to remove satellite oracles from aggregators
    operations   := updateOracleInAggregator(satelliteToBeBanned, False, operations, s);

} with (operations)



// helper function to trigger the restore action during the vote
function triggerRestoreSatelliteAction(const actionRecord : governanceSatelliteActionRecordType; const delegationAddress : address; var operations : list(operation); const s : governanceSatelliteStorageType) : list(operation) is
block {

    // Get address of satellite to be restored from governance satellite action record address map
    const satelliteToBeRestored : address = case actionRecord.dataMap["satelliteToBeRestored"] of [
            Some(_address) -> case (Bytes.unpack(_address) : option(address)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None           -> failwith(error_SATELLITE_NOT_FOUND)
    ];


    // Update the satellite status
    operations   := updateSatelliteStatus(satelliteToBeRestored, "ACTIVE", delegationAddress, operations);

    // if satellite has oracles, create operations to add satellite oracles to aggregators
    operations   := updateOracleInAggregator(satelliteToBeRestored, True, operations, s);

} with (operations)



// helper function to trigger the add oracle to aggregator action during the vote
function triggerAddOracleToAggregatorSatelliteAction(const actionRecord : governanceSatelliteActionRecordType; var operations : list(operation); var s : governanceSatelliteStorageType) : return is
block {

    // Get oracle address from governance satellite action record address map
    const oracleAddress : address = case actionRecord.dataMap["oracleAddress"] of [
            Some(_address) -> case (Bytes.unpack(_address) : option(address)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None            -> failwith(error_ORACLE_NOT_FOUND)
    ];

    // Get aggregator address from governance satellite action record address map
    const aggregatorAddress : address = case actionRecord.dataMap["aggregatorAddress"] of [
            Some(_address) -> case (Bytes.unpack(_address) : option(address)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None           -> failwith(error_AGGREGATOR_CONTRACT_NOT_FOUND)
    ];

    // Get or create satellite oracle record
    var satelliteOracleRecord : aggregatorsMapType := case s.satelliteOracleLedger[oracleAddress] of [
            Some(_record) -> _record
        |   None -> (map[] : aggregatorsMapType)
    ];

    // Update satellite oracle record with new aggregator
    satelliteOracleRecord[aggregatorAddress]    := Tezos.get_now();

    // Update storage
    s.satelliteOracleLedger[oracleAddress]      := satelliteOracleRecord;

    // Create operation to add oracle to aggregator
    const addOracleInAggregatorParams : addOracleType   = record[
        oracleAddress = oracleAddress;
    ];
    const addOracleInAggregatorOperation : operation    = Tezos.transaction(
        addOracleInAggregatorParams, 
        0tez, 
        getAddOracleInAggregatorEntrypoint(aggregatorAddress)
    );

    operations := addOracleInAggregatorOperation # operations;

} with (operations, s)



// helper function to trigger the remove oracle to aggregator action during the vote
function triggerRemoveOracleInAggregatorSatelliteAction(const actionRecord : governanceSatelliteActionRecordType; var operations : list(operation); var s : governanceSatelliteStorageType) : return is
block {

    // Get oracle address from governance satellite action record address map
    const oracleAddress : address = case actionRecord.dataMap["oracleAddress"] of [
            Some(_address) -> case (Bytes.unpack(_address) : option(address)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None           -> failwith(error_ORACLE_NOT_FOUND)
    ];

    // Get aggregator address from governance satellite action record address map
    const aggregatorAddress : address = case actionRecord.dataMap["aggregatorAddress"] of [
            Some(_address) -> case (Bytes.unpack(_address) : option(address)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None           -> failwith(error_AGGREGATOR_CONTRACT_NOT_FOUND)
    ];

    const removeOracleInAggregatorOperation : operation = Tezos.transaction(
        oracleAddress, 
        0tez, 
        getRemoveOracleInAggregatorEntrypoint(aggregatorAddress)
    );

    operations := removeOracleInAggregatorOperation # operations;

    // Get satellite oracle record
    var satelliteOracleRecord : aggregatorsMapType := case s.satelliteOracleLedger[oracleAddress] of [
            Some(_record) -> _record
        |   None          -> failwith(error_SATELLITE_ORACLE_RECORD_NOT_FOUND)
    ];

    // Remove aggregator from satellite oracle record
    remove aggregatorAddress from map satelliteOracleRecord;

    // Update storage
    s.satelliteOracleLedger[oracleAddress] := satelliteOracleRecord;

} with (operations, s)



// helper function to trigger the remove all satellite oracles action during the vote
function triggerRemoveAllSatelliteOraclesSatelliteAction(const actionRecord : governanceSatelliteActionRecordType; var operations : list(operation); var s : governanceSatelliteStorageType) : return is
block {

    // Get satellite address from governance satellite action record address map
    const satelliteAddress : address = case actionRecord.dataMap["satelliteAddress"] of [
            Some(_address) -> case (Bytes.unpack(_address) : option(address)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None           -> failwith(error_SATELLITE_NOT_FOUND)
    ];

    // Get satellite oracle record
    var satelliteOracleRecord : aggregatorsMapType := case s.satelliteOracleLedger[satelliteAddress] of [
            Some(_record) -> _record
        |   None          -> failwith(error_SATELLITE_ORACLE_RECORD_NOT_FOUND)
    ];

    // Loop to remove satellite's (i.e. oracle's) address in aggregators
    for aggregatorAddress -> _startDateTime in map satelliteOracleRecord {

        const removeOracleInAggregatorOperation : operation = Tezos.transaction(
            satelliteAddress, 
            0tez, 
            getRemoveOracleInAggregatorEntrypoint(aggregatorAddress)
        );

        operations := removeOracleInAggregatorOperation # operations;

        remove aggregatorAddress from map satelliteOracleRecord;
    };      

    // Update satellite oracle record and ledger
    s.satelliteOracleLedger[satelliteAddress] := satelliteOracleRecord;

} with(operations, s)




// helper function to trigger the pause or unpause of all aggregator entrypoint action during the vote
function triggerTogglePauseAggregatorSatelliteAction(const actionRecord : governanceSatelliteActionRecordType; var operations : list(operation); var s : governanceSatelliteStorageType) : return is
block {

    // Get aggregator address from governance satellite action record address map
    const aggregatorAddress : address = case actionRecord.dataMap["aggregatorAddress"] of [
            Some(_address) -> case (Bytes.unpack(_address) : option(address)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None           -> failwith(error_AGGREGATOR_CONTRACT_NOT_FOUND)
    ];

    // Get aggregator new status from governance satellite action record string map
    const toggleStatus : togglePauseAggregatorVariantType = case actionRecord.dataMap["status"] of [
            Some(_status) -> case (Bytes.unpack(_status) : option(togglePauseAggregatorVariantType)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        |   None          -> failwith(error_AGGREGATOR_NEW_STATUS_NOT_FOUND)
    ];

    // Create operation to pause or unpause aggregator based on status input
    operations  := case toggleStatus of [
            PauseAll    -> Tezos.transaction(
                unit,
                0tez,
                getPauseAllInAggregatorEntrypoint(aggregatorAddress)
            ) # operations
        |   UnpauseAll  -> Tezos.transaction(
                unit,
                0tez,
                getUnpauseAllInAggregatorEntrypoint(aggregatorAddress)
            ) # operations
    ];

} with (operations, s)



// helper function to trigger the fix mistaken transfer action during the vote
function triggerFixMistakenTransferSatelliteAction(const actionRecord : governanceSatelliteActionRecordType; var operations : list(operation)) : list(operation) is
block {

    // get parameters
    const targetContractAddress : address = case actionRecord.dataMap["targetContractAddress"] of [
            Some(_address) -> case (Bytes.unpack(_address) : option(address)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        | None -> failwith(error_GOVERNANCE_SATELLITE_ACTION_PARAMETER_NOT_FOUND)
    ];

    const transferList : transferActionType = case actionRecord.dataMap["transfer"] of [
            Some(_transferList) -> case (Bytes.unpack(_transferList) : option(transferActionType)) of [
                    Some (_v)   -> _v
                |   None        -> failwith(error_UNABLE_TO_UNPACK_ACTION_PARAMETER)
            ]
        | None -> failwith(error_GOVERNANCE_SATELLITE_ACTION_PARAMETER_NOT_FOUND)
    ];

    // call mistaken transfer entrypoint
    const mistakenTransferOperation : operation = Tezos.transaction(
        transferList,
        0tez,
        getMistakenTransferEntrypoint(targetContractAddress)
    );

    operations := mistakenTransferOperation # operations;

} with (operations)



// helper function to execute a governance action during the vote
function executeGovernanceSatelliteAction(var actionRecord : governanceSatelliteActionRecordType; const actionId : actionIdType; const delegationAddress : address; var operations : list(operation); var s : governanceSatelliteStorageType) : return is
block {

    // Governance: Suspend Satellite
    if actionRecord.governanceType = "SUSPEND" then operations                       := triggerSuspendSatelliteAction(actionRecord, delegationAddress, operations, s) else skip;

    // Governance: Ban Satellite
    if actionRecord.governanceType = "BAN" then operations                           := triggerBanSatelliteAction(actionRecord, delegationAddress, operations, s) else skip;

    // Governance: Restore Satellite
    if actionRecord.governanceType = "RESTORE" then operations                       := triggerRestoreSatelliteAction(actionRecord, delegationAddress, operations, s) else skip;

    // Governance: Add Oracle To Aggregator
    if actionRecord.governanceType = "ADD_ORACLE_TO_AGGREGATOR" then block {
        const addOracleToAggregatorActionTrigger : return                               = triggerAddOracleToAggregatorSatelliteAction(actionRecord, operations, s);
        s           := addOracleToAggregatorActionTrigger.1;
        operations  := addOracleToAggregatorActionTrigger.0;
    } else skip;

    // Governance: Remove Oracle In Aggregator
    if actionRecord.governanceType = "REMOVE_ORACLE_IN_AGGREGATOR" then block {
        const removeOracleInAggregatorActionTrigger : return                            = triggerRemoveOracleInAggregatorSatelliteAction(actionRecord, operations, s);
        s           := removeOracleInAggregatorActionTrigger.1;
        operations  := removeOracleInAggregatorActionTrigger.0;
    } else skip;

    // Governance: Remove All Satellite Oracles (in aggregators)
    if actionRecord.governanceType = "REMOVE_ALL_SATELLITE_ORACLES" then block {
        const removeAllSatelliteOraclesActionTrigger : return                           = triggerRemoveAllSatelliteOraclesSatelliteAction(actionRecord, operations, s);
        s           := removeAllSatelliteOraclesActionTrigger.1;
        operations  := removeAllSatelliteOraclesActionTrigger.0;
    } else skip;

    // Governance: Update Aggregator Status
    if actionRecord.governanceType = "TOGGLE_PAUSE_AGGREGATOR" then block {
        const togglePauseAggregatorActionTrigger : return                               = triggerTogglePauseAggregatorSatelliteAction(actionRecord, operations, s);
        s           := togglePauseAggregatorActionTrigger.1;
        operations  := togglePauseAggregatorActionTrigger.0;
    } else skip;

    // Governance: Mistaken Transfer Fix
    if actionRecord.governanceType = "MISTAKEN_TRANSFER_FIX" then operations         := triggerFixMistakenTransferSatelliteAction(actionRecord, operations);

    actionRecord.executed                       := True;
    s.governanceSatelliteActionLedger[actionId] := actionRecord;

    // Remove the executed action from the satellite's set
    const initiator : address                   = actionRecord.initiator;
    var initiatorActions : set(actionIdType)    := case Big_map.find_opt(initiator, s.actionsInitiators) of [
            Some (_actionsIds)  -> _actionsIds
        |   None                -> failwith(error_INITIATOR_ACTIONS_NOT_FOUND)
    ];
    initiatorActions                := Set.remove(actionId, initiatorActions);
    s.actionsInitiators[initiator]  := initiatorActions;

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



// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin *)
[@view] function getAdmin(const _ : unit; var s : governanceSatelliteStorageType) : address is
    s.admin



(* View: get config *)
[@view] function getConfig(const _ : unit; var s : governanceSatelliteStorageType) : governanceSatelliteConfigType is
    s.config



(* View: get Governance address *)
[@view] function getGovernanceAddress(const _ : unit; var s : governanceSatelliteStorageType) : address is
    s.governanceAddress



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; var s : governanceSatelliteStorageType) : whitelistContractsType is
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; var s : governanceSatelliteStorageType) : generalContractsType is
    s.generalContracts



(* View: get a governance satellite action *)
[@view] function getGovernanceSatelliteActionOpt(const actionId : nat; var s : governanceSatelliteStorageType) : option(governanceSatelliteActionRecordType) is
    Big_map.find_opt(actionId, s.governanceSatelliteActionLedger)



(* View: get governance satellite counter *)
[@view] function getGovernanceSatelliteCounter(const _ : unit; var s : governanceSatelliteStorageType) : nat is
    s.governanceSatelliteCounter



(* View: get governance satellite voter *)
[@view] function getGovernanceSatelliteVoterOpt(const requestIdAndVoter : (actionIdType*address); var s : governanceSatelliteStorageType) : option(voteType) is
    Big_map.find_opt(requestIdAndVoter, s.governanceSatelliteVoters)



(* View: get action action initiator *)
[@view] function getActionsInitiatorOpt(const initiator : address; var s : governanceSatelliteStorageType) : option(set(actionIdType)) is
    Big_map.find_opt(initiator, s.actionsInitiators)



(* View: get an aggregator address *)
[@view] function getAggregatorOpt(const aggregatorName : string; var s : governanceSatelliteStorageType) : option(address) is
    Big_map.find_opt(aggregatorName, s.aggregatorLedger)



(* View: get a satellite oracle record *)
[@view] function getSatelliteOracleRecordOpt(const satelliteAddress : address; var s : governanceSatelliteStorageType) : option(aggregatorsMapType) is
    Big_map.find_opt(satelliteAddress, s.satelliteOracleLedger)



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; var s : governanceSatelliteStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : governanceSatelliteStorageType) : lambdaLedgerType is
    s.lambdaLedger

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Lambda Helpers Begin
//
// ------------------------------------------------------------------------------

// Governance Satellite Lambdas :
#include "../partials/contractLambdas/governanceSatellite/governanceSatelliteLambdas.ligo"

// ------------------------------------------------------------------------------
//
// Lambda Helpers End
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

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : governanceSatelliteStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : governanceSatelliteStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : governanceSatelliteStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  updateConfig entrypoint  *)
function updateConfig(const updateConfigParams : governanceSatelliteUpdateConfigParamsType; var s : governanceSatelliteStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint  *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : governanceSatelliteStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  updateGeneralContracts entrypoint  *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : governanceSatelliteStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams: transferActionType; var s: governanceSatelliteStorageType): return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMistakenTransfer"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Satellite Governance Entrypoints Begin
// ------------------------------------------------------------------------------

(*  suspendSatellite entrypoint  *)
function suspendSatellite(const suspendSatelliteParams : suspendSatelliteActionType ; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSuspendSatellite"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaSuspendSatellite(suspendSatelliteParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  banSatellite entrypoint  *)
function banSatellite(const banSatelliteParams : banSatelliteActionType; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaBanSatellite"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaBanSatellite(banSatelliteParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  restoreSatellite entrypoint  *)
function restoreSatellite(const restoreSatelliteParams : restoreSatelliteActionType; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRestoreSatellite"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaRestoreSatellite(restoreSatelliteParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Satellite Governance Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Satellite Oracle Governance Entrypoints Begin
// ------------------------------------------------------------------------------

(*  removeAllSatelliteOracles entrypoint  *)
function removeAllSatelliteOracles(const removeAllSatelliteOraclesParams : removeAllSatelliteOraclesActionType; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveAllSatelliteOracles"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaRemoveAllSatelliteOracles(removeAllSatelliteOraclesParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  addOracleToAggregator entrypoint  *)
function addOracleToAggregator(const addOracleToAggregatorParams : addOracleToAggregatorActionType; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaAddOracleToAggregator"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaAddOracleToAggregator(addOracleToAggregatorParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);
    
} with response



(*  removeOracleInAggregator entrypoint  *)
function removeOracleInAggregator(const removeOracleInAggregatorParams : removeOracleInAggregatorActionType; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRemoveOracleInAggregator"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaRemoveOracleInAggregator(removeOracleInAggregatorParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Satellite Oracle Governance Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Aggregator Governance Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAggregatorReference entrypoint  *)
function setAggregatorReference(const setAggregatorReferenceParams : setAggregatorReferenceType; var s : governanceSatelliteStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAggregatorReference"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaSetAggregatorReference(setAggregatorReferenceParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  togglePauseAggregator entrypoint  *)
function togglePauseAggregator(const togglePauseAggregatorParams : togglePauseAggregatorActionType; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaTogglePauseAggregator"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaTogglePauseAggregator(togglePauseAggregatorParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Aggregator Governance Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Mistaken Transfer Governance Entrypoints Begin
// ------------------------------------------------------------------------------

(*  fixMistakenTransfer entrypoint  *)
function fixMistakenTransfer(const fixMistakenTransferParams : fixMistakenTransferParamsType; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaFixMistakenTransfer"] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaFixMistakenTransfer(fixMistakenTransferParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Mistaken Transfer Governance Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Actions Entrypoints Begin
// ------------------------------------------------------------------------------

(*  voteForAction entrypoint  *)
function voteForAction(const voteForActionParams : voteForActionType; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVoteForAction"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaVoteForAction(voteForActionParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response



(*  dropAction entrypoint  *)
function dropAction(const dropActionParams : dropActionType; var s : governanceSatelliteStorageType) : return is 
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDropAction"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance satellite lambda action
    const governanceSatelliteLambdaAction : governanceSatelliteLambdaActionType = LambdaDropAction(dropActionParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceSatelliteLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Governance Actions Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : governanceSatelliteStorageType) : return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;

    // set lambda in lambdaLedger - allow override of lambdas
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
function main (const action : governanceSatelliteAction; const s : governanceSatelliteStorageType) : return is
block{

    checkNoAmount(Unit); // entrypoints should not receive any tez amount  

} with (
    
    case action of [

            // Housekeeping Actions
        |   SetAdmin(parameters)                      -> setAdmin(parameters, s)
        |   SetGovernance(parameters)                 -> setGovernance(parameters, s)
        |   UpdateMetadata(parameters)                -> updateMetadata(parameters, s)  
        |   UpdateConfig(parameters)                  -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts(parameters)      -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)        -> updateGeneralContracts(parameters, s)
        |   MistakenTransfer(parameters)              -> mistakenTransfer(parameters, s)

            // Satellite Governance 
        |   SuspendSatellite(parameters)              -> suspendSatellite(parameters, s)
        |   BanSatellite(parameters)                  -> banSatellite(parameters, s)
        |   RestoreSatellite(parameters)              -> restoreSatellite(parameters, s)

            // Satellite Oracle Governance
        |   RemoveAllSatelliteOracles(parameters)     -> removeAllSatelliteOracles(parameters, s)
        |   AddOracleToAggregator(parameters)         -> addOracleToAggregator(parameters, s)
        |   RemoveOracleInAggregator(parameters)      -> removeOracleInAggregator(parameters, s)

            // Aggregator Governance
        |   SetAggregatorReference(parameters)        -> setAggregatorReference(parameters, s)
        |   TogglePauseAggregator(parameters)         -> togglePauseAggregator(parameters, s)

            // Mistaken Transfer Governance
        |   FixMistakenTransfer(parameters)           -> fixMistakenTransfer(parameters, s)

            // Governance Actions
        |   DropAction(parameters)                    -> dropAction(parameters, s)
        |   VoteForAction(parameters)                 -> voteForAction(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                     -> setLambda(parameters, s)
    ]
)
