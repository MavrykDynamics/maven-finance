// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type treasuryFactoryBreakGlassConfigType is record [
    createTreasuryIsPaused     : bool;
    trackTreasuryIsPaused      : bool;
    untrackTreasuryIsPaused    : bool;
]

type treasuryFactoryConfigType is [@layout:comb] record [
    treasuryNameMaxLength   : nat;
    empty                   : unit;
] 


// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------


type createTreasuryType is [@layout:comb] record[
    baker                   : option(key_hash); 
    name                    : string;
    addToGeneralContracts   : bool;
    metadata                : bytes;
]

type treasuryFactoryUpdateConfigNewValueType is nat
type treasuryFactoryUpdateConfigActionType is 
        ConfigTreasuryNameMaxLength of unit
    |   Empty                       of unit
type treasuryFactoryUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue    : treasuryFactoryUpdateConfigNewValueType; 
    updateConfigAction      : treasuryFactoryUpdateConfigActionType;
]

type treasuryFactoryPausableEntrypointType is
        CreateTreasury         of bool
    |   TrackTreasury          of bool
    |   UntrackTreasury        of bool

type treasuryFactoryTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : treasuryFactoryPausableEntrypointType;
    empty             : unit
];

// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type treasuryFactoryLambdaActionType is 

        // Housekeeping Entrypoints
        LambdaSetAdmin                            of (address)
    |   LambdaSetGovernance                       of (address)
    |   LambdaUpdateMetadata                      of updateMetadataType
    |   LambdaUpdateConfig                        of treasuryFactoryUpdateConfigParamsType
    |   LambdaUpdateWhitelistContracts            of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts              of updateGeneralContractsType
    |   LambdaUpdateWhitelistTokens               of updateWhitelistTokenContractsType
    |   LambdaMistakenTransfer                    of transferActionType

        // Pause / Break Glass Entrypoints
    |   LambdaPauseAll                            of (unit)
    |   LambdaUnpauseAll                          of (unit)
    |   LambdaTogglePauseEntrypoint               of treasuryFactoryTogglePauseEntrypointType

        // Treasury Factory Entrypoints
    |   LambdaCreateTreasury                      of createTreasuryType
    |   LambdaTrackTreasury                       of address
    |   LambdaUntrackTreasury                     of address


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type treasuryFactoryStorageType is [@layout:comb] record[
    admin                      : address;
    metadata                   : metadataType;
    config                     : treasuryFactoryConfigType;

    mvnTokenAddress            : address;
    governanceAddress          : address;

    trackedTreasuries          : set(address);
    breakGlassConfig           : treasuryFactoryBreakGlassConfigType;

    whitelistContracts         : whitelistContractsType;      // whitelist of contracts that can access restricted entrypoints
    generalContracts           : generalContractsType;
    whitelistTokenContracts    : whitelistTokenContractsType;

    lambdaLedger               : lambdaLedgerType;
    treasuryLambdaLedger       : lambdaLedgerType;
]