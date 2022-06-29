// ------------------------------------------------------------------------------
// General Types
// ------------------------------------------------------------------------------


type proposalIdType is nat
type requestIdType is nat; 
type metadata is big_map (string, bytes);

// ------------------------------------------------------------------------------
// Financial Request Types
// ------------------------------------------------------------------------------

type voteForRequestChoiceType is 
  Yay   of unit
| Nay   of unit
| Pass  of unit

type financialRequestVoteType is [@layout:comb] record [
  vote              : voteForRequestChoiceType;
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

    yayVoteStakedMvkTotal   : nat;
    nayVoteStakedMvkTotal   : nat;
    passVoteStakedMvkTotal  : nat;

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
| LambdaMistakenTransfer                      of transferActionType

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
