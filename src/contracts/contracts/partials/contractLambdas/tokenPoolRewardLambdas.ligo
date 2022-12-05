// ------------------------------------------------------------------------------
//
// Token Pool Reward Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s : tokenPoolRewardStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case tokenPoolRewardLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s : tokenPoolRewardStorageType) : return is
block {
    
    checkNoAmount(Unit);        // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s);    // check that sender is admin or the Governance Contract address

    case tokenPoolRewardLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s : tokenPoolRewardStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 
    
    case tokenPoolRewardLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s: tokenPoolRewardStorageType) : return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin 
    
    case tokenPoolRewardLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s: tokenPoolRewardStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 
    
    case tokenPoolRewardLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s: tokenPoolRewardStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin 

    case tokenPoolRewardLambdaAction of [
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
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(* pauseAll lambda *)
function lambdaPauseAll(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s : tokenPoolRewardStorageType) : return is
block {
    
    checkNoAmount(Unit);     // entrypoint should not receive any tez amount    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address 

    case tokenPoolRewardLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
                
                // set all pause configs to True
                if s.breakGlassConfig.updateRewardsIsPaused then skip
                else s.breakGlassConfig.updateRewardsIsPaused := True;

                if s.breakGlassConfig.claimRewardsIsPaused then skip
                else s.breakGlassConfig.claimRewardsIsPaused := True;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* unpauseAll lambda *)
function lambdaUnpauseAll(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s : tokenPoolRewardStorageType) : return is
block {
    
    checkNoAmount(Unit);     // entrypoint should not receive any tez amount    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address 

    case tokenPoolRewardLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
                
                // set all pause configs to False
                if s.breakGlassConfig.updateRewardsIsPaused then s.breakGlassConfig.updateRewardsIsPaused := False
                else skip;

                if s.breakGlassConfig.claimRewardsIsPaused then s.breakGlassConfig.claimRewardsIsPaused := False
                else skip;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s : tokenPoolRewardStorageType) : return is
block {

    checkNoAmount(Unit);     // entrypoint should not receive any tez amount    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address 

    case tokenPoolRewardLambdaAction of [
        |   LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [
                    |    UpdateRewards (_v)  -> s.breakGlassConfig.updateRewardsIsPaused           := _v
                    |    ClaimRewards (_v)   -> s.breakGlassConfig.claimRewardsIsPaused            := _v
                ]
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Token Pool Reward Lambdas Begin
// ------------------------------------------------------------------------------

(*  updateRewards lambda *)
function lambdaUpdateRewards(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s : tokenPoolRewardStorageType) : return is
block {

    checkNoAmount(Unit);                       // entrypoint should not receive any tez amount    
    checkSenderIsValidLpToken(s);              // check that sender is a valid LP Token contract address (must be linked to a Loan Token record on the Lending Controller)
    checkUpdateRewardsIsNotPaused(s);          // check that %updaRetewards entrypoint is not paused (e.g. if glass broken)

    var operations : list(operation) := nil;

    case tokenPoolRewardLambdaAction of [
        |   LambdaUpdateRewards(updateRewardsParams) -> {

                const updateRewardsList : list(updateUserRewardsType) = updateRewardsParams;

                function updateUserRewards(var accumulator : tokenPoolRewardStorageType; const userReward : updateUserRewardsType) : tokenPoolRewardStorageType is
                block {

                    // init parameters
                    const loanTokenName     : string  = userReward.loanTokenName;
                    const userAddress       : address = userReward.userAddress;
                    const depositorBalance  : nat     = userReward.depositorBalance;

                    // Make big map key - (userAddress, loanTokenName)
                    const userTokenNameKey : (address * string) = (userAddress, loanTokenName);

                    // Get loan token record from lending controller and accumulated rewards per share
                    const loanTokenRecord : loanTokenRecordType = getLoanTokenRecordFromLendingController(loanTokenName, accumulator);
                    const loanTokenAccumulatedRewardsPerShare : nat = loanTokenRecord.accumulatedRewardsPerShare;            

                    // Get or create user's rewards record
                    var userRewardsRecord : rewardsRecordType := getOrCreateUserRewardsRecord(userTokenNameKey, loanTokenAccumulatedRewardsPerShare, accumulator);
                    const userRewardsPerShare : nat = userRewardsRecord.rewardsPerShare;            

                    // Calculate user's accrued rewards - i.e. new unclaimed rewards
                    // - calculate rewards ratio: difference between token's accumulatedRewardsPerShare and user's current rewardsPerShare
                    // - user's new rewards is equal to his deposited liquitity amount multiplied by rewards ratio
                    
                    const accruedRewards : nat = calculateAccruedRewards(depositorBalance, userRewardsPerShare, loanTokenAccumulatedRewardsPerShare);

                    // Update user's rewards record 
                    // - set rewardsPerShare to token's accumulatedRewardsPerShare
                    // - increment user's unpaid rewards by the calculated rewards

                    userRewardsRecord.rewardsPerShare             := loanTokenAccumulatedRewardsPerShare;
                    userRewardsRecord.unpaid                      := userRewardsRecord.unpaid + accruedRewards;
                    accumulator.rewardsLedger[userTokenNameKey]   := userRewardsRecord;

                } with accumulator;

                s := List.fold(updateUserRewards, updateRewardsList, s);

            }
        |   _ -> skip
    ];

} with (operations, s)



(*  claimRewards lambda *)
function lambdaClaimRewards(const tokenPoolRewardLambdaAction : tokenPoolRewardLambdaActionType; var s : tokenPoolRewardStorageType) : return is
block {

    checkNoAmount(Unit);                       // entrypoint should not receive any tez amount    
    checkClaimRewardsIsNotPaused(s);           // check that %claimRewards entrypoint is not paused (e.g. if glass broken)

    var operations : list(operation) := nil;

    case tokenPoolRewardLambdaAction of [
        |   LambdaClaimRewards(claimRewardsParams) -> {

                // init variables for convenience
                const userAddress : address = claimRewardsParams.userAddress; 

                // init transfer params
                const to_    : address = userAddress;
                const from_  : address = Tezos.get_self_address(); 

                // Get loan token ledger from lending controller
                const loanTokenLedger : loanTokenLedgerType = getLoanTokenLedgerFromLendingController(s);
                
                // loop through loan token ledger to get individual loan token records
                for loanTokenName -> loanTokenRecord in map loanTokenLedger block {

                    // init variables for convenience
                    const userTokenNameKey : (address * string) = (userAddress, loanTokenName);
                    const loanTokenAccumulatedRewardsPerShare : nat = loanTokenRecord.accumulatedRewardsPerShare; 
                    
                    // get user rewards record if exist
                    var userRewardsRecord : rewardsRecordType := getUserRewardsRecord(userTokenNameKey, s);
                    const userRewardsPerShare : nat = userRewardsRecord.rewardsPerShare;            

                    // Get user's token pool depositor balance from lending controller
                    const tokenPoolDepositorBalance : nat = getTokenPoolDepositorBalanceFromLendingController(userTokenNameKey, s);

                    // Note: if user rewardsPerShare is 0, it means user does not have a rewards record for the loan token)
                    if userRewardsPerShare > 0n then {
                    
                        // calculate user's accrued rewards
                        const accruedRewards      : nat = calculateAccruedRewards(tokenPoolDepositorBalance, userRewardsPerShare, loanTokenAccumulatedRewardsPerShare);

                        // total amount to be claimed by user
                        const totalUnpaidRewards  : nat = userRewardsRecord.unpaid + accruedRewards;

                        // total paid rewards 
                        const newPaidRewards      : nat = userRewardsRecord.paid + totalUnpaidRewards;

                        // update storage
                        userRewardsRecord.unpaid            := 0n;
                        userRewardsRecord.paid              := newPaidRewards;
                        userRewardsRecord.rewardsPerShare   := loanTokenAccumulatedRewardsPerShare;

                        s.rewardsLedger[userTokenNameKey]   := userRewardsRecord;

                        // create operation after storage has been updated to prevent any exploits
                        // create operation to transfer unclaimed rewards
                        const token : tokenType        = loanTokenRecord.tokenType;
                        const amt   : tokenAmountType  = totalUnpaidRewards;

                        const transferRewardOperation : operation = case token of [
                            |   Tez         -> transferTez((Tezos.get_contract_with_error(to_, "Error. Contract not found at given address") : contract(unit)), amt * 1mutez)
                            |   Fa12(token) -> transferFa12Token(from_, to_, amt, token)
                            |   Fa2(token)  -> transferFa2Token(from_, to_, amt, token.tokenId, token.tokenContractAddress)
                        ];

                        operations := transferRewardOperation # operations;

                    };

                }

            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Token Pool Reward Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Token Pool Reward Lambdas End
//
// ------------------------------------------------------------------------------