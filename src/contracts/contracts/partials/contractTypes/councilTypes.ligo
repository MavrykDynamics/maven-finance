// ------------------------------------------------------------------------------
// Required Partial Types
// ------------------------------------------------------------------------------


// Council Types
#include "../shared/councilActionTypes.ligo"

// Vote Types
#include "../shared/voteTypes.ligo"


// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------

type councilConfigType is [@layout:comb] record [
    threshold                       : nat;              // min number of council members who need to agree on action
    actionExpiryDays                : nat;              // action expiry in number of days 
    
    councilMemberNameMaxLength      : nat;
    councilMemberWebsiteMaxLength   : nat;
    councilMemberImageMaxLength     : nat;
    requestTokenNameMaxLength       : nat;
    requestPurposeMaxLength         : nat;
]


// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------



type councilUpdateConfigNewValueType is nat
type councilUpdateConfigActionType is 
        ConfigThreshold                       of unit
    |   ConfigActionExpiryDays                of unit
    |   ConfigCouncilNameMaxLength            of unit
    |   ConfigCouncilWebsiteMaxLength         of unit
    |   ConfigCouncilImageMaxLength           of unit
    |   ConfigRequestTokenNameMaxLength       of unit
    |   ConfigRequestPurposeMaxLength         of unit

type councilUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue        : councilUpdateConfigNewValueType; 
    updateConfigAction          : councilUpdateConfigActionType;
]

type councilActionRequestTokensType is [@layout:comb] record [
    treasuryAddress             : address;       // treasury address
    receiverAddress             : address;       // address of receiver
    tokenContractAddress        : address;       // token contract address
    tokenName                   : string;        // token name 
    tokenAmount                 : nat;           // token amount requested
    tokenType                   : string;        // "MVRK", "FA12", "FA2"
    tokenId                     : nat;        
    purpose                     : string;        // financial request purpose
]

type councilActionRequestMintType is [@layout:comb] record [
    treasuryAddress             : address;       // treasury address
    receiverAddress             : address;       // address of receiver
    tokenAmount                 : nat;           // MVN token amount requested
    purpose                     : string;        // financial request purpose
]

type councilActionTransferType is [@layout:comb] record [
    receiverAddress             : address;       // receiver address
    tokenContractAddress        : address;       // token contract address
    tokenAmount                 : nat;           // token amount requested
    tokenType                   : string;        // "MVRK", "FA12", "FA2"
    tokenId                     : nat;  
    purpose                     : string;           
]

type setBakerType is option(key_hash)
type councilActionSetContractBakerType is [@layout:comb] record [
    targetContractAddress       : address;
    keyHash                     : option(key_hash);
]

type addVesteeType is [@layout:comb] record [
    vesteeAddress               : address;
    totalAllocatedAmount        : nat;
    cliffInMonths               : nat;
    vestingInMonths             : nat;
]

type updateVesteeType is [@layout:comb] record [
    vesteeAddress               : address;
    newTotalAllocatedAmount     : nat;
    newCliffInMonths            : nat;
    newVestingInMonths          : nat;
]


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


// Council Helpers to Lambda Action Type
type councilLambdaActionType is 

        // Housekeeping Lambdas
        LambdaSetAdmin                              of address
    |   LambdaSetGovernance                         of address
    |   LambdaUpdateMetadata                        of updateMetadataType
    |   LambdaUpdateConfig                          of councilUpdateConfigParamsType
    |   LambdaUpdateWhitelistContracts              of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts                of updateGeneralContractsType
    |   LambdaUpdateCouncilMemberInfo               of councilMemberInfoType

        // Council Actions for Internal Control
    |   LambdaCouncilAddMember                      of councilActionAddMemberType
    |   LambdaCouncilRemoveMember                   of address
    |   LambdaCouncilChangeMember                   of councilActionChangeMemberType
    |   LambdaCouncilSetBaker                       of setBakerType

        // Council Actions for Vesting
    |   LambdaCouncilAddVestee                      of addVesteeType
    |   LambdaCouncilRemoveVestee                   of address
    |   LambdaCouncilUpdateVestee                   of updateVesteeType
    |   LambdaCouncilToggleVesteeLock               of address

        // Council Actions for Financial Governance
    |   LambdaCouncilTransfer                       of councilActionTransferType
    |   LambdaCouncilRequestTokens                  of councilActionRequestTokensType
    |   LambdaCouncilRequestMint                    of councilActionRequestMintType
    |   LambdaCouncilSetContractBaker               of councilActionSetContractBakerType
    |   LambdaCouncilDropFinancialReq               of nat

        // Council Signing of Actions
    |   LambdaFlushAction                           of actionIdType
    |   LambdaSignAction                            of actionIdType 


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type councilStorageType is [@layout:comb] record [
    admin                       : address;
    metadata                    : metadataType;
    config                      : councilConfigType;

    mvnTokenAddress             : address;
    governanceAddress           : address;
    
    whitelistContracts          : whitelistContractsType;      
    generalContracts            : generalContractsType;
    
    councilMembers              : councilMembersType;
    councilSize                 : nat;
    councilActionsLedger        : councilActionsLedgerType;
    councilActionsSigners       : signersType;
    actionCounter               : nat;

    lambdaLedger                : lambdaLedgerType;
]
