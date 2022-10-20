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
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

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
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

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

    checkSenderIsAdmin(s); // check that sender is admin 

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
                    |   ConfigMockLevel (_v)                -> s.config.mockLevel                       := updateConfigNewValue
                ];
            }
        |   _ -> skip
    ];
  
} with (noOperations, s)



(* updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s: lendingControllerStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 

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
    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

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

    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

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

    checkSenderIsAdmin(s); // check that sender is admin

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

                            // check if loan token already exists
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

                            loanTokenRecord.oracleAddress                       := updateLoanTokenParams.oracleAddress;

                            loanTokenRecord.reserveRatio                         := updateLoanTokenParams.reserveRatio;
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

                            // check if collateral token already exists
                            if Map.mem(createCollateralTokenParams.tokenName, s.collateralTokenLedger) then failwith(error_COLLATERAL_TOKEN_ALREADY_EXISTS) else skip;

                            // update collateral token ledger
                            s.collateralTokenLedger[createCollateralTokenParams.tokenName] := createCollateralTokenRecord(createCollateralTokenParams);

                        }
                    |   UpdateCollateralToken(updateCollateralTokenParams) -> block{

                            const collateralTokenName : string = updateCollateralTokenParams.tokenName;
                    
                            var collateralTokenRecord : collateralTokenRecordType := case s.collateralTokenLedger[collateralTokenName] of [
                                    Some(_record) -> _record
                                |   None          -> failwith(error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
                            ];

                            collateralTokenRecord.oracleAddress          := updateCollateralTokenParams.oracleAddress;

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
    checkRegisterVaultCreationIsNotPaused(s);    // check that %registerVaultCreation entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaRegisterVaultCreation(registerVaultCreationParams) -> {

                // check sender is vault factory contract
                checkSenderIsVaultFactoryContract(s);

                // init params
                const vaultOwner     : address = registerVaultCreationParams.vaultOwner;
                const vaultId        : nat     = registerVaultCreationParams.vaultId;
                const vaultAddress   : address = registerVaultCreationParams.vaultAddress;
                const loanTokenName  : string  = registerVaultCreationParams.loanTokenName;

                // make vault handle
                const handle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // Get loan token record
                var loanTokenRecord : loanTokenRecordType := case s.loanTokenLedger[loanTokenName] of [
                        Some(_record) -> _record
                    |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
                ];

                // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
                if loanTokenRecord.tokenPoolTotal > 0n then {
                    const loanTokenRecordUpdated : (loanTokenRecordType * lendingControllerStorageType) = updateLoanTokenState(loanTokenRecord, s);
                    loanTokenRecord := loanTokenRecordUpdated.0;
                    s := loanTokenRecordUpdated.1;
                } else skip;

                // Get borrow index of token
                const tokenBorrowIndex : nat = loanTokenRecord.borrowIndex;
                
                // init empty collateral balance ledger map
                var collateralBalanceLedgerMap : collateralBalanceLedgerType := map[];
                
                // create vault record
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

    checkAddLiquidityIsNotPaused(s);    // check that %addLiquidity entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaAddLiquidity(addLiquidityParams) -> {
                
                // init variables for convenience
                const loanTokenName       : string              = addLiquidityParams.loanTokenName;
                const amount              : nat                 = addLiquidityParams.amount;
                const initiator           : address             = Tezos.get_sender();

                // Get Token Record
                var loanTokenRecord : loanTokenRecordType := case s.loanTokenLedger[loanTokenName] of [
                        Some(_record) -> _record 
                    |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
                ];

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

                // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
                const loanTokenRecordUpdated : (loanTokenRecordType * lendingControllerStorageType) = updateLoanTokenState(loanTokenRecord, s);
                loanTokenRecord := loanTokenRecordUpdated.0;
                s := loanTokenRecordUpdated.1;

                // Update Token Ledger
                s.loanTokenLedger[loanTokenName] := loanTokenRecord;

                // -----------------------
                // Update Rewards
                // ------------------------

                // Make big map key - (userAddress, loanTokenName)
                const userAddressLoanTokenKey : (address * string) = (initiator, loanTokenRecord.tokenName);

                // Get user's token pool deposit balance 
                const tokenPoolDepositorBalance : nat = case Big_map.find_opt(userAddressLoanTokenKey, s.tokenPoolDepositorLedger) of [
                        Some(_record) -> _record
                    |   None          -> 0n
                ];

                // Update token pool depositor ledger
                s.tokenPoolDepositorLedger[userAddressLoanTokenKey] := tokenPoolDepositorBalance + amount;

                // -----------------------
                // Update Rewards
                // ------------------------
                
                // N.B. update rewards based on user's current token pool deposit balance, and not the updated balance
                const updateRewardsOperation : operation = updateRewardsOperation(initiator, loanTokenName, tokenPoolDepositorBalance, s);
                operations := updateRewardsOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* removeLiquidity lambda *)
function lambdaRemoveLiquidity(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    checkNoAmount(Unit);                   // entrypoint should not receive any tez amount  
    checkRemoveLiquidityIsNotPaused(s);    // check that %removeLiquidity entrypoint is not paused (e.g. if glass broken)

    // init operations
    var operations : list(operation) := nil;

    case lendingControllerLambdaAction of [
        |   LambdaRemoveLiquidity(removeLiquidityParams) -> {
                
                // init variables for convenience
                const loanTokenName         : string    = removeLiquidityParams.loanTokenName;
                const amount                : nat       = removeLiquidityParams.amount;
                const initiator             : address   = Tezos.get_sender();

                // Get Token Record
                var loanTokenRecord : loanTokenRecordType := case s.loanTokenLedger[loanTokenName] of [
                        Some(_record) -> _record 
                    |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
                ];
                
                const loanTokenType             : tokenType   = loanTokenRecord.tokenType;
                const loanTokenPoolTotal        : nat         = loanTokenRecord.tokenPoolTotal;
                const loanTotalRemaining        : nat         = loanTokenRecord.totalRemaining;
                
                const lpTokenContractAddress    : address     = loanTokenRecord.lpTokenContractAddress;
                const lpTokensTotal             : nat         = loanTokenRecord.lpTokensTotal;
                const lpTokensBurned            : nat         = amount;

                // calculate new total of LP Tokens
                if lpTokensBurned > lpTokensTotal then failwith(error_CANNOT_BURN_MORE_THAN_TOTAL_AMOUNT_OF_LP_TOKENS) else skip;
                const newLpTokensTotal : nat = abs(lpTokensTotal - lpTokensBurned);

                // calculate new token pool amount
                if amount > loanTokenPoolTotal then failwith(error_TOKEN_POOL_TOTAL_CANNOT_BE_NEGATIVE) else skip;
                const newTokenPoolTotal : nat = abs(loanTokenPoolTotal - amount);

                // calculate new token pool remaining
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

                // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
                const loanTokenRecordUpdated : (loanTokenRecordType * lendingControllerStorageType) = updateLoanTokenState(loanTokenRecord, s);
                loanTokenRecord := loanTokenRecordUpdated.0;
                s := loanTokenRecordUpdated.1;

                // Update Token Ledger
                s.loanTokenLedger[loanTokenName] := loanTokenRecord;

                // -----------------------
                // Update Rewards
                // ------------------------

                // Make big map key - (userAddress, loanTokenName)
                const userAddressLoanTokenKey : (address * string) = (initiator, loanTokenRecord.tokenName);

                // Get user's token pool deposit balance 
                const tokenPoolDepositorBalance : nat = case Big_map.find_opt(userAddressLoanTokenKey, s.tokenPoolDepositorLedger) of [
                        Some(_record) -> _record
                    |   None          -> 0n
                ];

                // Update token pool depositor ledger
                if amount > tokenPoolDepositorBalance then failwith(error_CANNOT_REMOVE_MORE_LIQUIDITY_THAN_BALANCE) else skip;
                s.tokenPoolDepositorLedger[userAddressLoanTokenKey] := abs(tokenPoolDepositorBalance - amount);

                // -----------------------
                // Update Rewards
                // ------------------------
                
                // N.B. update rewards based on user's current token pool deposit balance, and not the updated balance
                const updateRewardsOperation : operation = updateRewardsOperation(initiator, loanTokenName, tokenPoolDepositorBalance, s);
                operations := updateRewardsOperation # operations;


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

    checkCloseVaultIsNotPaused(s);    // check that %closeVault entrypoint is not paused (e.g. if glass broken)

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

                // check that vault has zero loan outstanding
                checkZeroLoanOutstanding(vault);

                // get tokens and token balances and initiate transfer back to the vault owner
                for tokenName -> tokenBalance in map vault.collateralBalanceLedger block {
                    
                    if tokenName = "tez" then block {

                        const transferTezOperation : operation = transferTez( (Tezos.get_contract_with_error(vaultOwner, "Error. Unable to send tez.") : contract(unit)), tokenBalance * 1mutez );
                        operations := transferTezOperation # operations;

                        vault.collateralBalanceLedger[tokenName]  := 0n;
                        
                    } else block {

                        const collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of [
                                Some(_record) -> _record
                            |   None -> failwith(error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
                        ];

                        if collateralTokenRecord.tokenName = "mvk" then block {

                            // for special case of sMVK
                            const withdrawAllStakedMvkOperation : operation = onWithdrawStakedMvkFromVaultOperation(
                                vaultOwner,                         // vault owner
                                vaultAddress,                       // vault address
                                tokenBalance,                       // withdraw amount
                                s                                   // storage
                            );

                            operations := withdrawAllStakedMvkOperation # operations;

                        } else block {

                            // for other collateral token types besides sMVK
                            const withdrawTokenOperation : operation = liquidateFromVaultOperation(
                                vaultOwner,                         // to_
                                tokenName,                          // token name
                                tokenBalance,                       // token amount to be withdrawn
                                collateralTokenRecord.tokenType,    // token type (i.e. tez, fa12, fa2) 
                                vaultAddress                        // vault address
                            );
                            operations := withdrawTokenOperation # operations;

                        };

                        // save and update balance for collateral token to zero
                        vault.collateralBalanceLedger[tokenName]  := 0n;

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

    checkMarkForLiquidationIsNotPaused(s);    // check that %markForLiquidation entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaMarkForLiquidation(markForLiquidationParams) -> {
                
                // anyone can mark a vault for liquidation

                // init parameters 
                const vaultId     : vaultIdType      = markForLiquidationParams.vaultId;
                const vaultOwner  : vaultOwnerType   = markForLiquidationParams.vaultOwner;

                const mockLevel                     : nat = s.config.mockLevel;
                const configLiquidationDelayInMins  : nat = s.config.liquidationDelayInMins;
                const configLiquidationMaxDuration  : nat = s.config.liquidationMaxDuration;

                const blocksPerMinute               : nat = 60n / Tezos.get_min_block_time();

                s.tempMap["blocksPerMinute"]    := blocksPerMinute;
                s.tempMap["blocksPerMinuteTwo"] := 60n / Tezos.get_min_block_time();
                s.tempMap["getMinBlockTime"]    := Tezos.get_min_block_time();

                const liquidationDelayInBlockLevel  : nat = configLiquidationDelayInMins * blocksPerMinute;                 
                const liquidationEndLevel           : nat = mockLevel + (configLiquidationMaxDuration * blocksPerMinute);                 

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // Get vault if exists
                var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);
                const vaultLoanTokenName : string = vault.loanToken; 

                // Get loan token type
                var loanTokenRecord : loanTokenRecordType := case s.loanTokenLedger[vaultLoanTokenName] of [
                        Some(_record) -> _record
                    |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
                ];

                // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
                const loanTokenRecordUpdated : (loanTokenRecordType * lendingControllerStorageType) = updateLoanTokenState(loanTokenRecord, s);
                loanTokenRecord := loanTokenRecordUpdated.0;
                s := loanTokenRecordUpdated.1;

                const tokenBorrowIndex : nat = loanTokenRecord.borrowIndex;

                // ------------------------------------------------------------------
                // Get current vault borrow index
                // ------------------------------------------------------------------

                // Get user's vault borrow index
                var vaultBorrowIndex : nat := vault.borrowIndex;

                // Get current user loan outstanding
                const currentLoanOutstandingTotal   : nat = vault.loanOutstandingTotal;
                const initialLoanPrincipalTotal     : nat = vault.loanPrincipalTotal;
                
                // Init new total amounts
                var newLoanOutstandingTotal         : nat := currentLoanOutstandingTotal;
                var newLoanInterestTotal            : nat := vault.loanInterestTotal;

                // ------------------------------------------------------------------
                // Calculate vault interest and update storage
                // ------------------------------------------------------------------

                newLoanOutstandingTotal := accrueInterestToVault(
                    currentLoanOutstandingTotal,
                    vaultBorrowIndex,
                    tokenBorrowIndex
                );

                s.tempMap["markForLiquidation - currentLoanOutstandingTotal"] := currentLoanOutstandingTotal;
                s.tempMap["markForLiquidation - newLoanOutstandingTotal"] := newLoanOutstandingTotal;

                if initialLoanPrincipalTotal > newLoanOutstandingTotal then failwith(error_INITIAL_LOAN_PRINCIPAL_TOTAL_CANNOT_BE_GREATER_THAN_LOAN_OUTSTANDING_TOTAL) else skip;
                newLoanInterestTotal := abs(newLoanOutstandingTotal - initialLoanPrincipalTotal);

                // ------------------------------------------------------------------
                // Update Storage (Vault and Loan Token)
                // ------------------------------------------------------------------

                // update loan token record storage                
                s.loanTokenLedger[vaultLoanTokenName]   := loanTokenRecord;

                // update vault storage (no change to principal total)
                vault.loanOutstandingTotal      := newLoanOutstandingTotal;    
                vault.loanInterestTotal         := newLoanInterestTotal;
                vault.borrowIndex               := tokenBorrowIndex;
                vault.lastUpdatedBlockLevel     := mockLevel;
                vault.lastUpdatedTimestamp      := Tezos.get_now();

                s.tempMap["markForLiquidation - initialLoanPrincipalTotal"] := initialLoanPrincipalTotal;
                s.tempMap["markForLiquidation - newLoanInterestTotal"] := newLoanInterestTotal;

                // const checkVaultIsLiquidatable : (bool * lendingControllerStorageType) = isLiquidatable(vault, s);
                // const vaultIsLiquidatableBool = checkVaultIsLiquidatable.0;
                // s := checkVaultIsLiquidatable.1;

                const vaultIsLiquidatable : bool = isLiquidatable(vault, s);

                // update vault
                s.vaults[vaultHandle] := vault;

                s.tempMap["vaultIsLiquidatableBool"] := if vaultIsLiquidatable = True then 1n else 0n;
                s.tempMap["markForLiquidation"] := 123n;
                
                // ------------------------------------------------------------------
                // Check if vault is liquidatable
                // ------------------------------------------------------------------
                
                // check if vault is liquidatable
                if vaultIsLiquidatable then block {

                    // get level when vault can be liquidated
                    const levelWhenVaultCanBeLiquidated  : nat = vault.markedForLiquidationLevel + liquidationDelayInBlockLevel;

                    // check if vault has already been marked for liquidation, if not set markedForLiquidation timestamp
                    if mockLevel < levelWhenVaultCanBeLiquidated 
                    then failwith(error_VAULT_HAS_ALREADY_BEEN_MARKED_FOR_LIQUIDATION)
                    else {
                        vault.markedForLiquidationLevel  := mockLevel;
                        vault.liquidationEndLevel        := liquidationEndLevel;
                    };

                    // update vault storage
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
    checkLiquidateVaultIsNotPaused(s);    // check that %liquidateVault entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaLiquidateVault(liquidateVaultParams) -> {
                
                // init variables                 
                const vaultId           : nat       = liquidateVaultParams.vaultId;
                const vaultOwner        : address   = liquidateVaultParams.vaultOwner;
                const amount            : nat       = liquidateVaultParams.amount;
                const liquidator        : address   = Tezos.get_sender();
                const mockLevel         : nat       = s.config.mockLevel;
                const blocksPerMinute   : nat       = 60n / Tezos.get_min_block_time();

                // config variables
                const liquidationFeePercent         : nat   = s.config.liquidationFeePercent;       // liquidation fee - penalty fee paid by vault owner to liquidator
                const adminLiquidationFeePercent    : nat   = s.config.adminLiquidationFeePercent;  // admin liquidation fee - penalty fee paid by vault owner to treasury
                const maxDecimalsForCalculation     : nat   = s.config.maxDecimalsForCalculation;

                const liquidationDelayInMins        : nat   = s.config.liquidationDelayInMins;
                const liquidationDelayInBlockLevel  : nat   = liquidationDelayInMins * blocksPerMinute;                 

                // Get Treasury Address and Token Pool Reward Address from the General Contracts map on the Governance Contract
                const treasuryAddress               : address = getContractAddressFromGovernanceContract("lendingTreasury", s.governanceAddress, error_TREASURY_CONTRACT_NOT_FOUND);
                const tokenPoolRewardAddress        : address = getContractAddressFromGovernanceContract("tokenPoolReward", s.governanceAddress, error_TOKEN_POOL_REWARD_CONTRACT_NOT_FOUND);

                // ------------------------------------------------------------------
                // Get Vault record and parameters
                // ------------------------------------------------------------------

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // get vault record
                var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);
                const vaultAddress : address = vault.address;

                // init vault parameters
                const vaultLoanTokenName            : string  = vault.loanToken; // USDT, EURL, some other crypto coin
                const currentLoanOutstandingTotal   : nat     = vault.loanOutstandingTotal;
                const initialLoanPrincipalTotal     : nat     = vault.loanPrincipalTotal;
                var vaultBorrowIndex                : nat    := vault.borrowIndex;

                // ------------------------------------------------------------------
                // Check correct duration has passed after being marked for liquidation
                // ------------------------------------------------------------------

                // get level when vault can be liquidated
                const levelWhenVaultCanBeLiquidated  : nat = vault.markedForLiquidationLevel + liquidationDelayInBlockLevel;

                // Check if sufficient time has passed since vault was marked for liquidation
                if mockLevel < levelWhenVaultCanBeLiquidated
                then failwith(error_VAULT_IS_NOT_READY_TO_BE_LIQUIDATED)
                else skip;

                // ------------------------------------------------------------------
                // Check that vault is still within window of opportunity for liquidation to occur
                // ------------------------------------------------------------------

                // Get level when vault can no longer be liquidated 
                const vaultLiquidationEndLevel : nat = vault.liquidationEndLevel;

                // Check if current block level has exceeded vault liquidation end level
                if mockLevel > vaultLiquidationEndLevel
                then failwith(error_VAULT_NEEDS_TO_BE_MARKED_FOR_LIQUIDATION_AGAIN)
                else skip;

                // ------------------------------------------------------------------
                // Get Loan Token and update Loan Token State
                // ------------------------------------------------------------------

                // Get loan token type
                var loanTokenRecord : loanTokenRecordType := case s.loanTokenLedger[vaultLoanTokenName] of [
                        Some(_record) -> _record
                    |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
                ];

                // Update Loan Token State: Latest utilisation rate, current interest rate, compounded interest and borrow index
                const loanTokenRecordUpdated : (loanTokenRecordType * lendingControllerStorageType) = updateLoanTokenState(loanTokenRecord, s);
                loanTokenRecord := loanTokenRecordUpdated.0;
                s := loanTokenRecordUpdated.1;

                // Get loan token parameters
                const tokenPoolTotal    : nat         = loanTokenRecord.tokenPoolTotal;
                const totalBorrowed     : nat         = loanTokenRecord.totalBorrowed;
                const totalRemaining    : nat         = loanTokenRecord.totalRemaining;
                const loanTokenDecimals : nat         = loanTokenRecord.tokenDecimals;
                const loanTokenType     : tokenType   = loanTokenRecord.tokenType;
                const tokenBorrowIndex  : nat         = loanTokenRecord.borrowIndex;

                // Get loan token price
                const loanTokenLastCompletedData  : lastCompletedDataReturnType = getTokenLastCompletedDataFromAggregator(loanTokenRecord.oracleAddress);
                const loanTokenPrice              : nat = loanTokenLastCompletedData.data;            
                const loanTokenPriceDecimals      : nat = loanTokenLastCompletedData.decimals;            
                
                // ------------------------------------------------------------------
                // Update vault interest
                // ------------------------------------------------------------------

                // Init new total amounts 
                var newLoanOutstandingTotal  : nat  := vault.loanOutstandingTotal;
                var newLoanPrincipalTotal    : nat  := vault.loanPrincipalTotal;
                var newLoanInterestTotal     : nat  := vault.loanInterestTotal;

                // Calculate interest
                newLoanOutstandingTotal := accrueInterestToVault(
                    currentLoanOutstandingTotal,
                    vaultBorrowIndex,
                    tokenBorrowIndex
                );

                if initialLoanPrincipalTotal > newLoanOutstandingTotal then failwith(error_INITIAL_LOAN_PRINCIPAL_TOTAL_CANNOT_BE_GREATER_THAN_LOAN_OUTSTANDING_TOTAL) else skip;
                newLoanInterestTotal := abs(newLoanOutstandingTotal - initialLoanPrincipalTotal);

                // ------------------------------------------------------------------
                // Update Storage (Vault and Loan Token)
                // ------------------------------------------------------------------

                // update loan token record storage                
                s.loanTokenLedger[vaultLoanTokenName] := loanTokenRecord;

                // Update vault storage (no change to principal total)
                vault.loanOutstandingTotal      := newLoanOutstandingTotal;    
                vault.loanInterestTotal         := newLoanInterestTotal;
                vault.borrowIndex               := tokenBorrowIndex;
                vault.lastUpdatedBlockLevel     := Tezos.get_level();
                vault.lastUpdatedTimestamp      := Tezos.get_now();

                const vaultIsLiquidatable : bool = isLiquidatable(vault, s);
                
                if vaultIsLiquidatable then skip else failwith(error_VAULT_IS_NOT_LIQUIDATABLE);

                // Update vault
                s.vaults[vaultHandle] := vault;
                
                // ------------------------------------------------------------------
                // Liquidation Process (Checks are passed - liquidatable and after delay)
                // ------------------------------------------------------------------

                // get max vault liquidation amount
                const vaultMaxLiquidationAmount : nat = (newLoanOutstandingTotal * s.config.maxVaultLiquidationPercent) / 10000n;

                // if total liquidation amount is greater than vault max liquidation amount, set the max to the vault max liquidation amount
                // e.g. helpful in race conditions where instead of reverting failure, the transaction can still go through
                var totalLiquidationAmount : nat := amount;
                var refundTotal            : nat := 0n;

                if totalLiquidationAmount > vaultMaxLiquidationAmount then {
                
                    totalLiquidationAmount := vaultMaxLiquidationAmount; 
                    refundTotal            := abs(totalLiquidationAmount - vaultMaxLiquidationAmount);
                
                } else skip;

                // calculate final amounts to be liquidated
                const liquidationIncentive          : nat   = ((liquidationFeePercent * totalLiquidationAmount * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;
                const liquidatorAmountAndIncentive  : nat   = totalLiquidationAmount + liquidationIncentive;
                const adminLiquidationFee           : nat   = ((adminLiquidationFeePercent * totalLiquidationAmount * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;
                
                // calculate vault collateral value rebased (1e32 or 10^32)
                const vaultCollateralValueRebased : nat = calculateVaultCollateralValueRebased(vault.collateralBalanceLedger, s);
                
                // loop tokens in vault collateral balance ledger to be liquidated
                for tokenName -> tokenBalance in map vault.collateralBalanceLedger block {

                    // skip if token balance is 0n
                    if tokenBalance = 0n then skip else block {

                        const collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of [
                                Some(_record) -> _record
                            |   None          -> failwith(error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
                        ];
                        const collateralTokenType : tokenType = collateralTokenRecord.tokenType;

                        // get last completed data of token from Aggregator view
                        const collateralTokenLastCompletedData : lastCompletedDataReturnType = getTokenLastCompletedDataFromAggregator(collateralTokenRecord.oracleAddress);
                        
                        const tokenDecimals    : nat  = collateralTokenRecord.tokenDecimals; 
                        const priceDecimals    : nat  = collateralTokenLastCompletedData.decimals;
                        const tokenPrice       : nat  = collateralTokenLastCompletedData.data;            
                        var   tokenBalance     : nat := tokenBalance;

                        // if token is sMVK, get latest balance from Doorman Contract through on-chain views
                        // - may differ from token balance if rewards have been claimed 
                        // - requires a call to %compound on doorman contract to compound rewards for the vault and get the latest balance
                        if tokenName = "mvk" then {
                    
                            tokenBalance := getUserStakedMvkBalanceFromDoorman(vaultAddress, s);

                        } else skip;

                        // calculate required number of decimals to rebase each token to the same unit for comparison                        
                        if tokenDecimals + priceDecimals > maxDecimalsForCalculation then failwith(error_TOO_MANY_DECIMAL_PLACES_FOR_CALCULATION) else skip;
                        const rebaseDecimals : nat  = abs(maxDecimalsForCalculation - (tokenDecimals + priceDecimals));

                        // calculate raw value of collateral balance (e.g. 1e6 * 1e6 => 1e12)
                        const tokenValueRaw : nat = tokenBalance * tokenPrice;

                        // rebase collateral token value to 1e32 (or 10^32) - (e.g. if above is 1e12, then rebase decimals will be 1e20)
                        const tokenValueRebased : nat = rebaseTokenValue(tokenValueRaw, rebaseDecimals);     

                        // get proportion of collateral token balance against total vault's collateral value (returns 1e27)
                        const tokenProportion : nat = (tokenValueRebased * fixedPointAccuracy) / vaultCollateralValueRebased;

                        // ------------------------------------------------------------------
                        // Rebase decimals for calculation
                        //  - account for exponent differences between collateral and loan token decimals
                        //  - account for exponent differences between collateral price and loan token price decimals from aggregators
                        // ------------------------------------------------------------------

                        const tokenDecimalsMultiplyExponent         : nat = if tokenDecimals > loanTokenDecimals then abs(tokenDecimals - loanTokenDecimals) else 0n;
                        const tokenDecimalsDivideExponent           : nat = if tokenDecimals < loanTokenDecimals then abs(loanTokenDecimals - tokenDecimals) else 0n;
                        
                        const priceTokenDecimalsMultiplyExponent    : nat = if priceDecimals > loanTokenPriceDecimals then abs(priceDecimals - loanTokenPriceDecimals) else 0n;
                        const priceTokenDecimalsDivideExponent      : nat = if priceDecimals < loanTokenPriceDecimals then abs(loanTokenPriceDecimals - priceDecimals) else 0n;

                        // multiple exponents by 10^exp
                        // e.g. if tokenDecimalsMultiplyExponent is 3, then tokenDecimalsMultiplyDifference = 1 * 1000 = 1000;
                        const tokenDecimalsMultiplyDifference       : nat = rebaseTokenValue(1n, tokenDecimalsMultiplyExponent);
                        const tokenDecimalsDivideDifference         : nat = rebaseTokenValue(1n, tokenDecimalsDivideExponent);
                        
                        const priceTokenDecimalsMultiplyDifference  : nat = rebaseTokenValue(1n, priceTokenDecimalsMultiplyExponent);
                        const priceTokenDecimalsDivideDifference    : nat = rebaseTokenValue(1n, priceTokenDecimalsDivideExponent);

                        // ------------------------------------------------------------------
                        // Calculate Liquidator's Amount 
                        // ------------------------------------------------------------------

                        // get value to be extracted and sent to liquidator (1e27 * token decimals e.g. 1e6 => 1e33)
                        const liquidatorTokenProportionalAmount : nat = tokenProportion * liquidatorAmountAndIncentive;

                        // multiply amount by loan token price - with on chain view to get loan token price from aggregator
                        const liquidatorTokenProportionalValue : nat = multiplyTokenAmountByPrice(liquidatorTokenProportionalAmount, loanTokenPrice);
                        
                        // adjust value by token decimals difference - no change if all decimals are the same (e.g. value * 1 * 1 / (1 * 1) )
                        const liquidatorTokenProportionalValueAdjusted : nat = (liquidatorTokenProportionalValue * tokenDecimalsMultiplyDifference * priceTokenDecimalsMultiplyDifference) / (tokenDecimalsDivideDifference * priceTokenDecimalsDivideDifference);

                        // get quantity of tokens to be liquidated (final decimals should equal collateral token decimals)
                        const liquidatorTokenQuantityTotal : nat = (liquidatorTokenProportionalValueAdjusted / tokenPrice) / fixedPointAccuracy;

                        // Calculate new collateral balance
                        if liquidatorTokenQuantityTotal > tokenBalance then failwith(error_CANNOT_LIQUIDATE_MORE_THAN_TOKEN_COLLATERAL_BALANCE) else skip;
                        var newTokenCollateralBalance : nat := abs(tokenBalance - liquidatorTokenQuantityTotal);

                        // ------------------------------------------------------------------
                        // Calculate Treasury's Amount 
                        // ------------------------------------------------------------------

                        // get value to be extracted and sent to liquidator
                        const treasuryTokenProportionalAmount : nat = tokenProportion * adminLiquidationFee;
                        
                        // multiply amount by loan token price - with on chain view to get loan token price from aggregator
                        const treasuryTokenProportionalValue : nat = multiplyTokenAmountByPrice(treasuryTokenProportionalAmount, loanTokenPrice);

                        // adjust value by token decimals difference - no change if all decimals are the same (e.g. value * 1 * 1 / (1 * 1) )
                        const treasuryTokenProportionalValueAdjusted : nat = (treasuryTokenProportionalValue * tokenDecimalsMultiplyDifference * priceTokenDecimalsMultiplyDifference) / (tokenDecimalsDivideDifference * priceTokenDecimalsDivideDifference);

                        // get quantity of tokens to be liquidated (final decimals should equal collateral token decimals)
                        const treasuryTokenQuantityTotal : nat = (treasuryTokenProportionalValueAdjusted / tokenPrice) / fixedPointAccuracy;

                        // Calculate new collateral balance
                        if treasuryTokenQuantityTotal > newTokenCollateralBalance then failwith(error_CANNOT_LIQUIDATE_MORE_THAN_TOKEN_COLLATERAL_BALANCE) else skip;
                        newTokenCollateralBalance := abs(newTokenCollateralBalance - treasuryTokenQuantityTotal);

                        // ------------------------------------------------------------------
                        // Process liquidation transfer of collateral token
                        // ------------------------------------------------------------------
                        
                        if tokenName = "mvk" then {

                            // use %onVaultLiquidateStakedMvk entrypoint in Doorman Contract to transfer staked MVK balances

                            // send staked mvk from vault to liquidator
                            const sendStakedMvkFromVaultToLiquidatorOperation : operation = onLiquidateStakedMvkFromVaultOperation(
                                vaultAddress,                       // vault address
                                liquidator,                         // liquidator              
                                liquidatorTokenQuantityTotal,       // liquidated amount
                                s                                   // storage
                            );                

                            operations := sendStakedMvkFromVaultToLiquidatorOperation # operations;

                            // send staked mvk from vault to treasury
                            const sendStakedMvkFromVaultToTreasuryOperation : operation = onLiquidateStakedMvkFromVaultOperation(
                                vaultAddress,                       // vault address
                                treasuryAddress,                    // liquidator              
                                treasuryTokenQuantityTotal,         // liquidated amount
                                s                                   // storage
                            );                

                            operations := sendStakedMvkFromVaultToTreasuryOperation # operations;

                        } else {

                            // use standard token transfer operations

                            // send tokens from vault to liquidator
                            const sendTokensFromVaultToLiquidatorOperation : operation = liquidateFromVaultOperation(
                                liquidator,                         // receiver (i.e. to_)
                                tokenName,                          // token name
                                liquidatorTokenQuantityTotal,       // token amount to be withdrawn
                                collateralTokenType,                // token type (i.e. tez, fa12, fa2) 
                                vaultAddress                        // vault address
                            );
                            operations := sendTokensFromVaultToLiquidatorOperation # operations;

                            // send tokens from vault to treasury
                            const sendTokensFromVaultToTreasuryOperation : operation = liquidateFromVaultOperation(
                                treasuryAddress,                    // receiver (i.e. to_)
                                tokenName,                          // token name
                                treasuryTokenQuantityTotal,         // token amount to be withdrawn
                                collateralTokenType,                // token type (i.e. tez, fa12, fa2) 
                                vaultAddress                        // vault address
                            );
                            operations := sendTokensFromVaultToTreasuryOperation # operations;

                        };                        

                        // ------------------------------------------------------------------
                        // Update collateral balance
                        // ------------------------------------------------------------------

                        // save and update new balance for collateral token
                        vault.collateralBalanceLedger[tokenName]  := newTokenCollateralBalance;

                    };

                };

                // ------------------------------------------------------------------
                // Update Interest Records
                // ------------------------------------------------------------------

                var totalInterestPaid       : nat := 0n;
                var totalPrincipalRepaid    : nat := 0n;                

                if totalLiquidationAmount > newLoanInterestTotal then {
                    
                    // total liquidation amount covers both interest and principal

                    // calculate remainder amount
                    const principalReductionAmount : nat = abs(totalLiquidationAmount - newLoanInterestTotal);

                    // set total interest paid and reset loan interest to zero
                    totalInterestPaid := newLoanInterestTotal;
                    newLoanInterestTotal := 0n;

                    // calculate final loan principal
                    if principalReductionAmount > initialLoanPrincipalTotal then failwith(error_PRINCIPAL_REDUCTION_MISCALCULATION) else skip;
                    newLoanPrincipalTotal := abs(initialLoanPrincipalTotal - principalReductionAmount);

                    // set total principal repaid amount
                    // - note: liquidation will not be able to cover entire principal amount as compared to %repay
                    totalPrincipalRepaid := principalReductionAmount;

                } else {

                    // total liquidation amount covers interest only

                    // set total interest paid
                    totalInterestPaid := totalLiquidationAmount;

                    // calculate final loan interest
                    if totalLiquidationAmount > newLoanInterestTotal then failwith(error_LOAN_INTEREST_MISCALCULATION) else skip;
                    newLoanInterestTotal := abs(newLoanInterestTotal - totalLiquidationAmount);

                };

                // calculate final loan outstanding total
                if totalLiquidationAmount > newLoanOutstandingTotal then failwith(error_LOAN_OUTSTANDING_MISCALCULATION) else skip;
                newLoanOutstandingTotal := abs(newLoanOutstandingTotal - totalLiquidationAmount);

                // ------------------------------------------------------------------
                // Calculate Fees from Interest
                // ------------------------------------------------------------------

                // Calculate share of interest that goes to the Treasury 
                const interestSentToTreasury : nat = ((totalInterestPaid * s.config.interestTreasuryShare * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

                // Calculate share of interest that goes to the Reward Pool 
                if interestSentToTreasury > totalInterestPaid then failwith(error_INTEREST_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_TOTAL_INTEREST_PAID) else skip;
                const interestSentToRewardPool : nat = abs(totalInterestPaid - interestSentToTreasury);

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

                // Send interest as rewards from Lending Controller Token Pool to Token Pool Rewards Contract
                const sendInterestRewardToTokenPoolRewardContractOperation : operation = tokenPoolTransfer(
                    Tezos.get_self_address(),       // from_
                    tokenPoolRewardAddress,         // to_
                    interestSentToRewardPool,       // amount
                    loanTokenType                   // token type
                );
                operations := sendInterestRewardToTokenPoolRewardContractOperation # operations;

                // ------------------------------------------------------------------
                // Process repayment of Principal
                // ------------------------------------------------------------------            

                var newTokenPoolTotal   : nat  := tokenPoolTotal;
                var newTotalBorrowed    : nat  := totalBorrowed;
                var newTotalRemaining   : nat  := totalRemaining;
                
                // process repayment of principal if total principal repaid quantity is greater than 0
                if totalPrincipalRepaid > 0n then {

                    // calculate new totalBorrowed and totalRemaining
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
                // Update Storage
                // ------------------------------------------------------------------

                // update token storage
                loanTokenRecord.tokenPoolTotal          := newTokenPoolTotal;
                loanTokenRecord.totalBorrowed           := newTotalBorrowed;
                loanTokenRecord.totalRemaining          := newTotalRemaining;

                // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
                const loanTokenRecordUpdated : (loanTokenRecordType * lendingControllerStorageType) = updateLoanTokenState(loanTokenRecord, s);
                loanTokenRecord := loanTokenRecordUpdated.0;
                s := loanTokenRecordUpdated.1;

                // Update loan token
                s.loanTokenLedger[vaultLoanTokenName]   := loanTokenRecord;

                // update vault storage
                vault.loanOutstandingTotal      := newLoanOutstandingTotal;    
                vault.loanPrincipalTotal        := newLoanPrincipalTotal;
                vault.loanInterestTotal         := newLoanInterestTotal;
                vault.borrowIndex               := tokenBorrowIndex;
                vault.lastUpdatedBlockLevel     := mockLevel;
                vault.lastUpdatedTimestamp      := Tezos.get_now();

                // Update vault                
                s.vaults[vaultHandle]           := vault;                

            }
        |   _ -> skip
    ];

} with (operations, s)



(* registerDeposit lambda *)
function lambdaRegisterDeposit(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    checkRegisterDepositIsNotPaused(s);    // check that %registerDeposit entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaRegisterDeposit(registerDepositParams) -> {
                
                // init variables for convenience
                const vaultHandle     : vaultHandleType   = registerDepositParams.handle;
                const depositAmount   : nat               = registerDepositParams.amount;
                const tokenName       : string            = registerDepositParams.tokenName;
                const initiator       : address           = Tezos.get_sender(); // vault address that initiated deposit

                // get vault
                var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);

                // check if initiator matches vault address
                if vault.address =/= initiator then failwith(error_SENDER_MUST_BE_VAULT_ADDRESS) else skip;

                // ------------------------------------------------------------------
                // Update Loan Token state and get token borrow index
                // ------------------------------------------------------------------

                // Get current vault borrow index, and vault loan token name
                var vaultBorrowIndex      : nat := vault.borrowIndex;
                const vaultLoanTokenName  : string = vault.loanToken; // USDT, EURL, some other crypto coin

                // Get loan token type
                var loanTokenRecord : loanTokenRecordType := case s.loanTokenLedger[vaultLoanTokenName] of [
                        Some(_record) -> _record
                    |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
                ];

                // Get loan token parameters
                const tokenBorrowIndex  : nat = loanTokenRecord.borrowIndex;

                // ------------------------------------------------------------------
                // Accrue interest to vault oustanding
                // ------------------------------------------------------------------

                // Get current user loan outstanding and init new total variables
                const currentLoanOutstandingTotal  : nat = vault.loanOutstandingTotal;
                const initialLoanPrincipalTotal    : nat = vault.loanPrincipalTotal;

                var newLoanOutstandingTotal        : nat := currentLoanOutstandingTotal;
                var newLoanPrincipalTotal          : nat := vault.loanPrincipalTotal;
                var newLoanInterestTotal           : nat := vault.loanInterestTotal;

                // calculate interest
                newLoanOutstandingTotal := accrueInterestToVault(
                    currentLoanOutstandingTotal,
                    vaultBorrowIndex,
                    tokenBorrowIndex
                );

                if initialLoanPrincipalTotal > newLoanOutstandingTotal then failwith(error_INITIAL_LOAN_PRINCIPAL_TOTAL_CANNOT_BE_GREATER_THAN_LOAN_OUTSTANDING_TOTAL) else skip;
                newLoanInterestTotal := abs(newLoanOutstandingTotal - initialLoanPrincipalTotal);

                // ------------------------------------------------------------------
                // Register token deposit in vault collateral balance ledger
                // ------------------------------------------------------------------
                
                // check if token is tez or exists in collateral token ledger
                if tokenName = "tez" then skip else {
                    checkCollateralTokenExists(tokenName, s)    
                };

                // get token collateral balance in vault, set to 0n if not found in vault (i.e. first deposit)
                var vaultTokenCollateralBalance : nat := case vault.collateralBalanceLedger[tokenName] of [
                        Some(_balance) -> _balance
                    |   None           -> 0n
                ];

                // calculate new collateral balance
                const newCollateralBalance : nat = vaultTokenCollateralBalance + depositAmount;

                // ------------------------------------------------------------------
                // Update storage
                // ------------------------------------------------------------------

                vault.loanOutstandingTotal                := newLoanOutstandingTotal;
                vault.loanPrincipalTotal                  := newLoanPrincipalTotal;
                vault.loanInterestTotal                   := newLoanInterestTotal;
                vault.borrowIndex                         := tokenBorrowIndex;
                vault.lastUpdatedBlockLevel               := Tezos.get_level();
                vault.lastUpdatedTimestamp                := Tezos.get_now();
                vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;

                // reset vault liquidation levels if vault is no longer liquidatable
                const vaultIsLiquidatable : bool = isLiquidatable(vault, s);
                if vaultIsLiquidatable then skip else {
                    vault.markedForLiquidationLevel  := 0n;
                    vault.liquidationEndLevel        := 0n;
                };

                // update vault storage
                s.vaults[vaultHandle] := vault;

                // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
                if loanTokenRecord.tokenPoolTotal > 0n then {
                    const loanTokenRecordUpdated : (loanTokenRecordType * lendingControllerStorageType) = updateLoanTokenState(loanTokenRecord, s);
                    loanTokenRecord := loanTokenRecordUpdated.0;
                    s := loanTokenRecordUpdated.1;
                } else skip;
                s.loanTokenLedger[vaultLoanTokenName]     := loanTokenRecord;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* registerWithdrawal lambda *)
function lambdaRegisterWithdrawal(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    checkRegisterWithdrawalIsNotPaused(s);    // check that %registerWithdrawal entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaRegisterWithdrawal(registerWithdrawalParams) -> {
                
                // init variables for convenience
                const vaultHandle         : vaultHandleType   = registerWithdrawalParams.handle;
                const withdrawalAmount    : nat               = registerWithdrawalParams.amount;
                const tokenName           : string            = registerWithdrawalParams.tokenName;
                const initiator           : address           = Tezos.get_sender(); // vault address that initiated withdrawal

                // get vault
                var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);

                // check if initiator matches vault address
                if vault.address =/= initiator then failwith(error_SENDER_MUST_BE_VAULT_ADDRESS) else skip;
                
                // ------------------------------------------------------------------
                // Update Loan Token state and get token borrow index
                // ------------------------------------------------------------------

                // Get current vault borrow index, and vault loan token name
                var vaultBorrowIndex      : nat := vault.borrowIndex;
                const vaultLoanTokenName  : string = vault.loanToken; // USDT, EURL, some other crypto coin

                // Get loan token type
                var loanTokenRecord : loanTokenRecordType := case s.loanTokenLedger[vaultLoanTokenName] of [
                        Some(_record) -> _record
                    |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
                ];

                // Get loan token parameters
                const tokenBorrowIndex  : nat = loanTokenRecord.borrowIndex;

                // ------------------------------------------------------------------
                // Accrue interest to vault oustanding
                // ------------------------------------------------------------------

                // Get current user loan outstanding and init new total variables
                const currentLoanOutstandingTotal  : nat = vault.loanOutstandingTotal;
                const initialLoanPrincipalTotal    : nat = vault.loanPrincipalTotal;

                var newLoanOutstandingTotal        : nat := currentLoanOutstandingTotal;
                var newLoanPrincipalTotal          : nat := vault.loanPrincipalTotal;
                var newLoanInterestTotal           : nat := vault.loanInterestTotal;

                // calculate interest
                newLoanOutstandingTotal := accrueInterestToVault(
                    currentLoanOutstandingTotal,
                    vaultBorrowIndex,
                    tokenBorrowIndex
                );

                if initialLoanPrincipalTotal > newLoanOutstandingTotal then failwith(error_INITIAL_LOAN_PRINCIPAL_TOTAL_CANNOT_BE_GREATER_THAN_LOAN_OUTSTANDING_TOTAL) else skip;
                newLoanInterestTotal := abs(newLoanOutstandingTotal - initialLoanPrincipalTotal);

                // check if vault is undercollaterized, if not then send withdraw operation
                const vaultIsUnderCollaterized : (bool * lendingControllerStorageType) = isUnderCollaterized(vault, s);
                const vaultIsUnderCollaterizedBool = vaultIsUnderCollaterized.0;
                s := vaultIsUnderCollaterized.1;

                if vaultIsUnderCollaterizedBool then failwith(error_CANNOT_WITHDRAW_AS_VAULT_IS_UNDERCOLLATERIZED) else skip;

                // ------------------------------------------------------------------
                // Register token withdrawal in vault collateral balance ledger
                // ------------------------------------------------------------------

                // get token collateral balance in vault, fail if none found
                var vaultTokenCollateralBalance : nat := case vault.collateralBalanceLedger[tokenName] of [
                        Some(_balance) -> _balance
                    |   None -> failwith(error_INSUFFICIENT_COLLATERAL_TOKEN_BALANCE_IN_VAULT)
                ];

                // calculate new vault balance
                if withdrawalAmount > vaultTokenCollateralBalance then failwith(error_CANNOT_WITHDRAW_MORE_THAN_TOTAL_COLLATERAL_BALANCE) else skip;
                const newCollateralBalance : nat  = abs(vaultTokenCollateralBalance - withdrawalAmount);
                
                // ------------------------------------------------------------------
                // Update storage
                // ------------------------------------------------------------------

                vault.loanOutstandingTotal                := newLoanOutstandingTotal;
                vault.loanPrincipalTotal                  := newLoanPrincipalTotal;
                vault.loanInterestTotal                   := newLoanInterestTotal;
                vault.borrowIndex                         := tokenBorrowIndex;
                vault.lastUpdatedBlockLevel               := Tezos.get_level();
                vault.lastUpdatedTimestamp                := Tezos.get_now();
                vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;

                // reset vault liquidation levels if vault is no longer liquidatable
                const vaultIsLiquidatable : bool = isLiquidatable(vault, s);
                if vaultIsLiquidatable then skip else {
                    vault.markedForLiquidationLevel  := 0n;
                    vault.liquidationEndLevel        := 0n;
                };
                
                // update vault storage
                s.vaults[vaultHandle]                     := vault;

                // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
                if loanTokenRecord.tokenPoolTotal > 0n then {

                    const loanTokenRecordUpdated : (loanTokenRecordType * lendingControllerStorageType) = updateLoanTokenState(loanTokenRecord, s);
                    loanTokenRecord := loanTokenRecordUpdated.0;
                    s := loanTokenRecordUpdated.1;
                } else skip;
                s.loanTokenLedger[vaultLoanTokenName]     := loanTokenRecord;
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* borrow lambda *)
function lambdaBorrow(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation):= nil;
    checkBorrowIsNotPaused(s);    // check that %borrow entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaBorrow(borrowParams) -> {
                
                // Init variables for convenience
                const vaultId            : nat                     = borrowParams.vaultId; 
                const initialLoanAmount  : nat                     = borrowParams.quantity;
                const initiator          : initiatorAddressType    = Tezos.get_sender();
                const mockLevel          : nat                     = s.config.mockLevel;

                // Get Treasury Address and Token Pool Reward Address from the General Contracts map on the Governance Contract
                const treasuryAddress: address        = getContractAddressFromGovernanceContract("lendingTreasury", s.governanceAddress, error_TREASURY_CONTRACT_NOT_FOUND);
                const tokenPoolRewardAddress: address = getContractAddressFromGovernanceContract("tokenPoolReward", s.governanceAddress, error_TOKEN_POOL_REWARD_CONTRACT_NOT_FOUND);

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = initiator;
                ];

                // Get vault if exists and vault loan token name
                var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);
                const vaultLoanTokenName : string = vault.loanToken; // USDT, EURL, some other crypto coin

                // Get loan token type
                var loanTokenRecord : loanTokenRecordType := case s.loanTokenLedger[vaultLoanTokenName] of [
                        Some(_record) -> _record
                    |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
                ];

                // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
                const loanTokenRecordUpdated : (loanTokenRecordType * lendingControllerStorageType) = updateLoanTokenState(loanTokenRecord, s);
                loanTokenRecord := loanTokenRecordUpdated.0;
                s := loanTokenRecordUpdated.1;

                // Get loan token parameters
                const reserveRatio      : nat         = loanTokenRecord.reserveRatio;
                const tokenPoolTotal    : nat         = loanTokenRecord.tokenPoolTotal;
                const totalBorrowed     : nat         = loanTokenRecord.totalBorrowed;
                const totalRemaining    : nat         = loanTokenRecord.totalRemaining;
                const loanTokenType     : tokenType   = loanTokenRecord.tokenType;
                const tokenBorrowIndex  : nat         = loanTokenRecord.borrowIndex;

                // ------------------------------------------------------------------
                // Calculate Service Loan Fees
                // ------------------------------------------------------------------
                
                // Charge a minimum loan fee if user is borrowing
                const minimumLoanFee : nat = ((initialLoanAmount * s.config.minimumLoanFeePercent * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

                // Calculate share of fees that goes to the Treasury 
                const minimumLoanFeeToTreasury : nat = ((minimumLoanFee * s.config.minimumLoanFeeTreasuryShare * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

                // Calculate share of fees that goes to the Reward Pool 
                if minimumLoanFeeToTreasury > minimumLoanFee then failwith(error_MINIMUM_LOAN_FEE_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_MINIMUM_LOAN_FEE) else skip;
                const minimumLoanFeeRewardPool : nat = abs(minimumLoanFee - minimumLoanFeeToTreasury);

                // ------------------------------------------------------------------
                // Get current user borrow index
                // ------------------------------------------------------------------

                // Get user's vault borrow index
                var vaultBorrowIndex : nat := vault.borrowIndex;

                // Get current user loan outstanding
                const currentLoanOutstandingTotal : nat = vault.loanOutstandingTotal;
                const initialLoanPrincipalTotal   : nat = vault.loanPrincipalTotal;
                
                // Init new total amounts
                var newLoanOutstandingTotal     : nat := currentLoanOutstandingTotal;
                var newLoanPrincipalTotal       : nat := vault.loanPrincipalTotal;
                var newLoanInterestTotal        : nat := vault.loanInterestTotal;

                // ------------------------------------------------------------------
                // Calculate fees on past loan outstanding
                // ------------------------------------------------------------------

                s.tempMap["borrow-vaultBorrowIndex"] := vaultBorrowIndex;
                s.tempMap["borrow-tokenBorrowIndex"] := tokenBorrowIndex;

                // calculate interest
                newLoanOutstandingTotal := accrueInterestToVault(
                    currentLoanOutstandingTotal,
                    vaultBorrowIndex,
                    tokenBorrowIndex
                );

                s.tempMap["borrow-newLoanOutstandingTotalAfterAccruedInterest"] := newLoanOutstandingTotal;

                if initialLoanPrincipalTotal > newLoanOutstandingTotal then failwith(error_INITIAL_LOAN_PRINCIPAL_TOTAL_CANNOT_BE_GREATER_THAN_LOAN_OUTSTANDING_TOTAL) else skip;
                newLoanInterestTotal := abs(newLoanOutstandingTotal - initialLoanPrincipalTotal);

                // ------------------------------------------------------------------
                // Calculate Final Borrow Amount
                // ------------------------------------------------------------------

                var finalLoanAmount : nat := initialLoanAmount;

                // reduce finalLoanAmount by minimum loan fee
                if minimumLoanFee > finalLoanAmount then failwith(error_LOAN_FEE_CANNOT_BE_GREATER_THAN_BORROWED_AMOUNT) else skip;
                finalLoanAmount := abs(finalLoanAmount - minimumLoanFee);

                // calculate new loan outstanding
                newLoanOutstandingTotal := newLoanOutstandingTotal + initialLoanAmount;

                // increment new principal total
                newLoanPrincipalTotal := newLoanPrincipalTotal + initialLoanAmount;

                // ------------------------------------------------------------------
                // Token Pool Calculations
                // ------------------------------------------------------------------

                // calculate required reserve amount for token in token pool
                const requiredTokenPoolReserves = (tokenPoolTotal * fixedPointAccuracy * reserveRatio) / (10000n * fixedPointAccuracy);

                // calculate new totalBorrowed 
                const newTotalBorrowed   : nat = totalBorrowed + initialLoanAmount;
                
                // calculate new total remaining
                if initialLoanAmount > totalRemaining then failwith(error_INSUFFICIENT_TOKENS_IN_TOKEN_POOL_TO_BE_BORROWED) else skip;
                const newTotalRemaining  : nat = abs(totalRemaining - initialLoanAmount);

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

                const transferFeesToTokenPoolRewardOperation : operation = tokenPoolTransfer(
                    Tezos.get_self_address(),   // from_
                    tokenPoolRewardAddress,     // to_
                    minimumLoanFeeRewardPool,   // amount
                    loanTokenType               // token type
                );

                operations := list[
                    transferLoanToBorrowerOperation; 
                    transferFeesToTreasuryOperation;
                    transferFeesToTokenPoolRewardOperation;
                ];

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------
                
                // update token storage
                loanTokenRecord.tokenPoolTotal         := newTotalBorrowed + newTotalRemaining;
                loanTokenRecord.totalBorrowed          := newTotalBorrowed;
                loanTokenRecord.totalRemaining         := newTotalRemaining;

                // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
                const loanTokenRecordUpdated : (loanTokenRecordType * lendingControllerStorageType) = updateLoanTokenState(loanTokenRecord, s);
                loanTokenRecord := loanTokenRecordUpdated.0;
                s := loanTokenRecordUpdated.1;

                s.loanTokenLedger[vaultLoanTokenName]  := loanTokenRecord;

                // update vault storage
                vault.loanOutstandingTotal             := newLoanOutstandingTotal;
                vault.loanPrincipalTotal               := newLoanPrincipalTotal;
                vault.loanInterestTotal                := newLoanInterestTotal;
                vault.borrowIndex                      := tokenBorrowIndex;
                vault.lastUpdatedBlockLevel            := mockLevel + Tezos.get_level();
                vault.lastUpdatedTimestamp             := Tezos.get_now();

                // update vault
                s.vaults[vaultHandle] := vault;

                // check if vault is undercollaterized again after loan; if it is not, then allow user to borrow
                const vaultIsUnderCollaterized : (bool * lendingControllerStorageType) = isUnderCollaterized(vault, s);
                const vaultIsUnderCollaterizedBool = vaultIsUnderCollaterized.0;
                s := vaultIsUnderCollaterized.1;

                if vaultIsUnderCollaterizedBool then failwith(error_VAULT_IS_UNDERCOLLATERIZED) else skip;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* repay lambda *)
function lambdaRepay(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation) := nil;
    checkRepayIsNotPaused(s);    // check that %repay entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaRepay(repayParams) -> {
                
                // Init variables for convenience
                const vaultId                   : nat                     = repayParams.vaultId; 
                const initialRepaymentAmount    : nat                     = repayParams.quantity;
                const initiator                 : initiatorAddressType    = Tezos.get_sender();
                var finalRepaymentAmount        : nat                    := initialRepaymentAmount;
                const mockLevel                 : nat                     = s.config.mockLevel;

                // Get Treasury Address and Token Pool Reward Address  from the General Contracts map on the Governance Contract
                const treasuryAddress : address = getContractAddressFromGovernanceContract("lendingTreasury", s.governanceAddress, error_TREASURY_CONTRACT_NOT_FOUND);
                const tokenPoolRewardAddress : address = getContractAddressFromGovernanceContract("tokenPoolReward", s.governanceAddress, error_TOKEN_POOL_REWARD_CONTRACT_NOT_FOUND);

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = initiator;
                ];

                // Get vault if exists and vault loan token name
                var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);
                const vaultLoanTokenName : string = vault.loanToken; // USDT, EURL, some other crypto coin

                // Get loan token type
                var loanTokenRecord : loanTokenRecordType := case s.loanTokenLedger[vaultLoanTokenName] of [
                        Some(_record) -> _record
                    |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
                ];

                // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
                const loanTokenRecordUpdated : (loanTokenRecordType * lendingControllerStorageType) = updateLoanTokenState(loanTokenRecord, s);
                loanTokenRecord := loanTokenRecordUpdated.0;
                s := loanTokenRecordUpdated.1;

                // Get loan token parameters
                const tokenPoolTotal      : nat         = loanTokenRecord.tokenPoolTotal;
                const totalBorrowed       : nat         = loanTokenRecord.totalBorrowed;
                const totalRemaining      : nat         = loanTokenRecord.totalRemaining;
                const tokenBorrowIndex    : nat         = loanTokenRecord.borrowIndex;
                const minRepaymentAmount  : nat         = loanTokenRecord.minRepaymentAmount;
                const loanTokenType       : tokenType   = loanTokenRecord.tokenType;

                // check that minimum repayment amount is reached
                if initialRepaymentAmount < minRepaymentAmount then failwith(error_MIN_REPAYMENT_AMOUNT_NOT_REACHED) else skip;

                // ------------------------------------------------------------------
                // Get current user borrow index
                // ------------------------------------------------------------------

                // Get user's vault borrow index
                var vaultBorrowIndex : nat := vault.borrowIndex;

                // Get current user loan outstanding
                const currentLoanOutstandingTotal   : nat = vault.loanOutstandingTotal;
                const initialLoanPrincipalTotal     : nat = vault.loanPrincipalTotal;
                
                // Init new total amounts
                var newLoanOutstandingTotal     : nat := currentLoanOutstandingTotal;
                var newLoanPrincipalTotal       : nat := vault.loanPrincipalTotal;
                var newLoanInterestTotal        : nat := vault.loanInterestTotal;
                
                // ------------------------------------------------------------------
                // Calculate fees on past loan outstanding
                // ------------------------------------------------------------------

                s.tempMap["repay-vaultBorrowIndex"] := vaultBorrowIndex;
                s.tempMap["repay-tokenBorrowIndex"] := tokenBorrowIndex;

                newLoanOutstandingTotal := accrueInterestToVault(
                    currentLoanOutstandingTotal,
                    vaultBorrowIndex,
                    tokenBorrowIndex
                );

                s.tempMap["repay-newLoanOutstandingTotalAfterAccruedInterest"] := newLoanOutstandingTotal;

                if initialLoanPrincipalTotal > newLoanOutstandingTotal then failwith(error_INITIAL_LOAN_PRINCIPAL_TOTAL_CANNOT_BE_GREATER_THAN_LOAN_OUTSTANDING_TOTAL) else skip;
                newLoanInterestTotal := abs(newLoanOutstandingTotal - initialLoanPrincipalTotal);

                s.tempMap["repay-newLoanInterestTotal"] := newLoanInterestTotal;

                // ------------------------------------------------------------------
                // Calculate Principal / Interest Repayments
                // ------------------------------------------------------------------

                var totalInterestPaid       : nat := 0n;
                var totalPrincipalRepaid    : nat := 0n;
                var refundTotal             : nat := 0n;

                if finalRepaymentAmount > newLoanInterestTotal then {
                    
                    // final repayment amount covers interest and principal

                    // calculate remainder amount - i.e. how much principal should be reduced by after all interest has been covered
                    const principalReductionAmount : nat = abs(finalRepaymentAmount - newLoanInterestTotal);

                    // set total interest paid and reset loan interest to zero
                    totalInterestPaid := newLoanInterestTotal;
                    newLoanInterestTotal := 0n;

                    // Calculate refund total if exists - i.e. difference between initial loan principal and principal reduction amount
                    if principalReductionAmount > initialLoanPrincipalTotal then refundTotal := abs(principalReductionAmount - initialLoanPrincipalTotal) else skip;

                    s.tempMap["principalReductionAmount"] := principalReductionAmount;
                    s.tempMap["refundTotal"] := refundTotal;
                    
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

                    // calculate final loan interest
                    if finalRepaymentAmount > newLoanInterestTotal then failwith(error_LOAN_INTEREST_MISCALCULATION) else skip;
                    newLoanInterestTotal := abs(newLoanInterestTotal - finalRepaymentAmount);

                };

                s.tempMap["finalRepaymentAmount"] := finalRepaymentAmount;    

                // calculate final loan outstanding total
                if finalRepaymentAmount > newLoanOutstandingTotal then failwith(error_LOAN_OUTSTANDING_MISCALCULATION) else skip;
                newLoanOutstandingTotal := abs(newLoanOutstandingTotal - finalRepaymentAmount);

                // Calculate share of interest that goes to the Treasury 
                const interestTreasuryShare : nat = ((totalInterestPaid * s.config.interestTreasuryShare * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

                // Calculate share of interest that goes to the Reward Pool 
                if interestTreasuryShare > totalInterestPaid then failwith(error_INTEREST_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_TOTAL_INTEREST_PAID) else skip;
                const interestRewardPoolShare : nat = abs(totalInterestPaid - interestTreasuryShare);

                // ------------------------------------------------------------------
                // Process Interest Repayment - Fee Transfers
                // ------------------------------------------------------------------

                // Send interest payment to treasury
                const sendInterestToTreasuryOperation : operation = tokenPoolTransfer(
                    Tezos.get_self_address(),    // from_
                    treasuryAddress,             // to_
                    interestTreasuryShare,       // amount
                    loanTokenType                // token type
                );

                // Send interest as rewards to Token Pool Rewards Contract
                const sendInterestRewardToTokenPoolRewardContractOperation : operation = tokenPoolTransfer(
                    Tezos.get_self_address(),    // from_   
                    tokenPoolRewardAddress,      // to_
                    interestRewardPoolShare,     // amount
                    loanTokenType                // token type
                );

                operations := list[
                    sendInterestToTreasuryOperation;
                    sendInterestRewardToTokenPoolRewardContractOperation;
                ];

                // ------------------------------------------------------------------
                // Process Principal Repayment
                // ------------------------------------------------------------------            

                var newTokenPoolTotal   : nat  := tokenPoolTotal;
                var newTotalBorrowed    : nat  := totalBorrowed;
                var newTotalRemaining   : nat  := totalRemaining;
                
                // process repayment of principal if total principal repaid quantity is greater than 0
                if totalPrincipalRepaid > 0n then {

                    // calculate new totalBorrowed and totalRemaining
                    if totalPrincipalRepaid > totalBorrowed then failwith(error_INCORRECT_FINAL_TOTAL_BORROWED_AMOUNT) else skip;
                    newTotalBorrowed   := abs(totalBorrowed - totalPrincipalRepaid);
                    newTotalRemaining  := totalRemaining + totalPrincipalRepaid;
                    newTokenPoolTotal  := newTotalRemaining + newTotalBorrowed;

                } else skip;

                const processRepayOperation : operation = tokenPoolTransfer(
                    initiator,                  // from_
                    Tezos.get_self_address(),   // to_
                    initialRepaymentAmount,     // amount
                    loanTokenType               // token type
                );

                operations := processRepayOperation # operations;

                // process refund if necessary
                if refundTotal > 0n then {

                    // note: refundTotal will always be smaller than finalRepaymentAmount 
                    //  - since refundTotal = finalRepaymentAmount - newLoanInterestTotal - initialLoanPrincipalTotal
                    const processRefundOperation : operation = tokenPoolTransfer(
                        Tezos.get_self_address(),   // from_
                        initiator,                  // to_
                        refundTotal,                // amount
                        loanTokenType               // token type
                    );

                    operations := processRefundOperation # operations;   
                
                } else skip;

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // update token storage
                loanTokenRecord.tokenPoolTotal          := newTokenPoolTotal;
                loanTokenRecord.totalBorrowed           := newTotalBorrowed;
                loanTokenRecord.totalRemaining          := newTotalRemaining;

                // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
                const loanTokenRecordUpdated : (loanTokenRecordType * lendingControllerStorageType) = updateLoanTokenState(loanTokenRecord, s);
                loanTokenRecord := loanTokenRecordUpdated.0;
                s := loanTokenRecordUpdated.1;

                s.loanTokenLedger[vaultLoanTokenName]   := loanTokenRecord;

                // update vault storage
                vault.loanOutstandingTotal      := newLoanOutstandingTotal;    
                vault.loanPrincipalTotal        := newLoanPrincipalTotal;
                vault.loanInterestTotal         := newLoanInterestTotal;
                vault.borrowIndex               := tokenBorrowIndex;
                vault.lastUpdatedBlockLevel     := mockLevel;
                vault.lastUpdatedTimestamp      := Tezos.get_now();

                // update vault
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
    checkVaultDepositStakedMvkIsNotPaused(s);    // check that %vaultDepositStakedMvk entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaVaultDepositStakedMvk(vaultDepositStakedMvkParams) -> {
                
                // init variables for convenience
                const vaultId         : vaultIdType       = vaultDepositStakedMvkParams.vaultId;
                const depositAmount   : nat               = vaultDepositStakedMvkParams.depositAmount;
                const vaultOwner      : vaultOwnerType    = Tezos.get_sender();
                const tokenName       : string            = "mvk";

                // check if token (sMVK) exists in collateral token ledger
                checkCollateralTokenExists(tokenName, s);

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // Get vault if exists
                var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);
                const vaultAddress : address = vault.address;

                // ------------------------------------------------------------------
                // Update Loan Token state and get token borrow index
                // ------------------------------------------------------------------

                // Get current vault borrow index, and vault loan token name
                var vaultBorrowIndex      : nat := vault.borrowIndex;
                const vaultLoanTokenName  : string = vault.loanToken; // USDT, EURL, some other crypto coin

                // Get loan token type
                var loanTokenRecord : loanTokenRecordType := case s.loanTokenLedger[vaultLoanTokenName] of [
                        Some(_record) -> _record
                    |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
                ];

                const loanTokenRecordUpdated : (loanTokenRecordType * lendingControllerStorageType) = updateLoanTokenState(loanTokenRecord, s);
                loanTokenRecord := loanTokenRecordUpdated.0;
                s := loanTokenRecordUpdated.1;

                // Get loan token parameters
                const tokenBorrowIndex  : nat = loanTokenRecord.borrowIndex;

                // ------------------------------------------------------------------
                // Accrue interest to vault oustanding
                // ------------------------------------------------------------------

                // Get current user loan outstanding and init new total variables
                const currentLoanOutstandingTotal  : nat = vault.loanOutstandingTotal;
                const initialLoanPrincipalTotal    : nat = vault.loanPrincipalTotal;

                var newLoanOutstandingTotal        : nat := currentLoanOutstandingTotal;
                var newLoanPrincipalTotal          : nat := vault.loanPrincipalTotal;
                var newLoanInterestTotal           : nat := vault.loanInterestTotal;

                // calculate interest
                newLoanOutstandingTotal := accrueInterestToVault(
                    currentLoanOutstandingTotal,
                    vaultBorrowIndex,
                    tokenBorrowIndex
                );

                if initialLoanPrincipalTotal > newLoanOutstandingTotal then failwith(error_INITIAL_LOAN_PRINCIPAL_TOTAL_CANNOT_BE_GREATER_THAN_LOAN_OUTSTANDING_TOTAL) else skip;
                newLoanInterestTotal := abs(newLoanOutstandingTotal - initialLoanPrincipalTotal);

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
                
                // Get current vault staked MVK balance from Doorman contract
                const currentVaultStakedMvkBalance : nat = getUserStakedMvkBalanceFromDoorman(vault.address, s);

                // calculate new collateral balance
                const newCollateralBalance : nat = currentVaultStakedMvkBalance + depositAmount;

                // ------------------------------------------------------------------
                // Update storage
                // ------------------------------------------------------------------

                vault.loanOutstandingTotal                := newLoanOutstandingTotal;
                vault.loanPrincipalTotal                  := newLoanPrincipalTotal;
                vault.loanInterestTotal                   := newLoanInterestTotal;
                vault.borrowIndex                         := tokenBorrowIndex;
                vault.lastUpdatedBlockLevel               := Tezos.get_level();
                vault.lastUpdatedTimestamp                := Tezos.get_now();
                vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;
                s.vaults[vaultHandle]                     := vault;

                // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
                if loanTokenRecord.tokenPoolTotal > 0n then {

                    const loanTokenRecordUpdated : (loanTokenRecordType * lendingControllerStorageType) = updateLoanTokenState(loanTokenRecord, s);
                    loanTokenRecord := loanTokenRecordUpdated.0;
                    s               := loanTokenRecordUpdated.1;

                } else skip;
                s.loanTokenLedger[vaultLoanTokenName]     := loanTokenRecord;
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(* withdrawStakedMvk lambda *)
function lambdaVaultWithdrawStakedMvk(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation)  := nil;
    checkVaultWithdrawStakedMvkIsNotPaused(s);    // check that %vaultWithdrawStakedMvk entrypoint is not paused (e.g. if glass broken)

    case lendingControllerLambdaAction of [
        |   LambdaVaultWithdrawStakedMvk(vaultWithdrawStakedMvkParams) -> {
                
                // init variables for convenience
                const vaultId         : vaultIdType       = vaultWithdrawStakedMvkParams.vaultId;
                const withdrawAmount  : nat               = vaultWithdrawStakedMvkParams.withdrawAmount;
                const vaultOwner      : vaultOwnerType    = Tezos.get_sender();
                const tokenName       : string            = "mvk";

                // check if token (sMVK) exists in collateral token ledger
                checkCollateralTokenExists(tokenName, s);

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // Get vault if exists
                var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);
                const vaultAddress : address = vault.address;

                // ------------------------------------------------------------------
                // Update Loan Token state and get token borrow index
                // ------------------------------------------------------------------

                // Get current vault borrow index, and vault loan token name
                var vaultBorrowIndex      : nat   := vault.borrowIndex;
                const vaultLoanTokenName  : string = vault.loanToken; // USDT, EURL, some other crypto coin

                // Get loan token type
                var loanTokenRecord : loanTokenRecordType := case s.loanTokenLedger[vaultLoanTokenName] of [
                        Some(_record) -> _record
                    |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
                ];

                const loanTokenRecordUpdated : (loanTokenRecordType * lendingControllerStorageType) = updateLoanTokenState(loanTokenRecord, s);
                loanTokenRecord := loanTokenRecordUpdated.0;
                s := loanTokenRecordUpdated.1;

                // Get loan token parameters
                const tokenBorrowIndex  : nat = loanTokenRecord.borrowIndex;

                // ------------------------------------------------------------------
                // Accrue interest to vault oustanding
                // ------------------------------------------------------------------

                // Get current user loan outstanding and init new total variables
                const currentLoanOutstandingTotal  : nat = vault.loanOutstandingTotal;
                const initialLoanPrincipalTotal    : nat = vault.loanPrincipalTotal;

                var newLoanOutstandingTotal        : nat := currentLoanOutstandingTotal;
                var newLoanPrincipalTotal          : nat := vault.loanPrincipalTotal;
                var newLoanInterestTotal           : nat := vault.loanInterestTotal;

                // calculate interest
                newLoanOutstandingTotal := accrueInterestToVault(
                    currentLoanOutstandingTotal,
                    vaultBorrowIndex,
                    tokenBorrowIndex
                );

                if initialLoanPrincipalTotal > newLoanOutstandingTotal then failwith(error_INITIAL_LOAN_PRINCIPAL_TOTAL_CANNOT_BE_GREATER_THAN_LOAN_OUTSTANDING_TOTAL) else skip;
                newLoanInterestTotal := abs(newLoanOutstandingTotal - initialLoanPrincipalTotal);

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
                
                // Get current vault staked MVK balance from Doorman contract
                const currentVaultStakedMvkBalance : nat = getUserStakedMvkBalanceFromDoorman(vault.address, s);

                // calculate new collateral balance                
                if withdrawAmount > currentVaultStakedMvkBalance then failwith(error_CANNOT_WITHDRAW_MORE_THAN_TOTAL_COLLATERAL_BALANCE) else skip;
                const newCollateralBalance : nat = abs(currentVaultStakedMvkBalance - withdrawAmount);

                // ------------------------------------------------------------------
                // Update storage
                // ------------------------------------------------------------------

                vault.loanOutstandingTotal                := newLoanOutstandingTotal;
                vault.loanPrincipalTotal                  := newLoanPrincipalTotal;
                vault.loanInterestTotal                   := newLoanInterestTotal;
                vault.borrowIndex                         := tokenBorrowIndex;
                vault.lastUpdatedBlockLevel               := Tezos.get_level();
                vault.lastUpdatedTimestamp                := Tezos.get_now();
                vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;
                s.vaults[vaultHandle]                     := vault;

                // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
                if loanTokenRecord.tokenPoolTotal > 0n then {
                    const loanTokenRecordUpdated : (loanTokenRecordType * lendingControllerStorageType) = updateLoanTokenState(loanTokenRecord, s);
                    loanTokenRecord := loanTokenRecordUpdated.0;
                    s               := loanTokenRecordUpdated.1;
                } else skip;
                s.loanTokenLedger[vaultLoanTokenName]     := loanTokenRecord;
                
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
