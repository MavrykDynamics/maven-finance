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

// helper function to %registerDeposit entrypoint in the Lending Controller
function getRegisterDepositEntrypointInLendingController(const contractAddress : address) : contract(registerDepositActionType) is
    case (Mavryk.get_entrypoint_opt(
        "%registerDeposit",
        contractAddress) : option(contract(registerDepositActionType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_REGISTER_DEPOSIT_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND) : contract(registerDepositActionType))
        ];



// helper function to get %registerVaultCreation entrypoint in Lending Controller Creation
function getRegisterVaultCreationEntrypointInLendingController(const contractAddress : address) : contract(registerVaultCreationActionType) is
    case (Mavryk.get_entrypoint_opt(
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
    const getLoanTokenRecordOptView : option (option (loanTokenRecordType)) = Mavryk.call_view ("getLoanTokenRecordOpt", loanTokenName, lendingControllerAddress);
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
    const getVaultOptView : option (loanTokenRecordType) = Mavryk.call_view ("getVaultOpt", vaultHandle, lendingControllerAddress);
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
        admin                       = Mavryk.get_self_address();
        name                        = vaultName;
        handle                      = handle;
        depositors                  = createVaultParams.depositors;
    ];

} with newVaultStorage



function registerVaultCreationOperation(const vaultOwner : address; const vaultId : nat; const vaultAddress : address; const loanTokenName : string; const lendingControllerAddress : address) : operation is
block {
    
    const registerVaultCreationParams : registerVaultCreationActionType = record [ 
        vaultOwner     = vaultOwner;
        vaultId        = vaultId;
        vaultAddress   = vaultAddress;
        loanTokenName  = loanTokenName;
    ];

    const registerVaultCreationOperation : operation = Mavryk.transaction(
        registerVaultCreationParams,
        0mav,
        getRegisterVaultCreationEntrypointInLendingController(lendingControllerAddress)
    );

} with registerVaultCreationOperation



// helper function to get collateral token record by name from Lending Controller through on-chain view
function getCollateralTokenRecordByName(const tokenName : string; const lendingControllerAddress : address) : collateralTokenRecordType is 
block {

    // check collateral token contract address exists in Lending Controller collateral token ledger
    const getCollateralTokenRecordView : option (option(collateralTokenRecordType)) = Mavryk.call_view ("getColTokenRecordByNameOpt", tokenName, lendingControllerAddress);
    const getCollateralTokenRecordOpt : option(collateralTokenRecordType) = case getCollateralTokenRecordView of [
            Some (_opt)    -> _opt
        |   None           -> failwith (error_GET_COL_TOKEN_RECORD_BY_NAME_OPT_VIEW_NOT_FOUND)
    ];
    const collateralTokenRecord : collateralTokenRecordType = case getCollateralTokenRecordOpt of [
            Some(_record)  -> _record
        |   None           -> failwith (error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
    ];

} with collateralTokenRecord


// helper function to register deposit in lending controller
function registerDepositInLendingController(const vaultOwner : address; const vaultId : nat; const amount : nat; const tokenName : string; const lendingControllerAddress : address) : operation is 
block {

    const vaultHandle : vaultHandleType = record [
        id      = vaultId;
        owner   = vaultOwner;
    ];

    // create register deposit params
    const registerDepositParams : registerDepositActionType = record [
        handle          = vaultHandle;
        amount          = amount;
        tokenName       = tokenName;
    ];
    
    // create operation to register deposit on the lending controller
    const registerDepositOperation : operation = Mavryk.transaction(
        registerDepositParams,
        0mumav,
        getRegisterDepositEntrypointInLendingController(lendingControllerAddress)
    );

} with registerDepositOperation



// helper function to process vault collateral transfer (for deposit/withdrawal)
function processVaultCollateralTransfer(const from_ : address; const to_ : address; const amount : nat; const tokenType : tokenType) : operation is 
block {

    const processVaultCollateralTransferOperation : operation = case tokenType of [
            Tez(_tez)   -> transferTez( (Mavryk.get_contract_with_error(to_, "Error. Unable to send mav to vault.") : contract(unit)), amount * 1mumav)
        |   Fa12(token) -> {
                const transferOperation : operation = transferFa12Token(from_, to_, amount, token)
            } with transferOperation
        |   Fa2(token)  -> {
                const transferOperation : operation = transferFa2Token(from_, to_, amount, token.tokenId, token.tokenContractAddress)
            } with transferOperation
    ];

} with processVaultCollateralTransferOperation

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