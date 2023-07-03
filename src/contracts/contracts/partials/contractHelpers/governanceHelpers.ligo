// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Essential Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get contract address from general contracts map
function getAddressFromGeneralContracts(const contractName : string; const s : governanceStorageType; const errorCode : nat) : address is 
block {

    const contractAddress : address = case s.generalContracts[contractName] of [
            Some(_address) -> _address
        |   None           -> failwith(errorCode)
    ];

} with contractAddress

// ------------------------------------------------------------------------------
// Essential Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders : Admin, Governance Satellite Contract
function verifySenderIsAdminOrGovernanceSatelliteContract(var s : governanceStorageType) : unit is
block{

    const governanceSatelliteAddress : address = getAddressFromGeneralContracts("governanceSatellite", s, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[s.admin; governanceSatelliteAddress], error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED)

} with unit



// Allowed Senders : Admin, Whitelisted Contract
function verifySenderIsWhitelistedOrAdmin(var s : governanceStorageType) : unit is
block {

    if (Tezos.get_sender() = s.admin) or checkInWhitelistContracts(Tezos.get_sender(), s.whitelistContracts) 
    then skip
    else failwith(error_ONLY_ADMINISTRATOR_OR_WHITELISTED_ADDRESSES_ALLOWED);

} with unit



// helper function to verify given admin address is valid
function verifyValidAdminAddress(const newAdminAddress : address; const s : governanceStorageType) : unit is 
block {

    // Check if the new admin address is the Break Glass contract
    const breakGlassAddress : address = getAddressFromGeneralContracts("breakGlass", s, error_BREAK_GLASS_CONTRACT_NOT_FOUND);

    if Set.mem(newAdminAddress, s.whitelistDevelopers) or newAdminAddress = s.governanceProxyAddress or newAdminAddress = breakGlassAddress then skip 
    else failwith(error_ONLY_BREAK_GLASS_CONTRACT_OR_DEVELOPERS_OR_PROXY_CONTRACT_ALLOWED)

} with unit



// Allowed Senders : Self
function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.get_sender() = Tezos.get_self_address()) 
    then unit
    else failwith(error_ONLY_SELF_ALLOWED);



// Allowed Senders : Emergency Governance Contract
function verifySenderIsEmergencyGovernanceContract(var s : governanceStorageType) : unit is
block{

    // Get emergency governance address from general contracts
    const emergencyGovernanceAddress : address = getAddressFromGeneralContracts("emergencyGovernance", s, error_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[emergencyGovernanceAddress], error_ONLY_EMERGENCY_GOVERNANCE_CONTRACT_ALLOWED)

} with unit



// helper function to verify timelock proposal exists
function verifyTimelockProposalExists(const proposalId : nat; const s : governanceStorageType) : unit is
block {

    // Check that there is a valid timelock proposal
    if s.timelockProposalId =/= proposalId
    then failwith(error_NO_PROPOSAL_TO_EXECUTE)
    else skip;

} with unit



// helper function to verify current round is a proposal round
function verifyIsProposalRound(const s : governanceStorageType) : unit is
block {

    if s.currentCycleInfo.round = (Proposal : roundType) 
    then skip
    else failwith(error_ONLY_ACCESSIBLE_DURING_PROPOSAL_ROUND);

} with unit



// helper function to verify current round is a voting round
function verifyIsVotingRound(const s : governanceStorageType) : unit is
block {

    if s.currentCycleInfo.round = (Voting : roundType) 
    then skip
    else failwith(error_ONLY_ACCESSIBLE_DURING_VOTING_ROUND);

} with unit



// helper function to verify round has not ended
function verifyRoundHasNotEnded(const s : governanceStorageType) : unit is
block {

    if Tezos.get_level() < s.currentCycleInfo.roundEndLevel
    then failwith(error_CURRENT_ROUND_NOT_FINISHED) 
    else skip;

} with unit



// helper function to verify cycle highest voted proposal exists
function verifyCycleHighestVotedProposalExists(const s : governanceStorageType) : unit is
block {

    if s.cycleHighestVotedProposalId = 0n then failwith(error_NO_PROPOSAL_TO_VOTE_FOR)
    else skip; 

} with unit



// helper function to verify correct submission fee was sent by user
function verifyCorrectSubmissionFee(const s : governanceStorageType) : unit is
block {

    if Tezos.get_amount() =/= s.config.proposalSubmissionFeeMutez 
    then failwith(error_INCORRECT_TEZ_FEE) 
    else skip;

} with unit
 


// helper function to verify proposal is not dropped
function verifyProposalNotDropped(const proposal : proposalRecordType) : unit is
block {
    
    if proposal.status = "DROPPED" 
    then failwith(error_PROPOSAL_DROPPED)
    else skip;

} with unit 



// helper function to verify proposal has not been executed
function verifyProposalNotExecuted(const proposal : proposalRecordType) : unit is
block {
    
    if proposal.executed 
    then failwith(error_PROPOSAL_EXECUTED)
    else skip;

} with unit 



// helper function to verify proposal has been executed
function verifyProposalExecuted(const proposal : proposalRecordType) : unit is
block {
    
    if proposal.executed 
    then skip
    else failwith(error_PROPOSAL_NOT_EXECUTED);

} with unit 



// helper function to verify proposal is locked
function verifyProposalIsLocked(const proposal : proposalRecordType) : unit is
block {
    
    if proposal.locked = False 
    then failwith(error_PROPOSAL_NOT_LOCKED)
    else skip;

} with unit 



// helper function to verify proposal is not locked
function verifyProposalIsNotLocked(const proposal : proposalRecordType) : unit is
block {
    
    if proposal.locked = True 
    then failwith(error_PROPOSAL_LOCKED)
    else skip;

} with unit 



// helper function to verify proposal exists in current cycle
function verifyProposalExistsInCurrentCycle(const proposalId : nat; const s : governanceStorageType) : unit is 
block {

    const verifyProposalExistsFlag : bool = Map.mem(proposalId, s.cycleProposals);
    if verifyProposalExistsFlag = False then failwith(error_PROPOSAL_NOT_FOUND)
    else skip;

} with unit



// helper function to verify sender is creator of proposal 
function verifySenderIsProposalCreator(const proposal : proposalRecordType) : unit is
block {
    
    if Tezos.get_sender() =/= proposal.proposerAddress 
    then failwith(error_ONLY_PROPOSER_ALLOWED)
    else skip;

} with unit 



// helper function to verify sender is self (governance contract) or creator of proposal 
function verifySenderIsSelfOrProposalCreator(const proposal : proposalRecordType) : unit is
block {
    
    if proposal.proposerAddress =/= Tezos.get_sender() and Tezos.get_self_address() =/= Tezos.get_sender() 
    then failwith(error_ONLY_PROPOSER_ALLOWED)
    else skip;

} with unit 



// helper function to verify proposal payments has not been processed
function verifyPaymentsNotProcessed(const proposal : proposalRecordType) : unit is
block {
    
    if proposal.paymentProcessed = True 
    then failwith(error_PROPOSAL_PAYMENTS_PROCESSED)
    else skip;

} with unit 



// helper function to verify at least one proposal data exists
function verifyAtLeastOneProposalData(const proposal : proposalRecordType) : unit is
block {

    if Map.size(proposal.proposalData) = 0n 
    then failwith(error_PROPOSAL_HAS_NO_DATA_TO_EXECUTE)
    else skip;

} with unit



// helper function to verify at least one payment data exists
function verifyAtLeastOnePaymentData(const proposal : proposalRecordType) : unit is
block {

    if Map.size(proposal.paymentData) = 0n 
    then failwith(error_PROPOSAL_HAS_NO_DATA_TO_EXECUTE)
    else skip;

} with unit



// helper function to verify proposal execution process has not started
function verifyProposalExecutionNotStarted(const proposal : proposalRecordType) : unit is
block {

    if proposal.proposalDataExecutionCounter > 0n 
    then failwith(error_PROPOSAL_EXECUTION_ALREADY_STARTED)
    else skip;

} with unit



// helper function to verify max proposals count per satellite not reached
function verifyMaxProposalsPerSatelliteNotReached(const satelliteProposals : set(nat); const s : governanceStorageType) : unit is
block {
    
    if s.config.maxProposalsPerSatellite > Set.cardinal(satelliteProposals) 
    then skip
    else failwith(error_MAX_PROPOSAL_REACHED);

} with unit



// helper function to verify satellite has sufficient staked MVK balance
function verifySatelliteHasSufficientStakedMvk(const totalStakedMvkBalance : nat; const minimumStakedMvkRequirement : nat) : unit is
block {

    if totalStakedMvkBalance < minimumStakedMvkRequirement 
    then failwith(error_MIN_STAKED_MVK_AMOUNT_NOT_REACHED)
    else skip;                 

} with unit



// helper function to verify that satellite has voted on the proposal
function verifySatelliteHasVotedForProposal(const satelliteAddress : address; const proposalId : actionIdType; const s : governanceStorageType) : unit is
block {
    
    if Big_map.mem((proposalId, satelliteAddress), s.proposalVoters) 
    then skip 
    else failwith(error_VOTE_NOT_FOUND);

} with unit



// helper function to verify that satellite has voted on the proposal
function verifyRewardNotClaimed(const satelliteAddress : address; const proposalId : nat; const s : governanceStorageType) : unit is
block {

    // Make satelliteRewardProposalKey
    const satelliteRewardProposalKey : (actionIdType * address) = (proposalId, satelliteAddress);

    // Check if satelliteRewardProposalKey exists in proposal rewards
    if Big_map.mem(satelliteRewardProposalKey, s.proposalRewards) 
    then failwith(error_PROPOSAL_REWARD_ALREADY_CLAIMED) 
    else skip;

} with unit



// helper function to verify that reward is ready to be claimed
function verifyRewardReadyToBeClaimed(const proposalRecord : proposalRecordType) : unit is
block {

    if proposalRecord.rewardClaimReady 
    then skip 
    else failwith(error_PROPOSAL_REWARD_CANNOT_BE_CLAIMED);

} with unit



// helper function to verify glass is broken
function verifyGlassBroken(const s : governanceStorageType) : unit is
block {

    // Get Break Glass Contract address from the general contracts map
    const breakGlassAddress : address = getAddressFromGeneralContracts("breakGlass", s, error_BREAK_GLASS_CONTRACT_NOT_FOUND);

    // Check if glass is broken on the Break Glass Contract
    const glassBrokenView : option (bool) = Tezos.call_view ("getGlassBroken", unit, breakGlassAddress);
    const glassBroken : bool = case glassBrokenView of [
            Some (_glassBroken) -> _glassBroken
        |   None                -> failwith (error_GET_GLASS_BROKEN_VIEW_IN_BREAK_GLASS_CONTRACT_NOT_FOUND)
    ];

    if glassBroken then skip else failwith(error_GLASS_NOT_BROKEN);

} with unit



// verify that satellite is not suspended or banned
function verifySatelliteIsNotSuspendedOrBanned(const satelliteAddress : address; const s : governanceStorageType) : unit is 
block {

    const delegationAddress : address = getAddressFromGeneralContracts("delegation", s, error_DELEGATION_CONTRACT_NOT_FOUND);
    checkSatelliteStatus(satelliteAddress, delegationAddress, True, True);

} with unit



// helper function to verify proposal can be executed
function verifyProposalCanBeExecuted(const s : governanceStorageType) : unit is
block {

    // Check that current round is not Timelock Round or Voting Round (in the event proposal was executed before timelock round started)
    if (s.currentCycleInfo.round = (Timelock : roundType) and Tezos.get_sender() =/= Tezos.get_self_address()) or s.currentCycleInfo.round = (Voting : roundType) 
    then failwith(error_PROPOSAL_CANNOT_BE_EXECUTED_NOW)
    else skip;

} with unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to %setAdmin entrypoint on a specified contract
function getSetAdminEntrypoint(const contractAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%setAdmin",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_ADMIN_ENTRYPOINT_NOT_FOUND) : contract(address))
        ];



// helper function to %setGovernance entrypoint on a specified contract
function getSetGovernanceEntrypoint(const contractAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%setGovernance",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_GOVERNANCE_ENTRYPOINT_NOT_FOUND) : contract(address))
        ];


      
// helper function to %executeGovernanceAction entrypoint on the Governance Proxy Contract
function getExecuteGovernanceActionEntrypoint(const contractAddress : address) : contract(bytes) is
    case (Tezos.get_entrypoint_opt(
        "%executeGovernanceAction",
        contractAddress) : option(contract(bytes))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_EXECUTE_GOVERNANCE_ACTION_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND) : contract(bytes))
        ];



// helper function to %executeProposal entrypoint on the Governance Contract
function getExecuteProposalEntrypoint(const contractAddress : address) : contract(actionIdType) is
    case (Tezos.get_entrypoint_opt(
        "%executeProposal",
        contractAddress) : option(contract(actionIdType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_EXECUTE_PROPOSAL_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(actionIdType))
        ];



// helper function to %updateProposalData entrypoint on the Governance Contract
function getUpdateProposalDataEntrypoint(const contractAddress : address) : contract(updateProposalType) is
    case (Tezos.get_entrypoint_opt(
        "%updateProposalData",
        contractAddress) : option(contract(updateProposalType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_ADD_UPDATE_PROPOSAL_DATA_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(updateProposalType))
        ];



// helper function to %distributeRewards entrypoint on the Delegation Contract
function getDistributeRewardEntrypoint(const contractAddress : address) : contract(set(address) * nat) is
    case (Tezos.get_entrypoint_opt(
        "%distributeReward",
        contractAddress) : option(contract(set(address) * nat))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_DISTRIBUTE_REWARD_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(set(address) * nat))
        ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Operations Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to set contract admin operation
function setContractAdminOperation(const setContractAdminParams : setContractAdminType) : operation is 
block {

    const setContractAdminOperation : operation = Tezos.transaction(
        (setContractAdminParams.newContractAdmin), 
        0tez, 
        getSetAdminEntrypoint(setContractAdminParams.targetContractAddress)
    )

} with setContractAdminOperation



// helper function to set contract governance operation
function setContractGovernanceOperation(const setContractGovernanceParams : setContractGovernanceType) : operation is 
block {

    const setContractGovernanceOperation : operation = Tezos.transaction(
        (setContractGovernanceParams.newContractGovernance), 
        0tez, 
        getSetGovernanceEntrypoint(setContractGovernanceParams.targetContractAddress)
    )

} with setContractGovernanceOperation



// helper function to update proposal's data
function updateProposalDataOperation(const proposalId : nat; const newProposal : newProposalType) : operation is 
block {

    const updateProposalDataParams : updateProposalType = record[
        proposalId      = proposalId;
        proposalData    = newProposal.proposalData;
        paymentData     = newProposal.paymentData;
    ];

    // Create operation
    const updateProposalDataOperation : operation = Tezos.transaction(
        updateProposalDataParams,
        0tez, 
        getUpdateProposalDataEntrypoint(Tezos.get_self_address())
    );

} with updateProposalDataOperation



// helper function for processing proposal payment operation
function processProposalPaymentOperation(const paymentsData : list(transferDestinationType); const s : governanceStorageType) : operation is 
block {

    const treasuryAddress : address = getAddressFromGeneralContracts("paymentTreasury", s, error_PAYMENT_TREASURY_CONTRACT_NOT_FOUND);

    // Create operation of paymentsData transfers
    const processProposalPaymentOperation : operation = Tezos.transaction(
        paymentsData,
        0tez,
        sendTransferOperationToTreasury(treasuryAddress)
    );

} with processProposalPaymentOperation



// helper function for distributing reward operation
function distributeRewardOperation(const claimSatellites : set(address); const rewardAmount : nat; const s : governanceStorageType) : operation is
block {

    // Get Delegation Contract address from the general contracts map
    const delegationAddress : address = getAddressFromGeneralContracts("delegation", s, error_DELEGATION_CONTRACT_NOT_FOUND);

    const distributeRewardOperation : operation = Tezos.transaction(
        (claimSatellites, rewardAmount), 
        0tez, 
        getDistributeRewardEntrypoint(delegationAddress)
    );

} with distributeRewardOperation 



// helper function to create execute governance action operation to the governance proxy contract
function executeGovernanceActionOperation(const dataBytes : bytes; const s : governanceStorageType) : operation is
block {

    const executeGovernanceActionOperation : operation = Tezos.transaction(
        dataBytes, 
        0tez, 
        getExecuteGovernanceActionEntrypoint(s.governanceProxyAddress)
    );

} with executeGovernanceActionOperation



// helper function to set admin on specified contract if the %setAdmin entrypoint exists
function setAdminIfExistOperation(const contractAddress : address; var operations : list(operation); const s : governanceStorageType) : list(operation) is 
block {

    // Get Break Glass Contract address from the general contracts map
    const breakGlassAddress : address = getAddressFromGeneralContracts("breakGlass", s, error_BREAK_GLASS_CONTRACT_NOT_FOUND);

    case (Tezos.get_entrypoint_opt("%setAdmin", contractAddress) : option(contract(address))) of [
            Some(contr) -> operations := Tezos.transaction(breakGlassAddress, 0tez, contr) # operations
        |   None        -> skip
    ];

} with operations




// helper function to pause all entrypoints on specified contract if the %pauseAll entrypoint exists
function pauseAllIfExistOperation(const contractAddress : address; var operations : list(operation)) : list(operation) is 
block {

    case (Tezos.get_entrypoint_opt("%pauseAll", contractAddress) : option(contract(unit))) of [
            Some(contr) -> operations := Tezos.transaction(unit, 0tez, contr) # operations
        |   None        -> skip
    ];

} with operations

// ------------------------------------------------------------------------------
// Operations Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check if whitelisted developer exists
function checkWhitelistDeveloperExists(const developer : address; var s : governanceStorageType) : bool is 
block {

    const whitelistDeveloperExists : bool = Set.mem(developer, s.whitelistDevelopers);

} with whitelistDeveloperExists


// helper function to remove whitelisted developer
function removeWhitelistDeveloper(const developer : address; var s : governanceStorageType) : governanceStorageType is 
block {

    // Check that there will be at least one whitelisted developer
    if Set.cardinal(s.whitelistDevelopers) > 1n 
    then s.whitelistDevelopers := Set.remove(developer, s.whitelistDevelopers)
    else failwith(error_AT_LEAST_ONE_WHITELISTED_DEVELOPER_REQUIRED)

} with s



// helper function to add whitelisted developer
function addWhitelistDeveloper(const developer : address; var s : governanceStorageType) : governanceStorageType is 
block {

    s.whitelistDevelopers := Set.add(developer, s.whitelistDevelopers)

} with s




// helper function to get staked mvk total supply (equivalent to balance of the Doorman contract on the MVK Token contract)
function getStakedMvkTotalSupply(const s : governanceStorageType) : nat is 
block {

    // Get Doorman Contract from General Contracts Map
    const doormanAddress : address = getAddressFromGeneralContracts("doorman", s, error_DOORMAN_CONTRACT_NOT_FOUND);

    const getBalanceView : option (nat) = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
    const stakedMvkTotalSupply: nat = case getBalanceView of [
            Some (value) -> value
        |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
    ];

} with stakedMvkTotalSupply 



// helper function to get proposal record
function getProposalRecord(const proposalId : nat; const s : governanceStorageType) : proposalRecordType is
block {
    
    const proposalRecord : proposalRecordType = case s.proposalLedger[proposalId] of [ 
            Some(_record) -> _record
        |   None          -> failwith(error_PROPOSAL_NOT_FOUND)
    ];

} with proposalRecord



// helper function to get minimum staked MVK requirement
function getMinimumStakedMvkRequirement(const s : governanceStorageType) : nat is
block {

    // Get Delegation Contract from General Contracts Map
    const delegationAddress : address = getAddressFromGeneralContracts("delegation", s, error_DELEGATION_CONTRACT_NOT_FOUND);

    // Get Delegation Contract Config
    const delegationConfigView : option (delegationConfigType)  = Tezos.call_view ("getConfig", unit, delegationAddress);
    const delegationConfig : delegationConfigType               = case delegationConfigView of [
            Some (_config) -> _config
        |   None           -> failwith (error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
    ];

    // Get minimumStakedMvkBalance from Delegation Contract Config
    const minimumStakedMvkRequirement = delegationConfig.minimumStakedMvkBalance;

} with minimumStakedMvkRequirement 



// helper function to get proposals made by given satellite in a given cycle
function getSatelliteProposals(const satelliteAddress : address; const cycleId : nat; const s : governanceStorageType) : set(nat) is
block {

    const satelliteProposals : set(nat) = case s.cycleProposers[(cycleId,satelliteAddress)] of [
            Some (_proposals) -> _proposals
        |   None              -> Set.empty
    ];

} with satelliteProposals



// helper function to get satellite snapshot
function getCurrentSatelliteSnapshot(const s : governanceStorageType) : governanceSatelliteSnapshotRecordType is 
block {

    const currentSatelliteSnapshot : governanceSatelliteSnapshotRecordType = case s.snapshotLedger[(s.cycleId,Tezos.get_sender())] of [
            None           -> failwith(error_SNAPSHOT_NOT_FOUND)
        |   Some(snapshot) -> snapshot
    ];

} with currentSatelliteSnapshot



// helper function to check proposal has proposal data
function checkProposalDataExists(const newProposal : newProposalType) : bool is 
block {

    const proposalDataExists : bool = case newProposal.proposalData of [
            Some (_data)    -> True
        |   None            -> False
    ];

} with proposalDataExists



// helper function to check proposal has payment data
function checkPaymentDataExists(const newProposal : newProposalType) : bool is 
block {

    const paymentDataExists : bool = case newProposal.paymentData of [
            Some (_data)    -> True
        |   None            -> False
    ];

} with paymentDataExists



// helper function to create a new proposal record
function createNewProposal(const newProposal : newProposalType; const s : governanceStorageType) : proposalRecordType is 
block {

    // Validate inputs (max length not exceeded)    
    validateStringLength(newProposal.title          , s.config.proposalTitleMaxLength           , error_WRONG_INPUT_PROVIDED);
    validateStringLength(newProposal.description    , s.config.proposalDescriptionMaxLength     , error_WRONG_INPUT_PROVIDED);
    validateStringLength(newProposal.invoice        , s.config.proposalInvoiceMaxLength         , error_WRONG_INPUT_PROVIDED);
    validateStringLength(newProposal.sourceCode     , s.config.proposalSourceCodeMaxLength      , error_WRONG_INPUT_PROVIDED);

    // init new proposal params
    const proposalData    : map(nat, option(proposalDataType))   = map [];
    const paymentData     : map(nat, option(paymentDataType))    = map [];

    // ------------------------------------------------------------------
    // Calculate minProposalRoundVotesRequired
    // ------------------------------------------------------------------

    const stakedMvkTotalSupply : nat = case s.stakedMvkSnapshotLedger[s.cycleId] of [
            Some(_v) -> _v
        |   None     -> failwith(error_STAKED_MVK_SNAPSHOT_FOR_CYCLE_NOT_FOUND)
    ];

    // Calculate minimum required staked MVK for proposal round votes
    const minProposalRoundVotesRequired : nat  = (stakedMvkTotalSupply * s.config.minProposalRoundVotePercentage) / 10000n ;

    // ------------------------------------------------------------------

    // create new proposal record
    const newProposalRecord : proposalRecordType = record [

        proposerAddress                     = Tezos.get_sender();
        proposalData                        = proposalData;
        proposalDataExecutionCounter        = 0n;
        paymentData                         = paymentData;

        status                              = "ACTIVE";                                     // status : "ACTIVE", "DROPPED"
        title                               = newProposal.title;                            // title
        description                         = newProposal.description;                      // description
        invoice                             = newProposal.invoice;                          // ipfs hash of invoice file
        sourceCode                          = newProposal.sourceCode;                       // source code repo url

        successReward                       = s.config.successReward;                       // log of successful proposal reward for voters - may change over time
        totalVotersReward                   = s.currentCycleInfo.cycleTotalVotersReward;    // log of the cycle total rewards for voters
        executed                            = False;                                        // boolean: executed set to true if proposal is executed
        paymentProcessed                    = False;                                        // boolean: set to true if proposal payment has been processed 
        locked                              = False;                                        // boolean: locked set to true after proposer has included necessary metadata and proceed to lock proposal
        rewardClaimReady                    = False;                                        // boolean: set to true if the voters are able to claim the rewards
        executionReady                      = False;                                        // boolean: set to true if the proposal can be executed

        proposalVoteCount                   = 0n;                                           // proposal round: pass votes count (to proceed to voting round)
        proposalVoteStakedMvkTotal          = 0n;                                           // proposal round pass vote total mvk from satellites who voted pass

        minProposalRoundVotePercentage      = s.config.minProposalRoundVotePercentage;      // min vote percentage of total MVK supply required to pass proposal round
        minProposalRoundVotesRequired       = minProposalRoundVotesRequired;                // min staked MVK votes required for proposal round to pass

        yayVoteCount                        = 0n;                                           // voting round: yay count
        yayVoteStakedMvkTotal               = 0n;                                           // voting round: yay MVK total 
        nayVoteCount                        = 0n;                                           // voting round: nay count
        nayVoteStakedMvkTotal               = 0n;                                           // voting round: nay MVK total 
        passVoteCount                       = 0n;                                           // voting round: pass count
        passVoteStakedMvkTotal              = 0n;                                           // voting round: pass MVK total 

        minQuorumPercentage                 = s.config.minQuorumPercentage;                 // log of min quorum percentage - capture state at this point as min quorum percentage may change over time
        minQuorumStakedMvkTotal             = s.currentCycleInfo.minQuorumStakedMvkTotal;   // log of min quorum in MVK
        minYayVotePercentage                = s.config.minYayVotePercentage;                // log of min yay votes percentage - capture state at this point
        quorumCount                         = 0n;                                           // log of turnout for voting round - number of satellites who voted
        quorumStakedMvkTotal                = 0n;                                           // log of total positive votes in MVK  
        startDateTime                       = Tezos.get_now();                              // log of when the proposal was proposed
        executedDateTime                    = None;                                         // log of when the proposal was executed

        cycle                               = s.cycleId;
        currentCycleStartLevel              = s.currentCycleInfo.roundStartLevel;           // log current round/cycle start level
        currentCycleEndLevel                = s.currentCycleInfo.cycleEndLevel;             // log current cycle end level

    ];

} with newProposalRecord



// helper function to check if a satellite has voted
function checkIfSatelliteHasVoted(const satelliteAddress : address; const s : governanceStorageType) : bool is
block {

    const checkIfSatelliteHasVotedFlag : bool = case s.roundVotes[(s.cycleId, satelliteAddress)] of [
            Some (_voteRound)   -> case _voteRound of [
                    Proposal (_proposalId)      -> True
                |   Voting (_voteType)          -> False
            ] 
        |    None                -> False
    ];

} with checkIfSatelliteHasVotedFlag



// helper function to get proposal data
function getProposalData(const proposal : proposalRecordType; const index : nat) : option(proposalDataType) is 
block {

    const optionProposalData : option(proposalDataType) = case proposal.proposalData[index] of [
            Some (_data)    -> _data
        |   None            -> failwith(error_PROPOSAL_DATA_NOT_FOUND)
    ];

} with optionProposalData



// helper function to get proposal payment data
function getProposalPaymentData(const proposal : proposalRecordType; const index : nat) : option(paymentDataType) is 
block {

    const optionPaymentData : option(paymentDataType) = case proposal.paymentData[index] of [
            Some (_data)    -> _data
        |   None            -> failwith(error_PAYMENT_DATA_NOT_FOUND)
    ];

} with optionPaymentData



// helper function to drop proposals
function dropProposal(const proposerAddress : address; const proposalId : nat; var s : governanceStorageType) : governanceStorageType is 
block {

    // get satellite proposals belonging to proposer
    const satelliteProposals : set(nat) = getSatelliteProposals(proposerAddress, s.cycleId, s);

    // Remove proposal from cycle proposers
    s.cycleProposers[(s.cycleId, proposerAddress)] := Set.remove(proposalId, satelliteProposals);

    // Remove proposal from cycle proposals
    s.cycleProposals := Map.remove(proposalId, s.cycleProposals);

} with s

// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Snapshot Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get satellite record view from the delegation contract
function getSatelliteRecord(const satelliteAddress : address; const s : governanceStorageType) : satelliteRecordType is 
block {

    // Get Delegation Contract address from the General Contracts Map on the Governance Contract
    const delegationAddress : address = getAddressFromGeneralContracts("delegation", s, error_DELEGATION_CONTRACT_NOT_FOUND);

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
function getSatelliteRewardsRecord(const satelliteAddress : address; const s : governanceStorageType) : satelliteRewardsType is 
block {

    // Get Delegation Contract address from the General Contracts Map on the Governance Contract
    const delegationAddress : address = getAddressFromGeneralContracts("delegation", s, error_DELEGATION_CONTRACT_NOT_FOUND);

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
function getDelegationRatio(const s : governanceStorageType) : nat is 
block {

    // Get Delegation Contract address from the General Contracts Map on the Governance Contract
    const delegationAddress : address = getAddressFromGeneralContracts("delegation", s, error_DELEGATION_CONTRACT_NOT_FOUND);

    // Get the delegation ratio
    const configView : option (delegationConfigType)  = Tezos.call_view ("getConfig", unit, delegationAddress);
    const delegationRatio : nat = case configView of [
            Some (_config) -> _config.delegationRatio
        |   None -> failwith (error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
    ];

} with delegationRatio



// helper function to update a satellite snapshot 
function updateSatellitesSnapshotRecord (const updateSatelliteSnapshotParams : updateSatelliteSingleSnapshotType; var s : governanceStorageType) : governanceStorageType is
block {

    // Get variables from parameter
    const satelliteAddress : address                = updateSatelliteSnapshotParams.satelliteAddress;
    const totalStakedMvkBalance : nat               = updateSatelliteSnapshotParams.totalStakedMvkBalance;
    const totalDelegatedAmount : nat                = updateSatelliteSnapshotParams.totalDelegatedAmount;
    const ready : bool                              = updateSatelliteSnapshotParams.ready;
    const delegationRatio : nat                     = updateSatelliteSnapshotParams.delegationRatio;
    const accumulatedRewardsPerShare : nat          = updateSatelliteSnapshotParams.accumulatedRewardsPerShare;

    // calculate total voting power
    const totalVotingPower : nat = voteHelperCalculateVotingPower(delegationRatio, totalStakedMvkBalance, totalDelegatedAmount);

    const satelliteSnapshotRecord : governanceSatelliteSnapshotRecordType = record [
        totalStakedMvkBalance       = totalStakedMvkBalance;
        totalDelegatedAmount        = totalDelegatedAmount;
        totalVotingPower            = totalVotingPower;
        accumulatedRewardsPerShare  = accumulatedRewardsPerShare;
        ready                       = ready;
    ];

    s.snapshotLedger[(s.cycleId,satelliteAddress)]  := satelliteSnapshotRecord;

} with s



// helper function to check if satellite snapshot exists
function createSatelliteSnapshotCheck(const satelliteAddress : address; const s : governanceStorageType) : bool is
block {

    const satelliteSnapshotCheck : bool = case s.snapshotLedger[(s.cycleId, satelliteAddress)] of [
            Some (_snapshot)    -> if _snapshot.ready then False else (failwith(error_SNAPSHOT_NOT_READY) : bool)
        |   None                -> True
    ];

} with satelliteSnapshotCheck



// helper function to check a satellite snapshot 
function checkSatelliteSnapshot (const satelliteAddress : address; var s : governanceStorageType) : governanceStorageType is
block {

    // Check if a satellite snapshot exists and is ready
    const createSatelliteSnapshot : bool = createSatelliteSnapshotCheck(satelliteAddress, s);

    // Create a snapshot if it does not exist
    if createSatelliteSnapshot then {
        
        // Get the satellite record from delegation contract
        const satelliteRecord   : satelliteRecordType   = getSatelliteRecord(satelliteAddress, s);
        const satelliteRewards  : satelliteRewardsType  = getSatelliteRewardsRecord(satelliteAddress, s);

        // Get the delegation ratio
        const delegationRatio : nat = getDelegationRatio(s);

        // Prepare the record to create the snapshot
        const satelliteSnapshotParams : updateSatelliteSingleSnapshotType = record[
            satelliteAddress            = satelliteAddress;
            totalStakedMvkBalance       = satelliteRecord.stakedMvkBalance;
            totalDelegatedAmount        = satelliteRecord.totalDelegatedAmount;
            ready                       = True;
            delegationRatio             = delegationRatio;
            accumulatedRewardsPerShare  = satelliteRewards.satelliteAccumulatedRewardsPerShare;
        ];

        // Save the snapshot
        s := updateSatellitesSnapshotRecord(satelliteSnapshotParams, s);

    } else skip;

} with s

// ------------------------------------------------------------------------------
// Governance Snapshot Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Helper Functions Begin
// ------------------------------------------------------------------------------

function setProposalRecordVote(const voteType : voteType; const totalVotingPower : nat; var _proposal : proposalRecordType) : proposalRecordType is
block {

    case voteType of [

            Yay -> block {
                
                // Increment YAY vote count and YAY vote staked MVK total
                _proposal.yayVoteCount            := _proposal.yayVoteCount + 1n;    
                _proposal.yayVoteStakedMvkTotal   := _proposal.yayVoteStakedMvkTotal + totalVotingPower;

            }

        |   Nay -> block {

                // Increment NAY vote count and NAY vote staked MVK total
                _proposal.nayVoteCount            := _proposal.nayVoteCount + 1n;    
                _proposal.nayVoteStakedMvkTotal   := _proposal.nayVoteStakedMvkTotal + totalVotingPower;

            }

        |   Pass -> block {

                // Increment PASS vote count and PASS vote staked MVK total
                _proposal.passVoteCount           := _proposal.passVoteCount + 1n;    
                _proposal.passVoteStakedMvkTotal  := _proposal.passVoteStakedMvkTotal + totalVotingPower;

            }
    ];

    // Increment Quorum vote count and Quorum vote staked MVK total
    _proposal.quorumStakedMvkTotal    := _proposal.quorumStakedMvkTotal + totalVotingPower;
    _proposal.quorumCount             := _proposal.quorumCount + 1n;

} with _proposal



function unsetProposalRecordVote(const voteType : voteType; const totalVotingPower : nat; var _proposal : proposalRecordType) : proposalRecordType is 
block {
    
    case voteType of [

            Yay -> block {

                // Decrement YAY vote count and YAY vote staked MVK total

                var yayVoteCount            : nat := 0n;
                var yayVoteStakedMvkTotal   : nat := 0n;

                if _proposal.yayVoteCount < 1n then yayVoteCount := 0n
                else yayVoteCount := abs(_proposal.yayVoteCount - 1n);

                if _proposal.yayVoteStakedMvkTotal < totalVotingPower then yayVoteStakedMvkTotal := 0n
                else yayVoteStakedMvkTotal := abs(_proposal.yayVoteStakedMvkTotal - totalVotingPower);          

                _proposal.yayVoteCount          := yayVoteCount;
                _proposal.yayVoteStakedMvkTotal := yayVoteStakedMvkTotal;

            }

        |   Nay -> block {

                // Decrement NAY vote count and NAY vote staked MVK total

                var nayVoteCount            : nat := 0n;
                var nayVoteStakedMvkTotal   : nat := 0n;

                if _proposal.nayVoteCount < 1n then nayVoteCount := 0n
                else nayVoteCount := abs(_proposal.nayVoteCount - 1n);

                if _proposal.nayVoteStakedMvkTotal < totalVotingPower then nayVoteStakedMvkTotal := 0n
                else nayVoteStakedMvkTotal := abs(_proposal.nayVoteStakedMvkTotal - totalVotingPower);

                _proposal.nayVoteCount            := nayVoteCount;
                _proposal.nayVoteStakedMvkTotal   := nayVoteStakedMvkTotal;

            }

        |   Pass -> block {

                // Decrement PASS vote count and PASS vote staked MVK total

                var passVoteCount           : nat := 0n;
                var passVoteStakedMvkTotal  : nat := 0n;

                if _proposal.passVoteCount < 1n then passVoteCount := 0n
                else passVoteCount := abs(_proposal.passVoteCount - 1n);

                if _proposal.passVoteStakedMvkTotal < totalVotingPower then passVoteStakedMvkTotal := 0n
                else passVoteStakedMvkTotal := abs(_proposal.passVoteStakedMvkTotal - totalVotingPower);

                _proposal.passVoteCount           := passVoteCount;
                _proposal.passVoteStakedMvkTotal  := passVoteStakedMvkTotal;

            }
    ];

    // Decrement Quorum vote count and Quorum vote staked MVK total

    var quorumCount             : nat := 0n;
    var quorumStakedMvkTotal    : nat := 0n;

    if _proposal.quorumCount < 1n then quorumCount := 0n
    else quorumCount := abs(_proposal.quorumCount - 1n);

    if _proposal.quorumStakedMvkTotal < totalVotingPower then quorumStakedMvkTotal := 0n
    else quorumStakedMvkTotal := abs(_proposal.quorumStakedMvkTotal - totalVotingPower);          

    _proposal.quorumCount           := quorumCount;
    _proposal.quorumStakedMvkTotal  := quorumStakedMvkTotal;  

} with _proposal



function sendRewardToProposer(const s : governanceStorageType) : operation is
block {

    // Get timelock proposal and proposer address
    const timelockProposalId  : nat   = s.timelockProposalId;
    
    // Get timelock proposal record
    const proposal            : proposalRecordType = getProposalRecord(timelockProposalId, s);
    
    const proposerAddress     : address            = proposal.proposerAddress;
    const proposerReward      : nat                = proposal.successReward;

    // Create operation to send rewards to the proposer
    const distributeRewardOperation : operation = distributeRewardOperation(set[proposerAddress], proposerReward, s);
    
} with distributeRewardOperation



function setupProposalRound(var s : governanceStorageType) : governanceStorageType is
block {

    // reset state variables
    const emptyProposalMap : map(actionIdType, nat) = map [];

    // ------------------------------------------------------------------
    // Get staked MVK Total Supply and calculate quorum
    // ------------------------------------------------------------------

    const stakedMvkTotalSupply : nat = getStakedMvkTotalSupply(s);

    // Calculate minimum required staked MVK for quorum
    const minQuorumStakedMvkTotal : nat  = (stakedMvkTotalSupply * s.config.minQuorumPercentage) / 10000n ;

    // ------------------------------------------------------------------
    // Set up new round info
    // ------------------------------------------------------------------

    // Setup current round info
    s.currentCycleInfo.round                         := (Proposal : roundType);
    s.currentCycleInfo.blocksPerProposalRound        := s.config.blocksPerProposalRound;
    s.currentCycleInfo.blocksPerVotingRound          := s.config.blocksPerVotingRound;
    s.currentCycleInfo.blocksPerTimelockRound        := s.config.blocksPerTimelockRound;
    s.currentCycleInfo.roundStartLevel               := Tezos.get_level();
    s.currentCycleInfo.roundEndLevel                 := Tezos.get_level() + s.config.blocksPerProposalRound;
    s.currentCycleInfo.cycleEndLevel                 := Tezos.get_level() + s.config.blocksPerProposalRound + s.config.blocksPerVotingRound + s.config.blocksPerTimelockRound;
    s.currentCycleInfo.cycleTotalVotersReward        := s.config.cycleVotersReward;
    s.currentCycleInfo.minQuorumStakedMvkTotal       := minQuorumStakedMvkTotal;
    s.cycleProposals                                 := emptyProposalMap;    // flush proposals
    s.cycleHighestVotedProposalId                    := 0n;                  // flush proposal id voted through - reset to 0 

    // Increase the cycle counter
    s.cycleId      := s.cycleId + 1n;

    // ------------------------------------------------------------------
    // Save staked MVK Total supply to governance cycle counter
    // ------------------------------------------------------------------

    s.stakedMvkSnapshotLedger[s.cycleId] := stakedMvkTotalSupply;

} with (s)



// helper function to setup new voting round
function setupVotingRound(var s : governanceStorageType) : governanceStorageType is
block {

    // boundaries fixed to the start and end of the cycle (calculated at start of proposal round)
    s.currentCycleInfo.round               := (Voting : roundType);
    s.currentCycleInfo.roundStartLevel     := s.currentCycleInfo.roundEndLevel + 1n;
    s.currentCycleInfo.roundEndLevel       := s.currentCycleInfo.roundEndLevel + s.currentCycleInfo.blocksPerVotingRound;

    // flush proposal id in timelock - reset to 0
    s.timelockProposalId := 0n;

} with (s)



// helper function to setup new timelock round
function setupTimelockRound(var s : governanceStorageType) : governanceStorageType is
block {

    // boundaries remain fixed to the start and end of the cycle (calculated at start of proposal round)
    s.currentCycleInfo.round               := (Timelock : roundType);
    s.currentCycleInfo.roundStartLevel     := s.currentCycleInfo.roundEndLevel + 1n;
    s.currentCycleInfo.roundEndLevel       := s.currentCycleInfo.cycleEndLevel;

    // set timelockProposalId to cycleHighestVotedProposalId
    s.timelockProposalId         := s.cycleHighestVotedProposalId;
    
} with (s)



// helper function to restart cycle if round is voting or timelock round
function restartCycleIfVotingOrTimelockRound(var s : governanceStorageType) : governanceStorageType is
block {
    
    if s.currentCycleInfo.round = (Voting : roundType) or s.currentCycleInfo.round = (Timelock : roundType) 
    then s := setupProposalRound(s) 
    else skip;

} with s



// helper function to add payment data to a proposal
function addOrSetPaymentData(const paymentData : updatePaymentDataSetType ; var paymentDataMap : proposalPaymentDataMapType) : proposalPaymentDataMapType is
block {

    // init params
    const title                 : string                    = paymentData.title;
    const paymentTransaction    : transferDestinationType   = paymentData.transaction;
    const index                 : nat                       = case paymentData.index of [
            Some (_index)   -> if _index < Map.size(paymentDataMap) then _index else failwith(error_INDEX_OUT_OF_BOUNDS)
        |   None            -> Map.size(paymentDataMap)
    ];

    // Create the new paymentData
    const newPaymentData : paymentDataType = record[
        title           = title;
        transaction     = paymentTransaction;
    ];

    // Add data to the proposal
    paymentDataMap[index] := Some(newPaymentData);

} with (paymentDataMap)



// helper function to add payment data to a proposal
function removePaymentData(const removeAtIndex : nat ; var paymentDataMap : proposalPaymentDataMapType) : proposalPaymentDataMapType is
block {

    // Remove data from the proposal
    paymentDataMap[removeAtIndex] := (None : option(paymentDataType));

} with (paymentDataMap)



// helper function to add data to a proposal
function addOrSetProposalData(const proposalData : updateProposalDataSetType; var proposalDataMap : proposalDataMapType) : proposalDataMapType is
block {

    // init params
    const title             : string   = proposalData.title;
    const proposalBytes     : bytes    = proposalData.encodedCode;
    const codeDescription   : string   = case proposalData.codeDescription of [
            Some (_c)   -> _c
        |   None        -> ""
    ];
    const index          : nat      = case proposalData.index of [
            Some (_index)   -> if _index < Map.size(proposalDataMap) then _index else failwith(error_INDEX_OUT_OF_BOUNDS)
        |   None            -> Map.size(proposalDataMap)
    ];
    
    // Create the new proposalData
    const newProposalData : proposalDataType = record[
        title           = title;
        encodedCode     = proposalBytes;
        codeDescription = codeDescription;
    ];

    // Add data to the proposal
    proposalDataMap[index] := Some(newProposalData);

} with (proposalDataMap)



// helper function to remove data from a proposal
function removeProposalData(const removeAtIndex : nat; var proposalDataMap : proposalDataMapType) : proposalDataMapType is
block {
    
    // Remove the proposal data
    proposalDataMap[removeAtIndex] := (None : option(proposalDataType));

} with (proposalDataMap)

// ------------------------------------------------------------------------------
// Governance Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const governanceLambdaAction : governanceLambdaActionType; var s : governanceStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(governanceUnpackLambdaFunctionType)) of [
            Some(f) -> f(governanceLambdaAction, s)
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