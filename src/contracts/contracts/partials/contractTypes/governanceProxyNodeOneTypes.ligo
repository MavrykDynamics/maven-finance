
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

type targetFarmUpdateConfigParamsType is [@layout:comb] record [
    targetFarmAddress         : address;
    farmConfig                : farmUpdateConfigParamsType;
]

type targetAggregatorUpdateConfigParamsType is [@layout:comb] record [
    targetAggregatorAddress   : address;
    aggregatorConfig          : aggregatorUpdateConfigParamsType;
]

type targetFarmInitType is [@layout:comb] record [
    targetFarmAddress         : address;
    farmConfig                : initFarmParamsType;
]

type targetTreasuryTransferType is [@layout:comb] record [
    targetTreasuryAddress     : address;
    treasuryTransfer          : transferActionType;
]

type targetTreasuryMintMvkAndTransferType is [@layout:comb] record [
    targetTreasuryAddress     : address;
    treasuryMint              : mintMvkAndTransferType;
]

type updateOperatorsTreasuryType is [@layout:comb] record [
    targetTreasuryAddress     : address;
    treasuryUpdatedOperators  : updateOperatorsType;
]

type stakeTreasuryType is [@layout:comb] record [
    targetTreasuryAddress     : address;
    stakeAmount               : nat;
]

type unstakeTreasuryType is [@layout:comb] record [
    targetTreasuryAddress     : address;
    unstakeAmount             : nat;
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


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------

type updateContractConfigType is 
        UpdateGovernanceConfig             of governanceUpdateConfigParamsType
    |   UpdateGovernanceFinancialConfig    of governanceFinancialUpdateConfigParamsType
    |   UpdateGovernanceSatelliteConfig    of governanceSatelliteUpdateConfigParamsType
    |   UpdateDelegationConfig             of delegationUpdateConfigParamsType
    |   UpdateEmergencyConfig              of emergencyUpdateConfigParamsType
    |   UpdateBreakGlassConfig             of breakGlassUpdateConfigParamsType
    |   UpdateCouncilConfig                of councilUpdateConfigParamsType
    |   UpdateFarmConfig                   of targetFarmUpdateConfigParamsType
    |   UpdateFarmFactoryConfig            of farmFactoryUpdateConfigParamsType
    |   UpdateAggregatorConfig             of targetAggregatorUpdateConfigParamsType
    |   UpdateAggregatorFactoryConfig      of aggregatorFactoryUpdateConfigParamsType
    |   UpdateTreasuryFactoryConfig        of treasuryFactoryUpdateConfigParamsType
    |   UpdateDoormanConfig                of doormanUpdateConfigParamsType

type toggleContractEntrypointType is
        ToggleAggregatorEntrypoint         of toggleAggregatorEntrypointType
    |   ToggleAggregatorFacEntrypoint      of toggleAggregatorFacEntrypointType
    |   ToggleDelegationEntrypoint         of toggleDelegationEntrypointType
    |   ToggleDoormanEntrypoint            of toggleDoormanEntrypointType
    |   ToggleFarmEntrypoint               of toggleFarmEntrypointType
    |   ToggleFarmFacEntrypoint            of toggleFarmFacEntrypointType
    |   ToggleTreasuryEntrypoint           of toggleTreasuryEntrypointType
    |   ToggleTreasuryFacEntrypoint        of toggleTreasuryFacEntrypointType


type manageVesteeType is 
        AddVestee                          of addVesteeType
    |   RemoveVestee                       of (address)
    |   UpdateVestee                       of updateVesteeType
    |   ToggleVesteeLock                   of (address)


type trackContractType is 
        TrackFarm                          of (address)
    |   TrackTreasury                      of (address)
    |   TrackAggregator                    of (address)


type untrackContractType is 
        UntrackFarm                          of (address)
    |   UntrackTreasury                      of (address)
    |   UntrackAggregator                    of (address)

type executeActionParamsType is 

        UpdateProxyLambda                  of setProxyLambdaType
    |   SetContractAdmin                   of setContractAdminType
    |   SetContractGovernance              of setContractGovernanceType
    |   SetContractName                    of setContractNameType
    |   SetContractLambda                  of setContractLambdaType
    |   SetFactoryProductLambda            of setContractLambdaType
    |   UpdateContractMetadata             of updateContractMetadataType
    |   UpdateContractWhitelistMap         of updateContractWhitelistMapType
    |   UpdateContractGeneralMap           of updateContractGeneralMapType
    |   UpdateContractWhitelistTokenMap    of updateContractWhitelistTokenMapType

    |   UpdateContractConfig               of updateContractConfigType

    |   PauseAllContractEntrypoint         of (address)
    |   UnpauseAllContractEntrypoint       of (address)
    |   ToggleContractEntrypoint           of toggleContractEntrypointType

    |   UpdateWhitelistDevelopersSet       of (address)
    |   SetGovernanceProxy                 of (address)

    |   TrackContract                      of trackContractType
    |   UntrackContract                    of untrackContractType

type executeActionType is (executeActionParamsType)


type governanceProxyNodeLambdaActionType is 

        // Housekeeping Lambdas
        LambdaSetAdmin                        of (address)
    |   LambdaSetGovernance                   of (address)
    |   LambdaUpdateMetadata                  of updateMetadataType
    |   LambdaUpdateWhitelistContracts        of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts          of updateGeneralContractsType
    |   LambdaUpdateWhitelistTokens           of updateWhitelistTokenContractsType
    |   LambdaMistakenTransfer                of transferActionType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type governanceProxyNodeStorageType is record [
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

