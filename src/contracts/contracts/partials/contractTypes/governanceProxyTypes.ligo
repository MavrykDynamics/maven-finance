
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

