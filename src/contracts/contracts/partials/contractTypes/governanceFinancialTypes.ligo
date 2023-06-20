// ------------------------------------------------------------------------------
// Required Partial Types
// ------------------------------------------------------------------------------


// Vote Types
#include "../shared/voteTypes.ligo"


// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------

type financialRequestRecordType is [@layout:comb] record [

    requesterAddress                    : address;
    requestType                         : string;   // "MINT" or "TRANSFER"
    status                              : bool;     // True - ACTIVE / False - DROPPED -- DEFEATED / EXECUTED / DRAFT
    executed                            : bool;     // false on creation; set to true when financial request is executed successfully
    
    treasuryAddress                     : address;
    tokenContractAddress                : address; 
    tokenAmount                         : nat;
    tokenName                           : string; 
    tokenType                           : string;
    tokenId                             : nat;
    requestPurpose                      : string;
    keyHash                             : option(key_hash);

    yayVoteStakedMvkTotal               : nat;
    nayVoteStakedMvkTotal               : nat;
    passVoteStakedMvkTotal              : nat;

    governanceCycleId                   : nat;
    snapshotStakedMvkTotalSupply        : nat;
    stakedMvkPercentageForApproval      : nat; 
    stakedMvkRequiredForApproval        : nat; 

    requestedDateTime                   : timestamp;  // log of when the request was submitted
    expiryDateTime                      : timestamp;
    executedDateTime                    : option(timestamp);
]
type financialRequestLedgerType is big_map (actionIdType, financialRequestRecordType);

// ------------------------------------------------------------------------------
// Governance Financial Config Types
// ------------------------------------------------------------------------------

type governanceFinancialConfigType is [@layout:comb] record [
    approvalPercentage                  : nat;  // threshold for financial request to be approved: 67% of total staked MVK supply
    financialRequestDurationInDays      : nat;  // duration of final request before expiry
]


// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


type voteForRequestType is [@layout:comb] record [
    requestId        : actionIdType;
    vote             : voteType;
]

type governanceFinancialUpdateConfigNewValueType is nat


type governanceFinancialUpdateConfigActionType is
    |   ConfigApprovalPercentage          of unit
    |   ConfigFinancialReqDurationDays    of unit

type governanceFinancialUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue    : governanceFinancialUpdateConfigNewValueType; 
    updateConfigAction      : governanceFinancialUpdateConfigActionType;
]


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type governanceFinancialLambdaActionType is 
  
        // Housekeeping Lambdas
    |   LambdaSetAdmin                              of address
    |   LambdaSetGovernance                         of address
    |   LambdaUpdateMetadata                        of updateMetadataType
    |   LambdaUpdateConfig                          of governanceFinancialUpdateConfigParamsType
    |   LambdaUpdateWhitelistContracts              of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts                of updateGeneralContractsType    
    |   LambdaUpdateWhitelistTokens                 of updateWhitelistTokenContractsType
    |   LambdaMistakenTransfer                      of transferActionType

        // Financial Governance Lambdas
    |   LambdaRequestTokens                         of councilActionRequestTokensType
    |   LambdaRequestMint                           of councilActionRequestMintType
    |   LambdaSetContractBaker                      of councilActionSetContractBakerType
    |   LambdaDropFinancialRequest                  of (nat)
    |   LambdaVoteForRequest                        of voteForRequestType


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
    financialRequestCounter             : nat;
    financialRequestVoters              : votersType;

    // lambda storage
    lambdaLedger                        : lambdaLedgerType;

]
