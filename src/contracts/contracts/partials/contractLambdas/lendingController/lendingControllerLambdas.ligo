// ------------------------------------------------------------------------------
//
// Lending Controller Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // Check that sender is admin or the Governance Contract address

    case lendingControllerLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // Check that sender is admin or the Governance Contract address

    case lendingControllerLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateConfig lambda *)
function lambdaUpdateConfig(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is 
block {

    checkSenderIsAdmin(s); // Check that sender is admin 

    case lendingControllerLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : lendingControllerUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : lendingControllerUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                        ConfigCollateralRatio (_v)          -> s.config.collateralRatio                 := updateConfigNewValue
                    |   ConfigLiquidationRatio (_v)         -> s.config.liquidationRatio                := updateConfigNewValue
                    |   ConfigLiquidationFeePercent (_v)    -> s.config.liquidationFeePercent           := updateConfigNewValue
                    |   ConfigAdminLiquidationFee (_v)      -> s.config.adminLiquidationFeePercent      := updateConfigNewValue
                    |   ConfigMinimumLoanFeePercent (_v)    -> s.config.minimumLoanFeePercent           := updateConfigNewValue
                    |   ConfigMinLoanFeeTreasuryShare (_v)  -> s.config.minimumLoanFeeTreasuryShare     := updateConfigNewValue
                    |   ConfigInterestTreasuryShare (_v)    -> s.config.interestTreasuryShare           := updateConfigNewValue
                ];
            }
        |   _ -> skip
    ];
  
} with (noOperations, s)



(* updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s: lendingControllerStorageType) : return is
block {

    checkSenderIsAdmin(s); // Check that sender is admin 

    case lendingControllerLambdaAction of [
        |   LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams) -> {
                s.whitelistTokenContracts := updateWhitelistTokenContractsMap(updateWhitelistTokenContractsParams, s.whitelistTokenContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(* pauseAll lambda *)
function lambdaPauseAll(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is from Admin or the the Governance Contract
    // 2. Pause all main entrypoints in the Delegation Contract
    
    checkSenderIsAllowed(s); // Check that sender is admin or the Governance Contract address

    case lendingControllerLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
                
                // Lending Controller Admin Entrypoints
                if s.breakGlassConfig.setLoanTokenIsPaused then skip
                else s.breakGlassConfig.setLoanTokenIsPaused := True;

                if s.breakGlassConfig.setCollateralTokenIsPaused then skip
                else s.breakGlassConfig.setCollateralTokenIsPaused := True;

                if s.breakGlassConfig.registerVaultCreationIsPaused then skip
                else s.breakGlassConfig.registerVaultCreationIsPaused := True;


                // Lending Controller Token Pool Entrypoints
                if s.breakGlassConfig.addLiquidityIsPaused then skip
                else s.breakGlassConfig.addLiquidityIsPaused := True;

                if s.breakGlassConfig.removeLiquidityIsPaused then skip
                else s.breakGlassConfig.removeLiquidityIsPaused := True;


                // Lending Controller Vault Entrypoints
                if s.breakGlassConfig.closeVaultIsPaused then skip
                else s.breakGlassConfig.closeVaultIsPaused := True;

                if s.breakGlassConfig.registerDepositIsPaused then skip
                else s.breakGlassConfig.registerDepositIsPaused := True;

                if s.breakGlassConfig.registerWithdrawalIsPaused then skip
                else s.breakGlassConfig.registerWithdrawalIsPaused := True;

                if s.breakGlassConfig.markForLiquidationIsPaused then skip
                else s.breakGlassConfig.markForLiquidationIsPaused := True;

                if s.breakGlassConfig.liquidateVaultIsPaused then skip
                else s.breakGlassConfig.liquidateVaultIsPaused := True;

                if s.breakGlassConfig.borrowIsPaused then skip
                else s.breakGlassConfig.borrowIsPaused := True;

                if s.breakGlassConfig.repayIsPaused then skip
                else s.breakGlassConfig.repayIsPaused := True;


                // Vault Entrypoints
                if s.breakGlassConfig.vaultDepositIsPaused then skip
                else s.breakGlassConfig.vaultDepositIsPaused := True;

                if s.breakGlassConfig.vaultWithdrawIsPaused then skip
                else s.breakGlassConfig.vaultWithdrawIsPaused := True;

                if s.breakGlassConfig.vaultOnLiquidateIsPaused then skip
                else s.breakGlassConfig.vaultOnLiquidateIsPaused := True;


                // Vault Staked MVK Entrypoints
                if s.breakGlassConfig.vaultDepositStakedMvkIsPaused then skip
                else s.breakGlassConfig.vaultDepositStakedMvkIsPaused := True;

                if s.breakGlassConfig.vaultWithdrawStakedMvkIsPaused then skip
                else s.breakGlassConfig.vaultWithdrawStakedMvkIsPaused := True;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* unpauseAll lambda *)
function lambdaUnpauseAll(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is from Admin or the the Governance Contract
    // 2. Unpause all main entrypoints in the Delegation Contract

    checkSenderIsAllowed(s); // Check that sender is admin or the Governance Contract address

    // set all pause configs to False
    case lendingControllerLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
            
                // Lending Controller Admin Entrypoints
                if s.breakGlassConfig.setLoanTokenIsPaused then s.breakGlassConfig.setLoanTokenIsPaused := False
                else skip;

                if s.breakGlassConfig.setCollateralTokenIsPaused then s.breakGlassConfig.setCollateralTokenIsPaused := False
                else skip;

                if s.breakGlassConfig.registerVaultCreationIsPaused then s.breakGlassConfig.registerVaultCreationIsPaused := False
                else skip;


                // Lending Controller Token Pool Entrypoints
                if s.breakGlassConfig.addLiquidityIsPaused then s.breakGlassConfig.addLiquidityIsPaused := False
                else skip;

                if s.breakGlassConfig.removeLiquidityIsPaused then s.breakGlassConfig.removeLiquidityIsPaused := False
                else skip;


                // Lending Controller Vault Entrypoints
                if s.breakGlassConfig.closeVaultIsPaused then s.breakGlassConfig.closeVaultIsPaused := False
                else skip;

                if s.breakGlassConfig.registerDepositIsPaused then s.breakGlassConfig.registerDepositIsPaused := False
                else skip;

                if s.breakGlassConfig.registerWithdrawalIsPaused then s.breakGlassConfig.registerWithdrawalIsPaused := False
                else skip;

                if s.breakGlassConfig.markForLiquidationIsPaused then s.breakGlassConfig.markForLiquidationIsPaused := False
                else skip;

                if s.breakGlassConfig.liquidateVaultIsPaused then s.breakGlassConfig.liquidateVaultIsPaused := False
                else skip;

                if s.breakGlassConfig.borrowIsPaused then s.breakGlassConfig.borrowIsPaused := False
                else skip;

                if s.breakGlassConfig.repayIsPaused then s.breakGlassConfig.repayIsPaused := False
                else skip;


                // Vault Entrypoints
                if s.breakGlassConfig.vaultDepositIsPaused then s.breakGlassConfig.vaultDepositIsPaused := False
                else skip;

                if s.breakGlassConfig.vaultWithdrawIsPaused then s.breakGlassConfig.vaultWithdrawIsPaused := False
                else skip;

                if s.breakGlassConfig.vaultOnLiquidateIsPaused then s.breakGlassConfig.vaultOnLiquidateIsPaused := False
                else skip;


                // Vault Staked MVK Entrypoints
                if s.breakGlassConfig.vaultDepositStakedMvkIsPaused then s.breakGlassConfig.vaultDepositStakedMvkIsPaused := False
                else skip;

                if s.breakGlassConfig.vaultWithdrawStakedMvkIsPaused then s.breakGlassConfig.vaultWithdrawStakedMvkIsPaused := False
                else skip;
            
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin
    // 2. Pause or unpause entrypoint depending on boolean parameter sent 

    checkSenderIsAdmin(s); // Check that sender is admin

    case lendingControllerLambdaAction of [
        |   LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [

                        // Lending Controller Admin Entrypoints
                    |   SetLoanToken (_v)                    -> s.breakGlassConfig.setLoanTokenIsPaused                  := _v
                    |   SetCollateralToken (_v)              -> s.breakGlassConfig.setCollateralTokenIsPaused            := _v
                    |   RegisterVaultCreation (_v)           -> s.breakGlassConfig.registerVaultCreationIsPaused         := _v

                        // Lending Controller Token Pool Entrypoints
                    |   AddLiquidity (_v)                    -> s.breakGlassConfig.addLiquidityIsPaused                  := _v
                    |   RemoveLiquidity (_v)                 -> s.breakGlassConfig.removeLiquidityIsPaused               := _v

                        // Lending Controller Vault Entrypoints
                    |   CloseVault (_v)                      -> s.breakGlassConfig.closeVaultIsPaused                    := _v
                    |   RegisterDeposit (_v)                 -> s.breakGlassConfig.registerDepositIsPaused               := _v
                    |   RegisterWithdrawal (_v)              -> s.breakGlassConfig.registerWithdrawalIsPaused            := _v
                    |   MarkForLiquidation (_v)              -> s.breakGlassConfig.markForLiquidationIsPaused            := _v
                    |   LiquidateVault (_v)                  -> s.breakGlassConfig.liquidateVaultIsPaused                := _v
                    |   Borrow (_v)                          -> s.breakGlassConfig.borrowIsPaused                        := _v
                    |   Repay (_v)                           -> s.breakGlassConfig.repayIsPaused                         := _v

                        // Vault Entrypoints
                    |   VaultDeposit (_v)                    -> s.breakGlassConfig.vaultDepositIsPaused                  := _v
                    |   VaultWithdraw (_v)                   -> s.breakGlassConfig.vaultWithdrawIsPaused                 := _v
                    |   VaultOnLiquidate (_v)                -> s.breakGlassConfig.vaultOnLiquidateIsPaused              := _v

                        // Vault Staked MVK Entrypoints
                    |   VaultDepositStakedMvk (_v)           -> s.breakGlassConfig.vaultDepositStakedMvkIsPaused         := _v
                    |   VaultWithdrawStakedMvk (_v)          -> s.breakGlassConfig.vaultWithdrawStakedMvkIsPaused        := _v

                ]
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)


// ------------------------------------------------------------------------------
// Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Admin Lambdas Begin
// ------------------------------------------------------------------------------

(* setLoanToken lambda *)
function lambdaSetLoanToken(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    // Steps Overview: 
    // 1. Access Checks 
    //      -   Check that %setLoanToken entrypoint is not paused (e.g. glass broken)
    //      -   Check that sender is admin (Governance Proxy)
    //      -   Check that no tez is sent
    // 2a. If variant is CreateLoanToken
    //      -   Check if loan token already exists
    //      -   Update loan token ledger with new loan token record
    // 2b. If variant is UpdateLoanToken
    //      -   Get loan token record if exists
    //      -   Update and save loan token record with new parameters


    checkNoAmount(Unit);                // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s);              // Check that sender is admin
    checkSetLoanTokenIsNotPaused(s);    // Check that %setLoanToken entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaSetLoanToken(setLoanTokenParams) -> {

                case setLoanTokenParams.action of [
                    |   CreateLoanToken(createLoanTokenParams) -> block {

                            // Check if loan token already exists
                            if Map.mem(createLoanTokenParams.tokenName, s.loanTokenLedger) then failwith(error_LOAN_TOKEN_ALREADY_EXISTS) else skip;
                            
                            // update loan token ledger
                            s.loanTokenLedger[createLoanTokenParams.tokenName] := createLoanTokenRecord(createLoanTokenParams);

                        }
                    |   UpdateLoanToken(updateLoanTokenParams) -> block{

                            const loanTokenName : string = updateLoanTokenParams.tokenName;

                            var loanTokenRecord : loanTokenRecordType := case s.loanTokenLedger[loanTokenName] of [
                                    Some(_record) -> _record
                                |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
                            ];

                            loanTokenRecord.oracleAddress                        := updateLoanTokenParams.oracleAddress;

                            loanTokenRecord.reserveRatio                         := updateLoanTokenParams.reserveRatio;
                            loanTokenRecord.optimalUtilisationRate               := updateLoanTokenParams.optimalUtilisationRate;
                            loanTokenRecord.baseInterestRate                     := updateLoanTokenParams.baseInterestRate;
                            loanTokenRecord.maxInterestRate                      := updateLoanTokenParams.maxInterestRate;
                            loanTokenRecord.interestRateBelowOptimalUtilisation  := updateLoanTokenParams.interestRateBelowOptimalUtilisation;
                            loanTokenRecord.interestRateAboveOptimalUtilisation  := updateLoanTokenParams.interestRateAboveOptimalUtilisation;
                            loanTokenRecord.minRepaymentAmount                   := updateLoanTokenParams.minRepaymentAmount;
                            
                            // update storage
                            s.loanTokenLedger[loanTokenName] := loanTokenRecord;

                        }
                ];

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* setCollateralToken lambda *)
function lambdaSetCollateralToken(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s: lendingControllerStorageType) : return is
block {

    // Steps Overview: 
    // 1. Access Checks 
    //      -   Check that %setCollateralToken entrypoint is not paused (e.g. glass broken)
    //      -   Check that sender is admin (Governance Proxy)
    //      -   Check that no tez is sent
    // 2a. If variant is CreateCollateralToken
    //      -   Check if collateral token already exists
    //      -   Update collateral token ledger with new collateral token record
    // 2b. If variant is UpdateCollateralToken
    //      -   Get collateral token record if exists
    //      -   Update and save collateral token record with new parameters

    checkNoAmount(Unit);                      // entrypoint should not receive any tez amount  
    checkSenderIsAdmin(s);                    // Check that sender is admin 
    checkSetCollateralTokenIsNotPaused(s);    // Check that %setCollateralToken entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaSetCollateralToken(setCollateralTokenParams) -> {

                case setCollateralTokenParams.action of [
                    |   CreateCollateralToken(createCollateralTokenParams) -> block {

                            // Check if collateral token already exists
                            if Map.mem(createCollateralTokenParams.tokenName, s.collateralTokenLedger) then failwith(error_COLLATERAL_TOKEN_ALREADY_EXISTS) else skip;

                            // update collateral token ledger
                            s.collateralTokenLedger[createCollateralTokenParams.tokenName] := createCollateralTokenRecord(createCollateralTokenParams);

                        }
                    |   UpdateCollateralToken(updateCollateralTokenParams) -> block{

                            const collateralTokenName : string = updateCollateralTokenParams.tokenName;
                    
                            var collateralTokenRecord : collateralTokenRecordType := getCollateralTokenRecord(collateralTokenName, s);

                            collateralTokenRecord.oracleAddress := updateCollateralTokenParams.oracleAddress;

                            // update storage
                            s.collateralTokenLedger[collateralTokenName] := collateralTokenRecord;

                        }
                ];

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* registerVaultCreation lambda *)
function lambdaRegisterVaultCreation(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {

    // Steps Overview: 
    // 1. Check that %registerVaultCreation entrypoint is not paused (e.g. glass broken)
    // 2. Check that sender is from the vault factory contract
    // 3. Get loan token record and update loan token state to get the latest stats - utilisation rate, interest rate, compounded interest, and borrow index
    // 4. Create and save vault record with vault handle as key
    // 5. Add new vault to owner's vault set
    
    var operations : list(operation) := nil;
    checkRegisterVaultCreationIsNotPaused(s);    // Check that %registerVaultCreation entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaRegisterVaultCreation(registerVaultCreationParams) -> {

                // Check sender is vault factory contract
                checkSenderIsVaultFactoryContract(s);

                // init params
                const vaultOwner     : address = registerVaultCreationParams.vaultOwner;
                const vaultId        : nat     = registerVaultCreationParams.vaultId;
                const vaultAddress   : address = registerVaultCreationParams.vaultAddress;
                const loanTokenName  : string  = registerVaultCreationParams.loanTokenName;

                // Make vault handle
                const handle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // Get loan token record
                var loanTokenRecord : loanTokenRecordType := getLoanTokenRecord(loanTokenName, s);

                // Update Loan Token State: Latest utilisation rate, current interest rate, compounded interest and borrow index
                loanTokenRecord := updateLoanTokenState(loanTokenRecord);

                // Get borrow index of token
                const tokenBorrowIndex : nat = loanTokenRecord.borrowIndex;
                
                // init empty collateral balance ledger map
                var collateralBalanceLedgerMap : collateralBalanceLedgerType := map[];
                
                // Create vault record
                const vault : vaultRecordType = createVaultRecord(
                    vaultAddress,                   // vault address
                    collateralBalanceLedgerMap,     // collateral balance ledger
                    loanTokenRecord.tokenName,      // loan token name
                    loanTokenRecord.tokenDecimals,  // loan token decimals
                    tokenBorrowIndex                // token borrow index
                );
                
                // update controller storage with new vault
                s.vaults := Big_map.update(handle, Some(vault), s.vaults);

                // add new vault to owner's vault set
                var ownerVaultSet : ownerVaultSetType := case s.ownerLedger[vaultOwner] of [
                        Some (_set) -> _set
                    |   None        -> set []
                ];
                s.ownerLedger[vaultOwner] := Set.add(vaultId, ownerVaultSet);

            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Admin Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Token Pool Lambdas Begin
// ------------------------------------------------------------------------------

(* addLiquidity lambda *)
function lambdaAddLiquidity(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {

    // Steps Overview: 
    // 1. Check that %addLiquidity entrypoint is not paused (e.g. glass broken)
    // 2. Process add liquidity operation
    //      -   Get loan token record
    //      -   Send tokens to token pool / lending controller (i.e. self address)
    //      -   Mint LP tokens and send to user (at a 1-to-1 ratio)
    //      -   Update loan token state with new totals to get the latest stats - utilisation rate, interest rate, compounded interest, and borrow index
    // 3. Get or create user's current token pool deposit balance 
    // 4. Update user rewards (based on user's current token pool deposit balance, and not the updated balance)
    
    // init operations
    var operations : list(operation) := nil;
    checkAddLiquidityIsNotPaused(s);    // Check that %addLiquidity entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaAddLiquidity(addLiquidityParams) -> {
                
                // init variables for convenience
                const loanTokenName       : string              = addLiquidityParams.loanTokenName;
                const amount              : nat                 = addLiquidityParams.amount;
                const initiator           : address             = Tezos.get_sender();

                // Get loan token record
                var loanTokenRecord : loanTokenRecordType := getLoanTokenRecord(loanTokenName, s);

                // update pool totals
                loanTokenRecord.tokenPoolTotal   := loanTokenRecord.tokenPoolTotal + amount;
                loanTokenRecord.lpTokensTotal    := loanTokenRecord.lpTokensTotal + amount;
                loanTokenRecord.totalRemaining   := loanTokenRecord.totalRemaining + amount;

                // send tokens to token pool (self address) operation
                const sendTokensToTokenPoolOperation : operation = tokenPoolTransfer(
                    initiator,                  // from_
                    Tezos.get_self_address(),   // to_    
                    amount,                     // amount
                    loanTokenRecord.tokenType   // token type (e.g. tez, fa12, fa2)
                );
                operations := sendTokensToTokenPoolOperation # operations;

                // mint LP Tokens and send to sender
                const mintLpTokensTokensOperation : operation = mintOrBurnLpToken(initiator, int(amount), loanTokenRecord.lpTokenContractAddress);
                operations := mintLpTokensTokensOperation # operations;

                // Update Loan Token State: Latest utilisation rate, current interest rate, compounded interest and borrow index
                loanTokenRecord := updateLoanTokenState(loanTokenRecord);

                // Update Token Ledger
                s.loanTokenLedger[loanTokenName] := loanTokenRecord;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* removeLiquidity lambda *)
function lambdaRemoveLiquidity(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {

    // Steps Overview: 
    // 1. Check that %removeLiquidity entrypoint is not paused (e.g. glass broken)
    // 2. Check that no tez is sent
    // 2. Process remove liquidity operation
    //      -   Get loan token record
    //      -   Send tokens from token pool / lending controller (i.e. self address) to user
    //      -   Burn LP tokens from user (at a 1-to-1 ratio)
    //      -   Update loan token state with new totals to get the latest stats - utilisation rate, interest rate, compounded interest, and borrow index
    // 3. Get or create user's current token pool deposit balance 
    // 4. Update user rewards (based on user's current token pool deposit balance, and not the updated balance)
    
    checkNoAmount(Unit);                   // entrypoint should not receive any tez amount  
    checkRemoveLiquidityIsNotPaused(s);    // Check that %removeLiquidity entrypoint is not paused (e.g. if glass broken)

    // init operations
    var operations : list(operation) := nil;

    case lendingControllerLambdaAction of [
        |   LambdaRemoveLiquidity(removeLiquidityParams) -> {
                
                // init variables for convenience
                const loanTokenName         : string    = removeLiquidityParams.loanTokenName;
                const amount                : nat       = removeLiquidityParams.amount;
                const initiator             : address   = Tezos.get_sender();

                // Get loan token record
                var loanTokenRecord : loanTokenRecordType := getLoanTokenRecord(loanTokenName, s);
                
                const loanTokenType             : tokenType   = loanTokenRecord.tokenType;
                const loanTokenPoolTotal        : nat         = loanTokenRecord.tokenPoolTotal;
                const loanTotalRemaining        : nat         = loanTokenRecord.totalRemaining;
                
                const lpTokenContractAddress    : address     = loanTokenRecord.lpTokenContractAddress;
                const lpTokensTotal             : nat         = loanTokenRecord.lpTokensTotal;
                const lpTokensBurned            : nat         = amount;

                // Calculate new total of LP Tokens
                if lpTokensBurned > lpTokensTotal then failwith(error_CANNOT_BURN_MORE_THAN_TOTAL_AMOUNT_OF_LP_TOKENS) else skip;
                const newLpTokensTotal : nat = abs(lpTokensTotal - lpTokensBurned);

                // Calculate new token pool amount
                if amount > loanTokenPoolTotal then failwith(error_TOKEN_POOL_TOTAL_CANNOT_BE_NEGATIVE) else skip;
                const newTokenPoolTotal : nat = abs(loanTokenPoolTotal - amount);

                // Calculate new token pool remaining
                if amount > loanTotalRemaining then failwith(error_TOKEN_POOL_REMAINING_CANNOT_BE_NEGATIVE) else skip;
                const newTotalRemaining : nat = abs(loanTotalRemaining - amount);

                // burn LP Tokens and send to sender
                const burnLpTokensTokensOperation : operation = mintOrBurnLpToken(initiator, 0n - amount, lpTokenContractAddress);
                operations := burnLpTokensTokensOperation # operations;

                // send tokens from token pool to initiator
                const sendTokensToInitiatorOperation : operation = tokenPoolTransfer(
                    Tezos.get_self_address(),   // from_
                    initiator,                  // to_    
                    amount,                     // amount
                    loanTokenType               // token type (e.g. tez, fa12, fa2)
                );
                operations := sendTokensToInitiatorOperation # operations;

                // update pool totals
                loanTokenRecord.tokenPoolTotal   := newTokenPoolTotal;
                loanTokenRecord.lpTokensTotal    := newLpTokensTotal;
                loanTokenRecord.totalRemaining   := newTotalRemaining;

                // Update Loan Token State: Latest utilisation rate, current interest rate, compounded interest and borrow index
                loanTokenRecord := updateLoanTokenState(loanTokenRecord);

                // Update Token Ledger
                s.loanTokenLedger[loanTokenName] := loanTokenRecord;

            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Token Pool Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vault Lambdas Begin
// ------------------------------------------------------------------------------

(* closeVault lambda *)
function lambdaCloseVault(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation) := nil;
    checkCloseVaultIsNotPaused(s);    // Check that %closeVault entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaCloseVault(closeVaultParams) -> {
                
                // only the vault owner can close his own vault

                // init parameters 
                const vaultId     : vaultIdType      = closeVaultParams.vaultId;
                const vaultOwner  : vaultOwnerType   = Tezos.get_sender();

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // Get vault if exists
                var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);

                const vaultAddress : address = vault.address;

                // Check that vault has zero loan outstanding
                checkZeroLoanOutstanding(vault);

                // get tokens and token balances and initiate transfer back to the vault owner
                for collateralTokenName -> collateralTokenBalance in map vault.collateralBalanceLedger block {
                    
                    // init final token balance var
                    var finalTokenBalance  : nat := collateralTokenBalance;
                    
                    if collateralTokenName = "tez" then block {

                        const transferTezOperation : operation = transferTez( (Tezos.get_contract_with_error(vaultOwner, "Error. Unable to send tez.") : contract(unit)), finalTokenBalance * 1mutez );
                        operations := transferTezOperation # operations;

                        vault.collateralBalanceLedger[collateralTokenName]  := 0n;
                        
                    } else block {

                        const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenReference(collateralTokenName, s);

                        if collateralTokenName = "smvk" then {

                            // get user staked balance from doorman contract (includes unclaimed exit fee rewards, does not include satellite rewards)
                            // - for better accuracy, there should be a frontend call to compound rewards for the vault first
                            finalTokenBalance := getUserStakedMvkBalanceFromDoorman(vaultAddress, s);

                            // for special case of sMVK
                            const withdrawAllStakedMvkOperation : operation = onWithdrawStakedMvkFromVaultOperation(
                                vaultOwner,                         // vault owner
                                vaultAddress,                       // vault address
                                finalTokenBalance,                  // withdraw amount
                                s                                   // storage
                            );

                            operations := withdrawAllStakedMvkOperation # operations;

                        } else if collateralTokenRecord.isScaledToken then {

                            // for scaled tokens
                            
                            // get updated scaled token balance (e.g. mToken)
                            finalTokenBalance := getBalanceFromScaledTokenContract(vaultAddress, collateralTokenRecord.tokenContractAddress);

                            // for other collateral token types besides sMVK and scaled tokens
                            const withdrawTokenOperation : operation = liquidateFromVaultOperation(
                                vaultOwner,                         // to_
                                collateralTokenName,                // token name
                                finalTokenBalance,                  // token amount to be withdrawn
                                collateralTokenRecord.tokenType,    // token type (i.e. tez, fa12, fa2) 
                                vaultAddress                        // vault address
                            );
                            operations := withdrawTokenOperation # operations;

                        } else {

                            // for other collateral token types besides sMVK and scaled tokens
                            const withdrawTokenOperation : operation = liquidateFromVaultOperation(
                                vaultOwner,                         // to_
                                collateralTokenName,                // token name
                                finalTokenBalance,                  // token amount to be withdrawn
                                collateralTokenRecord.tokenType,    // token type (i.e. tez, fa12, fa2) 
                                vaultAddress                        // vault address
                            );
                            operations := withdrawTokenOperation # operations;

                        };

                        // save and update balance for collateral token to zero
                        vault.collateralBalanceLedger[collateralTokenName]  := 0n;

                    }; // end if/else check for tez/token

                }; // end loop for withdraw operations of tez/tokens in vault collateral 


                // remove vault from stroage
                var ownerVaultSet : ownerVaultSetType := case s.ownerLedger[vaultOwner] of [
                        Some (_set) -> _set
                    |   None        -> failwith(error_OWNER_VAULT_SET_DOES_NOT_EXIST)
                ];

                s.ownerLedger[vaultOwner] := Set.remove(vaultId, ownerVaultSet);
                remove vaultHandle from map s.vaults;
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(* markForLiquidation lambda *)
function lambdaMarkForLiquidation(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {

    var operations : list(operation) := nil;
    checkMarkForLiquidationIsNotPaused(s);    // Check that %markForLiquidation entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaMarkForLiquidation(markForLiquidationParams) -> {
                
                // anyone can mark a vault for liquidation

                // init parameters 
                const vaultId     : vaultIdType      = markForLiquidationParams.vaultId;
                const vaultOwner  : vaultOwnerType   = markForLiquidationParams.vaultOwner;

                const currentBlockLevel             : nat = Tezos.get_level();
                const configLiquidationDelayInMins  : nat = s.config.liquidationDelayInMins;
                const configLiquidationMaxDuration  : nat = s.config.liquidationMaxDuration;
                const blocksPerMinute               : nat = 60n / Tezos.get_min_block_time();

                const liquidationDelayInBlockLevel  : nat = configLiquidationDelayInMins * blocksPerMinute;                 
                const liquidationEndLevel           : nat = currentBlockLevel + (configLiquidationMaxDuration * blocksPerMinute);                 

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // ------------------------------------------------------------------
                // Update vault state
                // ------------------------------------------------------------------

                const updatedVaultState : (vaultRecordType*loanTokenRecordType) = updateVaultState(vaultHandle, s);
                var vault               : vaultRecordType                       := updatedVaultState.0;
                var loanTokenRecord     : loanTokenRecordType                   := updatedVaultState.1;

                // ------------------------------------------------------------------
                // Update Storage (Vault and Loan Token)
                // ------------------------------------------------------------------

                // update loan token record storage                
                s.loanTokenLedger[vault.loanToken]   := loanTokenRecord;


                const vaultIsLiquidatable : bool = isLiquidatable(vault, s);

                // Update vault
                s.vaults[vaultHandle] := vault;
                
                // ------------------------------------------------------------------
                // Check if vault is liquidatable
                // ------------------------------------------------------------------
                
                // Check if vault is liquidatable
                if vaultIsLiquidatable then block {

                    // get level when vault can be liquidated
                    const levelWhenVaultCanBeLiquidated  : nat = vault.markedForLiquidationLevel + liquidationDelayInBlockLevel;

                    // Check if vault has already been marked for liquidation, if not set markedForLiquidation timestamp
                    if currentBlockLevel < levelWhenVaultCanBeLiquidated 
                    then failwith(error_VAULT_HAS_ALREADY_BEEN_MARKED_FOR_LIQUIDATION)
                    else {
                        vault.markedForLiquidationLevel  := currentBlockLevel;
                        vault.liquidationEndLevel        := liquidationEndLevel;
                    };

                    // Update vault storage
                    s.vaults[vaultHandle] := vault;

                } else failwith(error_VAULT_IS_NOT_LIQUIDATABLE);                

            }
        |   _ -> skip
    ];

} with (operations, s)



(* liquidateVault lambda *)
function lambdaLiquidateVault(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation) := nil;
    checkLiquidateVaultIsNotPaused(s);    // Check that %liquidateVault entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaLiquidateVault(liquidateVaultParams) -> {
                
                // init variables
                const vaultId            : nat       = liquidateVaultParams.vaultId;
                const vaultOwner         : address   = liquidateVaultParams.vaultOwner;
                const amount             : nat       = liquidateVaultParams.amount;
                const liquidator         : address   = Tezos.get_sender();

                // Get Treasury Address from the General Contracts map on the Governance Contract
                const treasuryAddress           : address = getContractAddressFromGovernanceContract("lendingTreasury", s.governanceAddress, error_TREASURY_CONTRACT_NOT_FOUND);

                // ------------------------------------------------------------------
                // Get Vault record and parameters
                // ------------------------------------------------------------------

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // Update vault state
                const updatedVaultState : (vaultRecordType*loanTokenRecordType) = updateVaultState(vaultHandle, s);
                var vault               : vaultRecordType                       := updatedVaultState.0;
                var loanTokenRecord     : loanTokenRecordType                   := updatedVaultState.1;
                const vaultAddress      : address                               = vault.address;

                // init vault parameters
                const vaultLoanTokenName            : string    = vault.loanToken;

                // ------------------------------------------------------------------
                // Check correct duration has passed after being marked for liquidation
                // ------------------------------------------------------------------

                checkMarkedVaultLiquidationDuration(vault, s);

                // ------------------------------------------------------------------
                // Check that vault is still within window of opportunity for liquidation to occur
                // ------------------------------------------------------------------

                checkVaultInLiquidationWindow(vault);

                // ------------------------------------------------------------------
                // Get Loan Token variables
                // ------------------------------------------------------------------

                // Get loan token parameters
                const tokenPoolTotal      : nat         = loanTokenRecord.tokenPoolTotal;
                const totalBorrowed       : nat         = loanTokenRecord.totalBorrowed;
                const totalRemaining      : nat         = loanTokenRecord.totalRemaining;
                const loanTokenDecimals   : nat         = loanTokenRecord.tokenDecimals;
                const loanTokenType       : tokenType   = loanTokenRecord.tokenType;
                const accRewardsPerShare  : nat         = loanTokenRecord.accumulatedRewardsPerShare;

                // Get loan token price
                const loanTokenLastCompletedData  : lastCompletedDataReturnType = getTokenLastCompletedDataFromAggregator(loanTokenRecord.oracleAddress);
                
                // ------------------------------------------------------------------
                // Check if vault is liquidatable
                // ------------------------------------------------------------------

                const vaultIsLiquidatable : bool = isLiquidatable(vault, s);

                // fail if vault is not liquidatable
                if vaultIsLiquidatable then skip else failwith(error_VAULT_IS_NOT_LIQUIDATABLE);

                // ------------------------------------------------------------------
                // Liquidation Process (Checks are passed - liquidatable and after delay)
                // ------------------------------------------------------------------

                // get max vault liquidation amount
                const newLoanOutstandingTotal      : nat = vault.loanOutstandingTotal;
                var newLoanInterestTotal           : nat := vault.loanInterestTotal;
                const vaultMaxLiquidationAmount    : nat = (newLoanOutstandingTotal * s.config.maxVaultLiquidationPercent) / 10000n;

                // if total liquidation amount is greater than vault max liquidation amount, set the max to the vault max liquidation amount
                // e.g. helpful in race conditions where instead of reverting failure, the transaction can still go through
                var totalLiquidationAmount : nat := amount;
                var refundTotal            : nat := 0n;
                
                if totalLiquidationAmount > vaultMaxLiquidationAmount then {
                    
                    totalLiquidationAmount := vaultMaxLiquidationAmount; 
                    refundTotal            := abs(totalLiquidationAmount - vaultMaxLiquidationAmount);

                } else skip;

                // Calculate vault collateral value rebased (1e32 or 10^32)
                // - this will be the denominator used to calculate proportion of collateral to be liquidated
                const vaultCollateralValueRebased : nat = calculateVaultCollateralValueRebased(vaultAddress, vault.collateralBalanceLedger, s);
                
                // loop tokens in vault collateral balance ledger to be liquidated
                for collateralTokenName -> collateralTokenBalance in map vault.collateralBalanceLedger block {

                    // skip if token balance is 0n
                    if collateralTokenBalance = 0n then skip else block {

                        // process liquidation in a helper function
                        const liquidationProcess : (list(operation)*nat)  = processCollateralTokenLiquidation(
                            liquidator,
                            treasuryAddress,
                            loanTokenDecimals,
                            loanTokenLastCompletedData,
                            vaultAddress,
                            vaultCollateralValueRebased,
                            collateralTokenName,
                            collateralTokenBalance,
                            totalLiquidationAmount,
                            operations,
                            s
                        );

                        // ------------------------------------------------------------------
                        // Update operations
                        // ------------------------------------------------------------------

                        operations  := liquidationProcess.0;

                        // ------------------------------------------------------------------
                        // Update collateral balance
                        // ------------------------------------------------------------------

                        // save and update new balance for collateral token
                        vault.collateralBalanceLedger[collateralTokenName] := liquidationProcess.1;

                    };

                };

                // ------------------------------------------------------------------
                // Update Interest Records
                // ------------------------------------------------------------------

                var newLoanPrincipalTotal       : nat := vault.loanPrincipalTotal;
                var initialLoanPrincipalTotal   : nat := newLoanPrincipalTotal;
                var newLoanOutstandingTotal     : nat := vault.loanOutstandingTotal;
                var totalInterestPaid           : nat := 0n;
                var totalPrincipalRepaid        : nat := 0n;          

                if totalLiquidationAmount > newLoanInterestTotal then {
                    
                    // total liquidation amount covers both interest and principal

                    // Calculate remainder amount
                    const principalReductionAmount : nat = abs(totalLiquidationAmount - newLoanInterestTotal);

                    // set total interest paid and reset loan interest to zero
                    totalInterestPaid := newLoanInterestTotal;
                    newLoanInterestTotal := 0n;

                    // Calculate final loan principal
                    if principalReductionAmount > initialLoanPrincipalTotal then failwith(error_PRINCIPAL_REDUCTION_MISCALCULATION) else skip;
                    newLoanPrincipalTotal := abs(initialLoanPrincipalTotal - principalReductionAmount);

                    // set total principal repaid amount
                    // - note: liquidation will not be able to cover entire principal amount as compared to %repay
                    totalPrincipalRepaid := principalReductionAmount;

                } else {

                    // total liquidation amount covers interest only

                    // set total interest paid
                    totalInterestPaid := totalLiquidationAmount;

                    // Calculate final loan interest
                    if totalLiquidationAmount > newLoanInterestTotal then failwith(error_LOAN_INTEREST_MISCALCULATION) else skip;
                    newLoanInterestTotal := abs(newLoanInterestTotal - totalLiquidationAmount);

                };

                // Calculate final loan outstanding total
                if totalLiquidationAmount > newLoanOutstandingTotal then failwith(error_LOAN_OUTSTANDING_MISCALCULATION) else skip;
                newLoanOutstandingTotal := abs(newLoanOutstandingTotal - totalLiquidationAmount);

                // ------------------------------------------------------------------
                // Calculate Fees from Interest
                // ------------------------------------------------------------------

                // Calculate amount of interest that goes to the Treasury 
                const interestSentToTreasury : nat = ((totalInterestPaid * s.config.interestTreasuryShare * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

                // Calculate amount of interest                 
                if interestSentToTreasury > totalInterestPaid then failwith(error_INTEREST_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_TOTAL_INTEREST_PAID) else skip;
                const interestRewards : nat = abs(totalInterestPaid - interestSentToTreasury);

                // ------------------------------------------------------------------
                // Process Fee Transfers
                // ------------------------------------------------------------------

                // Send interest payment from Lending Controller Token Pool to treasury
                const sendInterestToTreasuryOperation : operation = tokenPoolTransfer(
                    Tezos.get_self_address(),    // from_    
                    treasuryAddress,             // to_
                    interestSentToTreasury,      // amount
                    loanTokenType                // token type
                );
                operations := sendInterestToTreasuryOperation # operations;

                // ------------------------------------------------------------------
                // Process repayment of Principal
                // ------------------------------------------------------------------            

                var newTokenPoolTotal   : nat  := tokenPoolTotal;
                var newTotalBorrowed    : nat  := totalBorrowed;
                var newTotalRemaining   : nat  := totalRemaining;
                
                // Process repayment of principal if total principal repaid quantity is greater than 0
                if totalPrincipalRepaid > 0n then {

                    // Calculate new totalBorrowed and totalRemaining
                    if totalPrincipalRepaid > totalBorrowed then failwith(error_INCORRECT_FINAL_TOTAL_BORROWED_AMOUNT) else skip;
                    newTotalBorrowed   := abs(totalBorrowed - totalPrincipalRepaid);
                    newTotalRemaining  := totalRemaining + totalPrincipalRepaid;
                    newTokenPoolTotal  := newTotalRemaining + newTotalBorrowed;

                } else skip;

                // process refund if liquidation amount exceeds vault max liquidation amount
                if refundTotal > 0n then {

                    const processRefundOperation : operation = tokenPoolTransfer(
                        Tezos.get_self_address(),   // from_
                        liquidator,                 // to_
                        refundTotal,                // amount
                        loanTokenType               // token type
                    );

                    operations := processRefundOperation # operations;

                } else skip;

                // transfer operation should take place first before refund operation (N.B. First In Last Out operations)
                const transferLiquidationAmountOperation : operation = tokenPoolTransfer(
                    liquidator,                 // from_
                    Tezos.get_self_address(),   // to_
                    totalLiquidationAmount,     // totalLiquidationAmount
                    loanTokenType               // token type
                );

                operations := transferLiquidationAmountOperation # operations;

                // ------------------------------------------------------------------
                // Update Loan Token Accumulated Rewards Per Share
                // ------------------------------------------------------------------

                // Calculate loan token accumulated rewards per share increment (1e6 * 1e27 / 1e6 -> 1e27)
                // - N.B. divide by token pool total before it is updated
                const accRewardsPerShareIncrement  : nat = (interestRewards * fixedPointAccuracy) / tokenPoolTotal;
                const newAccRewardsPerShare        : nat = accRewardsPerShare + accRewardsPerShareIncrement;

                newTokenPoolTotal := newTokenPoolTotal + interestRewards;
                newTotalRemaining := newTotalRemaining + interestRewards;

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Update token storage
                loanTokenRecord.tokenPoolTotal              := newTokenPoolTotal;
                loanTokenRecord.totalBorrowed               := newTotalBorrowed;
                loanTokenRecord.totalRemaining              := newTotalRemaining;
                loanTokenRecord.accumulatedRewardsPerShare  := newAccRewardsPerShare;

                // Update Loan Token State again: Latest utilisation rate, current interest rate, compounded interest and borrow index
                loanTokenRecord := updateLoanTokenState(loanTokenRecord);
                
                // Update loan token
                s.loanTokenLedger[vaultLoanTokenName]   := loanTokenRecord;

                // Update vault storage
                vault.loanOutstandingTotal      := newLoanOutstandingTotal;    
                vault.loanPrincipalTotal        := newLoanPrincipalTotal;
                vault.loanInterestTotal         := newLoanInterestTotal;

                // Update vault                
                s.vaults[vaultHandle]           := vault;                

            }
        |   _ -> skip
    ];

} with (operations, s)



(* registerDeposit lambda *)
function lambdaRegisterDeposit(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    checkRegisterDepositIsNotPaused(s);    // Check that %registerDeposit entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaRegisterDeposit(registerDepositParams) -> {

                // init variables for convenience
                const vaultHandle     : vaultHandleType   = registerDepositParams.handle;
                const depositAmount   : nat               = registerDepositParams.amount;
                const tokenName       : string            = registerDepositParams.tokenName;
                const initiator       : address           = Tezos.get_sender(); // vault address that initiated deposit

                // get collateral token record reference
                const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenReference(tokenName, s);

                // Check that token name is not protected (e.g. smvk)
                if collateralTokenRecord.protected then failwith(error_CANNOT_REGISTER_DEPOSIT_FOR_PROTECTED_COLLATERAL_TOKEN) else skip;

                // ------------------------------------------------------------------
                // Update vault state
                // ------------------------------------------------------------------

                const updatedVaultState : (vaultRecordType*loanTokenRecordType) = updateVaultState(vaultHandle, s);
                var vault               : vaultRecordType                       := updatedVaultState.0;
                var loanTokenRecord     : loanTokenRecordType                   := updatedVaultState.1;

                // Check if initiator matches vault address
                if vault.address =/= initiator then failwith(error_SENDER_MUST_BE_VAULT_ADDRESS) else skip; 

                // ------------------------------------------------------------------
                // Register token deposit in vault collateral balance ledger
                // ------------------------------------------------------------------
                
                // Check if token is tez or exists in collateral token ledger
                if tokenName = "tez" then skip else {
                    checkCollateralTokenExists(tokenName, s)    
                };

                // get token collateral balance in vault, set to 0n if not found in vault (i.e. first deposit)
                var vaultTokenCollateralBalance : nat := case vault.collateralBalanceLedger[tokenName] of [
                        Some(_balance) -> _balance
                    |   None           -> 0n
                ];

                // Calculate new collateral balance
                const newCollateralBalance : nat = vaultTokenCollateralBalance + depositAmount;

                // ------------------------------------------------------------------
                // Update storage
                // ------------------------------------------------------------------

                vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;

                // reset vault liquidation levels if vault is no longer liquidatable
                const vaultIsLiquidatable : bool = isLiquidatable(vault, s);
                if vaultIsLiquidatable then skip else {
                    vault.markedForLiquidationLevel  := 0n;
                    vault.liquidationEndLevel        := 0n;
                };

                // update vault storage
                s.vaults[vaultHandle]                     := vault;
                s.loanTokenLedger[vault.loanToken]        := loanTokenRecord;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* registerWithdrawal lambda *)
function lambdaRegisterWithdrawal(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    checkRegisterWithdrawalIsNotPaused(s);    // Check that %registerWithdrawal entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaRegisterWithdrawal(registerWithdrawalParams) -> {
                
                // init variables for convenience
                const vaultHandle         : vaultHandleType   = registerWithdrawalParams.handle;
                const withdrawalAmount    : nat               = registerWithdrawalParams.amount;
                const tokenName           : string            = registerWithdrawalParams.tokenName;
                const initiator           : address           = Tezos.get_sender(); // vault address that initiated withdrawal

                // get collateral token record reference
                const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenReference(tokenName, s);

                // Check that token name is not protected (e.g. smvk)
                if collateralTokenRecord.protected then failwith(error_CANNOT_REGISTER_WITHDRAWAL_FOR_PROTECTED_COLLATERAL_TOKEN) else skip;

                // ------------------------------------------------------------------
                // Update vault state
                // ------------------------------------------------------------------

                const updatedVaultState : (vaultRecordType*loanTokenRecordType) = updateVaultState(vaultHandle, s);
                var vault               : vaultRecordType                       := updatedVaultState.0;
                var loanTokenRecord     : loanTokenRecordType                   := updatedVaultState.1;

                // Check if initiator matches vault address
                if vault.address =/= initiator then failwith(error_SENDER_MUST_BE_VAULT_ADDRESS) else skip;

                // Check if vault is undercollaterized, if not then send withdraw operation
                if isUnderCollaterized(vault, s) 
                then failwith(error_CANNOT_WITHDRAW_AS_VAULT_IS_UNDERCOLLATERIZED) 
                else skip;

                // ------------------------------------------------------------------
                // Register token withdrawal in vault collateral balance ledger
                // ------------------------------------------------------------------

                // get token collateral balance in vault, fail if none found
                var vaultTokenCollateralBalance : nat := case vault.collateralBalanceLedger[tokenName] of [
                        Some(_balance) -> _balance
                    |   None -> failwith(error_INSUFFICIENT_COLLATERAL_TOKEN_BALANCE_IN_VAULT)
                ];

                // Calculate new vault balance
                if withdrawalAmount > vaultTokenCollateralBalance then failwith(error_CANNOT_WITHDRAW_MORE_THAN_TOTAL_COLLATERAL_BALANCE) else skip;
                const newCollateralBalance : nat  = abs(vaultTokenCollateralBalance - withdrawalAmount);
                
                // ------------------------------------------------------------------
                // Update storage
                // ------------------------------------------------------------------

                vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;

                // reset vault liquidation levels if vault is no longer liquidatable
                const vaultIsLiquidatable : bool = isLiquidatable(vault, s);
                if vaultIsLiquidatable then skip else {
                    vault.markedForLiquidationLevel  := 0n;
                    vault.liquidationEndLevel        := 0n;
                };

                // update vault storage
                s.vaults[vaultHandle]                     := vault;
                s.loanTokenLedger[vault.loanToken]        := loanTokenRecord;
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* borrow lambda *)
function lambdaBorrow(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation):= nil;
    checkBorrowIsNotPaused(s);    // Check that %borrow entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaBorrow(borrowParams) -> {
                
                // Init variables for convenience
                const vaultId            : nat                     = borrowParams.vaultId; 
                const initialLoanAmount  : nat                     = borrowParams.quantity;
                const initiator          : initiatorAddressType    = Tezos.get_sender();

                // Get Treasury Address from the General Contracts map on the Governance Contract
                const treasuryAddress: address        = getContractAddressFromGovernanceContract("lendingTreasury", s.governanceAddress, error_TREASURY_CONTRACT_NOT_FOUND);

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = initiator;
                ];

                // ------------------------------------------------------------------
                // Update vault state
                // ------------------------------------------------------------------

                const updatedVaultState : (vaultRecordType*loanTokenRecordType) = updateVaultState(vaultHandle, s);
                var vault               : vaultRecordType                       := updatedVaultState.0;
                var loanTokenRecord     : loanTokenRecordType                   := updatedVaultState.1;

                // ------------------------------------------------------------------
                // Get Loan Token parameters
                // ------------------------------------------------------------------

                // Get loan token parameters
                const reserveRatio          : nat         = loanTokenRecord.reserveRatio;
                const tokenPoolTotal        : nat         = loanTokenRecord.tokenPoolTotal;
                const totalBorrowed         : nat         = loanTokenRecord.totalBorrowed;
                const totalRemaining        : nat         = loanTokenRecord.totalRemaining;
                const loanTokenType         : tokenType   = loanTokenRecord.tokenType;
                const accRewardsPerShare    : nat         = loanTokenRecord.accumulatedRewardsPerShare;

                // ------------------------------------------------------------------
                // Calculate Service Loan Fees
                // ------------------------------------------------------------------
                
                // Charge a minimum loan fee if user is borrowing
                const minimumLoanFee : nat = ((initialLoanAmount * s.config.minimumLoanFeePercent * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

                // Calculate share of fees that goes to the Treasury 
                const minimumLoanFeeToTreasury : nat = ((minimumLoanFee * s.config.minimumLoanFeeTreasuryShare * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

                // Calculate share of fees that goes to Rewards
                if minimumLoanFeeToTreasury > minimumLoanFee then failwith(error_MINIMUM_LOAN_FEE_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_MINIMUM_LOAN_FEE) else skip;
                const minimumLoanFeeReward : nat = abs(minimumLoanFee - minimumLoanFeeToTreasury);

                // ------------------------------------------------------------------
                // Calculate Final Borrow Amount
                // ------------------------------------------------------------------

                var finalLoanAmount                : nat := initialLoanAmount;
                var newLoanOutstandingTotal        : nat := vault.loanOutstandingTotal;
                var newLoanPrincipalTotal          : nat := vault.loanPrincipalTotal;

                // Reduce finalLoanAmount by minimum loan fee
                if minimumLoanFee > finalLoanAmount then failwith(error_LOAN_FEE_CANNOT_BE_GREATER_THAN_BORROWED_AMOUNT) else skip;
                finalLoanAmount := abs(finalLoanAmount - minimumLoanFee);

                // Calculate new loan outstanding
                newLoanOutstandingTotal := newLoanOutstandingTotal + initialLoanAmount;

                // Increment new principal total
                newLoanPrincipalTotal := newLoanPrincipalTotal + initialLoanAmount;

                // ------------------------------------------------------------------
                // Token Pool Calculations
                // ------------------------------------------------------------------

                var newTokenPoolTotal   : nat  := tokenPoolTotal;
                var newTotalBorrowed    : nat  := totalBorrowed;
                var newTotalRemaining   : nat  := totalRemaining;

                // calculate required reserve amount for token in token pool
                const requiredTokenPoolReserves = (tokenPoolTotal * fixedPointAccuracy * reserveRatio) / (10000n * fixedPointAccuracy);

                // calculate new totalBorrowed 
                newTotalBorrowed := totalBorrowed + initialLoanAmount;
                
                // calculate new total remaining
                if initialLoanAmount > totalRemaining then failwith(error_INSUFFICIENT_TOKENS_IN_TOKEN_POOL_TO_BE_BORROWED) else skip;
                newTotalRemaining := abs(totalRemaining - initialLoanAmount);

                // check that new total remaining is greater than required token pool reserves
                if newTotalRemaining > requiredTokenPoolReserves then skip else failwith(error_TOKEN_POOL_RESERVES_RATIO_NOT_MET);

                // ------------------------------------------------------------------
                // Process Transfers (loan, fees, and rewards)
                // ------------------------------------------------------------------

                const transferLoanToBorrowerOperation : operation = tokenPoolTransfer(
                    Tezos.get_self_address(),   // from_
                    initiator,                  // to_
                    finalLoanAmount,            // amount
                    loanTokenType               // token type
                );

                const transferFeesToTreasuryOperation : operation = tokenPoolTransfer(
                    Tezos.get_self_address(),   // from_
                    treasuryAddress,            // to_
                    minimumLoanFeeToTreasury,   // amount
                    loanTokenType               // token type
                );

                operations := list[
                    transferLoanToBorrowerOperation; 
                    transferFeesToTreasuryOperation;
                ];

                // ------------------------------------------------------------------
                // Update Loan Token Accumulated Rewards Per Share
                // ------------------------------------------------------------------

                // Calculate loan token accumulated rewards per share increment (1e6 * 1e27 / 1e6 -> 1e27)
                // - N.B. divide by token pool total before it is updated
                const accRewardsPerShareIncrement  : nat = (minimumLoanFeeReward * fixedPointAccuracy) / tokenPoolTotal;
                const newAccRewardsPerShare        : nat = accRewardsPerShare + accRewardsPerShareIncrement;

                newTokenPoolTotal := newTotalBorrowed + newTotalRemaining + minimumLoanFeeReward;
                newTotalRemaining := newTotalRemaining + minimumLoanFeeReward;

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------
                
                // Update loan token storage
                loanTokenRecord.tokenPoolTotal              := newTokenPoolTotal;
                loanTokenRecord.totalBorrowed               := newTotalBorrowed;
                loanTokenRecord.totalRemaining              := newTotalRemaining;
                loanTokenRecord.accumulatedRewardsPerShare  := newAccRewardsPerShare;   

                // Update Loan Token State: Latest utilisation rate, current interest rate, compounded interest and borrow index
                loanTokenRecord := updateLoanTokenState(loanTokenRecord);

                s.loanTokenLedger[vault.loanToken]  := loanTokenRecord;

                // Update vault storage
                vault.loanOutstandingTotal             := newLoanOutstandingTotal;
                vault.loanPrincipalTotal               := newLoanPrincipalTotal;

                // Update vault
                s.vaults[vaultHandle] := vault;

                // Check if vault is undercollaterized after borrow; if it is not, then allow user to borrow
                if isUnderCollaterized(vault, s) 
                then failwith(error_VAULT_IS_UNDERCOLLATERIZED)
                else skip;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* repay lambda *)
function lambdaRepay(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation) := nil;
    checkRepayIsNotPaused(s);    // Check that %repay entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaRepay(repayParams) -> {
                
                // Init variables for convenience
                const vaultId                   : nat                     = repayParams.vaultId; 
                const initialRepaymentAmount    : nat                     = repayParams.quantity;
                const initiator                 : initiatorAddressType    = Tezos.get_sender();
                var finalRepaymentAmount        : nat                    := initialRepaymentAmount;

                // Get Treasury Address from the General Contracts map on the Governance Contract
                const treasuryAddress : address = getContractAddressFromGovernanceContract("lendingTreasury", s.governanceAddress, error_TREASURY_CONTRACT_NOT_FOUND);

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = initiator;
                ];
                
                // ------------------------------------------------------------------
                // Update vault state
                // ------------------------------------------------------------------

                const updatedVaultState : (vaultRecordType*loanTokenRecordType) = updateVaultState(vaultHandle, s);
                var vault               : vaultRecordType                       := updatedVaultState.0;
                var loanTokenRecord     : loanTokenRecordType                   := updatedVaultState.1;

                // ------------------------------------------------------------------
                // Get Loan Token parameters
                // ------------------------------------------------------------------

                // Get loan token parameters
                const tokenPoolTotal      : nat         = loanTokenRecord.tokenPoolTotal;
                const totalBorrowed       : nat         = loanTokenRecord.totalBorrowed;
                const totalRemaining      : nat         = loanTokenRecord.totalRemaining;
                const minRepaymentAmount  : nat         = loanTokenRecord.minRepaymentAmount;
                const loanTokenType       : tokenType   = loanTokenRecord.tokenType;
                const accRewardsPerShare  : nat         = loanTokenRecord.accumulatedRewardsPerShare;

                // Check that minimum repayment amount is reached
                if initialRepaymentAmount < minRepaymentAmount then failwith(error_MIN_REPAYMENT_AMOUNT_NOT_REACHED) else skip;

                // ------------------------------------------------------------------
                // Calculate Principal / Interest Repayments
                // ------------------------------------------------------------------

                var totalInterestPaid              : nat := 0n;
                var totalPrincipalRepaid           : nat := 0n;
                var refundTotal                    : nat := 0n;
                var newLoanOutstandingTotal        : nat := vault.loanOutstandingTotal;
                var newLoanPrincipalTotal          : nat := vault.loanPrincipalTotal;
                var newLoanInterestTotal           : nat := vault.loanInterestTotal;
                const initialLoanPrincipalTotal    : nat = vault.loanPrincipalTotal;

                if finalRepaymentAmount > newLoanInterestTotal then {
                    
                    // final repayment amount covers both interest and principal

                    // Calculate remainder amount - i.e. how much principal should be reduced by after all interest has been covered
                    const principalReductionAmount : nat = abs(finalRepaymentAmount - newLoanInterestTotal);

                    // set total interest paid and reset loan interest to zero
                    totalInterestPaid := newLoanInterestTotal;
                    newLoanInterestTotal := 0n;

                    // Calculate refund total if exists - i.e. difference between initial loan principal and principal reduction amount
                    if principalReductionAmount > initialLoanPrincipalTotal then refundTotal := abs(principalReductionAmount - initialLoanPrincipalTotal) else skip;

                    // if refund exists, reduce final repay amount by refund amount
                    if refundTotal > 0n then {
                        
                        // refund total > 0 - i.e. principalReductionAmount > initialLoanPrincipalTotal, and entire loan principal has been repaid

                        // note: refundTotal will always be smaller than finalRepaymentAmount 
                        //  - since refundTotal = finalRepaymentAmount - newLoanInterestTotal - initialLoanPrincipalTotal

                        finalRepaymentAmount   := abs(finalRepaymentAmount - refundTotal);
                        totalPrincipalRepaid   := initialLoanPrincipalTotal;
                        newLoanPrincipalTotal  := 0n;

                    } else {
                        
                        // refund total = 0 - i.e. initialLoanPrincipalTotal >= principalReductionAmount, and there is still loan principal remaining

                        // set total principal repaid amount
                        totalPrincipalRepaid   := principalReductionAmount;
                        newLoanPrincipalTotal  := abs(initialLoanPrincipalTotal - principalReductionAmount);
                    }

                } else {

                    // final repayment amount covers interest only

                    // set total interest paid
                    totalInterestPaid := finalRepaymentAmount;

                    // Calculate final loan interest
                    if finalRepaymentAmount > newLoanInterestTotal then failwith(error_LOAN_INTEREST_MISCALCULATION) else skip;
                    newLoanInterestTotal := abs(newLoanInterestTotal - finalRepaymentAmount);

                };

                // Calculate final loan outstanding total
                if finalRepaymentAmount > newLoanOutstandingTotal then failwith(error_LOAN_OUTSTANDING_MISCALCULATION) else skip;
                newLoanOutstandingTotal := abs(newLoanOutstandingTotal - finalRepaymentAmount);

                // Calculate amount of interest that goes to the Treasury 
                const interestSentToTreasury : nat = ((totalInterestPaid * s.config.interestTreasuryShare * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

                // Calculate amount of interest that goes to the Reward Pool 
                if interestSentToTreasury > totalInterestPaid then failwith(error_INTEREST_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_TOTAL_INTEREST_PAID) else skip;
                const interestRewards : nat = abs(totalInterestPaid - interestSentToTreasury);

                // ------------------------------------------------------------------
                // Process Interest Repayment - Fee Transfers
                // ------------------------------------------------------------------

                // Send interest payment to treasury
                const sendInterestToTreasuryOperation : operation = tokenPoolTransfer(
                    Tezos.get_self_address(),    // from_
                    treasuryAddress,             // to_
                    interestSentToTreasury,      // amount
                    loanTokenType                // token type
                );

                operations := sendInterestToTreasuryOperation # operations;

                // ------------------------------------------------------------------
                // Process Principal Repayment
                // ------------------------------------------------------------------            

                var newTokenPoolTotal   : nat  := tokenPoolTotal;
                var newTotalBorrowed    : nat  := totalBorrowed;
                var newTotalRemaining   : nat  := totalRemaining;
                
                // Process repayment of principal if total principal repaid quantity is greater than 0
                if totalPrincipalRepaid > 0n then {

                    // Calculate new totalBorrowed and totalRemaining
                    if totalPrincipalRepaid > totalBorrowed then failwith(error_INCORRECT_FINAL_TOTAL_BORROWED_AMOUNT) else skip;
                    newTotalBorrowed   := abs(totalBorrowed - totalPrincipalRepaid);
                    newTotalRemaining  := totalRemaining + totalPrincipalRepaid;
                    newTokenPoolTotal  := newTotalRemaining + newTotalBorrowed;

                } else skip;

                // process refund if necessary
                if refundTotal > 0n then {

                    const processRefundOperation : operation = tokenPoolTransfer(
                        Tezos.get_self_address(),   // from_
                        initiator,                  // to_
                        refundTotal,                // amount
                        loanTokenType               // token type
                    );

                    operations := processRefundOperation # operations;   

                } else skip;

                // transfer operation should take place first before refund operation (N.B. First In Last Out operations)
                const processRepayOperation : operation = tokenPoolTransfer(
                    initiator,                  // from_
                    Tezos.get_self_address(),   // to_
                    initialRepaymentAmount,     // amount
                    loanTokenType               // token type
                );

                operations := processRepayOperation # operations;

                // ------------------------------------------------------------------
                // Update Loan Token Accumulated Rewards Per Share
                // ------------------------------------------------------------------

                // Calculate loan token accumulated rewards per share increment (1e6 * 1e27 / 1e6 -> 1e27)
                // - N.B. divide by token pool total before it is updated
                const accRewardsPerShareIncrement  : nat = (interestRewards * fixedPointAccuracy) / tokenPoolTotal;
                const newAccRewardsPerShare        : nat = accRewardsPerShare + accRewardsPerShareIncrement;

                newTokenPoolTotal := newTokenPoolTotal + interestRewards;
                newTotalRemaining := newTotalRemaining + interestRewards;
                
                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Update token storage
                loanTokenRecord.tokenPoolTotal              := newTokenPoolTotal;
                loanTokenRecord.totalBorrowed               := newTotalBorrowed;
                loanTokenRecord.totalRemaining              := newTotalRemaining;
                loanTokenRecord.accumulatedRewardsPerShare  := newAccRewardsPerShare;

                // Update Loan Token State: Latest utilisation rate, current interest rate, compounded interest and borrow index
                loanTokenRecord := updateLoanTokenState(loanTokenRecord);

                // Update loan token
                s.loanTokenLedger[vault.loanToken]   := loanTokenRecord;

                // Update vault storage
                vault.loanOutstandingTotal      := newLoanOutstandingTotal;    
                vault.loanPrincipalTotal        := newLoanPrincipalTotal;
                vault.loanInterestTotal         := newLoanInterestTotal;

                // Update vault
                s.vaults[vaultHandle] := vault;

            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Vault Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vault Staked MVK Lambdas Begin
// ------------------------------------------------------------------------------

(* depositStakedMvk lambda *)
function lambdaVaultDepositStakedMvk(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation) := nil;
    checkVaultDepositStakedMvkIsNotPaused(s);    // Check that %vaultDepositStakedMvk entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaVaultDepositStakedMvk(vaultDepositStakedMvkParams) -> {
                
                // init variables for convenience
                const vaultId         : vaultIdType       = vaultDepositStakedMvkParams.vaultId;
                const depositAmount   : nat               = vaultDepositStakedMvkParams.depositAmount;
                const vaultOwner      : vaultOwnerType    = Tezos.get_sender();
                const tokenName       : string            = "smvk";

                // Check if token (sMVK) exists in collateral token ledger
                checkCollateralTokenExists(tokenName, s);

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];
                
                // ------------------------------------------------------------------
                // Update vault state
                // ------------------------------------------------------------------

                const updatedVaultState : (vaultRecordType*loanTokenRecordType) = updateVaultState(vaultHandle, s);
                var vault               : vaultRecordType                       := updatedVaultState.0;
                var loanTokenRecord     : loanTokenRecordType                   := updatedVaultState.1;
                const vaultAddress      : address                               = vault.address;

                // ------------------------------------------------------------------
                // Register vaultDepositStakedMvk action on the Doorman Contract
                // ------------------------------------------------------------------

                const vaultDepositStakedMvkOperation : operation = onDepositStakedMvkToVaultOperation(
                    vaultOwner,                         // vault owner
                    vaultAddress,                       // vault address
                    depositAmount,                      // deposit amount
                    s                                   // storage
                );
                operations := vaultDepositStakedMvkOperation # operations;
                
                // get vault staked balance from doorman contract (includes unclaimed exit fee rewards, does not include satellite rewards)
                // - for better accuracy, there should be a frontend call to compound rewards for the vault first
                const currentVaultStakedMvkBalance : nat = getUserStakedMvkBalanceFromDoorman(vault.address, s);

                // Calculate new collateral balance
                const newCollateralBalance : nat = currentVaultStakedMvkBalance + depositAmount;

                // ------------------------------------------------------------------
                // Update storage
                // ------------------------------------------------------------------

                vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;
                s.vaults[vaultHandle]                     := vault;
                s.loanTokenLedger[vault.loanToken]        := loanTokenRecord;
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(* withdrawStakedMvk lambda *)
function lambdaVaultWithdrawStakedMvk(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation)  := nil;
    checkVaultWithdrawStakedMvkIsNotPaused(s);    // Check that %vaultWithdrawStakedMvk entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaVaultWithdrawStakedMvk(vaultWithdrawStakedMvkParams) -> {
                
                // init variables for convenience
                const vaultId         : vaultIdType       = vaultWithdrawStakedMvkParams.vaultId;
                const withdrawAmount  : nat               = vaultWithdrawStakedMvkParams.withdrawAmount;
                const vaultOwner      : vaultOwnerType    = Tezos.get_sender();
                const tokenName       : string            = "smvk";

                // Check if token (sMVK) exists in collateral token ledger
                checkCollateralTokenExists(tokenName, s);

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];
                
                // ------------------------------------------------------------------
                // Update vault state
                // ------------------------------------------------------------------

                const updatedVaultState : (vaultRecordType*loanTokenRecordType) = updateVaultState(vaultHandle, s);
                var vault               : vaultRecordType                       := updatedVaultState.0;
                var loanTokenRecord     : loanTokenRecordType                   := updatedVaultState.1;
                const vaultAddress      : address                               = vault.address;

                // ------------------------------------------------------------------
                // Register vaultWithdrawStakedMvk action on the Doorman Contract
                // ------------------------------------------------------------------

                const vaultWithdrawStakedMvkOperation : operation = onWithdrawStakedMvkFromVaultOperation(
                    vaultOwner,                         // vault owner
                    vaultAddress,                       // vault address
                    withdrawAmount,                     // withdraw amount
                    s                                   // storage
                );
                operations := vaultWithdrawStakedMvkOperation # operations;
                
                // get vault staked balance from doorman contract (includes unclaimed exit fee rewards, does not include satellite rewards)
                // - for better accuracy, there should be a frontend call to compound rewards for the vault first
                const currentVaultStakedMvkBalance : nat = getUserStakedMvkBalanceFromDoorman(vault.address, s);

                // Calculate new collateral balance                
                if withdrawAmount > currentVaultStakedMvkBalance then failwith(error_CANNOT_WITHDRAW_MORE_THAN_TOTAL_COLLATERAL_BALANCE) else skip;
                const newCollateralBalance : nat = abs(currentVaultStakedMvkBalance - withdrawAmount);

                // ------------------------------------------------------------------
                // Update storage
                // ------------------------------------------------------------------

                vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;
                s.vaults[vaultHandle]                     := vault;
                s.loanTokenLedger[vault.loanToken]        := loanTokenRecord;
                
            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Vault Staked MVK Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Lending Controller Lambdas End
//
// ------------------------------------------------------------------------------
