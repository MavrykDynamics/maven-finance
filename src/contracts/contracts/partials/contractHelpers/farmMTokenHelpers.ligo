// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// On-chain views to Lending Controller Helper Functions Begin
// ------------------------------------------------------------------------------

(* Get loan token record from lending controller contract *)
function getLoanTokenRecordFromLendingController(const loanTokenName : string; const s : farmMTokenStorageType) : loanTokenRecordType is 
block {

    // Get Lending Controller Address from the General Contracts map on the Governance Contract
    const lendingControllerAddress: address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);
        
    // get loan token record of user from Lending Controller through on-chain views
    const getLoanTokenRecordOptView : option (option (loanTokenRecordType)) = Mavryk.call_view ("getLoanTokenRecordOpt", loanTokenName, lendingControllerAddress);
    const loanTokenRecord : loanTokenRecordType = case getLoanTokenRecordOptView of [
            Some (_viewResult)  -> case _viewResult of [
                    Some (_record)  -> _record
                |   None            -> failwith (error_LOAN_TOKEN_RECORD_NOT_FOUND)
            ]
        |   None -> failwith (error_GET_LOAN_TOKEN_RECORD_OPT_VIEW_IN_LENDING_CONTROLLER_CONTRACT_NOT_FOUND)
    ];

} with loanTokenRecord

// ------------------------------------------------------------------------------
// On-chain views to Lending Controller Helper Functions Begin
// ------------------------------------------------------------------------------

(* Get mToken balance *)
function getMTokenBalance(const s : farmMTokenStorageType) : nat is 
block {

    const mTokenAddress : address = s.config.lpToken.tokenAddress;

    // get loan token record of user from Lending Controller through on-chain views
    const getBalanceOptView : option (nat) = Mavryk.call_view ("get_balance", (Mavryk.get_self_address(), 0n), mTokenAddress);
    const farmMTokenBalance : nat = case getBalanceOptView of [
            Some (_balance)  -> _balance
        |   None             -> failwith (error_GET_BALANCE_VIEW_IN_M_TOKEN_CONTRACT_NOT_FOUND)
    ];

} with farmMTokenBalance


// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Admin, Governance Contract, Farm Factory Contract
function verifySenderIsGovernanceOrFactory(const s : farmMTokenStorageType) : unit is
block {

    const farmFactoryAddress : address = getContractAddressFromGovernanceContract("farmFactory", s.governanceAddress, error_FARM_FACTORY_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[s.admin; s.governanceAddress; farmFactoryAddress], error_ONLY_ADMIN_OR_GOVERNANCE_OR_FARM_FACTORY_CONTRACT_ALLOWED)

} with(unit)



// Allowed Senders: Admin, Governance Satellite Contract
function verifySenderIsAdminOrGovernanceSatelliteContract(var s : farmMTokenStorageType) : unit is
block{

    const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[s.admin; governanceSatelliteAddress], error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED)

} with unit



// Check that farm is open
function checkFarmIsOpen(const s : farmMTokenStorageType) : unit is 
    if not s.open then failwith(error_FARM_CLOSED)
    else unit



// Check that farm is initiated
function verifyFarmIsInitialised(const s : farmMTokenStorageType) : unit is 
    if not s.init then failwith(error_FARM_NOT_INITIATED)
    else unit



// Verify that farm is not open
function verifyFarmIsNotOpen(const s : farmMTokenStorageType) : unit is
block {

    if s.open or s.init then failwith(error_FARM_ALREADY_OPEN) else skip;

} with unit



// Validate that farm has proper reward block settings (reward blocks is non-zero or farm is infinite)
function validateFarmRewardBlocks(const initFarmParams : initFarmParamsType) : unit is
block {
    
    if not initFarmParams.infinite and initFarmParams.totalBlocks = 0n then failwith(error_FARM_SHOULD_BE_INFINITE_OR_HAVE_A_DURATION) else skip;

} with unit



// Verify that user has farm rewards (greater than 0)
function verifyUnclaimedRewardsExist(const unclaimedRewards : nat) : unit is 
block {

    if unclaimedRewards = 0n then failwith(error_NO_FARM_REWARDS_TO_CLAIM) else skip;

} with unit



// Verify that user has sufficient balance
function verifySufficientBalance(const withdrawAmount : nat; const depositorBalance : nat; const errorCode : nat) : unit is
block {

    if withdrawAmount > depositorBalance then failwith(errorCode) else skip;

} with unit



// Check that depositor exists
function checkDepositorExists(const depositorAddress : address; const s : farmMTokenStorageType) : bool is
block {

    const checkDepositorExists : bool = Big_map.mem(depositorAddress, s.depositorLedger);

} with checkDepositorExists

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / BreakGlass Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to pause all entrypoints
function pauseAllFarmEntrypoints(var s : farmMTokenStorageType) : farmMTokenStorageType is 
block {

    // set all pause configs to True
    if s.breakGlassConfig.depositIsPaused then skip
    else s.breakGlassConfig.depositIsPaused := True;

    if s.breakGlassConfig.withdrawIsPaused then skip
    else s.breakGlassConfig.withdrawIsPaused := True;

    if s.breakGlassConfig.claimIsPaused then skip
    else s.breakGlassConfig.claimIsPaused := True;

} with s



// helper function to unpause all entrypoints
function unpauseAllFarmEntrypoints(var s : farmMTokenStorageType) : farmMTokenStorageType is 
block {

    // set all pause configs to False
    if s.breakGlassConfig.depositIsPaused then s.breakGlassConfig.depositIsPaused := False
    else skip;

    if s.breakGlassConfig.withdrawIsPaused then s.breakGlassConfig.withdrawIsPaused := False
    else skip;

    if s.breakGlassConfig.claimIsPaused then s.breakGlassConfig.claimIsPaused := False
    else skip;

} with s

// ------------------------------------------------------------------------------
// Pause / BreakGlass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Transfer Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to transfer LP Token
function transferLP(const from_ : address; const to_ : address; const tokenAmount : tokenBalanceType; const tokenId : nat; const tokenStandard : lpStandardType; const tokenContractAddress : address) : operation is
    case tokenStandard of [
            Fa12 -> transferFa12Token(from_,to_,tokenAmount,tokenContractAddress)
        |   Fa2  -> transferFa2Token(from_,to_,tokenAmount,tokenId,tokenContractAddress)
    ]

    
// helper function to transfer Farm LP Token
function transferFarmLpTokenOperation(const from_ : address; const to_ : address; const tokenAmount : tokenBalanceType; const s : farmMTokenStorageType) : operation is 
block {

    const transferOperation : operation = transferLP(
        from_,                          // from_
        to_,                            // to_
        tokenAmount,                    // tokenAmount
        s.config.lpToken.tokenId,       // tokenId
        s.config.lpToken.tokenStandard, // tokenStandard (i.e. FA2 or FA12)
        s.config.lpToken.tokenAddress   // tokenContractAddress
    );

} with transferOperation


// helper function to transfer reward to depositor through the %farmClaim entrypoint on the Doorman Contract
function transferReward(const farmClaimDepositors : set(farmClaimDepositorType); const s : farmMTokenStorageType) : operation is
block{

    // --------------------------------------------------------------------------------------
    // Transfer reward to depositor through the %farmClaim entrypoint on the Doorman Contract
    // --------------------------------------------------------------------------------------

    // Get Doorman Contract Address from the General Contracts Map on the Governance Contract
    const doormanContractAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);
    
    // Get %farmClaim entrypoint on the Doorman Contract
    const doormanContract : contract(farmClaimType) = case (Mavryk.get_entrypoint_opt("%farmClaim", doormanContractAddress) : option(contract(farmClaimType))) of [
            Some (c) -> c
        |   None     -> (failwith(error_FARM_CLAIM_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND) : contract(farmClaimType))
    ];

    // Init farmClaim entrypoint parameters 
    const farmClaimParams : farmClaimType = (farmClaimDepositors, s.config.forceRewardFromTransfer);

} with (Mavryk.transaction(farmClaimParams, 0mav, doormanContract))

// ------------------------------------------------------------------------------
// Transfer Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to create depositor record
function createDepositorRecord(const tokenRewardIndex : nat; const s : farmMTokenStorageType) : depositorRecordType is 
block {

    const newDepositorRecord : depositorRecordType = record [
        balance                         = 0n;
        participationRewardsPerShare    = s.accumulatedRewardsPerShare;
        tokenRewardIndex                = tokenRewardIndex;
        unclaimedRewards                = 0n;
        claimedRewards                  = 0n;
    ];

} with newDepositorRecord 



// helper function to get depositor record
function getDepositorRecord(const userAddress : address; const s : farmMTokenStorageType) : depositorRecordType is
block {

    const depositorRecord : depositorRecordType = case s.depositorLedger[userAddress] of [
            Some (_depositor)   -> _depositor
        |   None                -> failwith(error_DEPOSITOR_NOT_FOUND)
    ];

} with depositorRecord



// helper function to get or create depositor record
function getOrCreateDepositorRecord(const userAddress : address; const tokenRewardIndex : nat; const s : farmMTokenStorageType) : depositorRecordType is 
block {

    const depositorRecord : depositorRecordType = case s.depositorLedger[userAddress] of [
            Some (_depositor)   -> _depositor
        |   None                -> record [
                balance                         = 0n;
                participationRewardsPerShare    = s.accumulatedRewardsPerShare;
                tokenRewardIndex                = tokenRewardIndex;
                unclaimedRewards                = 0n;
                claimedRewards                  = 0n;
            ]
    ];

} with depositorRecord 




// helper function to init farm
function _initFarm(const initFarmParams : initFarmParamsType; var s : farmMTokenStorageType) : farmMTokenStorageType is
block {

    s.initBlock                                     := Mavryk.get_level();
    s.config.infinite                               := initFarmParams.infinite;
    s.config.forceRewardFromTransfer                := initFarmParams.forceRewardFromTransfer;
    s.config.plannedRewards.currentRewardPerBlock   := initFarmParams.currentRewardPerBlock;
    s.config.plannedRewards.totalBlocks             := initFarmParams.totalBlocks;
    s.config.plannedRewards.totalRewards            := s.config.plannedRewards.currentRewardPerBlock * s.config.plannedRewards.totalBlocks;
    s.minBlockTimeSnapshot                          := 15n;
    s.open                                          := True;
    s.init                                          := True;

} with s

// ------------------------------------------------------------------------------
// General Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Farm Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to update the farm duration and rewards based on the current protocol block time
function updateDurationAndRewards(var s: farmMTokenStorageType) : farmMTokenStorageType is
block {
    
    // Get last block time
    const lastBlockTime : nat       = s.minBlockTimeSnapshot;
    const currentBlockTime : nat    = Mavryk.get_min_block_time();

    if lastBlockTime =/= currentBlockTime then {
        
        // Calculate new rewards per block
        var newCurrentRewardPerBlock : nat := 0n;
        if s.config.infinite then {

            newCurrentRewardPerBlock := currentBlockTime * s.config.plannedRewards.currentRewardPerBlock * fixedPointAccuracy / lastBlockTime;

        }
        else {

            // Unclaimed rewards
            const totalUnclaimedRewards : nat = abs(s.config.plannedRewards.totalRewards - (s.claimedRewards.unpaid + s.claimedRewards.paid));

            // Updates rewards and total blocks accordingly
            const newTotalBlocks        : nat = (lastBlockTime * s.config.plannedRewards.totalBlocks * fixedPointAccuracy) / currentBlockTime;
            const remainingBlocks       : nat = abs((s.initBlock + newTotalBlocks) - s.lastBlockUpdate);
            
            newCurrentRewardPerBlock    := (totalUnclaimedRewards * fixedPointAccuracy * fixedPointAccuracy) / remainingBlocks;
            
            // Update new total blocks
            s.config.plannedRewards.totalBlocks := newTotalBlocks / fixedPointAccuracy;
        };

        // Update farm storage with new config values (minBlockTimeSnapshot and currentRewardPerBlock)
        s.minBlockTimeSnapshot                          := currentBlockTime;
        s.config.plannedRewards.currentRewardPerBlock   := (newCurrentRewardPerBlock/fixedPointAccuracy);
        s.config.plannedRewards.totalRewards            := s.config.plannedRewards.currentRewardPerBlock * s.config.plannedRewards.totalBlocks;

    } else skip;

} with (s)



// helper function to update farm blocks 
function updateBlock(var s: farmMTokenStorageType) : farmMTokenStorageType is
block{
    
    // Calculate farm's last block level at which it will close
    const lastBlock : nat = s.config.plannedRewards.totalBlocks + s.initBlock;

    // Close farm if totalBlocks duration has been exceeded
    // Farm remains open if totalBlocks duration has not been exceeded, or if it's an infinite farm
    s.open := Mavryk.get_level() <= lastBlock or s.config.infinite;

    // Update lastBlockUpdate in farmMTokenStorageType
    s.lastBlockUpdate := Mavryk.get_level();

} with (s)



// helper function to update farm parameters
function updateFarmParameters(const farmMTokenBalance : nat; var s: farmMTokenStorageType) : farmMTokenStorageType is
block{

    // Compute the potential reward of this block
    const multiplier : nat = abs(Mavryk.get_level() - s.lastBlockUpdate);
    const suspectedReward : tokenBalanceType = multiplier * s.config.plannedRewards.currentRewardPerBlock;

    // This check is necessary in case the farm unpaid reward was not updated for a long time
    // and the outstandingReward grew to such a big number that it exceeds the planned rewards.
    // In that case only the difference between planned and claimed rewards is paid out to empty
    // the account.
    const totalClaimedRewards : tokenBalanceType = s.claimedRewards.paid + s.claimedRewards.unpaid;
    const totalFarmRewards : tokenBalanceType = suspectedReward + totalClaimedRewards;
    const totalPlannedRewards : tokenBalanceType = s.config.plannedRewards.totalRewards;
    const reward : tokenBalanceType = case totalFarmRewards > totalPlannedRewards and not s.config.infinite of [
            True  -> abs(totalPlannedRewards - totalClaimedRewards)
        |   False -> suspectedReward
    ];
        
    // Update farm storage - unpaid amount and accumulatedRewardsPerShare
    s.claimedRewards.unpaid := s.claimedRewards.unpaid + reward;

    s.accumulatedRewardsPerShare := s.accumulatedRewardsPerShare + ((reward * fixedPointAccuracy) / farmMTokenBalance);

    // Update farm block levels
    s := updateBlock(s);

} with (s)



// helper function to update farm
function updateFarm(const farmMTokenBalance : nat; var s : farmMTokenStorageType) : farmMTokenStorageType is
block{
    s := case s.config.lpToken.tokenBalance = 0n of [
            True -> updateBlock(s)
        |   False -> case s.lastBlockUpdate = Mavryk.get_level() or not s.open of [
                    True -> s
                |   False -> updateFarmParameters(farmMTokenBalance, s)
            ]
    ];
    s := updateDurationAndRewards(s);
} with (s)



// calculate additional rewards
function calculateMTokenAdditionalRewards(const userRewardIndex : nat; const tokenRewardIndex : nat; const userTokenBalance : nat) : nat is
block {

    // tokenRewardIndex is monotonically increasing and should always be greater than user reward index
    if userRewardIndex > tokenRewardIndex then failwith(error_CALCULATION_ERROR) else skip;
    const currentRewardsPerShare : nat = abs(tokenRewardIndex - userRewardIndex);

    // calculate additional rewards
    const additionalRewards : nat = (currentRewardsPerShare * userTokenBalance) / fixedPointAccuracy;

} with additionalRewards



function updateBalanceWithMTokenAccrual(const depositorRecord : depositorRecordType; const latestTokenRewardIndex : nat) : depositorRecordType is
block {

    // Get depositor record variables
    var updatedDepositorRecord : depositorRecordType    := depositorRecord;
    const userBalance       : nat                       = updatedDepositorRecord.balance;
    const userRewardIndex   : nat                       = updatedDepositorRecord.tokenRewardIndex;
    
    if userBalance > 0n then {
        // increment token balance with calculated additional rewards 
        const additionalRewards : nat = calculateMTokenAdditionalRewards(userRewardIndex, latestTokenRewardIndex, userBalance);
        const newUserBalance    : nat = userBalance + additionalRewards;

        // update depositor balance with accrued mToken balance and latest token reward index
        updatedDepositorRecord.balance      := newUserBalance;
    } else skip;

    updatedDepositorRecord.tokenRewardIndex := latestTokenRewardIndex;

} with updatedDepositorRecord


// helper function to update depositor's unclaimed rewards
function updateUnclaimedRewards(const depositorRecord : depositorRecordType; var s : farmMTokenStorageType) : (farmMTokenStorageType * depositorRecordType) is
block{

    // Compute depositor reward
    //  -   calculate user's currentMvkPerShare based on difference between his participationRewardsPerShare and farm's accumulatedRewardsPerShare
    //  -   check that user's participationRewardsPerShare does not exceed farm's accumulatedRewardsPerShare
    //  -   calculate total user's reward based on currentMvkPerShare multiplied by his balance

    var updatedDepositorRecord : depositorRecordType    := depositorRecord;
    const accumulatedRewardsPerShareStart : tokenBalanceType = updatedDepositorRecord.participationRewardsPerShare;
    const accumulatedRewardsPerShareEnd : tokenBalanceType = s.accumulatedRewardsPerShare;
    if accumulatedRewardsPerShareStart > accumulatedRewardsPerShareEnd then failwith(error_CALCULATION_ERROR) else skip;
    const currentMvkPerShare = abs(accumulatedRewardsPerShareEnd - accumulatedRewardsPerShareStart);
    const depositorReward = (currentMvkPerShare * updatedDepositorRecord.balance) / fixedPointAccuracy;

    // Update user's unclaimed rewards and participationRewardsPerShare
    const unclaimedRewards : nat = updatedDepositorRecord.unclaimedRewards;
    updatedDepositorRecord.unclaimedRewards                := unclaimedRewards + depositorReward;
    updatedDepositorRecord.participationRewardsPerShare    := accumulatedRewardsPerShareEnd;

    // Update paid and unpaid rewards in farm storage 
    //  -   check that user's reward does not exceed total unpaid claimed rewards on the farm
    if depositorReward > s.claimedRewards.unpaid then failwith(error_CALCULATION_ERROR) else skip;
    s.claimedRewards := record [
        unpaid = abs(s.claimedRewards.unpaid - depositorReward);
        paid   = s.claimedRewards.paid + depositorReward;
    ];

} with (s, updatedDepositorRecord)

// ------------------------------------------------------------------------------
// Farm Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const farmLambdaAction : farmLambdaActionType; var s : farmMTokenStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(farmUnpackLambdaFunctionType)) of [
            Some(f) -> f((farmLambdaAction, s))
        |   None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Lambda Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Helper Functions End
//
// ------------------------------------------------------------------------------