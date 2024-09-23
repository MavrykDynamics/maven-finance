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
    
    verifyNoAmountSent(Unit);        // entrypoint should not receive any mav amount  
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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
    
    verifyNoAmountSent(Unit);        // entrypoint should not receive any mav amount  
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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

    verifySenderIsAdmin(s.admin); // verify that sender is admin (i.e. Governance Proxy Contract address)

    case lendingControllerLambdaAction of [
        |   LambdaUpdateConfig(updateConfigListParams) -> {
                
                // const updateConfigAction    : lendingControllerUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                // const updateConfigNewValue  : lendingControllerUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                // case updateConfigAction of [
                //         ConfigCollateralRatio (_v)          -> s.config.collateralRatio                 := updateConfigNewValue
                //     |   ConfigLiquidationRatio (_v)         -> s.config.liquidationRatio                := updateConfigNewValue
                //     |   ConfigLiquidationFeePercent (_v)    -> s.config.liquidationFeePercent           := updateConfigNewValue
                //     |   ConfigAdminLiquidationFee (_v)      -> s.config.adminLiquidationFeePercent      := updateConfigNewValue
                //     |   ConfigMinimumLoanFeePercent (_v)    -> s.vaultConfig.minimumLoanFeePercent           := updateConfigNewValue
                //     |   ConfigMinLoanFeeTreasuryShare (_v)  -> s.vaultConfig.minimumLoanFeeTreasuryShare     := updateConfigNewValue
                //     |   ConfigInterestTreasuryShare (_v)    -> s.vaultConfig.interestTreasuryShare           := updateConfigNewValue
                //     |   ConfigLastCompletedDataMaxDelay (_v)-> s.config.lastCompletedDataMaxDelay       := updateConfigNewValue
                //     |   ConfigMaxVaultLiqPercent (_v)       -> s.config.maxVaultLiquidationPercent      := updateConfigNewValue
                //     |   ConfigLiquidationDelayInMins (_v)   -> s.config.liquidationDelayInMins          := updateConfigNewValue
                //     |   ConfigLiquidationMaxDuration (_v)   -> s.config.liquidationMaxDuration          := updateConfigNewValue
                // ];

                for updateConfigParams in list updateConfigListParams {

                    const _configType : string = updateConfigParams.configType;
                    const _configName : string = updateConfigParams.configName;
                    const _newValue : nat      = updateConfigParams.newValue;

                    

                };

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
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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


                // Vault Staked Token Entrypoints
                if s.breakGlassConfig.vaultDepositStakedTokenIsPaused then skip
                else s.breakGlassConfig.vaultDepositStakedTokenIsPaused := True;

                if s.breakGlassConfig.vaultWithdrawStakedTokenIsPaused then skip
                else s.breakGlassConfig.vaultWithdrawStakedTokenIsPaused := True;

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

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

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


                // Vault Staked Token Entrypoints
                if s.breakGlassConfig.vaultDepositStakedTokenIsPaused then s.breakGlassConfig.vaultDepositStakedTokenIsPaused := False
                else skip;

                if s.breakGlassConfig.vaultWithdrawStakedTokenIsPaused then s.breakGlassConfig.vaultWithdrawStakedTokenIsPaused := False
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

    verifySenderIsAdmin(s.admin); // verify that sender is admin

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

                        // Vault Staked Token Entrypoints
                    |   VaultDepositStakedToken (_v)         -> s.breakGlassConfig.vaultDepositStakedTokenIsPaused       := _v
                    |   VaultWithdrawStakedToken (_v)        -> s.breakGlassConfig.vaultWithdrawStakedTokenIsPaused      := _v

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
    //      -   Check that no mav is sent
    // 2a. If variant is CreateLoanToken
    //      -   Check if loan token already exists
    //      -   Update loan token ledger with new loan token record
    // 2b. If variant is UpdateLoanToken
    //      -   Get loan token record if exists
    //      -   Update and save loan token record with new parameters


    verifyNoAmountSent(Unit);           // entrypoint should not receive any mav amount  
    verifySenderIsAdmin(s.admin);       // verify that sender is admin
    
    // verify that %setLoanToken entrypoint is not paused (e.g. if glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.setLoanTokenIsPaused, error_SET_LOAN_TOKEN_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED);

    case lendingControllerLambdaAction of [
        |   LambdaSetLoanToken(setLoanTokenParams) -> {

                case setLoanTokenParams.action of [
                    |   CreateLoanToken(createLoanTokenParams) -> block {

                            const loanTokenName : string = createLoanTokenParams.tokenName;

                            // Verify that loan token does not already exist
                            verifyLoanTokenDoesNotExist(loanTokenName, s);
                            
                            // update loan token ledger
                            s.loanTokenLedger[loanTokenName] := createLoanTokenRecord(createLoanTokenParams);

                        }
                    |   UpdateLoanToken(updateLoanTokenParams) -> block{

                            const loanTokenName : string = updateLoanTokenParams.tokenName;

                            // update loan token ledger
                            s.loanTokenLedger[loanTokenName] := updateLoanTokenRecord(loanTokenName, updateLoanTokenParams, s);

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
    //      -   Check that no mav is sent
    // 2a. If variant is CreateCollateralToken
    //      -   Check if collateral token already exists
    //      -   Update collateral token ledger with new collateral token record
    // 2b. If variant is UpdateCollateralToken
    //      -   Get collateral token record if exists
    //      -   Update and save collateral token record with new parameters

    verifyNoAmountSent(Unit);                 // entrypoint should not receive any mav amount  
    verifySenderIsAdmin(s.admin);             // verify that sender is admin
    
    // Verify that %setCollateralToken entrypoint is not paused (e.g. if glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.setCollateralTokenIsPaused, error_SET_COLLATERAL_TOKEN_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED);

    case lendingControllerLambdaAction of [
        |   LambdaSetCollateralToken(setCollateralTokenParams) -> {

                case setCollateralTokenParams.action of [
                    |   CreateCollateralToken(createCollateralTokenParams) -> block {

                            // Check if collateral token already exists
                            if Big_map.mem(createCollateralTokenParams.tokenName, s.collateralTokenLedger) then failwith(error_COLLATERAL_TOKEN_ALREADY_EXISTS) else skip;

                            // update collateral token ledger
                            s.collateralTokenLedger[createCollateralTokenParams.tokenName] := createCollateralTokenRecord(createCollateralTokenParams);

                        }
                    |   UpdateCollateralToken(updateCollateralTokenParams) -> block{

                            const collateralTokenName : string = updateCollateralTokenParams.tokenName;
                    
                            var collateralTokenRecord : collateralTokenRecordType := getCollateralTokenRecord(collateralTokenName, s);

                            collateralTokenRecord.oracleAddress             := updateCollateralTokenParams.oracleAddress;
                            collateralTokenRecord.isPaused                  := updateCollateralTokenParams.isPaused;
                            collateralTokenRecord.maxDepositAmount          := updateCollateralTokenParams.maxDepositAmount;
                            collateralTokenRecord.stakingContractAddress    := updateCollateralTokenParams.stakingContractAddress;

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
    
    // verify that %registerVaultCreation entrypoint is not paused (e.g. if glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.registerVaultCreationIsPaused, error_REGISTER_VAULT_CREATION_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED);

    case lendingControllerLambdaAction of [
        |   LambdaRegisterVaultCreation(registerVaultCreationParams) -> {

                // Verify sender is vault factory contract
                verifySenderIsVaultFactoryContract(s);

                // init params
                const vaultOwner     : address = registerVaultCreationParams.vaultOwner;
                const vaultId        : nat     = registerVaultCreationParams.vaultId;
                const vaultAddress   : address = registerVaultCreationParams.vaultAddress;
                const loanTokenName  : string  = registerVaultCreationParams.loanTokenName;

                // Make vault handle
                const handle : vaultHandleType = makeVaultHandle(vaultId, vaultOwner);

                // Get loan token record 
                const loanTokenRecord : loanTokenRecordType = getLoanTokenReference(loanTokenName, s);
                
                // Create vault record - loan token borrow index initialised to 0
                const vault : vaultRecordType = createVaultRecord(
                    vaultAddress,                   // vault address
                    loanTokenRecord.tokenName,      // loan token name
                    loanTokenRecord.tokenDecimals   // loan token decimals
                );
                
                // update controller storage with new vault
                s.vaults[handle] := vault;

                // add new vault to owner's vault set
                var ownerVaultSet : ownerVaultSetType := getOrCreateOwnerVaultSet(vaultOwner, s);
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
    
    // Verify that %addLiquidity entrypoint is not paused (e.g. if glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.addLiquidityIsPaused, error_ADD_LIQUIDITY_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED);

    case lendingControllerLambdaAction of [
        |   LambdaAddLiquidity(addLiquidityParams) -> {
                
                // init variables for convenience
                const loanTokenName       : string              = addLiquidityParams.loanTokenName;
                const amount              : nat                 = addLiquidityParams.amount;
                const initiator           : address             = Mavryk.get_sender();

                // Get loan token record
                var loanTokenRecord : loanTokenRecordType := getLoanTokenRecord(loanTokenName, s);

                // verify loan token is not paused
                verifyLoanTokenIsNotPaused(loanTokenRecord);

                // update pool totals
                loanTokenRecord.tokenPoolTotal   := loanTokenRecord.tokenPoolTotal + amount;
                loanTokenRecord.rawMTokensTotalSupply     := loanTokenRecord.rawMTokensTotalSupply + amount;
                loanTokenRecord.totalRemaining   := loanTokenRecord.totalRemaining + amount;

                // send tokens to token pool (self address) operation / skip if loan token name is mav
                if loanTokenName = "mav" then {

                    if Mavryk.get_amount() = (amount * 1mumav) then skip else failwith(error_INCORRECT_LOAN_TOKEN_AMOUNT_SENT);

                } else {
                    const sendTokensToTokenPoolOperation : operation = tokenPoolTransfer(
                        initiator,                  // from_
                        Mavryk.get_self_address(),   // to_    
                        amount,                     // amount
                        loanTokenRecord.tokenType   // token type (e.g. mav, fa12, fa2)
                    );
                    operations := sendTokensToTokenPoolOperation # operations;
                };

                // mint M Tokens and send to sender
                const mintMTokensOperation : operation = mintOrBurnMToken(initiator, int(amount), loanTokenRecord.mTokenAddress);
                operations := mintMTokensOperation # operations;

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
    // 2. Check that no mav is sent
    // 2. Process remove liquidity operation
    //      -   Get loan token record
    //      -   Send tokens from token pool / lending controller (i.e. self address) to user
    //      -   Burn LP tokens from user (at a 1-to-1 ratio)
    //      -   Update loan token state with new totals to get the latest stats - utilisation rate, interest rate, compounded interest, and borrow index
    // 3. Get or create user's current token pool deposit balance 
    // 4. Update user rewards (based on user's current token pool deposit balance, and not the updated balance)
    
    verifyNoAmountSent(Unit);                   // entrypoint should not receive any mav amount  
    
    // Verify that %removeLiquidity entrypoint is not paused (e.g. if glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.removeLiquidityIsPaused, error_REMOVE_LIQUIDITY_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED);

    // init operations
    var operations : list(operation) := nil;

    case lendingControllerLambdaAction of [
        |   LambdaRemoveLiquidity(removeLiquidityParams) -> {
                
                // init variables for convenience
                const loanTokenName         : string    = removeLiquidityParams.loanTokenName;
                const amount                : nat       = removeLiquidityParams.amount;
                const initiator             : address   = Mavryk.get_sender();

                // Get loan token record
                var loanTokenRecord : loanTokenRecordType := getLoanTokenRecord(loanTokenName, s);
                
                const loanTokenType             : tokenType   = loanTokenRecord.tokenType;
                const loanTokenPoolTotal        : nat         = loanTokenRecord.tokenPoolTotal;
                const loanTotalRemaining        : nat         = loanTokenRecord.totalRemaining;
                
                const mTokenAddress             : address     = loanTokenRecord.mTokenAddress;
                const rawMTokensTotalSupply     : nat         = loanTokenRecord.rawMTokensTotalSupply;
                const mTokensBurned             : nat         = amount;

                // Calculate new total of LP Tokens - verify that mTokensBurned is less than rawMTokensTotalSupply
                verifyLessThanOrEqual(mTokensBurned, rawMTokensTotalSupply, error_CANNOT_BURN_MORE_THAN_TOTAL_AMOUNT_OF_LP_TOKENS);
                const newMTokensTotal : nat = abs(rawMTokensTotalSupply - mTokensBurned);

                // Calculate new token pool amount - verify that amount is less than loan token pool total
                verifyLessThanOrEqual(amount, loanTokenPoolTotal, error_TOKEN_POOL_TOTAL_CANNOT_BE_NEGATIVE);
                const newTokenPoolTotal : nat = abs(loanTokenPoolTotal - amount);

                // Calculate new token pool remaining - verify that amount is less than loan total remaining
                verifyLessThanOrEqual(amount, loanTotalRemaining, error_TOKEN_POOL_REMAINING_CANNOT_BE_NEGATIVE);
                const newTotalRemaining : nat = abs(loanTotalRemaining - amount);

                // burn M Tokens and send to sender
                const burnMTokensOperation : operation = mintOrBurnMToken(initiator, 0n - amount, mTokenAddress);
                operations := burnMTokensOperation # operations;

                // send tokens from token pool to initiator
                const sendTokensToInitiatorOperation : operation = tokenPoolTransfer(
                    Mavryk.get_self_address(),   // from_
                    initiator,                  // to_    
                    amount,                     // amount
                    loanTokenType               // token type (e.g. mav, fa12, fa2)
                );
                operations := sendTokensToInitiatorOperation # operations;

                // update pool totals
                loanTokenRecord.tokenPoolTotal   := newTokenPoolTotal;
                loanTokenRecord.rawMTokensTotalSupply     := newMTokensTotal;   // mTokens to follow movement of token pool total
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

    // Verify that %closeVault entrypoint is not paused (e.g. if glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.closeVaultIsPaused, error_CLOSE_VAULT_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED);

    case lendingControllerLambdaAction of [
        |   LambdaCloseVault(closeVaultParams) -> {
                
                // only the vault owner can close his own vault

                // init parameters 
                const vaultId     : vaultIdType      = closeVaultParams.vaultId;
                const vaultOwner  : vaultOwnerType   = Mavryk.get_sender();

                // Make vault handle
                const vaultHandle : vaultHandleType = makeVaultHandle(vaultId, vaultOwner);

                // Get vault if exists
                var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);

                const vaultAddress : address = vault.address;

                // Check that vault has zero loan outstanding
                checkZeroLoanOutstanding(vault);

                // init list records of transfers from the closed vault
                var onLiquidateList : onLiquidateListType := list [];

                // get tokens and token balances and initiate transfer back to the vault owner
                for collateralTokenName -> collateralTokenBalance in map vault.collateralBalanceLedger block {
                    
                    // init final token balance var
                    var finalTokenBalance  : nat := collateralTokenBalance;
                    
                    if collateralTokenName = "mav" then block {

                        if finalTokenBalance > 0n then {
                            const transferMavOperation : operation = transferMav( (Mavryk.get_contract_with_error(vaultOwner, "Error. Unable to send mav.") : contract(unit)), finalTokenBalance * 1mumav );
                            operations := transferMavOperation # operations;
                        } else skip;

                        vault.collateralBalanceLedger[collateralTokenName]  := 0n;
                        
                    } else block {

                        const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenReference(collateralTokenName, s);

                        if collateralTokenRecord.isStakedToken then {

                            // get user staked balance from doorman contract (includes unclaimed exit fee rewards, does not include satellite rewards)
                            // - for better accuracy, there should be a frontend call to compound rewards for the vault first
                            // finalTokenBalance := getUserStakedMvnBalanceFromDoorman(vaultAddress, s);

                            const stakingContractAddress : address = getStakingContractAddress(collateralTokenRecord.stakingContractAddress);
                            finalTokenBalance := getBalanceFromStakingContract(vaultAddress, stakingContractAddress);

                            // for special case of sMVN
                            if finalTokenBalance > 0n then {
                                const withdrawAllStakedMvnOperation : operation = onWithdrawStakedTokenFromVaultOperation(
                                    vaultOwner,                         // vault owner
                                    vaultAddress,                       // vault address
                                    finalTokenBalance,                  // withdraw amount
                                    stakingContractAddress              // staking contract address
                                );

                                operations := withdrawAllStakedMvnOperation # operations;
                            } else skip;

                        } else if collateralTokenRecord.isScaledToken then {

                            // for scaled tokens
                            
                            // get updated scaled token balance (e.g. mToken)
                            finalTokenBalance := getBalanceFromScaledTokenContract(vaultAddress, collateralTokenRecord.tokenContractAddress);

                            // for other collateral token types besides sMVN and scaled tokens
                            if finalTokenBalance > 0n then {
                                // const withdrawTokenOperation : operation = liquidateFromVaultOperation(
                                //     vaultOwner,                         // to_
                                //     collateralTokenName,                // token name
                                //     finalTokenBalance,                  // token amount to be withdrawn
                                //     vaultAddress                        // vault address
                                // );
                                // operations := withdrawTokenOperation # operations;

                                const withdrawTokenOperation : onLiquidateSingleType = record [
                                    receiver   = vaultOwner;
                                    amount     = finalTokenBalance;
                                    tokenName  = collateralTokenName;
                                ];
                                onLiquidateList := withdrawTokenOperation # onLiquidateList;

                            } else skip;

                        } else {

                            // for other collateral token types besides sMVN and scaled tokens
                            if finalTokenBalance > 0n then {
                                // const withdrawTokenOperation : operation = liquidateFromVaultOperation(
                                //     vaultOwner,                         // to_
                                //     collateralTokenName,                // token name
                                //     finalTokenBalance,                  // token amount to be withdrawn
                                //     vaultAddress                        // vault address
                                // );
                                // operations := withdrawTokenOperation # operations;

                                const withdrawTokenOperation : onLiquidateSingleType = record [
                                    receiver   = vaultOwner;
                                    amount     = finalTokenBalance;
                                    tokenName  = collateralTokenName;
                                ];
                                onLiquidateList := withdrawTokenOperation # onLiquidateList;
                                
                            } else skip;

                        };

                        // save and update balance for collateral token to zero
                        vault.collateralBalanceLedger[collateralTokenName]  := 0n;

                    }; // end if/else check for mav/token

                }; // end loop for withdraw operations of mav/tokens in vault collateral 


                // remove vault from storage
                var ownerVaultSet : ownerVaultSetType := getOwnerVaultSet(vaultOwner, s);
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
    
    // Verify that %markForLiquidation entrypoint is not paused (e.g. if glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.markForLiquidationIsPaused, error_MARK_FOR_LIQUIDATION_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED);

    case lendingControllerLambdaAction of [
        |   LambdaMarkForLiquidation(markForLiquidationParams) -> {
                
                // anyone can mark a vault for liquidation

                // init parameters 
                const vaultId     : vaultIdType      = markForLiquidationParams.vaultId;
                const vaultOwner  : vaultOwnerType   = markForLiquidationParams.vaultOwner;

                const currentBlockLevel             : nat = Mavryk.get_level();
                const configLiquidationDelayInMins  : nat = s.vaultConfig.liquidationDelayInMins;
                const configLiquidationMaxDuration  : nat = s.vaultConfig.liquidationMaxDuration;
                const blocksPerMinute               : nat = 60n / Mavryk.get_min_block_time();

                const liquidationDelayInBlockLevel  : nat = configLiquidationDelayInMins * blocksPerMinute;                 
                const liquidationEndLevel           : nat = currentBlockLevel + (configLiquidationMaxDuration * blocksPerMinute);                 

                // Make vault handle
                const vaultHandle : vaultHandleType = makeVaultHandle(vaultId, vaultOwner);

                // ------------------------------------------------------------------
                // Update vault state
                // ------------------------------------------------------------------

                const updatedVaultState : (vaultRecordType*loanTokenRecordType) = updateVaultState(vaultHandle, s);
                var vault               : vaultRecordType                       := updatedVaultState.0;
                var loanTokenRecord     : loanTokenRecordType                   := updatedVaultState.1;
                
                // ------------------------------------------------------------------
                // Check if vault is liquidatable
                // ------------------------------------------------------------------

                const vaultIsLiquidatable : bool = isLiquidatable(vault, s);
                
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

                // ------------------------------------------------------------------
                // Update Storage (Vault and Loan Token)
                // ------------------------------------------------------------------

                // update loan token record storage                
                s.loanTokenLedger[vault.loanToken]   := loanTokenRecord;

                // Update vault
                s.vaults[vaultHandle] := vault;             

            }
        |   _ -> skip
    ];

} with (operations, s)



(* liquidateVault lambda *)
function lambdaLiquidateVault(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation) := nil;
    
    // Verify that %liquidateVault entrypoint is not paused (e.g. if glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.liquidateVaultIsPaused, error_LIQUIDATE_VAULT_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED);

    case lendingControllerLambdaAction of [
        |   LambdaLiquidateVault(liquidateVaultParams) -> {
                
                // init variables
                const vaultId            : nat       = liquidateVaultParams.vaultId;
                const vaultOwner         : address   = liquidateVaultParams.vaultOwner;
                const amount             : nat       = liquidateVaultParams.amount;
                const liquidator         : address   = Mavryk.get_sender();

                // Get Treasury Address from the General Contracts map on the Governance Contract
                const treasuryAddress           : address = getContractAddressFromGovernanceContract("lendingTreasury", s.governanceAddress, error_TREASURY_CONTRACT_NOT_FOUND);

                // ------------------------------------------------------------------
                // Get Vault record and parameters
                // ------------------------------------------------------------------

                // Make vault handle
                const vaultHandle : vaultHandleType = makeVaultHandle(vaultId, vaultOwner);

                // Update vault state
                const updatedVaultState : (vaultRecordType*loanTokenRecordType) = updateVaultState(vaultHandle, s);
                var vault               : vaultRecordType                       := updatedVaultState.0;
                var loanTokenRecord     : loanTokenRecordType                   := updatedVaultState.1;
                const vaultAddress      : address                               = vault.address;

                // init vault parameters
                const vaultLoanTokenName : string = vault.loanToken;

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
                const accRewardsPerShare  : nat         = loanTokenRecord.tokenRewardIndex;

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
                const vaultMaxLiquidationAmount    : nat = (newLoanOutstandingTotal * s.vaultConfig.maxVaultLiquidationPercent) / 10000n;

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

                // init list records of transfers from the vault from liquidation
                var onLiquidateList : onLiquidateListType := list [];
                
                // loop tokens in vault collateral balance ledger to be liquidated
                for collateralTokenName -> collateralTokenBalance in map vault.collateralBalanceLedger block {

                    // skip if token balance is 0n
                    if collateralTokenBalance = 0n then skip else block {

                        // process liquidation in a helper function
                        const liquidationProcess : (onLiquidateListType * list(operation) * nat)  = processCollateralTokenLiquidation(
                            liquidator,
                            treasuryAddress,
                            loanTokenDecimals,
                            loanTokenLastCompletedData,
                            vaultAddress,
                            vaultCollateralValueRebased,
                            collateralTokenName,
                            collateralTokenBalance,
                            totalLiquidationAmount,
                            onLiquidateList,
                            operations,
                            s
                        );
                        const updatedOnLiquidateList  : onLiquidateListType     = liquidationProcess.0;
                        const updatedOperations       : list(operation)         = liquidationProcess.1;
                        const collateralBalance       : nat                     = liquidationProcess.2;

                        // ------------------------------------------------------------------
                        // Update operations and list params
                        // ------------------------------------------------------------------

                        operations := updatedOperations;
                        onLiquidateList := updatedOnLiquidateList;

                        // ------------------------------------------------------------------
                        // Update collateral balance
                        // ------------------------------------------------------------------

                        // save and update new balance for collateral token
                        vault.collateralBalanceLedger[collateralTokenName] := collateralBalance;

                    };

                };

                // ------------------------------------------------------------------
                // Set On Liquidate Vault Params and operation
                // ------------------------------------------------------------------

                const liquidateFromVaultOperation : operation = liquidateFromVaultOperation(
                    onLiquidateList, 
                    vaultAddress
                );
                operations := liquidateFromVaultOperation # operations;

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

                    // Calculate final loan principal - verify that principalReductionAmount is less than initialLoanPrincipalTotal
                    verifyLessThanOrEqual(principalReductionAmount, initialLoanPrincipalTotal, error_PRINCIPAL_REDUCTION_MISCALCULATION);
                    newLoanPrincipalTotal := abs(initialLoanPrincipalTotal - principalReductionAmount);

                    // set total principal repaid amount
                    // - note: liquidation will not be able to cover entire principal amount as compared to %repay
                    totalPrincipalRepaid := principalReductionAmount;

                } else {

                    // total liquidation amount covers interest only

                    // set total interest paid
                    totalInterestPaid := totalLiquidationAmount;

                    // Calculate final loan interest - verify that totalLiquidationAmount is less than newLoanInterestTotal
                    verifyLessThanOrEqual(totalLiquidationAmount, newLoanInterestTotal, error_LOAN_INTEREST_MISCALCULATION);
                    newLoanInterestTotal := abs(newLoanInterestTotal - totalLiquidationAmount);

                };

                // Calculate final loan outstanding total - verify that totalLiquidationAmount is less than newLoanOutstandingTotal
                verifyLessThanOrEqual(totalLiquidationAmount, newLoanOutstandingTotal, error_LOAN_OUTSTANDING_MISCALCULATION);
                newLoanOutstandingTotal := abs(newLoanOutstandingTotal - totalLiquidationAmount);

                // ------------------------------------------------------------------
                // Calculate Fees from Interest
                // ------------------------------------------------------------------

                // Calculate amount of interest that goes to the Treasury 
                const interestSentToTreasury : nat = ((totalInterestPaid * s.vaultConfig.interestTreasuryShare * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

                // Calculate amount of interest - verify that interestSentToTreasury is less than totalInterestPaid
                verifyLessThanOrEqual(interestSentToTreasury, totalInterestPaid, error_INTEREST_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_TOTAL_INTEREST_PAID);
                const interestRewards : nat = abs(totalInterestPaid - interestSentToTreasury);

                // ------------------------------------------------------------------
                // Process Fee Transfers
                // ------------------------------------------------------------------

                // Send interest payment from Lending Controller Token Pool to treasury
                const sendInterestToTreasuryOperation : operation = tokenPoolTransfer(
                    Mavryk.get_self_address(),   // from_    
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

                    // verify that totalPrincipalRepaid is less than totalBorrowed
                    verifyLessThanOrEqual(totalPrincipalRepaid, totalBorrowed, error_INCORRECT_FINAL_TOTAL_BORROWED_AMOUNT);

                    // Calculate new totalBorrowed and totalRemaining
                    newTotalBorrowed   := abs(totalBorrowed - totalPrincipalRepaid);
                    newTotalRemaining  := totalRemaining + totalPrincipalRepaid;
                    newTokenPoolTotal  := newTotalRemaining + newTotalBorrowed;

                } else skip;

                // process refund if liquidation amount exceeds vault max liquidation amount
                if refundTotal > 0n then {

                    const processRefundOperation : operation = tokenPoolTransfer(
                        Mavryk.get_self_address(),   // from_
                        liquidator,                 // to_
                        refundTotal,                // amount
                        loanTokenType               // token type
                    );

                    operations := processRefundOperation # operations;

                } else skip;

                // transfer operation should take place first before refund operation (N.B. First In Last Out operations)
                const transferLiquidationAmountOperation : operation = tokenPoolTransfer(
                    liquidator,                 // from_
                    Mavryk.get_self_address(),  // to_
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

                newTokenPoolTotal  := newTokenPoolTotal + interestRewards;
                newTotalRemaining  := newTotalRemaining + interestRewards;

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Update token storage
                loanTokenRecord.rawMTokensTotalSupply       := newTokenPoolTotal; // mTokens to follow movement of token pool total
                loanTokenRecord.tokenPoolTotal              := newTokenPoolTotal;
                loanTokenRecord.totalBorrowed               := newTotalBorrowed;
                loanTokenRecord.totalRemaining              := newTotalRemaining;
                loanTokenRecord.tokenRewardIndex            := newAccRewardsPerShare;

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



(* processInterestPayment lambda *)
// function lambdaProcessInterestPayment(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
// block {
    
//     var operations : list(operation) := nil;
    
//     case lendingControllerLambdaAction of [
//         |   LambdaProcessInterestPayment(processInterestPaymentListParams) -> {
                
//                 for processInterestPaymentParams in processInterestPaymentListParams{

//                     // init variables
//                     const vaultId            : nat       = processInterestPaymentParams.vaultId;
//                     const vaultOwner         : address   = processInterestPaymentParams.vaultOwner;
//                     const liquidator         : address   = Mavryk.get_sender();

//                     // Get Treasury Address from the General Contracts map on the Governance Contract
//                     const treasuryAddress    : address   = getContractAddressFromGovernanceContract("lendingTreasury", s.governanceAddress, error_TREASURY_CONTRACT_NOT_FOUND);

//                     // ------------------------------------------------------------------
//                     // Get Vault record and parameters
//                     // ------------------------------------------------------------------

//                     // Make vault handle
//                     const vaultHandle : vaultHandleType = makeVaultHandle(vaultId, vaultOwner);

//                     // Update vault state
//                     const updatedVaultState : (vaultRecordType * loanTokenRecordType) = updateVaultState(vaultHandle, s);
//                     var vault               : vaultRecordType                        := updatedVaultState.0;
//                     var loanTokenRecord     : loanTokenRecordType                    := updatedVaultState.1;
//                     const vaultAddress      : address                                 = vault.address;

//                     // todo: check last interest payment date

//                     // init vault parameters
//                     const vaultLoanTokenName : string = vault.loanToken;

//                     // ------------------------------------------------------------------
//                     // Get Loan Token variables
//                     // ------------------------------------------------------------------

//                     // Get loan token parameters
//                     const tokenPoolTotal      : nat         = loanTokenRecord.tokenPoolTotal;
//                     const totalBorrowed       : nat         = loanTokenRecord.totalBorrowed;
//                     const totalRemaining      : nat         = loanTokenRecord.totalRemaining;
//                     const loanTokenDecimals   : nat         = loanTokenRecord.tokenDecimals;
//                     const loanTokenType       : tokenType   = loanTokenRecord.tokenType;
//                     const accRewardsPerShare  : nat         = loanTokenRecord.tokenRewardIndex;

//                     // Get loan token price
//                     const loanTokenLastCompletedData : lastCompletedDataReturnType = getTokenLastCompletedDataFromAggregator(loanTokenRecord.oracleAddress);

//                     // ------------------------------------------------------------------
//                     // Interest Payment Process
//                     // ------------------------------------------------------------------

//                     // get max vault liquidation amount
//                     // const newLoanOutstandingTotal      : nat = vault.loanOutstandingTotal;
//                     // var newLoanInterestTotal           : nat := vault.loanInterestTotal;
//                     // const vaultMaxLiquidationAmount    : nat = (newLoanOutstandingTotal * s.vaultConfig.maxVaultLiquidationPercent) / 10000n;

//                     // // if total liquidation amount is greater than vault max liquidation amount, set the max to the vault max liquidation amount
//                     // // e.g. helpful in race conditions where instead of reverting failure, the transaction can still go through
//                     // var totalLiquidationAmount : nat := amount;

//                     // Calculate vault collateral value rebased (1e32 or 10^32)
//                     // - this will be the denominator used to calculate proportion of collateral to be liquidated
//                     const vaultCollateralValueRebased : nat = calculateVaultCollateralValueRebased(vaultAddress, vault.collateralBalanceLedger, s);
                    
//                     // loop tokens in vault collateral balance ledger to be liquidated
//                     for collateralTokenName -> collateralTokenBalance in map vault.collateralBalanceLedger block {

//                         // skip if token balance is 0n
//                         if collateralTokenBalance = 0n then skip else block {

//                             // todo: refactor
//                             // process liquidation in a helper function
//                             const liquidationProcess : (list(operation)*nat)  = processCollateralTokenLiquidation(
//                                 liquidator,
//                                 treasuryAddress,
//                                 loanTokenDecimals,
//                                 loanTokenLastCompletedData,
//                                 vaultAddress,
//                                 vaultCollateralValueRebased,
//                                 collateralTokenName,
//                                 collateralTokenBalance,
//                                 totalLiquidationAmount,
//                                 operations,
//                                 s
//                             );
//                             const updatedOperationList  : list(operation)       = liquidationProcess.0;
//                             const collateralBalance     : nat                   = liquidationProcess.1;

//                             // ------------------------------------------------------------------
//                             // Update operations
//                             // ------------------------------------------------------------------

//                             operations  := updatedOperationList;

//                             // ------------------------------------------------------------------
//                             // Update collateral balance
//                             // ------------------------------------------------------------------

//                             // save and update new balance for collateral token
//                             vault.collateralBalanceLedger[collateralTokenName] := collateralBalance;

//                         };

//                     };

//                     // ------------------------------------------------------------------
//                     // Update Interest Records
//                     // ------------------------------------------------------------------

//                     var newLoanPrincipalTotal       : nat := vault.loanPrincipalTotal;
//                     var initialLoanPrincipalTotal   : nat := newLoanPrincipalTotal;
//                     var newLoanOutstandingTotal     : nat := vault.loanOutstandingTotal;
//                     var totalInterestPaid           : nat := 0n;
//                     var totalPrincipalRepaid        : nat := 0n;          

//                     if totalLiquidationAmount > newLoanInterestTotal then {
                        
//                         // total liquidation amount covers both interest and principal

//                         // Calculate remainder amount
//                         const principalReductionAmount : nat = abs(totalLiquidationAmount - newLoanInterestTotal);

//                         // set total interest paid and reset loan interest to zero
//                         totalInterestPaid := newLoanInterestTotal;
//                         newLoanInterestTotal := 0n;

//                         // Calculate final loan principal - verify that principalReductionAmount is less than initialLoanPrincipalTotal
//                         verifyLessThanOrEqual(principalReductionAmount, initialLoanPrincipalTotal, error_PRINCIPAL_REDUCTION_MISCALCULATION);
//                         newLoanPrincipalTotal := abs(initialLoanPrincipalTotal - principalReductionAmount);

//                         // set total principal repaid amount
//                         // - note: liquidation will not be able to cover entire principal amount as compared to %repay
//                         totalPrincipalRepaid := principalReductionAmount;

//                     } else {

//                         // total liquidation amount covers interest only

//                         // set total interest paid
//                         totalInterestPaid := totalLiquidationAmount;

//                         // Calculate final loan interest - verify that totalLiquidationAmount is less than newLoanInterestTotal
//                         verifyLessThanOrEqual(totalLiquidationAmount, newLoanInterestTotal, error_LOAN_INTEREST_MISCALCULATION);
//                         newLoanInterestTotal := abs(newLoanInterestTotal - totalLiquidationAmount);

//                     };

//                     // Calculate final loan outstanding total - verify that totalLiquidationAmount is less than newLoanOutstandingTotal
//                     verifyLessThanOrEqual(totalLiquidationAmount, newLoanOutstandingTotal, error_LOAN_OUTSTANDING_MISCALCULATION);
//                     newLoanOutstandingTotal := abs(newLoanOutstandingTotal - totalLiquidationAmount);

//                     // ------------------------------------------------------------------
//                     // Calculate Fees from Interest
//                     // ------------------------------------------------------------------

//                     // Calculate amount of interest that goes to the Treasury 
//                     const interestSentToTreasury : nat = ((totalInterestPaid * s.vaultRwaConfig.interestTreasuryShare * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

//                     // Calculate amount of interest - verify that interestSentToTreasury is less than totalInterestPaid
//                     verifyLessThanOrEqual(interestSentToTreasury, totalInterestPaid, error_INTEREST_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_TOTAL_INTEREST_PAID);
//                     const interestRewards : nat = abs(totalInterestPaid - interestSentToTreasury);

//                     // ------------------------------------------------------------------
//                     // Process Fee Transfers
//                     // ------------------------------------------------------------------

//                     // Send interest payment from Lending Controller Token Pool to treasury
//                     const sendInterestToTreasuryOperation : operation = tokenPoolTransfer(
//                         Mavryk.get_self_address(),   // from_    
//                         treasuryAddress,             // to_
//                         interestSentToTreasury,      // amount
//                         loanTokenType                // token type
//                     );
//                     operations := sendInterestToTreasuryOperation # operations;

//                     // ------------------------------------------------------------------
//                     // Process repayment of Principal
//                     // ------------------------------------------------------------------            

//                     var newTokenPoolTotal   : nat  := tokenPoolTotal;
//                     var newTotalBorrowed    : nat  := totalBorrowed;
//                     var newTotalRemaining   : nat  := totalRemaining;
                    
//                     // Process repayment of principal if total principal repaid quantity is greater than 0
//                     if totalPrincipalRepaid > 0n then {

//                         // verify that totalPrincipalRepaid is less than totalBorrowed
//                         verifyLessThanOrEqual(totalPrincipalRepaid, totalBorrowed, error_INCORRECT_FINAL_TOTAL_BORROWED_AMOUNT);

//                         // Calculate new totalBorrowed and totalRemaining
//                         newTotalBorrowed   := abs(totalBorrowed - totalPrincipalRepaid);
//                         newTotalRemaining  := totalRemaining + totalPrincipalRepaid;
//                         newTokenPoolTotal  := newTotalRemaining + newTotalBorrowed;

//                     } else skip;


//                     // transfer operation should take place first before refund operation (N.B. First In Last Out operations)
//                     const transferLiquidationAmountOperation : operation = tokenPoolTransfer(
//                         liquidator,                 // from_
//                         Mavryk.get_self_address(),  // to_
//                         totalLiquidationAmount,     // totalLiquidationAmount
//                         loanTokenType               // token type
//                     );

//                     operations := transferLiquidationAmountOperation # operations;

//                     // ------------------------------------------------------------------
//                     // Update Loan Token Accumulated Rewards Per Share
//                     // ------------------------------------------------------------------

//                     // Calculate loan token accumulated rewards per share increment (1e6 * 1e27 / 1e6 -> 1e27)
//                     // - N.B. divide by token pool total before it is updated
//                     const accRewardsPerShareIncrement  : nat = (interestRewards * fixedPointAccuracy) / tokenPoolTotal;
//                     const newAccRewardsPerShare        : nat = accRewardsPerShare + accRewardsPerShareIncrement;

//                     newTokenPoolTotal  := newTokenPoolTotal + interestRewards;
//                     newTotalRemaining  := newTotalRemaining + interestRewards;

//                     // ------------------------------------------------------------------
//                     // Update Storage
//                     // ------------------------------------------------------------------

//                     // Update token storage
//                     loanTokenRecord.rawMTokensTotalSupply       := newTokenPoolTotal; // mTokens to follow movement of token pool total
//                     loanTokenRecord.tokenPoolTotal              := newTokenPoolTotal;
//                     loanTokenRecord.totalBorrowed               := newTotalBorrowed;
//                     loanTokenRecord.totalRemaining              := newTotalRemaining;
//                     loanTokenRecord.tokenRewardIndex            := newAccRewardsPerShare;

//                     // Update Loan Token State again: Latest utilisation rate, current interest rate, compounded interest and borrow index
//                     loanTokenRecord := updateLoanTokenState(loanTokenRecord);
                    
//                     // Update loan token
//                     s.loanTokenLedger[vaultLoanTokenName]   := loanTokenRecord;

//                     // Update vault storage
//                     vault.loanOutstandingTotal      := newLoanOutstandingTotal;    
//                     vault.loanPrincipalTotal        := newLoanPrincipalTotal;
//                     vault.loanInterestTotal         := newLoanInterestTotal;

//                     // Update vault                
//                     s.vaults[vaultHandle]           := vault;    
//                 }

//             }
//         |   _ -> skip
//     ];

// } with (operations, s)



(* registerDeposit lambda *)
function lambdaRegisterDeposit(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    // Verify that %registerDeposit entrypoint is not paused (e.g. if glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.registerDepositIsPaused, error_REGISTER_DEPOSIT_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED);

    case lendingControllerLambdaAction of [
        |   LambdaRegisterDeposit(registerDepositParams) -> {

                // init variables for convenience
                const vaultHandle     : vaultHandleType   = registerDepositParams.handle;
                const depositAmount   : nat               = registerDepositParams.amount;
                const tokenName       : string            = registerDepositParams.tokenName;
                // const initiator       : address           = Mavryk.get_sender(); // vault address that initiated deposit

                // get collateral token record reference
                const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenReference(tokenName, s);

                // Verify that token name is not protected (e.g. smvn)
                verifyCollateralTokenIsNotProtected(collateralTokenRecord, error_CANNOT_REGISTER_DEPOSIT_FOR_PROTECTED_COLLATERAL_TOKEN);

                // verify collateral token is not paused
                verifyCollateralTokenIsNotPaused(collateralTokenRecord);

                // ------------------------------------------------------------------
                // Update vault state
                // ------------------------------------------------------------------

                const updatedVaultState : (vaultRecordType*loanTokenRecordType)  = updateVaultState(vaultHandle, s);
                var vault               : vaultRecordType                       := updatedVaultState.0;
                var loanTokenRecord     : loanTokenRecordType                   := updatedVaultState.1;

                // Verify that sender is vault or vault factory
                verifySenderIsVaultOrVaultFactory(vault.address, s);

                // ------------------------------------------------------------------
                // Register token deposit in vault collateral balance ledger
                // ------------------------------------------------------------------
                
                // Check if token is mav or exists in collateral token ledger
                if tokenName = "mav" then skip else {
                    checkCollateralTokenExists(tokenName, s)    
                };

                // get token collateral balance in vault, set to 0n if not found in vault (i.e. first deposit)
                var vaultTokenCollateralBalance : nat := getOrSetVaultTokenCollateralBalance(vault, tokenName);

                // Calculate new collateral balance
                const newCollateralBalance : nat = vaultTokenCollateralBalance + depositAmount;

                // ------------------------------------------------------------------
                // Update storage
                // ------------------------------------------------------------------

                vault.collateralBalanceLedger[tokenName] := newCollateralBalance;

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
    
    // Verify that %registerWithdrawal entrypoint is not paused (e.g. if glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.registerWithdrawalIsPaused, error_REGISTER_WITHDRAWAL_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED);

    case lendingControllerLambdaAction of [
        |   LambdaRegisterWithdrawal(registerWithdrawalParams) -> {
                
                // init variables for convenience
                const vaultHandle         : vaultHandleType   = registerWithdrawalParams.handle;
                const withdrawalAmount    : nat               = registerWithdrawalParams.amount;
                const tokenName           : string            = registerWithdrawalParams.tokenName;
                const initiator           : address           = Mavryk.get_sender(); // vault address that initiated withdrawal

                // get collateral token record reference
                const collateralTokenRecord : collateralTokenRecordType = getCollateralTokenReference(tokenName, s);

                // Verify that token name is not protected (e.g. smvn)
                verifyCollateralTokenIsNotProtected(collateralTokenRecord, error_CANNOT_REGISTER_WITHDRAWAL_FOR_PROTECTED_COLLATERAL_TOKEN);

                // ------------------------------------------------------------------
                // Update vault state
                // ------------------------------------------------------------------

                const updatedVaultState : (vaultRecordType*loanTokenRecordType) = updateVaultState(vaultHandle, s);
                var vault               : vaultRecordType                       := updatedVaultState.0;
                var loanTokenRecord     : loanTokenRecordType                   := updatedVaultState.1;

                // Verify that initiator (sender) matches vault address
                verifySenderIsVault(vault.address, initiator);

                // ------------------------------------------------------------------
                // Register token withdrawal in vault collateral balance ledger
                // ------------------------------------------------------------------

                // get token collateral balance in vault, fail if none found
                var vaultTokenCollateralBalance : nat := getVaultTokenCollateralBalance(vault, tokenName);

                // Calculate new vault balance - verify that withdrawalAmount is less than vaultTokenCollateralBalance
                verifyLessThanOrEqual(withdrawalAmount, vaultTokenCollateralBalance, error_CANNOT_WITHDRAW_MORE_THAN_TOTAL_COLLATERAL_BALANCE);
                const newCollateralBalance : nat  = abs(vaultTokenCollateralBalance - withdrawalAmount);
                
                // ------------------------------------------------------------------
                // Update storage
                // ------------------------------------------------------------------

                vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;

                // Check if vault is undercollaterized at the end
                if isUnderCollaterized(vault, s) 
                then failwith(error_CANNOT_WITHDRAW_AS_VAULT_IS_UNDERCOLLATERIZED) 
                else skip;

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
    
    // Verify that %borrow entrypoint is not paused (e.g. if glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.borrowIsPaused, error_BORROW_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED);

    case lendingControllerLambdaAction of [
        |   LambdaBorrow(borrowParams) -> {
                
                // Init variables for convenience
                const vaultId            : nat                     = borrowParams.vaultId; 
                const initialLoanAmount  : nat                     = borrowParams.quantity;
                const initiator          : initiatorAddressType    = Mavryk.get_sender();

                // Get Treasury Address from the General Contracts map on the Governance Contract
                const treasuryAddress: address      = getContractAddressFromGovernanceContract("lendingTreasury", s.governanceAddress, error_TREASURY_CONTRACT_NOT_FOUND);

                // Make vault handle
                const vaultHandle : vaultHandleType = makeVaultHandle(vaultId, initiator);

                // ------------------------------------------------------------------
                // Update vault state
                // ------------------------------------------------------------------

                const updatedVaultState : (vaultRecordType*loanTokenRecordType) = updateVaultState(vaultHandle, s);
                var vault               : vaultRecordType                       := updatedVaultState.0;
                var loanTokenRecord     : loanTokenRecordType                   := updatedVaultState.1;

                // ------------------------------------------------------------------
                // Get Loan Token parameters
                // ------------------------------------------------------------------

                // verify loan token is not paused
                verifyLoanTokenIsNotPaused(loanTokenRecord);

                // Get loan token parameters
                const reserveRatio          : nat         = loanTokenRecord.reserveRatio;
                const tokenPoolTotal        : nat         = loanTokenRecord.tokenPoolTotal;
                const totalBorrowed         : nat         = loanTokenRecord.totalBorrowed;
                const totalRemaining        : nat         = loanTokenRecord.totalRemaining;
                const loanTokenType         : tokenType   = loanTokenRecord.tokenType;
                const accRewardsPerShare    : nat         = loanTokenRecord.tokenRewardIndex;

                // ------------------------------------------------------------------
                // Calculate Service Loan Fees
                // ------------------------------------------------------------------
                
                // Charge a minimum loan fee if user is borrowing
                const minimumLoanFee : nat = ((initialLoanAmount * s.vaultConfig.minimumLoanFeePercent * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

                // Calculate share of fees that goes to the Treasury 
                const minimumLoanFeeToTreasury : nat = ((minimumLoanFee * s.vaultConfig.minimumLoanFeeTreasuryShare * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

                // Calculate share of fees that goes to Rewards - verify that minimumLoanFeeToTreasury is less than minimumLoanFee
                verifyLessThanOrEqual(minimumLoanFeeToTreasury, minimumLoanFee, error_MINIMUM_LOAN_FEE_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_MINIMUM_LOAN_FEE);
                const minimumLoanFeeReward : nat = abs(minimumLoanFee - minimumLoanFeeToTreasury);

                // ------------------------------------------------------------------
                // Calculate Final Borrow Amount
                // ------------------------------------------------------------------

                var finalLoanAmount                : nat := initialLoanAmount;
                var newLoanOutstandingTotal        : nat := vault.loanOutstandingTotal;
                var newLoanPrincipalTotal          : nat := vault.loanPrincipalTotal;

                // Reduce finalLoanAmount by minimum loan fee - verify that minimumLoanFee is less than finalLoanAmount
                verifyLessThanOrEqual(minimumLoanFee, finalLoanAmount, error_LOAN_FEE_CANNOT_BE_GREATER_THAN_BORROWED_AMOUNT);
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
                
                // calculate new total remaining - verify that initialLoanAmount is less than totalRemaining
                verifyLessThanOrEqual(initialLoanAmount, totalRemaining, error_INSUFFICIENT_TOKENS_IN_TOKEN_POOL_TO_BE_BORROWED);
                newTotalRemaining := abs(totalRemaining - initialLoanAmount);

                // verify that newTotalRemaining is greater than requiredTokenPoolReserves
                verifyGreaterThan(newTotalRemaining, requiredTokenPoolReserves, error_TOKEN_POOL_RESERVES_RATIO_NOT_MET);

                // ------------------------------------------------------------------
                // Process Transfers (loan, fees, and rewards)
                // ------------------------------------------------------------------

                const transferLoanToBorrowerOperation : operation = tokenPoolTransfer(
                    Mavryk.get_self_address(),   // from_
                    initiator,                  // to_
                    finalLoanAmount,            // amount
                    loanTokenType               // token type
                );

                const transferFeesToTreasuryOperation : operation = tokenPoolTransfer(
                    Mavryk.get_self_address(),   // from_
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
                loanTokenRecord.rawMTokensTotalSupply                := newTokenPoolTotal; // mTokens to follow movement of token pool total
                loanTokenRecord.tokenPoolTotal              := newTokenPoolTotal;
                loanTokenRecord.totalBorrowed               := newTotalBorrowed;
                loanTokenRecord.totalRemaining              := newTotalRemaining;
                loanTokenRecord.tokenRewardIndex  := newAccRewardsPerShare;   

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
    
    // Verify that %repay entrypoint is not paused (e.g. if glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.repayIsPaused, error_REPAY_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED);

    case lendingControllerLambdaAction of [
        |   LambdaRepay(repayParams) -> {
                
                // Init variables for convenience
                const vaultId                   : nat                     = repayParams.vaultId; 
                const initialRepaymentAmount    : nat                     = repayParams.quantity;
                const initiator                 : initiatorAddressType    = Mavryk.get_sender();
                var finalRepaymentAmount        : nat                    := initialRepaymentAmount;

                // Get Treasury Address from the General Contracts map on the Governance Contract
                const treasuryAddress : address = getContractAddressFromGovernanceContract("lendingTreasury", s.governanceAddress, error_TREASURY_CONTRACT_NOT_FOUND);

                // Make vault handle
                const vaultHandle : vaultHandleType = makeVaultHandle(vaultId, initiator);

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
                const accRewardsPerShare  : nat         = loanTokenRecord.tokenRewardIndex;

                // Check that minimum repayment amount is reached - verify that initialRepaymentAmount is greater than minRepaymentAmount
                verifyGreaterThanOrEqual(initialRepaymentAmount, minRepaymentAmount, error_MIN_REPAYMENT_AMOUNT_NOT_REACHED);

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

                    // Calculate final loan interest - verify that finalRepaymentAmount is less than newLoanInterestTotal
                    verifyLessThanOrEqual(finalRepaymentAmount, newLoanInterestTotal, error_LOAN_INTEREST_MISCALCULATION);
                    newLoanInterestTotal := abs(newLoanInterestTotal - finalRepaymentAmount);

                };

                // Calculate final loan outstanding total - verify that finalRepaymentAmount is less than newLoanOutstandingTotal
                verifyLessThanOrEqual(finalRepaymentAmount, newLoanOutstandingTotal, error_LOAN_OUTSTANDING_MISCALCULATION);
                newLoanOutstandingTotal := abs(newLoanOutstandingTotal - finalRepaymentAmount);

                // Calculate amount of interest that goes to the Treasury 
                const interestSentToTreasury : nat = ((totalInterestPaid * s.vaultConfig.interestTreasuryShare * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

                // Calculate amount of interest that goes to the Reward Pool - verify that interestSentToTreasury is less than totalInterestPaid
                verifyLessThanOrEqual(interestSentToTreasury, totalInterestPaid, error_INTEREST_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_TOTAL_INTEREST_PAID);
                const interestRewards : nat = abs(totalInterestPaid - interestSentToTreasury);

                // ------------------------------------------------------------------
                // Process Interest Repayment - Fee Transfers
                // ------------------------------------------------------------------

                // Send interest payment to treasury
                const sendInterestToTreasuryOperation : operation = tokenPoolTransfer(
                    Mavryk.get_self_address(),    // from_
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

                    // verify that totalPrincipalRepaid is less than totalBorrowed
                    verifyLessThanOrEqual(totalPrincipalRepaid, totalBorrowed, error_INCORRECT_FINAL_TOTAL_BORROWED_AMOUNT);

                    // Calculate new totalBorrowed and totalRemaining
                    newTotalBorrowed   := abs(totalBorrowed - totalPrincipalRepaid);
                    newTotalRemaining  := totalRemaining + totalPrincipalRepaid;
                    newTokenPoolTotal  := newTotalRemaining + newTotalBorrowed;

                } else skip;

                // process refund if necessary
                if refundTotal > 0n then {

                    const processRefundOperation : operation = tokenPoolTransfer(
                        Mavryk.get_self_address(),   // from_
                        initiator,                  // to_
                        refundTotal,                // amount
                        loanTokenType               // token type
                    );

                    operations := processRefundOperation # operations;   

                } else skip;

                // transfer operation should take place first before refund operation (N.B. First In Last Out operations)
                const processRepayOperation : operation = tokenPoolTransfer(
                    initiator,                  // from_
                    Mavryk.get_self_address(),   // to_
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

                newTokenPoolTotal  := newTokenPoolTotal + interestRewards;
                newTotalRemaining  := newTotalRemaining + interestRewards;
                
                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // Update token storage
                loanTokenRecord.rawMTokensTotalSupply       := newTokenPoolTotal; // mTokens to follow movement of token pool total
                loanTokenRecord.tokenPoolTotal              := newTokenPoolTotal;
                loanTokenRecord.totalBorrowed               := newTotalBorrowed;
                loanTokenRecord.totalRemaining              := newTotalRemaining;
                loanTokenRecord.tokenRewardIndex  := newAccRewardsPerShare;

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
// Vault Staked Token Lambdas Begin
// ------------------------------------------------------------------------------

(* depositStakedToken lambda *)
function lambdaVaultDepositStakedToken(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation) := nil;
    
    // Verify that %vaultDepositStakedMvn entrypoint is not paused (e.g. if glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.vaultDepositStakedTokenIsPaused, error_VAULT_DEPOSIT_STAKED_TOKEN_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED);

    case lendingControllerLambdaAction of [
        |   LambdaVaultDepositStakedToken(vaultDepositStakedTokenParams) -> {
                
                // init variables for convenience
                const vaultId               : vaultIdType       = vaultDepositStakedTokenParams.vaultId;
                const depositAmount         : nat               = vaultDepositStakedTokenParams.depositAmount;
                const collateralTokenName   : string            = vaultDepositStakedTokenParams.tokenName;
                const vaultOwner            : vaultOwnerType    = Mavryk.get_sender();

                var collateralTokenRecord : collateralTokenRecordType := getCollateralTokenRecord(collateralTokenName, s);

                // Check if token (e.g. sMVN) exists in collateral token ledger
                checkCollateralTokenExists(collateralTokenName, s);

                // Verify that collateral token is of staked token type
                verifyCollateralTokenIsStakedToken(collateralTokenRecord);

                // Verify that max deposit amount has not been exceeded
                verifyMaxDepositAmountNotExceeded(collateralTokenRecord, depositAmount);

                // Make vault handle
                const vaultHandle : vaultHandleType = makeVaultHandle(vaultId, vaultOwner);
                
                // ------------------------------------------------------------------
                // Update vault state
                // ------------------------------------------------------------------

                const updatedVaultState : (vaultRecordType*loanTokenRecordType) = updateVaultState(vaultHandle, s);
                var vault               : vaultRecordType                       := updatedVaultState.0;
                var loanTokenRecord     : loanTokenRecordType                   := updatedVaultState.1;
                const vaultAddress      : address                               = vault.address;

                // ------------------------------------------------------------------
                // Register vaultDepositStakedMvn action on the Staking Contract (e.g. Doorman)
                // ------------------------------------------------------------------
                
                // get staking contract address
                const stakingContractAddress : address = getStakingContractAddress(collateralTokenRecord.stakingContractAddress);

                const vaultDepositStakedTokenOperation : operation = onDepositStakedTokenToVaultOperation(
                    vaultOwner,                         // vault owner
                    vaultAddress,                       // vault address
                    depositAmount,                      // deposit amount
                    stakingContractAddress              // staking contract address
                );
                operations := vaultDepositStakedTokenOperation # operations;
                
                // get vault staked balance from staking contract (e.g. doorman contract - includes unclaimed exit fee rewards, does not include satellite rewards)
                // - for better accuracy, there could be a frontend call to compound rewards for the vault first
                const currentVaultStakedTokenBalance : nat = getBalanceFromStakingContract(vault.address, stakingContractAddress);

                // Calculate new collateral balance
                const newCollateralBalance : nat = currentVaultStakedTokenBalance + depositAmount;

                // ------------------------------------------------------------------
                // Update storage
                // ------------------------------------------------------------------

                // Update vaults
                vault.collateralBalanceLedger[collateralTokenName]  := newCollateralBalance;
                s.vaults[vaultHandle]                               := vault;

                // Update loan token
                s.loanTokenLedger[vault.loanToken]                  := loanTokenRecord;

                // Update collateral token record
                collateralTokenRecord.totalDeposited                := collateralTokenRecord.totalDeposited + depositAmount;
                s.collateralTokenLedger[collateralTokenName]        := collateralTokenRecord;
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(* withdrawStakedToken lambda *)
function lambdaVaultWithdrawStakedToken(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation)  := nil;
    
    // Verify that %vaultWithdrawStakedToken entrypoint is not paused (e.g. if glass broken)
    verifyEntrypointIsNotPaused(s.breakGlassConfig.vaultWithdrawStakedTokenIsPaused, error_VAULT_WITHDRAW_STAKED_TOKEN_ENTRYPOINT_IN_LENDING_CONTROLLER_CONTRACT_PAUSED);

    case lendingControllerLambdaAction of [
        |   LambdaVaultWithdrawStakedToken(vaultWithdrawStakedTokenParams) -> {
                
                // init variables for convenience
                const vaultId                   : vaultIdType       = vaultWithdrawStakedTokenParams.vaultId;
                const withdrawAmount            : nat               = vaultWithdrawStakedTokenParams.withdrawAmount;
                const collateralTokenName       : string            = vaultWithdrawStakedTokenParams.tokenName;
                const vaultOwner                : vaultOwnerType    = Mavryk.get_sender();

                var collateralTokenRecord : collateralTokenRecordType := getCollateralTokenRecord(collateralTokenName, s);

                // Check if token (e.g. sMVN) exists in collateral token ledger
                checkCollateralTokenExists(collateralTokenName, s);

                // Verify that collateral token is of staked token type
                verifyCollateralTokenIsStakedToken(collateralTokenRecord);

                // Make vault handle
                const vaultHandle : vaultHandleType = makeVaultHandle(vaultId, vaultOwner);
                
                // ------------------------------------------------------------------
                // Update vault state
                // ------------------------------------------------------------------

                const updatedVaultState : (vaultRecordType*loanTokenRecordType) = updateVaultState(vaultHandle, s);
                var vault               : vaultRecordType                       := updatedVaultState.0;
                var loanTokenRecord     : loanTokenRecordType                   := updatedVaultState.1;
                const vaultAddress      : address                               = vault.address;

                // ------------------------------------------------------------------
                // Register vaultWithdrawStakedToken action on the Staking Contract (e.g. Doorman)
                // ------------------------------------------------------------------

                // get staking contract address
                const stakingContractAddress : address = getStakingContractAddress(collateralTokenRecord.stakingContractAddress);

                const vaultWithdrawStakedTokenOperation : operation = onWithdrawStakedTokenFromVaultOperation(
                    vaultOwner,                         // vault owner
                    vaultAddress,                       // vault address
                    withdrawAmount,                     // withdraw amount
                    stakingContractAddress              // staking contract address
                );
                operations := vaultWithdrawStakedTokenOperation # operations;
                
                // get vault staked balance from staking contract (e.g. doorman contract - includes unclaimed exit fee rewards, does not include satellite rewards)
                // - for better accuracy, there could be a frontend call to compound rewards for the vault first
                const currentVaultStakedTokenBalance : nat = getBalanceFromStakingContract(vault.address, stakingContractAddress);

                // Calculate new collateral balance - verify that withdrawAmount is less than currentVaultStakedMvnBalance
                verifyLessThanOrEqual(withdrawAmount, currentVaultStakedTokenBalance, error_CANNOT_WITHDRAW_MORE_THAN_TOTAL_COLLATERAL_BALANCE);
                const newCollateralBalance : nat = abs(currentVaultStakedTokenBalance - withdrawAmount);

                // ------------------------------------------------------------------
                // Update storage
                // ------------------------------------------------------------------

                // Update vaults
                vault.collateralBalanceLedger[collateralTokenName]  := newCollateralBalance;
                s.vaults[vaultHandle]                               := vault;

                // Update loan token
                s.loanTokenLedger[vault.loanToken]                  := loanTokenRecord;
                
                // Update collateral token record
                verifyLessThanOrEqual(withdrawAmount, collateralTokenRecord.totalDeposited, error_WRONG_INPUT_PROVIDED);
                collateralTokenRecord.totalDeposited                := abs(collateralTokenRecord.totalDeposited - withdrawAmount);
                s.collateralTokenLedger[collateralTokenName]        := collateralTokenRecord;
            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Vault Staked Token Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Lending Controller Lambdas End
//
// ------------------------------------------------------------------------------