
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



// governance proxy lamba helper function to get %executeGovernanceAction entrypoint
function getExecuteGovernanceActionEntrypoint(const contractAddress : address) : contract(bytes) is
    case (Tezos.get_entrypoint_opt(
        "%executeGovernanceAction",
        contractAddress) : option(contract(bytes))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_EXECUTE_GOVERNANCE_ACTION_ENTRYPOINT_NOT_FOUND) : contract(bytes))
        ];

// ------------------------------------------------------------------------------
// Entrypoint Functions Begin
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