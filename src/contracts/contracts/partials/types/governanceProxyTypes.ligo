
// ------------------------------------------------------------------------------
// General Types
// ------------------------------------------------------------------------------


type proposalIdType is nat
type proxyLambdaLedgerType is big_map(nat, bytes)

type setProxyLambdaType is [@layout:comb] record [
  id          : nat;
  func_bytes  : bytes;
]


// ------------------------------------------------------------------------------
// Proposal Types
// ------------------------------------------------------------------------------


// Stores all voter data during proposal round
type proposalRoundVoteType is (nat * timestamp)                             // total voting power (MVK) * timestamp
type passVotersMapType is map (address, proposalRoundVoteType)

// Stores all voter data during voting round
type voteForProposalChoiceType is 
  Yay of unit
| Nay of unit
| Abstain of unit
type votingRoundVoteType is (nat * timestamp * voteForProposalChoiceType)   // 1 is Yay, 0 is Nay, 2 is abstain * total voting power (MVK) * timestamp
type votersMapType is map (address, votingRoundVoteType)

type proposalMetadataType is map (string, bytes)
type paymentMetadataType  is map (string, bytes)

type proposalRecordType is [@layout:comb] record [
    
    proposerAddress      : address;
    proposalMetadata     : proposalMetadataType;
    paymentMetadata      : paymentMetadataType;

    status               : string;                  // status - "ACTIVE", "DROPPED"
    title                : string;                  // title
    description          : string;                  // description
    invoice              : string;                  // ipfs hash of invoice file
    sourceCode           : string;                  // link to github / repo

    successReward        : nat;                     // log of successful proposal reward for voters - may change over time
    executed             : bool;                    // true / false
    locked               : bool;                    // true / false
    
    passVoteCount        : nat;                     // proposal round: pass votes count - number of satellites
    passVoteMvkTotal     : nat;                     // proposal round pass vote total mvk from satellites who voted pass
    passVotersMap        : passVotersMapType;       // proposal round ledger

    minProposalRoundVotePercentage  : nat;          // min vote percentage of total MVK supply required to pass proposal round
    minProposalRoundVotesRequired   : nat;          // min staked MVK votes required for proposal round to pass

    upvoteCount          : nat;                     // voting round: upvotes count - number of satellites
    upvoteMvkTotal       : nat;                     // voting round: upvotes MVK total
    downvoteCount        : nat;                     // voting round: downvotes count - number of satellites
    downvoteMvkTotal     : nat;                     // voting round: downvotes MVK total
    abstainCount         : nat;                     // voting round: abstain count - number of satellites
    abstainMvkTotal      : nat;                     // voting round: abstain MVK total
    voters               : votersMapType;           // voting round ledger

    minQuorumPercentage  : nat;                     // log of min quorum percentage - capture state at this point as min quorum percentage may change over time
    minQuorumMvkTotal    : nat;                     // log of min quorum in MVK - capture state at this point
    quorumCount          : nat;                     // log of turnout for voting round - number of satellites who voted
    quorumMvkTotal       : nat;                     // log of total positive votes in MVK 
    startDateTime        : timestamp;               // log of when the proposal was proposed

    cycle                    : nat;                 // log of cycle that proposal belongs to
    currentCycleStartLevel   : nat;                 // log of current cycle starting block level
    currentCycleEndLevel     : nat;                 // log of current cycle end block level
]


// ------------------------------------------------------------------------------
// Execute Action Types
// ------------------------------------------------------------------------------


type setContractAdminType is [@layout:comb] record [
  targetContractAddress  : address;
  newAdminAddress        : address; 
]

type setContractGovernanceType is [@layout:comb] record [
  targetContractAddress  : address;
  newGovernanceAddress   : address; 
]

type setContractLambdaType is [@layout:comb] record [
  targetContractAddress   : address;
  name                    : string;
  func_bytes              : bytes;
]

type updateContractMetadataType is [@layout:comb] record [
  targetContractAddress  : address;
  metadataKey            : string;
  metadataHash           : bytes; 
]

type updateContractWhitelistMapType is [@layout:comb] record [
  targetContractAddress     : address;
  whitelistContractName     : string;
  whitelistContractAddress  : address; 
]

type updateContractGeneralMapType is [@layout:comb] record [
  targetContractAddress     : address;
  generalContractName       : string;
  generalContractAddress    : address; 
]

type updateContractWhitelistTokenMapType is [@layout:comb] record [
  targetContractAddress     : address;
  tokenContractName         : string;
  tokenContractAddress      : address; 
]

type targetFarmUpdateConfigParamsType is [@layout:comb] record [
  targetFarmAddress         : address;
  farmConfig                : farmUpdateConfigParamsType;
]

type targetFarmInitType is [@layout:comb] record [
  targetFarmAddress         : address;
  farmConfig                : initFarmParamsType;
]

type executeActionParamsType is 

  UpdateProxyLambda                  of setProxyLambdaType
| SetContractAdmin                   of setContractAdminType
| SetContractGovernance              of setContractGovernanceType
| SetContractLambda                  of setContractLambdaType
| UpdateContractMetadata             of updateContractMetadataType
| UpdateContractWhitelistMap         of updateContractWhitelistMapType
| UpdateContractGeneralMap           of updateContractGeneralMapType
| UpdateContractWhitelistTokenMap    of updateContractWhitelistTokenMapType

| UpdateGovernanceConfig             of updateGovernanceConfigType
| UpdateDelegationConfig             of delegationUpdateConfigParamsType
| UpdateEmergencyConfig              of emergencyUpdateConfigParamsType
| UpdateBreakGlassConfig             of breakGlassUpdateConfigParamsType
| UpdateCouncilConfig                of councilUpdateConfigParamsType
| UpdateFarmConfig                   of targetFarmUpdateConfigParamsType
| UpdateDoormanMinMvkAmount          of (nat)

| UpdateWhitelistDevelopersSet       of (address)

| CreateFarm                         of createFarmType
| TrackFarm                          of (address)
| UntrackFarm                        of (address)
| InitFarm                           of (targetFarmInitType)
| CloseFarm                          of (address)

| CreateTreasury                     of bytes
| TrackTreasury                      of (address)
| UntrackTreasury                    of (address)

| UpdateMvkInflationRate             of (nat)
| TriggerMvkInflation                of unit

type executeActionType is (executeActionParamsType)


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type governanceProxyStorage is record [
    admin                       : address;
    governanceAddress           : address;    // separate admin from governance address in event of break glass
    metadata                    : metadata;

    mvkTokenAddress             : address;
    whitelistContracts          : whitelistContractsType;      
    generalContracts            : generalContractsType; 
    whitelistTokenContracts     : whitelistTokenContractsType;      

    proxyLambdaLedger           : proxyLambdaLedgerType;
]