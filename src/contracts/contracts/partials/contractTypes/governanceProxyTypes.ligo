
// ------------------------------------------------------------------------------
// General Types
// ------------------------------------------------------------------------------

type proxyLambdaLedgerType is big_map(nat, bytes)

type setProxyLambdaType is [@layout:comb] record [
  id          : nat;
  func_bytes  : bytes;
]

// ------------------------------------------------------------------------------
// Execute Action Types
// ------------------------------------------------------------------------------

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

type setAggregatorMaintainerType is [@layout:comb] record [
    aggregatorAddress           : address;
    maintainerAddress           : address;
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

type toggleFarmEntrypointType is [@layout:comb] record [
  targetFarmAddress         : address;
  targetEntrypoint          : farmTogglePauseEntrypointType;
]

type toggleTreasuryEntrypointType is [@layout:comb] record [
  targetTreasuryAddress     : address;
  targetEntrypoint          : treasuryTogglePauseEntrypointType;
]

type executeActionParamsType is 

  UpdateProxyLambda                  of setProxyLambdaType
| SetContractAdmin                   of setContractAdminType
| SetContractGovernance              of setContractGovernanceType
| SetContractName                    of setContractNameType
| SetContractLambda                  of setContractLambdaType
| SetFactoryProductLambda            of setContractLambdaType
| UpdateContractMetadata             of updateContractMetadataType
| UpdateContractWhitelistMap         of updateContractWhitelistMapType
| UpdateContractGeneralMap           of updateContractGeneralMapType
| UpdateContractWhitelistTokenMap    of updateContractWhitelistTokenMapType

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

| ToggleAggregatorEntrypoint         of toggleAggregatorEntrypointType
| ToggleAggregatorFacEntrypoint      of aggregatorFactoryTogglePauseEntrypointType
| ToggleDelegationEntrypoint         of delegationTogglePauseEntrypointType
| ToggleDoormanEntrypoint            of doormanTogglePauseEntrypointType
| ToggleFarmEntrypoint               of toggleFarmEntrypointType
| ToggleFarmFacEntrypoint            of farmFactoryTogglePauseEntrypointType
| ToggleTreasuryEntrypoint           of toggleTreasuryEntrypointType
| ToggleTreasuryFacEntrypoint        of treasuryFactoryTogglePauseEntrypointType

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
| SetAggregatorMaintainer            of setAggregatorMaintainerType

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
| LambdaUpdateWhitelistContracts        of updateWhitelistContractsType
| LambdaUpdateWhitelistTokens           of updateWhitelistTokenContractsType
| LambdaUpdateGeneralContracts          of updateGeneralContractsType
| LambdaMistakenTransfer                of transferActionType

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

    // lambda storage
    lambdaLedger                : lambdaLedgerType;             // governance proxy contract lambdas
]