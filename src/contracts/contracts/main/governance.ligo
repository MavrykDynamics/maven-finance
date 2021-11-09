// Yay or Nay vote, and the vMVK amount voter has staked - add timestamps?
type voteType is (bool * nat * timestamp)

// Stores all voter data for a proposal
type voterMapType is map (address, voteType)

type proposalRecordType is record [
    proposerAddress      : address;   
    proposerStakeLocked  : nat;          // in sMVK
    status               : nat;         
    title                : string;
    briefDescription     : string;   
    forumPostId          : nat;
    upvoteCount          : nat;
    downvoteCount        : nat; 
    votingPeriodLength   : nat; 
    voters               : voterMapType;  
    minQuorumPercentage  : nat;          // capture state of min quorum percentage
    quorumCount          : nat;          // turnout for quorum
    startDateTime        : timestamp;
]
type proposalLedgerType is big_map (nat, proposalRecordType);

type configType is record [
    successfulProposalReward    : nat;  // incentive reward for successful proposal
    incentiveStakeWeightage     : nat;  // weightage to calculate incentives based on amount staked
    incentiveTimeWeightage      : nat;  // weightage to calculate incentives based on time voted
    fastVotingPeriod            : nat;  // fast voting period: 24 hours
    slowVotingPeriod            : nat;  // slow voting period: 72 hours   
    verySlowVotingPeriod        : nat;  // very slow voting period: 120 hours
    minQuorumPercentage         : nat;  // minimum quorum percentage to be achieved (in sMVK)
    proposalSubmissionFee       : nat;  // e.g. 10 tez per submitted proposal
    proposalMinimumStaked       : nat;  // in percentage of total vMVK supply (e.g. 0.01%)
    maxProposalsPerDelegate     : nat;  // number of active proposals delegate can have at any given time
]

type storage is record [
    admin                       : address;
    config                      : configType;
    proposalLedger              : proposalLedgerType;
    tempSMvkTotalSupply         : nat;  // for quorum use to get total amount
]

type governanceAction is 
    | Propose of (nat)
    | Vote of (nat)
    // | Release of (nat)
    | ExecuteProposal of (nat)
    | ClearProposal of (nat)
    // | ChangeStake of (nat)

const noOperations : list (operation) = nil;
type return is list (operation) * storage

function propose(const _proposal : nat ; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. verify that user is a delegate, is allowed to propose, and is not overdelegated with insufficient bond (proxy with delegation contract)
    // 2. verify that user has staked the minimum amount required
    // 3. submit proposal 
    skip

} with (noOperations, s)

function vote(const _parameters : nat; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. verify that user is a delegate, is allowed to vote, and is not overdelegated with insufficient bond (proxy with delegation contract)
    // 2. verify that proposal exists
    // 3. submit delegator's vote for proposal and update vote counts
    skip
} with (noOperations, s)

// function release(const _parameters : nat; var s : storage) : return is
// block {
//     // Steps Overview: 
//     // - similar to clear for delegator to claim staked amount? 
//     skip
// } with (noOperations, s)

function executeProposal(const _parameters : nat; var s : storage) : return is 
block {
    // Steps Overview: 
    // 1. verify that user is a delegator and can execute proposal
    // 2. verify that proposal can be executed
    // 3. execute proposal - list of operations to run
    skip
} with (noOperations, s)

function clearProposal(const _parameters : nat; var s : storage) : return is 
block {
    // Steps Overview: 
    // 1. verify that proposal is over and can be cleared
    // 2. release staked sMVK back to delegator 
    skip
} with (noOperations, s)

// function changeStake(const _parameters : nat; var s : storage) : return is
// block {
//     skip
// } with (noOperations, s)

function main (const action : governanceAction; const s : storage) : return is 
    case action of
        | Propose(parameters) -> propose(parameters, s)
        | Vote(parameters) -> vote(parameters, s)
        // | Release(parameters) -> release(parameters, s)
        | ExecuteProposal(parameters) -> executeProposal(parameters, s)
        | ClearProposal(parameters) -> clearProposal(parameters, s)
        // | ChangeStake(parameters) -> changeStake(parameters, s)
    end