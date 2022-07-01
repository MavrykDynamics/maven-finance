// ------------------------------------------------------------------------------
// Needed Types
// ------------------------------------------------------------------------------

// Vote Types
#include "../shared/voteTypes.ligo"

// ------------------------------------------------------------------------------
// Financial Request Types
// ------------------------------------------------------------------------------

type financialRequestVoteType is [@layout:comb] record [
  vote              : voteType;
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
type financialRequestLedgerType is big_map (actionIdType, financialRequestRecordType);

type financialRequestSnapshotMapType is map (address, satelliteSnapshotRecordType)
type financialRequestSnapshotLedgerType is big_map (actionIdType, financialRequestSnapshotMapType);
type requestSatelliteSnapshotType is  [@layout:comb] record [
    satelliteAddress      : address;
    requestId             : nat; 
    stakedMvkBalance      : nat; 
    totalDelegatedAmount  : nat; 
]

// ------------------------------------------------------------------------------
// Governance Financial Config Types
// ------------------------------------------------------------------------------

type governanceFinancialConfigType is [@layout:comb] record [

    financialRequestApprovalPercentage  : nat;  // threshold for financial request to be approved: 67% of total staked MVK supply
    financialRequestDurationInDays      : nat;  // duration of final request before expiry
    
]

type governanceFinancialUpdateConfigNewValueType is nat

type governanceFinancialUpdateConfigActionType is
| ConfigFinancialReqApprovalPct     of unit
| ConfigFinancialReqDurationDays    of unit

type governanceFinancialUpdateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue: governanceFinancialUpdateConfigNewValueType; 
  updateConfigAction: governanceFinancialUpdateConfigActionType;
]

// ------------------------------------------------------------------------------
// Governance Entrypoint Types
// ------------------------------------------------------------------------------

type voteForRequestType is [@layout:comb] record [
    requestId        : actionIdType;
    vote             : voteType;
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
| LambdaUpdateGeneralContracts                of updateGeneralContractsType
| LambdaUpdateWhitelistContracts              of updateWhitelistContractsType
| LambdaUpdateWhitelistTokens                 of updateWhitelistTokenContractsType
| LambdaMistakenTransfer                      of transferActionType

  // Financial Governance Lambdas
| LambdaRequestTokens                         of councilActionRequestTokensType
| LambdaRequestMint                           of councilActionRequestMintType
| LambdaSetContractBaker                      of councilActionSetContractBakerType
| LambdaDropFinancialRequest                  of (nat)
| LambdaVoteForRequest                        of voteForRequestType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type governanceFinancialStorageType is [@layout:comb] record [
    
    admin                               : address;
    metadata                            : metadataType;
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
