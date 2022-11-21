// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Admin, Governance Contract
function checkSenderIsAllowed(var s : delegationStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



// Allowed Senders: Admin
function checkSenderIsAdmin(var s : delegationStorageType) : unit is
    if (Tezos.get_sender() = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



// Allowed Senders: Self
function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.get_sender() = Tezos.get_self_address()) then unit
    else failwith(error_ONLY_SELF_ALLOWED);



// verify that sender is self or specified user
function verifySenderIsSelfOrUser(const userAddress : address) : unit is
block {

    if Tezos.get_sender() = userAddress or Tezos.get_sender() = Tezos.get_self_address() then skip 
    else failwith(error_ONLY_SELF_OR_SENDER_ALLOWED);

} with unit



// Allowed Senders: Doorman Contract
function checkSenderIsDoormanContract(var s : delegationStorageType) : unit is
block{

    const doormanAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    if (Tezos.get_sender() = doormanAddress) then skip
    else failwith(error_ONLY_DOORMAN_CONTRACT_ALLOWED);

} with unit



// Allowed Senders: Governance Contract 
function checkSenderIsGovernanceContract(var s : delegationStorageType) : unit is
block{
    
    const governanceAddress : address = s.governanceAddress;
    
    if (Tezos.get_sender() = governanceAddress) then skip
    else failwith(error_ONLY_GOVERNANCE_CONTRACT_ALLOWED);

} with unit



// Allowed Senders: Admin, Governance Satellite Contract
function checkSenderIsAdminOrGovernanceSatelliteContract(var s : delegationStorageType) : unit is
block{
        
    if Tezos.get_sender() = s.admin then skip
    else {

        const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);

        if Tezos.get_sender() = governanceSatelliteAddress then skip
        else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED);
    }

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



// helper function to verify first value is less than second value
function verifyLessThan(const firstValue : nat; const secondValue : nat; const errorCode : nat) : unit is
block {

    if firstValue > secondValue then failwith(errorCode)
    else skip;

} with unit




// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if (Tezos.get_amount() = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check that the %delegateToSatellite entrypoint is not paused
function checkDelegateToSatelliteIsNotPaused(var s : delegationStorageType) : unit is
    if s.breakGlassConfig.delegateToSatelliteIsPaused then failwith(error_DELEGATE_TO_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED)
    else unit;

    

// helper function to check that the %undelegateFromSatellite entrypoint is not paused
function checkUndelegateFromSatelliteIsNotPaused(var s : delegationStorageType) : unit is
    if s.breakGlassConfig.undelegateFromSatelliteIsPaused then failwith(error_UNDELEGATE_FROM_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %registerAsSatellite entrypoint is not paused
function checkRegisterAsSatelliteIsNotPaused(var s : delegationStorageType) : unit is
    if s.breakGlassConfig.registerAsSatelliteIsPaused then failwith(error_REGISTER_AS_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %unregisterAsSatellite entrypoint is not paused
function checkUnregisterAsSatelliteIsNotPaused(var s : delegationStorageType) : unit is
    if s.breakGlassConfig.unregisterAsSatelliteIsPaused then failwith(error_UNREGISTER_AS_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %updateSatelliteRecord entrypoint is not paused
function checkUpdateSatelliteRecordIsNotPaused(var s : delegationStorageType) : unit is
    if s.breakGlassConfig.updateSatelliteRecordIsPaused then failwith(error_UPDATE_SATELLITE_RECORD_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %distributeReward entrypoint is not paused
function checkDistributeRewardIsNotPaused(var s : delegationStorageType) : unit is
    if s.breakGlassConfig.distributeRewardIsPaused then failwith(error_DISTRIBUTE_REWARD_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED)
    else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
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



// helper function to %transfer entrypoint on a Treasury contract
function sendTransferOperationToTreasury(const contractAddress : address) : contract(transferActionType) is
    case (Tezos.get_entrypoint_opt(
        "%transfer",
        contractAddress) : option(contract(transferActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(transferActionType))
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

    const satelliteRecord: satelliteRecordType = case s.satelliteLedger[satelliteAddress] of [
            Some(_record) -> _record
        |   None          -> failwith(error_SATELLITE_NOT_FOUND)
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
    if userStakedMvkBalance < s.config.minimumStakedMvkBalance then failwith(error_SMVK_ACCESS_AMOUNT_NOT_REACHED)
    else skip;

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
    if satelliteFee > 10000n then failwith(error_WRONG_INPUT_PROVIDED) else skip;

    // Create new satellite record
    const satelliteRecord : satelliteRecordType = record [            
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
function getSatelliteRewardsRecord(const userAddress : address; const errorCode : nat; const s : delegationStorageType) : satelliteRewardsType is 
block {

    const satelliteRewardsRecord : satelliteRewardsType = case s.satelliteRewardsLedger[userAddress] of [
            Some (_record) -> _record
        |   None           -> failwith(errorCode)
    ];

} with satelliteRewardsRecord



// helper function to get or create satellite rewards record
function getOrCreateSatelliteRewardsRecord(const userAddress : address; const s : delegationStorageType) : satelliteRewardsType is 
block {

    const satelliteRewardsRecord : satelliteRewardsType = case s.satelliteRewardsLedger[userAddress] of [
            Some (_rewardsRecord) -> _rewardsRecord
        |   None -> record [
                unpaid                                      = 0n;
                paid                                        = 0n;
                participationRewardsPerShare                = 0n;
                satelliteAccumulatedRewardsPerShare         = 0n;
                satelliteReferenceAddress                   = userAddress
            ]
    ];

} with satelliteRewardsRecord



// helper function to get or create delegate's satellite rewards record
function getOrCreateDelegateRewardsRecord(const userAddress : address; const satelliteAddress : address; const satelliteAccumulatedRewardsPerShare : nat; const s : delegationStorageType) : satelliteRewardsType is 
block {

    const delegateRewardsRecord : satelliteRewardsType = case s.satelliteRewardsLedger[userAddress] of [
            Some (_rewardsRecord) -> _rewardsRecord
        |   None -> record [
                unpaid                                      = 0n;
                paid                                        = 0n;
                participationRewardsPerShare                = satelliteAccumulatedRewardsPerShare;
                satelliteAccumulatedRewardsPerShare         = satelliteAccumulatedRewardsPerShare;
                satelliteReferenceAddress                   = satelliteAddress;
            ]
    ];

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
function createDelegateRecord(const satelliteAddress : address; const stakedMvkBalance : nat) : delegateRecordType is 
block {

    const delegateRecord : delegateRecordType = record [
        satelliteAddress              = satelliteAddress;
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

// helper function to get the current governance cycle counter
function getCurrentCycleCounter(const s : delegationStorageType) : nat is 
block {

    const cycleCounterView : option (nat) = Tezos.call_view ("getCycleCounter", unit, s.governanceAddress);
    const currentCycle : nat = case cycleCounterView of [
            Some (_cycleCounter)   -> _cycleCounter
        |   None                   -> failwith (error_GET_CYCLE_COUNTER_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

} with currentCycle



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
function updateSatelliteSnapshotOperation(const satelliteAddress : address; const ready : bool; const s : delegationStorageType) : operation is 
block {

    // Get the satellite record
    const satelliteRecord : satelliteRecordType = getSatelliteRecord(satelliteAddress, s);

    // Create a snapshot
    const satelliteSnapshotParams : updateSatelliteSnapshotType  = record[
        satelliteAddress    = satelliteAddress;
        satelliteRecord     = satelliteRecord;
        ready               = ready;
        delegationRatio     = s.config.delegationRatio;
    ];

    // Send the snapshot to the governance contract
    const updateSatelliteSnapshotOperation : operation   = Tezos.transaction(
        (satelliteSnapshotParams),
        0tez, 
        sendUpdateSatelliteSnapshotOperationToGovernance(s.governanceAddress)
    );

} with updateSatelliteSnapshotOperation



// helper function to refresh a satellite governance snapshot
function updateGovernanceSnapshot (const satelliteAddress : address; const ready : bool; var operations : list(operation); const s : delegationStorageType) : list(operation) is
block {

    // Get the current round 
    const currentCycle : nat = getCurrentCycleCounter(s);

    // Check if satellite snapshot exists in the current governance cycle
    const createSatelliteSnapshot : bool = createSatelliteSnapshotCheck(currentCycle, satelliteAddress, s);

    // Create satellite snapshot if it does not exist in the current governance cycle
    if createSatelliteSnapshot and Big_map.mem(satelliteAddress, s.satelliteLedger) then{

        const updateSatelliteSnapshotOperation : operation = updateSatelliteSnapshotOperation(satelliteAddress, ready, s);
        operations := updateSatelliteSnapshotOperation # operations;

    } else skip;

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

            // Get user's satellite rewards record
            var satelliteRewardsRecord : satelliteRewardsType := getSatelliteRewardsRecord(userAddress, error_SATELLITE_REWARDS_NOT_FOUND, s);

            // Get user's staked MVK balance from the Doorman Contract
            const stakedMvkBalance : nat = getUserStakedMvkBalanceFromDoorman(userAddress, s);

            // Get satellite rewards record of satellite that user is delegated to
            const satelliteReferenceRewardsRecord : satelliteRewardsType = getSatelliteRewardsRecord(satelliteRewardsRecord.satelliteReferenceAddress, error_REFERENCE_SATELLITE_REWARDS_RECORD_NOT_FOUND, s);

            // Calculate satellite unclaimed rewards
            // - calculate rewards ratio: difference between satellite's accumulatedRewardsPerShare and user's current participationRewardsPerShare
            // - user's satellite rewards is equal to his staked MVK balance multiplied by rewards ratio
            
            const satelliteRewardsRatio : nat  = abs(satelliteReferenceRewardsRecord.satelliteAccumulatedRewardsPerShare - satelliteRewardsRecord.participationRewardsPerShare);
            const satelliteRewards : nat       = (stakedMvkBalance * satelliteRewardsRatio) / fixedPointAccuracy;

            // Update user's satellite rewards record 
            // - set participationRewardsPerShare to satellite's accumulatedRewardsPerShare
            // - increment user's unpaid rewards by the calculated rewards

            satelliteRewardsRecord.participationRewardsPerShare    := satelliteReferenceRewardsRecord.satelliteAccumulatedRewardsPerShare;
            satelliteRewardsRecord.unpaid                          := satelliteRewardsRecord.unpaid + satelliteRewards;
            s.satelliteRewardsLedger[userAddress]                  := satelliteRewardsRecord;

        } else skip;

  } with(s)

// ------------------------------------------------------------------------------
// Rewards Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get lambda bytes
function getLambdaBytes(const lambdaKey : string; const s : delegationStorageType) : bytes is 
block {
    
    // get lambda bytes from lambda ledger
    const lambdaBytes : bytes = case s.lambdaLedger[lambdaKey] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

} with lambdaBytes



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