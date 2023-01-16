
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

// governance proxy lamba helper function to get %executeGovernanceAction entrypoint in Governance Proxy Node contract
function getExecuteGovernanceActionEntrypoint(const contractAddress : address) : contract(bytes) is
    case (Tezos.get_entrypoint_opt(
        "%executeGovernanceAction",
        contractAddress) : option(contract(bytes))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_EXECUTE_GOVERNANCE_ACTION_ENTRYPOINT_IN_GOVERNANCE_PROXY_NODE_CONTRACT_NOT_FOUND) : contract(bytes))
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

} with processGovernanceActionOperation

// ------------------------------------------------------------------------------
// Operation Helpers End
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



function addLambdaPointer(const addLambdaPointerParams : addLambdaPointerActionType; var s : governanceProxyStorageType) : governanceProxyStorageType is
block {

    // init variables
    const entrypointName    : string    = addLambdaPointerParams.entrypointName;
    const proxyNodeAddress  : address   = addLambdaPointerParams.proxyNodeAddress;

    // check that entrypoint name does not already exist in the lambda pointer ledger
    if Big_map.mem(entrypointName, s.lambdaPointerLedger) then failwith(error_LAMBDA_POINTER_ALREADY_EXISTS) else skip;

    // update storage
    s.lambdaPointerLedger[entrypointName] := proxyNodeAddress;

} with s 



function updateLambdaPointer(const addLambdaPointerParams : addLambdaPointerActionType; var s : governanceProxyStorageType) : governanceProxyStorageType is
block {

    // init variables
    const entrypointName    : string    = addLambdaPointerParams.entrypointName;
    const proxyNodeAddress  : address   = addLambdaPointerParams.proxyNodeAddress;

    // check that entrypoint name does not already exist in the lambda pointer ledger
    if Big_map.mem(entrypointName, s.lambdaPointerLedger) then skip else failwith(error_LAMBDA_POINTER_DOES_NOT_EXIST);

    // update storage
    s.lambdaPointerLedger[entrypointName] := proxyNodeAddress;

} with s 



function removeLambdaPointer(const addLambdaPointerParams : addLambdaPointerActionType; var s : governanceProxyStorageType) : governanceProxyStorageType is
block {

    // init variables
    const entrypointName    : string    = addLambdaPointerParams.entrypointName;
    const proxyNodeAddress  : address   = addLambdaPointerParams.proxyNodeAddress;

    // check that entrypoint name does not already exist in the lambda pointer ledger
    if Big_map.mem(entrypointName, s.lambdaPointerLedger) then skip else failwith(error_LAMBDA_POINTER_DOES_NOT_EXIST);

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