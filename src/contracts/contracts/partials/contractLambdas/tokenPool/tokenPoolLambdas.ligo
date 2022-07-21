// ------------------------------------------------------------------------------
//
// Token Pool Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const tokenPoolLambdaAction : tokenPoolLambdaActionType; var s : tokenPoolStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case tokenPoolLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const tokenPoolLambdaAction : tokenPoolLambdaActionType; var s : tokenPoolStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case tokenPoolLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const tokenPoolLambdaAction : tokenPoolLambdaActionType; var s : tokenPoolStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 
    
    case tokenPoolLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const tokenPoolLambdaAction : tokenPoolLambdaActionType; var s: tokenPoolStorageType) : return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin 
    
    case tokenPoolLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const tokenPoolLambdaAction : tokenPoolLambdaActionType; var s: tokenPoolStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 
    
    case tokenPoolLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const tokenPoolLambdaAction : tokenPoolLambdaActionType; var s: tokenPoolStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 

    case tokenPoolLambdaAction of [
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
function lambdaPauseAll(const tokenPoolLambdaAction : tokenPoolLambdaActionType; var s : tokenPoolStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is from Admin or the the Governance Contract
    // 2. Pause all main entrypoints in the Delegation Contract
    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

    case tokenPoolLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
                
                // Token Pool Entrypoints
                if s.breakGlassConfig.addLiquidityIsPaused then skip
                else s.breakGlassConfig.addLiquidityIsPaused := True;

                if s.breakGlassConfig.removeLiquidityIsPaused then skip
                else s.breakGlassConfig.removeLiquidityIsPaused := True;

                // Lending Entrypoints
                if s.breakGlassConfig.onBorrowIsPaused then skip
                else s.breakGlassConfig.onBorrowIsPaused := True;

                if s.breakGlassConfig.onRepayIsPaused then skip
                else s.breakGlassConfig.onRepayIsPaused := True;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* unpauseAll lambda *)
function lambdaUnpauseAll(const tokenPoolLambdaAction : tokenPoolLambdaActionType; var s : tokenPoolStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is from Admin or the the Governance Contract
    // 2. Unpause all main entrypoints in the Delegation Contract

    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

    // set all pause configs to False
    case tokenPoolLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
            
                // Token Pool Entrypoints
                if s.breakGlassConfig.addLiquidityIsPaused then s.breakGlassConfig.addLiquidityIsPaused := False
                else skip;

                if s.breakGlassConfig.removeLiquidityIsPaused then s.breakGlassConfig.removeLiquidityIsPaused := False
                else skip;

                // Lending Entrypoints
                if s.breakGlassConfig.onBorrowIsPaused then s.breakGlassConfig.onBorrowIsPaused := False
                else skip;

                if s.breakGlassConfig.onRepayIsPaused then s.breakGlassConfig.onRepayIsPaused := False
                else skip;
            
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const tokenPoolLambdaAction : tokenPoolLambdaActionType; var s : tokenPoolStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin
    // 2. Pause or unpause entrypoint depending on boolean parameter sent 

    checkSenderIsAdmin(s); // check that sender is admin

    case tokenPoolLambdaAction of [
        |   LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [

                        // Token Pool Entrypoints
                        AddLiquidity (_v)                -> s.breakGlassConfig.addLiquidityIsPaused      := _v
                    |   RemoveLiquidity (_v)             -> s.breakGlassConfig.removeLiquidityIsPaused   := _v
                    
                        // Lending Entrypoints
                    |   OnBorrow (_v)                    -> s.breakGlassConfig.onBorrowIsPaused          := _v
                    |   OnRepay (_v)                     -> s.breakGlassConfig.onRepayIsPaused           := _v

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

(* addLiquidity lambda *)
function lambdaAddLiquidity(const tokenPoolLambdaAction : tokenPoolLambdaActionType; var s : tokenPoolStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case tokenPoolLambdaAction of [
        |   LambdaAddLiquidity(addLiquidityParams) -> {
                
                // init variables for convenience
                const tokenName           : nat                 = addLiquidityParams.tokenName;
                const tokensDeposited     : nat                 = addLiquidityParams.tokensDeposited;
                const owner               : address             = addLiquidityParams.owner; 
                var operations            : list(operation)    := nil;

                // check that no tez is sent
                checkNoAmount(Unit);

                // Get Token Record
                var tokenRecord : tokenRecordType := case s.tokenLedger[tokenName] of [
                        Some(_record) -> _record 
                    |   None          -> failwith("error_TOKEN_RECORD_NOT_FOUND")
                ];

                // update pool totals
                tokenRecord.tokenPoolTotal  := tokenRecord.tokenPoolTotal + tokensDeposited;
                tokenRecord.lpTokensTotal   := tokenRecord.lpTokensTotal + tokensDeposited;

                const tokenId                   : nat       = tokenRecord.tokenId;
                const tokenContractAddress      : address   = tokenRecord.tokenContractAddress;
                const lpTokenContractAddress    : address   = tokenRecord.lpTokenContractAddress;

                // Update Token Ledger
                s.tokenLedger[tokenName] := tokenRecord;

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
                const mintLpTokensTokensOperation : operation = mintOrBurnLpToken(owner, int(lpTokensMinted), lpTokenContractAddress, s);
                operations := mintLpTokensTokensOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* removeLiquidity lambda *)
function lambdaRemoveLiquidity(const tokenPoolLambdaAction : tokenPoolLambdaActionType; var s : tokenPoolStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case tokenPoolLambdaAction of [
        |   LambdaRemoveLiquidity(removeLiquidityParams) -> {
                
                // init variables for convenience
                const tokensName            : nat                 = addLiquidityParams.tokenName;
                const tokensWithdrawn       : nat                 = removeLiquidityParams.tokensWithdrawn;
                const recipient             : address             = removeLiquidityParams.to_; 
                var operations              : list(operation)    := nil;    

                // check that no tez is sent
                checkNoAmount(Unit);

                // Get Token Record
                var tokenRecord : tokenRecordType := case s.tokenLedger[tokenName] of [
                        Some(_record) -> _record 
                    |   None          -> failwith("error_TOKEN_RECORD_NOT_FOUND")
                ];
                
                const tokenId                   : nat       = tokenRecord.tokenId;
                const tokenContractAddress      : address   = tokenRecord.tokenContractAddress;
                const tokenPool                 : nat       = tokenRecord.tokenPoolTotal;
                
                const lpTokenContractAddress    : address   = tokenRecord.lpTokenContractAddress;
                const lpTokensTotal             : nat       = tokenRecord.lpTokensTotal;
                const lpTokensBurned            : nat       = tokensWithdrawn;

                // calculate new total of LP Tokens
                if lpTokensBurned > lpTokensTotal then failwith("Error. You cannot burn more than the total amount of LP tokens.") else skip;
                const newLpTokensTotal : nat = abs(lpTokensTotal - lpTokensBurned);

                // calculate new token pool amount
                if tokensWithdrawn > tokenPool then failwith("Error. Token pool minus tokens withdrawn is negative.") else skip;
                const newTokenPoolTotal : nat = abs(tokenPool - tokensWithdrawn);

                // burn LP Token operation
                const burnLpTokenOperation : operation = mintOrBurnLpToken(Tezos.get_sender(), (0 - lpTokensBurned), lpTokenContractAddress, s);
                operations := burnLpTokenOperation # operations;

                // send withdrawn tokens to sender 
                const withdrawnTokensToSenderOperation : operation = transferFa2Token(
                    Tezos.get_self_address(),     // from_
                    Tezos.get_sender(),           // to_
                    tokensWithdrawn,        // token amount
                    tokenId,                // token id
                    tokenContractAddress    // token contract address
                );
                operations := withdrawnTokensToSenderOperation # operations;

                // update pool totals
                tokenRecord.tokenPoolTotal  := newTokenPoolTotal;
                tokenRecord.lpTokensTotal   := newLpTokensTotal;

                // Update Token Ledger
                s.tokenLedger[tokenName] := tokenRecord;
                
            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Token Pool Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lending Lambdas Begin
// ------------------------------------------------------------------------------

(* onBorrow lambda *)
function lambdaOnBorrow(const tokenPoolLambdaAction : tokenPoolLambdaActionType; var s : tokenPoolStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case tokenPoolLambdaAction of [
        |   LambdaOnBorrow(onBorrowParams) -> {
                
                // check sender is vault controller
                checkSenderIsVaultControllerContract(s);

                // init params
                const tokenName        : string   = onBorrowParams.tokenName;
                const borrower         : address  = onBorrowParams.borrower;         // borrower address
                const finalLoanAmount  : nat      = onBorrowParams.finalLoanAmount;  // final amount borrower will receive sans fees
                const totalFees        : nat      = onBorrowParams.totalFees;        // total fees for the loan

                // init operations
                var operations : list(operation) := nil;

                // calculate total token quantity (i.e. loan amount (token quantity) without fees deducted)
                const totalTokenQuantity : nat = finalLoanAmount + totalFees;

                // Get Token Record and info
                var tokenRecord : tokenRecordType := case s.tokenLedger[tokenName] of [
                        Some(_record) -> _record 
                    |   None          -> failwith("error_TOKEN_RECORD_NOT_FOUND")
                ];

                const reserveRatio    : nat  = tokenRecord.reserveRatio;
                const tokenPoolTotal  : nat  = tokenRecord.tokenPoolTotal;
                const totalBorrowed   : nat  = tokenRecord.totalBorrowed;
                const totalRemaining  : nat  = tokenRecord.totalRemaining;

                // calculate required reserve amount
                const requiredTokenPoolReserves = (tokenPoolTotal * fixedPointAccuracy * reserveRatio) / (10000n * fixedPointAccuracy);

                // calculate new totalBorrowed and totalRemaining
                const newTotalBorrowed   : nat = totalBorrowed + totalTokenQuantity;
                
                if totalTokenQuantity > totalRemaining then failwith(error_INSUFFICIENT_TOKENS_IN_TOKEN_POOL_TO_BE_BORROWED) else skip;
                const newTotalRemaining  : nat = abs(totalRemaining - totalTokenQuantity);

                // check that new total remaining is greater than required token pool reserves
                if newTotalRemaining < requiredTokenPoolReserves then failwith(error_TOKEN_POOL_RESERVES_RATIO_NOT_MET) else skip;

                // ------------------------------------------------------------------
                // Process Transfers
                // ------------------------------------------------------------------

                // transfer loan amount from token pool to borrower
                const transferLoanToBorrowerOperation : operation = transferFa2Token(
                    Tezos.get_self_address(),  // Token Pool Contract
                    borrower,
                    loanAmount,
                    tokenRecord.tokenId,
                    tokenRecord.tokenContractAddress
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

                // transfer total fees amount from token pool to treasury
                const transferTotalFeesToTreasuryOperation : operation = transferFa2Token(
                    Tezos.get_self_address(),  // Token Pool Contract
                    treasuryAddress,
                    totalFees,
                    tokenRecord.tokenId,
                    tokenRecord.tokenContractAddress
                );

                operations := transferTotalFeesToTreasuryOperation # operations;

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------
                
                // update token storage
                tokenRecord.totalBorrowed   := newTotalBorrowed;
                tokenRecord.totalRemaining  := newTotalRemaining;
                s.tokenLedger[tokenName]    := tokenRecord;

                
            }
        |   _ -> skip
    ];

} with (operations, s)



(* onRepay lambda *)
function lambdaOnRepay(const tokenPoolLambdaAction : tokenPoolLambdaActionType; var s : tokenPoolStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case tokenPoolLambdaAction of [
        |   LambdaOnRepay(onRepayParams) -> {
                
                // check sender is vault controller
                checkSenderIsVaultControllerContract(s);
                
                // init params
                const tokenName      : string   = onRepayParams.tokenName;
                const repayAmount    : nat      = onRepayParams.repayAmount;
                const repayer        : address  = onRepayParams.repayer;

                // Get Token Record
                var tokenRecord : tokenRecordType := case s.tokenLedger[tokenName] of [
                        Some(_record) -> _record 
                    |   None          -> failwith("error_TOKEN_RECORD_NOT_FOUND")
                ];

                const reserveRatio    : nat  = tokenRecord.reserveRatio;
                const tokenPoolTotal  : nat  = tokenRecord.tokenPoolTotal;
                const totalBorrowed   : nat  = tokenRecord.totalBorrowed;
                const totalRemaining  : nat  = tokenRecord.totalRemaining;

                // calculate new totalBorrowed and totalRemaining
                if repayAmount > totalBorrowed then failwith(error_INCORRECT_FINAL_TOTAL_BORROWED_AMOUNT) else skip;
                const newTotalBorrowed   : nat = abs(totalBorrowed - repayAmount);
                
                const newTotalRemaining  : nat = totalRemaining + repayAmount;

                // ------------------------------------------------------------------
                // Process Transfers
                // ------------------------------------------------------------------

                // transfer repayment amount from borrower to token pool
                const transferRepaymentAmountToTokenPoolOperation : operation = transferFa2Token(
                    repayer,  
                    Tezos.get_self_address(),
                    repayAmount,
                    tokenRecord.tokenId,
                    tokenRecord.tokenContractAddress
                );

                // ------------------------------------------------------------------
                // Update Storage
                // ------------------------------------------------------------------

                // update token storage
                tokenRecord.totalBorrowed   := newTotalBorrowed;
                tokenRecord.totalRemaining  := newTotalRemaining;
                s.tokenLedger[tokenName]    := tokenRecord;

                
            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Lending Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Token Pool Lambdas End
//
// ------------------------------------------------------------------------------