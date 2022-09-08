// ------------------------------------------------------------------------------
// Basic Types
// ------------------------------------------------------------------------------


type ownerAddressType   is address;

type tokenBalanceType   is nat;
type tokenAmountType    is nat;
type tokenIdType        is nat;


// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type tokenPoolRewardBreakGlassConfigType is [@layout:comb] record [
    onClaimRewardsIsPaused  : bool;
    empty                   : unit
]


// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


type tokenPoolRewardPausableEntrypointType is
    |   OnClaimRewards              of bool
    |   Empty                       of unit
    
type tokenPoolRewardTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : tokenPoolRewardPausableEntrypointType;
    empty             : unit
];


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type tokenPoolRewardLambdaActionType is 
        
        // Housekeeping Entrypoints
    |   LambdaSetAdmin                  of (address)
    |   LambdaSetGovernance             of (address)
    |   LambdaUpdateMetadata            of updateMetadataType
    |   LambdaUpdateWhitelistContracts  of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts    of updateGeneralContractsType
    |   LambdaUpdateWhitelistTokens     of updateWhitelistTokenContractsType
    |   LambdaMistakenTransfer          of transferActionType

        // Pause / Break Glass Entrypoints
    |   LambdaPauseAll                  of (unit)
    |   LambdaUnpauseAll                of (unit)
    |   LambdaTogglePauseEntrypoint     of tokenPoolRewardTogglePauseEntrypointType

        // Rewards Entrypoints
    |   LambdaOnClaimRewards            of transferActionType
    

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type tokenPoolRewardStorageType is [@layout:comb] record [
    admin                       : address;
    metadata                    : metadataType;
    breakGlassConfig            : tokenPoolRewardBreakGlassConfigType;

    mvkTokenAddress             : address;
    governanceAddress           : address;
    
    whitelistContracts          : whitelistContractsType;      
    generalContracts            : generalContractsType;
    whitelistTokenContracts     : whitelistTokenContractsType;      

    lambdaLedger                : lambdaLedgerType;   
]