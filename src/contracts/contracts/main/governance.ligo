// Yay or Nay vote, and the vMVK amount voter has staked - add timestamps?
type voteType is (bool * nat * timestamp)

// Amount of blocks.
type blocks is record [ 
    blocks : nat ;
    ]

// Length of a stage, in number of blocks
type period is blocks


// Frozen token history for an address.
// This tracks the stage number in which it was last updated and differentiates between
// tokens that were frozen during that stage and the ones frozen in any other before.
// It does so because only tokens that were frozen in the past can be staked, which is
// also why it tracks staked tokens in a single field.
type address_freeze_history is record [ 
    current_stage_num : nat;
    staked : nat;
    current_unstaked : nat;
    past_unstaked : nat;
  ]

// Stores all voter data for a proposal
type voterMapType is map (address, voteType)

type proposalRecordType is record [
    proposerAddress      : address;   
    proposerStakeLocked  : nat;          // in sMVK 
    status               : nat;         
    title                : string;
    description     : string;   
    forumPostId          : nat;
    upvoteCount          : nat;
    downvoteCount        : nat;     
    voters               : voterMapType;  
    minQuorumPercentage  : nat;          // capture state of min quorum percentage
    quorumCount          : nat;          // turnout for quorum
    startDateTime        : timestamp;
    // from basedao as reference
    start_level          : blocks; // block level of submission, used to order proposals
    voting_stage_num     : nat;    // stage number in which it is possible to vote on this proposal
]
type proposalLedgerType is big_map (nat, proposalRecordType);

type configType is record [
    successfulProposalReward    : nat;  // incentive reward for successful proposal
    incentiveStakeWeightage     : nat;  // weightage to calculate incentives based on amount staked
    incentiveTimeWeightage      : nat;  // weightage to calculate incentives based on time voted    
    minQuorumPercentage         : nat;  // minimum quorum percentage to be achieved (in sMVK)
    proposalSubmissionFee       : nat;  // e.g. 10 tez per submitted proposal
    proposalMinimumStaked       : nat;  // in percentage of total vMVK supply (e.g. 0.01%)
    maxProposalsPerDelegate     : nat;  // number of active proposals delegate can have at any given time
]

type storage is record [
    admin                       : address;
    config                      : configType;
    proposalLedger              : proposalLedgerType;
    frozenSMvkTotalSupply       : nat;  // for quorum calculation use - frozen sMVK total supply will be updated at beginning of proposal round
    startLevel                  : blocks; // Tezos.level as start level
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
    // 1. verify that the current round is a governance proposal round
    // 2. take snapshot of all existing satellite voting power (loop to mint sMVK tokens) 
    //    - save in sMVK token contract? save a record of all satellites' voting power for each round? - another big_map
    //    - loop to capture frozen sMVK total supply and store it for the round
    // 3. verify that user is a satellite, has sufficient bond to propose (proxy with delegation contract)
    // 4. submit proposal 
    // 5. proposer's automatically votes with his total sMVK (from step 2 and 3) for the proposal
    skip

} with (noOperations, s)

function vote(const _parameters : nat; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. verify that proposal exists
    // 2. verify that user is a satellite, and is allowed to vote (proxy with delegation contract)    
    // 3. get satellite's sMVK balance from sMVK token contract (or from governance current round voting power big_map depending on implementation)
    // 4. submit satellite's vote for proposal and update vote counts
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
    // 1. verify that user is a satellite and can execute proposal
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