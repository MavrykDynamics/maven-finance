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
                    |   ConfigLiquidationFee (_v)           -> s.config.liquidationFee                  := updateConfigNewValue
                    |   ConfigAdminLiquidationFee (_v)      -> s.config.adminLiquidationFee             := updateConfigNewValue
                    |   ConfigMinimumLoanFee (_v)           -> s.config.minimumLoanFee                  := updateConfigNewValue
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



(* updateCollateralTokenLedger lambda *)
function lambdaUpdateCollateralTokens(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s: lendingControllerStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 

    case lendingControllerLambdaAction of [
        |   LambdaUpdateCollateralTokens(updateCollateralTokenLedgerParams) -> {
                
                const tokenName             : string       = updateCollateralTokenLedgerParams.tokenName;
                const tokenContractAddress  : address      = updateCollateralTokenLedgerParams.tokenContractAddress;
                const tokenType             : tokenType    = updateCollateralTokenLedgerParams.tokenType;
                const decimals              : nat          = updateCollateralTokenLedgerParams.decimals;
                const oracleType            : string       = updateCollateralTokenLedgerParams.oracleType;
                var oracleAddress           : address     := updateCollateralTokenLedgerParams.oracleAddress;

                if oracleType = "cfmm" then block {
                    oracleAddress := zeroAddress;
                } else skip;
                
                const collateralTokenRecord : collateralTokenRecordType = record [
                    tokenName            = tokenName;
                    tokenContractAddress = tokenContractAddress;
                    tokenType            = tokenType;
                    decimals             = decimals;
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
                
                // Vault Entrypoints
                if s.breakGlassConfig.createVaultIsPaused then skip
                else s.breakGlassConfig.createVaultIsPaused := True;

                if s.breakGlassConfig.closeVaultIsPaused then skip
                else s.breakGlassConfig.closeVaultIsPaused := True;

                if s.breakGlassConfig.withdrawFromVaultIsPaused then skip
                else s.breakGlassConfig.withdrawFromVaultIsPaused := True;

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
            
                // Vault Entrypoints
                if s.breakGlassConfig.createVaultIsPaused then s.breakGlassConfig.createVaultIsPaused := False
                else skip;

                if s.breakGlassConfig.closeVaultIsPaused then s.breakGlassConfig.closeVaultIsPaused := False
                else skip;

                if s.breakGlassConfig.withdrawFromVaultIsPaused then s.breakGlassConfig.withdrawFromVaultIsPaused := False
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

                        // Vault Entrypoints
                        CreateVault (_v)                -> s.breakGlassConfig.createVaultIsPaused              := _v
                    |   CloseVault (_v)                 -> s.breakGlassConfig.closeVaultIsPaused               := _v
                    |   WithdrawFromVault (_v)          -> s.breakGlassConfig.withdrawFromVaultIsPaused        := _v
                    |   RegisterDeposit (_v)            -> s.breakGlassConfig.registerDepositIsPaused          := _v
                    |   LiquidateVault (_v)             -> s.breakGlassConfig.liquidateVaultIsPaused           := _v
                    |   Borrow (_v)                     -> s.breakGlassConfig.borrowIsPaused                   := _v
                    |   Repay (_v)                      -> s.breakGlassConfig.repayIsPaused                    := _v

                        // Vault Staked MVK Entrypoints
                    |   VaultDepositStakedMvk (_v)      -> s.breakGlassConfig.vaultDepositStakedMvkIsPaused    := _v
                    |   VaultWithdrawStakedMvk (_v)     -> s.breakGlassConfig.vaultWithdrawStakedMvkIsPaused   := _v
                    |   VaultLiquidateStakedMvk (_v)    -> s.breakGlassConfig.vaultLiquidateStakedMvkIsPaused  := _v
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
                
                // init variables for convenience
                const tokenName                             : string        = setLoanTokenParams.tokenName;
                const tokenContractAddress                  : address       = setLoanTokenParams.tokenContractAddress;
                const tokenType                             : tokenType     = setLoanTokenParams.tokenType;
                const tokenId                               : nat           = setLoanTokenParams.tokenId;

                const lpTokenContractAddress                : address       = setLoanTokenParams.lpTokenContractAddress;
                const lpTokenId                             : nat           = setLoanTokenParams.lpTokenId;

                const reserveRatio                          : nat           = setLoanTokenParams.reserveRatio;

                const optimalUtilisationRate                : nat           = setLoanTokenParams.optimalUtilisationRate;
                const baseInterestRate                      : nat           = setLoanTokenParams.baseInterestRate;
                const maxInterestRate                       : nat           = setLoanTokenParams.maxInterestRate;
                const interestRateBelowOptimalUtilisation   : nat           = setLoanTokenParams.interestRateBelowOptimalUtilisation;
                const interestRateAboveOptimalUtilisation   : nat           = setLoanTokenParams.interestRateAboveOptimalUtilisation;

                const newLoanTokenRecord : loanTokenRecordType = record [
                    
                    tokenName                           = tokenName;
                    tokenContractAddress                = tokenContractAddress;
                    tokenType                           = tokenType;
                    tokenId                             = tokenId;

                    lpTokensTotal                       = 0n;
                    lpTokenContractAddress              = lpTokenContractAddress;
                    lpTokenId                           = lpTokenId;

                    reserveRatio                        = reserveRatio;
                    tokenPoolTotal                      = 0n;
                    totalBorrowed                       = 0n;
                    totalRemaining                      = 0n;

                    utilisationRate                     = 0n;
                    optimalUtilisationRate              = optimalUtilisationRate;
                    baseInterestRate                    = baseInterestRate;
                    maxInterestRate                     = maxInterestRate;
                    interestRateBelowOptimalUtilisation = interestRateBelowOptimalUtilisation;
                    interestRateAboveOptimalUtilisation = interestRateAboveOptimalUtilisation;

                    currentInterestRate                 = 0n;
                    lastUpdatedBlockLevel               = Tezos.get_level();
                    accumulatedRewardsPerShare          = 0n;
                    borrowIndex                         = 0n;

                ];
                
                s.loanTokenLedger[tokenName] := case s.loanTokenLedger[tokenName] of [
                        Some(_record) -> failwith(error_LOAN_TOKEN_RECORD_ALREADY_EXISTS)
                    |   None          -> newLoanTokenRecord
                ];

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* addLiquidity lambda *)
function lambdaAddLiquidity(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    // init operations
    var operations : list(operation) := nil;

    case lendingControllerLambdaAction of [
        |   LambdaAddLiquidity(addLiquidityParams) -> {
                
                // init variables for convenience
                const tokenName           : string              = addLiquidityParams.tokenName;
                const tokensDeposited     : nat                 = addLiquidityParams.tokensDeposited;
                const owner               : address             = addLiquidityParams.owner; 

                // Get Token Record
                var tokenRecord : loanTokenRecordType := case s.loanTokenLedger[tokenName] of [
                        Some(_record) -> _record 
                    |   None          -> failwith("error_LOAN_TOKEN_RECORD_NOT_FOUND")
                ];

                // update pool totals
                tokenRecord.tokenPoolTotal  := tokenRecord.tokenPoolTotal + tokensDeposited;
                tokenRecord.lpTokensTotal   := tokenRecord.lpTokensTotal + tokensDeposited;

                const tokenId                   : nat       = tokenRecord.tokenId;
                const tokenContractAddress      : address   = tokenRecord.tokenContractAddress;
                const lpTokenContractAddress    : address   = tokenRecord.lpTokenContractAddress;

                // Update Token Ledger
                s.loanTokenLedger[tokenName] := tokenRecord;

                // send token from sender to token pool
                const sendTokenToPoolOperation : operation = transferFa2Token(
                    Tezos.get_sender(),               // from_
                    Tezos.get_self_address(),         // to_
                    tokensDeposited,            // token amount
                    tokenId,                    // token id
                    tokenContractAddress        // token contract address
                );
                operations := sendTokenToPoolOperation # operations;

                // mint LP Tokens and send to sender
                const mintLpTokensTokensOperation : operation = mintOrBurnLpToken(owner, int(tokensDeposited), lpTokenContractAddress);
                operations := mintLpTokensTokensOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* removeLiquidity lambda *)
function lambdaRemoveLiquidity(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    // init operations
    var operations : list(operation) := nil;

    case lendingControllerLambdaAction of [
        |   LambdaRemoveLiquidity(removeLiquidityParams) -> {
                
                // init variables for convenience
                const tokenName             : string    = removeLiquidityParams.tokenName;
                const tokensWithdrawn       : nat       = removeLiquidityParams.tokensWithdrawn;
                // const recipient             : address   = removeLiquidityParams.to_; 

                // Get Token Record
                var tokenRecord : loanTokenRecordType := case s.loanTokenLedger[tokenName] of [
                        Some(_record) -> _record 
                    |   None          -> failwith("error_LOAN_TOKEN_RECORD_NOT_FOUND")
                ];
                
                const tokenId                   : nat       = tokenRecord.tokenId;
                const tokenContractAddress      : address   = tokenRecord.tokenContractAddress;
                const tokenPoolTotal            : nat       = tokenRecord.tokenPoolTotal;
                
                const lpTokenContractAddress    : address   = tokenRecord.lpTokenContractAddress;
                const lpTokensTotal             : nat       = tokenRecord.lpTokensTotal;
                const lpTokensBurned            : nat       = tokensWithdrawn;

                // calculate new total of LP Tokens
                if lpTokensBurned > lpTokensTotal then failwith("Error. You cannot burn more than the total amount of LP tokens.") else skip;
                const newLpTokensTotal : nat = abs(lpTokensTotal - lpTokensBurned);

                // calculate new token pool amount
                if tokensWithdrawn > tokenPoolTotal then failwith("Error. Token pool minus tokens withdrawn is negative.") else skip;
                const newTokenPoolTotal : nat = abs(tokenPoolTotal - tokensWithdrawn);

                // burn LP Token operation
                const burnLpTokenOperation : operation = mintOrBurnLpToken(Tezos.get_sender(), (0 - lpTokensBurned), lpTokenContractAddress);
                operations := burnLpTokenOperation # operations;

                // send withdrawn tokens to sender 
                const withdrawnTokensToSenderOperation : operation = transferFa2Token(
                    Tezos.get_self_address(),     // from_
                    Tezos.get_sender(),           // to_
                    tokensWithdrawn,              // token amount
                    tokenId,                      // token id
                    tokenContractAddress          // token contract address
                );
                operations := withdrawnTokensToSenderOperation # operations;

                // update pool totals
                tokenRecord.tokenPoolTotal  := newTokenPoolTotal;
                tokenRecord.lpTokensTotal   := newLpTokensTotal;

                // Update Token Ledger
                s.loanTokenLedger[tokenName] := tokenRecord;
                
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

(* createVault lambda *)
function lambdaCreateVault(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation) := nil;

    case lendingControllerLambdaAction of [
        |   LambdaCreateVault(createVaultParams) -> {
                
                // init loan token name
                const vaultLoanTokenName : string = createVaultParams.loanTokenName; // USDT, EURL 

                // Get loan token type
                const loanTokenRecord : loanTokenRecordType = case s.loanTokenLedger[vaultLoanTokenName] of [
                        Some(_record) -> _record
                    |   None          -> failwith(error_LOAN_TOKEN_NOT_FOUND)
                ];

                // Get borrow index of token
                const tokenBorrowIndex : nat = loanTokenRecord.borrowIndex;

                // get vault counter
                const newVaultId : vaultIdType = s.vaultCounter;
                
                // check if vault id already exists
                if Big_map.mem(newVaultId, s.vaultLedger) then failwith("Error. Vault Id already exists.") else skip;
                
                // make vault handle
                const handle : vaultHandleType = record [
                    id     = newVaultId;
                    owner  = Tezos.get_sender();
                ];

                // check if vault already exists
                if Big_map.mem(handle, s.vaults) then failwith("Error. Vault already exists.") else skip;

                const defaultWhitelistUsers : whitelistUsersType = NoWhitelistUsers(unit);

                // Prepare Vault Metadata
                const vaultMetadata: metadataType = Big_map.literal (list [
                    ("", Bytes.pack("tezos-storage:data"));
                    ("data", createVaultParams.metadata);
                ]); 

                // Add LendingController Address to whitelistContracts map of created Vault
                const vaultWhitelistContracts : whitelistContractsType = map[
                    ("lendingController")  -> (Tezos.get_self_address() : address);
                ];
                
                // Init empty General Contracts map (local contract scope, to be used if necessary)
                const vaultGeneralContracts : generalContractsType = map[];

                // Init break glass config
                const vaultBreakGlassConfig : vaultBreakGlassConfigType = record[
                    vaultDelegateTezToBakerIsPaused         = False;
                    vaultDelegateMvkToSatelliteIsPaused     = False;
                    vaultWithdrawIsPaused                   = False;
                    vaultDepositIsPaused                  = False;
                    vaultEditDepositorIsPaused              = False;
                ];

                const vaultLambdaLedger : lambdaLedgerType = s.vaultLambdaLedger;

                // params for vault with tez storage origination
                const originateVaultStorage : vaultStorageType = record [
                    admin                       = Tezos.get_self_address();
                    metadata                    = vaultMetadata;

                    governanceAddress           = s.governanceAddress;
                    breakGlassConfig            = vaultBreakGlassConfig;

                    whitelistContracts          = vaultWhitelistContracts;
                    generalContracts            = vaultGeneralContracts;

                    handle                      = handle;
                    depositors                  = createVaultParams.depositors;
                    whitelistUsers              = defaultWhitelistUsers;

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

                // create new vault params
                if mutezToNatural(Tezos.get_amount()) > 0n then block {
                    
                    // tez is sent
                    const collateralBalanceLedgerMap : collateralBalanceLedgerType = map[
                        ("tez" : string) -> mutezToNatural(Tezos.get_amount())
                    ];
                    const vault : vaultRecordType = record [
                        
                        address                     = vaultOrigination.1; // vault address
                        collateralBalanceLedger     = collateralBalanceLedgerMap;
                        loanToken                   = loanTokenRecord.tokenName;

                        loanOutstandingTotal        = 0n;
                        loanPrincipalTotal          = 0n;
                        loanInterestTotal           = 0n;
                        borrowIndex                 = tokenBorrowIndex;

                        lastUpdatedBlockLevel       = Tezos.get_level();
                        lastUpdatedTimestamp        = Tezos.get_now();

                    ];
                    
                    // update controller storage with new vault
                    s.vaults := Big_map.update(handle, Some(vault), s.vaults);

                } else block {
                    // no tez is sent
                    const emptyCollateralBalanceLedgerMap : collateralBalanceLedgerType = map[];
                    const vault : vaultRecordType = record [

                        address                     = vaultOrigination.1; // vault address
                        collateralBalanceLedger     = emptyCollateralBalanceLedgerMap;
                        loanToken                   = loanTokenRecord.tokenName;
                        
                        loanOutstandingTotal        = 0n;
                        loanPrincipalTotal          = 0n;
                        loanInterestTotal           = 0n;
                        borrowIndex                 = tokenBorrowIndex;
                        
                        lastUpdatedBlockLevel       = Tezos.get_level();
                        lastUpdatedTimestamp        = Tezos.get_now();
                    ];

                    // update controller storage with new vault
                    s.vaults := Big_map.update(handle, Some(vault), s.vaults);

                };

                // increment vault counter and add vault id to vaultLedger
                s.vaultLedger[newVaultId] := True;
                s.vaultCounter            := s.vaultCounter + 1n;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* closeVault lambda *)
function lambdaCloseVault(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations    : list(operation) := nil;

    case lendingControllerLambdaAction of [
        |   LambdaCloseVault(closeVaultParams) -> {
                
                // only the vault owner can close his own vault

                // init parameters 
                const vaultId     : vaultIdType      = closeVaultParams.vaultId;
                const vaultOwner  : vaultOwnerType   = Tezos.get_sender();
                
                // make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // get vault
                var vault : vaultRecordType := getVault(vaultHandle, s);
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
                            |   None -> failwith("Error. Token does not exist in collateral token record.")
                        ];

                        if collateralTokenRecord.tokenName = "sMVK" then block {

                            // for special case of sMVK

                            // Get Doorman Contract Address from the General Contracts Map on the Governance Contract
                            const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                            const doormanAddress : address = case generalContractsOptView of [
                                    Some (_optionContract) -> case _optionContract of [
                                            Some (_contract)    -> _contract
                                        |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                                    ]
                                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                            ];

                            // create operation to doorman to withdraw all staked MVK from vault to user
                            const vaultWithdrawStakedMvkParams : vaultWithdrawStakedMvkType = record [
                                vaultId         = vaultId;
                                withdrawAmount  = tokenBalance;
                            ];

                            const vaultWithdrawAllStakedMvkOperation : operation = Tezos.transaction(
                                vaultWithdrawStakedMvkParams,
                                0tez,
                                getVaultWithdrawStakedMvkEntrypoint(doormanAddress)
                            );

                            operations := vaultWithdrawAllStakedMvkOperation # operations;

                        } else block {

                            // for other collateral token types besides sMVK

                            const withdrawTokenOperation : operation = case collateralTokenRecord.tokenType of [
                                    Tez(_tez) -> block {
                                        
                                        const withdrawTezOperationParams : vaultWithdrawType = record [
                                            to_      = vaultOwner; 
                                            amount   = tokenBalance;
                                            token    = Tez(_tez);
                                        ];

                                        const withdrawTezOperation : operation = Tezos.transaction(
                                            withdrawTezOperationParams,
                                            0mutez,
                                            getVaultWithdrawEntrypoint(vaultAddress)
                                        );

                                    } with withdrawTezOperation

                                |   Fa12(_token) -> block {

                                        const withdrawFa12OperationParams : vaultWithdrawType = record [
                                            to_      = vaultOwner; 
                                            amount   = tokenBalance;
                                            token    = Fa12(_token);
                                        ];

                                        const withdrawFa12Operation : operation = Tezos.transaction(
                                            withdrawFa12OperationParams,
                                            0mutez,
                                            getVaultWithdrawEntrypoint(vaultAddress)
                                        );

                                    } with withdrawFa12Operation

                                |   Fa2(_token) -> block {

                                        const withdrawFa2OperationParams : vaultWithdrawType = record [
                                            to_      = vaultOwner; 
                                            amount   = tokenBalance;
                                            token    = Fa2(_token);
                                        ];

                                        const withdrawFa2Operation : operation = Tezos.transaction(
                                            withdrawFa2OperationParams,
                                            0mutez,
                                            getVaultWithdrawEntrypoint(vaultAddress)
                                        );

                                    } with withdrawFa2Operation
                                ];

                            operations := withdrawTokenOperation # operations;
                        };

                        // save and update balance for collateral token to zero
                        vault.collateralBalanceLedger[tokenName]  := 0n;

                    }; // end if/else check for tez/token

                }; // end loop for withdraw operations of tez/tokens in vault collateral 


                // remove vault from stroage
                var ownerVaultSet : ownerVaultSetType := case s.ownerLedger[vaultOwner] of [
                        Some (_set) -> _set
                    |   None        -> failwith("Error. Owner vault set not found.")
                ];

                s.ownerLedger[vaultOwner] := Set.remove(vaultId, ownerVaultSet);
                remove vaultHandle from map s.vaults;
                remove vaultId from map s.vaultLedger;
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(* liquidateVault lambda *)
function lambdaLiquidateVault(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations          : list(operation)        := nil;

    case lendingControllerLambdaAction of [
        |   LambdaLiquidateVault(_liquidateVaultParams) -> {
                
                // init variables for convenience
                // const vaultHandle       : vaultHandleType         = liquidateVaultParams.handle; 
                // const loanQuantity      : nat                     = liquidateVaultParams.loanQuantity;
                // const loanToken         : string                  = liquidateVaultParams.loanToken;

                // const recipient         : address                 = Tezos.get_sender();
                // const initiator         : initiatorAddressType    = Tezos.get_sender();

                // const liquidationFee        : nat  = s.config.liquidationFee;       // liquidation fee - penalty fee paid by vault owner to liquidator
                // const adminLiquidationFee   : nat  = s.config.adminLiquidationFee;  // admin liquidation fee - penalty fee paid by vault owner to treasury

                // // get vault
                // var _vault : vaultRecordType := getVault(vaultHandle, s);

                // // check if vault is under collaterized
                // if isUnderCollaterized(_vault, s) 
                // then skip 
                // else failwith("Error. Vault is not undercollaterized and cannot be liquidated.");

                // // check if there is sufficient loanOutstanding, and calculate remaining loan after liquidation
                // if loanQuantity > _vault.loanOutstandingTotal then failwith("Error. Cannot burn more than outstanding amount in vault.") else skip;
                // const remainingLoan : nat = abs(_vault.loanOutstandingTotal - loanQuantity);

                // // get USDM target
                // // var usdmTarget : nat  := case s.targetLedger["usdm"] of [
                // //       Some(_nat) -> _nat
                // //     | None -> failwith("Error. Target not found for USDM.")
                // // ];
                
                // // todo: fix extracted balance amount
                // (* get 32/31 of the target price, meaning there is a 1/31 penalty (3.23%) for the oven owner for being liquidated *)
                // // const totalExtractedBalance : nat = (usdmQuantity * usdmTarget * fixedPointAccuracy) / (31n * fixedPointAccuracy); 

                // // usdmQuantity - 1e9 | usdmTarget - 1e24 | fixedPointAccuracy - 1e24
                // // var totalValueToBeLiquidated           : nat := loanQuantity * usdmTarget / fixedPointAccuracy;

                // // 1e9 * 1e24 * (1e3?) / 1e24
                // // const liquidationFeeToLiquidator       : nat  = loanQuantity * usdmTarget * liquidationFee / fixedPointAccuracy; 

                // // amount to be sent to treasury
                // // 1e9 * 1e24 * (1e3?) / 1e24
                // // const adminLiquidationFeeToLiquidator  : nat  = loanQuantity * usdmTarget * adminLiquidationFee / fixedPointAccuracy; 
                
                // // total value to be liquidated and sent to liquidator
                // // totalValueToBeLiquidated := totalValueToBeLiquidated + liquidationFeeToLiquidator;
                // var totalValueToBeLiquidated : nat := 0n;
                    
                // // get total vault collateral value
                // var vaultCollateralValue      : nat := 0n;
                // for tokenName -> tokenBalance in map _vault.collateralBalanceLedger block {
                    
                //     if tokenName = "tez" then block {

                //         // calculate value of tez balance with same fixed point accuracy as price
                //         const tezValueWithFixedPointAccuracy : nat = tokenBalance * tezFixedPointAccuracy;

                //         // increment vault collateral value
                //         vaultCollateralValue := vaultCollateralValue + tezValueWithFixedPointAccuracy;
                        
                //     } else block {

                //         // get price of token in xtz
                //         const tokenPrice : nat = case s.priceLedger[tokenName] of [
                //             Some(_price) -> _price
                //             | None         -> failwith("Error. Price not found for token.")
                //         ];

                //         // calculate value of collateral balance
                //         const tokenValueInXtz : nat = tokenBalance * tokenPrice; 

                //         // increment vault collateral value
                //         vaultCollateralValue := vaultCollateralValue + tokenValueInXtz;

                //     };
                // };

                
                // // loop tokens in vault collateral balance ledger to be liquidated
                // var _extractedBalanceTracker   : nat := 0n;
                // for tokenName -> tokenBalance in map _vault.collateralBalanceLedger block {

                //     // skip if token balance is 0n
                //     if tokenBalance = 0n then skip else block {

                //         // get collateral token record - with token contract address and token type
                //         const collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of [
                //             Some(_collateralTokenRecord) -> _collateralTokenRecord
                //             | None  -> failwith("Error. Collateral Token Record not found in collateral token ledger.")
                //         ];

                //         // get price of token in xtz
                //         const tokenPrice : nat = case s.priceLedger[tokenName] of [
                //             Some(_price) -> _price
                //             | None -> failwith("Error. Price not found for token.")
                //         ];

                //         // calculate value of collateral balance
                //         const tokenValueInXtz : nat = tokenBalance * tokenPrice; 

                //         // increment extracted balance
                //         _extractedBalanceTracker := _extractedBalanceTracker + tokenValueInXtz;

                //         // get proportion of collateral balance against total collateral value
                //         const tokenProportion : nat = tokenValueInXtz * fixedPointAccuracy / vaultCollateralValue;

                //         // get balance to be extracted from token
                //         const tokenProportionalLiquidationValue : nat = tokenProportion * totalValueToBeLiquidated;

                //         // get quantity of tokens to be liquidated
                //         const tokenQuantityToBeLiquidated : nat = (tokenProportionalLiquidationValue / tokenPrice) / fixedPointAccuracy;

                //         // get token collateral balance in vault, set to 0n if not found in vault (i.e. first deposit)
                //         var vaultTokenCollateralBalance : nat := case _vault.collateralBalanceLedger[tokenName] of [
                //                 Some(_balance) -> _balance
                //             |   None -> 0n
                //         ];

                //         // calculate new collateral balance
                //         if tokenQuantityToBeLiquidated > vaultTokenCollateralBalance then failwith("Error. Token quantity to be liquidated cannot be more than balance of token collateral in vault.") else skip;
                //         const newTokenCollateralBalance : nat = abs(vaultTokenCollateralBalance - tokenQuantityToBeLiquidated);

                //         // send collateral to initiator of liquidation: pattern match withdraw operation based on token type
                //         const initiatorTakeCollateralOperation : operation = case collateralTokenRecord.tokenType of [
                //                 Tez(_tez) -> block {
                                
                //                     const withdrawTezOperationParams : vaultWithdrawType = record [
                //                         to_      = recipient; 
                //                         amount   = tokenQuantityToBeLiquidated;
                //                         token    = Tez(_tez);
                //                     ];
                //                     const withdrawTezOperation : operation = Tezos.transaction(
                //                         withdrawTezOperationParams,
                //                         0mutez,
                //                         getVaultWithdrawEntrypoint(_vault.address)
                //                     );

                //                 } with withdrawTezOperation

                //             |   Fa12(_token) -> block {

                //                     const withdrawFa12OperationParams : vaultWithdrawType = record [
                //                         to_      = recipient; 
                //                         amount   = tokenQuantityToBeLiquidated;
                //                         token    = Fa12(_token);
                //                     ];
                //                     const withdrawFa12Operation : operation = Tezos.transaction(
                //                         withdrawFa12OperationParams,
                //                         0mutez,
                //                         getVaultWithdrawEntrypoint(_vault.address)
                //                     );

                //                 } with withdrawFa12Operation

                //             |   Fa2(_token) -> block {

                //                     const withdrawFa2OperationParams : vaultWithdrawType = record [
                //                         to_      = recipient; 
                //                         amount   = tokenQuantityToBeLiquidated;
                //                         token    = Fa2(_token);
                //                     ];
                //                     const withdrawFa2Operation : operation = Tezos.transaction(
                //                         withdrawFa2OperationParams,
                //                         0mutez,
                //                         getVaultWithdrawEntrypoint(_vault.address)
                //                     );

                //                 } with withdrawFa2Operation
                //             ];

                //         operations := initiatorTakeCollateralOperation # operations;

                //         // save and update new balance for collateral token
                //         _vault.collateralBalanceLedger[tokenName]  := newTokenCollateralBalance;

                //     };

                // };

                // // operation to transfer loan token back to the Token Pool
                // // const burnUsdmOperationParams : mintOrBurnParamsType = record [
                // //     quantity = -usdmQuantity;
                // //     target   = initiator;
                // // ];
                // // const burnUsdmOperation : operation = Tezos.transaction(
                // //     burnUsdmOperationParams,
                // //     0mutez,
                // //     getUsdmMintOrBurnEntrypoint(s.usdmTokenAddress)
                // // );
                // // operations := burnUsdmOperation # operations;

                // // Create transfer token params and operation
                // const transferLoanTokenParams : transferActionType = list [
                //     record [
                //         to_        = lendingControllerContractAddress;
                //         token      = _tokenTransferType; // todo: get loan token type 
                //         amount     = loanQuantity;
                //     ]
                // ];

                // const lendingControllerTransferOperation : operation = Tezos.transaction(
                //     transferLoanTokenParams, 
                //     0tez, 
                //     sendTransferOperationToTreasury(lendingControllerContractAddress)
                // );

                // operations := treasuryTransferOperation # operations;

                // // save and update new loanOutstanding and balance for collateral token
                // _vault.loanOutstanding                    := remainingLoan;
                // s.vaults[vaultHandle]                     := _vault;
                skip
                
            }
        |   _ -> skip
    ];

} with (operations, s)



(* withdrawFromVault lambda *)
function lambdaWithdrawFromVault(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations               : list(operation)  := nil;

    case lendingControllerLambdaAction of [
        |   LambdaWithdrawFromVault(withdrawFromVaultParams) -> {
                
                // init variables for convenience
                const vaultId                : vaultIdType       = withdrawFromVaultParams.id; 
                const withdrawTokenAmount    : nat               = withdrawFromVaultParams.tokenAmount;
                const tokenName              : string            = withdrawFromVaultParams.tokenName;
                // const recipient              : contract(unit)    = withdrawFromVaultParams.to_;
                const recipient              : address           = Tezos.get_sender();
                const initiator              : vaultOwnerType    = Tezos.get_sender();

                // make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = initiator;
                ];

                // get vault
                var vault : vaultRecordType := getVault(vaultHandle, s);

                // if tez is to be withdrawn, check that Tezos amount should be the same as withdraw amount
                if tokenName = "tez" then block {
                    if mutezToNatural(Tezos.get_amount()) =/= withdrawTokenAmount then failwith("Error. Tezos amount and withdraw token amount do not match.") else skip;
                } else skip;

                // get token collateral balance in vault, fail if none found
                var vaultTokenCollateralBalance : nat := case vault.collateralBalanceLedger[tokenName] of [
                        Some(_balance) -> _balance
                    |   None -> failwith("Error. You do not have any tokens to withdraw.")
                ];

                // calculate new vault balance
                if withdrawTokenAmount > vaultTokenCollateralBalance then failwith("Error. Token withdrawal amount cannot be greater than your collateral balance.") else skip;
                const newCollateralBalance : nat  = abs(vaultTokenCollateralBalance - withdrawTokenAmount);

                // check if vault is undercollaterized, if not then send withdraw operation
                if isUnderCollaterized(vault, s) 
                then failwith("Error. Withdrawal is not allowed as vault is undercollaterized.") 
                else skip;
                
                // get collateral token record - with token contract address and token type
                const collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of [
                        Some(_collateralTokenRecord) -> _collateralTokenRecord
                    |   None -> failwith("Error. Collateral Token Record not found in collateral token ledger.")
                ];

                // pattern match withdraw operation based on token type
                const withdrawOperation : operation = case collateralTokenRecord.tokenType of [
                    
                        Tez(_tez) -> block {
                            
                            const withdrawTezOperationParams : vaultWithdrawType = record [
                                to_      = recipient; 
                                amount   = withdrawTokenAmount;
                                token    = Tez(_tez);
                            ];

                            const withdrawTezOperation : operation = Tezos.transaction(
                                withdrawTezOperationParams,
                                0mutez,
                                getVaultWithdrawEntrypoint(vault.address)
                            );

                        } with withdrawTezOperation

                    |   Fa12(_token) -> block {

                            const withdrawFa12OperationParams : vaultWithdrawType = record [
                                to_      = recipient; 
                                amount   = withdrawTokenAmount;
                                token    = Fa12(_token);
                            ];

                            const withdrawFa12Operation : operation = Tezos.transaction(
                                withdrawFa12OperationParams,
                                0mutez,
                                getVaultWithdrawEntrypoint(vault.address)
                            );

                        } with withdrawFa12Operation

                    |   Fa2(_token) -> block {

                            const withdrawFa2OperationParams : vaultWithdrawType = record [
                                to_      = recipient; 
                                amount   = withdrawTokenAmount;
                                token    = Fa2(_token);
                            ];

                            const withdrawFa2Operation : operation = Tezos.transaction(
                                withdrawFa2OperationParams,
                                0mutez,
                                getVaultWithdrawEntrypoint(vault.address)
                            );

                        } with withdrawFa2Operation

                    ];

                operations := withdrawOperation # operations;

                // save and update new balance for collateral token
                vault.collateralBalanceLedger[tokenName] := newCollateralBalance;
                s.vaults[vaultHandle]                     := vault;
                
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

                // check if token exists in collateral token ledger
                const _collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of [
                        Some(_record) -> _record
                    |   None -> failwith("Error. Collateral Token Record not found in collateralTokenLedger.")
                ];

                // get vault
                var vault : vaultRecordType := getVault(vaultHandle, s);

                // check if sender matches vault owner; if match, then update and save vault with new collateral balance
                if vault.address =/= initiator then failwith("Error. Sender does not match vault owner address.") else skip;
                
                // get token collateral balance in vault, set to 0n if not found in vault (i.e. first deposit)
                var vaultTokenCollateralBalance : nat := case vault.collateralBalanceLedger[tokenName] of [
                        Some(_balance) -> _balance
                    |   None -> 0n
                ];

                // calculate new collateral balance
                const newCollateralBalance : nat = vaultTokenCollateralBalance + depositAmount;

                // save and update new balance for collateral token
                vault.collateralBalanceLedger[tokenName]  := newCollateralBalance;
                s.vaults[vaultHandle]                     := vault;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* borrow lambda *)
function lambdaBorrow(const lendingControllerLambdaAction : lendingControllerLambdaActionType; var s : lendingControllerStorageType) : return is
block {
    
    var operations : list(operation)        := nil;

    case lendingControllerLambdaAction of [
        |   LambdaBorrow(borrowParams) -> {
                
                // Init variables for convenience
                const vaultId            : nat                     = borrowParams.vaultId; 
                const initialLoanAmount  : nat                     = borrowParams.quantity;
                const initiator          : initiatorAddressType    = Tezos.get_sender();
                
                var finalLoanAmount      : nat                    := initialLoanAmount;

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = initiator;
                ];

                // Get vault if exists
                var vault : vaultRecordType := getVault(vaultHandle, s);

                // Get vault loan token name
                const vaultLoanTokenName : string = vault.loanToken; // USDT, EURL, some other crypto coin

                // Token Pool: Update interest rate
                s := updateInterestRate(vaultLoanTokenName, s);

                // Token Pool: Calculate compounded interest and update token state (borrow index)
                s := updateTokenState(vaultLoanTokenName, s);

                // Get loan token type
                var loanTokenRecord : loanTokenRecordType := case s.loanTokenLedger[vaultLoanTokenName] of [
                        Some(_record) -> _record
                    |   None          -> failwith(error_LOAN_TOKEN_NOT_FOUND)
                ];

                // Get loan token parameters
                const reserveRatio      : nat         = loanTokenRecord.reserveRatio;
                const tokenPoolTotal    : nat         = loanTokenRecord.tokenPoolTotal;
                const totalBorrowed     : nat         = loanTokenRecord.totalBorrowed;
                const totalRemaining    : nat         = loanTokenRecord.totalRemaining;
                // const loanTokenType     : tokenType   = loanTokenRecord.tokenType;
                const tokenBorrowIndex  : nat         = loanTokenRecord.borrowIndex;
                const loanTokenId       : nat         = loanTokenRecord.tokenId;
                const loanTokenAddress  : address     = loanTokenRecord.tokenContractAddress;

                // ------------------------------------------------------------------
                // Calculate Service Loan Fees
                // ------------------------------------------------------------------
                
                // Charge a minimum loan fee if user is borrowing
                const minimumLoanFee : nat = ((initialLoanAmount * s.config.minimumLoanFee * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

                // Calculate share of fees that goes to the Treasury 
                const minimumLoanFeeTreasuryShare : nat = ((minimumLoanFee * s.config.minimumLoanFeeTreasuryShare * fixedPointAccuracy) / 10000n) / fixedPointAccuracy;

                // Calculate share of fees that goes to the Reward Pool 
                if minimumLoanFeeTreasuryShare > minimumLoanFee then failwith(error_MINIMUM_LOAN_FEE_TREASURY_SHARE_CANNOT_BE_GREATER_THAN_MINIMUM_LOAN_FEE) else skip;
                const minimumLoanFeeRewardPool : nat = abs(minimumLoanFee - minimumLoanFeeTreasuryShare);

                // ------------------------------------------------------------------
                // Get current user borrow index
                // ------------------------------------------------------------------

                // Get user's vault borrow index
                var userBorrowIndex : nat := vault.borrowIndex;

                // Get current user loan outstanding
                const currentLoanOutstandingTotal : nat = vault.loanOutstandingTotal;
                
                // Init new total amounts
                var newLoanOutstandingTotal     : nat := currentLoanOutstandingTotal;
                var newLoanPrincipalTotal       : nat := vault.loanPrincipalTotal;
                var newLoanInterestTotal        : nat := vault.loanInterestTotal;

                // ------------------------------------------------------------------
                // Calculate fees on past loan outstanding
                // ------------------------------------------------------------------

                // calculate interest amount
                if currentLoanOutstandingTotal > 0n then block {
                    
                    // get difference in borrow index
                    if userBorrowIndex > tokenBorrowIndex then failwith(error_USER_BORROW_INDEX_CANNOT_BE_GREATER_THAN_TOKEN_BORROW_INDEX) else skip;
                    const borrowIndexDifference : nat = abs(tokenBorrowIndex - userBorrowIndex);

                    // calculate interest accrued (to add to current loan outstanding)
                    const interestAccrued : nat = (currentLoanOutstandingTotal * borrowIndexDifference) / fpa10e9; // borrow index currently at 1e9

                    // calculate new loan outstanding
                    newLoanOutstandingTotal := currentLoanOutstandingTotal + interestAccrued;

                    // increment loan interest total
                    newLoanInterestTotal := newLoanInterestTotal + interestAccrued;

                } else skip;

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

                // transfer loan amount from token pool to borrower
                const transferLoanToBorrowerOperation : operation = transferFa2Token(
                    Tezos.get_self_address(),   // Lending Controller Contract
                    initiator,                  // initiator
                    finalLoanAmount,            // final loan amount (after fees and interest)
                    loanTokenId,                // loan token id    
                    loanTokenAddress            // loan token address
                );

                operations := transferLoanToBorrowerOperation # operations;

                // Get Treasury Contract Address from the General Contracts Map on the Governance Contract
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "treasury", s.governanceAddress);
                const treasuryAddress : address = case generalContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_TREASURY_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // transfer total fees amount to treasury
                const transferFeesToTreasuryOperation : operation = transferFa2Token(
                    Tezos.get_self_address(),  // Token Pool Contract
                    treasuryAddress,
                    minimumLoanFeeTreasuryShare,
                    loanTokenId,
                    loanTokenAddress
                );

                operations := transferFeesToTreasuryOperation # operations;

                // Get Token Pool Reward Address from the General Contracts Map on the Governance Contract
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "tokenPoolReward", s.governanceAddress);
                const tokenPoolRewardAddress : address = case generalContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_TOKEN_POOL_REWARD_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // transfer total fees amount to token pool reward contract
                const transferFeesToTokenPoolRewardContractOperation : operation = transferFa2Token(
                    Tezos.get_self_address(),  // Token Pool Contract
                    tokenPoolRewardAddress,
                    minimumLoanFeeRewardPool,
                    loanTokenId,
                    loanTokenAddress
                );

                operations := transferFeesToTokenPoolRewardContractOperation # operations;

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------
                
                // update token storage
                loanTokenRecord.tokenPoolTotal      := newTotalBorrowed + newTotalRemaining;
                loanTokenRecord.totalBorrowed       := newTotalBorrowed;
                loanTokenRecord.totalRemaining      := newTotalRemaining;
                s.loanTokenLedger[vaultLoanTokenName]        := loanTokenRecord;

                // update vault storage
                vault.loanOutstandingTotal      := newLoanOutstandingTotal;
                vault.loanPrincipalTotal        := newLoanPrincipalTotal;
                vault.loanInterestTotal         := newLoanInterestTotal;
                vault.borrowIndex               := tokenBorrowIndex;
                vault.lastUpdatedBlockLevel     := Tezos.get_level();
                vault.lastUpdatedTimestamp      := Tezos.get_now();

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
    
    var operations : list(operation)        := nil;

    case lendingControllerLambdaAction of [
        |   LambdaRepay(repayParams) -> {
                
                // Init variables for convenience
                const vaultId                   : nat                     = repayParams.vaultId; 
                const initialRepaymentAmount    : nat                     = repayParams.quantity;
                const initiator                 : initiatorAddressType    = Tezos.get_sender();
                var finalRepaymentAmount        : nat                    := initialRepaymentAmount;

                // Make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = initiator;
                ];

                // Get vault if exists
                var vault : vaultRecordType := getVault(vaultHandle, s);
                
                // Get vault loan token name
                const vaultLoanTokenName : string = vault.loanToken; // USDT, EURL, some other crypto coin

                // Token Pool: Update interest rate
                s := updateInterestRate(vaultLoanTokenName, s);

                // Token Pool: Calculate compounded interest and update token state (borrow index)
                s := updateTokenState(vaultLoanTokenName, s);

                // Get loan token type
                var loanTokenRecord : loanTokenRecordType := case s.loanTokenLedger[vaultLoanTokenName] of [
                        Some(_record) -> _record
                    |   None          -> failwith(error_LOAN_TOKEN_NOT_FOUND)
                ];

                // Get loan token parameters
                // const tokenPoolTotal    : nat         = loanTokenRecord.tokenPoolTotal;
                const totalBorrowed     : nat         = loanTokenRecord.totalBorrowed;
                const totalRemaining    : nat         = loanTokenRecord.totalRemaining;
                const tokenBorrowIndex  : nat         = loanTokenRecord.borrowIndex;
                const loanTokenId       : nat         = loanTokenRecord.tokenId;
                const loanTokenAddress  : address     = loanTokenRecord.tokenContractAddress;

                // ------------------------------------------------------------------
                // Get current user borrow index
                // ------------------------------------------------------------------

                // Get user's vault borrow index
                var userBorrowIndex : nat := vault.borrowIndex;

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

                // calculate outstanding service fee amount
                if currentLoanOutstandingTotal > 0n then block {
                    
                    // get difference in borrow index
                    if userBorrowIndex > tokenBorrowIndex then failwith(error_USER_BORROW_INDEX_CANNOT_BE_GREATER_THAN_TOKEN_BORROW_INDEX) else skip;
                    const borrowIndexDifference : nat = abs(tokenBorrowIndex - userBorrowIndex);

                    // calculate interest accrued
                    const interestAccrued : nat = (currentLoanOutstandingTotal * borrowIndexDifference) / fpa10e9; // borrow index currently at 1e9

                    // calculate new loan outstanding
                    newLoanOutstandingTotal := currentLoanOutstandingTotal + interestAccrued;

                    // increment loan interest total
                    newLoanInterestTotal := newLoanInterestTotal + interestAccrued;

                } else skip;

                // ------------------------------------------------------------------
                // Calculate Principal / Interest Repayments
                // ------------------------------------------------------------------

                var totalInterestPaid       : nat := 0n;
                var totalPrincipalRepaid    : nat := 0n;

                if finalRepaymentAmount > newLoanInterestTotal then {
                    
                    // final repayment amount covers interest and principal

                    // calculate remainder amount
                    const principalReductionAmount : nat = abs(finalRepaymentAmount - newLoanInterestTotal);

                    // set total interest paid
                    totalInterestPaid := newLoanInterestTotal;

                    // reset loan interest to zero
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
                
                // Get Treasury Contract Address from the General Contracts Map on the Governance Contract
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "treasury", s.governanceAddress);
                const treasuryAddress : address = case generalContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_TREASURY_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get Token Pool Reward Contract Address from the General Contracts Map on the Governance Contract
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "tokenPoolReward", s.governanceAddress);
                const tokenPoolRewardAddress : address = case generalContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_TOKEN_POOL_REWARD_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Send interest payment to treasury
                const sendInterestToTreasuryOperation : operation = transferFa2Token(
                    initiator,                  // from_
                    treasuryAddress,            // to_
                    interestTreasuryShare,      // amount
                    loanTokenId,                // token id
                    loanTokenAddress            // token contract
                );

                operations := sendInterestToTreasuryOperation # operations; 

                // Send interest as rewards to Token Pool Rewards Contract
                const sendInterestRewardToTokenPoolRewardContractOperation : operation = transferFa2Token(
                    initiator,                  // from_
                    tokenPoolRewardAddress,     // to_
                    interestRewardPool,         // amount
                    loanTokenId,                // token id
                    loanTokenAddress            // token contract
                );

                operations := sendInterestRewardToTokenPoolRewardContractOperation # operations; 

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

                operations := updateRewardsInTokenPoolRewardContractOperation # operations; 

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
                    const transferRepaymentAmountToTokenPoolOperation : operation = transferFa2Token(
                        initiator,                   // from_
                        Tezos.get_self_address(),    // to_
                        totalPrincipalRepaid,        // amount
                        loanTokenId,                 // token id
                        loanTokenAddress             // token contract
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
    
    var operations        : list(operation)  := nil;

    case lendingControllerLambdaAction of [
        |   LambdaVaultDepositStakedMvk(vaultDepositStakedMvkParams) -> {
                
                // init variables for convenience
                const vaultId         : vaultIdType       = vaultDepositStakedMvkParams.vaultId;
                const depositAmount   : nat               = vaultDepositStakedMvkParams.depositAmount;
                const vaultOwner      : vaultOwnerType    = Tezos.get_sender();
                const tokenName       : string            = "sMVK";

                // check if token (sMVK) exists in collateral token ledger
                const _collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of [
                    Some(_record) -> _record
                    | None -> failwith("Error. Collateral Token Record not found in collateralTokenLedger.")
                ];

                // make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // get vault
                var vault : vaultRecordType := getVault(vaultHandle, s);

                // Get Doorman Contract Address from the General Contracts Map on the Governance Contract
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress : address = case generalContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];


                // create operation to doorman to update balance of staked MVK from user to vault
                const vaultDepositStakedMvkOperation : operation = Tezos.transaction(
                    vaultDepositStakedMvkParams,
                    0tez,
                    getVaultDepositStakedMvkEntrypoint(doormanAddress)
                );
                operations := vaultDepositStakedMvkOperation # operations;
                
                // get token collateral balance in vault, set to 0n if not found in vault (i.e. first deposit)
                var vaultTokenCollateralBalance : nat := case vault.collateralBalanceLedger[tokenName] of [
                    Some(_balance) -> _balance
                    | None           -> 0n
                ];

                // calculate new collateral balance
                const newCollateralBalance : nat = vaultTokenCollateralBalance + depositAmount;

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

                // check if token (sMVK) exists in collateral token ledger
                const _collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of [
                        Some(_record) -> _record
                    |   None -> failwith("Error. Collateral Token Record not found in collateralTokenLedger.")
                ];

                // make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // get vault
                var vault : vaultRecordType := getVault(vaultHandle, s);

                // Get Doorman Contract Address from the General Contracts Map on the Governance Contract
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress : address = case generalContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];


                // get token collateral balance in vault, set to 0n if not found in vault (i.e. first deposit)
                var vaultTokenCollateralBalance : nat := case vault.collateralBalanceLedger[tokenName] of [
                    Some(_balance) -> _balance
                    | None           -> 0n
                ];

                // calculate new collateral balance
                if withdrawAmount > vaultTokenCollateralBalance then failwith("Error. You do not have enough collateral balance.") else skip;
                const newCollateralBalance : nat = abs(vaultTokenCollateralBalance - withdrawAmount);

                // create operation to doorman to update balance of staked MVK from user to vault
                const vaultWithdrawStakedMvkOperation : operation = Tezos.transaction(
                    vaultWithdrawStakedMvkParams,
                    0tez,
                    getVaultWithdrawStakedMvkEntrypoint(doormanAddress)
                );
                operations := vaultWithdrawStakedMvkOperation # operations;
                
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

    var operations        : list(operation)  := nil;

    case lendingControllerLambdaAction of [
        |   LambdaVaultLiquidateStakedMvk(vaultLiquidateStakedMvkParams) -> {
                
                
                // init variables for convenience
                const vaultId           : vaultIdType       = vaultLiquidateStakedMvkParams.vaultId;
                const vaultOwner        : vaultOwnerType    = vaultLiquidateStakedMvkParams.vaultOwner;
                const liquidatedAmount  : nat               = vaultLiquidateStakedMvkParams.liquidatedAmount;
                const _liquidator        : address          = vaultLiquidateStakedMvkParams.liquidator;
                
                const tokenName       : string            = "sMVK";

                // check if token (sMVK) exists in collateral token ledger
                const _collateralTokenRecord : collateralTokenRecordType = case s.collateralTokenLedger[tokenName] of [
                    Some(_record) -> _record
                    | None -> failwith("Error. Collateral Token Record not found in collateralTokenLedger.")
                ];

                // make vault handle
                const vaultHandle : vaultHandleType = record [
                    id     = vaultId;
                    owner  = vaultOwner;
                ];

                // get vault
                var vault : vaultRecordType := getVault(vaultHandle, s);

                // Get Doorman Contract Address from the General Contracts Map on the Governance Contract
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
                const doormanAddress : address = case generalContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];


                // get token collateral balance in vault, set to 0n if not found in vault (i.e. first deposit)
                var vaultTokenCollateralBalance : nat := case vault.collateralBalanceLedger[tokenName] of [
                    Some(_balance) -> _balance
                    | None           -> failwith("Error. Vault collateral has zero balalnce.")
                ];

                // calculate new collateral balance
                if liquidatedAmount > vaultTokenCollateralBalance then failwith("Error. You do not have enough collateral balance.") else skip;
                const newCollateralBalance : nat = abs(vaultTokenCollateralBalance - liquidatedAmount);

                // create operation to doorman to update balance of staked MVK from user to vault
                const vaultLiquidateStakedMvkOperation : operation = Tezos.transaction(
                    vaultLiquidateStakedMvkParams,
                    0tez,
                    getVaultLiquidateStakedMvkEntrypoint(doormanAddress)
                );
                operations := vaultLiquidateStakedMvkOperation # operations;
                
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
