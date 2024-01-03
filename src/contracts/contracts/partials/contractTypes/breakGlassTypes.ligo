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


type breakGlassConfigType is [@layout:comb] record [
    threshold                       : nat;    // min number of council members who need to agree on action
    actionExpiryDays                : nat;    // action expiry in number of days

    councilMemberNameMaxLength      : nat;
    councilMemberWebsiteMaxLength   : nat;
    councilMemberImageMaxLength     : nat;
]

// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


type breakGlassUpdateConfigNewValueType is nat
type breakGlassUpdateConfigActionType is 
        ConfigThreshold               of unit
    |   ConfigActionExpiryDays        of unit
    |   ConfigCouncilNameMaxLength    of unit
    |   ConfigCouncilWebsiteMaxLength of unit
    |   ConfigCouncilImageMaxLength   of unit

type breakGlassUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue  : breakGlassUpdateConfigNewValueType; 
    updateConfigAction    : breakGlassUpdateConfigActionType;
]

type setContractsAdminType is [@layout:comb] record [
    contractAddressSet  : set(address);
    newAdminAddress     : address;
]

// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type breakGlassLambdaActionType is 

        // Break Glass
    |   LambdaBreakGlass                    of (unit)

        // Housekeeping Entrypoints - Glass Broken Not Required
    |   LambdaSetAdmin                      of (address)
    |   LambdaSetGovernance                 of (address)
    |   LambdaUpdateMetadata                of updateMetadataType
    |   LambdaUpdateConfig                  of breakGlassUpdateConfigParamsType    
    |   LambdaUpdateWhitelistContracts      of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts        of updateGeneralContractsType
    |   LambdaMistakenTransfer              of transferActionType
    |   LambdaUpdateCouncilMemberInfo       of councilMemberInfoType

        // Council Actions for Internal Control
    |   LambdaCouncilAddMember              of councilActionAddMemberType
    |   LambdaCouncilRemoveMember           of address
    |   LambdaCouncilChangeMember           of councilActionChangeMemberType

        // Glass Broken Required
    |   LambdaPropagateBreakGlass           of set(address)
    |   LambdaSetContractsAdmin             of setContractsAdminType
    |   LambdaPauseAllEntrypoints           of set(address)
    |   LambdaUnpauseAllEntrypoints         of set(address)
    |   LambdaRemoveBreakGlassControl       of set(address)

        // Council Signing of Actions
    |   LambdaFlushAction                   of actionIdType
    |   LambdaSignAction                    of actionIdType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type breakGlassStorageType is [@layout:comb] record [
    admin                       : address;               
    metadata                    : metadataType;
    config                      : breakGlassConfigType;

    mvnTokenAddress             : address;
    governanceAddress           : address;

    whitelistContracts          : whitelistContractsType;    // whitelist of contracts that can access restricted entrypoints
    generalContracts            : generalContractsType;      // map of all contract addresses (e.g. doorman, delegation, vesting)

    glassBroken                 : bool;
    councilMembers              : councilMembersType;        // set of council member addresses
    councilSize                 : nat;
    
    actionsLedger               : councilActionsLedgerType;         // record of past actions taken by council members
    actionsSigners              : signersType;
    actionCounter               : nat;

    lambdaLedger                : lambdaLedgerType;
]
