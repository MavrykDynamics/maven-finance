
// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders : Admin, Governance Satellite Contract
function verifySenderIsAdminOrGovernanceSatelliteContract(const s : governanceProxyStorageType) : unit is
block {

    const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[s.admin; governanceSatelliteAddress], error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED)

} with unit



// Allowed Senders : Self, Admin, Governance Contract
function verifySenderIsSelfOrAdminOrGovernance(const s : governanceProxyStorageType) : unit is
block {

    const allowedSet : set(address) = set[s.admin; s.governanceAddress; Tezos.get_self_address()];
    verifySenderIsAllowed(allowedSet, error_ONLY_SELF_OR_ADMIN_OR_GOVERNANCE_ALLOWED);

} with unit
    
// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Functions Begin
// ------------------------------------------------------------------------------

// governance proxy lamba helper function to get %executeGovernanceAction entrypoint in Governance Proxy Node contract
function getExecuteGovernanceActionEntrypoint(const contractAddress : address) : contract(bytes) is
    case (Tezos.get_entrypoint_opt(
        "%executeGovernanceAction",
        contractAddress) : option(contract(bytes))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_EXECUTE_GOVERNANCE_ACTION_ENTRYPOINT_IN_GOVERNANCE_PROXY_NODE_CONTRACT_NOT_FOUND) : contract(bytes))
        ];



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
        "%updateWhitelistDevelopers",
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
// Operation Helpers Begin
// ------------------------------------------------------------------------------

// helper function to create execute governance action operation to the governance proxy node contract
function executeGovernanceActionOperation(const dataBytes : bytes; const governanceProxyNodeAddress : address) : operation is
block {

    const executeGovernanceActionOperation : operation = Tezos.transaction(
        dataBytes, 
        0tez, 
        getExecuteGovernanceActionEntrypoint(governanceProxyNodeAddress)
    );

} with executeGovernanceActionOperation

// ------------------------------------------------------------------------------
// Operation Helpers End
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



function toggleVaultFacEntrypoint(const toggleEntrypointParams : toggleVaultFacEntrypointType; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get the vault factory contract address from the generalContracts big map
    const vaultFactoryAddress : address = getContractAddressFromGovernanceContract("vaultFactory", s.governanceAddress, error_VAULT_FACTORY_CONTRACT_NOT_FOUND);

    // Find and get togglePauseEntrypoint entrypoint
    const togglePauseEntrypoint = case (Tezos.get_entrypoint_opt(
        "%togglePauseEntrypoint",
        vaultFactoryAddress) : option(contract(vaultFactoryTogglePauseEntrypointType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_VAULT_FACTORY_CONTRACT_NOT_FOUND) : contract(vaultFactoryTogglePauseEntrypointType))
        ];

    // Create operation to pause an entrypoint in the specified vault factory contract
    const togglePauseEntrypointOperation : operation = Tezos.transaction(
        toggleEntrypointParams.targetEntrypoint,
        0tez, 
        togglePauseEntrypoint
    );

    operations := togglePauseEntrypointOperation # operations;

} with (operations)



function toggleLendingContEntrypoint(const toggleEntrypointParams : toggleLendingContEntrypointType; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get the lending controller contract address from the generalContracts big map
    const lendingControllerAddress : address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

    // Find and get togglePauseEntrypoint entrypoint
    const togglePauseEntrypoint = case (Tezos.get_entrypoint_opt(
        "%togglePauseEntrypoint",
        lendingControllerAddress) : option(contract(lendingControllerTogglePauseEntrypointType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TOGGLE_PAUSE_ENTRYPOINT_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND) : contract(lendingControllerTogglePauseEntrypointType))
        ];

    // Create operation to pause an entrypoint in the specified lending controller contract
    const togglePauseEntrypointOperation : operation = Tezos.transaction(
        toggleEntrypointParams.targetEntrypoint,
        0tez, 
        togglePauseEntrypoint
    );

    operations := togglePauseEntrypointOperation # operations;

} with (operations)


// ------------------------------------------------------------------------------
// Toggle Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Track / Untrack Helper Functions Begin
// ------------------------------------------------------------------------------

function trackFarm(const trackFarmParams : address; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get farmFactory contract address from the generalContracts map
    const farmFactoryAddress : address = getContractAddressFromGovernanceContract("farmFactory", s.governanceAddress, error_FARM_FACTORY_CONTRACT_NOT_FOUND);

    // Find and get trackFarm entrypoint of farmFactory contract
    const trackFarmEntrypoint = case (Tezos.get_entrypoint_opt(
        "%trackFarm",
        farmFactoryAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND) : contract(address))
        ];

    // Create operation to track a farm
    const trackFarmOperation : operation = Tezos.transaction(
        (trackFarmParams),
        0tez, 
        trackFarmEntrypoint
    );

    operations := trackFarmOperation # operations;

} with (operations)



function untrackFarm(const untrackFarmParams : address; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get farmFactory contract address from the generalContracts map
    const farmFactoryAddress : address = getContractAddressFromGovernanceContract("farmFactory", s.governanceAddress, error_FARM_FACTORY_CONTRACT_NOT_FOUND);

    // Find and get untrack entrypoint of farmFactory contract
    const untrackFarmEntrypoint = case (Tezos.get_entrypoint_opt(
        "%untrackFarm",
        farmFactoryAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UNTRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND) : contract(address))
        ];

    // Create operation to untrack a farm
    const untrackFarmOperation : operation = Tezos.transaction(
        (untrackFarmParams),
        0tez, 
        untrackFarmEntrypoint
    );

    operations := untrackFarmOperation # operations;

} with (operations)



function trackTreasury(const trackTreasuryParams : address; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get treasuryFactory contract address from the generalContracts map
    const treasuryFactoryAddress : address = getContractAddressFromGovernanceContract("treasuryFactory", s.governanceAddress, error_TREASURY_FACTORY_CONTRACT_NOT_FOUND);

    // Find and get trackTreasury entrypoint of treasuryFactory contract
    const trackTreasuryEntrypoint = case (Tezos.get_entrypoint_opt(
        "%trackTreasury",
        treasuryFactoryAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND) : contract(address))
        ];

    // Create operation to track a treasury
    const trackTreasuryOperation : operation = Tezos.transaction(
        (trackTreasuryParams),
        0tez, 
        trackTreasuryEntrypoint
    );

    operations := trackTreasuryOperation # operations;

} with (operations)



function untrackTreasury(const untrackTreasuryParams : address; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get treasuryFactory contract address from the generalContracts map
    const treasuryFactoryAddress : address = getContractAddressFromGovernanceContract("treasuryFactory", s.governanceAddress, error_TREASURY_FACTORY_CONTRACT_NOT_FOUND);

    // Find and get untrackTreasury entrypoint of treasuryFactory contract
    const untrackTreasuryEntrypoint = case (Tezos.get_entrypoint_opt(
        "%untrackTreasury",
        treasuryFactoryAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UNTRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND) : contract(address))
        ];

    // Create operation to untrack a treasury
    const untrackTreasuryOperation : operation = Tezos.transaction(
        (untrackTreasuryParams),
        0tez, 
        untrackTreasuryEntrypoint
    );

    operations := untrackTreasuryOperation # operations;

} with (operations)



function trackAggregator(const trackAggregatorParams : address; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get aggregatorFactory contract address
    const aggregatorFactoryAddress : address = getContractAddressFromGovernanceContract("aggregatorFactory", s.governanceAddress, error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND);

    // Find and get trackAggregator entrypoint of aggregatorFactory contract
    const trackAggregatorEntrypoint = case (Tezos.get_entrypoint_opt(
        "%trackAggregator",
        aggregatorFactoryAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND) : contract(address))
        ];

    // Create operation to track aggregator
    const trackAggregatorOperation : operation = Tezos.transaction(
        (trackAggregatorParams),
        0tez, 
        trackAggregatorEntrypoint
    );

    operations := trackAggregatorOperation # operations;

} with (operations)



function untrackAggregator(const untrackAggregatorParams : address; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get aggregatorFactory contract address
    const aggregatorFactoryAddress : address = getContractAddressFromGovernanceContract("aggregatorFactory", s.governanceAddress, error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND);

    // Find and get trackAggregator entrypoint of aggregatorFactory contract
    const untrackAggregatorEntrypoint = case (Tezos.get_entrypoint_opt(
        "%untrackAggregator",
        aggregatorFactoryAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UNTRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND) : contract(address))
        ];

    // Create operation to untrack aggregator
    const untrackAggregatorOperation : operation = Tezos.transaction(
        (untrackAggregatorParams),
        0tez, 
        untrackAggregatorEntrypoint
    );

    operations := untrackAggregatorOperation # operations;
    
} with (operations)

// ------------------------------------------------------------------------------
// Track / Untrack Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vestee Helper Functions Begin
// ------------------------------------------------------------------------------

function addVestee(const addVesteeParams : addVesteeType; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get vesting contract address from the generalContracts map
    const vestingAddress : address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

    // Find and get addVestee entrypoint of Vesting contract
    const addVesteeEntrypoint = case (Tezos.get_entrypoint_opt(
        "%addVestee",
        vestingAddress) : option(contract(addVesteeType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_ADD_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(addVesteeType))
        ];

    // Create operation to add a new vestee
    const addVesteeOperation : operation = Tezos.transaction(
        (addVesteeParams),
        0tez, 
        addVesteeEntrypoint
    );

    operations := addVesteeOperation # operations;

} with (operations)



function removeVestee(const vesteeAddress : address; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get vesting contract address from the generalContracts map
    const vestingAddress : address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

    // Find and get removeVestee entrypoint of Vesting contract
    const removeVesteeEntrypoint = case (Tezos.get_entrypoint_opt(
        "%removeVestee",
        vestingAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_REMOVE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(address))
        ];

    // Create operation to remove a vestee
    const removeVesteeOperation : operation = Tezos.transaction(
        (vesteeAddress),
        0tez, 
        removeVesteeEntrypoint
    );

    operations := removeVesteeOperation # operations;
    
} with (operations)



function updateVestee(const updateVesteeParams : updateVesteeType; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get vesting contract address from the generalContracts map
    const vestingAddress : address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

    // Find and get removeVestee entrypoint of Vesting contract
    const updateVesteeEntrypoint = case (Tezos.get_entrypoint_opt(
        "%updateVestee",
        vestingAddress) : option(contract(updateVesteeType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(updateVesteeType))
        ];

    // Create operation to update a vestee
    const updateVesteeOperation : operation = Tezos.transaction(
        (updateVesteeParams),
        0tez, 
        updateVesteeEntrypoint
    );

    operations := updateVesteeOperation # operations;

} with (operations)



function toggleVesteeLock(const vesteeAddress : address; var operations : list(operation); const s : governanceProxyStorageType) : list(operation) is 
block {

    // Find and get vesting contract address from the generalContracts map
    const vestingAddress : address = getContractAddressFromGovernanceContract("vesting", s.governanceAddress, error_VESTING_CONTRACT_NOT_FOUND);

    // Find and get removeVestee entrypoint of Vesting contract
    const toggleVesteeLockEntrypoint = case (Tezos.get_entrypoint_opt(
        "%toggleVesteeLock",
        vestingAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TOGGLE_VESTEE_LOCK_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(address))
        ];

    // Create operation to lock or unlock a vestee
    const toggleVesteeLockOperation : operation = Tezos.transaction(
        (vesteeAddress),
        0tez, 
        toggleVesteeLockEntrypoint
    );

    operations := toggleVesteeLockOperation # operations;

} with (operations)

// ------------------------------------------------------------------------------
// Vestee Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------


function getProxyNodeAddress(const entrypointName : string; const s : governanceProxyStorageType) : address is
block {
    
    const proxyNodeAddress : address = case s.lambdaPointerLedger[entrypointName] of [
            Some(_address) -> _address
        |   None           -> failwith(error_LAMBDA_POINTER_DOES_NOT_EXIST)
    ];

} with proxyNodeAddress



function addLambdaPointer(const entrypointName : string; const proxyNodeAddress : option(address); var s : governanceProxyStorageType) : governanceProxyStorageType is
block {

    // init variables
    const entrypointName    : string    = entrypointName;
    const proxyNodeAddress  : address   = case proxyNodeAddress of [
            Some(_address) -> _address
        |   None           -> failwith(error_PROXY_NODE_ADDRESS_NOT_FOUND)
    ];

    // check that entrypoint name does not already exist in the lambda pointer ledger
    if Map.mem(entrypointName, s.lambdaPointerLedger) then failwith(error_LAMBDA_POINTER_ALREADY_EXISTS) else skip;

    // update storage
    s.lambdaPointerLedger[entrypointName] := proxyNodeAddress;

} with s 



function updateLambdaPointer(const entrypointName : string; const proxyNodeAddress : option(address); var s : governanceProxyStorageType) : governanceProxyStorageType is
block {

    // init variables
    const entrypointName    : string    = entrypointName;
    const proxyNodeAddress  : address   = case proxyNodeAddress of [
            Some(_address) -> _address
        |   None           -> failwith(error_PROXY_NODE_ADDRESS_NOT_FOUND)
    ];

    // check that entrypoint name does not already exist in the lambda pointer ledger
    if Map.mem(entrypointName, s.lambdaPointerLedger) then skip else failwith(error_LAMBDA_POINTER_DOES_NOT_EXIST);

    // update storage
    s.lambdaPointerLedger[entrypointName] := proxyNodeAddress;

} with s 



function removeLambdaPointer(const entrypointName : string; var s : governanceProxyStorageType) : governanceProxyStorageType is
block {

    // init variables
    const entrypointName : string = entrypointName;

    // check that entrypoint name does not already exist in the lambda pointer ledger
    if Map.mem(entrypointName, s.lambdaPointerLedger) then skip else failwith(error_LAMBDA_POINTER_DOES_NOT_EXIST);

    // update storage
    remove entrypointName from map s.lambdaPointerLedger;

} with s 

// ------------------------------------------------------------------------------
// General Helper Functions End
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