
// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type lambdaPointerLedgerType is map(string, address)
type proxyLambdaLedgerType is map(string, bytes)

// ------------------------------------------------------------------------------
// Execute Action Types
// ------------------------------------------------------------------------------

type setProxyLambdaType is [@layout:comb] record [
    lambdaName  : string;
    func_bytes  : bytes;
]

type setContractLambdaType is [@layout:comb] record [
    targetContractAddress   : address;
    name                    : string;
    func_bytes              : bytes;
]

type updateContractWhitelistMapType is [@layout:comb] record [
    targetContractAddress     : address;
    whitelistContractName     : string;
    whitelistContractAddress  : address; 
]

type updateContractWhitelistTokenMapType is [@layout:comb] record [
    targetContractAddress     : address;
    tokenContractName         : string;
    tokenContractAddress      : address; 
]

type targetTreasuryTransferType is [@layout:comb] record [
    targetTreasuryAddress     : address;
    treasuryTransfer          : transferActionType;
]

type targetTreasuryMintMvkAndTransferType is [@layout:comb] record [
    targetTreasuryAddress     : address;
    treasuryMint              : mintMvkAndTransferType;
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

type setLambdaPointerActionType is [@layout:comb] record [
    setAction           : string; // add / update / remove
    entrypointName      : string; 
    proxyNodeAddress    : option(address);
]

type processGovernanceActionType is [@layout:comb] record [
    entrypointName      : string;
    encodedCode         : bytes;
]

type setProxyNodeAddressActionType is [@layout:comb] record [
    setAction           : string; // add / remove
    proxyNodeAddress    : address;
]

// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type executeActionParamsType is 

        UpdateProxyLambda                  of setProxyLambdaType
    
    |   GovSetLambdaPointer                of setLambdaPointerActionType
    |   GovSetProxyNodeAddress             of setProxyNodeAddressActionType

    |   SetContractAdmin                   of setContractAdminType
    |   SetContractGovernance              of setContractGovernanceType
    |   SetContractLambda                  of setContractLambdaType
    |   SetFactoryProductLambda            of setContractLambdaType
    |   UpdateContractWhitelistMap         of updateContractWhitelistMapType
    |   UpdateContractWhitelistTokenMap    of updateContractWhitelistTokenMapType

    |   UpdateWhitelistDevelopersSet       of (address)
    |   SetGovernanceProxy                 of (address)

    |   CreateFarm                         of createFarmType
    |   CreateAggregator                   of createAggregatorParamsType
    |   CreateTreasury                     of createTreasuryType
    
    |   PauseAllContractEntrypoint         of (address)
    |   UnpauseAllContractEntrypoint       of (address)
    
    |   ToggleDoormanEntrypoint            of toggleDoormanEntrypointType
    |   ToggleDelegationEntrypoint         of toggleDelegationEntrypointType
    |   ToggleAggregatorEntrypoint         of toggleAggregatorEntrypointType
    |   ToggleAggregatorFacEntrypoint      of toggleAggregatorFacEntrypointType
    |   ToggleFarmEntrypoint               of toggleFarmEntrypointType
    |   ToggleFarmFacEntrypoint            of toggleFarmFacEntrypointType
    |   ToggleTreasuryEntrypoint           of toggleTreasuryEntrypointType
    |   ToggleTreasuryFacEntrypoint        of toggleTreasuryFacEntrypointType
    |   ToggleVaultFacEntrypoint           of toggleVaultFacEntrypointType
    |   ToggleLendingContEntrypoint        of toggleLendingContEntrypointType
    
    |   TransferTreasury                   of targetTreasuryTransferType
    |   MintMvkAndTransferTreasury         of targetTreasuryMintMvkAndTransferType

    |   UpdateMvkInflationRate             of (nat)
    |   TriggerMvkInflation                of (unit)

    |   AddVestee                          of addVesteeType
    |   UpdateVestee                       of updateVesteeType
    |   ToggleVesteeLock                   of (address)
    |   RemoveVestee                       of (address)

    
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
    proxyNodeAddresses          : set(address);
    
    whitelistContracts          : whitelistContractsType;      
    generalContracts            : generalContractsType; 
    whitelistTokenContracts     : whitelistTokenContractsType;      

    lambdaPointerLedger         : lambdaPointerLedgerType;
    proxyLambdaLedger           : proxyLambdaLedgerType;
    lambdaLedger                : lambdaLedgerType;             
]

