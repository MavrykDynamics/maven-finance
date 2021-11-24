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

type newProposalType is (string * string * string) // title, description, invoice ipfs

type proposalRecordType is record [
    proposerAddress      : address;

    status               : nat;         
    title                : string;
    description          : string;   
    invoice              : string;                  // ipfs hash of invoice file
    successReward        : nat;                     // log of successful proposal reward for voters - may change over time
    
    passVoteCount        : nat;                     // proposal round: pass votes count (to proceed to voting round)
    passVoteMvkTotal     : nat;                     // proposal round pass vote total mvk from satellites who voted pass
    passVotersMap        : passVotersMapType;       // proposal round ledger

    upvoteCount          : nat;                     // voting round: upvotes count
    downvoteCount        : nat;                     // voting round: downvotes count
    abstainCount         : nat;                     // voting round: abstain count
    voters               : proposalVoterMapType;    // voting round ledger

    minQuorumPercentage  : nat;                     // log of min quorum percentage - capture state at this point as min quorum percentage may change over time
    quorumCount          : nat;                     // turnout for voting round - number of satellites who voted
    startDateTime        : timestamp;               // log of when the proposal was proposed

    currentRoundStartLevel   : nat;                 // 
    currentRoundEndLevel     : nat;                 // 
    currentCycleEndLevel     : nat;                 // 
]
type proposalLedgerType is big_map (nat, proposalRecordType);

// snapshot will be valid for current cycle only (proposal + voting rounds)
type snapshotRecordType is record [
    totalMvkBalance           : nat;      // log of satellite's total mvk balance for this cycle
    totalDelegatedAmount      : nat;      // log of satellite's total delegated amount 
    totalVotingPower          : nat;      // log calculated total voting power 
    currentRoundStartLevel    : nat;      // log of current or start block level of proposal round
    currentRoundEndLevel      : nat;      // log of when proposal round will end
    currentCycleEndLevel      : nat;      // log of when cycle (proposal + voting) will end
]
type snapshotLedgerType is big_map (address, snapshotRecordType);


// type satelliteSetType is set(address);

type configType is record [
    
    successReward               : nat;  // incentive reward for successful proposal
    minQuorumPercentage         : nat;  // minimum quorum percentage to be achieved (in sMVK)
    
    votingPowerRatio            : nat;  // votingPowerRatio (e.g. 10% -> 10_000) - percentage to determine satellie's max voting power and if satellite is overdelegated (requires more vMVK to be staked) or underdelegated - similar to self-bond percentage in tezos
    proposalSubmissionFee       : nat;  // e.g. 10 tez per submitted proposal
    minimumStakeReqPercentage   : nat;  // minimum amount of MVK required in percentage of total vMVK supply (e.g. 0.01%)

    maxProposalsPerDelegate     : nat;  // number of active proposals delegate can have at any given time
    timelockDuration            : nat;  // timelock duration in blocks - 2 days e.g. 5760 blocks (one block is 30secs with granadanet) - 1 day is 2880 blocks
    
    newBlockTimeLevel           : nat;  // block level where new blocksPerMinute takes effect -> if none, use blocksPerMinute (old); if exists, check block levels, then use newBlocksPerMinute if current block level exceeds block level, if not use old blocksPerMinute
    newBlocksPerMinute          : nat;  // new blocks per minute 
    blocksPerMinute             : nat;  // to account for eventual changes in blocks per minute (and blocks per day / time) - todo: change to allow decimal
    
    blocksPerProposalRound      : nat;  // to determine duration of proposal round
    blocksPerVotingRound        : nat;  // to determine duration of voting round
]

// type currentProposalCheckType is proposalRecordType | unit;

type storage is record [
    admin                       : address;
    config                      : configType;
    
    proposalLedger              : proposalLedgerType;
    snapshotLedger              : snapshotLedgerType;

    activeSatellitesMap         : map(address, timestamp); // set of satellite addresses - for running loops - not intended to be extremely large, so satellite entry requirements have to be considered

    startLevel                  : blocks;    // use Tezos.level as start level
    nextProposalId              : nat;       // counter of next proposal id
    
    // current round state variables
    currentRound                : string;    // proposal or voting
    currentRoundStartLevel      : nat;       // current round starting block level
    currentRoundEndLevel        : nat;       // current round ending block level
    currentCycleEndLevel        : nat;       // current cycle (proposal + voting) ending block level 
    currentRoundProposals       : map(nat, nat);     // proposal id, status (placeholder)
    currentRoundVotes           : map(address, nat); // satelliteAddress, proposal id
    currentProposalCheck        : nat;           // set to 0 if there is no proposal currently, if not set to proposal id
    currentTimelockCheck        : nat;           // set to 0 if there is proposal in timelock, if not set to proposal id

    delegationAddress           : address; 
    mvkTokenAddress             : address; 
    snapshotMvkTotalSupply      : nat;       // for quorum calculation use - snapshot of total MVK supply 
]

type governanceAction is 
    | SetDelegationAddress of (address)
    | StartProposalRound of (unit)

    | Propose of newProposalType
    | ProposalRoundVote of (nat)
    | StartVotingRound of (unit)

    | VotingRoundVote of (nat)
    | SetTempMvkTotalSupply of (nat)

    | UpdateActiveSatellitesMap of (address)
    | SetSatelliteVotingPowerSnapshot of (address * nat * nat)

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

// helper functions begin: --------------------------------------------------------------------------------------

// helper function to fetch satellite's balance and total delegated amount from delegation contract
function fetchSatelliteBalanceAndTotalDelegatedAmount(const tokenAddress : address) : contract(address * contract(address * nat * nat)) is
  case (Tezos.get_entrypoint_opt(
      "%getSatelliteVotingPower",
      tokenAddress) : option(contract(address * contract(address * nat * nat)))) of
    Some(contr) -> contr
  | None -> (failwith("GetSatelliteVotingPower entrypoint in Delegation Contract not found") : contract(address * contract(address * nat * nat)))
  end;

// helper function to get satellite snapshot 
function getSatelliteSnapshotRecord (const satelliteAddress : address; const s : storage) : snapshotRecordType is
  block {
    var satelliteSnapshotRecord : snapshotRecordType :=
      record [
        totalMvkBalance         = 0n;                            // log of satellite's total mvk balance for this cycle
        totalDelegatedAmount    = 0n;                            // log of satellite's total delegated amount 
        totalVotingPower        = 0n;
        currentRoundStartLevel  = s.currentRoundStartLevel;      // log of current or start block level of proposal round
        currentRoundEndLevel    = s.currentRoundEndLevel;        // log of when proposal round will end
        currentCycleEndLevel    = s.currentCycleEndLevel         // log of when cycle (proposal + voting) will end
      ];

    case s.snapshotLedger[satelliteAddress] of
      None -> skip
    | Some(instance) -> satelliteSnapshotRecord := instance
    end;

  } with satelliteSnapshotRecord

// helper function to get token total supply (for MVK and vMVK)
function getTokenTotalSupply(const tokenAddress : address) : contract(contract(nat)) is
  case (Tezos.get_entrypoint_opt(
      "%getTotalSupply",
      tokenAddress) : option(contract(contract(nat)))) of
    Some(contr) -> contr
  | None -> (failwith("GetTotalSupply entrypoint in Token Contract not found") : contract(contract(nat)))
  end;

// helper functions end: --------------------------------------------------------------------------------------

// housekeeping functions begin: --------------------------------------------------------------------------------

// set delegation contract address
function setDelegationAddress(const parameters : address; var s : storage) : return is
block {
    checkSenderIsAdmin(s); // check that sender is admin
    s.delegationAddress := parameters;
} with (noOperations, s)

// set temp MVK total supply
function setTempMvkTotalSupply(const totalSupply : nat; var s : storage) is
block {
    checkNoAmount(Unit);                    // should not receive any tez amount
    checkSenderIsMvkTokenContract(s);       // check this call is comming from the mvk Token contract
    s.snapshotMvkTotalSupply := totalSupply;
} with (noOperations, s)

// housekeeping functions end: --------------------------------------------------------------------------------

function updateActiveSatellitesMap(const satelliteAddress : address; var s : storage) is 
block {

    // checkNoAmount(Unit);                      // should not receive any tez amount
    // checkSenderIsDelegationContract(s);       // check this call is comming from the Delegation contract

    // check if user has delegated to a satellite
    const activeSatelliteExistsFlag : bool = Map.mem(satelliteAddress, s.activeSatellitesMap);

    if activeSatelliteExistsFlag = False then block{
        s.activeSatellitesMap[satelliteAddress] := Tezos.now;
    } else block {
        remove satelliteAddress from map s.activeSatellitesMap
    };

} with (noOperations, s)

function setSatelliteVotingPowerSnapshot(const satelliteAddress : address; const mvkBalance : nat; const totalDelegatedAmount : nat; var s : storage) : return is 
block {

    checkNoAmount(Unit);                // should not receive any tez amount      
    checkSenderIsDelegationContract(s); // check sender is Delegation Contract

    // create or retrieve satellite snapshot from snapshotLedger in storage
    var satelliteSnapshotRecord : snapshotRecordType := getSatelliteSnapshotRecord(satelliteAddress, s);

    // calculate total voting power 
    const maxTotalVotingPower = abs(mvkBalance * 10000 / s.config.votingPowerRatio);
    const mvkBalanceAndTotalDelegatedAmount = mvkBalance + totalDelegatedAmount; 
    var totalVotingPower : nat := 0n;
    if mvkBalanceAndTotalDelegatedAmount > maxTotalVotingPower then totalVotingPower := maxTotalVotingPower
      else totalVotingPower := mvkBalanceAndTotalDelegatedAmount;

    // update satellite snapshot record
    satelliteSnapshotRecord.totalMvkBalance         := mvkBalance; 
    satelliteSnapshotRecord.totalDelegatedAmount    := totalDelegatedAmount; 
    satelliteSnapshotRecord.totalVotingPower        := totalVotingPower;
    satelliteSnapshotRecord.currentRoundStartLevel  := s.currentRoundStartLevel; 
    satelliteSnapshotRecord.currentRoundEndLevel    := s.currentRoundEndLevel; 
    satelliteSnapshotRecord.currentCycleEndLevel    := s.currentCycleEndLevel; 

    s.snapshotLedger[satelliteAddress] := satelliteSnapshotRecord;

} with (noOperations, s)


function startProposalRound(var s : storage) : return is
block {
    
    // Steps Overview:
    // 1. verify sender is self / admin ? todo: check who can trigger this entrypoint
    // 2. reset currentProposalCheck and currentTimelockCheck
    // 3. update currentRound, currentRoundStartLevel, currentRoundEndLevel
    // 5. take snapshot of satellite's MVK and update snapshotLedger
    // 4. take snapshot of MVK total supply 

    // check that sender is admin
    checkSenderIsAdmin(s);

    var operations : list(operation) := nil;

    s.currentProposalCheck    := 0n;         // id of proposal - reset to 0 
    s.currentTimelockCheck    := 0n;         // id of proposal - reset to 0

    s.currentRound               := "proposal";
    // s.currentRoundStartLevel  := Tezos.level;
    // s.currentRoundEndLevel    := Tezos.level + s.config.blocksPerProposalRound;
    // s.currentCycleEndLevel    := Tezos.level + s.config.blocksPerProposalRound + s.config.blocksPerVotingRound;
    
    // update temp MVK total supply
    const setTempMvkTotalSupplyCallback : contract(nat) = Tezos.self("%setTempMvkTotalSupply");    
    const updateMvkTotalSupplyOperation : operation = Tezos.transaction(
        (setTempMvkTotalSupplyCallback),
         0tez, 
         getTokenTotalSupply(s.mvkTokenAddress)
         );

    operations := updateMvkTotalSupplyOperation # operations;

    // loop currently active satellites and fetch their total voting power from delegation contract, with callback to governance contract to set satellite's voting power
    for satellite -> _timestamp in map s.activeSatellitesMap block {
        const setSatelliteVotingPowerSnapshotCallback : contract(address * nat * nat) = Tezos.self("%setSatelliteVotingPowerSnapshot");
        const fetchSatelliteBalanceAndTotalDelegatedAmountOperation : operation = Tezos.transaction(
            (satellite, setSatelliteVotingPowerSnapshotCallback), 
            0tez, 
            fetchSatelliteBalanceAndTotalDelegatedAmount(s.delegationAddress)
        );
        operations := fetchSatelliteBalanceAndTotalDelegatedAmountOperation # operations;
    } 

} with (operations, s)

function propose(const newProposal : newProposalType ; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. verify that the current round is a governance proposal round
    // 2. verify that user is a satellite, has sufficient bond to propose (proxy with delegation contract)
    // 3. todo: check that proposer has sent enough tez to cover the submission fee
    // 4. submit (save) proposal - proposer does not automatically vote pass for his proposal
    // 5. add proposal id to current round proposals map
    
    if s.currentRound = "proposal" then skip
        else failwith("You can only make a proposal during a proposal round.");

    // check if satellite exists in the active satellites map
    const activeSatelliteExistsFlag : bool = Map.mem(Tezos.sender, s.activeSatellitesMap);
    if activeSatelliteExistsFlag = False then failwith("You need to be a satellite to make a governance proposal.")
      else skip;

    const satelliteSnapshot : snapshotRecordType = case s.snapshotLedger[Tezos.sender] of
        None -> failwith("Error. Snapshot of your holdings not taken. Please wait for the next governance round.")
        | Some(snapshot) -> snapshot
    end;

    // minimumStakeReqPercentage - 5% -> 500 | snapshotMvkTotalSupply - mu 
    const minimumMvkRequiredForProposalSubmission = s.config.minimumStakeReqPercentage * s.snapshotMvkTotalSupply / 10_000;

    if satelliteSnapshot.totalMvkBalance < abs(minimumMvkRequiredForProposalSubmission) then failwith("You do not have the minimum MVK required to submit a proposal.")
      else skip; 

    const satelliteTotalVotingPower = satelliteSnapshot.totalMvkBalance + satelliteSnapshot.totalDelegatedAmount;

    // include proposer as the first voter for the proposal to pass
    // const passVotersMap       : passVotersMapType     = map [Tezos.sender -> (satelliteTotalVotingPower, Tezos.now)];
    const emptyPassVotersMap  : passVotersMapType     = map [];
    const emptyVotersMap      : proposalVoterMapType  = map [];

    var newProposalRecord : proposalRecordType := record [
        proposerAddress         = Tezos.sender;

        status                  = 1n;         
        title                   = newProposal.0;
        description             = newProposal.1;   
        invoice                 = newProposal.2;                   // ipfs hash of invoice file
        successReward           = s.config.successReward;          // log of successful proposal reward for voters - may change over time
        
        passVoteCount           = 1n;                              // proposal round: pass votes count (to proceed to voting round)
        passVoteMvkTotal        = satelliteTotalVotingPower;       // proposal round pass vote total mvk from satellites who voted pass
        passVotersMap           = emptyPassVotersMap;              // proposal round ledger

        upvoteCount             = 0n;                              // voting round: upvotes count
        downvoteCount           = 0n;                              // voting round: downvotes count
        abstainCount            = 0n;                              // voting round: abstain count
        voters                  = emptyVotersMap;                  // voting round ledger

        minQuorumPercentage     = s.config.minQuorumPercentage;    // log of min quorum percentage - capture state at this point as min quorum percentage may change over time
        quorumCount             = 0n;                              // turnout for voting round - number of satellites who voted
        startDateTime           = Tezos.now;                       // log of when the proposal was proposed

        currentRoundStartLevel  = s.currentRoundStartLevel;        // log current round start level
        currentRoundEndLevel    = s.currentRoundEndLevel;          // log current round end level
        currentCycleEndLevel    = s.currentCycleEndLevel;          // log current cycle end level
    ];

    // save proposal to proposalLedger
    s.proposalLedger[s.nextProposalId] := newProposalRecord;

    // add proposal id to current round proposals
    s.currentRoundProposals[s.nextProposalId] := 1n;

    // increment next proposal id
    s.nextProposalId := s.nextProposalId + 1n;

} with (noOperations, s)


function proposalRoundVote(const proposalId : nat; var s : storage) : return is 
block {
    // Steps Overview:
    // 1. verify that current round is a proposal round
    // 2. verify that user is an active satellite and is allowed to vote (address is in activeSatellitesMap)
    // 3. verify that snapshot of satellite has been taken
    // 4. verify that proposal exists
    // 5. verify that user voting does not have any other proposals 
    // 6. submit satellite's vote for proposal and update vote counts

    if s.currentRound = "proposal" then skip
      else failwith("You can only make a proposal during a proposal round.");

    // check if satellite exists in the active satellites map
    const activeSatelliteExistsFlag : bool = Map.mem(Tezos.sender, s.activeSatellitesMap);
    if activeSatelliteExistsFlag = False then failwith("You need to be a satellite to vote for a governance proposal.")
      else skip;

    const _satelliteSnapshot : snapshotRecordType = case s.snapshotLedger[Tezos.sender] of
        None -> failwith("Error. Snapshot of your holdings not taken. Please wait for the next governance round.")
        | Some(snapshot) -> snapshot
    end;

    // check if proposal exists in the current round's proposals
    const checkProposalExistsFlag : bool = Map.mem(proposalId, s.currentRoundProposals);
    if checkProposalExistsFlag = False then failwith("Error: Proposal not found.")
      else skip;

    var _proposal : proposalRecordType := case s.proposalLedger[proposalId] of
        Some(proposal) -> proposal
        | None -> failwith("Error: Proposal not found")
    end;

    // proposal[passVoteCount] 

} with (noOperations, s)


function startVotingRound(var s : storage) : return is
block {
    
    // Steps Overview:
    // 1. verify current block level is more than or equal to current round end level 
    // 2. set current round from "proposal" to "voting", and reset current round start level and end level - current round should be equal to current cycle end level - timelock duration
    // 3. get ids of current proposals, and select the proposer 
    
    checkSenderIsAdmin(s);

    skip
} with (noOperations, s)


function votingRoundVote(const _parameters : nat; var s : storage) : return is 
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
        | SetDelegationAddress(parameters) -> setDelegationAddress(parameters, s)  
        
        | StartProposalRound(_parameters) -> startProposalRound(s)
        | Propose(parameters) -> propose((parameters.0, parameters.1, parameters.2), s)
        | ProposalRoundVote(parameters) -> proposalRoundVote(parameters, s)

        | StartVotingRound(_parameters) -> startVotingRound(s)        
        | VotingRoundVote(parameters) -> votingRoundVote(parameters, s)
        
        | SetTempMvkTotalSupply(parameters) -> setTempMvkTotalSupply(parameters, s)
        | UpdateActiveSatellitesMap(parameters) -> updateActiveSatellitesMap(parameters, s)
        | SetSatelliteVotingPowerSnapshot(parameters) -> setSatelliteVotingPowerSnapshot(parameters.0, parameters.1, parameters.2, s)

        | ExecuteProposal(parameters) -> executeProposal(parameters, s)
        | ClearProposal(parameters) -> clearProposal(parameters, s)

    end