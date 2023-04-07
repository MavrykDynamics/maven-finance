// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Admin, Governance Satellite Contract
function verifySenderIsAdminOrGovernanceSatelliteContract(var s : emergencyGovernanceStorageType) : unit is
block{

    const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[s.admin; governanceSatelliteAddress], error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED)

} with unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to %breakGlass entrypoint on specified contract
function triggerBreakGlass(const contractAddress : address) : contract(unit) is
    case (Tezos.get_entrypoint_opt("%breakGlass", contractAddress) : option(contract(unit))) of [
            Some(contr) -> contr
        |   None        -> (failwith(error_BREAK_GLASS_ENTRYPOINT_NOT_FOUND) : contract(unit))
    ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get staked mvk balance of user
function getUserStakedMvkBalance(const userAddress : address; const s : emergencyGovernanceStorageType) : nat is 
block {

    // Get Doorman Contract Address from the General Contracts Map on the Governance Contract
    const doormanAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    const stakedMvkBalanceView : option (nat) = Tezos.call_view ("getStakedBalance", userAddress, doormanAddress);
    const stakedMvkBalance: nat = case stakedMvkBalanceView of [
            Some (value) -> value
        |   None         -> (failwith (error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND) : nat)
    ];

} with stakedMvkBalance 



// helper function to get staked mvk total supply (equivalent to balance of the Doorman contract on the MVK Token contract)
function getStakedMvkTotalSupply(const s : emergencyGovernanceStorageType) : nat is 
block {

    // Get Doorman Contract Address from the General Contracts Map on the Governance Contract
    const doormanAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    const getBalanceView : option (nat) = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
    const stakedMvkTotalSupply: nat = case getBalanceView of [
            Some (value) -> value
        |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
    ];

} with stakedMvkTotalSupply 



// helper function to verify there is no active emergency governance ongoing
function verifyNoActiveEmergencyGovernance(const s : emergencyGovernanceStorageType) : unit is 
block {

    verifyIsZero(s.currentEmergencyGovernanceId, error_EMERGENCY_GOVERNANCE_ALREADY_IN_THE_PROCESS);

} with unit



// helper function to verify there is an active emergency governance ongoing
function verifyOngoingActiveEmergencyGovernance(const s : emergencyGovernanceStorageType) : unit is 
block {
    
    verifyIsNotZero(s.currentEmergencyGovernanceId, error_EMERGENCY_GOVERNANCE_NOT_IN_THE_PROCESS);

} with unit



// helper function to verify emergency governance has not been executed
function verifyEmergencyGovernanceNotExecuted(const emergencyGovernanceRecord : emergencyGovernanceRecordType) : unit is
block {

    if emergencyGovernanceRecord.executed = True then failwith(error_EMERGENCY_GOVERNANCE_EXECUTED)
    else skip; 

} with unit



// helper function to verify emergency governance has not been dropped
function verifyEmergencyGovernanceNotDropped(const emergencyGovernanceRecord : emergencyGovernanceRecordType) : unit is
block {

    if emergencyGovernanceRecord.dropped = True then failwith(error_EMERGENCY_GOVERNANCE_DROPPED)
    else skip; 

} with unit



// helper function to verify sender is proposal of emergency governance
function verifySenderIsProposer(const emergencyGovernanceRecord : emergencyGovernanceRecordType) : unit is
block {

    if emergencyGovernanceRecord.proposerAddress =/= Tezos.get_sender() then failwith(error_ONLY_PROPOSER_ALLOWED)
    else skip;

} with unit



// helper function to verify correct fee is sent
function verifyCorrectFee(const s : emergencyGovernanceStorageType) : unit is 
block {

    if Tezos.get_amount() =/= s.config.requiredFeeMutez 
    then failwith(error_INCORRECT_TEZ_FEE) 
    else skip;

} with unit



// helper function to verify staked mvk is sufficient to trigger emergency governance
function verifySufficientBalanceToTrigger(const stakedMvkBalance : nat; const s : emergencyGovernanceStorageType) : unit is 
block {

    verifyGreaterThanOrEqual(stakedMvkBalance, s.config.minStakedMvkRequiredToTrigger, error_MIN_STAKED_MVK_AMOUNT_NOT_REACHED);

} with unit



// helper function to verify staked mvk is sufficient to vote for emergency governance
function verifySufficientBalanceToVote(const stakedMvkBalance : nat; const s : emergencyGovernanceStorageType) : unit is 
block {

    verifyGreaterThanOrEqual(stakedMvkBalance, s.config.minStakedMvkRequiredToVote, error_MIN_STAKED_MVK_AMOUNT_NOT_REACHED);

} with unit



// helper function to verify user has not voted for emergency governance
function verifyUserHasNotVoted(const userAddress : address; const emergencyGovernanceRecord : emergencyGovernanceRecordType) : unit is 
block {

    if not Map.mem(userAddress, emergencyGovernanceRecord.voters) then skip else failwith(error_EMERGENCY_GOVERNANCE_VOTE_ALEADY_REGISTERED);

} with unit



// helper function to get emergency governance
function getCurrentEmergencyGovernance(const s : emergencyGovernanceStorageType) : emergencyGovernanceRecordType is
block {

    const emergencyGovernanceRecord : emergencyGovernanceRecordType = case s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] of [ 
            None          -> failwith(error_EMERGENCY_GOVERNANCE_NOT_FOUND)
        |   Some(_record) -> _record
    ];

} with emergencyGovernanceRecord



// helper function to create new emergency governance
function createEmergencyGovernance(const userAddress : address; const title : string; const description : string; const stakedMvkRequiredForBreakGlass : nat; const s : emergencyGovernanceStorageType) : emergencyGovernanceRecordType is
block {

    // Init empty voters map
    const emptyVotersMap : voterMapType = map[];

    // Create new emergency governance record
    const newEmergencyGovernanceRecord : emergencyGovernanceRecordType = record [
        proposerAddress                  = userAddress;
        executed                         = False;
        dropped                          = False;

        title                            = title;
        description                      = description; 
        voters                           = emptyVotersMap;
        totalStakedMvkVotes              = 0n;
        stakedMvkPercentageRequired      = s.config.stakedMvkPercentageRequired;  // capture state of min required staked MVK vote percentage (e.g. 5% - as min required votes may change over time)
        stakedMvkRequiredForBreakGlass   = stakedMvkRequiredForBreakGlass;

        startDateTime                    = Tezos.get_now();
        startLevel                       = Tezos.get_level();             
        executedDateTime                 = zeroTimestamp;
        executedLevel                    = 0n;
        expirationDateTime               = Tezos.get_now() + (86_400 * s.config.voteExpiryDays);
    ];

} with newEmergencyGovernanceRecord

// ------------------------------------------------------------------------------
// General Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Operation Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function for triggerBreakGlass in the break glass contract
function triggerBreakGlassOperation(const s : emergencyGovernanceStorageType) : operation is 
block {

    // Get Break Glass Contract Address from the General Contracts Map on the Governance Contract
    const breakGlassContractAddress : address = getContractAddressFromGovernanceContract("breakGlass", s.governanceAddress, error_BREAK_GLASS_CONTRACT_NOT_FOUND);

    const triggerBreakGlassOperation : operation = Tezos.transaction(
        unit,
        0tez, 
        triggerBreakGlass(breakGlassContractAddress)
    );

} with triggerBreakGlassOperation



// helper function for triggerBreakGlass in the governance contract
function triggerGovernanceBreakGlassOperation(const s : emergencyGovernanceStorageType) : operation is 
block {

    const governanceAddress : address = s.governanceAddress;

    const triggerGovernanceBreakGlassOperation : operation = Tezos.transaction(
        unit,
        0tez, 
        triggerBreakGlass(governanceAddress)
    );

} with triggerGovernanceBreakGlassOperation



// helper function to transfer fee to treasury
function transferFeeToTreasuryOperation(const s : emergencyGovernanceStorageType) : operation is 
block {

    // Get Tax Treasury Contract Address from the General Contracts Map on the Governance Contract
    const treasuryAddress : address = getContractAddressFromGovernanceContract("taxTreasury", s.governanceAddress, error_TAX_TREASURY_CONTRACT_NOT_FOUND);

    // Transfer fee to Treasury
    const treasuryContract : contract(unit) = Tezos.get_contract_with_error(treasuryAddress, "Error. Contract not found at given address");
    const transferFeeToTreasuryOperation : operation = transferTez(treasuryContract, Tezos.get_amount());

} with transferFeeToTreasuryOperation

// ------------------------------------------------------------------------------
// Operation Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const emergencyGovernanceLambdaAction : emergencyGovernanceLambdaActionType; var s : emergencyGovernanceStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(emergencyGovernanceUnpackLambdaFunctionType)) of [
            Some(f) -> f(emergencyGovernanceLambdaAction, s)
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