// ------------------------------------------------------------------------------
// Required Partial Types
// ------------------------------------------------------------------------------


// Delegation Types
#include "./delegationTypes.ligo"

// Vote Types
#include "../shared/voteTypes.ligo"


// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type roundType       is
    |   Proposal                  of unit
    |   Voting                    of unit
    |   Timelock                  of unit

type currentCycleInfoType is [@layout:comb] record[
    round                       : roundType;                    // proposal, voting, timelock
    blocksPerProposalRound      : nat;                          // to determine duration of proposal round
    blocksPerVotingRound        : nat;                          // to determine duration of voting round
    blocksPerTimelockRound      : nat;                          // timelock duration in blocks - 2 days e.g. 5760 blocks (one block is 30secs with granadanet) - 1 day is 2880 blocks
    roundStartLevel             : nat;                          // current round starting block level
    roundEndLevel               : nat;                          // current round ending block level
    cycleEndLevel               : nat;                          // current cycle (proposal + voting) ending block level 
    cycleTotalVotersReward      : nat;                          // reward given to all voters (will be split by the number of voters this cycle)
    minQuorumStakedMvnTotal     : nat;                          // quorum to reach in order to reach the timelock round
];


// --------------------------------------------------
// Governance Cycle Round Types
// --------------------------------------------------

// Stores all voter data during proposal and voting rounds
type roundVoteType is 
    Proposal    of actionIdType
|   Voting      of voteType

// Stores all voter data during voting round
type votingRoundVoteType is [@layout:comb] record [
    vote  : voteType;
    empty : unit;   // fixes the compilation and the deployment of the votingRoundVote entrypoint. Without it, %yay, %nay and %pass become entrypoints.
]

type proposalDataType is [@layout:comb] record [
    title                   : string;
    encodedCode             : bytes;
    codeDescription         : string;
]

type paymentDataType is [@layout:comb] record[
    title               : string;
    transaction         : transferDestinationType;
]

type proposalDataMapType is map(nat,option(proposalDataType))
type proposalPaymentDataMapType is map(nat,option(paymentDataType))

type proposalRecordType is [@layout:comb] record [
    
    proposerAddress                   : address;
    proposalData                      : proposalDataMapType;
    proposalDataExecutionCounter      : nat;
    paymentData                       : proposalPaymentDataMapType;
  
    status                            : string;                  // status - "ACTIVE", "DROPPED"
    title                             : string;                  // title
    description                       : string;                  // description
    invoice                           : string;                  // ipfs hash of invoice file
    sourceCode                        : string;                  // link to github / repo
  
    successReward                     : nat;                     // log of successful proposal reward for voters - may change over time
    totalVotersReward                 : nat;                     // log of the cycle total rewards for voters
    executed                          : bool;                    // true / false
    paymentProcessed                  : bool;                    // true / false
    locked                            : bool;                    // true / false
    rewardClaimReady                  : bool;                    // true / false
    executionReady                    : bool;                    // true / false
  
    proposalVoteCount                 : nat;                     // proposal round: pass votes count - number of satellites
    proposalVoteStakedMvnTotal        : nat;                     // proposal round pass vote total mvn from satellites who voted pass
  
    minProposalRoundVotePercentage    : nat;                     // min vote percentage of total staked MVN supply required to pass proposal round
    minProposalRoundVotesRequired     : nat;                     // min staked MVN votes required for proposal round to pass
  
    yayVoteCount                      : nat;                     // voting round: yay count - number of satellites
    yayVoteStakedMvnTotal             : nat;                     // voting round: yay MVN total
    nayVoteCount                      : nat;                     // voting round: nay count - number of satellites
    nayVoteStakedMvnTotal             : nat;                     // voting round: nay MVN total
    passVoteCount                     : nat;                     // voting round: pass count - number of satellites
    passVoteStakedMvnTotal            : nat;                     // voting round: pass MVN total

    minQuorumPercentage               : nat;                     // log of min quorum percentage - capture state at this point as min quorum percentage may change over time
    minQuorumStakedMvnTotal           : nat;                     // log of min quorum in MVN - capture state at this point
    minYayVotePercentage              : nat;                     // log of min yay votes percentage - capture state at this point
    quorumCount                       : nat;                     // log of turnout for voting round - number of satellites who voted
    quorumStakedMvnTotal              : nat;                     // log of total positive votes in MVN 
    startDateTime                     : timestamp;               // log of when the proposal was proposed
    executedDateTime                  : option(timestamp);       // log of when the proposal was executed
  
    cycle                             : nat;                     // log of cycle that proposal belongs to
    currentCycleStartLevel            : nat;                     // log of current cycle starting block level
    currentCycleEndLevel              : nat;                     // log of current cycle end block level
] 
type proposalLedgerType is big_map (nat, proposalRecordType);

// snapshot will be valid for current cycle only (proposal + voting rounds)
type governanceSatelliteSnapshotRecordType is [@layout:comb] record [
    totalStakedMvnBalance       : nat;      // log of satellite's total mvn balance for this cycle
    totalDelegatedAmount        : nat;      // log of satellite's total delegated amount 
    totalVotingPower            : nat;      // log calculated total voting power
    accumulatedRewardsPerShare  : nat;      // log satellite's accumulated rewards per share
    ready                       : bool;     // log to tell if the satellite can participate in the governance with its snapshot (e.g. set to False if the satellite just registered in the current cycle) 
    nextSnapshotCycleId         : option(nat);
]
type snapshotLedgerType is big_map ((nat * address), governanceSatelliteSnapshotRecordType); // (cycleId * satelliteAddress -> snapshot)

type satelliteLastSnapshotLedgerType is big_map(address, nat); // satelliteAddress -> governance cycle id

type stakedMvnSnapshotLedgerType is big_map(nat, nat); // cycleId -> staked MVN total supply

// --------------------------------------------------
// Governance Config Types
// --------------------------------------------------


type governanceConfigType is [@layout:comb] record [
    
    successReward                       : nat;  // incentive reward for successful proposal
    cycleVotersReward                   : nat;  // Reward sent then split to all voters at the end of a voting round

    minProposalRoundVotePercentage      : nat;  // percentage of staked MVN votes required to pass proposal round

    minQuorumPercentage                 : nat;  // minimum quorum percentage to be achieved (in SMVN)
    minYayVotePercentage                : nat;  // minimum yay percentage to be achieved from the quorum SMVN

    proposalSubmissionFeeMutez          : mav;  // e.g. 10 tez per submitted proposal
    maxProposalsPerSatellite            : nat;  // number of active proposals a satellite can make

    blocksPerProposalRound              : nat;  // to determine duration of proposal round
    blocksPerVotingRound                : nat;  // to determine duration of voting round
    blocksPerTimelockRound              : nat;  // timelock duration in blocks - 2 days e.g. 5760 blocks (one block is 30secs with granadanet) - 1 day is 2880 blocks

    proposalDataTitleMaxLength          : nat;
    proposalTitleMaxLength              : nat;
    proposalDescriptionMaxLength        : nat;
    proposalInvoiceMaxLength            : nat;
    proposalSourceCodeMaxLength         : nat;
    
]


// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


type governanceUpdateConfigNewValueType is nat

type governanceUpdateConfigActionType is 
        ConfigSuccessReward               of unit
    |   ConfigCycleVotersReward           of unit
    |   ConfigMinProposalRoundVotePct     of unit
    |   ConfigMinQuorumPercentage         of unit
    |   ConfigMinYayVotePercentage        of unit
    |   ConfigProposeFeeMutez             of unit
    |   ConfigMaxProposalsPerSatellite    of unit
    |   ConfigBlocksPerProposalRound      of unit
    |   ConfigBlocksPerVotingRound        of unit
    |   ConfigBlocksPerTimelockRound      of unit
    |   ConfigDataTitleMaxLength          of unit
    |   ConfigProposalTitleMaxLength      of unit
    |   ConfigProposalDescMaxLength       of unit
    |   ConfigProposalInvoiceMaxLength    of unit
    |   ConfigProposalCodeMaxLength       of unit

type governanceUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue    : governanceUpdateConfigNewValueType; 
    updateConfigAction      : governanceUpdateConfigActionType;
]

type updateProposalDataSetType is [@layout:comb] record [
    title                   : string;
    encodedCode             : bytes;
    codeDescription         : option(string);
    index                   : option(nat);
]

type updateProposalDataVariantType is 
        AddOrSetProposalData    of updateProposalDataSetType
    |   RemoveProposalData      of nat

type updateProposalDataType is list(updateProposalDataVariantType);

type updatePaymentDataSetType is [@layout:comb] record [
    title                   : string;
    transaction             : transferDestinationType;
    index                   : option(nat);
]

type updatePaymentDataVariantType is 
        AddOrSetPaymentData     of updatePaymentDataSetType
    |   RemovePaymentData       of nat

type updatePaymentDataType is list(updatePaymentDataVariantType);

type updateProposalType is [@layout:comb] record [
    proposalId              : actionIdType;
    proposalData            : option(updateProposalDataType);
    paymentData             : option(updatePaymentDataType);
]

type newProposalType is [@layout:comb] record [
    title               : string;
    description         : string;
    invoice             : string; 
    sourceCode          : string;
    proposalData        : option(updateProposalDataType);
    paymentData         : option(updatePaymentDataType);
]

type setContractAdminType is [@layout:comb] record [
    targetContractAddress   : address;
    newContractAdmin        : address;
]

type setContractGovernanceType is [@layout:comb] record [
    targetContractAddress   : address;
    newContractGovernance   : address;
]

type whitelistDevelopersType is set(address)

type updateSatelliteSingleSnapshotType is [@layout:comb] record [
    satelliteAddress            : address;
    totalStakedMvnBalance       : nat;
    totalDelegatedAmount        : nat;
    ready                       : bool;
    delegationRatio             : nat;
    accumulatedRewardsPerShare  : nat;
]
type updateSatellitesSnapshotType is set(updateSatelliteSingleSnapshotType)

type distributeProposalRewardsType is [@layout:comb] record [
    satelliteAddress        : address;
    proposalIds             : set(actionIdType);
]

// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type governanceLambdaActionType is 
  
        // Break Glass Entrypoint
    |   LambdaBreakGlass                            of (unit)
    |   LambdaPropagateBreakGlass                   of set(address)

        // Housekeeping Lambdas
    |   LambdaSetAdmin                              of address
    |   LambdaSetGovernanceProxy                    of address
    |   LambdaUpdateMetadata                        of updateMetadataType
    |   LambdaUpdateConfig                          of governanceUpdateConfigParamsType
    |   LambdaUpdateWhitelistContracts              of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts                of updateGeneralContractsType    
    |   LambdaUpdateWhitelistDevelopers             of (address)
    |   LambdaMistakenTransfer                      of transferActionType
    |   LambdaSetContractAdmin                      of setContractAdminType
    |   LambdaSetContractGovernance                 of setContractGovernanceType

        // Governance Cycle Lambdas
    |   LambdaUpdateSatellitesSnapshot              of updateSatellitesSnapshotType
    |   LambdaStartNextRound                        of (bool)
    |   LambdaPropose                               of newProposalType
    |   LambdaProposalRoundVote                     of actionIdType
    |   LambdaUpdateProposalData                    of updateProposalType
    |   LambdaLockProposal                          of actionIdType
    |   LambdaVotingRoundVote                       of votingRoundVoteType
    |   LambdaExecuteProposal                       of actionIdType
    |   LambdaProcessProposalPayment                of actionIdType
    |   LambdaProcessProposalSingleData             of actionIdType
    |   LambdaDistributeProposalRewards             of distributeProposalRewardsType
    |   LambdaDropProposal                          of actionIdType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type governanceStorageType is [@layout:comb] record [
    
    admin                             : address;
    metadata                          : metadataType;
    config                            : governanceConfigType;

    mvnTokenAddress                   : address;
    governanceProxyAddress            : address;     
    
    whitelistContracts                : whitelistContractsType;    // whitelist of contracts that can access restricted entrypoints
    generalContracts                  : generalContractsType;
    whitelistDevelopers               : whitelistDevelopersType;  

    proposalLedger                    : proposalLedgerType;
    proposalVoters                    : votersType;
    proposalRewards                   : big_map((actionIdType*address), unit);  // proposalId*Satellite address

    snapshotLedger                    : snapshotLedgerType;              // satellite snapshot ledger
    satelliteLastSnapshotLedger       : satelliteLastSnapshotLedgerType; // satellite last snapshot ledger
    stakedMvnSnapshotLedger           : stakedMvnSnapshotLedgerType;     // staked MVN snapshot ledger
    
    currentCycleInfo                  : currentCycleInfoType;      // current round state variables - will be flushed periodically

    cycleProposals                    : map(actionIdType, nat);                 // proposal ids in the current cycle, proposal vote smvn total
    cycleProposers                    : big_map((nat * address), set(nat));       // cycleId * proposer --> set of actionIds
    roundVotes                        : big_map((nat * address), roundVoteType);  // proposal round: (proposal id * satelliteAddress) | voting round: (cycleId*satelliteAddress, voteType)

    nextProposalId                    : nat;                        // counter of next proposal id
    cycleId                           : nat;                        // counter of current cycle 
    cycleHighestVotedProposalId       : nat;                        // set to 0 if there is no proposal currently, if not set to proposal id
    timelockProposalId                : nat;                        // set to 0 if there is proposal in timelock, if not set to proposal id

    lambdaLedger                      : lambdaLedgerType;           // governance contract lambdas

]
