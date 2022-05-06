// ------------------------------------------------------------------------------
//
// Farm Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const farmLambdaAction : farmLambdaActionType; var s : farmStorage) : return is
block {

    checkSenderIsAllowed(s); 
    
    case farmLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        | _ -> skip
    ];
    
} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const farmLambdaAction : farmLambdaActionType; var s : farmStorage) : return is
block {
    
    checkSenderIsAllowed(s);

    case farmLambdaAction of [
        | LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const farmLambdaAction : farmLambdaActionType; var s : farmStorage) : return is
block {
    
    checkSenderIsAdmin(s);
    
    case farmLambdaAction of [
        | LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateConfig lambda *)
function lambdaUpdateConfig(const farmLambdaAction : farmLambdaActionType; var s : farmStorage) : return is 
block {

  checkSenderIsAdmin(s); 
  
  case farmLambdaAction of [
        | LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : farmUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : farmUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    ConfigForceRewardFromTransfer (_v)  -> block {
                        if updateConfigNewValue =/= 1n and updateConfigNewValue =/= 0n then failwith(error_CONFIG_VALUE_ERROR) else skip;
                        s.config.forceRewardFromTransfer    := updateConfigNewValue = 1n;
                    }
                | ConfigRewardPerBlock (_v)          -> block {
                        // check if farm has been initiated
                        checkFarmIsInit(s);

                        checkFarmIsInit(s);

                        // update farmStorage
                        s := updateFarm(s);

                        // Check new reward per block
                        const currentRewardPerBlock: nat = s.config.plannedRewards.currentRewardPerBlock;
                        if currentRewardPerBlock > updateConfigNewValue then failwith(error_CANNOT_LOWER_REWARD_PER_BLOCK) else skip;

                        // Calculate new total rewards
                        const totalClaimedRewards: nat = s.claimedRewards.unpaid+s.claimedRewards.paid;
                        const remainingBlocks: nat = abs((s.initBlock + s.config.plannedRewards.totalBlocks) - s.lastBlockUpdate);
                        const newTotalRewards: nat = totalClaimedRewards + remainingBlocks * updateConfigNewValue;

                        // Update farmStorage
                        s.config.plannedRewards.currentRewardPerBlock := updateConfigNewValue;
                        s.config.plannedRewards.totalRewards := newTotalRewards;
                    }
                ];

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const farmLambdaAction : farmLambdaActionType; var s: farmStorage): return is
block {
    
    checkSenderIsAdmin(s);
    
    case farmLambdaAction of [
        | LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const farmLambdaAction : farmLambdaActionType; var s: farmStorage): return is
block {

    checkSenderIsAdmin(s);
    
    case farmLambdaAction of [
        | LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Farm Admin Lambdas End
// ------------------------------------------------------------------------------

(*  updateBlocksPerMinute lambda *)
function lambdaUpdateBlocksPerMinute(const farmLambdaAction : farmLambdaActionType; var s: farmStorage) : return is
block {
    
    // check that source is admin or factory
    checkSenderOrSourceIsCouncil(s);

    // check if farm has been initiated
    checkFarmIsInit(s);

    case farmLambdaAction of [
        | LambdaUpdateBlocksPerMinute(blocksPerMinute) -> {
                
                // update farmStorage
                s := updateFarm(s);

                // Check new blocksPerMinute
                if blocksPerMinute > 0n then skip else failwith(error_BLOCKS_PER_MINUTE_VALUE_ERROR);

                var newcurrentRewardPerBlock: nat := 0n;
                if s.config.infinite then {
                    newcurrentRewardPerBlock := s.config.blocksPerMinute * s.config.plannedRewards.currentRewardPerBlock * fixedPointAccuracy / blocksPerMinute;
                }
                else {
                    // Unclaimed rewards
                    const totalUnclaimedRewards: nat = abs(s.config.plannedRewards.totalRewards - (s.claimedRewards.unpaid+s.claimedRewards.paid));

                    // Updates rewards and total blocks accordingly
                    const blocksPerMinuteRatio: nat = s.config.blocksPerMinute * fixedPointAccuracy / blocksPerMinute;
                    const newTotalBlocks: nat = (s.config.plannedRewards.totalBlocks * fixedPointAccuracy) / blocksPerMinuteRatio;
                    const remainingBlocks: nat = abs((s.initBlock + newTotalBlocks) - s.lastBlockUpdate);
                    newcurrentRewardPerBlock := (totalUnclaimedRewards * fixedPointAccuracy) / remainingBlocks;
                    
                    // Update farmStorage
                    s.config.plannedRewards.totalBlocks := newTotalBlocks;
                };

                // Update farmStorage
                s.config.blocksPerMinute := blocksPerMinute;
                s.config.plannedRewards.currentRewardPerBlock := (newcurrentRewardPerBlock/fixedPointAccuracy);

            }
        | _ -> skip
    ];

} with (noOperations, s)



(* initFarm lambda *)
function lambdaInitFarm(const farmLambdaAction : farmLambdaActionType; var s: farmStorage): return is
block{

    checkSenderIsAdmin(s);

    case farmLambdaAction of [
        | LambdaInitFarm(initFarmParams) -> {
                
                // Check if farm is already open
                if s.open or s.init then failwith(error_FARM_ALREADY_OPEN) else skip;

                // Check if the blocks per minute is greater than 0
                if initFarmParams.blocksPerMinute <= 0n then failwith(error_BLOCKS_PER_MINUTE_VALUE_ERROR) else skip;

                // Check wether the farm is infinite or its total blocks has been set
                if not initFarmParams.infinite and initFarmParams.totalBlocks = 0n then failwith(error_FARM_SHOULD_BE_INFINITE_OR_HAVE_A_DURATION) else skip;
                
                // Update farmStorage
                s := updateFarm(s);
                s.initBlock := Tezos.level;
                s.config.infinite := initFarmParams.infinite;
                s.config.forceRewardFromTransfer := initFarmParams.forceRewardFromTransfer;
                s.config.plannedRewards.currentRewardPerBlock := initFarmParams.currentRewardPerBlock;
                s.config.plannedRewards.totalBlocks := initFarmParams.totalBlocks;
                s.config.plannedRewards.totalRewards := s.config.plannedRewards.currentRewardPerBlock * s.config.plannedRewards.totalBlocks;
                s.config.blocksPerMinute := initFarmParams.blocksPerMinute;
                s.open := True ;
                s.init := True ;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(* closeFarm lambda *)
function lambdaCloseFarm(const farmLambdaAction : farmLambdaActionType; var s: farmStorage): return is
block{
    
    checkSenderIsAdmin(s);

    checkFarmIsOpen(s);

    case farmLambdaAction of [
        | LambdaCloseFarm(_parameters) -> {
                
                s := updateFarm(s);
                s.open := False ;
                
            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Farm Admin Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(*  pauseAll lambda *)
function lambdaPauseAll(const farmLambdaAction : farmLambdaActionType; var s: farmStorage) : return is
block {
    
    checkSenderIsAllowed(s);

    case farmLambdaAction of [
        | LambdaPauseAll(_parameters) -> {
                
                // set all pause configs to True
                if s.breakGlassConfig.depositIsPaused then skip
                else s.breakGlassConfig.depositIsPaused := True;

                if s.breakGlassConfig.withdrawIsPaused then skip
                else s.breakGlassConfig.withdrawIsPaused := True;

                if s.breakGlassConfig.claimIsPaused then skip
                else s.breakGlassConfig.claimIsPaused := True;

            }
        | _ -> skip
    ];
    
} with (noOperations, s)



(*  unpauseAll lambda *)
function lambdaUnpauseAll(const farmLambdaAction : farmLambdaActionType; var s : farmStorage) : return is
block {

    checkSenderIsAllowed(s);

    case farmLambdaAction of [
        | LambdaUnpauseAll(_parameters) -> {
                
                // set all pause configs to False
                if s.breakGlassConfig.depositIsPaused then s.breakGlassConfig.depositIsPaused := False
                else skip;

                if s.breakGlassConfig.withdrawIsPaused then s.breakGlassConfig.withdrawIsPaused := False
                else skip;

                if s.breakGlassConfig.claimIsPaused then s.breakGlassConfig.claimIsPaused := False
                else skip;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseDeposit lambda *)
function lambdaTogglePauseDeposit(const farmLambdaAction : farmLambdaActionType; var s : farmStorage) : return is
block {
    
    checkSenderIsAllowed(s);

    case farmLambdaAction of [
        | LambdaTogglePauseDeposit(_parameters) -> {
                
                if s.breakGlassConfig.depositIsPaused then s.breakGlassConfig.depositIsPaused := False
                else s.breakGlassConfig.depositIsPaused := True;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseWithdraw lambda *)
function lambdaTogglePauseWithdraw(const farmLambdaAction : farmLambdaActionType; var s : farmStorage) : return is
block {

    checkSenderIsAllowed(s);

    case farmLambdaAction of [
        | LambdaTogglePauseWithdraw(_parameters) -> {
                
                if s.breakGlassConfig.withdrawIsPaused then s.breakGlassConfig.withdrawIsPaused := False
                else s.breakGlassConfig.withdrawIsPaused := True;

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseClaim lambda *)
function lambdaTogglePauseClaim(const farmLambdaAction : farmLambdaActionType; var s : farmStorage) : return is
block {

    checkSenderIsAllowed(s);

    case farmLambdaAction of [
        | LambdaTogglePauseWithdraw(_parameters) -> {
                
                if s.breakGlassConfig.claimIsPaused then s.breakGlassConfig.claimIsPaused := False
                else s.breakGlassConfig.claimIsPaused := True;

            }
        | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Farm Lambdas Begin
// ------------------------------------------------------------------------------

(* deposit lambda *)
function lambdaDeposit(const farmLambdaAction : farmLambdaActionType; var s: farmStorage) : return is
block{

    // break glass check
    checkDepositIsNotPaused(s);

    // Check if farm has started
    checkFarmIsInit(s);

    var operations : list(operation) := nil;

    case farmLambdaAction of [
        | LambdaDeposit(tokenAmount) -> {
                
                // Update pool farmStorage
                s := updateFarm(s);

                // Check if farm is closed or not
                checkFarmIsOpen(s);

                // Depositor address
                const depositor: depositor = Tezos.sender;

                // Check if sender as already a record
                const existingDepositor: bool = Big_map.mem(depositor, s.depositors);

                // Prepare new depositor record
                var depositorRecord: depositorRecord := record[
                    balance                     =0n;
                    participationMVKPerShare    =s.accumulatedRewardsPerShare;
                    unclaimedRewards            =0n;
                    claimedRewards              =0n;
                ];

                // Get depositor deposit and perform a claim
                if existingDepositor then {
                    // Update user's unclaimed rewards
                    s := updateUnclaimedRewards(s);

                    // Refresh depositor deposit with updated unclaimed rewards
                    depositorRecord :=  case getDepositorDeposit(depositor, s) of [
                        Some (_depositor)   -> _depositor
                    |   None                -> failwith(error_DEPOSITOR_NOT_FOUND)
                    ];
                    
                }
                else skip;

                // Update depositor token balance
                depositorRecord.balance := depositorRecord.balance + tokenAmount;

                // Update depositors Big_map and farmTokenBalance
                s.config.lpToken.tokenBalance := s.config.lpToken.tokenBalance + tokenAmount;
                s.depositors := Big_map.update(depositor, Some (depositorRecord), s.depositors);

                // Transfer LP tokens from sender to farm balance in LP Contract (use Allowances)
                const transferOperation: operation = transferLP(depositor, Tezos.self_address, tokenAmount, s.config.lpToken.tokenId, s.config.lpToken.tokenStandard, s.config.lpToken.tokenAddress);

                operations := transferOperation # operations;

            }
        | _ -> skip
    ];

} with(operations, s)



(* withdraw lambda *)
function lambdaWithdraw(const farmLambdaAction : farmLambdaActionType; var s: farmStorage) : return is
block{

    // break glass check
    checkWithdrawIsNotPaused(s);

    // Check if farm has started
    checkFarmIsInit(s);

    var operations : list(operation) := nil;

    case farmLambdaAction of [
        | LambdaWithdraw(tokenAmount) -> {
                
                // Update pool farmStorage
                s := updateFarm(s);     

                const depositor: depositor = Tezos.sender;

                // Prepare to update user's unclaimedRewards if user already deposited tokens
                s := updateUnclaimedRewards(s);

                var depositorRecord: depositorRecord := case getDepositorDeposit(depositor, s) of [
                    Some (d)    -> d
                |   None        -> failwith(error_DEPOSITOR_NOT_FOUND)
                ];

                // Check if the depositor has enough token to withdraw
                if tokenAmount > depositorRecord.balance then failwith(error_WITHDRAWN_AMOUNT_TOO_HIGH) else skip;
                depositorRecord.balance := abs(depositorRecord.balance - tokenAmount);
                s.depositors := Big_map.update(depositor, Some (depositorRecord), s.depositors);

                // Check if the farm has enough token
                if tokenAmount > s.config.lpToken.tokenBalance then failwith(error_WITHDRAWN_AMOUNT_TOO_HIGH) else skip;
                s.config.lpToken.tokenBalance := abs(s.config.lpToken.tokenBalance - tokenAmount);
                
                // Transfer LP tokens to the user from the farm balance in the LP Contract
                const transferOperation: operation = transferLP(
                    Tezos.self_address,
                    depositor,
                    tokenAmount,
                    s.config.lpToken.tokenId, 
                    s.config.lpToken.tokenStandard,
                    s.config.lpToken.tokenAddress
                );

                operations := transferOperation # operations;

            }
        | _ -> skip
    ];

} with(operations, s)



(* claim lambda *)
function lambdaClaim(const farmLambdaAction : farmLambdaActionType; var s: farmStorage) : return is
block{

    // break glass check
    checkClaimIsNotPaused(s);

    // Check if farm has started
    checkFarmIsInit(s);

    var operations : list(operation) := nil;

    case farmLambdaAction of [
        | LambdaClaim(_parameters) -> {
                
                // Update pool farmStorage
                s := updateFarm(s);

                // Update user's unclaimed rewards
                s := updateUnclaimedRewards(s);

                const depositor: depositor = Tezos.sender;

                // Check if sender as already a record
                var depositorRecord: depositorRecord := case getDepositorDeposit(depositor, s) of [
                    Some (r)        -> r
                |   None            -> (failwith(error_DEPOSITOR_NOT_FOUND): depositorRecord)
                ];

                const claimedRewards: tokenBalance = depositorRecord.unclaimedRewards;

                if claimedRewards = 0n then failwith(error_NOTHING_TO_CLAIM) else skip;

                // Store new unclaimedRewards value in depositor
                depositorRecord.claimedRewards      := depositorRecord.claimedRewards + depositorRecord.unclaimedRewards;
                depositorRecord.unclaimedRewards    := 0n;
                s.depositors := Big_map.update(depositor, Some (depositorRecord), s.depositors);

                // Transfer sMVK rewards
                const transferRewardOperation: operation = transferReward(depositor, claimedRewards, s);

                operations := transferRewardOperation # operations;

            }
        | _ -> skip
    ];

} with(operations, s)

// ------------------------------------------------------------------------------
// Farm Lambdas End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
//
// Farm Lambdas End
//
// ------------------------------------------------------------------------------
