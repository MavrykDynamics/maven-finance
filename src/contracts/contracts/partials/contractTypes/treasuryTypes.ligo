// ------------------------------------------------------------------------------
// Required Types
// ------------------------------------------------------------------------------


// Treasury Transfer Types
#include "../../partials/shared/transferTypes.ligo"


// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type treasuryBreakGlassConfigType is [@layout:comb] record [
    transferIsPaused                : bool; 
    mintMvkAndTransferIsPaused      : bool;
    updateTokenOperatorsIsPaused    : bool;
    stakeTokensIsPaused             : bool;
    unstakeTokensIsPaused           : bool;
]


// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


type mintMvkAndTransferType is [@layout:comb] record [
    to_             : address;
    amt             : nat;
]

type treasuryPausableEntrypointType is
        Transfer                       of bool   
    |   MintMvkAndTransfer             of bool
    |   UpdateTokenOperators           of bool
    |   StakeTokens                    of bool
    |   UnstakeTokens                  of bool

type treasuryTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : treasuryPausableEntrypointType;
    empty             : unit
];


type updateTokenOperatorsType is [@layout:comb] record [
    tokenContractAddress    : address;
    updateOperators         : updateOperatorsType;
]


type stakeTokensType is [@layout:comb] record [
    contractAddress  : address;
    amount           : nat;
]


type unstakeTokensType is [@layout:comb] record [
    contractAddress  : address;
    amount           : nat;
]

// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type treasuryLambdaActionType is 

        // Housekeeping Entrypoints
    |   LambdaSetAdmin                       of (address)
    |   LambdaSetGovernance                  of (address)
    |   LambdaSetBaker                       of option(key_hash)
    |   LambdaSetName                        of (string)
    |   LambdaUpdateMetadata                 of updateMetadataType
    |   LambdaUpdateWhitelistContracts       of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts         of updateGeneralContractsType
    |   LambdaUpdateWhitelistTokens          of updateWhitelistTokenContractsType

        // Pause / Break Glass Entrypoints
    |   LambdaPauseAll                       of (unit)
    |   LambdaUnpauseAll                     of (unit)
    |   LambdaTogglePauseEntrypoint          of treasuryTogglePauseEntrypointType

        // Treasury Entrypoints
    |   LambdaTransfer                       of transferActionType
    |   LambdaMintMvkAndTransfer             of mintMvkAndTransferType
    |   LambdaUpdateTokenOperators           of updateTokenOperatorsType
    |   LambdaStakeTokens                    of stakeTokensType
    |   LambdaUnstakeTokens                  of unstakeTokensType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type treasuryStorageType is [@layout:comb] record [
    admin                      : address;
    metadata                   : metadataType;
    name                       : string;
    
    mvkTokenAddress            : address;
    governanceAddress          : address;

    whitelistContracts         : whitelistContractsType;
    generalContracts           : generalContractsType;
    whitelistTokenContracts    : whitelistTokenContractsType;

    breakGlassConfig           : treasuryBreakGlassConfigType;

    lambdaLedger               : lambdaLedgerType;
]