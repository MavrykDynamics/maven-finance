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



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 
    
    case lendingControllerLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);

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
                    |   ConfiginterestTreasuryShare (_v)    -> s.config.interestTreasuryShare           := updateConfigNewValue
                ];
            }
        |   _ -> skip
    ];
  
} with (noOperations, s)



(* updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s: lendingControllerStorageType) : return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin 
    
    case lendingControllerLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s: lendingControllerStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 
    
    case lendingControllerLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
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
                
                // Lending Controller Vault Entrypoints
                if s.breakGlassConfig.createVaultIsPaused then skip
                else s.breakGlassConfig.createVaultIsPaused := True;

                if s.breakGlassConfig.closeVaultIsPaused then skip
                else s.breakGlassConfig.closeVaultIsPaused := True;

                if s.breakGlassConfig.registerWithdrawalIsPaused then skip
                else s.breakGlassConfig.registerWithdrawalIsPaused := True;

                if s.breakGlassConfig.registerDepositIsPaused then skip
                else s.breakGlassConfig.registerDepositIsPaused := True;

                if s.breakGlassConfig.liquidateVaultIsPaused then skip
                else s.breakGlassConfig.liquidateVaultIsPaused := True;

                if s.breakGlassConfig.borrowIsPaused then skip
                else s.breakGlassConfig.borrowIsPaused := True;

                if s.breakGlassConfig.repayIsPaused then skip
                else s.breakGlassConfig.repayIsPaused := True;

                // Vault Staked MVK Entrypoints
                if s.breakGlassConfig.vaultDepositStakedMvkIsPaused then skip
                else s.breakGlassConfig.vaultDepositStakedMvkIsPaused := True;

                if s.breakGlassConfig.vaultWithdrawStakedMvkIsPaused then skip
                else s.breakGlassConfig.vaultWithdrawStakedMvkIsPaused := True;

                if s.breakGlassConfig.vaultLiquidateStakedMvkIsPaused then skip
                else s.breakGlassConfig.vaultLiquidateStakedMvkIsPaused := True;

                // Vault Entrypoints
                if s.breakGlassConfig.vaultDelegateTezToBakerIsPaused then skip
                else s.breakGlassConfig.vaultDelegateTezToBakerIsPaused := True;

                if s.breakGlassConfig.vaultDelegateMvkToSatelliteIsPaused then skip
                else s.breakGlassConfig.vaultDelegateMvkToSatelliteIsPaused := True;

                if s.breakGlassConfig.vaultWithdrawIsPaused then skip
                else s.breakGlassConfig.vaultWithdrawIsPaused := True;

                if s.breakGlassConfig.vaultDepositIsPaused then skip
                else s.breakGlassConfig.vaultDepositIsPaused := True;

                if s.breakGlassConfig.vaultEditDepositorIsPaused then skip
                else s.breakGlassConfig.vaultEditDepositorIsPaused := True;

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
            
                // Lending Controller Vault Entrypoints
                if s.breakGlassConfig.createVaultIsPaused then s.breakGlassConfig.createVaultIsPaused := False
                else skip;

                if s.breakGlassConfig.closeVaultIsPaused then s.breakGlassConfig.closeVaultIsPaused := False
                else skip;

                if s.breakGlassConfig.registerWithdrawalIsPaused then s.breakGlassConfig.registerWithdrawalIsPaused := False
                else skip;

                if s.breakGlassConfig.registerDepositIsPaused then s.breakGlassConfig.registerDepositIsPaused := False
                else skip;

                if s.breakGlassConfig.liquidateVaultIsPaused then s.breakGlassConfig.liquidateVaultIsPaused := False
                else skip;

                if s.breakGlassConfig.borrowIsPaused then s.breakGlassConfig.borrowIsPaused := False
                else skip;

                if s.breakGlassConfig.repayIsPaused then s.breakGlassConfig.repayIsPaused := False
                else skip;

                // Vault Staked MVK Entrypoints
                if s.breakGlassConfig.vaultDepositStakedMvkIsPaused then s.breakGlassConfig.vaultDepositStakedMvkIsPaused := False
                else skip;

                if s.breakGlassConfig.vaultWithdrawStakedMvkIsPaused then s.breakGlassConfig.vaultWithdrawStakedMvkIsPaused := False
                else skip;

                if s.breakGlassConfig.vaultLiquidateStakedMvkIsPaused then s.breakGlassConfig.vaultLiquidateStakedMvkIsPaused := False
                else skip;

                // Vault Entrypoints
                if s.breakGlassConfig.vaultDelegateTezToBakerIsPaused then s.breakGlassConfig.vaultDelegateTezToBakerIsPaused := False
                else skip;

                if s.breakGlassConfig.vaultDelegateMvkToSatelliteIsPaused then s.breakGlassConfig.vaultDelegateMvkToSatelliteIsPaused := False
                else skip;

                if s.breakGlassConfig.vaultWithdrawIsPaused then s.breakGlassConfig.vaultWithdrawIsPaused := False
                else skip;

                if s.breakGlassConfig.vaultDepositIsPaused then s.breakGlassConfig.vaultDepositIsPaused := False
                else skip;
            
                if s.breakGlassConfig.vaultEditDepositorIsPaused then s.breakGlassConfig.vaultEditDepositorIsPaused := False
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

                        // Lending Controller Vault Entrypoints
                        CreateVault (_v)                -> s.breakGlassConfig.createVaultIsPaused              := _v
                    |   CloseVault (_v)                 -> s.breakGlassConfig.closeVaultIsPaused               := _v
                    |   RegisterDeposit (_v)            -> s.breakGlassConfig.registerDepositIsPaused          := _v
                    |   RegisterWithdrawal (_v)         -> s.breakGlassConfig.registerWithdrawalIsPaused       := _v
                    |   LiquidateVault (_v)             -> s.breakGlassConfig.liquidateVaultIsPaused           := _v
                    |   Borrow (_v)                     -> s.breakGlassConfig.borrowIsPaused                   := _v
                    |   Repay (_v)                      -> s.breakGlassConfig.repayIsPaused                    := _v

                        // Vault Staked MVK Entrypoints
                    |   VaultDepositStakedMvk (_v)      -> s.breakGlassConfig.vaultDepositStakedMvkIsPaused    := _v
                    |   VaultWithdrawStakedMvk (_v)     -> s.breakGlassConfig.vaultWithdrawStakedMvkIsPaused   := _v
                    |   VaultLiquidateStakedMvk (_v)    -> s.breakGlassConfig.vaultLiquidateStakedMvkIsPaused  := _v

                        // Vault Entrypoints
                    |   VaultDelegateTezToBaker (_v)         -> s.breakGlassConfig.vaultDelegateTezToBakerIsPaused       := _v
                    |   VaultDelegateMvkToSatellite (_v)     -> s.breakGlassConfig.vaultDelegateMvkToSatelliteIsPaused   := _v
                    |   VaultWithdraw (_v)                   -> s.breakGlassConfig.vaultWithdrawIsPaused                 := _v
                    |   VaultDeposit (_v)                    -> s.breakGlassConfig.vaultDepositIsPaused                  := _v
                    |   VaultEditDepositor (_v)              -> s.breakGlassConfig.vaultEditDepositorIsPaused            := _v

                ]
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)


// ------------------------------------------------------------------------------
// Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Token Pool Lambdas Begin
// ------------------------------------------------------------------------------

(* setLoanToken lambda *)
function lambdaSetLoanToken(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case lendingControllerLambdaAction of [
        |   LambdaSetLoanToken(setLoanTokenParams) -> {
                
                // check if loan token already exists
                if Big_map.mem(setLoanTokenParams.tokenName, s.loanTokenLedger) then failwith(error_LOAN_TOKEN_ALREADY_EXISTS) else skip;
                
                // update loan token ledger
                s.loanTokenLedger[setLoanTokenParams.tokenName] := createLoanTokenRecord(setLoanTokenParams);

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* addLiquidity lambda *)
function lambdaAddLiquidity(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {

    // init operations
    var operations : list(operation) := nil;

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
                loanTokenRecord := updateLoanTokenState(loanTokenRecord, s);

                // Update Token Ledger
                s.loanTokenLedger[loanTokenName] := loanTokenRecord;


            }
        |   _ -> skip
    ];

} with (operations, s)



(* removeLiquidity lambda *)
function lambdaRemoveLiquidity(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  

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

                // burn LP Token operation
                const burnLpTokenOperation : operation = burnLpToken(
                    initiator,                  // current user
                    lpTokensBurned,             // amount of LP Tokens to burn 
                    lpTokenContractAddress      // LP Token address
                );
                operations := burnLpTokenOperation # operations;
                
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
                loanTokenRecord := updateLoanTokenState(loanTokenRecord, s);

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

(* updateCollateralToken lambda *)
function lambdaUpdateCollateralToken(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s: lendingControllerStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 

    case lendingControllerLambdaAction of [
        |   LambdaUpdateCollateralToken(updateCollateralTokenParams) -> {
                
                const tokenName             : string       = updateCollateralTokenParams.tokenName;
                const tokenContractAddress  : address      = updateCollateralTokenParams.tokenContractAddress;
                const tokenType             : tokenType    = updateCollateralTokenParams.tokenType;
                const tokenDecimals         : nat          = updateCollateralTokenParams.tokenDecimals;
                const oracleType            : string       = updateCollateralTokenParams.oracleType;
                var oracleAddress           : address     := updateCollateralTokenParams.oracleAddress;

                if oracleType = "cfmm" then block {
                    oracleAddress := zeroAddress;
                } else skip;
                
                const collateralTokenRecord : collateralTokenRecordType = record [
                    tokenName            = tokenName;
                    tokenContractAddress = tokenContractAddress;
                    tokenType            = tokenType;
                    tokenDecimals        = tokenDecimals;

                    oracleType           = oracleType;
                    oracleAddress        = oracleAddress;
                ];

                const existingToken: option(collateralTokenRecordType) = 
                if checkInCollateralTokenLedger(collateralTokenRecord, s) then (None : option(collateralTokenRecordType)) else Some (collateralTokenRecord);

                const updatedCollateralTokenLedger : collateralTokenLedgerType = 
                    Map.update(
                        tokenName, 
                        existingToken,
                        s.collateralTokenLedger
                    );

                s.collateralTokenLedger := updatedCollateralTokenLedger

            }
        |   _ -> skip
    ];


} with (noOperations, s)



(* createVault lambda *)
function lambdaCreateVault(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation) := nil;

    case lendingControllerLambdaAction of [
        |   LambdaCreateVault(createVaultParams) -> {
                
                // init loan token name
                const vaultLoanTokenName : string = createVaultParams.loanTokenName; // USDT, EURL 
                const vaultOwner : address = Tezos.get_sender();

                // Get loan token type
                const loanTokenRecord : loanTokenRecordType = case s.loanTokenLedger[vaultLoanTokenName] of [
                        Some(_record) -> _record
                    |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
                ];

                // Get borrow index of token
                const tokenBorrowIndex : nat = loanTokenRecord.borrowIndex;

                // get vault counter
                const newVaultId : vaultIdType = s.vaultCounter;
                
                // make vault handle
                const handle : vaultHandleType = record [
                    id     = newVaultId;
                    owner  = vaultOwner;
                ];

                // check if vault already exists
                if Big_map.mem(handle, s.vaults) then failwith(error_VAULT_ALREADY_EXISTS) else skip;

                // Prepare Vault Metadata
                const vaultMetadata: metadataType = Big_map.literal (list [
                    ("", Bytes.pack("tezos-storage:data"));
                    ("data", createVaultParams.metadata);
                ]); 

                const vaultLambdaLedger : lambdaLedgerType = s.vaultLambdaLedger;

                // params for vault with tez storage origination
                const originateVaultStorage : vaultStorageType = record [
                    admin                       = s.admin;
                    metadata                    = vaultMetadata;
                    governanceAddress           = s.governanceAddress;
                    
                    handle                      = handle;
                    depositors                  = createVaultParams.depositors;

                    lambdaLedger                = vaultLambdaLedger;
                ];

                // originate vault func
                const vaultOrigination : (operation * address) = createVaultFunc(
                    (None : option(key_hash)), 
                    Tezos.get_amount(),
                    originateVaultStorage
                );

                // add vaultWithTezOrigination operation to operations list
                operations := vaultOrigination.0 # operations; 

                // set collateral balance if tez is sent
                var collateralBalanceLedgerMap : collateralBalanceLedgerType := map[];
                if mutezToNatural(Tezos.get_amount()) > 0n then block {
                    collateralBalanceLedgerMap["tez"] := mutezToNatural(Tezos.get_amount())
                } else skip;

                // create vault record
                const vault : vaultRecordType = createVaultRecord(
                    vaultOrigination.1,             // vault address
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
                s.ownerLedger[vaultOwner] := Set.add(newVaultId, ownerVaultSet);

                // increment vault counter 
                s.vaultCounter            := s.vaultCounter + 1n;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* closeVault lambda *)
function lambdaCloseVault(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation) := nil;

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
                var vault : vaultRecordType := getVault(vaultId, vaultOwner, s);

                const vaultAddress : address = vault.address;

                // check that vault has zero loan oustanding
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

                        if collateralTokenRecord.tokenName = "sMVK" then block {

                            // for special case of sMVK

                            // Get Doorman Address from the General Contracts map on the Governance Contract
                            const doormanAddress: address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

                            // create operation to doorman to withdraw all staked MVK from vault to user
                            const onVaultWithdrawStakedMvkParams : onVaultWithdrawStakedMvkType = record [
                                vaultOwner      = vaultOwner;
                                vaultAddress    = vaultAddress;
                                withdrawAmount  = tokenBalance;
                            ];

                            const vaultWithdrawAllStakedMvkOperation : operation = Tezos.transaction(
                                onVaultWithdrawStakedMvkParams,
                                0tez,
                                getOnVaultWithdrawStakedMvkEntrypoint(doormanAddress)
                            );

                            operations := vaultWithdrawAllStakedMvkOperation # operations;

                        } else block {

                            // for other collateral token types besides sMVK
                            const withdrawTokenOperation : operation = withdrawFromVaultOperation(
                                vaultOwner,                         // to_
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

    case lendingControllerLambdaAction of [
        |   LambdaMarkForLiquidation(markForLiquidationParams) -> {
                
                // anyone can mark a vault for liquidation

                // init parameters 
                const vaultId     : vaultIdType      = markForLiquidationParams.vaultId;
                const vaultOwner  : vaultOwnerType   = markForLiquidationParams.vaultOwner;

                const currentTimestamp        : timestamp   = Tezos.get_now();
                const liquidationDelayInMins  : int         = int(s.config.liquidationDelayInMins);

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // Get vault if exists
                var vault : vaultRecordType := getVault(vaultId, vaultOwner, s);
                
                // get vault liquidation timestamps
                const vaultMarkedForLiquidationTimestamp  : timestamp = vault.markedForLiquidationTimestamp;
                const timeWhenVaultCanBeLiquidated        : timestamp = vaultMarkedForLiquidationTimestamp + liquidationDelayInMins;

                // check if vault is liquidatable
                if isLiquidatable(vault, s) 
                then skip 
                else failwith(error_VAULT_IS_NOT_LIQUIDATABLE);

                // check if vault has already been marked for liquidation, if not set markedForLiquidation timestamp
                if currentTimestamp < timeWhenVaultCanBeLiquidated 
                then failwith(error_VAULT_HAS_ALREADY_BEEN_MARKED_FOR_LIQUIDATION)
                else vault.markedForLiquidationTimestamp := currentTimestamp;

                // update vault storage
                s.vaults[vaultHandle] := vault;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* liquidateVault lambda *)
function lambdaLiquidateVault(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation) := nil;

    case lendingControllerLambdaAction of [
        |   LambdaLiquidateVault(liquidateVaultParams) -> {
                
                // init variables                 
                const vaultId           : nat       = liquidateVaultParams.vaultId;
                const vaultOwner        : address   = liquidateVaultParams.vaultOwner;
                const amount            : nat       = liquidateVaultParams.amount;
                const liquidator        : address   = Tezos.get_sender();
                const currentTimestamp  : timestamp = Tezos.get_now();

                // config variables
                const liquidationFeePercent         : nat  = s.config.liquidationFeePercent;       // liquidation fee - penalty fee paid by vault owner to liquidator
                const adminLiquidationFeePercent    : nat  = s.config.adminLiquidationFeePercent;  // admin liquidation fee - penalty fee paid by vault owner to treasury
                const maxDecimalsForCalculation     : nat  = s.config.maxDecimalsForCalculation;
                const liquidationDelayInMins        : int  = int(s.config.liquidationDelayInMins);

                // calculate final amounts to be liquidated
                const liquidationIncentive          : nat = ((liquidationFeePercent * amount * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;
                const liquidatorAmountAndIncentive  : nat = amount + liquidationIncentive;
                const adminLiquidationFee           : nat = ((adminLiquidationFeePercent * amount * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

                // Get Treasury Address and Token Pool Reward Address from the General Contracts map on the Governance Contract
                const treasuryAddress           : address = getContractAddressFromGovernanceContract("lendingTreasury", s.governanceAddress, error_TREASURY_CONTRACT_NOT_FOUND);
                const tokenPoolRewardAddress    : address = getContractAddressFromGovernanceContract("tokenPoolReward", s.governanceAddress, error_TOKEN_POOL_REWARD_CONTRACT_NOT_FOUND);

                // ------------------------------------------------------------------
                // Get Vault record and parameters
                // ------------------------------------------------------------------

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // get vault record
                var vault : vaultRecordType := getVault(vaultId, vaultOwner, s);

                // init vault parameters
                const vaultLoanTokenName            : string  = vault.loanToken; // USDT, EURL, some other crypto coin
                const currentLoanOutstandingTotal   : nat     = vault.loanOutstandingTotal;
                const initialLoanPrincipalTotal     : nat     = vault.loanPrincipalTotal;
                var vaultBorrowIndex                : nat    := vault.borrowIndex;

                // get vault liquidation timestamps
                const vaultMarkedForLiquidationTimestamp  : timestamp = vault.markedForLiquidationTimestamp;
                const timeWhenVaultCanBeLiquidated        : timestamp = vaultMarkedForLiquidationTimestamp + liquidationDelayInMins;

                // ------------------------------------------------------------------
                // Check collaterization and update interest rates
                // ------------------------------------------------------------------

                // check if vault is liquidatable
                if isLiquidatable(vault, s) 
                then skip 
                else failwith(error_VAULT_IS_NOT_LIQUIDATABLE);

                // check if sufficient time has passed since vault was marked for liquidation
                if currentTimestamp < timeWhenVaultCanBeLiquidated
                then failwith(error_VAULT_IS_NOT_READY_TO_BE_LIQUIDATED)
                else skip;

                // Get loan token type
                var loanTokenRecord : loanTokenRecordType := case s.loanTokenLedger[vaultLoanTokenName] of [
                        Some(_record) -> _record
                    |   None          -> failwith(error_LOAN_TOKEN_RECORD_NOT_FOUND)
                ];

                // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
                loanTokenRecord := updateLoanTokenState(loanTokenRecord, s);
                
                // ------------------------------------------------------------------
                // Update Vault interest
                // ------------------------------------------------------------------

                const totalBorrowed          : nat   = loanTokenRecord.totalBorrowed;
                const totalRemaining         : nat   = loanTokenRecord.totalRemaining;
                const tokenBorrowIndex       : nat   = loanTokenRecord.borrowIndex;

                // Init new total amounts
                var newLoanOutstandingTotal  : nat  := currentLoanOutstandingTotal;
                var newLoanPrincipalTotal    : nat  := vault.loanPrincipalTotal;
                var newLoanInterestTotal     : nat  := vault.loanInterestTotal;

                // calculate interest
                newLoanOutstandingTotal := accrueInterestToVault(
                    currentLoanOutstandingTotal,
                    vaultBorrowIndex,
                    tokenBorrowIndex
                );

                if initialLoanPrincipalTotal > newLoanOutstandingTotal then failwith(error_INITIAL_LOAN_PRINCIPAL_TOTAL_CANNOT_BE_GREATER_THAN_LOAN_OUTSTANDING_TOTAL) else skip;
                newLoanInterestTotal := abs(newLoanOutstandingTotal - initialLoanPrincipalTotal);
                
                // ------------------------------------------------------------------
                // Liquidation Process
                // ------------------------------------------------------------------

                // get max vault liquidation amount
                const vaultMaxLiquidationAmount : nat = (newLoanOutstandingTotal * s.config.maxVaultLiquidationPercent) / 10000n;

                // check if there is sufficient loanOutstanding, and calculate remaining loan after liquidation
                if amount > vaultMaxLiquidationAmount then failwith(error_CANNOT_LIQUIDATE_MORE_THAN_VAULT_LOAN_OUTSTANDING_TOTAL) else skip;

                // calculate vault collateral value rebased (1e32 or 10^32)
                const vaultCollateralValueRebased : nat = calculateVaultCollateralValueRebased(vault.collateralBalanceLedger, s);
                
                // // loop tokens in vault collateral balance ledger to be liquidated
                for tokenName -> tokenBalance in map vault.collateralBalanceLedger block {

                    // skip if token balance is 0n
                    if tokenBalance = 0n then skip else block {

                        const collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of [
                                Some(_record) -> _record
                            |   None          -> failwith(error_COLLATERAL_TOKEN_RECORD_NOT_FOUND)
                        ];

                        // get last completed round price of token from Oracle view
                        const collateralTokenLastCompletedRoundPrice : lastCompletedRoundPriceReturnType = getTokenLastCompletedRoundPriceFromOracle(collateralTokenRecord.oracleAddress);
                        
                        const tokenDecimals    : nat  = collateralTokenRecord.tokenDecimals; 
                        const priceDecimals    : nat  = collateralTokenLastCompletedRoundPrice.decimals;
                        const tokenPrice       : nat  = collateralTokenLastCompletedRoundPrice.price;            

                        // calculate required number of decimals to rebase each token to the same unit for comparison                        
                        if tokenDecimals + priceDecimals > maxDecimalsForCalculation then failwith(error_TOO_MANY_DECIMAL_PLACES_FOR_CALCULATION) else skip;
                        const rebaseDecimals : nat  = abs(maxDecimalsForCalculation - (tokenDecimals + priceDecimals));

                        // calculate raw value of collateral balance
                        const tokenValueRaw : nat = tokenBalance * tokenPrice;

                        // rebase token value to 1e32 (or 10^32)
                        const tokenValueRebased : nat = rebaseTokenValue(tokenValueRaw, rebaseDecimals);     

                        // get proportion of collateral token balance against total vault's collateral value
                        const tokenProportion : nat = (tokenValueRebased * fixedPointAccuracy) / vaultCollateralValueRebased;

                        // ------------------------------------------------------------------
                        // Liquidator's Amount
                        // ------------------------------------------------------------------

                        // get balance to be extracted from token and sent to liquidator
                        const liquidatorTokenProportionalValue : nat = tokenProportion * liquidatorAmountAndIncentive;

                        // get quantity of tokens to be liquidated
                        const liquidatorTokenQuantityTotal : nat = (liquidatorTokenProportionalValue / tokenPrice) / fixedPointAccuracy;

                        // calculate new collateral balance
                        if liquidatorTokenQuantityTotal > tokenBalance then failwith(error_CANNOT_LIQUIDATE_MORE_THAN_TOKEN_COLLATERAL_BALANCE) else skip;
                        var newTokenCollateralBalance : nat := abs(tokenBalance - liquidatorTokenQuantityTotal);

                        // send tokens from vault to liquidator
                        const sendTokensFromVaultToLiquidatorOperation : operation = withdrawFromVaultOperation(
                            liquidator,                         // to_
                            liquidatorTokenQuantityTotal,       // token amount to be withdrawn
                            collateralTokenRecord.tokenType,    // token type (i.e. tez, fa12, fa2) 
                            vault.address                       // vault address
                        );
                        operations := sendTokensFromVaultToLiquidatorOperation # operations;

                        // ------------------------------------------------------------------
                        // Treasury's Amount
                        // ------------------------------------------------------------------

                        // get balance to be extracted from token and sent to liquidator
                        const treasuryTokenProportionalValue : nat = tokenProportion * adminLiquidationFee;

                        // get quantity of tokens to be liquidated
                        const treasuryTokenQuantityTotal : nat = (treasuryTokenProportionalValue / tokenPrice) / fixedPointAccuracy;

                        // calculate new collateral balance
                        if treasuryTokenQuantityTotal > tokenBalance then failwith(error_CANNOT_LIQUIDATE_MORE_THAN_TOKEN_COLLATERAL_BALANCE) else skip;
                        newTokenCollateralBalance := abs(tokenBalance - treasuryTokenQuantityTotal);

                        // send tokens from vault to treasury
                        const sendTokensFromVaultToTreasuryOperation : operation = withdrawFromVaultOperation(
                            treasuryAddress,                    // to_
                            treasuryTokenQuantityTotal,         // token amount to be withdrawn
                            collateralTokenRecord.tokenType,    // token type (i.e. tez, fa12, fa2) 
                            vault.address                       // vault address
                        );
                        operations := sendTokensFromVaultToTreasuryOperation # operations;

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

                if amount > newLoanInterestTotal then {
                    
                    // final repayment amount covers interest and principal

                    // calculate remainder amount
                    const principalReductionAmount : nat = abs(amount - newLoanInterestTotal);

                    // set total interest paid and reset loan interest to zero
                    totalInterestPaid := newLoanInterestTotal;
                    newLoanInterestTotal := 0n;

                    // calculate final loan principal
                    if principalReductionAmount > initialLoanPrincipalTotal then failwith(error_PRINCIPAL_REDUCTION_MISCALCULATION) else skip;
                    newLoanPrincipalTotal := abs(initialLoanPrincipalTotal - principalReductionAmount);

                    // set total principal repaid amount
                    totalPrincipalRepaid := principalReductionAmount;

                    // calculate final loan outstanding total
                    if amount > newLoanOutstandingTotal then failwith(error_LOAN_OUTSTANDING_MISCALCULATION) else skip;
                    newLoanOutstandingTotal := abs(newLoanOutstandingTotal - amount);

                } else {

                    // final repayment amount covers interest only

                    // set total interest paid
                    totalInterestPaid := amount;

                    // calculate final loan interest
                    if amount > newLoanInterestTotal then failwith(error_LOAN_INTEREST_MISCALCULATION) else skip;
                    newLoanInterestTotal := abs(newLoanInterestTotal - amount);

                    // calculate final loan outstanding total
                    if amount > newLoanOutstandingTotal then failwith(error_LOAN_OUTSTANDING_MISCALCULATION) else skip;
                    newLoanOutstandingTotal := abs(newLoanOutstandingTotal - amount);

                };

                // Calculate share of interest that goes to the Treasury 
                const interestTreasuryShare : nat = ((totalInterestPaid * s.config.interestTreasuryShare * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

                // Calculate share of interest that goes to the Reward Pool 
                if interestTreasuryShare > totalInterestPaid then failwith(error_INTEREST_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_TOTAL_INTEREST_PAID) else skip;
                const interestRewardPool : nat = abs(totalInterestPaid - interestTreasuryShare);

                // ------------------------------------------------------------------
                // Process Fee Transfers
                // ------------------------------------------------------------------

                // Send interest payment from Lending Controller Token Pool to treasury
                const sendInterestToTreasuryOperation : operation = tokenPoolTransfer(
                    Tezos.get_self_address(),    // from_    
                    treasuryAddress,             // to_
                    interestTreasuryShare,       // amount
                    loanTokenRecord.tokenType    // token type
                );

                // Send interest as rewards from Lending Controller Token Pool to Token Pool Rewards Contract
                const sendInterestRewardToTokenPoolRewardContractOperation : operation = tokenPoolTransfer(
                    Tezos.get_self_address(),       // from_
                    tokenPoolRewardAddress,         // to_
                    interestRewardPool,             // amount
                    loanTokenRecord.tokenType       // token type
                );

                // Update rewards in Token Pool Contract
                const updateRewardsParams : updateRewardsActionType = record [
                    tokenName = vaultLoanTokenName;
                    amount    = interestRewardPool;
                ];

                const updateRewardsInTokenPoolRewardContractOperation : operation = Tezos.transaction(
                    updateRewardsParams,
                    0mutez,
                    getUpdateRewardsEntrypointInTokenPoolRewardContract(tokenPoolRewardAddress)
                );

                operations := list[
                    sendInterestToTreasuryOperation;
                    sendInterestRewardToTokenPoolRewardContractOperation;
                    updateRewardsInTokenPoolRewardContractOperation;
                ];


                // ------------------------------------------------------------------
                // Process Repayment
                // ------------------------------------------------------------------            


                var newTokenPoolTotal   : nat  := 0n;
                var newTotalBorrowed    : nat  := 0n;
                var newTotalRemaining   : nat  := 0n;
                
                // process repayment of principal if total principal repaid quantity is greater than 0
                if totalPrincipalRepaid > 0n then {

                    // calculate new totalBorrowed and totalRemaining
                    if totalPrincipalRepaid > totalBorrowed then failwith(error_INCORRECT_FINAL_TOTAL_BORROWED_AMOUNT) else skip;
                    newTotalBorrowed   := abs(totalBorrowed - totalPrincipalRepaid);
                    newTotalRemaining  := totalRemaining + totalPrincipalRepaid;
                    newTokenPoolTotal  := newTotalRemaining + newTotalBorrowed;

                    // transfer prinicpal repayment amount from liquidator to token pool
                    const transferRepaymentAmountToTokenPoolOperation : operation = tokenPoolTransfer(
                        liquidator,                 // from_
                        Tezos.get_self_address(),   // to_
                        totalPrincipalRepaid,       // amount
                        loanTokenRecord.tokenType   // token type
                    );

                    operations := transferRepaymentAmountToTokenPoolOperation # operations;

                } else skip;

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // update token storage
                loanTokenRecord.tokenPoolTotal          := newTokenPoolTotal;
                loanTokenRecord.totalBorrowed           := newTotalBorrowed;
                loanTokenRecord.totalRemaining          := newTotalRemaining;
                s.loanTokenLedger[vaultLoanTokenName]   := loanTokenRecord;

                // update vault storage
                vault.loanOutstandingTotal      := newLoanOutstandingTotal;    
                vault.loanPrincipalTotal        := newLoanPrincipalTotal;
                vault.loanInterestTotal         := newLoanInterestTotal;
                vault.borrowIndex               := tokenBorrowIndex;
                vault.lastUpdatedBlockLevel     := Tezos.get_level();
                vault.lastUpdatedTimestamp      := Tezos.get_now();
                s.vaults[vaultHandle]           := vault;                

            }
        |   _ -> skip
    ];

} with (operations, s)



(* registerWithdrawal lambda *)
function lambdaRegisterWithdrawal(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations               : list(operation)  := nil;

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

                // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
                if loanTokenRecord.tokenPoolTotal > 0n then {
                    loanTokenRecord := updateLoanTokenState(loanTokenRecord, s);
                } else skip;

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
                if isUnderCollaterized(vault, s) 
                then failwith(error_CANNOT_WITHDRAW_AS_VAULT_IS_UNDERCOLLATERIZED) 
                else skip;

                // ------------------------------------------------------------------
                // Register token withdrawal in vault collateral balance ledger
                // ------------------------------------------------------------------

                // if tez is to be withdrawn, check that Tezos amount should be the same as withdraw amount
                if tokenName = "tez" then block {
                    if mutezToNatural(Tezos.get_amount()) =/= withdrawalAmount then failwith(error_TEZOS_SENT_IS_NOT_EQUAL_TO_WITHDRAW_AMOUNT) else skip;
                } else skip;

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

                s.vaults[vaultHandle]                     := vault;
                s.loanTokenLedger[vaultLoanTokenName]     := loanTokenRecord;
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(* registerDeposit lambda *)
function lambdaRegisterDeposit(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    

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

                // Token Pool: Update utilisation rate, current interest rate, compounded interest and borrow index
                if loanTokenRecord.tokenPoolTotal > 0n then {
                    loanTokenRecord := updateLoanTokenState(loanTokenRecord, s);
                } else skip;

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

                s.vaults[vaultHandle]                     := vault;
                s.loanTokenLedger[vaultLoanTokenName]     := loanTokenRecord;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* borrow lambda *)
function lambdaBorrow(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation):= nil;

    case lendingControllerLambdaAction of [
        |   LambdaBorrow(borrowParams) -> {
                
                // Init variables for convenience
                const vaultId            : nat                     = borrowParams.vaultId; 
                const initialLoanAmount  : nat                     = borrowParams.quantity;
                const initiator          : initiatorAddressType    = Tezos.get_sender();
                var finalLoanAmount      : nat                    := initialLoanAmount;

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
                loanTokenRecord := updateLoanTokenState(loanTokenRecord, s);

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

                // calculate interest
                newLoanOutstandingTotal := accrueInterestToVault(
                    currentLoanOutstandingTotal,
                    vaultBorrowIndex,
                    tokenBorrowIndex
                );

                if initialLoanPrincipalTotal > newLoanOutstandingTotal then failwith(error_INITIAL_LOAN_PRINCIPAL_TOTAL_CANNOT_BE_GREATER_THAN_LOAN_OUTSTANDING_TOTAL) else skip;
                newLoanInterestTotal := abs(newLoanOutstandingTotal - initialLoanPrincipalTotal);

                // ------------------------------------------------------------------
                // Calculate Final Borrow Amount
                // ------------------------------------------------------------------

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
                s.loanTokenLedger[vaultLoanTokenName]  := loanTokenRecord;

                // update vault storage
                vault.loanOutstandingTotal             := newLoanOutstandingTotal;
                vault.loanPrincipalTotal               := newLoanPrincipalTotal;
                vault.loanInterestTotal                := newLoanInterestTotal;
                vault.borrowIndex                      := tokenBorrowIndex;
                vault.lastUpdatedBlockLevel            := Tezos.get_level();
                vault.lastUpdatedTimestamp             := Tezos.get_now();

                // update vault
                s.vaults[vaultHandle] := vault;

                // check if vault is undercollaterized again after loan; if it is not, then allow user to borrow
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

    case lendingControllerLambdaAction of [
        |   LambdaRepay(repayParams) -> {
                
                // Init variables for convenience
                const vaultId                   : nat                     = repayParams.vaultId; 
                const initialRepaymentAmount    : nat                     = repayParams.quantity;
                const initiator                 : initiatorAddressType    = Tezos.get_sender();
                var finalRepaymentAmount        : nat                    := initialRepaymentAmount;

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
                loanTokenRecord := updateLoanTokenState(loanTokenRecord, s);

                // Get loan token parameters
                // const tokenPoolTotal    : nat         = loanTokenRecord.tokenPoolTotal;
                const totalBorrowed     : nat         = loanTokenRecord.totalBorrowed;
                const totalRemaining    : nat         = loanTokenRecord.totalRemaining;
                const tokenBorrowIndex  : nat         = loanTokenRecord.borrowIndex;
                const loanTokenType     : tokenType   = loanTokenRecord.tokenType;

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

                newLoanOutstandingTotal := accrueInterestToVault(
                    currentLoanOutstandingTotal,
                    vaultBorrowIndex,
                    tokenBorrowIndex
                );

                if initialLoanPrincipalTotal > newLoanOutstandingTotal then failwith(error_INITIAL_LOAN_PRINCIPAL_TOTAL_CANNOT_BE_GREATER_THAN_LOAN_OUTSTANDING_TOTAL) else skip;
                newLoanInterestTotal := abs(newLoanOutstandingTotal - initialLoanPrincipalTotal);


                // ------------------------------------------------------------------
                // Calculate Principal / Interest Repayments
                // ------------------------------------------------------------------

                var totalInterestPaid       : nat := 0n;
                var totalPrincipalRepaid    : nat := 0n;

                if finalRepaymentAmount > newLoanInterestTotal then {
                    
                    // final repayment amount covers interest and principal

                    // calculate remainder amount
                    const principalReductionAmount : nat = abs(finalRepaymentAmount - newLoanInterestTotal);

                    // set total interest paid and reset loan interest to zero
                    totalInterestPaid := newLoanInterestTotal;
                    newLoanInterestTotal := 0n;

                    // calculate final loan principal
                    if principalReductionAmount > initialLoanPrincipalTotal then failwith(error_PRINCIPAL_REDUCTION_MISCALCULATION) else skip;
                    newLoanPrincipalTotal := abs(initialLoanPrincipalTotal - principalReductionAmount);

                    // set total principal repaid amount
                    totalPrincipalRepaid := principalReductionAmount;

                    // calculate final loan outstanding total
                    if finalRepaymentAmount > newLoanOutstandingTotal then failwith(error_LOAN_OUTSTANDING_MISCALCULATION) else skip;
                    newLoanOutstandingTotal := abs(newLoanOutstandingTotal - finalRepaymentAmount);

                } else {

                    // final repayment amount covers interest only

                    // set total interest paid
                    totalInterestPaid := finalRepaymentAmount;

                    // calculate final loan interest
                    if finalRepaymentAmount > newLoanInterestTotal then failwith(error_LOAN_INTEREST_MISCALCULATION) else skip;
                    newLoanInterestTotal := abs(newLoanInterestTotal - finalRepaymentAmount);

                    // calculate final loan outstanding total
                    if finalRepaymentAmount > newLoanOutstandingTotal then failwith(error_LOAN_OUTSTANDING_MISCALCULATION) else skip;
                    newLoanOutstandingTotal := abs(newLoanOutstandingTotal - finalRepaymentAmount);

                };

                // Calculate share of interest that goes to the Treasury 
                const interestTreasuryShare : nat = ((totalInterestPaid * s.config.interestTreasuryShare * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

                // Calculate share of interest that goes to the Reward Pool 
                if interestTreasuryShare > totalInterestPaid then failwith(error_INTEREST_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_TOTAL_INTEREST_PAID) else skip;
                const interestRewardPool : nat = abs(totalInterestPaid - interestTreasuryShare);

                // ------------------------------------------------------------------
                // Process Fee Transfers
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
                    interestRewardPool,          // amount
                    loanTokenType                // token type
                );

                operations := list[
                    sendInterestToTreasuryOperation;
                    sendInterestRewardToTokenPoolRewardContractOperation;
                ];

                // ------------------------------------------------------------------
                // Process Repayment
                // ------------------------------------------------------------------            

                var newTokenPoolTotal   : nat  := 0n;
                var newTotalBorrowed    : nat  := 0n;
                var newTotalRemaining   : nat  := 0n;
                
                // process repayment of principal if total principal repaid quantity is greater than 0
                if totalPrincipalRepaid > 0n then {

                    // calculate new totalBorrowed and totalRemaining
                    if totalPrincipalRepaid > totalBorrowed then failwith(error_INCORRECT_FINAL_TOTAL_BORROWED_AMOUNT) else skip;
                    newTotalBorrowed   := abs(totalBorrowed - totalPrincipalRepaid);
                    newTotalRemaining  := totalRemaining + totalPrincipalRepaid;
                    newTokenPoolTotal  := newTotalRemaining + newTotalBorrowed;

                    // transfer prinicpal repayment amount from repayer to token pool
                    const transferRepaymentAmountToTokenPoolOperation : operation = tokenPoolTransfer(
                        initiator,                  // from_
                        Tezos.get_self_address(),   // to_
                        totalPrincipalRepaid,       // amount
                        loanTokenType               // token type
                    );

                    operations := transferRepaymentAmountToTokenPoolOperation # operations;

                } else skip;

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // update token storage
                loanTokenRecord.tokenPoolTotal          := newTokenPoolTotal;
                loanTokenRecord.totalBorrowed           := newTotalBorrowed;
                loanTokenRecord.totalRemaining          := newTotalRemaining;
                s.loanTokenLedger[vaultLoanTokenName]   := loanTokenRecord;

                // update vault storage
                vault.loanOutstandingTotal      := newLoanOutstandingTotal;    
                vault.loanPrincipalTotal        := newLoanPrincipalTotal;
                vault.loanInterestTotal         := newLoanInterestTotal;
                vault.borrowIndex               := tokenBorrowIndex;
                vault.lastUpdatedBlockLevel     := Tezos.get_level();
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

    case lendingControllerLambdaAction of [
        |   LambdaVaultDepositStakedMvk(vaultDepositStakedMvkParams) -> {
                
                // init variables for convenience
                const vaultId         : vaultIdType       = vaultDepositStakedMvkParams.vaultId;
                const depositAmount   : nat               = vaultDepositStakedMvkParams.depositAmount;
                const vaultOwner      : vaultOwnerType    = Tezos.get_sender();
                const tokenName       : string            = "sMVK";

                // Get Doorman Address from the General Contracts map on the Governance Contract
                const doormanAddress: address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

                // check if token (sMVK) exists in collateral token ledger
                checkCollateralTokenExists(tokenName, s);

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // Get vault if exists
                var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);

                const onVaultDepositStakedMvkParams : onVaultDepositStakedMvkType = record [
                    vaultOwner    = vaultOwner;
                    vaultAddress  = vault.address;
                    depositAmount = depositAmount;
                ];
    
                // create operation to doorman to update balance of staked MVK from user to vault
                const vaultDepositStakedMvkOperation : operation = Tezos.transaction(
                    onVaultDepositStakedMvkParams,
                    0tez,
                    getOnVaultDepositStakedMvkEntrypoint(doormanAddress)
                );
                operations := vaultDepositStakedMvkOperation # operations;
                
                // Get current vault staked MVK balance from Doorman contract
                const currentVaultStakedMvkBalance : nat = getUserStakedMvkBalanceFromDoorman(vault.address, s);

                // calculate new collateral balance
                const newCollateralBalance : nat = currentVaultStakedMvkBalance + depositAmount;

                // save and update new balance for collateral token
                vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;
                s.vaults[vaultHandle]                     := vault;
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(* withdrawStakedMvk lambda *)
function lambdaVaultWithdrawStakedMvk(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations        : list(operation)  := nil;

    case lendingControllerLambdaAction of [
        |   LambdaVaultWithdrawStakedMvk(vaultWithdrawStakedMvkParams) -> {
                
                // init variables for convenience
                const vaultId         : vaultIdType       = vaultWithdrawStakedMvkParams.vaultId;
                const withdrawAmount  : nat               = vaultWithdrawStakedMvkParams.withdrawAmount;
                const vaultOwner      : vaultOwnerType    = Tezos.get_sender();
                const tokenName       : string            = "sMVK";

                // Get Doorman Address from the General Contracts map on the Governance Contract
                const doormanAddress: address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

                // check if token (sMVK) exists in collateral token ledger
                checkCollateralTokenExists(tokenName, s);

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // Get vault if exists
                var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);

                // Get current vault staked MVK balance from Doorman contract
                const currentVaultStakedMvkBalance : nat = getUserStakedMvkBalanceFromDoorman(vault.address, s);

                // calculate new collateral balance
                if withdrawAmount > currentVaultStakedMvkBalance then failwith(error_CANNOT_WITHDRAW_MORE_THAN_TOTAL_COLLATERAL_BALANCE) else skip;
                const newCollateralBalance : nat = abs(currentVaultStakedMvkBalance - withdrawAmount);

                const onVaultWithdrawStakedMvkParams : onVaultWithdrawStakedMvkType = record [
                    vaultOwner     = vaultOwner;
                    vaultAddress   = vault.address;
                    withdrawAmount = withdrawAmount;
                ];

                // create operation to doorman to update balance of staked MVK from user to vault
                const onVaultWithdrawStakedMvkOperation : operation = Tezos.transaction(
                    onVaultWithdrawStakedMvkParams,
                    0tez,
                    getOnVaultWithdrawStakedMvkEntrypoint(doormanAddress)
                );
                operations := onVaultWithdrawStakedMvkOperation # operations;
                
                // save and update new balance for collateral token
                vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;
                s.vaults[vaultHandle]                     := vault;
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(* liquidateStakedMvk lambda *)
function lambdaVaultLiquidateStakedMvk(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    // only callable from self (i.e. from LiquidateVault entrypoint, if owner of vault being liquidated has staked mvk as collateral)
    checkSenderIsSelf(unit);

    var operations : list(operation) := nil;

    case lendingControllerLambdaAction of [
        |   LambdaVaultLiquidateStakedMvk(vaultLiquidateStakedMvkParams) -> {
                
                // init variables for convenience
                const vaultId           : vaultIdType       = vaultLiquidateStakedMvkParams.vaultId;
                const vaultOwner        : vaultOwnerType    = vaultLiquidateStakedMvkParams.vaultOwner;
                const liquidator        : address            = vaultLiquidateStakedMvkParams.liquidator;
                const liquidatedAmount  : nat               = vaultLiquidateStakedMvkParams.liquidatedAmount;
                const tokenName         : string            = "sMVK";

                // Get Doorman Address from the General Contracts map on the Governance Contract
                const doormanAddress: address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

                // check if token (sMVK) exists in collateral token ledger
                checkCollateralTokenExists(tokenName, s);

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // Get vault if exists
                var vault : vaultRecordType := getVaultByHandle(vaultHandle, s);
                
                // Get current vault staked MVK balance from Doorman contract
                const currentVaultStakedMvkBalance : nat = getUserStakedMvkBalanceFromDoorman(vault.address, s);

                // calculate new collateral balance
                if liquidatedAmount > currentVaultStakedMvkBalance then failwith(error_CANNOT_LIQUIDATE_MORE_THAN_TOTAL_COLLATERAL_BALANCE) else skip;
                const newCollateralBalance : nat = abs(currentVaultStakedMvkBalance - liquidatedAmount);

                const onVaultLiquidateStakedMvkParams : onVaultLiquidateStakedMvkType = record [
                    vaultOwner       = vaultOwner;
                    vaultAddress     = vault.address;
                    liquidator       = liquidator;
                    liquidatedAmount = liquidatedAmount;
                ];

                // create operation to doorman to update balance of staked MVK from user to vault
                const onVaultLiquidateStakedMvkOperation : operation = Tezos.transaction(
                    onVaultLiquidateStakedMvkParams,
                    0tez,
                    getOnVaultLiquidateStakedMvkEntrypoint(doormanAddress)
                );
                operations := onVaultLiquidateStakedMvkOperation # operations;
                
                // save and update new balance for collateral token in liquidated vault
                vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;
                s.vaults[vaultHandle]                     := vault;

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
