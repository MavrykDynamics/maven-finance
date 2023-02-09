
// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type lambdaPointerLedgerType is map(string, address)
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

type toggleVaultFacEntrypointType is [@layout:comb] record [
    targetEntrypoint          : vaultFactoryTogglePauseEntrypointType;
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

type toggleLendingContEntrypointType is [@layout:comb] record [
    targetEntrypoint          : lendingControllerTogglePauseEntrypointType;
    empty                     : unit;
]

type addLambdaPointerActionType is [@layout:comb] record [
    entrypointName      : string;
    proxyNodeAddress    : address;
]


type updateLambdaPointerActionType is [@layout:comb] record [
    entrypointName      : string;
    proxyNodeAddress    : address;
]


type removeLambdaPointerActionType is [@layout:comb] record [
    entrypointName      : string;
    empty               : unit;
]


type setLambdaPointerActionType is 
    |   AddLambdaPointer        of addLambdaPointerActionType
    |   UpdateLambdaPointer     of updateLambdaPointerActionType
    |   RemoveLambdaPointer     of removeLambdaPointerActionType


type processGovernanceActionType is [@layout:comb] record [
    entrypointName      : string;
    encodedCode         : bytes;
]


type setProxyNodeAddressActionType is 
    |   AddProxyNodeAddress         of (address)
    |   RemoveProxyNodeAddress      of (address)

// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type executeActionParamsType is 

        UpdateProxyLambda                  of setProxyLambdaType
    
    |   SetContractAdmin                   of setContractAdminType
    |   SetContractGovernance              of setContractGovernanceType
    |   SetContractLambda                  of setContractLambdaType
    |   SetFactoryProductLambda            of setContractLambdaType
    |   UpdateContractWhitelistMap         of updateContractWhitelistMapType
    |   UpdateContractWhitelistTokenMap    of updateContractWhitelistTokenMapType

    |   PauseAllContractEntrypoint         of (address)
    |   UnpauseAllContractEntrypoint       of (address)
    
    |   ToggleDelegationEntrypoint         of toggleDelegationEntrypointType
    |   ToggleDoormanEntrypoint            of toggleDoormanEntrypointType
    |   ToggleAggregatorEntrypoint         of toggleAggregatorEntrypointType
    |   ToggleAggregatorFacEntrypoint      of toggleAggregatorFacEntrypointType
    |   ToggleFarmEntrypoint               of toggleFarmEntrypointType
    |   ToggleFarmFacEntrypoint            of toggleFarmFacEntrypointType
    |   ToggleTreasuryEntrypoint           of toggleTreasuryEntrypointType
    |   ToggleTreasuryFacEntrypoint        of toggleTreasuryFacEntrypointType
    |   ToggleVaultFacEntrypoint           of toggleVaultFacEntrypointType
    |   ToggleLendingContEntrypoint        of toggleLendingContEntrypointType

    |   UpdateWhitelistDevelopersSet       of (address)
    |   SetGovernanceProxy                 of (address)

    |   CreateFarm                         of createFarmType
    |   CreateAggregator                   of createAggregatorParamsType
    |   CreateTreasury                     of createTreasuryType
    
    |   TransferTreasury                   of targetTreasuryTransferType
    |   MintMvkAndTransferTreasury         of targetTreasuryMintMvkAndTransferType

    |   UpdateMvkInflationRate             of (nat)
    |   TriggerMvkInflation                of (unit)

    |   AddVestee                          of addVesteeType
    |   RemoveVestee                       of (address)
    |   UpdateVestee                       of updateVesteeType
    |   ToggleVesteeLock                   of (address)
    
    |   SetLoanToken                       of setLoanTokenActionType
    |   SetCollateralToken                 of setCollateralTokenActionType

    
type executeActionType is (executeActionParamsType)


type governanceProxyLambdaActionType is 

        // Housekeeping Lambdas
        LambdaSetAdmin                        of (address)
    |   LambdaSetGovernance                   of (address)
    |   LambdaUpdateMetadata                  of updateMetadataType
    |   LambdaUpdateWhitelistContracts        of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts          of updateGeneralContractsType
    |   LambdaUpdateWhitelistTokens           of updateWhitelistTokenContractsType
    |   LambdaMistakenTransfer                of transferActionType

        // Governance Proxy Lambdas
    |   LambdaSetProxyNodeAddress             of setProxyNodeAddressActionType
    |   LambdaProcessGovernanceAction         of processGovernanceActionType

        // Meta Lambdas
    |   LambdaSetLambdaPointer                of setLambdaPointerActionType


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type governanceProxyStorageType is record [
    admin                       : address;
    metadata                    : metadataType;

    mvkTokenAddress             : address;
    governanceAddress           : address;
    proxyNodeAddresses           : set(address);
    
    whitelistContracts          : whitelistContractsType;      
    generalContracts            : generalContractsType; 
    whitelistTokenContracts     : whitelistTokenContractsType;      

    lambdaPointerLedger         : lambdaPointerLedgerType;
    proxyLambdaLedger           : proxyLambdaLedgerType;
    lambdaLedger                : lambdaLedgerType;             
]

