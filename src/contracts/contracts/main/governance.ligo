// Amount of blocks.
type blocks is record [ 
    blocks : nat ;
    ]

// Length of a stage, in number of blocks
type period is blocks

// Stores all voter data during proposal round
type proposalRoundVoteType is (nat * timestamp)       // total voting power (MVK) * timestamp
type passVotersMapType is map (address, proposalRoundVoteType)

// Stores all voter data during voting round
type votingRoundVoteType is (nat * nat * timestamp)       // 1 is Yay, 0 is Nay, 2 is abstain * total voting power (MVK) * timestamp
type proposalVoterMapType is map (address, votingRoundVoteType)

type proposalRecordType is record [
    proposerAddress      : address;

    status               : nat;         
    title                : string;
    description          : string;   
    invoice              : string;                  // ipfs hash of invoice file
    successReward        : nat;                     // log of successful proposal reward for voters - may change over time
    
    passVoteCount        : nat;                     // proposal round: pass votes count (to proceed to voting round)
    passVotersMap        : passVotersMapType;       // proposal round ledger

    upvoteCount          : nat;                     // voting round: upvotes count
    downvoteCount        : nat;                     // voting round: downvotes count
    abstainCount         : nat;                     // voting round: abstain count
    voters               : proposalVoterMapType;    // voting round ledger

    minQuorumPercentage  : nat;                     // log of min quorum percentage - capture state at this point as min quorum percentage may change over time
    quorumCount          : nat;                     // turnout for voting round - number of satellites who voted
    startDateTime        : timestamp;               // log of when the proposal was proposed

    startLevel           : nat;                     // block level of submission, used to order proposals
    votingStageNum       : nat;                     // stage number in which it is possible to vote on this proposal
]
type proposalLedgerType is big_map (nat, proposalRecordType);

type snapshotRecordType is record [
    totalBond           : nat;      // log of satellite's total bond at this period
    totalDelegated      : nat;      // log of satellite's total delegated amount 
    startBlockLevel     : nat;      // log of current or start block level of proposal period
    endBlockLevel       : nat;      // log of when proposal period will end
]
type snapshotLedgerType is big_map (address, snapshotRecordType);


type satelliteSetType is set(address);

type configType is record [
    
    successReward               : nat;  // incentive reward for successful proposal
    minQuorumPercentage         : nat;  // minimum quorum percentage to be achieved (in sMVK)
    
    proposalSubmissionFee       : nat;  // e.g. 10 tez per submitted proposal
    minimumStakeReqPercentage   : nat;  // minimum amount of MVK required in percentage of total vMVK supply (e.g. 0.01%)

    maxProposalsPerDelegate     : nat;  // number of active proposals delegate can have at any given time

    timelockDuration            : nat;  // timelock duration in blocks - 2 days e.g. 5760 blocks (one block is 30secs with granadanet) - 1 day is 2880 blocks
    
    newBlockTimeLevel           : nat;  // block level where new blocksPerMinute takes effect -> if none, use blocksPerMinute (old); if exists, check block levels, then use newBlocksPerMinute if current block level exceeds block level, if not use old blocksPerMinute
    newBlocksPerMinute          : nat;  // new blocks per minute 
    blocksPerMinute             : nat;  // to account for eventual changes in blocks per minute (and blocks per day / time) - todo: change to allow decimal
    
    blocksPerProposalPeriod     : nat;  // to determine duration of proposal period
    blocksPerVotingPeriod       : nat;  // to determine duration of voting period
]

// type currentProposalCheckType is proposalRecordType | unit;

type storage is record [
    admin                       : address;
    config                      : configType;
    
    proposalLedger              : proposalLedgerType;
    snapshotLedger              : snapshotLedgerType;

    satelliteSet                : satelliteSetType; // set of satellite addresses - for running loops

    startLevel                  : blocks;    // use Tezos.level as start level
    nextProposalId              : nat;       // counter of next proposal id
    
    currentRound                : string;    // proposal or voting
    currentRoundStartLevel      : nat;       // current round starting block level
    currentRoundEndLevel        : nat;       // current round ending block level

    // currentProposalCheck        : option(proposalRecordType);           // option: may be empty
    // currentTimelockCheck        : option(proposalRecordType);           // option: may be empty

    currentProposalCheck        : nat;           // set to 0 if there is no proposal currently, if not set to proposal id
    currentTimelockCheck        : nat;           // set to 0 if there is proposal in timelock, if not set to proposal id

    delegationAddress           : address; 
    mvkTokenAddress             : address; 
    snapshotMvkTotalSupply      : nat;       // for quorum calculation use - snapshot of total MVK supply 
]

type updateSatelliteSetParams is (address * nat)
type governanceAction is 
    | StartProposalRound of (unit)
    | Propose of (nat)
    | StartVotingRound of (unit)
    | Vote of (nat)
    | SetTempMvkTotalSupply of (nat)
    | UpdateSatelliteSet of updateSatelliteSetParams
    // | Release of (nat) - flush?
    | ExecuteProposal of (nat)
    | ClearProposal of (nat)

const noOperations : list (operation) = nil;
type return is list (operation) * storage

// admin helper functions begin ---------------------------------------------------------------------------------
function checkSenderIsAdmin(var s : storage) : unit is
    if (Tezos.sender = s.admin) then unit
    else failwith("Only the administrator can call this entrypoint.");

function checkSenderIsDelegationContract(var s : storage) : unit is
    if (Tezos.sender = s.delegationAddress) then unit
    else failwith("Only the Delegation Contract can call this entrypoint.");

function checkSenderIsMvkTokenContract(var s : storage) : unit is
    if (Tezos.sender = s.mvkTokenAddress) then unit
    else failwith("Only the MVK Token Contract can call this entrypoint.");

  function checkNoAmount(const _p : unit) : unit is
    if (Tezos.amount = 0tez) then unit
    else failwith("This entrypoint should not receive any tez.");
// admin helper functions end -----------------------------------------------------------------------------------

// helper function to get User's vMVK balance from vMVK token address
// function fetchMvkBalance(const tokenAddress : address) : contract(address * contract(nat)) is
//   case (Tezos.get_entrypoint_opt(
//       "%getBalance",
//       tokenAddress) : option(contract(address * contract(nat)))) of
//     Some(contr) -> contr
//   | None -> (failwith("GetBalance entrypoint in MVK Token Contract not found") : contract(address * contract(nat)))
//   end;

// helper function to get satellite snapshot 
// function getSatelliteSnapshotRecord (const satelliteAddress : address; const s : storage) : snapshotRecordType is
//   block {
//     var satelliteSnapshotRecord : snapshotRecordType :=
//       record [
//         totalBond           : 0n;       // log of satellite's total bond at this period
//         totalDelegated      : 0n;       // log of satellite's total delegated amount 
//         startBlockLevel     : 0n;      // log of current or start block level of proposal period
//         endBlockLevel       : 0n;      // log of when proposal period will end
//       ];

//     case s.snapshotLedger[satelliteAddress] of
//       None -> skip
//     | Some(instance) -> satelliteSnapshotRecord := instance
//     end;
//   } with satelliteRecord

function updateSatelliteSet(const _satelliteAddress : address; const _updateType : nat; var s : storage) is
block {
    checkNoAmount(Unit);                      (* Should not receive any tez amount *)
    checkSenderIsDelegationContract(s);       (* Check this call is comming from the Delegation contract *)

    var _satelliteSet : set(address) := s.satelliteSet;

    // if updateType = 1n then Set.add(satelliteAddress, satelliteSet)
    //     else Set.remove(satelliteAddress, satelliteSet)

} with (noOperations, s);

// helper function to get token total supply (for MVK and vMVK)
function getTokenTotalSupply(const tokenAddress : address) : contract(contract(nat)) is
  case (Tezos.get_entrypoint_opt(
      "%getTotalSupply",
      tokenAddress) : option(contract(contract(nat)))) of
    Some(contr) -> contr
  | None -> (failwith("GetTotalSupply entrypoint in Token Contract not found") : contract(contract(nat)))
  end;

function setTempMvkTotalSupply(const totalSupply : nat; var s : storage) is
block {
    checkNoAmount(Unit);                    (* Should not receive any tez amount *)
    checkSenderIsMvkTokenContract(s);       (* Check this call is comming from the mvk Token contract *)
    s.snapshotMvkTotalSupply := totalSupply;
} with (noOperations, s);

function setSatelliteVotingPowerSnapshot(const _mvkBalance : nat; var s : storage) : return is 
block {

    // check sender is Delegation Contract
    checkSenderIsDelegationContract(s);

    // Retrieve satellite snapshot from snapshotLedger in storage
    // var satelliteSnapshotRecord : snapshotRecordType := getSatelliteSnapshotRecord(Tezos.source, s);

    // update satellite totalDelegatedAmount balance
    // satelliteRecord.totalDelegatedAmount := satelliteRecord.totalDelegatedAmount + vMvkBalance; 
    
    // update satellite ledger storage with new balance
    // s.satelliteLedger[delegateRecord.satelliteAddress] := satelliteRecord;

} with (noOperations, s)


function startProposalRound(var s : storage) : return is
block {
    
    // Steps Overview:
    // 1. verify sender is self / admin ? todo: check who can trigger this entrypoint
    // 2. clear currentProposalCheck and currentTimelockCheck
    // 3. take snapshot of satellite's MVK and update snapshotLedger
    // 4. take snapshot of MVK total supply 
    // 5. update currentRound, currentRoundStartLevel, currentRoundEndLevel

    // check that sender is admin
    checkSenderIsAdmin(s);

    // update temp MVK total supply
    const setTempMvkTotalSupplyCallback : contract(nat) = Tezos.self("%setTempMvkTotalSupply");    
    const updateMvkTotalSupplyOperation : operation = Tezos.transaction(
        (setTempMvkTotalSupplyCallback),
         0tez, 
         getTokenTotalSupply(s.mvkTokenAddress)
         );

    const operations : list(operation) = list [updateMvkTotalSupplyOperation];

    s.currentProposalCheck    := 0n;         // reset to 0
    s.currentTimelockCheck    := 0n;         // reset to 0

    s.currentRound            := "proposal";
    // s.currentRoundStartLevel  := Tezos.level;
    // s.currentRoundEndLevel    := Tezos.level + s.config.blocksPerProposalPeriod;

} with (operations, s)

function propose(const _proposal : nat ; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. verify that the current round is a governance proposal round
    // 2. verify that user is a satellite, has sufficient bond to propose (proxy with delegation contract)
    // 3. submit proposal 
    // 4. proposer's automatically votes with his total sMVK (from step 2 and 3) for the proposal
    
    if s.currentRound = "proposal" then skip
        else failwith("You can only make a proposal during a proposal round.")

} with (noOperations, s)


function startVotingRound(var s : storage) : return is
block {
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

function main (const action : governanceAction; const s : storage) : return is 
    case action of
        | StartProposalRound(_parameters) -> startProposalRound(s)
        | Propose(parameters) -> propose(parameters, s)
        | StartVotingRound(_parameters) -> startVotingRound(s)
        | Vote(parameters) -> vote(parameters, s)
        | SetTempMvkTotalSupply(parameters) -> setTempMvkTotalSupply(parameters, s)
        | UpdateSatelliteSet(parameters) -> updateSatelliteSet(parameters.0, parameters.1, s)
        // | Release(parameters) -> release(parameters, s)
        | ExecuteProposal(parameters) -> executeProposal(parameters, s)
        | ClearProposal(parameters) -> clearProposal(parameters, s)

    end