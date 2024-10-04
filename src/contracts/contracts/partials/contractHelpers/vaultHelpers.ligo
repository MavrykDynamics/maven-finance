// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Getters Begin
// ------------------------------------------------------------------------------

// helper function to get governance address from vault factory
function getGovernanceAddress(const s : vaultStorageType) : address is 
block {

    // get governance address view from vault factory
    const getGovernanceAddressView : option (address) = Mavryk.call_view ("getGovernanceAddress", unit, s.admin);
    const governanceAddress : address = case getGovernanceAddressView of [
            Some (_address) -> _address
        |   None            -> failwith(error_GET_GOVERNANCE_ADDRESS_VIEW_NOT_FOUND_IN_VAULT_FACTORY)
    ];

} with governanceAddress

// ------------------------------------------------------------------------------
// Getters End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Vault Owner
function verifySenderIsVaultOwner(const s : vaultStorageType) : unit is
block {
    
    verifySenderIsAllowed(set[s.handle.owner], error_ONLY_VAULT_OWNER_ALLOWED)

} with unit
    


// Allowed Senders: Lending Controller Contract
function verifySenderIsLendingControllerContract(var s : vaultStorageType) : unit is
block{

    // Get Governance Address from vault factory
    const governanceAddress : address = getGovernanceAddress(s);

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress: address = getContractAddressFromGovernanceContract("lendingController", governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[lendingControllerAddress], error_ONLY_LENDING_CONTROLLER_CONTRACT_ALLOWED)

} with unit



// verify that collateral token is not protected
function verifyCollateralTokenIsNotProtected(const collateralTokenRecord : collateralTokenRecordType; const errorCode : nat) : unit is
block {

    if collateralTokenRecord.protected = True then failwith(errorCode) else skip;

} with unit



// verify that deposit is allowed
function verifyDepositAllowed(const isOwnerCheck : bool; const isAbleToDeposit : bool; const s : vaultStorageType) : unit is
block {

    // Get Governance Address from vault factory
    const governanceAddress : address = getGovernanceAddress(s);

    // Get Vault Factory Address from the General Contracts map on the Governance Contract
    const vaultFactoryAddress : address = getContractAddressFromGovernanceContract("vaultFactory", governanceAddress, error_VAULT_FACTORY_CONTRACT_NOT_FOUND);

    if isOwnerCheck = True or isAbleToDeposit = True or Mavryk.get_sender() = vaultFactoryAddress
    then skip 
    else failwith(error_NOT_AUTHORISED_TO_DEPOSIT_INTO_VAULT)

} with unit



// helper function to check sender is owner
function checkSenderIsOwner(const s : vaultStorageType) : bool is
block {

    var isOwnerCheck : bool := False;
    if Mavryk.get_sender() = s.handle.owner then isOwnerCheck := True else isOwnerCheck := False;

} with isOwnerCheck



// helper function to check sender is a whitelisted depositor
function checkSenderIsWhitelistedDepositor(const s : vaultStorageType) : bool is
block {

    const isAllowedToDeposit : bool = case s.depositors of [
            Any                     -> True
        |   Whitelist(_depositors)  -> _depositors contains Mavryk.get_sender()
    ];

} with isAllowedToDeposit

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



// helper function to %registerWithdrawal entrypoint in the vault controller
function getRegisterWithdrawalEntrypointInLendingController(const contractAddress : address) : contract(registerWithdrawalActionType) is
    case (Mavryk.get_entrypoint_opt(
        "%registerWithdrawal",
        contractAddress) : option(contract(registerWithdrawalActionType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_REGISTER_WITHDRAWAL_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND) : contract(registerWithdrawalActionType))
        ];



// helper function to %delegateToSatellite entrypoint in the delegation contract
function getDelegateToSatelliteEntrypoint(const contractAddress : address) : contract(delegateToSatelliteType) is
    case (Mavryk.get_entrypoint_opt(
        "%delegateToSatellite",
        contractAddress) : option(contract(delegateToSatelliteType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_DELEGATE_TO_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(delegateToSatelliteType))
        ]



// helper function to %update_operators entrypoint on a given token contract
function getUpdateTokenOperatorsEntrypoint(const tokenContractAddress : address) : contract(updateOperatorsType) is
    case (Mavryk.get_entrypoint_opt(
        "%update_operators",
        tokenContractAddress) : option(contract(updateOperatorsType))) of [
                Some (contr)    -> contr
            |   None            -> (failwith(error_UPDATE_OPERATORS_ENTRYPOINT_IN_STAKING_TOKEN_CONTRACT_NOT_FOUND) : contract(updateOperatorsType))
        ];
// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Operation Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to create delegateToSatellite operation
function delegateToSatelliteOperation(const satelliteAddress : address; const s : vaultStorageType) : operation is 
block {

    // Get Governance Address from vault factory
    const governanceAddress : address = getGovernanceAddress(s);

    // Get Delegation Address from the General Contracts map on the Governance Contract
    const delegationAddress: address = getContractAddressFromGovernanceContract("delegation", governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    const delegateToSatelliteParams : delegateToSatelliteType = record [
        userAddress         = Mavryk.get_self_address();
        satelliteAddress    = satelliteAddress;
    ];

    // Create delegate to satellite operation
    const delegateToSatelliteOperation : operation = Mavryk.transaction(
        delegateToSatelliteParams,
        0mav,
        getDelegateToSatelliteEntrypoint(delegationAddress)
    );

} with delegateToSatelliteOperation



// helper function to create updateTokenOperators operation
function updateTokenOperatorsOperation(const updateOperatorsParams : updateOperatorsType; const tokenContractAddress : address) : operation is 
block {

    // Create operation to update operators in token contract
    const updateTokenOperatorsOperation : operation = Mavryk.transaction(
        (updateOperatorsParams),
        0mav, 
        getUpdateTokenOperatorsEntrypoint(tokenContractAddress)
    );

} with updateTokenOperatorsOperation

// ------------------------------------------------------------------------------
// Operation Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Contract Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get vault name max length from the factory contract
function getVaultNameMaxLength(const s : vaultStorageType) : nat is 
block {

        // Get Governance Address from vault factory
    const governanceAddress : address = getGovernanceAddress(s);

    // Get Vault Factory Address from the General Contracts map on the Governance Contract
    const vaultFactoryAddress : address = getContractAddressFromGovernanceContract("vaultFactory", governanceAddress, error_VAULT_FACTORY_CONTRACT_NOT_FOUND);

    // Get the vault name max length
    const configView : option (vaultFactoryConfigType)  = Mavryk.call_view ("getConfig", unit, vaultFactoryAddress);
    const vaultNameMaxLength : nat = case configView of [
            Some (_config) -> _config.vaultNameMaxLength
        |   None -> failwith (error_GET_CONFIG_VIEW_IN_VAULT_FACTORY_CONTRACT_NOT_FOUND)
    ];

} with vaultNameMaxLength



// helper function to get vault lambda from vault factory
function getVaultLambdaFromFactory(const lambdaName : string; const s : vaultStorageType) : bytes is 
block {

    // Get Governance Address from vault factory
    const governanceAddress : address = getGovernanceAddress(s);

    // Get Vault Factory Address from the General Contracts map on the Governance Contract
    const vaultFactoryAddress : address = getContractAddressFromGovernanceContract("vaultFactory", governanceAddress, error_VAULT_FACTORY_CONTRACT_NOT_FOUND);

    // get vault lambda view from vault factory
    const getVaultLambdaOptView : option(option (bytes)) = Mavryk.call_view ("getVaultLambdaOpt", lambdaName, vaultFactoryAddress);
    const vaultLambdaBytes : bytes = case getVaultLambdaOptView of [
            Some (_viewResult) -> case _viewResult of [
                    Some (_lambda)  -> _lambda
                |   None            -> failwith (error_VAULT_LAMBDA_NOT_FOUND_IN_VAULT_FACTORY_VAULT_LAMBDA_LEDGER)
            ]
        |   None           -> failwith(error_GET_VAULT_LAMBDA_OPT_NOT_FOUND_IN_VAULT_FACTORY)
    ];

} with vaultLambdaBytes



// helper function to get break glass config from lending controller 
function getBreakGlassConfigFromLendingController(const entrypoint : string; const s : vaultStorageType) : bool is 
block {

    // Get Governance Address from vault factory
    const governanceAddress : address = getGovernanceAddress(s);

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress  : address = getContractAddressFromGovernanceContract("lendingController", governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

    // get break glass config from lending controller
    const getBreakGlassConfigView : option (option(bool)) = Mavryk.call_view ("getBreakGlassConfig", entrypoint, lendingControllerAddress);
    const breakGlassPauseBool : bool = case getBreakGlassConfigView of [
            Some (_getBreakGlassConfigView) -> case _getBreakGlassConfigView of [
                    Some(_pauseBool) -> _pauseBool
                |   None -> False
            ]
        |   None                        -> failwith(error_BREAK_GLASS_CONFIG_NOT_FOUND_IN_LENDING_CONTROLLER)
    ];

} with breakGlassPauseBool



// helper function to get collateral token record by name from Lending Controller through on-chain view
function getCollateralTokenRecordByName(const tokenName : string; const s : vaultStorageType) : collateralTokenRecordType is 
block {

    // Get Governance Address from vault factory
    const governanceAddress : address = getGovernanceAddress(s);

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress  : address = getContractAddressFromGovernanceContract("lendingController", governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

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



// helper function to verify that collateral token is staked token
function verifyCollateralTokenIsStakedToken(const collateralTokenRecord : collateralTokenRecordType) : unit is 
block {

    if collateralTokenRecord.isStakedToken = False then failwith(error_NOT_STAKED_TOKEN) else skip;

} with unit



// helper function to verify collateral token is not paused
function verifyCollateralTokenIsNotPaused(const collateralTokenRecord : collateralTokenRecordType) : unit is 
block {

    if collateralTokenRecord.isPaused then failwith(error_COLLATERAL_TOKEN_IS_PAUSED) else skip;

} with unit



// helper function to process vault transfer (for deposit/withdrawal)
function processVaultTransfer(const from_ : address; const to_ : address; const amount : nat; const tokenType : tokenType) : operation is 
block {

    const processVaultTransferOperation : operation = case tokenType of [
            Mav(_mav)   -> transferMav( (Mavryk.get_contract_with_error(to_, "Error. Unable to send mav to vault.") : contract(unit)), amount * 1mumav)
        |   Fa12(token) -> {
                verifyNoAmountSent(unit);
                const transferOperation : operation = transferFa12Token(from_, to_, amount, token)
            } with transferOperation
        |   Fa2(token)  -> {
                verifyNoAmountSent(unit);
                const transferOperation : operation = transferFa2Token(from_, to_, amount, token.tokenId, token.tokenContractAddress)
            } with transferOperation
    ];

} with processVaultTransferOperation



// helper function to register deposit in lending controller
function registerDepositInLendingController(const amount : nat; const tokenName : string; const s : vaultStorageType) : operation is 
block {

    // Get Governance Address from vault factory
    const governanceAddress : address = getGovernanceAddress(s);

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress  : address = getContractAddressFromGovernanceContract("lendingController", governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

    // create register deposit params
    const registerDepositParams : registerDepositActionType = record [
        handle          = s.handle;
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



// helper function to register withdrawal in lending controller
function registerWithdrawalInLendingController(const amount : nat; const tokenName : string; const s : vaultStorageType) : operation is 
block {

    // Get Governance Address from vault factory
    const governanceAddress : address = getGovernanceAddress(s);

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress  : address = getContractAddressFromGovernanceContract("lendingController", governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

    // create register withdrawal params
    const registerWithdrawalParams : registerDepositActionType = record [
        handle          = s.handle;
        amount          = amount;
        tokenName       = tokenName;
    ];
    
    // create operation to register withdrawal on the lending controller
    const registerWithdrawalOperation : operation = Mavryk.transaction(
        registerWithdrawalParams,
        0mumav,
        getRegisterWithdrawalEntrypointInLendingController(lendingControllerAddress)
    );

} with registerWithdrawalOperation

// ------------------------------------------------------------------------------
// Contract Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

// verify that %vaultWithdraw is not paused
function verifyVaultDepositIsNotPaused(var s : vaultStorageType) : unit is
block {

    const breakGlassPauseBool : bool = getBreakGlassConfigFromLendingController("vaultDeposit", s);    
    verifyEntrypointIsNotPaused(breakGlassPauseBool, error_VAULT_DEPOSIT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED);

} with unit



// verify that vaultWithdraw is not paused in Lending Controller
function verifyVaultWithdrawIsNotPaused(var s : vaultStorageType) : unit is
block {

    const breakGlassPauseBool : bool = getBreakGlassConfigFromLendingController("vaultWithdraw", s);    
    verifyEntrypointIsNotPaused(breakGlassPauseBool, error_VAULT_WITHDRAW_IN_LENDING_CONTROLLER_CONTRACT_PAUSED);

} with unit



// verify that vaultOnLiquidate is not paused in Lending Controller
function verifyVaultOnLiquidateIsNotPaused(var s : vaultStorageType) : unit is
block {

    const breakGlassPauseBool : bool = getBreakGlassConfigFromLendingController("onLiquidate", s);    
    verifyEntrypointIsNotPaused(breakGlassPauseBool, error_VAULT_ON_LIQUIDATE_IN_LENDING_CONTROLLER_CONTRACT_PAUSED);

} with unit

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(vaultUnpackLambdaFunctionType)) of [
            Some(f) -> f(vaultLambdaAction, s)
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