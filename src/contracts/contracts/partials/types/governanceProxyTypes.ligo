
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

type updateContractNameType is [@layout:comb] record [
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
  treasuryUpdatedOperators  : updateOperatorsParams;
]

type stakeTreasuryType is [@layout:comb] record [
  targetTreasuryAddress     : address;
  stakeAmount               : nat;
]

type unstakeTreasuryType is [@layout:comb] record [
  targetTreasuryAddress     : address;
  unstakeAmount             : nat;
]

// type pauseEntrypointType is 
//   | LambdaTogglePauseStake

// type pauseSingleEntrypointInContractType is [@layout:comb] record [
//   contract                  : address;
//   entrypoint                : pauseEntrypointType;
// ]


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
| UpdateContractName                 of updateContractNameType

| UpdateGovernanceConfig             of governanceUpdateConfigParamsType
| UpdateGovernanceFinancialConfig    of governanceFinancialUpdateConfigParamsType
| UpdateGovernanceSatelliteConfig    of governanceSatelliteUpdateConfigParamsType
| UpdateDelegationConfig             of delegationUpdateConfigParamsType
| UpdateEmergencyConfig              of emergencyUpdateConfigParamsType
| UpdateBreakGlassConfig             of breakGlassUpdateConfigParamsType
| UpdateCouncilConfig                of councilUpdateConfigParamsType
| UpdateFarmConfig                   of targetFarmUpdateConfigParamsType
| UpdateFarmFactoryConfig            of farmFactoryUpdateConfigParamsType
| UpdateAggregatorConfig             of targetAggregatorUpdateConfigParamsType
| UpdateAggregatorFactoryConfig      of aggregatorFactoryUpdateConfigParamsType
| UpdateTreasuryFactoryConfig        of treasuryFactoryUpdateConfigParamsType
| UpdateDoormanConfig                of doormanUpdateConfigParamsType

// | PauseAllInContract                 of (address)
// | UnpauseAllInContract               of (address)
// | PauseSingleEntrypointInContract    of pauseSingleEntrypointInContractType

| UpdateWhitelistDevelopersSet       of (address)
| SetGovernanceProxy                 of (address)

| CreateFarm                         of createFarmType
| TrackFarm                          of (address)
| UntrackFarm                        of (address)
| InitFarm                           of (targetFarmInitType)
| CloseFarm                          of (address)

| CreateTreasury                     of createTreasuryType
| TrackTreasury                      of (address)
| UntrackTreasury                    of (address)
| TransferTreasury                   of targetTreasuryTransferType
| MintMvkAndTransferTreasury         of targetTreasuryMintMvkAndTransferType
| UpdateMvkOperatorsTreasury         of updateOperatorsTreasuryType
| StakeMvkTreasury                   of stakeTreasuryType
| UnstakeMvkTreasury                 of unstakeTreasuryType

| CreateAggregator                   of createAggregatorParamsType
| TrackAggregator                    of trackAggregatorParamsType
| UntrackAggregator                  of untrackAggregatorParamsType
| SetAggregatorMaintainer            of setAggregatorMaintainerActionType

| UpdateMvkInflationRate             of (nat)
| TriggerMvkInflation                of unit

| AddVestee                          of addVesteeType
| RemoveVestee                       of (address)
| UpdateVestee                       of updateVesteeType
| ToggleVesteeLock                   of (address)

type executeActionType is (executeActionParamsType)


type governanceProxyLambdaActionType is 

  // Housekeeping Lambdas
  LambdaSetAdmin                        of address
| LambdaSetGovernance                   of (address)
| LambdaUpdateMetadata                  of updateMetadataType
| LambdaUpdateWhitelistContracts        of updateWhitelistContractsParams
| LambdaUpdateWhitelistTokens           of updateWhitelistTokenContractsParams
| LambdaUpdateGeneralContracts          of updateGeneralContractsParams
| LambdaMistakenTransfer                of transferActionType

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type governanceProxyStorage is record [
    admin                       : address;
    metadata                    : metadata;

    mvkTokenAddress             : address;
    governanceAddress           : address;    // separate admin from governance address in event of break glass
    
    whitelistContracts          : whitelistContractsType;      
    generalContracts            : generalContractsType; 
    whitelistTokenContracts     : whitelistTokenContractsType;      

    proxyLambdaLedger           : proxyLambdaLedgerType;

    // lambda storage
    lambdaLedger                : lambdaLedgerType;             // governance proxy contract lambdas
]