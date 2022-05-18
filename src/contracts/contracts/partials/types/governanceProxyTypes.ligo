
// ------------------------------------------------------------------------------
// General Types
// ------------------------------------------------------------------------------


type proposalIdType is nat
type proxyLambdaLedgerType is big_map(nat, bytes)

type setProxyLambdaType is [@layout:comb] record [
  id          : nat;
  func_bytes  : bytes;
]

// ------------------------------------------------------------------------------
// Execute Action Types
// ------------------------------------------------------------------------------


type setContractAdminType is [@layout:comb] record [
  targetContractAddress  : address;
  newAdminAddress        : address; 
]

type setContractGovernanceType is [@layout:comb] record [
  targetContractAddress  : address;
  newGovernanceAddress   : address; 
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

type targetFarmUpdateConfigParamsType is [@layout:comb] record [
  targetFarmAddress         : address;
  farmConfig                : farmUpdateConfigParamsType;
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

type executeActionParamsType is 

  UpdateProxyLambda                  of setProxyLambdaType
| SetContractAdmin                   of setContractAdminType
| SetContractGovernance              of setContractGovernanceType
| SetContractLambda                  of setContractLambdaType
| SetFactoryProductLambda            of setContractLambdaType
| UpdateContractMetadata             of updateContractMetadataType
| UpdateContractWhitelistMap         of updateContractWhitelistMapType
| UpdateContractGeneralMap           of updateContractGeneralMapType
| UpdateContractWhitelistTokenMap    of updateContractWhitelistTokenMapType

| UpdateGovernanceConfig             of governanceUpdateConfigParamsType
| UpdateGovernanceFinancialConfig    of governanceFinancialUpdateConfigParamsType
| UpdateDelegationConfig             of delegationUpdateConfigParamsType
| UpdateEmergencyConfig              of emergencyUpdateConfigParamsType
| UpdateBreakGlassConfig             of breakGlassUpdateConfigParamsType
| UpdateCouncilConfig                of councilUpdateConfigParamsType
| UpdateFarmConfig                   of targetFarmUpdateConfigParamsType
| UpdateDoormanMinMvkAmount          of (nat)

| UpdateWhitelistDevelopersSet       of (address)
| SetGovernanceProxy                 of (address)

| CreateFarm                         of createFarmType
| TrackFarm                          of (address)
| UntrackFarm                        of (address)
| InitFarm                           of (targetFarmInitType)
| CloseFarm                          of (address)

| CreateTreasury                     of bytes
| TrackTreasury                      of (address)
| UntrackTreasury                    of (address)
| TransferTreasury                   of targetTreasuryTransferType
| MintMvkAndTransferTreasury         of targetTreasuryMintMvkAndTransferType

| UpdateMvkInflationRate             of (nat)
| TriggerMvkInflation                of unit

| AddVestee                          of addVesteeType
| RemoveVestee                       of (address)
| UpdateVestee                       of updateVesteeType
| ToggleVesteeLock                   of (address)

type executeActionType is (executeActionParamsType)


// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type governanceProxyStorage is record [
    admin                       : address;
    governanceAddress           : address;    // separate admin from governance address in event of break glass
    metadata                    : metadata;

    mvkTokenAddress             : address;
    whitelistContracts          : whitelistContractsType;      
    generalContracts            : generalContractsType; 
    whitelistTokenContracts     : whitelistTokenContractsType;      

    proxyLambdaLedger           : proxyLambdaLedgerType;
]