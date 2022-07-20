// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Methods and Types
// ------------------------------------------------------------------------------

// Shared Methods
#include "../partials/shared/sharedMethods.ligo"

// Transfer Methods
#include "../partials/shared/transferMethods.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Delegation Type
#include "../partials/contractTypes/delegationTypes.ligo"

// Governance Type
#include "../partials/contractTypes/governanceTypes.ligo"

// ------------------------------------------------------------------------------

type governanceAction is 

        // Break Glass Entrypoint
        BreakGlass                      of (unit)
    |   PropagateBreakGlass             of (unit)

        // Housekeeping Entrypoints
    |   SetAdmin                        of (address)
    |   SetGovernanceProxy              of (address)
    |   UpdateMetadata                  of updateMetadataType
    |   UpdateConfig                    of governanceUpdateConfigParamsType
    |   UpdateGeneralContracts          of updateGeneralContractsType
    |   UpdateWhitelistContracts        of updateWhitelistContractsType
    |   UpdateWhitelistDevelopers       of (address)
    |   MistakenTransfer                of transferActionType
    |   SetContractAdmin                of setContractAdminType
    |   SetContractGovernance           of setContractGovernanceType
    
        // Governance Cycle Entrypoints
    |   UpdateSatelliteSnapshot         of updateSatelliteSnapshotType         
    |   StartNextRound                  of bool
    |   Propose                         of newProposalType
    |   ProposalRoundVote               of actionIdType
    |   UpdateProposalData              of updateProposalDataType
    |   UpdatePaymentData               of updatePaymentDataType
    |   LockProposal                    of actionIdType      
    |   VotingRoundVote                 of (votingRoundVoteType)    
    |   ExecuteProposal                 of (unit)
    |   ProcessProposalPayment          of actionIdType
    |   ProcessProposalSingleData       of (unit)
    |   DistributeProposalRewards       of distributeProposalRewardsType
    |   DropProposal                    of actionIdType

        // Lambda Entrypoints
    |   SetLambda                       of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * governanceStorageType

// governance contract methods lambdas
type governanceUnpackLambdaFunctionType is (governanceLambdaActionType * governanceStorageType) -> return



// ------------------------------------------------------------------------------
//
// Constants Begin
//
// ------------------------------------------------------------------------------

const maxRoundDuration : nat = 20_160n; // One week with blockTime = 30sec

// ------------------------------------------------------------------------------
//
// Constants End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders : Admin
function checkSenderIsAdmin(var s : governanceStorageType) : unit is
    if (Tezos.get_sender() = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



// Allowed Senders : Admin, Governance Satellite Contract
function checkSenderIsAdminOrGovernanceSatelliteContract(var s : governanceStorageType) : unit is
block{

    if Tezos.get_sender() = s.admin then skip
    else {

        const governanceSatelliteAddress : address = case s.generalContracts["governanceSatellite"] of [
                Some (_contract)    -> _contract
            |   None                -> failwith (error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND)
        ];

        if Tezos.get_sender() = governanceSatelliteAddress then skip
        else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED);
    }

} with unit



// Allowed Senders : Admin, Whitelisted Contract
function checkSenderIsWhitelistedOrAdmin(var s : governanceStorageType) : unit is
    if (Tezos.get_sender() = s.admin) or checkInWhitelistContracts(Tezos.get_sender(), s.whitelistContracts) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_WHITELISTED_ADDRESSES_ALLOWED);



// Allowed Senders : Self
function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.get_sender() = Tezos.get_self_address()) then unit
    else failwith(error_ONLY_SELF_ALLOWED);



// Allowed Senders : Doorman Contract
function checkSenderIsDoormanContract(var s : governanceStorageType) : unit is
block{

    const doormanAddress : address = case s.generalContracts["doorman"] of [
            Some(_address) -> _address
        |   None           -> failwith(error_DOORMAN_CONTRACT_NOT_FOUND)
    ];
    
    if (Tezos.get_sender() = doormanAddress) then skip
    else failwith(error_ONLY_DOORMAN_CONTRACT_ALLOWED);

} with unit



// Allowed Senders : Delegation Contract
function checkSenderIsDelegationContract(var s : governanceStorageType) : unit is
block{

    const delegationAddress : address = case s.generalContracts["delegation"] of [
            Some(_address) -> _address
        |   None           -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
    ];

    if (Tezos.get_sender() = delegationAddress) then skip
    else failwith(error_ONLY_DELEGATION_CONTRACT_ALLOWED);

} with unit



// Allowed Senders : MVK Token Contract
function checkSenderIsMvkTokenContract(var s : governanceStorageType) : unit is
block{

    const mvkTokenAddress : address = s.mvkTokenAddress;
    if (Tezos.get_sender() = mvkTokenAddress) then skip
    else failwith(error_ONLY_MVK_TOKEN_CONTRACT_ALLOWED);

} with unit



// Allowed Senders : Council Contract
function checkSenderIsCouncilContract(var s : governanceStorageType) : unit is
block{

    const councilAddress : address = case s.generalContracts["council"] of [
            Some(_address) -> _address
        |   None           -> failwith(error_COUNCIL_CONTRACT_NOT_FOUND)
    ];
    
    if (Tezos.get_sender() = councilAddress) then skip
    else failwith(error_ONLY_COUNCIL_CONTRACT_ALLOWED);

} with unit



// Allowed Senders : Emergency Governance Contract
function checkSenderIsEmergencyGovernanceContract(var s : governanceStorageType) : unit is
block{

    const emergencyGovernanceAddress : address = case s.generalContracts["emergencyGovernance"] of [
            Some(_address) -> _address
        |   None           -> failwith(error_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    if (Tezos.get_sender() = emergencyGovernanceAddress) then skip
    else failwith(error_ONLY_EMERGENCY_GOVERNANCE_CONTRACT_ALLOWED);

} with unit



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if (Tezos.get_amount() = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);


// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Satellite Status Helper Functions
// ------------------------------------------------------------------------------

function checkSatelliteIsNotSuspendedOrBanned(const satelliteAddress : address; var s : governanceStorageType) : unit is
  block{

    const delegationAddress : address = case s.generalContracts["delegation"] of [
            Some(_address) -> _address
        |   None           -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
    ];

    const satelliteOptView : option (option(satelliteRecordType)) = Tezos.call_view ("getSatelliteOpt", satelliteAddress, delegationAddress);
    case satelliteOptView of [
            Some (value) -> case value of [
                    Some (_satellite) -> if _satellite.status = "SUSPENDED" then failwith(error_SATELLITE_SUSPENDED) else if _satellite.status = "BANNED" then failwith(error_SATELLITE_BANNED) else skip
                |   None              -> failwith(error_ONLY_SATELLITE_ALLOWED)
            ]
        |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
    ];
  } with (unit)

// ------------------------------------------------------------------------------
// Satellite Status Helper Functions
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



// helper function to send transfer operation to treasury
function sendTransferOperationToTreasury(const contractAddress : address) : contract(transferActionType) is
    case (Tezos.get_entrypoint_opt(
        "%transfer",
        contractAddress) : option(contract(transferActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(transferActionType))
        ];



// helper function to %executeProposal entrypoint on the Governance Contract
function getExecuteProposalEntrypoint(const contractAddress : address) : contract(unit) is
    case (Tezos.get_entrypoint_opt(
        "%executeProposal",
        contractAddress) : option(contract(unit))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_EXECUTE_PROPOSAL_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(unit))
        ];



// helper function to %updateProposalData entrypoint on the Governance Contract
function getUpdateProposalDataEntrypoint(const contractAddress : address) : contract(updateProposalDataType) is
    case (Tezos.get_entrypoint_opt(
        "%updateProposalData",
        contractAddress) : option(contract(updateProposalDataType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_ADD_UPDATE_PROPOSAL_DATA_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(updateProposalDataType))
        ];



// helper function to %updatePaymentData entrypoint on the Governance Contract
function getUpdatePaymentDataEntrypoint(const contractAddress : address) : contract(updatePaymentDataType) is
    case (Tezos.get_entrypoint_opt(
        "%updatePaymentData",
        contractAddress) : option(contract(updatePaymentDataType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_ADD_UPDATE_PAYMENT_DATA_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(updatePaymentDataType))
        ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to update a satellite snapshot 
function updateSatelliteSnapshotRecord (const updateSatelliteSnapshotParams : updateSatelliteSnapshotType; var s : governanceStorageType) : governanceStorageType is
block {

    // Get variables from parameter
    const satelliteAddress: address                 = updateSatelliteSnapshotParams.satelliteAddress;
    const satelliteRecord: satelliteRecordType      = updateSatelliteSnapshotParams.satelliteRecord;
    const ready: bool                               = updateSatelliteSnapshotParams.ready;
    const delegationRatio: nat                      = updateSatelliteSnapshotParams.delegationRatio;

    // calculate total voting power
    var maxTotalVotingPower: nat := satelliteRecord.stakedMvkBalance * 10000n / delegationRatio;
    if delegationRatio = 0n then maxTotalVotingPower := satelliteRecord.stakedMvkBalance * 10000n else skip;
    const mvkBalanceAndTotalDelegatedAmount = satelliteRecord.stakedMvkBalance + satelliteRecord.totalDelegatedAmount; 
    var totalVotingPower : nat := 0n;
    if mvkBalanceAndTotalDelegatedAmount > maxTotalVotingPower then totalVotingPower := maxTotalVotingPower
    else totalVotingPower := mvkBalanceAndTotalDelegatedAmount;

    const satelliteSnapshotRecord : governanceSatelliteSnapshotRecordType = record [
        totalStakedMvkBalance   = satelliteRecord.stakedMvkBalance;
        totalDelegatedAmount    = satelliteRecord.totalDelegatedAmount;
        totalVotingPower        = totalVotingPower;
        ready                   = ready;
        cycle                   = s.cycleCounter;
    ];

    s.snapshotLedger[satelliteAddress]  := satelliteSnapshotRecord;

} with s



// helper function to check a satellite snapshot 
function checkSatelliteSnapshot (const satelliteAddress : address; var s : governanceStorageType) : governanceStorageType is
block {

    // Initialize a variable to create a snapshot or not
    var createSatelliteSnapshot: bool   := case Big_map.find_opt(satelliteAddress, s.snapshotLedger) of [
        Some (_snapshot)    -> if _snapshot.cycle =/= s.cycleCounter then True else if _snapshot.ready then False else (failwith(error_SNAPSHOT_NOT_READY): bool)
    |   None                -> True
    ];

    // Create or not a snapshot
    if createSatelliteSnapshot then {
        // Get the delegation address
        const delegationAddress : address = case s.generalContracts["delegation"] of [
                Some(_address) -> _address
            |   None           -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
        ];

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

        // Prepare the record to create the snapshot
        const satelliteSnapshotParams: updateSatelliteSnapshotType  = record[
            satelliteAddress    = satelliteAddress;
            satelliteRecord     = _satelliteRecord;
            ready               = True;
            delegationRatio     = delegationRatio;
        ];

        // Save the snapshot
        s   := updateSatelliteSnapshotRecord(satelliteSnapshotParams, s);

    } else skip;

} with s



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



function sendRewardToProposer(var s : governanceStorageType) : operation is
block {

    // Get timelock proposal and proposer address
    const timelockProposalId: nat   = s.timelockProposalId;
    const proposal: proposalRecordType  = case Big_map.find_opt(timelockProposalId, s.proposalLedger) of [
            Some (_record) -> _record
        |   None -> failwith(error_TIMELOCK_PROPOSAL_NOT_FOUND)
    ];
    const proposerAddress : address         = proposal.proposerAddress;
    
    // Get proposer reward
    const proposerReward: nat  = proposal.successReward;

    // Get Delegation Contract address from the general contracts map
    const delegationAddress : address = case s.generalContracts["delegation"] of [
            Some(_address) -> _address
        |   None -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
    ];

    // Create operation to send rewards to the proposer
    const distributeRewardsEntrypoint: contract(set(address) * nat) =
        case (Tezos.get_entrypoint_opt("%distributeReward", delegationAddress) : option(contract(set(address) * nat))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_DISTRIBUTE_REWARD_ENTRYPOINT_IN_DELEGATION_CONTRACT_PAUSED) : contract(set(address) * nat))
        ];
    const distributeOperation: operation = Tezos.transaction((set[proposerAddress], proposerReward), 0tez, distributeRewardsEntrypoint);
    
} with (distributeOperation)



function setupProposalRound(var s : governanceStorageType) : governanceStorageType is
block {

    // reset state variables
    const emptyProposalMap  : map(actionIdType, nat)    = map [];

    // ------------------------------------------------------------------
    // Get staked MVK Total Supply and calculate quorum
    // ------------------------------------------------------------------

    // Get Doorman Contract address from the general contracts map
    const doormanAddress : address   = case s.generalContracts["doorman"] of [
            Some(_address) -> _address
        |   None -> failwith(error_DOORMAN_CONTRACT_NOT_FOUND)
    ];

    // Call get_balance view on MVK Token Contract Address for Doorman Contract account
    const balanceView : option (nat)    = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);

    // Get staked MVK Total Supply
    const stakedMvkTotalSupply: nat = case balanceView of [
            Some (value) -> value
        |   None         -> failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND)
    ];

    // Calculate minimum required staked MVK for quorum
    const minQuorumStakedMvkTotal: nat  = (stakedMvkTotalSupply * s.config.minQuorumPercentage) / 10000n ;

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
    s.cycleCounter      := s.cycleCounter + 1n;

} with (s)



// helper function to setup new voting round
function setupVotingRound(var s : governanceStorageType) : governanceStorageType is
block {

    // boundaries fixed to the start and end of the cycle (calculated at start of proposal round)
    s.currentCycleInfo.round               := (Voting : roundType);
    s.currentCycleInfo.roundStartLevel     := s.currentCycleInfo.roundEndLevel + 1n;
    s.currentCycleInfo.roundEndLevel       := s.currentCycleInfo.roundEndLevel + s.currentCycleInfo.blocksPerVotingRound;

    s.timelockProposalId := 0n;                  // flush proposal id in timelock - reset to 0

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



// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; var s : governanceStorageType) : address is
    s.admin



(* View: get config *)
[@view] function getConfig(const _ : unit; var s : governanceStorageType) : governanceConfigType is
    s.config



(* View: get Governance Proxy address *)
[@view] function getGovernanceProxyAddress(const _ : unit; var s : governanceStorageType) : address is
    s.governanceProxyAddress



(* View: get general contracts *)
[@view] function getGeneralContractOpt(const contractName : string; var s : governanceStorageType) : option(address) is
    Map.find_opt(contractName, s.generalContracts)



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; var s : governanceStorageType) : generalContractsType is
    s.generalContracts



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; const s : governanceStorageType) : whitelistContractsType is 
    s.whitelistContracts



(* View: get Whitelist developers *)
[@view] function getWhitelistDevelopers(const _ : unit; var s : governanceStorageType) : whitelistDevelopersType is
    s.whitelistDevelopers



(* View: get a proposal *)
[@view] function getProposalOpt(const proposalId : nat; var s : governanceStorageType) : option(proposalRecordType) is
    Big_map.find_opt(proposalId, s.proposalLedger)



(* View: get a satellite snapshot *)
[@view] function getSnapshotOpt(const satelliteAddress : address; var s : governanceStorageType) : option(governanceSatelliteSnapshotRecordType) is
    Big_map.find_opt(satelliteAddress, s.snapshotLedger)



(* View: get current cycle info *)
[@view] function getCurrentCycleInfo(const _ : unit; var s : governanceStorageType) : currentCycleInfoType is
    s.currentCycleInfo



(* View: get next proposal id *)
[@view] function getNextProposalId(const _ : unit; var s : governanceStorageType) : nat is
    s.nextProposalId



(* View: get cycle counter *)
[@view] function getCycleCounter(const _ : unit; var s : governanceStorageType) : nat is
    s.cycleCounter



(* View: get current cycle highest voted proposal id *)
[@view] function getCycleHighestVotedProposalId(const _ : unit; var s : governanceStorageType) : nat is
    s.cycleHighestVotedProposalId



(* View: get timelock proposal id *)
[@view] function getTimelockProposalId(const _ : unit; var s : governanceStorageType) : nat is
    s.timelockProposalId



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; var s : governanceStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : governanceStorageType) : lambdaLedgerType is
    s.lambdaLedger

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Lambda Methods Begin
//
// ------------------------------------------------------------------------------

// Governance Contract Lambdas :
#include "../partials/contractLambdas/governance/governanceLambdas.ligo"

// ------------------------------------------------------------------------------
//
// Lambda Methods End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Break Glass Entrypoint Begin
// ------------------------------------------------------------------------------

(*  breakGlass entrypoint *)
function breakGlass(var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaBreakGlass"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaBreakGlass(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);
    
} with response



(*  propagateBreakGlass entrypoint *)
function propagateBreakGlass(var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPropagateBreakGlass"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaPropagateBreakGlass(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);
    
} with response

// ------------------------------------------------------------------------------
// Break Glass Entrypoint End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : governanceStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response




(*  setGovernanceProxy entrypoint *)
function setGovernanceProxy(const newGovernanceProxyAddress : address; var s : governanceStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernanceProxy"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaSetGovernanceProxy(newGovernanceProxyAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : governanceStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (*  updateConfig entrypoint *)
function updateConfig(const updateConfigParams : governanceUpdateConfigParamsType; var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);
    
} with response



// (*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : governanceStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : governanceStorageType) : return is
block {
        
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);  

} with response



// (*  updateWhitelistDevelopers entrypoint *)
function updateWhitelistDevelopers(const developer : address; var s : governanceStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistDevelopers"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateWhitelistDevelopers(developer);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams : transferActionType; var s : governanceStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMistakenTransfer"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);  

} with response



// (*  setContractAdmin entrypoint *)
function setContractAdmin(const setContractAdminParams : setContractAdminType; var s : governanceStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetContractAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaSetContractAdmin(setContractAdminParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (*  setContractGovernance entrypoint *)
function setContractGovernance(const setContractGovernanceParams : setContractGovernanceType; var s : governanceStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetContractGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaSetContractGovernance(setContractGovernanceParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Cycle Entrypoints Begin
// ------------------------------------------------------------------------------

(*  updateSatelliteSnapshot entrypoint *)
function updateSatelliteSnapshot(const updateSatelliteSnapshotParams : updateSatelliteSnapshotType; var s : governanceStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateSatelliteSnapshot"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateSatelliteSnapshot(updateSatelliteSnapshotParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



(*  startNextRound entrypoint *)
function startNextRound(const executePastProposal : bool; var s : governanceStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaStartNextRound"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaStartNextRound(executePastProposal);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* propose entrypoint *)
function propose(const newProposal : newProposalType ; var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaPropose"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaPropose(newProposal);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* updateProposalData entrypoint *)
function updateProposalData(const proposalData : updateProposalDataType; var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateProposalData"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdateProposalData(proposalData);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response


// (* updatePaymentData entrypoint *)
function updatePaymentData(const paymentData : updatePaymentDataType; var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdatePaymentData"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaUpdatePaymentData(paymentData);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



(* lockProposal entrypoint *)
function lockProposal(const proposalId : nat; var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaLockProposal"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaLockProposal(proposalId);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* proposalRoundVote entrypoint *)
function proposalRoundVote(const proposalId : nat; var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaProposalRoundVote"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaProposalRoundVote(proposalId);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* votingRoundVote entrypoint *)
function votingRoundVote(const voteType : votingRoundVoteType; var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVotingRoundVote"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaVotingRoundVote(voteType);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* executeProposal entrypoint *)
function executeProposal(var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaExecuteProposal"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaExecuteProposal(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* processProposalPayment entrypoint *)
function processProposalPayment(const proposalID: actionIdType; var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaProcessProposalPayment"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaProcessProposalPayment(proposalID);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* processProposalSingleData entrypoint *)
function processProposalSingleData(var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaProcessProposalSingleData"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaProcessProposalSingleData(unit);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* distributeProposalRewards entrypoint *)
function distributeProposalRewards(const claimParams: distributeProposalRewardsType; var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDistributeProposalRewards"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaDistributeProposalRewards(claimParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);

} with response



// (* dropProposal entrypoint *)
function dropProposal(const proposalId : actionIdType; var s : governanceStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDropProposal"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance lambda action
    const governanceLambdaAction : governanceLambdaActionType = LambdaDropProposal(proposalId);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceLambdaAction, s);
    
} with response

// ------------------------------------------------------------------------------
// Governance Cycle Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : governanceStorageType) : return is
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
function main (const action : governanceAction; const s : governanceStorageType) : return is 

    case action of [

            // Break Glass Entrypoint
        |   BreakGlass(_parameters)                     -> breakGlass(s)
        |   PropagateBreakGlass(_parameters)            -> propagateBreakGlass(s)
        
            // Housekeeping Entrypoints
        |   SetAdmin(parameters)                        -> setAdmin(parameters, s)
        |   SetGovernanceProxy(parameters)              -> setGovernanceProxy(parameters, s)
        |   UpdateMetadata(parameters)                  -> updateMetadata(parameters, s)
        |   UpdateConfig(parameters)                    -> updateConfig(parameters, s)
        |   UpdateGeneralContracts(parameters)          -> updateGeneralContracts(parameters, s)
        |   UpdateWhitelistContracts(parameters)        -> updateWhitelistContracts(parameters, s)
        |   UpdateWhitelistDevelopers(parameters)       -> updateWhitelistDevelopers(parameters, s)
        |   MistakenTransfer(parameters)                -> mistakenTransfer(parameters, s)
        |   SetContractAdmin(parameters)                -> setContractAdmin(parameters, s)
        |   SetContractGovernance(parameters)           -> setContractGovernance(parameters, s)

            // Governance Cycle Entrypoints
        |   UpdateSatelliteSnapshot(parameters)         -> updateSatelliteSnapshot(parameters, s)
        |   StartNextRound(parameters)                  -> startNextRound(parameters, s)
        |   Propose(parameters)                         -> propose(parameters, s)
        |   ProposalRoundVote(parameters)               -> proposalRoundVote(parameters, s)
        |   UpdateProposalData(parameters)              -> updateProposalData(parameters, s)
        |   UpdatePaymentData(parameters)               -> updatePaymentData(parameters, s)
        |   LockProposal(parameters)                    -> lockProposal(parameters, s)
        |   VotingRoundVote(parameters)                 -> votingRoundVote(parameters, s)
        |   ExecuteProposal(_parameters)                -> executeProposal(s)
        |   ProcessProposalPayment(parameters)          -> processProposalPayment(parameters, s)
        |   ProcessProposalSingleData(_parameters)      -> processProposalSingleData(s)
        |   DistributeProposalRewards(parameters)       -> distributeProposalRewards(parameters, s)
        |   DropProposal(parameters)                    -> dropProposal(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                       -> setLambda(parameters, s)

    ]
