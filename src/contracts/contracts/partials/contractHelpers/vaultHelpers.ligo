// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
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

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress: address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[lendingControllerAddress], error_ONLY_LENDING_CONTROLLER_CONTRACT_ALLOWED)

} with unit



// verify that collateral token is not protected
function verifyCollateralTokenIsNotProtected(const collateralTokenRecord : collateralTokenRecordType; const errorCode : nat) : unit is
block {

    if collateralTokenRecord.protected = True then failwith(errorCode) else skip;

} with unit



// verify that deposit is allowed
function verifyDepositAllowed(const isOwnerCheck : bool; const isAbleToDeposit : bool) : unit is
block {

    if isOwnerCheck = True or isAbleToDeposit = True 
    then skip 
    else failwith(error_NOT_AUTHORISED_TO_DEPOSIT_INTO_VAULT)

} with unit



// helper function to check sender is owner
function checkSenderIsOwner(const s : vaultStorageType) : bool is
block {

    var isOwnerCheck : bool := False;
    if Tezos.get_sender() = s.handle.owner then isOwnerCheck := True else isOwnerCheck := False;

} with isOwnerCheck



// helper function to check sender is a whitelisted depositor
function checkSenderIsWhitelistedDepositor(const s : vaultStorageType) : bool is
block {

    // check if sender is a whitelisted depositor
    // const isWhitelistedDepositorCheck : bool = case s.depositors of [
    //         Any                    -> True
    //     |   Whitelist(_depositors) -> _depositors contains Tezos.get_sender()
    // ];

    // const isAllowedToDeposit : bool = 
    // if s.depositors.depositorsConfig = "any" then True 
    // else if s.depositors.depositorsConfig = "whitelist" then {
    //     const isWhitelistedDepositor : bool = s.depositors.whitelistedDepositors contains Tezos.get_sender();
    // } with isWhitelistedDepositor
    // else False;

    const isAllowedToDeposit : bool = case s.depositors.depositorsConfig of [
            Any       -> True
        |   Whitelist -> s.depositors.whitelistedDepositors contains Tezos.get_sender()
    ];

} with isAllowedToDeposit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Misc Helper Functions Begin
// ------------------------------------------------------------------------------

// helper functions - conversions
function mutezToNatural(const amt : tez) : nat is amt / 1mutez;
function naturalToMutez(const amt : nat) : tez is amt * 1mutez;
function ceildiv(const numerator : nat; const denominator : nat) is abs( (- numerator) / (int (denominator)) );

// ------------------------------------------------------------------------------
// Misc Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to %registerDeposit entrypoint in the Lending Controller
function getRegisterDepositEntrypointInLendingController(const contractAddress : address) : contract(registerDepositActionType) is
    case (Tezos.get_entrypoint_opt(
        "%registerDeposit",
        contractAddress) : option(contract(registerDepositActionType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_REGISTER_DEPOSIT_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND) : contract(registerDepositActionType))
        ];



// helper function to %registerWithdrawal entrypoint in the vault controller
function getRegisterWithdrawalEntrypointInLendingController(const contractAddress : address) : contract(registerWithdrawalActionType) is
    case (Tezos.get_entrypoint_opt(
        "%registerWithdrawal",
        contractAddress) : option(contract(registerWithdrawalActionType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_REGISTER_WITHDRAWAL_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND) : contract(registerWithdrawalActionType))
        ];



// helper function to %delegateToSatellite entrypoint in the delegation contract
function getDelegateToSatelliteEntrypoint(const contractAddress : address) : contract(delegateToSatelliteType) is
    case (Tezos.get_entrypoint_opt(
        "%delegateToSatellite",
        contractAddress) : option(contract(delegateToSatelliteType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_DELEGATE_TO_SATELLITE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(delegateToSatelliteType))
        ]



// helper function to %update_operators entrypoint on a given token contract
function getUpdateTokenOperatorsEntrypoint(const tokenContractAddress : address) : contract(updateOperatorsType) is
    case (Tezos.get_entrypoint_opt(
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

    // Get Delegation Address from the General Contracts map on the Governance Contract
    const delegationAddress: address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    const delegateToSatelliteParams : delegateToSatelliteType = record [
        userAddress         = Tezos.get_self_address();
        satelliteAddress    = satelliteAddress;
    ];

    // Create delegate to satellite operation
    const delegateToSatelliteOperation : operation = Tezos.transaction(
        delegateToSatelliteParams,
        0tez,
        getDelegateToSatelliteEntrypoint(delegationAddress)
    );

} with delegateToSatelliteOperation



// helper function to create updateTokenOperators operation
function updateTokenOperatorsOperation(const updateOperatorsParams : updateOperatorsType; const tokenContractAddress : address) : operation is 
block {

    // Create operation to update operators in token contract
    const updateTokenOperatorsOperation : operation = Tezos.transaction(
        (updateOperatorsParams),
        0tez, 
        getUpdateTokenOperatorsEntrypoint(tokenContractAddress)
    );

} with updateTokenOperatorsOperation

// ------------------------------------------------------------------------------
// Operation Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Contract Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get break glass config from lending controller 
function getBreakGlassConfigFromLendingController(const s : vaultStorageType) : lendingControllerBreakGlassConfigType is 
block {

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress  : address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

    // get break glass config from lending controller
    const getBreakGlassConfigView : option (lendingControllerBreakGlassConfigType) = Tezos.call_view ("getBreakGlassConfig", unit, lendingControllerAddress);
    const breakGlassConfig : lendingControllerBreakGlassConfigType = case getBreakGlassConfigView of [
            Some (_breakGlassConfig) -> _breakGlassConfig
        |   None                     -> failwith(error_BREAK_GLASS_CONFIG_NOT_FOUND_IN_LENDING_CONTROLLER)
    ];

} with breakGlassConfig



// helper function to get collateral token record by name from Lending Controller through on-chain view
function getCollateralTokenRecordByName(const tokenName : string; const s : vaultStorageType) : collateralTokenRecordType is 
block {

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress  : address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

    // check collateral token contract address exists in Lending Controller collateral token ledger
    const getCollateralTokenRecordView : option (option(collateralTokenRecordType)) = Tezos.call_view ("getColTokenRecordByNameOpt", tokenName, lendingControllerAddress);
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
            Tez(_tez)   -> transferTez( (Tezos.get_contract_with_error(to_, "Error. Unable to send tez to vault.") : contract(unit)), amount * 1mutez)
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

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress  : address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

    // create register deposit params
    const registerDepositParams : registerDepositActionType = record [
        handle          = s.handle;
        amount          = amount;
        tokenName       = tokenName;
    ];
    
    // create operation to register deposit on the lending controller
    const registerDepositOperation : operation = Tezos.transaction(
        registerDepositParams,
        0mutez,
        getRegisterDepositEntrypointInLendingController(lendingControllerAddress)
    );

} with registerDepositOperation



// helper function to register withdrawal in lending controller
function registerWithdrawalInLendingController(const amount : nat; const tokenName : string; const s : vaultStorageType) : operation is 
block {

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress  : address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);

    // create register withdrawal params
    const registerWithdrawalParams : registerDepositActionType = record [
        handle          = s.handle;
        amount          = amount;
        tokenName       = tokenName;
    ];
    
    // create operation to register withdrawal on the lending controller
    const registerWithdrawalOperation : operation = Tezos.transaction(
        registerWithdrawalParams,
        0mutez,
        getRegisterWithdrawalEntrypointInLendingController(lendingControllerAddress)
    );

} with registerWithdrawalOperation

// ------------------------------------------------------------------------------
// Contract Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

// verify that %vaultDeposit is not paused
function verifyVaultDepositIsNotPaused(var s : vaultStorageType) : unit is
block {

    const breakGlassConfig : lendingControllerBreakGlassConfigType = getBreakGlassConfigFromLendingController(s);    
    verifyEntrypointIsNotPaused(breakGlassConfig.vaultDepositIsPaused, error_VAULT_DEPOSIT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED);

} with unit



// verify that vaultWithdraw is not paused in Lending Controller
function verifyVaultWithdrawIsNotPaused(var s : vaultStorageType) : unit is
block {

    const breakGlassConfig : lendingControllerBreakGlassConfigType = getBreakGlassConfigFromLendingController(s);    
    verifyEntrypointIsNotPaused(breakGlassConfig.vaultWithdrawIsPaused, error_VAULT_WITHDRAW_IN_LENDING_CONTROLLER_CONTRACT_PAUSED);

} with unit



// verify that vaultOnLiquidate is not paused in Lending Controller
function verifyVaultOnLiquidateIsNotPaused(var s : vaultStorageType) : unit is
block {

    const breakGlassConfig : lendingControllerBreakGlassConfigType = getBreakGlassConfigFromLendingController(s);    
    verifyEntrypointIsNotPaused(breakGlassConfig.vaultOnLiquidateIsPaused, error_VAULT_ON_LIQUIDATE_IN_LENDING_CONTROLLER_CONTRACT_PAUSED);

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