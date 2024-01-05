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
    case (Mavryk.get_entrypoint_opt("%breakGlass", contractAddress) : option(contract(unit))) of [
            Some(contr) -> contr
        |   None        -> (failwith(error_BREAK_GLASS_ENTRYPOINT_NOT_FOUND) : contract(unit))
    ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get staked mvn balance of user
function getUserStakedMvnBalance(const userAddress : address; const s : emergencyGovernanceStorageType) : nat is 
block {

    // Get Doorman Contract Address from the General Contracts Map on the Governance Contract
    const doormanAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    const stakedMvnBalanceView : option (nat) = Mavryk.call_view ("getStakedBalance", userAddress, doormanAddress);
    const stakedMvnBalance: nat = case stakedMvnBalanceView of [
            Some (value) -> value
        |   None         -> (failwith (error_GET_STAKED_BALANCE_VIEW_IN_DOORMAN_CONTRACT_NOT_FOUND) : nat)
    ];

} with stakedMvnBalance 



// helper function to get staked mvn total supply (equivalent to balance of the Doorman contract on the MVN Token contract)
function getStakedMvnTotalSupply(const s : emergencyGovernanceStorageType) : nat is 
block {

    // Get Doorman Contract Address from the General Contracts Map on the Governance Contract
    const doormanAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    const getBalanceView : option (nat) = Mavryk.call_view ("get_balance", (doormanAddress, 0n), s.mvnTokenAddress);
    const stakedMvnTotalSupply: nat = case getBalanceView of [
            Some (value) -> value
        |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVN_TOKEN_CONTRACT_NOT_FOUND) : nat)
    ];

} with stakedMvnTotalSupply 



// helper function to get emergency governance
function getCurrentEmergencyGovernance(const s : emergencyGovernanceStorageType) : emergencyGovernanceRecordType is
block {

    const emergencyGovernanceRecord : emergencyGovernanceRecordType = case s.emergencyGovernanceLedger[s.currentEmergencyGovernanceId] of [ 
            None          -> failwith(error_EMERGENCY_GOVERNANCE_NOT_FOUND)
        |   Some(_record) -> _record
    ];

} with emergencyGovernanceRecord



// helper function to verify there is no active emergency governance ongoing
function verifyNoActiveEmergencyGovernance(const s : emergencyGovernanceStorageType) : unit is 
block {

    if s.currentEmergencyGovernanceId = 0n then skip 
    else {
        const emergencyGovernance : emergencyGovernanceRecordType = getCurrentEmergencyGovernance(s);        
        
        if Mavryk.get_now() < emergencyGovernance.expirationDateTime 
        then failwith(error_EMERGENCY_GOVERNANCE_ALREADY_IN_THE_PROCESS) 
        else skip;
    };

} with unit



// helper function to verify there is an active emergency governance ongoing
function verifyOngoingActiveEmergencyGovernance(const s : emergencyGovernanceStorageType) : unit is 
block {

    if s.currentEmergencyGovernanceId =/= 0n then  {
        const emergencyGovernance : emergencyGovernanceRecordType = getCurrentEmergencyGovernance(s);        
        
        if Mavryk.get_now() > emergencyGovernance.expirationDateTime 
        then failwith(error_EMERGENCY_GOVERNANCE_EXPIRED) 
        else skip;
    
    } else failwith(error_EMERGENCY_GOVERNANCE_NOT_IN_THE_PROCESS)

} with unit



// helper function to verify emergency governance has not been executed
function verifyEmergencyGovernanceNotExecuted(const emergencyGovernanceRecord : emergencyGovernanceRecordType) : unit is
block {

    if emergencyGovernanceRecord.executed = True then failwith(error_EMERGENCY_GOVERNANCE_EXECUTED)
    else skip; 

} with unit



// helper function to verify sender is proposal of emergency governance
function verifySenderIsProposer(const emergencyGovernanceRecord : emergencyGovernanceRecordType) : unit is
block {

    if emergencyGovernanceRecord.proposerAddress =/= Mavryk.get_sender() then failwith(error_ONLY_PROPOSER_ALLOWED)
    else skip;

} with unit



// helper function to verify correct fee is sent
function verifyCorrectFee(const s : emergencyGovernanceStorageType) : unit is 
block {

    if Mavryk.get_amount() =/= s.config.requiredFeeMumav 
    then failwith(error_INCORRECT_TEZ_FEE) 
    else skip;

} with unit



// helper function to verify staked mvn is sufficient to trigger emergency governance
function verifySufficientBalanceToTrigger(const stakedMvnBalance : nat; const s : emergencyGovernanceStorageType) : unit is 
block {

    verifyGreaterThanOrEqual(stakedMvnBalance, s.config.minStakedMvnRequiredToTrigger, error_MIN_STAKED_MVN_AMOUNT_NOT_REACHED);

} with unit



// helper function to verify staked mvn is sufficient to vote for emergency governance
function verifySufficientBalanceToVote(const stakedMvnBalance : nat; const s : emergencyGovernanceStorageType) : unit is 
block {

    verifyGreaterThanOrEqual(stakedMvnBalance, s.config.minStakedMvnRequiredToVote, error_MIN_STAKED_MVN_AMOUNT_NOT_REACHED);

} with unit



// helper function to verify user has not voted for emergency governance
function verifyUserHasNotVoted(const userAddress : address; const emergencyGovernanceRecordId : actionIdType; const s : emergencyGovernanceStorageType) : unit is 
block {

    if not Big_map.mem((emergencyGovernanceRecordId, userAddress), s.emergencyGovernanceVoters) then skip else failwith(error_EMERGENCY_GOVERNANCE_VOTE_ALEADY_REGISTERED);

} with unit



// helper function to create new emergency governance
function createEmergencyGovernance(const userAddress : address; const title : string; const description : string; const stakedMvnRequiredForBreakGlass : nat; const s : emergencyGovernanceStorageType) : emergencyGovernanceRecordType is
block {

    // Create new emergency governance record
    const newEmergencyGovernanceRecord : emergencyGovernanceRecordType = record [
        proposerAddress                  = userAddress;
        executed                         = False;

        title                            = title;
        description                      = description; 
        totalStakedMvnVotes              = 0n;
        stakedMvnPercentageRequired      = s.config.stakedMvnPercentageRequired;  // capture state of min required staked MVN vote percentage (e.g. 5% - as min required votes may change over time)
        stakedMvnRequiredForBreakGlass   = stakedMvnRequiredForBreakGlass;

        startDateTime                    = Mavryk.get_now();
        startLevel                       = Mavryk.get_level();             
        executedDateTime                 = None;
        executedLevel                    = None;
        expirationDateTime               = Mavryk.get_now() + (60 * s.config.durationInMinutes);
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

    const triggerBreakGlassOperation : operation = Mavryk.transaction(
        unit,
        0mav, 
        triggerBreakGlass(breakGlassContractAddress)
    );

} with triggerBreakGlassOperation



// helper function for triggerBreakGlass in the governance contract
function triggerGovernanceBreakGlassOperation(const s : emergencyGovernanceStorageType) : operation is 
block {

    const governanceAddress : address = s.governanceAddress;

    const triggerGovernanceBreakGlassOperation : operation = Mavryk.transaction(
        unit,
        0mav, 
        triggerBreakGlass(governanceAddress)
    );

} with triggerGovernanceBreakGlassOperation



// helper function to transfer fee to treasury
function transferFeeToTreasuryOperation(const s : emergencyGovernanceStorageType) : operation is 
block {

    // Get Tax Treasury Contract Address from the General Contracts Map on the Governance Contract
    const treasuryAddress : address = getContractAddressFromGovernanceContract("taxTreasury", s.governanceAddress, error_TAX_TREASURY_CONTRACT_NOT_FOUND);

    // Transfer fee to Treasury
    const treasuryContract : contract(unit) = Mavryk.get_contract_with_error(treasuryAddress, "Error. Contract not found at given address");
    const transferFeeToTreasuryOperation : operation = transferTez(treasuryContract, Mavryk.get_amount());

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