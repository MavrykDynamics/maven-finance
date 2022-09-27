// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Helpers and Types
// ------------------------------------------------------------------------------

// Shared Helpers
#include "../partials/shared/sharedHelpers.ligo"

// Transfer Helpers
#include "../partials/shared/transferHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// MvkToken Types
#include "../partials/contractTypes/mvkTokenTypes.ligo"

// Delegation Type for updateConfig
#include "../partials/contractTypes/delegationTypes.ligo"

// Doorman Type for updateConfig
#include "../partials/contractTypes/doormanTypes.ligo"

// Farm Type
#include "../partials/contractTypes/farmTypes.ligo"

// Treasury Type for mint and transfers
#include "../partials/contractTypes/treasuryTypes.ligo"

// Emergency Governance Type
#include "../partials/contractTypes/emergencyGovernanceTypes.ligo"

// Council Type
#include "../partials/contractTypes/councilTypes.ligo"

// Governance Type
#include "../partials/contractTypes/governanceTypes.ligo"

// Governance Financial Type
#include "../partials/contractTypes/governanceFinancialTypes.ligo"

// Governance Satellite Type
#include "../partials/contractTypes/governanceSatelliteTypes.ligo"

// Break Glass Type
#include "../partials/contractTypes/breakGlassTypes.ligo"

// Farm Type
#include "../partials/contractTypes/farmTypes.ligo"

// FarmFactory Type
#include "../partials/contractTypes/farmFactoryTypes.ligo"

// Treasury Type
#include "../partials/contractTypes/treasuryTypes.ligo"

// TreasuryFactory Type
#include "../partials/contractTypes/treasuryFactoryTypes.ligo"

// Aggregator Type
#include "../partials/contractTypes/aggregatorTypes.ligo"

// AggregatorFactory Type
#include "../partials/contractTypes/aggregatorFactoryTypes.ligo"

// Governance Proxy Types
#include "../partials/contractTypes/governanceProxyTypes.ligo"

// ------------------------------------------------------------------------------

type governanceProxyAction is 
        
        // Housekeeping Entrypoints
        SetAdmin                        of (address)
    |   SetGovernance                   of (address)
    |   UpdateMetadata                  of updateMetadataType
    |   UpdateWhitelistContracts        of updateWhitelistContractsType
    |   UpdateGeneralContracts          of updateGeneralContractsType
    |   UpdateWhitelistTokenContracts   of updateWhitelistTokenContractsType
    |   MistakenTransfer                of transferActionType

        // Main entrypoints
    |   SetProxyLambda                  of setProxyLambdaType
    |   ExecuteGovernanceAction         of (bytes)
    |   DataPackingHelper               of executeActionType

        // Lambda Entrypoints
    |   SetLambda                       of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * governanceProxyStorageType

// proxy lambdas -> executing proposals to external contracts within MAVRYK system
type governanceProxyProxyLambdaFunctionType is (executeActionType * governanceProxyStorageType) -> return

// governance proxy contract methods lambdas
type governanceProxyUnpackLambdaFunctionType is (governanceProxyLambdaActionType * governanceProxyStorageType) -> return



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders : Admin
function checkSenderIsAdmin(var s : governanceProxyStorageType) : unit is
    if (Tezos.get_sender() = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



// Allowed Senders : Self
function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.get_sender() = Tezos.get_self_address()) then unit
    else failwith(error_ONLY_SELF_ALLOWED);



// Allowed Senders : Admin, Governance Contract
function checkSenderIsAdminOrGovernance(var s : governanceProxyStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);



// Allowed Senders : Admin, Governance Satellite Contract
function checkSenderIsAdminOrGovernanceSatelliteContract(var s : governanceProxyStorageType) : unit is
block{

    if Tezos.get_sender() = s.admin then skip
    else {

        const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);

        if Tezos.get_sender() = governanceSatelliteAddress then skip
        else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED);

    }

} with unit
    


// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if (Tezos.get_amount() = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Functions Begin
// ------------------------------------------------------------------------------

// governance proxy lamba helper function to get setAdmin entrypoint
function getSetAdminEntrypoint(const contractAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%setAdmin",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_ADMIN_ENTRYPOINT_NOT_FOUND) : contract(address))
        ];


// governance proxy lamba helper function to get setGovernance entrypoint
function getSetGovernanceEntrypoint(const contractAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%setGovernance",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_GOVERNANCE_ENTRYPOINT_NOT_FOUND) : contract(address))
        ];



// governance proxy lamba helper function to get setLambda entrypoint
function getSetLambdaEntrypoint(const contractAddress : address) : contract(setLambdaType) is
    case (Tezos.get_entrypoint_opt(
        "%setLambda",
        contractAddress) : option(contract(setLambdaType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_LAMBDA_ENTRYPOINT_NOT_FOUND) : contract(setLambdaType))
        ];



// governance proxy lamba helper function to get setProductLambda entrypoint
function getSetProductLambdaEntrypoint(const contractAddress : address) : contract(setLambdaType) is
    case (Tezos.get_entrypoint_opt(
        "%setProductLambda",
        contractAddress) : option(contract(setLambdaType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_PRODUCT_LAMBDA_ENTRYPOINT_NOT_FOUND) : contract(setLambdaType))
        ];



// governance proxy lamba helper function to get updateMetadata entrypoint
function getUpdateMetadataEntrypoint(const contractAddress : address) : contract(updateMetadataType) is
    case (Tezos.get_entrypoint_opt(
        "%updateMetadata",
        contractAddress) : option(contract(updateMetadataType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_METADATA_ENTRYPOINT_NOT_FOUND) : contract(updateMetadataType))
        ];



// governance proxy lamba helper function to get updateWhitelistContracts entrypoint
function getUpdateWhitelistContractsEntrypoint(const contractAddress : address) : contract(updateWhitelistContractsType) is
    case (Tezos.get_entrypoint_opt(
        "%updateWhitelistContracts",
        contractAddress) : option(contract(updateWhitelistContractsType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_WHITELIST_CONTRACTS_ENTRYPOINT_NOT_FOUND) : contract(updateWhitelistContractsType))
        ];



// governance proxy lamba helper function to get updateGeneralContracts entrypoint
function getUpdateGeneralContractsEntrypoint(const contractAddress : address) : contract(updateGeneralContractsType) is
    case (Tezos.get_entrypoint_opt(
        "%updateGeneralContracts",
        contractAddress) : option(contract(updateGeneralContractsType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_NOT_FOUND) : contract(updateGeneralContractsType))
        ];



// governance proxy lamba helper function to get updateWhitelistTokenContracts entrypoint
function getUpdateWhitelistTokenContractsEntrypoint(const contractAddress : address) : contract(updateWhitelistTokenContractsType) is
    case (Tezos.get_entrypoint_opt(
        "%updateWhitelistTokenContracts",
        contractAddress) : option(contract(updateWhitelistTokenContractsType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_WHITELIST_TOKEN_CONTRACTS_ENTRYPOINT_NOT_FOUND) : contract(updateWhitelistTokenContractsType))
        ];



// governance proxy lamba helper function to get setContractName entrypoint
function getSetContractNameEntrypoint(const contractAddress : address) : contract(string) is
    case (Tezos.get_entrypoint_opt(
        "%setName",
        contractAddress) : option(contract(string))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_NAME_ENTRYPOINT_NOT_FOUND) : contract(string))
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



// ------------------------------------------------------------------------------
//
// Lambda Helpers Begin
//
// ------------------------------------------------------------------------------

// Governance Proxy Lambdas :
#include "../partials/contractLambdas/governanceProxy/governanceProxyLambdas.ligo"

// ------------------------------------------------------------------------------
//
// Lambda Helpers End
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; var s : governanceProxyStorageType) : address is
    s.admin



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; var s : governanceProxyStorageType) : whitelistContractsType is
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; var s : governanceProxyStorageType) : generalContractsType is
    s.generalContracts



(* View: get whitelist token contracts *)
[@view] function getWhitelistTokenContracts(const _ : unit; var s : governanceProxyStorageType) : whitelistTokenContractsType is
    s.whitelistTokenContracts



(* View: get a proxy lambda *)
[@view] function getProxyLambdaOpt(const lambdaIndex : nat; var s : governanceProxyStorageType) : option(bytes) is
    Big_map.find_opt(lambdaIndex, s.proxyLambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : governanceProxyStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  
    
} with response



(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceAddress : address; var s : governanceProxyStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaSetGovernance(newGovernanceAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);

} with response



(*  updateMetadata entrypoint: update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : governanceProxyStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  

} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : governanceProxyStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  

} with response



(*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : governanceProxyStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  

} with response



(*  updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams : updateWhitelistTokenContractsType; var s : governanceProxyStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistTokenContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams : transferActionType; var s : governanceProxyStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMistakenTransfer"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance proxy lambda action
    const governanceProxyLambdaAction : governanceProxyLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceProxyLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------

(* setProxyLambda entrypoint *)
function setProxyLambda(const setProxyLambdaParams : setProxyLambdaType; var s : governanceProxyStorageType) : return is 
block {
    
    checkSenderIsAdminOrGovernance(s); // governance contract will also be the admin in most cases unless break glass
    
    // assign params to constants for better code readability
    const lambdaId      = setProxyLambdaParams.id;
    const lambdaBytes   = setProxyLambdaParams.func_bytes;

    // set lambda in lambdaLedger - allow override of lambdas
    s.proxyLambdaLedger[lambdaId] := lambdaBytes;

} with (noOperations, s)



(* executeGovernanceAction entrypoint *)
function executeGovernanceAction(const governanceActionBytes : bytes; var s : governanceProxyStorageType) : return is 
block {
    
    checkSenderIsAdminOrGovernance(s); // governance contract will also be the admin in most cases unless break glass

    const governanceAction : executeActionType = case (Bytes.unpack(governanceActionBytes) : option(executeActionType)) of [
            Some(_action) -> _action
        |   None          -> failwith(error_UNABLE_TO_UNPACK_GOVERNANCE_ACTION_LAMBDA)
    ];

    const executeGovernanceActionLambdaBytes : bytes = case s.proxyLambdaLedger[0n] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // reference: type governanceLambdaFunctionType is (executeActionType * governanceStorageType) -> return
    const response : return = case (Bytes.unpack(executeGovernanceActionLambdaBytes) : option(governanceProxyProxyLambdaFunctionType)) of [
            Some(f) -> f(governanceAction, s)
        |   None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with response



(* dataDataPackingHelper entrypoint - to simulate calling an entrypoint *)
function dataDataPackingHelper(const _governanceAction : executeActionType; var s : governanceProxyStorageType) : return is 
    (noOperations, s)


// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : governanceProxyStorageType) : return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Lambda Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : governanceProxyAction; const s : governanceProxyStorageType) : return is 
block {

    checkNoAmount(Unit); // entrypoints should not receive any tez amount  

} with (

    case action of [
            
            // Housekeeping entrypoints
            SetAdmin(parameters)                      -> setAdmin(parameters, s)
        |   SetGovernance(parameters)                 -> setGovernance(parameters, s)
        |   UpdateMetadata(parameters)                -> updateMetadata(parameters, s)
        |   UpdateWhitelistContracts(parameters)      -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)        -> updateGeneralContracts(parameters, s)
        |   UpdateWhitelistTokenContracts(parameters) -> updateWhitelistTokenContracts(parameters, s)
        |   MistakenTransfer(parameters)              -> mistakenTransfer(parameters, s)

            // Main entrypoints
        |   SetProxyLambda(parameters)                -> setProxyLambda(parameters, s)
        |   ExecuteGovernanceAction(parameters)       -> executeGovernanceAction(parameters, s)
        |   DataPackingHelper(parameters)             -> dataDataPackingHelper(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                     -> setLambda(parameters, s)

    ]
)
