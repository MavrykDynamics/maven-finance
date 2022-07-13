// ------------------------------------------------------------------------------
// Needed Types
// ------------------------------------------------------------------------------

// Vote Types
#include "../shared/voteTypes.ligo"

// ------------------------------------------------------------------------------
// Governance Cycle Round Types
// ------------------------------------------------------------------------------

type proposalMetadataType is [@layout:comb] record[
    title : string;
    data  : bytes;
]
type paymentMetadataType is [@layout:comb] record[
    title       : string;
    transaction : transferDestinationType;
]

type newProposalType is [@layout:comb] record [
    title              : string;
    description        : string;
    invoice            : string; 
    sourceCode         : string;
    proposalMetadata   : option(list(proposalMetadataType));
    paymentMetadata    : option(list(paymentMetadataType));
]

// Stores all voter data during proposal round
type proposalRoundVoteType is (nat * timestamp)                             // total voting power (MVK) * timestamp
type proposalVotersMapType is map (address, proposalRoundVoteType)

// Stores all voter data during voting round
type votingRoundVoteType is [@layout:comb] record [
    vote  : voteType;
    empty : unit; // fixes the compilation and the deployment of the votingRoundVote entrypoint. Without it, %yay, %nay and %pass become entrypoints.
]
type votingRoundRecordType is (nat * timestamp * voteType)   // 1 is Yay, 0 is Nay, 2 is pass * total voting power (MVK) * timestamp
type votersMapType is map (address, votingRoundRecordType)

type proposalRecordType is [@layout:comb] record [
    
    proposerAddress                   : address;
    proposalMetadata                  : map(nat,option(proposalMetadataType));
    proposalMetadataExecutionCounter  : nat;
    paymentMetadata                   : map(nat,option(paymentMetadataType));
  
    status                            : string;                  // status - "ACTIVE", "DROPPED"
    title                             : string;                  // title
    description                       : string;                  // description
    invoice                           : string;                  // ipfs hash of invoice file
    sourceCode                        : string;                  // link to github / repo
  
    successReward                     : nat;                     // log of successful proposal reward for voters - may change over time
    executed                          : bool;                    // true / false
    paymentProcessed                  : bool;                    // true / false
    locked                            : bool;                    // true / false
  
    proposalVoteCount                 : nat;                     // proposal round: pass votes count - number of satellites
    proposalVoteStakedMvkTotal        : nat;                     // proposal round pass vote total mvk from satellites who voted pass
    proposalVotersMap                 : proposalVotersMapType;       // proposal round ledger
  
    minProposalRoundVotePercentage    : nat;          // min vote percentage of total MVK supply required to pass proposal round
    minProposalRoundVotesRequired     : nat;          // min staked MVK votes required for proposal round to pass
  
    yayVoteCount                      : nat;                     // voting round: yay count - number of satellites
    yayVoteStakedMvkTotal             : nat;                     // voting round: yay MVK total
    nayVoteCount                      : nat;                     // voting round: nay count - number of satellites
    nayVoteStakedMvkTotal             : nat;                     // voting round: nay MVK total
    passVoteCount                     : nat;                     // voting round: pass count - number of satellites
    passVoteStakedMvkTotal            : nat;                     // voting round: pass MVK total
    voters                            : votersMapType;           // voting round ledger
  
    minQuorumPercentage               : nat;                     // log of min quorum percentage - capture state at this point as min quorum percentage may change over time
    minQuorumStakedMvkTotal           : nat;                     // log of min quorum in MVK - capture state at this point
    minYayVotePercentage              : nat;                     // log of min yay votes percentage - capture state at this point
    quorumCount                       : nat;                     // log of turnout for voting round - number of satellites who voted
    quorumStakedMvkTotal              : nat;                     // log of total positive votes in MVK 
    startDateTime                     : timestamp;               // log of when the proposal was proposed
  
    cycle                             : nat;                 // log of cycle that proposal belongs to
    currentCycleStartLevel            : nat;                 // log of current cycle starting block level
    currentCycleEndLevel              : nat;                 // log of current cycle end block level
] 
type proposalLedgerType is big_map (nat, proposalRecordType);

// snapshot will be valid for current cycle only (proposal + voting rounds)
type governanceSatelliteSnapshotRecordType is [@layout:comb] record [
    totalStakedMvkBalance     : nat;      // log of satellite's total mvk balance for this cycle
    totalDelegatedAmount      : nat;      // log of satellite's total delegated amount 
    totalVotingPower          : nat;      // log calculated total voting power 
    cycle                     : nat;      // log of the cycle where the snapshot was taken
]
type snapshotLedgerType is map (address, governanceSatelliteSnapshotRecordType);

// ------------------------------------------------------------------------------
// Governance Config Types
// ------------------------------------------------------------------------------

type governanceConfigType is [@layout:comb] record [
    
    successReward                       : nat;  // incentive reward for successful proposal
    cycleVotersReward                   : nat;  // Reward sent then split to all voters at the end of a voting round

    minProposalRoundVotePercentage      : nat;  // percentage of staked MVK votes required to pass proposal round
    minProposalRoundVotesRequired       : nat;  // amount of staked MVK votes required to pass proposal round

    minQuorumPercentage                 : nat;  // minimum quorum percentage to be achieved (in SMVK)
    minYayVotePercentage                : nat;  // minimum yay percentage to be achieved from the quorum SMVK

    proposalSubmissionFeeMutez          : tez;  // e.g. 10 tez per submitted proposal
    maxProposalsPerSatellite            : nat;  // number of active proposals a satellite can make

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
    |   ConfigCycleVotersReward           of unit
    |   ConfigMinProposalRoundVotePct     of unit
    |   ConfigMinProposalRoundVotesReq    of unit
    |   ConfigMinQuorumPercentage         of unit
    |   ConfigMinYayVotePercentage        of unit
    |   ConfigProposeFeeMutez             of unit
    |   ConfigMaxProposalsPerSatellite    of unit
    |   ConfigBlocksPerProposalRound      of unit
    |   ConfigBlocksPerVotingRound        of unit
    |   ConfigBlocksPerTimelockRound      of unit
    |   ConfigProposalDatTitleMaxLength   of unit
    |   ConfigProposalTitleMaxLength      of unit
    |   ConfigProposalDescMaxLength       of unit
    |   ConfigProposalInvoiceMaxLength    of unit
    |   ConfigProposalCodeMaxLength       of unit

type governanceUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue: governanceUpdateConfigNewValueType; 
    updateConfigAction: governanceUpdateConfigActionType;
]


// ------------------------------------------------------------------------------
// Governance Storage Types
// ------------------------------------------------------------------------------


type roundType       is
    |   Proposal                  of unit
    |   Voting                    of unit
    |   Timelock                  of unit

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
    cycleTotalVotersReward      : nat;                     // reward given to all voters (will be split by the number of voters this cycle)
    minQuorumStakedMvkTotal     : nat;                     // quorum to reach in order to reach the timelock round
];

// ------------------------------------------------------------------------------
// Governance Entrypoint Types
// ------------------------------------------------------------------------------

type updateProposalDataType is [@layout:comb] record [
    proposalId         : actionIdType;
    title              : string;
    proposalBytes      : bytes;
]

type updatePaymentDataType is [@layout:comb] record [
    proposalId         : actionIdType;
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
    |   LambdaBreakGlass                            of (unit)
    |   LambdaPropagateBreakGlass                   of (unit)

        // Housekeeping Lambdas
    |   LambdaSetAdmin                              of address
    |   LambdaSetGovernanceProxy                    of address
    |   LambdaUpdateMetadata                        of updateMetadataType
    |   LambdaUpdateConfig                          of governanceUpdateConfigParamsType
    |   LambdaUpdateGeneralContracts                of updateGeneralContractsType
    |   LambdaUpdateWhitelistContracts              of updateWhitelistContractsType
    |   LambdaUpdateWhitelistDevelopers             of (address)
    |   LambdaMistakenTransfer                      of transferActionType
    |   LambdaSetContractAdmin                      of setContractAdminType
    |   LambdaSetContractGovernance                 of setContractGovernanceType

        // Governance Cycle Lambdas
    |   LambdaStartNextRound                        of (bool)
    |   LambdaPropose                               of newProposalType
    |   LambdaProposalRoundVote                     of actionIdType
    |   LambdaUpdateProposalData                 of updateProposalDataType
    |   LambdaUpdatePaymentData                  of updatePaymentDataType
    |   LambdaLockProposal                          of actionIdType
    |   LambdaVotingRoundVote                       of votingRoundVoteType
    |   LambdaExecuteProposal                       of (unit)
    |   LambdaProcessProposalPayment                of actionIdType
    |   LambdaProcessProposalSingleData             of (unit)
    |   LambdaDropProposal                          of actionIdType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type governanceStorageType is [@layout:comb] record [
    
    admin                             : address;
    metadata                          : metadataType;
    config                            : governanceConfigType;

    mvkTokenAddress                   : address;
    governanceProxyAddress            : address;     
    
    whitelistContracts                : whitelistContractsType;    // whitelist of contracts that can access restricted entrypoints
    generalContracts                  : generalContractsType;
    whitelistDevelopers               : whitelistDevelopersType;  

    proposalLedger                    : proposalLedgerType;
    snapshotLedger                    : snapshotLedgerType;
    
    currentCycleInfo                  : currentCycleInfoType;       // current round state variables - will be flushed periodically

    nextProposalId                    : nat;                        // counter of next proposal id
    cycleCounter                      : nat;                        // counter of current cycle 
    cycleHighestVotedProposalId       : nat;                        // set to 0 if there is no proposal currently, if not set to proposal id
    timelockProposalId                : nat;                        // set to 0 if there is proposal in timelock, if not set to proposal id

    // lambda storage
    lambdaLedger                      : lambdaLedgerType;           // governance contract lambdas

]