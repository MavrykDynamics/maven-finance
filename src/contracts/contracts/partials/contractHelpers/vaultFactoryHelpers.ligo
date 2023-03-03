// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Admin, Governance Satellite Contract
function verifySenderIsAdminOrGovernanceSatelliteContract(var s : vaultFactoryStorageType) : unit is
block{

    const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[s.admin; governanceSatelliteAddress], error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED)

} with unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get %registerVaultCreation entrypoint in Lending Controller Creation
function getRegisterVaultCreationEntrypointInLendingController(const contractAddress : address) : contract(registerVaultCreationActionType) is
    case (Tezos.get_entrypoint_opt(
        "%registerVaultCreation",
        contractAddress) : option(contract(registerVaultCreationActionType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_REGISTER_VAULT_CREATION_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND) : contract(registerVaultCreationActionType))
        ]
// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// On-chain views to Lending Controller Helper Functions Begin
// ------------------------------------------------------------------------------

(* Get loan token record from lending controller contract *)
function getLoanTokenRecordFromLendingController(const loanTokenName : string; const s : vaultFactoryStorageType) : loanTokenRecordType is 
block {

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress: address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);
        
    // get loan token record of user from Lending Controlelr contract
    const getLoanTokenRecordOptView : option (option (loanTokenRecordType)) = Tezos.call_view ("getLoanTokenRecordOpt", loanTokenName, lendingControllerAddress);
    const loanTokenRecord : loanTokenRecordType = case getLoanTokenRecordOptView of [
            Some (_viewResult)  -> case _viewResult of [
                    Some (_record)  -> _record
                |   None            -> failwith (error_LOAN_TOKEN_RECORD_NOT_FOUND)
            ]
        |   None                -> failwith (error_GET_LOAN_TOKEN_RECORD_OPT_VIEW_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND)
    ];

} with loanTokenRecord



(* verify vault handle is unique in Lending Controller contract s.vaults *)
function verifyVaultHandleIsUnique(const vaultHandle : vaultHandleType;  const s : vaultFactoryStorageType) : unit is 
block {

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress : address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);
        
    // get vault from Lending Controller contract
    const getVaultOptView : option (loanTokenRecordType) = Tezos.call_view ("getVaultOpt", vaultHandle, lendingControllerAddress);
    const vaultIsUnique : unit = case getVaultOptView of [
            Some (_vaultExists) -> failwith (error_VAULT_ALREADY_EXISTS)
        |   None                -> unit
    ];

} with vaultIsUnique

// ------------------------------------------------------------------------------
// On-chain views to Lending Controller Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------

// helper funtion to prepare new vault storage
function prepareVaultStorage(const createVaultParams : createVaultType; const vaultOwner : address; const vaultId : nat; const s : vaultFactoryStorageType) : vaultStorageType is 
block {

    // make vault handle
    const handle : vaultHandleType = record [
        id     = vaultId;
        owner  = vaultOwner;
    ];

    // verify vault is unique or if it already exists in Lending Controller
    verifyVaultHandleIsUnique(handle, s);

    // validate vault name does not exceed max length
    const vaultName : string = createVaultParams.name;
    validateStringLength(vaultName, s.config.vaultNameMaxLength, error_WRONG_INPUT_PROVIDED);

    // params for vault with storage origination
    const newVaultStorage : vaultStorageType = record [
        admin                       = s.admin;
        name                        = vaultName;
        handle                      = handle;
        depositors                  = createVaultParams.depositors;
    ];

} with newVaultStorage



function registerVaultCreationOperation(const vaultOwner : address; const vaultId : nat; const vaultAddress : address; const loanTokenName : string; const s : vaultFactoryStorageType) : operation is
block {

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress: address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);
    
    const registerVaultCreationParams : registerVaultCreationActionType = record [ 
        vaultOwner     = vaultOwner;
        vaultId        = vaultId;
        vaultAddress   = vaultAddress;
        loanTokenName  = loanTokenName;
    ];

    const registerVaultCreationOperation : operation = Tezos.transaction(
        registerVaultCreationParams,
        0tez,
        getRegisterVaultCreationEntrypointInLendingController(lendingControllerAddress)
    );

} with registerVaultCreationOperation

// ------------------------------------------------------------------------------
// General Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const vaultFactoryLambdaAction : vaultFactoryLambdaActionType; var s : vaultFactoryStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(vaultFactoryUnpackLambdaFunctionType)) of [
            Some(f) -> f(vaultFactoryLambdaAction, s)
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