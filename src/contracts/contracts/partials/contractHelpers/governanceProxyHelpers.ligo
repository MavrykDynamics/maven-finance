
// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders : Admin, Governance Satellite Contract
function verifySenderIsAdminOrGovernanceSatelliteContract(var s : governanceProxyStorageType) : unit is
block{

    const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[s.admin; governanceSatelliteAddress], error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED)

} with unit
    
// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Functions Begin
// ------------------------------------------------------------------------------

// governance proxy lamba helper function to get %setAdmin entrypoint
function getSetAdminEntrypoint(const contractAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%setAdmin",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_ADMIN_ENTRYPOINT_NOT_FOUND) : contract(address))
        ];


// governance proxy lamba helper function to get %setGovernance entrypoint
function getSetGovernanceEntrypoint(const contractAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%setGovernance",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_GOVERNANCE_ENTRYPOINT_NOT_FOUND) : contract(address))
        ];



// governance proxy lamba helper function to get %setLambda entrypoint
function getSetLambdaEntrypoint(const contractAddress : address) : contract(setLambdaType) is
    case (Tezos.get_entrypoint_opt(
        "%setLambda",
        contractAddress) : option(contract(setLambdaType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_LAMBDA_ENTRYPOINT_NOT_FOUND) : contract(setLambdaType))
        ];



// governance proxy lamba helper function to get %setProductLambda entrypoint
function getSetProductLambdaEntrypoint(const contractAddress : address) : contract(setLambdaType) is
    case (Tezos.get_entrypoint_opt(
        "%setProductLambda",
        contractAddress) : option(contract(setLambdaType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_PRODUCT_LAMBDA_ENTRYPOINT_NOT_FOUND) : contract(setLambdaType))
        ];



// governance proxy lamba helper function to get %updateMetadata entrypoint
function getUpdateMetadataEntrypoint(const contractAddress : address) : contract(updateMetadataType) is
    case (Tezos.get_entrypoint_opt(
        "%updateMetadata",
        contractAddress) : option(contract(updateMetadataType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_METADATA_ENTRYPOINT_NOT_FOUND) : contract(updateMetadataType))
        ];



// governance proxy lamba helper function to get %updateWhitelistContracts entrypoint
function getUpdateWhitelistContractsEntrypoint(const contractAddress : address) : contract(updateWhitelistContractsType) is
    case (Tezos.get_entrypoint_opt(
        "%updateWhitelistContracts",
        contractAddress) : option(contract(updateWhitelistContractsType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_NOT_FOUND) : contract(updateWhitelistContractsType))
        ];



// governance proxy lamba helper function to get %updateWhitelistTokenContracts entrypoint
function getUpdateWhitelistTokenContractsEntrypoint(const contractAddress : address) : contract(updateWhitelistTokenContractsType) is
    case (Tezos.get_entrypoint_opt(
        "%updateWhitelistTokenContracts",
        contractAddress) : option(contract(updateWhitelistTokenContractsType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_NOT_FOUND) : contract(updateWhitelistTokenContractsType))
        ];



// governance proxy lamba helper function to get %updateWhitelistDevelopers entrypoint
function getUpdateWhitelistDevelopersEntrypoint(const contractAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%updateWhitelistTokenContracts",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_WHITELIST_DEVELOPERS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(address))
        ];



// governance proxy lamba helper function to get %setContractName entrypoint
function getSetContractNameEntrypoint(const contractAddress : address) : contract(string) is
    case (Tezos.get_entrypoint_opt(
        "%setName",
        contractAddress) : option(contract(string))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_NAME_ENTRYPOINT_NOT_FOUND) : contract(string))
        ];



// governance proxy lamba helper function to get %pauseAll entrypoint
function getPauseAllEntrypoint(const contractAddress : address) : contract(unit) is
    case (Tezos.get_entrypoint_opt(
        "%pauseAll",
        contractAddress) : option(contract(unit))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_PAUSE_ALL_ENTRYPOINT_NOT_FOUND) : contract(unit))
        ];



// governance proxy lamba helper function to get %unpauseAll entrypoint
function getUnpauseAllEntrypoint(const contractAddress : address) : contract(unit) is
    case (Tezos.get_entrypoint_opt(
        "%unpauseAll",
        contractAddress) : option(contract(unit))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UNPAUSE_ALL_ENTRYPOINT_NOT_FOUND) : contract(unit))
        ];


// ------------------------------------------------------------------------------
// Entrypoint Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Update Config Helper Functions Begin
// ------------------------------------------------------------------------------

function updateGovernanceConfig(const updateConfigParams : governanceUpdateConfigParamsType; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get updateConfig entrypoint of governance contract
    const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
        "%updateConfig",
        s.governanceAddress) : option(contract(nat * governanceUpdateConfigActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(nat * governanceUpdateConfigActionType))
        ];

    // assign params to constants for better code readability
    const updateConfigAction   = updateConfigParams.updateConfigAction;
    const updateConfigNewValue = updateConfigParams.updateConfigNewValue;

    // Create operation to update governance config
    const updateGovernanceConfigOperation : operation = Tezos.transaction(
        (updateConfigNewValue, updateConfigAction),
        0tez, 
        updateConfigEntrypoint
    );

    operations := updateGovernanceConfigOperation # operations;

} with (operations)



function updateGovernanceFinancialConfig(const updateConfigParams : governanceFinancialUpdateConfigParamsType; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get governanceFinancial contract address from the generalContracts big map
    const governanceFinancialAddress : address = getContractAddressFromGovernanceContract("governanceFinancial", s.governanceAddress, error_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND);

    // Find and get updateConfig entrypoint of governance financial contract
    const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
        "%updateConfig",
        governanceFinancialAddress) : option(contract(nat * governanceFinancialUpdateConfigActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND) : contract(nat * governanceFinancialUpdateConfigActionType))
        ];

    // assign params to constants for better code readability
    const updateConfigAction   = updateConfigParams.updateConfigAction;
    const updateConfigNewValue = updateConfigParams.updateConfigNewValue;

    // Create operation to update governance financial config
    const updateGovernanceFinancialConfigOperation : operation = Tezos.transaction(
        (updateConfigNewValue, updateConfigAction),
        0tez, 
        updateConfigEntrypoint
    );

    operations := updateGovernanceFinancialConfigOperation # operations;

} with (operations)



function updateGovernanceSatelliteConfig(const updateConfigParams : governanceSatelliteUpdateConfigParamsType; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get governanceSatellite contract address from the generalContracts big map
    const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);

    // Find and get updateConfig entrypoint of governance satellite contract
    const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
        "%updateConfig",
        governanceSatelliteAddress) : option(contract(nat * governanceSatelliteUpdateConfigActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND) : contract(nat * governanceSatelliteUpdateConfigActionType))
        ];

    // assign params to constants for better code readability
    const updateConfigAction   = updateConfigParams.updateConfigAction;
    const updateConfigNewValue = updateConfigParams.updateConfigNewValue;

    // Create operation to update governance satellite config
    const updateGovernanceSatelliteConfigOperation : operation = Tezos.transaction(
        (updateConfigNewValue, updateConfigAction),
        0tez, 
        updateConfigEntrypoint
    );

    operations := updateGovernanceSatelliteConfigOperation # operations;


} with (operations)



function updateDelegationConfig(const updateConfigParams : delegationUpdateConfigParamsType; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {
    
    // Find and get delegation contract address from the generalContracts big map
    const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    // Find and get updateConfig entrypoint of delegation contract
    const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
        "%updateConfig",
        delegationAddress) : option(contract(nat * delegationUpdateConfigActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(nat * delegationUpdateConfigActionType))
        ];

    // assign params to constants for better code readability
    const updateConfigAction   = updateConfigParams.updateConfigAction;
    const updateConfigNewValue = updateConfigParams.updateConfigNewValue;

    // Create operation to update delegation config
    const updateDelegationConfigOperation : operation = Tezos.transaction(
        (updateConfigNewValue, updateConfigAction),
        0tez, 
        updateConfigEntrypoint
    );

    operations := updateDelegationConfigOperation # operations;

} with (operations)



function updateEmergencyConfig(const updateConfigParams : emergencyUpdateConfigParamsType; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {
    
    // Find and get emergency governance contract address from the generalContracts big map
    const emergencyAddress : address = getContractAddressFromGovernanceContract("emergencyGovernance", s.governanceAddress, error_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND);

    // Find and get updateConfig entrypoint of emergency governance contract
    const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
        "%updateConfig",
        emergencyAddress) : option(contract(nat * emergencyUpdateConfigActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(nat * emergencyUpdateConfigActionType))
        ];

    // assign params to constants for better code readability
    const updateConfigAction   = updateConfigParams.updateConfigAction;
    const updateConfigNewValue = updateConfigParams.updateConfigNewValue;

    // Create operation to update emergency governance contract config
    const updateEmergencyConfigOperation : operation = Tezos.transaction(
        (updateConfigNewValue, updateConfigAction),
        0tez, 
        updateConfigEntrypoint
    );

    operations := updateEmergencyConfigOperation # operations;

} with (operations)



function updateCouncilConfig(const updateConfigParams : councilUpdateConfigParamsType; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {
    
    // Find and get council contract address from the generalContracts big map
    const councilAddress : address = getContractAddressFromGovernanceContract("council", s.governanceAddress, error_COUNCIL_CONTRACT_NOT_FOUND);

    // Find and get updateConfig entrypoint of council contract
    const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
        "%updateConfig",
        councilAddress) : option(contract(nat * councilUpdateConfigActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND) : contract(nat * councilUpdateConfigActionType))
        ];

    // assign params to constants for better code readability
    const updateConfigAction   = updateConfigParams.updateConfigAction;
    const updateConfigNewValue = updateConfigParams.updateConfigNewValue;

    // Create operation to update council contract config
    const updateCouncilConfigOperation : operation = Tezos.transaction(
        (updateConfigNewValue, updateConfigAction),
        0tez, 
        updateConfigEntrypoint
    );

    operations := updateCouncilConfigOperation # operations;

} with (operations)



function updateFarmConfig(const updateConfigParams : targetFarmUpdateConfigParamsType; var operations : list(operation)) : list(operation) is 
block {

    // assign params to constants for better code readability
    const farmAddress           = updateConfigParams.targetFarmAddress;
    const updateConfigAction    = updateConfigParams.farmConfig.updateConfigAction;
    const updateConfigNewValue  = updateConfigParams.farmConfig.updateConfigNewValue;

    // Find and get updateConfig entrypoint of farm contract
    const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
        "%updateConfig",
        farmAddress) : option(contract(nat * farmUpdateConfigActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND) : contract(nat * farmUpdateConfigActionType))
        ];

    // Create operation to update farm contract config
    const updateFarmConfigOperation : operation = Tezos.transaction(
        (updateConfigNewValue, updateConfigAction),
        0tez, 
        updateConfigEntrypoint
    );

    operations := updateFarmConfigOperation # operations;

} with (operations)



function updateFarmFactoryConfig(const updateConfigParams : farmFactoryUpdateConfigParamsType; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {
    
    // Find and get farm factory contract address from the generalContracts big map
    const farmFactoryAddress : address = getContractAddressFromGovernanceContract("farmFactory", s.governanceAddress, error_FARM_FACTORY_CONTRACT_NOT_FOUND);

    // assign params to constants for better code readability
    const updateConfigAction    = updateConfigParams.updateConfigAction;
    const updateConfigNewValue  = updateConfigParams.updateConfigNewValue;

    // Find and get updateConfig entrypoint of farm factory contract
    const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
        "%updateConfig",
        farmFactoryAddress) : option(contract(nat * farmFactoryUpdateConfigActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND) : contract(nat * farmFactoryUpdateConfigActionType))
        ];

    // Create operation to update farm factory contract config
    const updateFarmFactoryConfigOperation : operation = Tezos.transaction(
        (updateConfigNewValue, updateConfigAction),
        0tez, 
        updateConfigEntrypoint
    );

    operations := updateFarmFactoryConfigOperation # operations;

} with (operations)



function updateAggregatorConfig(const updateConfigParams : targetAggregatorUpdateConfigParamsType; var operations : list(operation)) : list(operation) is 
block {

    // assign params to constants for better code readability
    const aggregatorAddress     = updateConfigParams.targetAggregatorAddress;
    const updateConfigAction    = updateConfigParams.aggregatorConfig.updateConfigAction;
    const updateConfigNewValue  = updateConfigParams.aggregatorConfig.updateConfigNewValue;

    // Find and get updateConfig entrypoint of aggregator contract
    const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
        "%updateConfig",
        aggregatorAddress) : option(contract(nat * aggregatorUpdateConfigActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND) : contract(nat * aggregatorUpdateConfigActionType))
        ];

    // Create operation to update aggregator contract config
    const updateAggregatorConfigOperation : operation = Tezos.transaction(
        (updateConfigNewValue, updateConfigAction),
        0tez, 
        updateConfigEntrypoint
    );

    operations := updateAggregatorConfigOperation # operations;

} with (operations)



function updateAggregatorFactoryConfig(const updateConfigParams : aggregatorFactoryUpdateConfigParamsType; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get aggregator factory contract address from the generalContracts big map
    const aggregatorFactoryAddress : address = getContractAddressFromGovernanceContract("aggregatorFactory", s.governanceAddress, error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND);

    // assign params to constants for better code readability
    const updateConfigAction    = updateConfigParams.updateConfigAction;
    const updateConfigNewValue  = updateConfigParams.updateConfigNewValue;

    // Find and get updateConfig entrypoint of aggregator factory contract
    const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
        "%updateConfig",
        aggregatorFactoryAddress) : option(contract(nat * aggregatorFactoryUpdateConfigActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND) : contract(nat * aggregatorFactoryUpdateConfigActionType))
        ];

    // Create operation to update aggregator factory contract config
    const updateAggregatorFactoryConfigOperation : operation = Tezos.transaction(
        (updateConfigNewValue, updateConfigAction),
        0tez, 
        updateConfigEntrypoint
    );

    operations := updateAggregatorFactoryConfigOperation # operations;

} with (operations)



function updateTreasuryFactoryConfig(const updateConfigParams : treasuryFactoryUpdateConfigParamsType; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get treasury factory contract address from the generalContracts big map
    const treasuryFactoryAddress : address = getContractAddressFromGovernanceContract("treasuryFactory", s.governanceAddress, error_TREASURY_FACTORY_CONTRACT_NOT_FOUND);

    // assign params to constants for better code readability
    const updateConfigAction    = updateConfigParams.updateConfigAction;
    const updateConfigNewValue  = updateConfigParams.updateConfigNewValue;

    // Find and get updateConfig entrypoint of treasury factory contract
    const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
        "%updateConfig",
        treasuryFactoryAddress) : option(contract(nat * treasuryFactoryUpdateConfigActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND) : contract(nat * treasuryFactoryUpdateConfigActionType))
        ];

    // Create operation to update treasury factory contract config
    const updateTreasuryFactoryConfigOperation : operation = Tezos.transaction(
        (updateConfigNewValue, updateConfigAction),
        0tez, 
        updateConfigEntrypoint
    );

    operations := updateTreasuryFactoryConfigOperation # operations;

} with (operations)



function updateBreakGlassConfig(const updateConfigParams : breakGlassUpdateConfigParamsType; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get break glass contract address from the generalContracts big map
    const breakGlassAddress : address = getContractAddressFromGovernanceContract("breakGlass", s.governanceAddress, error_BREAK_GLASS_CONTRACT_NOT_FOUND);

    // Find and get updateConfig entrypoint of break glass contract
    const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
        "%updateConfig",
        breakGlassAddress) : option(contract(nat * breakGlassUpdateConfigActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND) : contract(nat * breakGlassUpdateConfigActionType))
        ];

    // assign params to constants for better code readability
    const updateConfigAction   = updateConfigParams.updateConfigAction;
    const updateConfigNewValue = updateConfigParams.updateConfigNewValue;

    // Create operation to update break glass contract config
    const updateBreakGlassConfigOperation : operation = Tezos.transaction(
        (updateConfigNewValue, updateConfigAction),
        0tez, 
        updateConfigEntrypoint
    );

    operations := updateBreakGlassConfigOperation # operations;

} with (operations)



function updateDoormanConfig(const updateConfigParams : doormanUpdateConfigParamsType; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get doorman contract address from the generalContracts big map
    const doormanAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    // Find and get updateConfig entrypoint of break glass contract
    const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
        "%updateConfig",
        doormanAddress) : option(contract(nat * doormanUpdateConfigActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND) : contract(nat * doormanUpdateConfigActionType))
        ];

    // assign params to constants for better code readability
    const updateConfigAction   = updateConfigParams.updateConfigAction;
    const updateConfigNewValue = updateConfigParams.updateConfigNewValue;

    // Create operation to update doorman contract config
    const updateDoormanConfigOperation : operation = Tezos.transaction(
        (updateConfigNewValue, updateConfigAction),
        0tez, 
        updateConfigEntrypoint
    );

    operations := updateDoormanConfigOperation # operations;

} with (operations)

// ------------------------------------------------------------------------------
// Update Config Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Toggle Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

function toggleAggregatorEntrypoint(const toggleEntrypointParams : toggleAggregatorEntrypointType; var operations : list(operation)) : list(operation) is 
block {

    // assign params to constants for better code readability
    const aggregatorAddress     = toggleEntrypointParams.targetAggregatorAddress;
    const targetEntrypoint      = toggleEntrypointParams.targetEntrypoint;

    // Find and get togglePauseEntrypoint entrypoint
    const togglePauseEntrypoint = case (Tezos.get_entrypoint_opt(
        "%togglePauseEntrypoint",
        aggregatorAddress) : option(contract(aggregatorTogglePauseEntrypointType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_AGGREGATOR_CONTRACT_NOT_FOUND) : contract(aggregatorTogglePauseEntrypointType))
        ];

    // Create operation to pause an entrypoint in a specified aggregator contract
    const togglePauseEntrypointOperation : operation = Tezos.transaction(
        targetEntrypoint,
        0tez, 
        togglePauseEntrypoint
    );

    operations := togglePauseEntrypointOperation # operations;

} with (operations)



function toggleAggregatorFacEntrypoint(const toggleEntrypointParams : toggleAggregatorFacEntrypointType; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get the aggregator factory contract address from the generalContracts big map
    const aggregatorFactoryAddress : address = getContractAddressFromGovernanceContract("aggregatorFactory", s.governanceAddress, error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND);

    // Find and get togglePauseEntrypoint entrypoint
    const togglePauseEntrypoint = case (Tezos.get_entrypoint_opt(
        "%togglePauseEntrypoint",
        aggregatorFactoryAddress) : option(contract(aggregatorFactoryTogglePauseEntrypointType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND) : contract(aggregatorFactoryTogglePauseEntrypointType))
        ];

    // Create operation to pause an entrypoint in the specified aggregator factory contract
    const togglePauseEntrypointOperation : operation = Tezos.transaction(
        toggleEntrypointParams.targetEntrypoint,
        0tez, 
        togglePauseEntrypoint
    );

    operations := togglePauseEntrypointOperation # operations;

} with (operations)



function toggleDelegationEntrypoint(const toggleEntrypointParams : toggleDelegationEntrypointType; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get the delegation contract address from the generalContracts big map
    const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    // Find and get togglePauseEntrypoint entrypoint
    const togglePauseEntrypoint = case (Tezos.get_entrypoint_opt(
        "%togglePauseEntrypoint",
        delegationAddress) : option(contract(delegationTogglePauseEntrypointType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(delegationTogglePauseEntrypointType))
        ];

    // Create operation to pause an entrypoint in the Delegation contract
    const togglePauseEntrypointOperation : operation = Tezos.transaction(
        toggleEntrypointParams.targetEntrypoint,
        0tez, 
        togglePauseEntrypoint
    );

    operations := togglePauseEntrypointOperation # operations;

} with (operations)



function toggleDoormanEntrypoint(const toggleEntrypointParams : toggleDoormanEntrypointType; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get the contract address from the generalContracts big map
    const doormanAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    // Find and get togglePauseEntrypoint entrypoint
    const togglePauseEntrypoint = case (Tezos.get_entrypoint_opt(
        "%togglePauseEntrypoint",
        doormanAddress) : option(contract(doormanTogglePauseEntrypointType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND) : contract(doormanTogglePauseEntrypointType))
        ];

    // Create operation to pause an entrypoint in the Doorman contract
    const togglePauseEntrypointOperation : operation = Tezos.transaction(
        toggleEntrypointParams.targetEntrypoint,
        0tez, 
        togglePauseEntrypoint
    );

    operations := togglePauseEntrypointOperation # operations;

} with (operations)



function toggleFarmEntrypoint(const toggleEntrypointParams : toggleFarmEntrypointType; var operations : list(operation)) : list(operation) is 
block {

    // assign params to constants for better code readability
    const farmAddress           = toggleEntrypointParams.targetFarmAddress;
    const targetEntrypoint      = toggleEntrypointParams.targetEntrypoint;

    // Find and get togglePauseEntrypoint entrypoint
    const togglePauseEntrypoint = case (Tezos.get_entrypoint_opt(
        "%togglePauseEntrypoint",
        farmAddress) : option(contract(farmTogglePauseEntrypointType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND) : contract(farmTogglePauseEntrypointType))
        ];

    // Create operation to pause an entrypoint in the Farm contract
    const togglePauseEntrypointOperation : operation = Tezos.transaction(
        targetEntrypoint,
        0tez, 
        togglePauseEntrypoint
    );

    operations := togglePauseEntrypointOperation # operations;

} with (operations)



function toggleFarmFacEntrypoint(const toggleEntrypointParams : toggleFarmFacEntrypointType; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get the contract address from the generalContracts big map
    const farmFactoryAddress : address = getContractAddressFromGovernanceContract("farmFactory", s.governanceAddress, error_FARM_FACTORY_CONTRACT_NOT_FOUND);

    // Find and get togglePauseEntrypoint entrypoint
    const togglePauseEntrypoint = case (Tezos.get_entrypoint_opt(
        "%togglePauseEntrypoint",
        farmFactoryAddress) : option(contract(farmFactoryTogglePauseEntrypointType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND) : contract(farmFactoryTogglePauseEntrypointType))
        ];

    // Create operation to pause an entrypoint in the Farm Factory contract
    const togglePauseEntrypointOperation : operation = Tezos.transaction(
        toggleEntrypointParams.targetEntrypoint,
        0tez, 
        togglePauseEntrypoint
    );

    operations := togglePauseEntrypointOperation # operations;

} with (operations)



function toggleTreasuryEntrypoint(const toggleEntrypointParams : toggleTreasuryEntrypointType; var operations : list(operation)) : list(operation) is 
block {

    // assign params to constants for better code readability
    const treasuryAddress       = toggleEntrypointParams.targetTreasuryAddress;
    const targetEntrypoint      = toggleEntrypointParams.targetEntrypoint;

    // Find and get togglePauseEntrypoint entrypoint
    const togglePauseEntrypoint = case (Tezos.get_entrypoint_opt(
        "%togglePauseEntrypoint",
        treasuryAddress) : option(contract(treasuryTogglePauseEntrypointType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(treasuryTogglePauseEntrypointType))
        ];

    // Create operation to pause an entrypoint in a specified Treasury contract
    const togglePauseEntrypointOperation : operation = Tezos.transaction(
        targetEntrypoint,
        0tez, 
        togglePauseEntrypoint
    );

    operations := togglePauseEntrypointOperation # operations;

} with (operations)



function toggleTreasuryFacEntrypoint(const toggleEntrypointParams : toggleTreasuryFacEntrypointType; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get the contract address from the generalContracts big map
    const treasuryFactoryAddress : address = getContractAddressFromGovernanceContract("treasuryFactory", s.governanceAddress, error_TREASURY_FACTORY_CONTRACT_NOT_FOUND);

    // Find and get togglePauseEntrypoint entrypoint
    const togglePauseEntrypoint = case (Tezos.get_entrypoint_opt(
        "%togglePauseEntrypoint",
        treasuryFactoryAddress) : option(contract(treasuryFactoryTogglePauseEntrypointType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND) : contract(treasuryFactoryTogglePauseEntrypointType))
        ];

    // Create operation to pause an entrypoint in the Treasury Factory contract
    const togglePauseEntrypointOperation : operation = Tezos.transaction(
        toggleEntrypointParams.targetEntrypoint,
        0tez, 
        togglePauseEntrypoint
    );

    operations := togglePauseEntrypointOperation # operations;

} with (operations)

// ------------------------------------------------------------------------------
// Toggle Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const governanceProxyLambdaAction : governanceProxyLambdaActionType; var s : governanceProxyStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(governanceProxyUnpackLambdaFunctionType)) of [
            Some(f) -> f(governanceProxyLambdaAction, s)
        |   None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Lambda Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Helper Functions End
//
// ------------------------------------------------------------------------------