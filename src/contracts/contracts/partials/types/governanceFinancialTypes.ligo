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


// ------------------------------------------------------------------------------
// Financial Request Types
// ------------------------------------------------------------------------------


type financialRequestVoteChoiceType is 
  Approve of unit
| Disapprove of unit

type financialRequestVoteType is [@layout:comb] record [
  vote              : financialRequestVoteChoiceType;
  totalVotingPower  : nat; 
  timeVoted         : timestamp;
] 

type financialRequestVotersMapType is map (address, financialRequestVoteType)

type financialRequestRecordType is [@layout:comb] record [

    requesterAddress        : address;
    requestType             : string;                // "MINT" or "TRANSFER"
    status                  : bool;                  // True - ACTIVE / False - DROPPED -- DEFEATED / EXECUTED / DRAFT
    executed                : bool;                  // false on creation; set to true when financial request is executed successfully
    
    treasuryAddress         : address;
    tokenContractAddress    : address; 
    tokenAmount             : nat;
    tokenName               : string; 
    tokenType               : string;
    tokenId                 : nat;
    requestPurpose          : string;
    voters                  : financialRequestVotersMapType; 
    keyHash                 : option(key_hash);

    approveVoteTotal        : nat;
    disapproveVoteTotal     : nat;

    snapshotStakedMvkTotalSupply       : nat;
    stakedMvkPercentageForApproval     : nat; 
    stakedMvkRequiredForApproval       : nat; 

    requestedDateTime       : timestamp;               // log of when the request was submitted
    expiryDateTime          : timestamp;               
]
type financialRequestLedgerType is big_map (nat, financialRequestRecordType);

type financialRequestSnapshotRecordType is [@layout:comb] record [
    totalStakedMvkBalance     : nat;      // log of satellite's total mvk balance for this cycle
    totalDelegatedAmount      : nat;      // log of satellite's total delegated amount 
    totalVotingPower          : nat;      // log calculated total voting power 
]
type financialRequestSnapshotMapType is map (address, financialRequestSnapshotRecordType)
type financialRequestSnapshotLedgerType is big_map (requestIdType, financialRequestSnapshotMapType);
type requestSatelliteSnapshotType is  [@layout:comb] record [
    satelliteAddress      : address;
    requestId             : nat; 
    stakedMvkBalance      : nat; 
    totalDelegatedAmount  : nat; 
]

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
// Governance Financial Config Types
// ------------------------------------------------------------------------------

type governanceFinancialConfigType is [@layout:comb] record [

    votingPowerRatio                    : nat;  // votingPowerRatio (e.g. 10% -> 10_000) - percentage to determine satellie's max voting power and if satellite is overdelegated (requires more staked MVK to be staked) or underdelegated - similar to self-bond percentage in tezos

    financialRequestApprovalPercentage  : nat;  // threshold for financial request to be approved: 67% of total staked MVK supply
    financialRequestDurationInDays      : nat;  // duration of final request before expiry
    
]

type governanceFinancialUpdateConfigNewValueType is nat

type governanceFinancialUpdateConfigActionType is
| ConfigFinancialReqApprovalPct     of unit
| ConfigFinancialReqDurationDays    of unit
| ConfigVotingPowerRatio            of unit

type governanceFinancialUpdateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue: governanceFinancialUpdateConfigNewValueType; 
  updateConfigAction: governanceFinancialUpdateConfigActionType;
]

// ------------------------------------------------------------------------------
// Governance Entrypoint Types
// ------------------------------------------------------------------------------


type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]

type requestTokensType is [@layout:comb] record [
    treasuryAddress       : address;  // treasury address
    tokenContractAddress  : address;  // token contract address
    tokenName             : string;   // token name should be in whitelist token contracts map in governance contract
    tokenAmount           : nat;      // token amount requested
    tokenType             : string;   
    tokenId               : nat;      // token amount requested
    purpose               : string;   // financial request purpose
]

type requestMintType is [@layout:comb] record [
    treasuryAddress       : address;  // treasury address
    tokenAmount           : nat;      // MVK token amount requested
    purpose               : string;   // financial request purpose
]

type setContractBakerType is [@layout:comb] record [
    targetContractAddress  : address;
    keyHash                : option(key_hash);
]

type voteForRequestChoiceType is 
  Approve of unit
| Disapprove of unit

type voteForRequestType is [@layout:comb] record [
    requestId        : nat;
    vote             : voteForRequestChoiceType;
]

// ------------------------------------------------------------------------------
// Governance Contract Lambdas
// ------------------------------------------------------------------------------


type governanceFinancialLambdaActionType is 
  
  // Housekeeping Lambdas
| LambdaSetAdmin                              of address
| LambdaSetGovernance                         of address
| LambdaUpdateMetadata                        of updateMetadataType
| LambdaUpdateConfig                          of governanceFinancialUpdateConfigParamsType
| LambdaUpdateGeneralContracts                of updateGeneralContractsParams
| LambdaUpdateWhitelistContracts              of updateWhitelistContractsParams
| LambdaUpdateWhitelistTokens                 of updateWhitelistTokenContractsParams

  // Financial Governance Lambdas
| LambdaRequestTokens                         of requestTokensType
| LambdaRequestMint                           of requestMintType
| LambdaSetContractBaker                      of setContractBakerType
| LambdaDropFinancialRequest                  of (nat)
| LambdaVoteForRequest                        of voteForRequestType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type governanceFinancialStorage is [@layout:comb] record [
    
    admin                               : address;
    metadata                            : metadata;
    config                              : governanceFinancialConfigType;

    mvkTokenAddress                     : address;
    governanceAddress                   : address;   

    whitelistTokenContracts             : whitelistTokenContractsType;
    whitelistContracts                  : whitelistContractsType;    // whitelist of contracts that can access restricted entrypoints
    generalContracts                    : generalContractsType;
    
    // financial governance storage 
    financialRequestLedger              : financialRequestLedgerType;
    financialRequestSnapshotLedger      : financialRequestSnapshotLedgerType;
    financialRequestCounter             : nat;

    snapshotStakedMvkTotalSupply        : nat;                    // snapshot of total staked MVK supply - for financial request decision making 

    // lambda storage
    lambdaLedger                        : lambdaLedgerType;

    

]
