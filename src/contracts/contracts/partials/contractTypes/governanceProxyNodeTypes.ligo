
// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type proxyLambdaLedgerType is map(string, bytes)


// ------------------------------------------------------------------------------
// Execute Action Types
// ------------------------------------------------------------------------------

// General action types

type setProxyLambdaType is [@layout:comb] record [
    lambdaName  : string;
    func_bytes  : bytes;
]

type updateContractMetadataType is [@layout:comb] record [
    targetContractAddress  : address;
    metadataKey            : string;
    metadataHash           : bytes; 
]

type updateContractGeneralMapType is [@layout:comb] record [
    targetContractAddress     : address;
    generalContractName       : string;
    generalContractAddress    : address; 
]

type setContractNameType is [@layout:comb] record [
    targetContractAddress     : address;
    contractName              : string;
]

// Farm related action types

type targetFarmUpdateConfigParamsType is [@layout:comb] record [
    targetFarmAddress         : address;
    farmConfig                : farmUpdateConfigParamsType;
]

type targetFarmInitType is [@layout:comb] record [
    targetFarmAddress         : address;
    farmConfig                : initFarmParamsType;
]

// Aggregator related action types

type targetAggregatorUpdateConfigParamsType is [@layout:comb] record [
    targetAggregatorAddress   : address;
    aggregatorConfig          : aggregatorUpdateConfigParamsType;
]

// Treasury related action types

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


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type executeActionParamsType is 

        UpdateProxyLambda                  of setProxyLambdaType

    |   SetContractName                    of setContractNameType
    |   UpdateContractMetadata             of updateContractMetadataType
    |   UpdateContractGeneralMap           of updateContractGeneralMapType

    |   UpdateGovernanceConfig             of governanceUpdateConfigParamsType
    |   UpdateGovernanceFinancialConfig    of governanceFinancialUpdateConfigParamsType
    |   UpdateGovernanceSatelliteConfig    of governanceSatelliteUpdateConfigParamsType
    |   UpdateDoormanConfig                of doormanUpdateConfigParamsType
    |   UpdateDelegationConfig             of delegationUpdateConfigParamsType
    |   UpdateEmergencyConfig              of emergencyUpdateConfigParamsType
    |   UpdateBreakGlassConfig             of breakGlassUpdateConfigParamsType
    |   UpdateCouncilConfig                of councilUpdateConfigParamsType
    |   UpdateFarmConfig                   of targetFarmUpdateConfigParamsType
    |   UpdateFarmFactoryConfig            of farmFactoryUpdateConfigParamsType
    |   UpdateAggregatorConfig             of targetAggregatorUpdateConfigParamsType
    |   UpdateAggregatorFactoryConfig      of aggregatorFactoryUpdateConfigParamsType
    |   UpdateTreasuryFactoryConfig        of treasuryFactoryUpdateConfigParamsType
    // |   UpdateVaultFactoryConfig           of vaultFactoryUpdateConfigParamsType
    // |   UpdateLendingControllerConfig      of lendingControllerUpdateConfigParamsType

    |   InitFarm                           of (targetFarmInitType)
    |   TrackFarm                          of (address)
    |   UntrackFarm                        of (address)
    |   CloseFarm                          of (address)

    |   TrackTreasury                      of (address)
    |   UntrackTreasury                    of (address)
    |   UpdateMvkOperatorsTreasury         of updateOperatorsTreasuryType
    |   StakeMvkTreasury                   of stakeTreasuryType
    |   UnstakeMvkTreasury                 of unstakeTreasuryType

    |   TrackAggregator                    of (address)
    |   UntrackAggregator                  of (address)

    // |   SetLoanToken                       of setLoanTokenActionType
    // |   SetCollateralToken                 of setCollateralTokenActionType

    
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
    governanceAddress           : address;    
    
    whitelistContracts          : whitelistContractsType;      
    generalContracts            : generalContractsType; 
    whitelistTokenContracts     : whitelistTokenContractsType;      

    proxyLambdaLedger           : proxyLambdaLedgerType;
    lambdaLedger                : lambdaLedgerType;             
]

