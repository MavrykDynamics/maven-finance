// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Doorman Contract
function verifySenderIsDoormanContract(var s : delegationStorageType) : unit is
block{

    const doormanAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[doormanAddress], error_ONLY_DOORMAN_CONTRACT_ALLOWED);

} with unit



// Allowed Senders: Admin, Governance Satellite Contract
function verifySenderIsAdminOrGovernanceSatelliteContract(var s : delegationStorageType) : unit is
block{

    const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[s.admin; governanceSatelliteAddress], error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED)

} with unit



// Check User is a Satellite
function checkUserIsSatellite(const userAddress : address; var s : delegationStorageType) : unit is 
    if (Big_map.mem(userAddress, s.satelliteLedger)) then unit
    else failwith(error_ONLY_SATELLITE_ALLOWED);



// Check User is not a Satellite
function checkUserIsNotSatellite(const userAddress : address; var s : delegationStorageType) : unit is 
    if (Big_map.mem(userAddress, s.satelliteLedger)) then failwith(error_SATELLITE_NOT_ALLOWED)
    else unit;



// Check User is not delegated to a satellite
function checkUserIsNotDelegate(const userAddress : address; var s : delegationStorageType) : unit is 
    if (Big_map.mem(userAddress, s.delegateLedger)) then failwith(error_DELEGATE_NOT_ALLOWED)
    else unit;



// helper function to verify addresses are different
function verifyDifferentAddress(const firstAddress : address; const secondAddress : address; const errorCode : nat) : unit is
block {

    if firstAddress = secondAddress then failwith(errorCode)
    else skip;

} with unit


function verifyValidSatelliteStatus(const newStatus : string) : unit is
block {

    if newStatus = "BANNED" or newStatus = "SUSPENDED" or newStatus = "ACTIVE" 
    then skip 
    else failwith(error_INVALID_SATELLITE_STATUS);

} with unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / BreakGlass Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to pause all entrypoints
function pauseAllDelegationEntrypoints(var s : delegationStorageType) : delegationStorageType is 
block {

    // set all pause configs to True
    if s.breakGlassConfig.delegateToSatelliteIsPaused then skip
    else s.breakGlassConfig.delegateToSatelliteIsPaused := True;

    if s.breakGlassConfig.undelegateFromSatelliteIsPaused then skip
    else s.breakGlassConfig.undelegateFromSatelliteIsPaused := True;

    if s.breakGlassConfig.registerAsSatelliteIsPaused then skip
    else s.breakGlassConfig.registerAsSatelliteIsPaused := True;

    if s.breakGlassConfig.unregisterAsSatelliteIsPaused then skip
    else s.breakGlassConfig.unregisterAsSatelliteIsPaused := True;

    if s.breakGlassConfig.updateSatelliteRecordIsPaused then skip
    else s.breakGlassConfig.updateSatelliteRecordIsPaused := True;

    if s.breakGlassConfig.distributeRewardIsPaused then skip
    else s.breakGlassConfig.distributeRewardIsPaused := True;

} with s



// helper function to unpause all entrypoints
function unpauseAllDelegationEntrypoints(var s : delegationStorageType) : delegationStorageType is 
block {

    // set all pause configs to False
    if s.breakGlassConfig.delegateToSatelliteIsPaused then s.breakGlassConfig.delegateToSatelliteIsPaused := False
    else skip;

    if s.breakGlassConfig.undelegateFromSatelliteIsPaused then s.breakGlassConfig.undelegateFromSatelliteIsPaused := False
    else skip;

    if s.breakGlassConfig.registerAsSatelliteIsPaused then s.breakGlassConfig.registerAsSatelliteIsPaused := False
    else skip;

    if s.breakGlassConfig.unregisterAsSatelliteIsPaused then s.breakGlassConfig.unregisterAsSatelliteIsPaused := False
    else skip;

    if s.breakGlassConfig.updateSatelliteRecordIsPaused then s.breakGlassConfig.updateSatelliteRecordIsPaused := False
    else skip;

    if s.breakGlassConfig.distributeRewardIsPaused then s.breakGlassConfig.distributeRewardIsPaused := False
    else skip;

} with s

// ------------------------------------------------------------------------------
// Pause / BreakGlass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to %delegatetoSatellite entrypoint on the Delegation contract
function getDelegateToSatelliteEntrypoint(const delegationAddress : address) : contract(delegateToSatelliteType) is
    case (Tezos.get_entrypoint_opt(
        "%delegateToSatellite",
        delegationAddress) : option(contract(delegateToSatelliteType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_DELEGATE_TO_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(delegateToSatelliteType))
        ];



// helper function to %undelegateFromSatellite entrypoint on the Delegation contract
function getUndelegateFromSatelliteEntrypoint(const delegationAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%undelegateFromSatellite",
        delegationAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UNDELEGATE_FROM_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(address))
        ];



// helper function to %updateSatellitesSnapshot entrypoint on the Governance contract
function sendUpdateSatellitesSnapshotOperationToGovernance(const governanceAddress : address) : contract(updateSatellitesSnapshotType) is
    case (Tezos.get_entrypoint_opt(
        "%updateSatellitesSnapshot",
        governanceAddress) : option(contract(updateSatellitesSnapshotType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_UPDATE_SATELLITE_SNAPSHOT_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(updateSatellitesSnapshotType))
        ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Operations Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to create operation to distribute satellite rewards 
// (transfers MVK token from Satellite Treasury contract to the doorman contract i.e. increases staked MVK supply)
function distributeSatelliteRewardsOperation(const totalReward : nat; const s : delegationStorageType) : operation is 
block {

    // Get Satellite Treasury Address from the General Contracts Map on the Governance Contract
    const treasuryAddress : address = getContractAddressFromGovernanceContract("satelliteTreasury", s.governanceAddress, error_SATELLITE_TREASURY_CONTRACT_NOT_FOUND);

    // Get Doorman Contract Address from the General Contracts Map on the Governance Contract
    const doormanAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    // Send the rewards from the Satellite Treasury Contract to the Doorman Contract
    const transferParam : transferActionType = list[
        record [
            to_   = doormanAddress;
            amount = totalReward;
            token = (Fa2 (record [
                    tokenContractAddress = s.mvkTokenAddress;
                    tokenId              = 0n;
                ]) : tokenType
            );                
        ]
    ];

    const distributeSatelliteRewardsOperation: operation = Tezos.transaction(
        transferParam,
        0tez,
        sendTransferOperationToTreasury(treasuryAddress)
    );

} with distributeSatelliteRewardsOperation



// helper function for delegate to satellite operation
function delegateToSatelliteOperation(const delegateToSatelliteParams : delegateToSatelliteType) : operation is 
block {

    const delegateToSatelliteOperation : operation = Tezos.transaction(
        (delegateToSatelliteParams),
        0tez, 
        getDelegateToSatelliteEntrypoint(Tezos.get_self_address())
    );

} with delegateToSatelliteOperation



// helper function for delegate to satellite operation
function undelegateFromSatelliteOperation(const userAddress : address) : operation is 
block {

    const undelegateFromSatelliteOperation : operation = Tezos.transaction(
        (userAddress),
        0tez, 
        getUndelegateFromSatelliteEntrypoint(Tezos.get_self_address())
    );

} with undelegateFromSatelliteOperation

// ------------------------------------------------------------------------------
// Operations Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get the current governance cycle counter
function getCurrentCycleCounter(const s : delegationStorageType) : nat is 
block {

    const cycleCounterView : option (nat) = Tezos.call_view ("getCycleCounter", unit, s.governanceAddress);
    const currentCycle : nat = case cycleCounterView of [
            Some (_cycleCounter)   -> _cycleCounter
        |   None                   -> failwith (error_GET_CYCLE_COUNTER_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

} with currentCycle



// helper function to get satellite last snapshot
function getSatelliteLastSnapshot(const satelliteAddress : address; const s : delegationStorageType) : nat is 
block {

    const lastSnapshotOptView : option (option(nat)) = Tezos.call_view ("getSatelliteLastSnapshotOpt", satelliteAddress, s.governanceAddress);
    const satelliteLastSnapshotOpt: option(nat) = case lastSnapshotOptView of [
            Some (_cycleId) -> _cycleId
        |   None             -> failwith (error_GET_SATELLITE_LAST_SNAPSHOT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    const satelliteLastSnapshot : nat = case satelliteLastSnapshotOpt of [
            Some (_cycleId)    -> _cycleId
        |   None               -> failwith(error_SATELLITE_LAST_SNAPSHOT_NOT_FOUND)
    ];

} with satelliteLastSnapshot



// helper function to get satellite snapshot
function getSatelliteSnapshot(const governanceCycleIdAfterReference : nat; const currentGovernanceCycleId : nat; const satelliteAddress : address; const s : delegationStorageType) : governanceSatelliteSnapshotRecordType is
block {

    var snapshotOptView : option (option(governanceSatelliteSnapshotRecordType)) := Tezos.call_view ("getSnapshotOpt", (governanceCycleIdAfterReference, satelliteAddress), s.governanceAddress);
    var satelliteSnapshotOpt: option(governanceSatelliteSnapshotRecordType) := case snapshotOptView of [
            Some (_snapshotOpt) -> _snapshotOpt
        |   None                -> failwith (error_GET_SNAPSHOT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    const satelliteSnapshot : governanceSatelliteSnapshotRecordType = case satelliteSnapshotOpt of [
            Some (_snapshot)    -> _snapshot
        |   None                -> {
                
                const satelliteLastSnapshotCycleId : nat = getSatelliteLastSnapshot(satelliteAddress, s);
                
                // get snapshot of current governance cycle 
                snapshotOptView         := Tezos.call_view ("getSnapshotOpt", (currentGovernanceCycleId, satelliteAddress), s.governanceAddress);
                satelliteSnapshotOpt    := case snapshotOptView of [
                        Some (_snapshotOpt) -> _snapshotOpt
                    |   None                -> failwith (error_GET_SNAPSHOT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                const previousSatelliteSnapshot = case satelliteSnapshotOpt of [
                        Some (_snapshot)    -> _snapshot
                    |   None                -> failwith(error_SNAPSHOT_NOT_FOUND)
                ];

                // use satelliteLastSnapshotCycleId as final backup id
                const nextSnapshotId : nat = case previousSatelliteSnapshot.nextSnapshotId of [
                        Some(_v) -> _v
                    |   None -> satelliteLastSnapshotCycleId
                ];

                // get next snapshot following the current governance cycle id 
                // - N.B. this implementation accounts for any potential gaps between 
                //   governance cycles where the satellite snapshot was not created
                snapshotOptView         := Tezos.call_view ("getSnapshotOpt", (nextSnapshotId, satelliteAddress), s.governanceAddress);
                satelliteSnapshotOpt    := case snapshotOptView of [
                        Some (_snapshotOpt) -> _snapshotOpt
                    |   None                -> failwith (error_GET_SNAPSHOT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                const nextSatelliteSnapshot = case satelliteSnapshotOpt of [
                        Some (_snapshot)    -> _snapshot
                    |   None                -> failwith(error_SNAPSHOT_NOT_FOUND)
                ];

            } with nextSatelliteSnapshot
    ];

} with satelliteSnapshot




// helper function to get user staked mvk balance from Doorman contract
function getUserStakedMvkBalanceFromDoorman(const userAddress : address; const s : delegationStorageType) : nat is 
block {

    // Get Doorman Address from the General Contracts map on the Governance Contract
    const doormanAddress: address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    // get staked MVK balance of user from Doorman contract
    const getStakedBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
    const userStakedMvkBalance : nat = case getStakedBalanceView of [
            Some (_value) -> _value
        |   None          -> failwith(error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND)
    ];

} with userStakedMvkBalance



// verify number of satellites does not exceed max satellites allowed
function verifyMaxSatellitesAllowed(const s : delegationStorageType) : unit is
block {

    if s.satelliteCounter >= s.config.maxSatellites then failwith(error_MAXIMUM_AMOUNT_OF_SATELLITES_REACHED) else skip;

} with unit



// helper function to get a satellite's record
function getSatelliteRecord(const satelliteAddress : address; const s : delegationStorageType) : satelliteRecordType is 
block {

    const satelliteRecord : satelliteRecordType = case s.satelliteLedger[satelliteAddress] of [
            Some(_record) -> _record
        |   None          -> failwith(error_SATELLITE_NOT_FOUND)
    ];

} with satelliteRecord


// helper function to get a satellite's record or default to an empty record
function getOrDefaultSatelliteRecord(const satelliteAddress : address; const s : delegationStorageType) : satelliteRecordType is 
block {

    // Init empty satellite record - for type checking 
    const emptySatelliteRecord : satelliteRecordType = record [
        status                = "INACTIVE";        
        stakedMvkBalance      = 0n;
        satelliteFee          = 0n;
        totalDelegatedAmount  = 0n;
        
        name                  = "Empty Satellite";
        description           = "Empty Satellite";
        image                 = "";
        website               = "";

        registeredDateTime    = Tezos.get_now();

        oraclePublicKey       = ("edpku8CdxqUzHhL8X3fgpCX5CfmqxUU7JWBTmXwqUATt78dGijvqWd" : key); // random default public key
        oraclePeerId          = "peerId";
    ];


    const satelliteRecord : satelliteRecordType = case s.satelliteLedger[satelliteAddress] of [
            None          -> emptySatelliteRecord
        |   Some(_record) -> _record
    ];

} with satelliteRecord



// helper function to create a new satellite record
function createSatelliteRecord(const registerAsSatelliteParams : registerAsSatelliteParamsType; const s : delegationStorageType) : satelliteRecordType is 
block {

    // Init user address
    const userAddress : address  = Tezos.get_sender();

    // Get user's staked MVK balance from the Doorman Contract
    const userStakedMvkBalance : nat = getUserStakedMvkBalanceFromDoorman(userAddress, s);

    // Check if user's staked MVK balance has reached the minimum staked MVK amount required to be a satellite
    verifyGreaterThanOrEqual(userStakedMvkBalance, s.config.minimumStakedMvkBalance, error_MIN_STAKED_MVK_AMOUNT_NOT_REACHED);

    // Init new satellite record params
    const name          : string  = registerAsSatelliteParams.name;
    const description   : string  = registerAsSatelliteParams.description;
    const image         : string  = registerAsSatelliteParams.image;
    const website       : string  = registerAsSatelliteParams.website;
    const satelliteFee  : nat     = registerAsSatelliteParams.satelliteFee;

    const oraclePublicKey : key  = case registerAsSatelliteParams.oraclePublicKey of [
            Some(_key) -> _key
        |   None       -> ("edpku8CdxqUzHhL8X3fgpCX5CfmqxUU7JWBTmXwqUATt78dGijvqWd" : key)
    ];

    const oraclePeerId : string  = case registerAsSatelliteParams.oraclePeerId of [
            Some(_peerId) -> _peerId
        |   None          -> "peerId"
    ];

    // Validate inputs (max length not exceeded)
    validateStringLength(name           , s.config.satelliteNameMaxLength,          error_WRONG_INPUT_PROVIDED);
    validateStringLength(description    , s.config.satelliteDescriptionMaxLength,   error_WRONG_INPUT_PROVIDED);
    validateStringLength(image          , s.config.satelliteImageMaxLength,         error_WRONG_INPUT_PROVIDED);
    validateStringLength(website        , s.config.satelliteWebsiteMaxLength,       error_WRONG_INPUT_PROVIDED);
    
    // Validate satellite fee input not exceeding 100%
    verifyLessThanOrEqual(satelliteFee, 10000n, error_WRONG_INPUT_PROVIDED);

    // Create new satellite record
    const satelliteRecord : satelliteRecordType = case s.satelliteLedger[userAddress] of [
            Some (_satellite) -> (failwith(error_SATELLITE_ALREADY_EXISTS): satelliteRecordType)
        |   None -> record [            
                status                = "ACTIVE";
                stakedMvkBalance      = userStakedMvkBalance;
                satelliteFee          = satelliteFee;
                totalDelegatedAmount  = 0n;

                name                  = name;
                description           = description;
                image                 = image;
                website               = website;
                
                registeredDateTime    = Tezos.get_now();
                
                oraclePublicKey       = oraclePublicKey;
                oraclePeerId          = oraclePeerId;
            ]
    ];

} with satelliteRecord



// helper function to update a satellite record
function updateSatelliteRecord(const userAddress : address; const updateSatelliteRecordParams : updateSatelliteRecordType; const s : delegationStorageType) : satelliteRecordType is 
block {

    // Get satellite record
    var satelliteRecord : satelliteRecordType := getSatelliteRecord(userAddress, s);

    const name          : string  = updateSatelliteRecordParams.name;
    const description   : string  = updateSatelliteRecordParams.description;
    const image         : string  = updateSatelliteRecordParams.image;
    const website       : string  = updateSatelliteRecordParams.website;
    const satelliteFee  : nat     = updateSatelliteRecordParams.satelliteFee;

    const oraclePublicKey : key  = case updateSatelliteRecordParams.oraclePublicKey of [
            Some(_key) -> _key
        |   None       -> ("edpku8CdxqUzHhL8X3fgpCX5CfmqxUU7JWBTmXwqUATt78dGijvqWd" : key)
    ];

    const oraclePeerId : string  = case updateSatelliteRecordParams.oraclePeerId of [
            Some(_peerId) -> _peerId
        |   None          -> "peerId"
    ];

    // Validate inputs (max length not exceeded)
    validateStringLength(name           , s.config.satelliteNameMaxLength,          error_WRONG_INPUT_PROVIDED);
    validateStringLength(description    , s.config.satelliteDescriptionMaxLength,   error_WRONG_INPUT_PROVIDED);
    validateStringLength(image          , s.config.satelliteImageMaxLength,         error_WRONG_INPUT_PROVIDED);
    validateStringLength(website        , s.config.satelliteWebsiteMaxLength,       error_WRONG_INPUT_PROVIDED);
    
    // Validate satellite fee input not exceeding 100%
    if satelliteFee > 10000n then failwith(error_WRONG_INPUT_PROVIDED) else skip;

    // Update satellite record 
    satelliteRecord.name                := name;         
    satelliteRecord.description         := description;  
    satelliteRecord.image               := image;
    satelliteRecord.website             := website;
    satelliteRecord.satelliteFee        := satelliteFee;        

    satelliteRecord.oraclePublicKey     := oraclePublicKey;        
    satelliteRecord.oraclePeerId        := oraclePeerId;        

} with satelliteRecord



// helper function to get satellite rewards record
function getSatelliteRewardsRecord(const userAddress : address; const s : delegationStorageType; const errorCode : nat) : satelliteRewardsType is 
block {

    const satelliteRewardsRecord : satelliteRewardsType = case s.satelliteRewardsLedger[userAddress] of [
            Some (_record) -> _record
        |   None           -> failwith(errorCode)
    ];

} with satelliteRewardsRecord



// helper function to get or create satellite rewards record
function getOrCreateSatelliteRewardsRecord(const userAddress : address; const s : delegationStorageType) : satelliteRewardsType is 
block {

    const currentGovernanceCycleId : nat = getCurrentCycleCounter(s);

    const satelliteRewardsRecord : satelliteRewardsType = case s.satelliteRewardsLedger[userAddress] of [
            Some (_rewardsRecord) -> _rewardsRecord
        |   None -> record [
                unpaid                                  = 0n;
                paid                                    = 0n;
                participationRewardsPerShare            = 0n;
                satelliteAccumulatedRewardsPerShare     = 0n;
                satelliteReferenceAddress               = userAddress;
                referenceGovernanceCycleId              = currentGovernanceCycleId;
                tracked                                 = False;
            ]
    ];

} with satelliteRewardsRecord



// helper function to get or create delegate's satellite rewards record
function getOrCreateUpdatedDelegateRewardsRecord(const userAddress : address; const satelliteAddress : address; const satelliteAccumulatedRewardsPerShare : nat; const s : delegationStorageType) : satelliteRewardsType is 
block {

    const currentGovernanceCycleId : nat = getCurrentCycleCounter(s);

    // Get the user reward record or create a new one
    var delegateRewardsRecord : satelliteRewardsType    := case s.satelliteRewardsLedger[userAddress] of [
            Some (_rewardsRecord) -> _rewardsRecord
        |   None -> record [
                unpaid                                  = 0n;
                paid                                    = 0n;
                participationRewardsPerShare            = satelliteAccumulatedRewardsPerShare;
                satelliteAccumulatedRewardsPerShare     = satelliteAccumulatedRewardsPerShare;
                satelliteReferenceAddress               = satelliteAddress;
                referenceGovernanceCycleId              = currentGovernanceCycleId;
                tracked                                 = False;
            ]
    ];

    // If the user's satellite changed, update the reward record
    if delegateRewardsRecord.satelliteReferenceAddress =/= satelliteAddress then {
        delegateRewardsRecord.participationRewardsPerShare          := satelliteAccumulatedRewardsPerShare;
        delegateRewardsRecord.satelliteAccumulatedRewardsPerShare   := satelliteAccumulatedRewardsPerShare;
        delegateRewardsRecord.satelliteReferenceAddress             := satelliteAddress;
        delegateRewardsRecord.referenceGovernanceCycleId            := currentGovernanceCycleId;
        delegateRewardsRecord.tracked                               := False;
    }

} with delegateRewardsRecord



// helper function to get user's delegate record
function getDelegateRecord(const userAddress : address; const s : delegationStorageType) : delegateRecordType is 
block {
    
    const delegateRecord : delegateRecordType = case s.delegateLedger[userAddress] of [
            Some(_delegateRecord) -> _delegateRecord
        |   None                  -> failwith(error_DELEGATE_NOT_FOUND) 
    ];

} with delegateRecord



// helper function to create new delegate record
function createDelegateRecord(const satelliteAddress : address; const satelliteRegisteredDateTime : timestamp; const stakedMvkBalance : nat) : delegateRecordType is 
block {

    const delegateRecord : delegateRecordType = record [
        satelliteAddress              = satelliteAddress;
        satelliteRegisteredDateTime   = satelliteRegisteredDateTime;
        delegatedDateTime             = Tezos.get_now();
        delegatedStakedMvkBalance     = stakedMvkBalance;
    ];

} with delegateRecord

// ------------------------------------------------------------------------------
// General Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Snapshot Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check if satellite snapshot exists
function createSatelliteSnapshotCheck(const currentCycle : nat; const satelliteAddress : address; const s : delegationStorageType) : bool is
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



// helper function to update satellite snapshot
function updateSatellitesSnapshotOperation(const satelliteAddresses : list(address); const ready : bool; const s : delegationStorageType) : operation is 
block {

    // Prepare the satellites to update
    var satellitesSnapshots : updateSatellitesSnapshotType   := list[];

    for satelliteAddress in list satelliteAddresses block {

        // Get the satellite record
        const satelliteRecord   : satelliteRecordType  = getSatelliteRecord(satelliteAddress, s);
        const satelliteRewards  : satelliteRewardsType = getOrCreateSatelliteRewardsRecord(satelliteAddress, s);

        // Create a snapshot
        const satelliteSnapshot : updateSatelliteSingleSnapshotType  = record[
            satelliteAddress            = satelliteAddress;
            totalStakedMvkBalance       = satelliteRecord.stakedMvkBalance;
            totalDelegatedAmount        = satelliteRecord.totalDelegatedAmount;
            ready                       = ready;
            delegationRatio             = s.config.delegationRatio;
            accumulatedRewardsPerShare  = satelliteRewards.satelliteAccumulatedRewardsPerShare;
        ];

        // Add the snapshot to the list
        satellitesSnapshots := satelliteSnapshot # satellitesSnapshots;

    };

    // Send the snapshot to the governance contract
    const updateSatellitesSnapshotOperation : operation   = Tezos.transaction(
        (satellitesSnapshots),
        0tez, 
        sendUpdateSatellitesSnapshotOperationToGovernance(s.governanceAddress)
    );

} with updateSatellitesSnapshotOperation



// helper function to refresh a satellite governance snapshot
function updateGovernanceSnapshot (const satelliteAddresses : list(address); const ready : bool; var operations : list(operation); const s : delegationStorageType) : list(operation) is
block {

    // Get the current round 
    const currentCycle : nat                = getCurrentCycleCounter(s);

    // Init parameters
    var satellitesToUpdate : list(address)  := list[];

    // Create snapshot for each satellite provided
    for satelliteAddress in list satelliteAddresses block {
 
        // Check if satellite snapshot exists in the current governance cycle
        const createSatelliteSnapshotCheck : bool = createSatelliteSnapshotCheck(currentCycle, satelliteAddress, s);

        // Create satellite snapshot if it does not exist in the current governance cycle
        if createSatelliteSnapshotCheck and Big_map.mem(satelliteAddress, s.satelliteLedger) then{
            satellitesToUpdate  := satelliteAddress # satellitesToUpdate;
        } else skip;

    };

    // Update the satellites snapshot
    if List.size(satellitesToUpdate) > 0n then {
        const updateSatellitesSnapshotOperation : operation = updateSatellitesSnapshotOperation(satellitesToUpdate, ready, s);
        operations := updateSatellitesSnapshotOperation # operations;
    }

} with operations

// ------------------------------------------------------------------------------
// Snapshot Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Rewards Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to update rewards
function updateRewards(const userAddress : address; var s : delegationStorageType) : delegationStorageType is
block{

        // Steps Overview:
        // 1. Check if user is recorded in the Satellite Rewards Ledger
        // 2. Get Doorman Contract Address from the General Contracts Map on the Governance Contract
        // 3. Get user's staked MVK balance from the Doorman Contract
        // 4. Get satellite rewards record of satellite that user is delegated to (for reference)
        // 5. Calculate satellite unclaimed rewards
        //    - calculate rewards ratio: difference between satellite's accumulatedRewardsPerShare and user's current participationRewardsPerShare
        //    - user's satellite rewards is equal to his staked MVK balance multiplied by rewards ratio
        // 6. Update user's satellite rewards record 
        //    - set participationRewardsPerShare to satellite's accumulatedRewardsPerShare
        //    - increment user's unpaid rewards by the calculated rewards

        // Check if user is recorded in the Satellite Rewards Ledger
        if Big_map.mem(userAddress, s.satelliteRewardsLedger) then {

            // Get user's rewards record
            var userRewardsRecord : satelliteRewardsType := getSatelliteRewardsRecord(userAddress, s, error_SATELLITE_REWARDS_NOT_FOUND);
            const satelliteReferenceAddress : address = userRewardsRecord.satelliteReferenceAddress;

            // Get user's staked MVK balance from the Doorman Contract
            const stakedMvkBalance : nat = getUserStakedMvkBalanceFromDoorman(userAddress, s);

            // Get satellite rewards record of satellite that user is delegated to
            const satelliteReferenceRewardsRecord : satelliteRewardsType = getSatelliteRewardsRecord(satelliteReferenceAddress, s, error_REFERENCE_SATELLITE_REWARDS_RECORD_NOT_FOUND);

            // if user rewards is already tracked (user participationRewardsPerShare is correct)
            if userRewardsRecord.tracked = True then block {

                // Calculate satellite unclaimed rewards
                // - calculate rewards ratio: difference between satellite's accumulatedRewardsPerShare and user's current participationRewardsPerShare
                // - user's satellite rewards is equal to his staked MVK balance multiplied by rewards ratio
                
                const satelliteRewardsRatio : nat  = abs(satelliteReferenceRewardsRecord.satelliteAccumulatedRewardsPerShare - userRewardsRecord.participationRewardsPerShare);
                const satelliteRewards : nat       = (stakedMvkBalance * satelliteRewardsRatio) / fixedPointAccuracy;

                // Update user's satellite rewards record 
                // - set participationRewardsPerShare to satellite's accumulatedRewardsPerShare
                // - increment user's unpaid rewards by the calculated rewards

                userRewardsRecord.participationRewardsPerShare    := satelliteReferenceRewardsRecord.satelliteAccumulatedRewardsPerShare;
                userRewardsRecord.unpaid                          := userRewardsRecord.unpaid + satelliteRewards;
                s.satelliteRewardsLedger[userAddress]             := userRewardsRecord;
            
            } else block {

                // check if user is able to earn rewards by comparing governance cycle of when user delegated

                const currentGovernanceCycleId    : nat = getCurrentCycleCounter(s);
                const referenceGovernanceCycleId  : nat = userRewardsRecord.referenceGovernanceCycleId;

                // user cannot earn rewards in the same governance cycle that he delegated to a satellite
                if currentGovernanceCycleId = referenceGovernanceCycleId then skip else block {

                    // user can start to earn rewards, and will accrue rewards from the start of the next governance cycle after he delegated

                    // get satellite snapshot of next governance cycle after reference 
                    const governanceCycleIdAfterReference : nat = referenceGovernanceCycleId + 1n;
                    const satelliteSnapshot : governanceSatelliteSnapshotRecordType = getSatelliteSnapshot(governanceCycleIdAfterReference, currentGovernanceCycleId, satelliteReferenceAddress, s);
                    
                    // get satellite's accumulated rewards per share at this instance, which will be equivalent to user's participation rewards per share
                    const initialParticipationRewardsPerShare : nat = satelliteSnapshot.accumulatedRewardsPerShare;

                    // Calculate satellite unclaimed rewards
                    const satelliteRewardsRatio : nat  = abs(satelliteReferenceRewardsRecord.satelliteAccumulatedRewardsPerShare - initialParticipationRewardsPerShare);
                    const satelliteRewards : nat       = (stakedMvkBalance * satelliteRewardsRatio) / fixedPointAccuracy;

                    // Update user's satellite rewards record 
                    userRewardsRecord.participationRewardsPerShare    := satelliteReferenceRewardsRecord.satelliteAccumulatedRewardsPerShare;
                    userRewardsRecord.unpaid                          := userRewardsRecord.unpaid + satelliteRewards;
                    userRewardsRecord.tracked                         := True;                // set tracked to True since referenceGovernanceCycleId has been used
                    s.satelliteRewardsLedger[userAddress]             := userRewardsRecord;

                };

            }

        } else skip;

  } with(s)

// ------------------------------------------------------------------------------
// Rewards Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const delegationLambdaAction : delegationLambdaActionType; var s : delegationStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(delegationUnpackLambdaFunctionType)) of [
            Some(f) -> f(delegationLambdaAction, s)
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