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



// helper function to verify sender is governance satellite action initiator
function verifySenderIsInitiator(const initiatorAddrss : address) : unit is
block {
    
    if Tezos.get_sender() =/= initiatorAddrss then failwith(error_ONLY_INITIATOR_CAN_DROP_ACTION) else skip;

} with unit



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
// Operations Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to add oracle to aggregator
function addOracleToAggregatorOperation(const oracleAddress : address; const aggregatorAddress : address) : operation is 
block {

    const addOracleToAggregatorParams : addOracleType = record[
        oracleAddress = oracleAddress;
    ];
    
    const addOracleToAggregatorOperation : operation = Tezos.transaction(
        addOracleParams,
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

// helper function to get staked mvk total supply (equivalent to balance of the Doorman contract on the MVK Token contract)
function getStakedMvkTotalSupply(const s : governanceSatelliteStorageType) : nat is 
block {

    // Get Doorman Contract address from the General Contracts Map on the Governance Contract
    const doormanAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    const getBalanceView : option (nat) = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
    const stakedMvkTotalSupply: nat = case getBalanceView of [
            Some (value) -> value
        |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
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

    // Take snapshot of current total staked MVK supply (Doorman contract's MVK balance)
    const snapshotStakedMvkTotalSupply : nat = getStakedMvkTotalSupply(s);

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
    const updateSatelliteStatusOperation : operation = updateSatelliteStatusOperation(targetSatellite, newStatus, s);
    operations := updateSatelliteStatusOperation # operations;

} with (operations)



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
function triggerSuspendSatelliteAction(const actionRecord : governanceSatelliteActionRecordType; const delegationAddress : address; var operations : list(operation); const s : governanceSatelliteStorageType) : list(operation) is
block {

    // Get address of satellite to be suspended from governance satellite action record address map
    const satelliteToBeSuspended : address = unpackAddress(actionRecord, "satelliteToBeSuspended", error_SATELLITE_NOT_FOUND);

    // Update the satellite status
    operations := updateSatelliteStatus(satelliteToBeSuspended, "SUSPENDED", delegationAddress, operations);

    // if satellite has oracles, create operations to remove satellite oracles from aggregators
    operations := updateOracleInAggregator(satelliteToBeSuspended, False, operations, s);

} with (operations)



// helper function to trigger the ban action during the vote
function triggerBanSatelliteAction(const actionRecord : governanceSatelliteActionRecordType; const delegationAddress : address; var operations : list(operation); const s : governanceSatelliteStorageType) : list(operation) is
block {

    // Get address of satellite to be banned from governance satellite action record address map
    const satelliteToBeBanned : address = unpackAddress(actionRecord, "satelliteToBeBanned", error_SATELLITE_NOT_FOUND);

    // Update the satellite status
    operations := updateSatelliteStatus(satelliteToBeBanned, "BANNED", delegationAddress, operations);

    // if satellite has oracles, create operations to remove satellite oracles from aggregators
    operations := updateOracleInAggregator(satelliteToBeBanned, False, operations, s);

} with (operations)



// helper function to trigger the restore action during the vote
function triggerRestoreSatelliteAction(const actionRecord : governanceSatelliteActionRecordType; const delegationAddress : address; var operations : list(operation); const s : governanceSatelliteStorageType) : list(operation) is
block {

    // Get address of satellite to be restored from governance satellite action record address map
    const satelliteToBeRestored : address = unpackAddress(actionRecord, "satelliteToBeRestored", error_SATELLITE_NOT_FOUND);

    // Update the satellite status
    operations := updateSatelliteStatus(satelliteToBeRestored, "ACTIVE", delegationAddress, operations);

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
    subscribedAggregators[aggregatorAddress]    := Tezos.get_now();

    // Update storage
    s.satelliteAggregatorLedger[oracleAddress]  := subscribedAggregators;

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

// helper function to get lambda bytes
function getLambdaBytes(const lambdaKey : string; const s : governanceSatelliteStorageType) : bytes is 
block {
    
    // get lambda bytes from lambda ledger
    const lambdaBytes : bytes = case s.lambdaLedger[lambdaKey] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

} with lambdaBytes



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
// Views
// ------------------------------------------------------------------------------

// Governance Satellite Views:
#include "../partials/contractViews/governanceSatelliteViews.ligo"

// ------------------------------------------------------------------------------
// Lambdas
// ------------------------------------------------------------------------------

// Governance Satellite Lambdas :
#include "../partials/contractLambdas/governanceSatellite/governanceSatelliteLambdas.ligo"

// ------------------------------------------------------------------------------
// Entrypoints
// ------------------------------------------------------------------------------

// Governance Satellite Entrypoints:
#include "../partials/contractEntrypoints/governanceSatelliteEntrypoints.ligo"

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
