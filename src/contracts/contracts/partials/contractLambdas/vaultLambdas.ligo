// ------------------------------------------------------------------------------
//
// Vault Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case vaultLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case vaultLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 
    
    case vaultLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);

            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vault Lambdas Begin
// ------------------------------------------------------------------------------

(* delegateTezToBaker lambda *)
function lambdaDelegateTezToBaker(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {

    var operations : list(operation) := nil;

    case vaultLambdaAction of [
        |   LambdaDelegateTezToBaker(delegateParams) -> {

                // check sender is vault owner
                checkSenderIsVaultOwner(s);
                
                // Create delegate to tez baker operation
                const delegateToTezBakerOperation : operation = Tezos.set_delegate(delegateParams);
                
                operations := delegateToTezBakerOperation # operations;
                
            }   
        |   _ -> skip
    ];

} with (operations, s)



(* delegateMvkToSatellite lambda *)
function lambdaDelegateMvkToSat(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {

    var operations : list(operation) := nil;

    case vaultLambdaAction of [
        |   LambdaDelegateMvkToSat(satelliteAddress) -> {

                // check sender is vault owner
                checkSenderIsVaultOwner(s);

                // Create delegate to satellite operation
                const delegateToSatelliteOperation : operation = delegateToSatelliteOperation(satelliteAddress, s);

                operations := delegateToSatelliteOperation # operations;
                
            }   
        |   _ -> skip
    ];

} with (operations, s)



(* deposit lambda *)
function lambdaDeposit(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {

    var operations : list(operation) := nil;

    case vaultLambdaAction of [
        |   LambdaDeposit(depositParams) -> {

                checkVaultDepositIsNotPaused(s);

                // init deposit operation params
                const amount     : nat        = depositParams.amount;
                const tokenName  : string     = depositParams.tokenName;

                // get collateral token record from Lending Controller through on-chain view
                const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenRecordByName(tokenName, s);

                // verify that collateral token is not protected (e.g. cannot be staked MVK)
                verifyCollateralTokenIsNotProtected(collateralTokenRecord, error_CANNOT_DEPOSIT_PROTECTED_COLLATERAL_TOKEN);

                // get collateral token's token type
                const tokenType : tokenType = collateralTokenRecord.tokenType;

                // check if sender is owner or a whitelisted depositor
                const isOwner : bool = checkSenderIsOwner(s);
                const isWhitelistedDepositor : bool = checkSenderIsWhitelistedDepositor(s);

                // verify that sender is either the vault owner or a whitelisted depositor
                verifyDepositAllowed(isOwner, isWhitelistedDepositor);
            
                // register deposit in Lending Controller
                const registerDepositOperation : operation = registerDepositInLendingController(
                    amount,       // amount
                    tokenName,    // tokenName
                    s             // storage
                );

                // process deposit from sender to vault
                const processVaultDepositOperation : operation = processVaultTransfer(
                    Tezos.get_sender(),         // from_
                    Tezos.get_self_address(),   // to_
                    amount,                     // amount
                    tokenType                   // tokenType
                );

                operations := list[
                    registerDepositOperation; 
                    processVaultDepositOperation
                ];

            
                
            }   
        |   _ -> skip
    ];

} with (operations, s)



(* withdraw lambda *)
function lambdaWithdraw(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {

    var operations : list(operation) := nil;

    case vaultLambdaAction of [
        |   LambdaWithdraw(withdrawParams) -> {

                // check that %withdraw is not paused on Lending Controller
                checkVaultWithdrawIsNotPaused(s);

                // check sender is vault owner
                checkSenderIsVaultOwner(s);

                // withdraw operation
                const amount     : nat        = withdrawParams.amount;
                const tokenName  : string     = withdrawParams.tokenName;

                // get collateral token record from Lending Controller through on-chain view
                const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenRecordByName(tokenName, s);

                // verify that collateral token is not protected (e.g. cannot be staked MVK)
                verifyCollateralTokenIsNotProtected(collateralTokenRecord, error_CANNOT_WITHDRAW_PROTECTED_COLLATERAL_TOKEN);

                // get collateral token's token type
                const tokenType : tokenType = collateralTokenRecord.tokenType;

                // register withdrawal in Lending Controller
                const registerWithdrawalOperation : operation = registerWithdrawalInLendingController(
                    amount,       // amount
                    tokenName,    // tokenName
                    s             // storage
                );

                // process withdrawal from vault to sender
                const processVaultWithdrawalOperation : operation = processVaultTransfer(
                    Tezos.get_self_address(),   // from_
                    Tezos.get_sender(),         // to_
                    amount,                     // amount
                    tokenType                   // tokenType
                );

                operations := list[
                    registerWithdrawalOperation;
                    processVaultWithdrawalOperation
                ];
            
            }   
        |   _ -> skip
    ];

} with (operations, s)



(* onLiquidate lambda *)
function lambdaOnLiquidate(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {

    var operations : list(operation) := nil;

    case vaultLambdaAction of [
        |   LambdaOnLiquidate(onLiquidateParams) -> {

                checkVaultOnLiquidateIsNotPaused(s);
                checkSenderIsLendingControllerContract(s);

                // onLiquidate operation
                const receiver   : address    = onLiquidateParams.receiver;
                const amount     : nat        = onLiquidateParams.amount;
                const tokenName  : string     = onLiquidateParams.tokenName;

                // get collateral token record from Lending Controller through on-chain view
                const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenRecordByName(tokenName, s);

                // get collateral token's token type
                const tokenType : tokenType = collateralTokenRecord.tokenType;

                // process withdrawal from vault to liquidator
                const processVaultWithdrawalOperation : operation = processVaultTransfer(
                    Tezos.get_self_address(),   // from_
                    receiver,                   // to_
                    amount,                     // amount
                    tokenType                   // tokenType
                );

                operations := processVaultWithdrawalOperation # operations;

            }   
        |   _ -> skip
    ];

} with (operations, s)



(* updateDepositor lambda *)
function lambdaUpdateDepositor(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {

    case vaultLambdaAction of [
        |   LambdaUpdateDepositor(updateDepositorParams) -> {

                // check sender is vault owner
                checkSenderIsVaultOwner(s);

                // if AllowAny and is true, then value is Any; if AllowAny and is false, then reset Whitelist to empty address set
                // if AllowAccount and bool is true, then add account to Whitelist set; else remove account from Whitelist set
                const emptyWhitelistSet : set(address) = set[];
                const depositors : depositorsType = case updateDepositorParams.allowance of [
                    | AllowAny(_allow) -> if _allow then Any else Whitelist(emptyWhitelistSet)
                    | AllowAccount(_account) -> block {
                        const updateDepositors : depositorsType = case s.depositors of [
                            | Any -> failwith("Error. Set any off first")
                            | Whitelist(_depositors) -> Whitelist(if _account.0 then Set.add(_account.1, _depositors) else Set.remove(_account.1, _depositors))  
                        ];
                    } with updateDepositors
                ];
                
                // update depositors
                s.depositors := depositors;


            }   
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateMvkOperators lambda *)
function lambdaUpdateMvkOperators(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is 
block {

    // Steps Overview:
    // 1. Check if sender is vault owner
    // 2. Update operators of Vault Contract on the MVK Token contract 
    //    - required to set Doorman Contract as an operator for staking/unstaking 

    checkSenderIsVaultOwner(s);

    var operations : list(operation) := nil;

    case vaultLambdaAction of [
        |   LambdaUpdateMvkOperators(updateOperatorsParams) -> {
                
                // Create operation to update operators in MVK token contract
                const updateMvkOperatorsOperation : operation = updateMvkOperatorsOperation(updateOperatorsParams, s);
                operations := updateMvkOperatorsOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



// ------------------------------------------------------------------------------
//
// Vault Lambdas End
//
// ------------------------------------------------------------------------------