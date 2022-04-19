// ------------------------------------------------------------------------------
//
// Farm Lambdas
//
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const newAdminAddress : address; var s : farmStorage) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin
    s.admin := newAdminAddress;
    
} with (noOperations, s)



(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const metadataKey: string; const metadataHash: bytes; var s : farmStorage) : return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)
    // Update metadata
    s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);

} with (noOperations, s)



(*  updateConfig lambda *)
function lambdaUpdateConfig(const updateConfigParams : farmUpdateConfigParamsType; var s : farmStorage) : return is 
block {

  checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance DAO contract address)

  const updateConfigAction    : farmUpdateConfigActionType   = updateConfigParams.updateConfigAction;
  const updateConfigNewValue  : farmUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

  case updateConfigAction of [
    ConfigForceRewardFromTransfer (_v)  -> block {
        if updateConfigNewValue =/= 1n and updateConfigNewValue =/= 0n then failwith("Configuration value error") else skip;
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
        if currentRewardPerBlock > updateConfigNewValue then failwith("The new reward per block must be higher than the previous one.") else skip;

        // Calculate new total rewards
        const totalClaimedRewards: nat = s.claimedRewards.unpaid+s.claimedRewards.paid;
        const remainingBlocks: nat = abs((s.initBlock + s.config.plannedRewards.totalBlocks) - s.lastBlockUpdate);
        const newTotalRewards: nat = totalClaimedRewards + remainingBlocks * updateConfigNewValue;

        // Update farmStorage
        s.config.plannedRewards.currentRewardPerBlock := updateConfigNewValue;
        s.config.plannedRewards.totalRewards := newTotalRewards;
  }
  ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const updateWhitelistContractsParams: updateWhitelistContractsParams; var s: farmStorage): return is
block {
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const updateGeneralContractsParams: updateGeneralContractsParams; var s: farmStorage): return is
block {

    // check that sender is admin
    checkSenderIsAdmin(s);
    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Farm Admin Lambdas End
// ------------------------------------------------------------------------------

(*  updateBlocksPerMinute lambda *)
function lambdaUpdateBlocksPerMinute(const blocksPerMinute: nat; var s: farmStorage) : return is
block {
    // check that source is admin or factory
    checkSenderOrSourceIsCouncil(s);

    // check if farm has been initiated
    checkFarmIsInit(s);

    // update farmStorage
    s := updateFarm(s);

    // Check new blocksPerMinute
    if blocksPerMinute > 0n then skip else failwith("The new block per minute should be greater than zero");

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

} with (noOperations, s)



(* initFarm lambda *)
function lambdaInitFarm (const initFarmParams: initFarmParamsType; var s: farmStorage): return is
block{

    // Check if sender is admin
    checkSenderIsAdmin(s);

    // Check if farm is already open
    if s.open or s.init then failwith("This farm is already opened you cannot initialize it again") else skip;

    // Check if the blocks per minute is greater than 0
    if initFarmParams.blocksPerMinute <= 0n then failwith("This farm farm blocks per minute should be greater than 0") else skip;

    // Check wether the farm is infinite or its total blocks has been set
    if not initFarmParams.infinite and initFarmParams.totalBlocks = 0n then failwith("This farm should be either infinite or have a specified duration") else skip;
    
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

} with (noOperations, s)



(* closeFarm lambda *)
function lambdaCloseFarm (var s: farmStorage): return is
block{
    // Check sender is admin
    checkSenderIsAdmin(s);

    // Check if farm is open
    checkFarmIsOpen(s);
    
    s := updateFarm(s);
    s.open := False ;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Farm Admin Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(*  pauseAll lambda *)
function lambdaPauseAll(var s: farmStorage) : return is
block {
    // check that source is admin
    checkSenderIsAllowed(s);

    // set all pause configs to True
    if s.breakGlassConfig.depositIsPaused then skip
    else s.breakGlassConfig.depositIsPaused := True;

    if s.breakGlassConfig.withdrawIsPaused then skip
    else s.breakGlassConfig.withdrawIsPaused := True;

    if s.breakGlassConfig.claimIsPaused then skip
    else s.breakGlassConfig.claimIsPaused := True;

} with (noOperations, s)



(*  unpauseAll lambda *)
function lambdaUnpauseAll(var s : farmStorage) : return is
block {
    // check that source is admin
    checkSenderIsAllowed(s);

    // set all pause configs to False
    if s.breakGlassConfig.depositIsPaused then s.breakGlassConfig.depositIsPaused := False
    else skip;

    if s.breakGlassConfig.withdrawIsPaused then s.breakGlassConfig.withdrawIsPaused := False
    else skip;

    if s.breakGlassConfig.claimIsPaused then s.breakGlassConfig.claimIsPaused := False
    else skip;

} with (noOperations, s)



(*  togglePauseDeposit lambda *)
function lambdaTogglePauseDeposit(var s : farmStorage) : return is
block {
    // check that source is admin
    checkSenderIsAllowed(s);

    if s.breakGlassConfig.depositIsPaused then s.breakGlassConfig.depositIsPaused := False
    else s.breakGlassConfig.depositIsPaused := True;

} with (noOperations, s)



(*  togglePauseWithdraw lambda *)
function lambdaTogglePauseWithdraw(var s : farmStorage) : return is
block {
    // check that source is admin
    checkSenderIsAllowed(s);

    if s.breakGlassConfig.withdrawIsPaused then s.breakGlassConfig.withdrawIsPaused := False
    else s.breakGlassConfig.withdrawIsPaused := True;

} with (noOperations, s)



(*  togglePauseClaim lambda *)
function lambdaTogglePauseClaim(var s : farmStorage) : return is
block {
    // check that source is admin
    checkSenderIsAllowed(s);

    if s.breakGlassConfig.claimIsPaused then s.breakGlassConfig.claimIsPaused := False
    else s.breakGlassConfig.claimIsPaused := True;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Farm Lambdas Begin
// ------------------------------------------------------------------------------

(* deposit lambda *)
function lambdaDeposit(const tokenAmount: tokenBalance; var s: farmStorage) : return is
block{

    // break glass check
    checkDepositIsNotPaused(s);

    // Check if farm has started
    checkFarmIsInit(s);

    // Update pool farmStorage
    s := updateFarm(s);

    // Check if farm is closed or not
    checkFarmIsOpen(s);

    // Delegator address
    const delegator: delegator = Tezos.sender;

    // Check if sender as already a record
    const existingDelegator: bool = Big_map.mem(delegator, s.delegators);

    // Prepare new delegator record
    var delegatorRecord: delegatorRecord := record[
        balance=0n;
        participationMVKPerShare=s.accumulatedMVKPerShare;
        unclaimedRewards=0n
    ];

    // Get delegator deposit and perform a claim
    if existingDelegator then {
        // Update user's unclaimed rewards
        s := updateUnclaimedRewards(s);

        // Refresh delegator deposit with updated unclaimed rewards
        delegatorRecord :=  case getDelegatorDeposit(delegator, s) of [
            Some (_delegator) -> _delegator
        |   None -> failwith("Delegator not found")
        ];
        
    }
    else skip;

    // Update delegator token balance
    delegatorRecord.balance := delegatorRecord.balance + tokenAmount;

    // Update delegators Big_map and farmTokenBalance
    s.config.lpToken.tokenBalance := s.config.lpToken.tokenBalance + tokenAmount;
    s.delegators := Big_map.update(delegator, Some (delegatorRecord), s.delegators);

    // Transfer LP tokens from sender to farm balance in LP Contract (use Allowances)
    const operation: operation = transferLP(delegator, Tezos.self_address, tokenAmount, s.config.lpToken.tokenId, s.config.lpToken.tokenStandard, s.config.lpToken.tokenAddress);

} with(list[operation], s)



(* withdraw lambda *)
function lambdaWithdraw(const tokenAmount: tokenBalance; var s: farmStorage) : return is
block{

    // break glass check
    checkWithdrawIsNotPaused(s);

    // Check if farm has started
    checkFarmIsInit(s);

    // Update pool farmStorage
    s := updateFarm(s);

    const delegator: delegator = Tezos.sender;

    // Prepare to update user's unclaimedRewards if user already deposited tokens
    s := updateUnclaimedRewards(s);

    var delegatorRecord: delegatorRecord := case getDelegatorDeposit(delegator, s) of [
        Some (d) -> d
    |   None -> failwith("DELEGATOR_NOT_FOUND")
    ];

    // Check if the delegator has enough token to withdraw
    if tokenAmount > delegatorRecord.balance then failwith("The amount withdrawn is higher than the delegator deposit") else skip;
    delegatorRecord.balance := abs(delegatorRecord.balance - tokenAmount);
    s.delegators := Big_map.update(delegator, Some (delegatorRecord), s.delegators);

    // Check if the farm has enough token
    if tokenAmount > s.config.lpToken.tokenBalance then failwith("The amount withdrawn is higher than the farm lp balance") else skip;
    s.config.lpToken.tokenBalance := abs(s.config.lpToken.tokenBalance - tokenAmount);
    
    // Transfer LP tokens to the user from the farm balance in the LP Contract
    const operation: operation = transferLP(
        Tezos.self_address,
        delegator,
        tokenAmount,
        s.config.lpToken.tokenId, 
        s.config.lpToken.tokenStandard,
        s.config.lpToken.tokenAddress
    );

} with(list[operation], s)

(* claim lambda *)
function lambdaClaim(var s: farmStorage) : return is
block{

    // break glass check
    checkClaimIsNotPaused(s);

    // Check if farm has started
    checkFarmIsInit(s);

    // Update pool farmStorage
    s := updateFarm(s);

    // Update user's unclaimed rewards
    s := updateUnclaimedRewards(s);

    const delegator: delegator = Tezos.sender;

    // Check if sender as already a record
    var delegatorRecord: delegatorRecord := case getDelegatorDeposit(delegator, s) of [
        Some (r) -> r
    |   None -> (failwith("DELEGATOR_NOT_FOUND"): delegatorRecord)
    ];

    const claimedRewards: tokenBalance = delegatorRecord.unclaimedRewards;

    if claimedRewards = 0n then failwith("The delegator has no rewards to claim") else skip;

    // Store new unclaimedRewards value in delegator
    delegatorRecord.unclaimedRewards := 0n;
    s.delegators := Big_map.update(delegator, Some (delegatorRecord), s.delegators);

    // Transfer sMVK rewards
    const operation: operation = transferReward(delegator, claimedRewards, s);

} with(list[operation], s)

// ------------------------------------------------------------------------------
// Farm Lambdas End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
//
// Farm Lambdas End
//
// ------------------------------------------------------------------------------
