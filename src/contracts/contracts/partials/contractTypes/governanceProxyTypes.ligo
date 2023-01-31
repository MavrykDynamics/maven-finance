
// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type proxyLambdaLedgerType is big_map(nat, bytes)


// ------------------------------------------------------------------------------
// Execute Action Types
// ------------------------------------------------------------------------------

type setProxyLambdaType is [@layout:comb] record [
    id          : nat;
    func_bytes  : bytes;
]

type processGovernanceActionType is [@layout:comb] record [
    contractName    : string;
    encodedCode     : bytes;
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

type setContractNameType is [@layout:comb] record [
    targetContractAddress     : address;
    contractName              : string;
]

type toggleAggregatorEntrypointType is [@layout:comb] record [
    targetAggregatorAddress   : address;
    targetEntrypoint          : aggregatorTogglePauseEntrypointType;
]

type toggleAggregatorFacEntrypointType is [@layout:comb] record [
    targetEntrypoint          : aggregatorFactoryTogglePauseEntrypointType;
    empty                     : unit;
]

type toggleFarmEntrypointType is [@layout:comb] record [
    targetFarmAddress         : address;
    targetEntrypoint          : farmTogglePauseEntrypointType;
]

type toggleFarmFacEntrypointType is [@layout:comb] record [
    targetEntrypoint          : farmFactoryTogglePauseEntrypointType;
    empty                     : unit;
]

type toggleTreasuryEntrypointType is [@layout:comb] record [
    targetTreasuryAddress     : address;
    targetEntrypoint          : treasuryTogglePauseEntrypointType;
]

type toggleTreasuryFacEntrypointType is [@layout:comb] record [
    targetEntrypoint          : treasuryFactoryTogglePauseEntrypointType;
    empty                     : unit;
]

type toggleDoormanEntrypointType is [@layout:comb] record [
    targetEntrypoint          : doormanTogglePauseEntrypointType;
    empty                     : unit;
]

type toggleDelegationEntrypointType is [@layout:comb] record [
    targetEntrypoint          : delegationTogglePauseEntrypointType;
    empty                     : unit;
]


type toggleContractEntrypointType is
        ToggleAggregatorEntrypoint         of toggleAggregatorEntrypointType
    |   ToggleAggregatorFacEntrypoint      of toggleAggregatorFacEntrypointType
    |   ToggleDelegationEntrypoint         of toggleDelegationEntrypointType
    |   ToggleDoormanEntrypoint            of toggleDoormanEntrypointType
    |   ToggleFarmEntrypoint               of toggleFarmEntrypointType
    |   ToggleFarmFacEntrypoint            of toggleFarmFacEntrypointType
    |   ToggleTreasuryEntrypoint           of toggleTreasuryEntrypointType
    |   ToggleTreasuryFacEntrypoint        of toggleTreasuryFacEntrypointType


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------

type executeGovernanceActionType is 

        UpdateProxyLambda                  of setProxyLambdaType
    |   SetContractAdmin                   of setContractAdminType
    |   SetContractGovernance              of setContractGovernanceType
    |   SetContractName                    of setContractNameType
    |   SetContractLambda                  of setContractLambdaType
    |   UpdateContractMetadata             of updateContractMetadataType
    |   UpdateContractWhitelistMap         of updateContractWhitelistMapType
    |   UpdateContractGeneralMap           of updateContractGeneralMapType
    |   UpdateContractWhitelistTokenMap    of updateContractWhitelistTokenMapType

    |   PauseAllContractEntrypoint         of (address)
    |   UnpauseAllContractEntrypoint       of (address)
    |   ToggleContractEntrypoint           of toggleContractEntrypointType

    |   UpdateWhitelistDevelopersSet       of (address)
    |   SetGovernanceProxy                 of (address)

    |   UpdateMvkInflationRate             of (nat)
    |   TriggerMvkInflation                of (unit)

    // |   SetLambda                          of setLambdaType
    // |   SetProductLambda                   of setLambdaType


type governanceProxyLambdaActionType is 

        // Housekeeping Lambdas
        LambdaSetAdmin                        of (address)
    |   LambdaSetGovernance                   of (address)
    |   LambdaUpdateMetadata                  of updateMetadataType
    |   LambdaUpdateWhitelistContracts        of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts          of updateGeneralContractsType
    |   LambdaUpdateWhitelistTokens           of updateWhitelistTokenContractsType
    |   LambdaMistakenTransfer                of transferActionType

        // Main Lambdas
    |   LambdaExecuteGovernanceAction         of (bytes)
    |   LambdaProcessGovernanceAction         of processGovernanceActionType

    |   LambdaSetLambda                       of setLambdaType

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type governanceProxyStorageType is record [
    admin                       : address;
    metadata                    : metadataType;

    mvkTokenAddress             : address;
    governanceAddress           : address;    // separate admin from governance address in event of break glass
    
    whitelistContracts          : whitelistContractsType;      
    generalContracts            : generalContractsType; 
    whitelistTokenContracts     : whitelistTokenContractsType;      

    proxyLambdaLedger           : proxyLambdaLedgerType;
    lambdaLedger                : lambdaLedgerType;             
]

