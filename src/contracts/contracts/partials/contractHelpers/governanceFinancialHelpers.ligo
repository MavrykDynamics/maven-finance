// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders : Admin, Governance Satellite Contract
function verifySenderIsAdminOrGovernanceSatelliteContract(var s : governanceFinancialStorageType) : unit is
block{
    
    const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[s.admin; governanceSatelliteAddress], error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED)

} with unit



// Allowed Senders : Council Contract
function verifySenderIsCouncilContract(var s : governanceFinancialStorageType) : unit is
block{

  const councilAddress : address = getContractAddressFromGovernanceContract("council", s.governanceAddress, error_COUNCIL_CONTRACT_NOT_FOUND);
  verifySenderIsAllowed(set[councilAddress], error_ONLY_COUNCIL_CONTRACT_ALLOWED)

} with unit



// helper function to validate a financial request (not dropped, executed, or expired)
function validateFinancialRequest(const financialRequestRecord : financialRequestRecordType) : unit is
block {

    // Check if financial request has been dropped
    if financialRequestRecord.status = False then failwith(error_FINANCIAL_REQUEST_DROPPED)  else skip;

    // Check if financial request has already been executed
    if financialRequestRecord.executed = True  then failwith(error_FINANCIAL_REQUEST_EXECUTED) else skip;

    // Check if financial request has expired
    if Tezos.get_now() > financialRequestRecord.expiryDateTime then failwith(error_FINANCIAL_REQUEST_EXPIRED) else skip;

} with (unit)



// helper function to validate token type (FA12, FA2, TEZ)
function validateTokenType(const tokenType : string) : unit is 
block {

    if tokenType = "FA12" or tokenType = "FA2" or tokenType = "TEZ" 
    then skip
    else failwith(error_WRONG_TOKEN_TYPE_PROVIDED);

} with unit



// helper function to validate a whitelisted token
function validateWhitelistedToken(const tokenType : string; const tokenContractAddress : address; const s : governanceFinancialStorageType) : unit is
block {
    
    // fail if token type is not tez, and not whitelisted 
    if tokenType =/= "TEZ" and not checkInWhitelistTokenContracts(tokenContractAddress, s.whitelistTokenContracts) 
    then failwith(error_TOKEN_NOT_WHITELISTED) 
    else skip;

} with unit



// verify that satellite is not suspended or banned
function verifySatelliteIsNotSuspendedOrBanned(const satelliteAddress : address; const s : governanceFinancialStorageType) : unit is 
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

// helper function to set baker for treasury
function setTreasuryBaker(const contractAddress : address) : contract(setBakerType) is
    case (Tezos.get_entrypoint_opt(
        "%setBaker",
        contractAddress) : option(contract(setBakerType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_BAKER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(setBakerType))
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
// General Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get the current governance cycle counter
function getCurrentCycleCounter(const s : governanceFinancialStorageType) : nat is 
block {

    // Get the current governance cycle counter from the governance contract
    const cycleCounterView : option (nat) = Tezos.call_view ("getCycleCounter", unit, s.governanceAddress);
    const currentCycle : nat = case cycleCounterView of [
            Some (_cycleCounter)   -> _cycleCounter
        |   None                   -> failwith (error_GET_CYCLE_COUNTER_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

} with currentCycle



// helper function to get financial request
function getFinancialRequest(const financialRequestId : nat; const s : governanceFinancialStorageType) : financialRequestRecordType is 
block {
    
    const financialRequest : financialRequestRecordType = case s.financialRequestLedger[financialRequestId] of [
            Some(_request) -> _request
        |   None           -> failwith(error_FINANCIAL_REQUEST_NOT_FOUND)
    ];
    
} with financialRequest



// helper function to get staked mvk snapshot total supply based on the current governance cycle 
function getStakedMvkSnapshotTotalSupply(const currentCycleId : nat; const s : governanceFinancialStorageType) : nat is 
block {

    const getStakedMvkSnapshotOptView : option(option(nat)) = Tezos.call_view ("getStakedMvkSnapshotOpt", currentCycleId, s.governanceAddress);

    const stakedMvkSnapshotView : option(nat) = case getStakedMvkSnapshotOptView of [
            Some (_view)  -> _view
        |   None          -> failwith(error_GET_STAKED_MVK_SNAPSHOT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    const stakedMvkTotalSupply : nat = case stakedMvkSnapshotView of [
            Some(_value) -> _value
        |   None         -> failwith(error_STAKED_MVK_SNAPSHOT_FOR_CYCLE_NOT_FOUND)
    ];

} with stakedMvkTotalSupply 



// Helper function to create a governance financial request
function createGovernanceFinancialRequest(
    const requestType           : string; 
    const treasuryAddress       : address; 
    const tokenContractAddress  : address; 
    const tokenAmount           : tokenBalanceType; 
    const tokenName             : string; 
    const tokenType             : string; 
    const tokenId               : tokenIdType; 
    const keyHash               : option(key_hash); 
    const purpose               : string; 
    var s                       : governanceFinancialStorageType
) : governanceFinancialStorageType is
block{

    // ------------------------------------------------------------------
    // Snapshot Staked MVK Total Supply
    // ------------------------------------------------------------------
    
    // Get the current cycle from the governance contract
    const currentCycleId : nat = getCurrentCycleCounter(s);

    // Take snapshot of current total staked MVK supply 
    const snapshotStakedMvkTotalSupply : nat = getStakedMvkSnapshotTotalSupply(currentCycleId, s);

    // Calculate staked MVK votes required for approval based on config's financial request approval percentage
    const stakedMvkRequiredForApproval : nat = abs((snapshotStakedMvkTotalSupply * s.config.approvalPercentage) / 10000);

    // ------------------------------------------------------------------
    // Validation Checks 
    // ------------------------------------------------------------------

    if requestType = "TRANSFER" or requestType = "MINT" then  block {

        // Validate token type : has to match one standard (FA12, FA2, TEZ)
        validateTokenType(tokenType);

        // If token, validate that token is whitelisted (security measure to prevent interacting with potentially malicious contracts)
        validateWhitelistedToken(tokenType, tokenContractAddress, s);

    } else skip;

    // ------------------------------------------------------------------
    // Create new Financial Request Record
    // ------------------------------------------------------------------

    // Create new financial request record
    var newFinancialRequest : financialRequestRecordType := record [

        requesterAddress                    = Tezos.get_sender();
        requestType                         = requestType;
        status                              = True;                  // status : True - "ACTIVE", False - "INACTIVE/DROPPED"
        executed                            = False;

        treasuryAddress                     = treasuryAddress;
        tokenContractAddress                = tokenContractAddress;
        tokenAmount                         = tokenAmount;
        tokenName                           = tokenName; 
        tokenType                           = tokenType;
        tokenId                             = tokenId;
        requestPurpose                      = purpose;
        keyHash                             = keyHash;

        yayVoteStakedMvkTotal               = 0n;
        nayVoteStakedMvkTotal               = 0n;
        passVoteStakedMvkTotal              = 0n;

        governanceCycleId                   = currentCycleId;
        snapshotStakedMvkTotalSupply        = snapshotStakedMvkTotalSupply;
        stakedMvkPercentageForApproval      = s.config.approvalPercentage; 
        stakedMvkRequiredForApproval        = stakedMvkRequiredForApproval; 

        requestedDateTime                   = Tezos.get_now();
        expiryDateTime                      = Tezos.get_now() + (86_400 * s.config.financialRequestDurationInDays);
        executedDateTime                    = None;

    ];

    // ------------------------------------------------------------------
    // Update Storage
    // ------------------------------------------------------------------

    // Get current financial request counter
    const financialRequestId : nat = s.financialRequestCounter;

    // Save request to financial request ledger
    s.financialRequestLedger[financialRequestId] := newFinancialRequest;

    // Increment financial request counter
    s.financialRequestCounter := financialRequestId + 1n;

} with (s)




// helper function to format token transfer type
function formatTokenTransferType(const financialRequestRecord : financialRequestRecordType) : tokenType is 
block {

    // init token transfer type to tez
    var tokenTransferType : tokenType := Tez;

    // set to FA12 or FA2 token type depending on request record's token type
    if  financialRequestRecord.tokenType = "FA12" 
    then block {
        tokenTransferType := (Fa12(financialRequestRecord.tokenContractAddress) : tokenType);
    } 
    else skip;

    if  financialRequestRecord.tokenType = "FA2" 
    then block {
        tokenTransferType := (Fa2(record [
            tokenContractAddress  = financialRequestRecord.tokenContractAddress;
            tokenId               = financialRequestRecord.tokenId;
        ]) : tokenType); 
    } 
    else skip;

} with tokenTransferType

// ------------------------------------------------------------------------------
// General Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Operations Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to transfer from treasury to council
function transferFromTreasuryToCouncilOperation(const financialRequestRecord : financialRequestRecordType; const s : governanceFinancialStorageType) : operation is 
block {

    // Get Treasury Contract from params
    const treasuryAddress : address = financialRequestRecord.treasuryAddress;

    // Get Council Contract address from the General Contracts Map on the Governance Contract
    const councilAddress : address = getContractAddressFromGovernanceContract("council", s.governanceAddress, error_COUNCIL_CONTRACT_NOT_FOUND);

    // Format token type
    const tokenTransferType : tokenType = formatTokenTransferType(financialRequestRecord);

    // Create transfer params and operation
    const transferParams : transferActionType = list [
        record [
            to_        = councilAddress;
            token      = tokenTransferType;
            amount     = financialRequestRecord.tokenAmount;
        ]
    ];

    const transferFromTreasuryToCouncilOperation : operation = Tezos.transaction(
        transferParams, 
        0tez, 
        sendTransferOperationToTreasury(treasuryAddress)
    );

} with transferFromTreasuryToCouncilOperation



// helper function to mint MVK from treasury and transfer operation
function mintMvkAndTransferOperation(const financialRequestRecord : financialRequestRecordType; const s : governanceFinancialStorageType) : operation is
block {

    // Get Treasury Contract from params
    const treasuryAddress : address = financialRequestRecord.treasuryAddress;

    // Get Council Contract address from the General Contracts Map on the Governance Contract
    const councilAddress : address = getContractAddressFromGovernanceContract("council", s.governanceAddress, error_COUNCIL_CONTRACT_NOT_FOUND);

    // Create mint operation
    const mintMvkAndTransferTokenParams : mintMvkAndTransferType = record [
        to_  = councilAddress;
        amt  = financialRequestRecord.tokenAmount;
    ];

    const mintMvkAndTransferOperation : operation = Tezos.transaction(
        mintMvkAndTransferTokenParams, 
        0tez, 
        sendMintMvkAndTransferOperationToTreasury(treasuryAddress)
    );

} with mintMvkAndTransferOperation



// helper function to set contract baker operation
function setContractBakerOperation(const financialRequestRecord : financialRequestRecordType) : operation is
block {

    const keyHash : option(key_hash) = financialRequestRecord.keyHash;
    const setContractBakerOperation : operation = Tezos.transaction(
        keyHash, 
        0tez, 
        setTreasuryBaker(financialRequestRecord.treasuryAddress)
    );

} with setContractBakerOperation

// ------------------------------------------------------------------------------
// Operations Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vote Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to remove previous vote
function removePreviousVote(var financialRequestRecord : financialRequestRecordType; const financialRequestId : nat; const totalVotingPower : nat; var s : governanceFinancialStorageType) : financialRequestRecordType is 
block {

    case s.financialRequestVoters[(financialRequestId, Tezos.get_sender())] of [
                    
            Some (_voteType) -> case _voteType of [

                    Yay(_v)   ->    if totalVotingPower > financialRequestRecord.yayVoteStakedMvkTotal 
                                    then failwith(error_CALCULATION_ERROR) 
                                    else financialRequestRecord.yayVoteStakedMvkTotal := abs(financialRequestRecord.yayVoteStakedMvkTotal - totalVotingPower)

                |   Nay(_v)   ->    if totalVotingPower > financialRequestRecord.nayVoteStakedMvkTotal 
                                    then failwith(error_CALCULATION_ERROR) 
                                    else financialRequestRecord.nayVoteStakedMvkTotal := abs(financialRequestRecord.nayVoteStakedMvkTotal - totalVotingPower)

                |   Pass(_v)  ->    if totalVotingPower > financialRequestRecord.passVoteStakedMvkTotal 
                                    then failwith(error_CALCULATION_ERROR) 
                                    else financialRequestRecord.passVoteStakedMvkTotal := abs(financialRequestRecord.passVoteStakedMvkTotal - totalVotingPower)                    
            ]

        |   None -> skip

    ];

} with financialRequestRecord



// helper function to compute new vote
function computeNewVote(var financialRequestRecord : financialRequestRecordType; const voteType : voteType; const totalVotingPower : nat) : financialRequestRecordType is 
block {

    // compute new vote totals
    case voteType of [

            Yay(_v) -> block {                
                financialRequestRecord.yayVoteStakedMvkTotal := financialRequestRecord.yayVoteStakedMvkTotal + totalVotingPower;
            }

        |   Nay(_v) -> block {
                financialRequestRecord.nayVoteStakedMvkTotal := financialRequestRecord.nayVoteStakedMvkTotal + totalVotingPower;
            }

        |   Pass(_v) -> block {
                financialRequestRecord.passVoteStakedMvkTotal := financialRequestRecord.passVoteStakedMvkTotal + totalVotingPower;
            }
    ];

} with financialRequestRecord



// helper function to check if sufficient yay votes have been gathered
function sufficientYayVotesGathered(const financialRequestRecord : financialRequestRecordType) : bool is
block {

    // init bool as False
    var sufficientYayVotesGatheredBool : bool := False;
    
    // set bool to true if yayVotes are sufficient (greater than staked MVK required)
    if financialRequestRecord.yayVoteStakedMvkTotal > financialRequestRecord.stakedMvkRequiredForApproval 
    then sufficientYayVotesGatheredBool := True 
    else sufficientYayVotesGatheredBool := False;

} with sufficientYayVotesGatheredBool



// helper function to execute a financial governance request during the vote
function executeFinancialRequest(const financialRequestRecord : financialRequestRecordType; var operations : list(operation); const s : governanceFinancialStorageType) : list(operation) is
block {

    // If token is specified, validate that token is whitelisted (security measure to prevent interacting with potentially malicious contracts)
    validateWhitelistedToken(financialRequestRecord.tokenType, financialRequestRecord.tokenContractAddress, s);

    if financialRequestRecord.requestType = "TRANSFER"           then operations := transferFromTreasuryToCouncilOperation(financialRequestRecord, s) # operations; 

    if financialRequestRecord.requestType = "MINT"               then operations := mintMvkAndTransferOperation(financialRequestRecord, s) # operations;

    if financialRequestRecord.requestType = "SET_CONTRACT_BAKER" then operations := setContractBakerOperation(financialRequestRecord) # operations;

} with operations

// ------------------------------------------------------------------------------
// Vote Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Snapshot Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get satellite record view from the delegation contract
function getSatelliteRecord(const satelliteAddress : address; const s : governanceFinancialStorageType) : satelliteRecordType is 
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
function getSatelliteRewardsRecord(const satelliteAddress : address; const s : governanceFinancialStorageType) : satelliteRewardsType is 
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
function getDelegationRatio(const s : governanceFinancialStorageType) : nat is 
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
function createSatelliteSnapshotCheck(const currentCycle : nat; const satelliteAddress : address; const s : governanceFinancialStorageType) : bool is
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
function getSatelliteTotalVotingPower(const currentCycle : nat; const satelliteAddress : address; const s : governanceFinancialStorageType) : nat is
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
function updateSatellitesSnapshotOperation(const satelliteAddresses : list(address); const ready : bool; const s : governanceFinancialStorageType) : operation is 
block {

    // Prepare the satellites to update
    var satellitesSnapshots : updateSatellitesSnapshotType   := list[];

    for satelliteAddress in list satelliteAddresses block {

        // Get the satellite record and delgation ratio
        const satelliteRecord   : satelliteRecordType   = getSatelliteRecord(satelliteAddress, s);
        const satelliteRewards  : satelliteRewardsType  = getSatelliteRewardsRecord(satelliteAddress, s);
        const delegationRatio   : nat                   = getDelegationRatio(s);

        // Create a snapshot
        const satelliteSnapshot : updateSatelliteSingleSnapshotType  = record[
            satelliteAddress            = satelliteAddress;
            totalStakedMvkBalance       = satelliteRecord.stakedMvkBalance;
            totalDelegatedAmount        = satelliteRecord.totalDelegatedAmount;
            ready                       = ready;
            delegationRatio             = delegationRatio;
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



// helper function to verify that satellite snapshot is ready
function verifySatelliteSnapshotIsReady(const currentCycle : nat; const satelliteAddress : address; const s : governanceFinancialStorageType) : unit is
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
function calculateVotingPower(const satelliteAddress : address; const s : governanceFinancialStorageType) : nat is
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
function getTotalVotingPowerAndUpdateSnapshot(const satelliteAddress : address; const requestGovernanceCycleId : nat; var operations : list(operation); const s : governanceFinancialStorageType): (nat * list(operation)) is 
block{

    // Get the current cycle from the governance contract at time of voting to check if the snapshot is up to date
    const currentCycle : nat = getCurrentCycleCounter(s);

    // Check if a snapshot needs to be created (if satellite snapshot does not exist for given governance cycle)
    const createSatelliteSnapshotCheck : bool = createSatelliteSnapshotCheck(requestGovernanceCycleId, satelliteAddress, s);

    // Get the total voting power from the snapshot (default 0 if snapshot has not been created)
    var totalVotingPower : nat := getSatelliteTotalVotingPower(requestGovernanceCycleId, satelliteAddress, s);

    // Create snapshot if it does not exist, verify snapshot is ready if it exists
    if createSatelliteSnapshotCheck then{

        // check if current governance cycle matches with governance cycle of financial request
        if currentCycle = requestGovernanceCycleId then block {
            
            // update satellite snapshot operation
            const updateSatellitesSnapshotOperation : operation = updateSatellitesSnapshotOperation(list[satelliteAddress], True, s);
            operations := updateSatellitesSnapshotOperation # operations;

            // Calculate and set the total voting power of the satellite
            totalVotingPower := calculateVotingPower(satelliteAddress, s);
        
        } else skip;

    } 
    // Check if satellite is ready to vote
    else {
        
        // Verify that satellite snapshot is ready
        verifySatelliteSnapshotIsReady(requestGovernanceCycleId, satelliteAddress, s);

    }

} with (totalVotingPower, operations)

// ------------------------------------------------------------------------------
// Governance Snapshot Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(governanceUnpackLambdaFunctionType)) of [
            Some(f) -> f(governanceFinancialLambdaAction, s)
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