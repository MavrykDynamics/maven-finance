// ------------------------------------------------------------------------------
// General Types
// ------------------------------------------------------------------------------


type proposalIdType is nat
type requestIdType is nat; 
type metadata is big_map (string, bytes);

// ------------------------------------------------------------------------------
// Satellite Types
// ------------------------------------------------------------------------------


type satelliteRecordType is [@layout:comb] record [
    status                : nat;        // active: 1; inactive: 0; 
    stakedMvkBalance      : nat;        // bondAmount -> staked MVK Balance
    satelliteFee          : nat;        // fee that satellite charges to delegates ? to be clarified in terms of satellite distribution
    totalDelegatedAmount  : nat;        // record of total delegated amount from delegates
    
    name                  : string;     // string for name
    description           : string;     // string for description
    image                 : string;     // ipfs hash
    website               : string;     // satellite website if it has one
    
    registeredDateTime    : timestamp;  
]


// ------------------------------------------------------------------------------
// Governance Cycle Round Types
// ------------------------------------------------------------------------------

type newProposalType is [@layout:comb] record [
  title              : string;
  description        : string;
  invoice            : string; // IPFS file
  sourceCode         : string;
  proposalMetadata   : option(map(string,bytes));
  paymentMetadata    : option(map(string,transferDestinationType));
]

// Stores all voter data during proposal round
type proposalRoundVoteType is (nat * timestamp)                             // total voting power (MVK) * timestamp
type passVotersMapType is map (address, proposalRoundVoteType)

// Stores all voter data during voting round
type voteForProposalChoiceType is 
  Yay of unit
| Nay of unit
| Abstain of unit
type votingRoundVoteType is [@layout:comb] record [
  vote  : voteForProposalChoiceType;
  empty : unit;
]
type votingRoundRecordType is (nat * timestamp * voteForProposalChoiceType)   // 1 is Yay, 0 is Nay, 2 is abstain * total voting power (MVK) * timestamp
type votersMapType is map (address, votingRoundRecordType)

type proposalMetadataType is map (string, bytes)
type paymentMetadataType  is map (string, transferDestinationType)

type proposalRecordType is [@layout:comb] record [
    
    proposerAddress                   : address;
    proposalMetadata                  : proposalMetadataType;
    proposalMetadataExecutionCounter  : nat;
    paymentMetadata                   : paymentMetadataType;
  
    status                            : string;                  // status - "ACTIVE", "DROPPED"
    title                             : string;                  // title
    description                       : string;                  // description
    invoice                           : string;                  // ipfs hash of invoice file
    sourceCode                        : string;                  // link to github / repo
  
    successReward                     : nat;                     // log of successful proposal reward for voters - may change over time
    executed                          : bool;                    // true / false
    isSuccessful                      : bool;                    // true / false
    paymentProcessed                  : bool;                    // true / false
    locked                            : bool;                    // true / false
  
    passVoteCount                     : nat;                     // proposal round: pass votes count - number of satellites
    passVoteMvkTotal                  : nat;                     // proposal round pass vote total mvk from satellites who voted pass
    passVotersMap                     : passVotersMapType;       // proposal round ledger
  
    minProposalRoundVotePercentage    : nat;          // min vote percentage of total MVK supply required to pass proposal round
    minProposalRoundVotesRequired     : nat;          // min staked MVK votes required for proposal round to pass
  
    upvoteCount                       : nat;                     // voting round: upvotes count - number of satellites
    upvoteMvkTotal                    : nat;                     // voting round: upvotes MVK total
    downvoteCount                     : nat;                     // voting round: downvotes count - number of satellites
    downvoteMvkTotal                  : nat;                     // voting round: downvotes MVK total
    abstainCount                      : nat;                     // voting round: abstain count - number of satellites
    abstainMvkTotal                   : nat;                     // voting round: abstain MVK total
    voters                            : votersMapType;           // voting round ledger
  
    minQuorumPercentage               : nat;                     // log of min quorum percentage - capture state at this point as min quorum percentage may change over time
    minQuorumMvkTotal                 : nat;                     // log of min quorum in MVK - capture state at this point
    quorumCount                       : nat;                     // log of turnout for voting round - number of satellites who voted
    quorumMvkTotal                    : nat;                     // log of total positive votes in MVK 
    startDateTime                     : timestamp;               // log of when the proposal was proposed
  
    cycle                             : nat;                 // log of cycle that proposal belongs to
    currentCycleStartLevel            : nat;                 // log of current cycle starting block level
    currentCycleEndLevel              : nat;                 // log of current cycle end block level
] 
type proposalLedgerType is big_map (nat, proposalRecordType);

// snapshot will be valid for current cycle only (proposal + voting rounds)
type snapshotRecordType is [@layout:comb] record [
    totalMvkBalance           : nat;      // log of satellite's total mvk balance for this cycle
    totalDelegatedAmount      : nat;      // log of satellite's total delegated amount 
    totalVotingPower          : nat;      // log calculated total voting power 
    currentCycleStartLevel    : nat;      // log of current cycle starting block level
    currentCycleEndLevel      : nat;      // log of when cycle (proposal + voting) will end
]
type snapshotLedgerType is big_map (address, snapshotRecordType);

// ------------------------------------------------------------------------------
// Governance Config Types
// ------------------------------------------------------------------------------

type governanceConfigType is [@layout:comb] record [
    
    successReward                       : nat;  // incentive reward for successful proposal
    cycleVotersReward                   : nat;  // Reward sent then split to all voters at the end of a voting round

    minProposalRoundVotePercentage      : nat;  // percentage of staked MVK votes required to pass proposal round
    minProposalRoundVotesRequired       : nat;  // amount of staked MVK votes required to pass proposal round

    minQuorumPercentage                 : nat;  // minimum quorum percentage to be achieved (in MVK)
    minQuorumMvkTotal                   : nat;  // minimum quorum in MVK

    votingPowerRatio                    : nat;  // votingPowerRatio (e.g. 10% -> 10_000) - percentage to determine satellie's max voting power and if satellite is overdelegated (requires more staked MVK to be staked) or underdelegated - similar to self-bond percentage in tezos
    proposalSubmissionFeeMutez          : tez;  // e.g. 10 tez per submitted proposal
    minimumStakeReqPercentage           : nat;  // minimum amount of MVK required in percentage of total staked MVK supply (e.g. 0.01%)
    maxProposalsPerDelegate             : nat;  // number of active proposals delegate can have at any given time

    blocksPerMinute                     : nat;  // to account for eventual changes in blocks per minute (and blocks per day / time) - todo: change to allow decimal

    blocksPerProposalRound              : nat;  // to determine duration of proposal round
    blocksPerVotingRound                : nat;  // to determine duration of voting round
    blocksPerTimelockRound              : nat;  // timelock duration in blocks - 2 days e.g. 5760 blocks (one block is 30secs with granadanet) - 1 day is 2880 blocks

    proposalMetadataTitleMaxLength      : nat;
    proposalTitleMaxLength              : nat;
    proposalDescriptionMaxLength        : nat;
    proposalInvoiceMaxLength            : nat;
    proposalSourceCodeMaxLength         : nat;
    
]

type governanceUpdateConfigNewValueType is nat

type governanceUpdateConfigActionType is 
  ConfigSuccessReward               of unit
| ConfigCycleVotersReward           of unit
| ConfigMinProposalRoundVotePct     of unit
| ConfigMinProposalRoundVotesReq    of unit
| ConfigMinQuorumPercentage         of unit
| ConfigMinQuorumMvkTotal           of unit
| ConfigVotingPowerRatio            of unit
| ConfigProposeFeeMutez             of unit
| ConfigMinimumStakeReqPercentage   of unit
| ConfigMaxProposalsPerDelegate     of unit
| ConfigBlocksPerProposalRound      of unit
| ConfigBlocksPerVotingRound        of unit
| ConfigBlocksPerTimelockRound      of unit
| ConfigProposalDatTitleMaxLength   of unit
| ConfigProposalTitleMaxLength      of unit
| ConfigProposalDescMaxLength       of unit
| ConfigProposalInvoiceMaxLength    of unit
| ConfigProposalCodeMaxLength       of unit

type governanceUpdateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue: governanceUpdateConfigNewValueType; 
  updateConfigAction: governanceUpdateConfigActionType;
]


// ------------------------------------------------------------------------------
// Governance Storage Types
// ------------------------------------------------------------------------------


type roundType       is
| Proposal                  of unit
| Voting                    of unit
| Timelock                  of unit

type proxyLambdaLedgerType is big_map(nat, bytes)

type currentCycleInfoType is [@layout:comb] record[
    round                       : roundType;               // proposal, voting, timelock
    blocksPerProposalRound      : nat;                     // to determine duration of proposal round
    blocksPerVotingRound        : nat;                     // to determine duration of voting round
    blocksPerTimelockRound      : nat;                     // timelock duration in blocks - 2 days e.g. 5760 blocks (one block is 30secs with granadanet) - 1 day is 2880 blocks
    roundStartLevel             : nat;                     // current round starting block level
    roundEndLevel               : nat;                     // current round ending block level
    cycleEndLevel               : nat;                     // current cycle (proposal + voting) ending block level 
    roundProposals              : map(nat, nat);           // proposal id, total positive votes in MVK
    roundProposers              : map(address, set(nat));  // proposer, 
    roundVotes                  : map(address, nat);       // proposal round: (satelliteAddress, proposal id) | voting round: (satelliteAddress, voteType)
    cycleTotalVotersReward      : nat;
];

// ------------------------------------------------------------------------------
// Governance Entrypoint Types
// ------------------------------------------------------------------------------


type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]

type addUpdateProposalDataType is [@layout:comb] record [
  proposalId         : nat;
  title              : string;
  proposalBytes      : bytes;
]

type addUpdatePaymentDataType is [@layout:comb] record [
  proposalId         : nat;
  title              : string;
  paymentTransaction : transferDestinationType;
]

type setContractAdminType is [@layout:comb] record [
    newContractAdmin        : address;
    targetContractAddress   : address;
]

type setContractGovernanceType is [@layout:comb] record [
    newContractGovernance   : address;
    targetContractAddress   : address;
]

type whitelistDevelopersType is set(address)

// ------------------------------------------------------------------------------
// Governance Contract Lambdas
// ------------------------------------------------------------------------------


type governanceLambdaActionType is 
  
  // Break Glass Entrypoint
| LambdaBreakGlass                            of (unit)
| LambdaPropagateBreakGlass                   of (unit)

  // Housekeeping Lambdas
| LambdaSetAdmin                              of address
| LambdaSetGovernanceProxy                    of address
| LambdaUpdateMetadata                        of updateMetadataType
| LambdaUpdateConfig                          of governanceUpdateConfigParamsType
| LambdaUpdateGeneralContracts                of updateGeneralContractsParams
| LambdaUpdateWhitelistDevelopers             of (address)
| LambdaSetContractAdmin                      of setContractAdminType
| LambdaSetContractGovernance                 of setContractGovernanceType

  // Governance Cycle Lambdas
| LambdaStartNextRound                        of (bool)
| LambdaPropose                               of newProposalType
| LambdaProposalRoundVote                     of proposalIdType
| LambdaAddUpdateProposalData                 of addUpdateProposalDataType
| LambdaAddUpdatePaymentData                  of addUpdatePaymentDataType
| LambdaLockProposal                          of proposalIdType
| LambdaVotingRoundVote                       of votingRoundVoteType
| LambdaExecuteProposal                       of (unit)
| LambdaProcessProposalPayment                of proposalIdType
| LambdaProcessProposalSingleData             of (unit)
| LambdaDropProposal                          of proposalIdType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type governanceStorage is [@layout:comb] record [
    
    admin                             : address;
    metadata                          : metadata;
    config                            : governanceConfigType;

    mvkTokenAddress                   : address;
    governanceProxyAddress            : address;     
  
    whitelistDevelopers               : whitelistDevelopersType;  
    generalContracts                  : generalContractsType;
    
    proposalLedger                    : proposalLedgerType;
    snapshotLedger                    : snapshotLedgerType;
    
    // current round state variables - will be flushed periodically
    currentCycleInfo                  : currentCycleInfoType;

    nextProposalId                      : nat;                    // counter of next proposal id
    cycleCounter                        : nat;                    // counter of current cycle 
    currentRoundHighestVotedProposalId  : nat;                    // set to 0 if there is no proposal currently, if not set to proposal id
    timelockProposalId                  : nat;                    // set to 0 if there is proposal in timelock, if not set to proposal id

    snapshotMvkTotalSupply              : nat;                    // snapshot of total MVK supply - for quorum calculation use

    // lambda storage
    lambdaLedger                        : lambdaLedgerType;             // governance contract lambdas

    

]
