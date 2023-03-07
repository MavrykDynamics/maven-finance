// ------------------------------------------------------------------------------
//
// Vault Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Vault Lambdas Begin
// ------------------------------------------------------------------------------

(* depositXtz lambda *)
function lambdaDepositXtz(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {

    var operations : list(operation) := nil;

    case vaultLambdaAction of [
        |   LambdaDepositXtz(_params) -> {

                // init deposit operation params
                const amount     : nat        = (Tezos.get_amount() / 1mutez);
                const tokenName  : string     = "tez";

                // get collateral token record from Lending Controller through on-chain view
                const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenRecordByName(tokenName, s);

                // verify collateral token is not paused
                verifyCollateralTokenIsNotPaused(collateralTokenRecord);

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

                operations := registerDepositOperation # operations;

                // process deposit from sender to vault
                if Tezos.get_amount() = (amount * 1mutez) then skip else failwith(error_INCORRECT_COLLATERAL_TOKEN_AMOUNT_SENT);
                
            }   
        |   _ -> skip
    ];

} with (operations, s)



(* initVaultAction lambda *)
function lambdaInitVaultAction(const vaultLambdaAction : vaultLambdaActionType; var s : vaultStorageType) : return is
block {

    var operations : list(operation) := nil;

    case vaultLambdaAction of [
        |   LambdaInitVaultAction(initVaultAction) -> {

                case initVaultAction of [
                    |   DelegateTezOrMvk(delegateTezOrMvkParams) -> {

                            // verify sender is vault owner
                            verifySenderIsVaultOwner(s);

                            case delegateTezOrMvkParams of [
                                    Tez(optionKeyHash)     -> operations := Tezos.set_delegate(optionKeyHash) # operations
                                |   Mvk(satelliteAddress)  -> operations := delegateToSatelliteOperation(satelliteAddress, s) # operations
                            ]
                            
                        }
                    |   Deposit(depositParams) -> {

                            // verify that %deposit is not paused on Lending Controller
                            verifyVaultDepositIsNotPaused(s);

                            // init deposit operation params
                            const amount     : nat        = depositParams.amount;
                            const tokenName  : string     = depositParams.tokenName;

                            // get collateral token record from Lending Controller through on-chain view
                            const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenRecordByName(tokenName, s);

                            // verify that collateral token is not protected (e.g. cannot be staked MVK)
                            verifyCollateralTokenIsNotProtected(collateralTokenRecord, error_CANNOT_DEPOSIT_PROTECTED_COLLATERAL_TOKEN);

                            // verify collateral token is not paused
                            verifyCollateralTokenIsNotPaused(collateralTokenRecord);

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

                            operations := registerDepositOperation # operations;

                            // process deposit from sender to vault
                            if collateralTokenRecord.tokenName = "tez" then {
                                if Tezos.get_amount() = (amount * 1mutez) then skip else failwith(error_INCORRECT_COLLATERAL_TOKEN_AMOUNT_SENT);
                            } else {
                                const processVaultDepositOperation : operation = processVaultTransfer(
                                    Tezos.get_sender(),         // from_
                                    Tezos.get_self_address(),   // to_
                                    amount,                     // amount
                                    tokenType                   // tokenType
                                );
                                operations := processVaultDepositOperation # operations;
                            };
                            
                        }
                    |   Withdraw(withdrawParams) -> {

                            // verify that %withdraw is not paused on Lending Controller
                            verifyVaultWithdrawIsNotPaused(s);

                            // verify sender is vault owner
                            verifySenderIsVaultOwner(s);

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

                    |   OnLiquidate(onLiquidateParams) -> {

                            // verify that %onLiquidate is not paused on Lending Controller
                            verifyVaultOnLiquidateIsNotPaused(s);

                            verifySenderIsLendingControllerContract(s);

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

                    |   UpdateDepositor(updateDepositorParams) -> {

                            // verify sender is vault owner
                            verifySenderIsVaultOwner(s);

                            // if Any and is true, then value is Any; if Any and is false, then reset Whitelist to empty address set
                            // if Whitelist and bool is true, then add account to Whitelist set; else remove account from Whitelist set
                            const emptyWhitelistSet : set(address) = set[];
                            
                            const depositors : depositorsType = case updateDepositorParams.allowance of [
                                | Any(bool) -> if bool then Any else Whitelist(emptyWhitelistSet)
                                | Whitelist(_account) -> block {
                                    const updateDepositors : depositorsType = case s.depositors of [
                                        | Any                    -> failwith(error_SET_TO_ANY_DEPOSITORS_FIRST)
                                        | Whitelist(_depositors) -> Whitelist(if _account.0 then Set.add(_account.1, _depositors) else Set.remove(_account.1, _depositors))  
                                    ];
                                } with updateDepositors
                            ];
                            
                            // update depositors
                            s.depositors := depositors;

                        }
                    |   UpdateTokenOperators(updateTokenOperatorsParams) -> {

                            // verify sender is vault owner
                            verifySenderIsVaultOwner(s);

                            const tokenName         : string              = updateTokenOperatorsParams.tokenName;
                            const updateOperators   : updateOperatorsType = updateTokenOperatorsParams.updateOperators;

                            // get collateral token record from Lending Controller through on-chain view
                            const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenRecordByName(tokenName, s);
                            const collateralTokenContractAddress : address = collateralTokenRecord.tokenContractAddress;

                            // verify token is a staked token 
                            verifyCollateralTokenIsStakedToken(collateralTokenRecord);
                            
                            // Create operation to update operators in token contract
                            const updateTokenOperatorsOperation : operation = updateTokenOperatorsOperation(updateOperators, collateralTokenContractAddress);
                            operations := updateTokenOperatorsOperation # operations;

                        }
                    |   UpdateVaultName(newName) -> {

                            // verify sender is vault owner
                            verifySenderIsVaultOwner(s);

                            // get vault name max length from vault factory contract config
                            const vaultNameMaxLength : nat = getVaultNameMaxLength(s);

                            // validate new vault name string length
                            validateStringLength(newName, vaultNameMaxLength ,error_WRONG_INPUT_PROVIDED);

                            s.name := newName;
                        }
                ]
                
            }   
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
//
// Vault Lambdas End
//
// ------------------------------------------------------------------------------