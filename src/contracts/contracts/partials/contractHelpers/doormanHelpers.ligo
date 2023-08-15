// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Admin, Governance Satellite Contract
function verifySenderIsAdminOrGovernanceSatelliteContract(var s : doormanStorageType) : unit is
block{

    const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[s.admin; governanceSatelliteAddress], error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED)

} with unit



// Allowed Senders: Lending Controller Contract
function verifySenderIsLendingControllerContract(var s : doormanStorageType) : unit is
block{

    const lendingControllerAddress: address = getContractAddressFromGovernanceContract("lendingController", s.governanceAddress, error_LENDING_CONTROLLER_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[lendingControllerAddress], error_ONLY_LENDING_CONTROLLER_CONTRACT_ALLOWED)

} with unit



// helper function to verify all entrypoints are paused
function verifyAllEntrypointsPaused(const s : doormanStorageType) : unit is 
block {
    
    if s.breakGlassConfig.stakeIsPaused and s.breakGlassConfig.unstakeIsPaused and s.breakGlassConfig.compoundIsPaused and s.breakGlassConfig.farmClaimIsPaused then skip
    else failwith(error_ALL_DOORMAN_CONTRACT_ENTRYPOINTS_SHOULD_BE_PAUSED_TO_MIGRATE_FUNDS);

} with unit



// helper function to verify min MVK amount reached
function verifyMinMvkAmountReached(const stakeAmount : nat; const s : doormanStorageType) : unit is 
block {
    
    // verify first value (stakeAmount) is greater than second value (minMvkAmount)
    verifyGreaterThanOrEqual(stakeAmount, s.config.minMvkAmount, error_MIN_MVK_AMOUNT_NOT_REACHED);

} with unit 



// helper function to verify unstake amount is less than user's balance
function verifySufficientWithdrawalBalance(const unstakeAmount : nat; const userStakeBalanceRecord : userStakeBalanceRecordType) : unit is
block {

    // verify first value (unstakeAmount) is less than second value (user balance)
    verifyLessThanOrEqual(unstakeAmount, userStakeBalanceRecord.balance, error_INSUFFICIENT_STAKED_MVK_BALANCE);

} with unit



// helper function to verify unstake amount is less than total staked supply
function verifyUnstakeAmountLessThanStakedTotalSupply(const unstakeAmount : nat; const stakedMvkTotalSupply : nat) : unit is 
block {

    // verify first value (unstakeAmount) is less than second value (staked MVK total supply)
    verifyLessThanOrEqual(unstakeAmount, stakedMvkTotalSupply, error_UNSTAKE_AMOUNT_CANNOT_BE_GREATER_THAN_STAKED_MVK_TOTAL_SUPPLY);

} with unit



// helper function to check farm exists
function checkFarmAddressInFarmFactory(const farmAddress : address; const s : doormanStorageType) : bool is 
block {

    // Get Farm Factory Contract Address from the General Contracts Map on the Governance Contract
    const farmFactoryAddress : address = getContractAddressFromGovernanceContract("farmFactory", s.governanceAddress, error_FARM_FACTORY_CONTRACT_NOT_FOUND);

    // Check if farm address is known to the farmFactory
    const checkFarmExistsView : option (bool) = Tezos.call_view ("checkFarmExists", farmAddress, farmFactoryAddress);
    const checkFarmExists : bool = case checkFarmExistsView of [
            Some (value) -> value
        |   None         -> (failwith (error_CHECK_FARM_EXISTS_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND) : bool)
    ];

} with checkFarmExists



// helper function to verify farm exists
function verifyFarmExists(const farmAddress : address; const s : doormanStorageType) : unit is 
block {

    const checkFarmExists : bool = checkFarmAddressInFarmFactory(farmAddress, s);
    if not checkFarmExists then failwith(error_FARM_CONTRACT_NOT_FOUND) else skip;

} with unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Pause / BreakGlass Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to pause all entrypoints
function pauseAllDoormanEntrypoints(var s : doormanStorageType) : doormanStorageType is 
block {

    // set all pause configs to True
    if s.breakGlassConfig.stakeIsPaused then skip
    else s.breakGlassConfig.stakeIsPaused := True;

    if s.breakGlassConfig.unstakeIsPaused then skip
    else s.breakGlassConfig.unstakeIsPaused := True;

    if s.breakGlassConfig.exitIsPaused then skip
    else s.breakGlassConfig.exitIsPaused := True;

    if s.breakGlassConfig.compoundIsPaused then skip
    else s.breakGlassConfig.compoundIsPaused := True;

    if s.breakGlassConfig.farmClaimIsPaused then skip
    else s.breakGlassConfig.farmClaimIsPaused := True;

    if s.breakGlassConfig.onVaultDepositStakeIsPaused then skip
    else s.breakGlassConfig.onVaultDepositStakeIsPaused := True;

    if s.breakGlassConfig.onVaultWithdrawStakeIsPaused then skip
    else s.breakGlassConfig.onVaultWithdrawStakeIsPaused := True;

    if s.breakGlassConfig.onVaultLiquidateStakeIsPaused then skip
    else s.breakGlassConfig.onVaultLiquidateStakeIsPaused := True;

} with s



// helper function to unpause all entrypoints
function unpauseAllDoormanEntrypoints(var s : doormanStorageType) : doormanStorageType is 
block {

    // set all pause configs to False
    if s.breakGlassConfig.stakeIsPaused then s.breakGlassConfig.stakeIsPaused := False
    else skip;

    if s.breakGlassConfig.unstakeIsPaused then s.breakGlassConfig.unstakeIsPaused := False
    else skip;

    if s.breakGlassConfig.exitIsPaused then s.breakGlassConfig.exitIsPaused := False
    else skip;
    
    if s.breakGlassConfig.compoundIsPaused then s.breakGlassConfig.compoundIsPaused := False
    else skip;
    
    if s.breakGlassConfig.farmClaimIsPaused then s.breakGlassConfig.farmClaimIsPaused := False
    else skip;

    if s.breakGlassConfig.onVaultDepositStakeIsPaused then s.breakGlassConfig.onVaultDepositStakeIsPaused := False
    else skip;

    if s.breakGlassConfig.onVaultWithdrawStakeIsPaused then s.breakGlassConfig.onVaultWithdrawStakeIsPaused := False
    else skip;

    if s.breakGlassConfig.onVaultLiquidateStakeIsPaused then s.breakGlassConfig.onVaultLiquidateStakeIsPaused := False
    else skip;

} with s

// ------------------------------------------------------------------------------
// Pause / BreakGlass Helper Functions End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to %onStakeChange entrypoint in the Delegation Contract
function delegationOnStakeChange(const delegationAddress : address) : contract(onStakeChangeType) is
    case (Tezos.get_entrypoint_opt(
        "%onStakeChange",
        delegationAddress) : option(contract(onStakeChangeType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_ON_STAKE_CHANGE_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(onStakeChangeType))
        ];



// helper function to get transfer entrypoint
function getTransferEntrypointFromTokenAddress(const tokenAddress : address) : contract(fa2TransferType) is
    case (Tezos.get_entrypoint_opt(
        "%transfer",
        tokenAddress) : option(contract(fa2TransferType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_TRANSFER_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND) : contract(fa2TransferType))
        ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Operations Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to create a onStakeChange operation on the delegation contract
function delegationOnStakeChangeOperation(const userAddresses : onStakeChangeType; const s : doormanStorageType) : operation is 
block {

    // Get Delegation Contract Address from the General Contracts Map on the Governance Contract
    const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    // Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
    const delegationOnStakeChangeOperation : operation = Tezos.transaction(
        (userAddresses),
        0tez,
        delegationOnStakeChange(delegationAddress)
    );

} with delegationOnStakeChangeOperation



// helper function to mint MVK and transfer from Treasury
function mintMvkAndTransferOperation(const claimAmount : nat; const s : doormanStorageType) : operation is 
block {

    // Get Farm Treasury Contract Address from the General Contracts Map on the Governance Contract
    const treasuryAddress : address = getContractAddressFromGovernanceContract("farmTreasury", s.governanceAddress, error_FARM_TREASURY_CONTRACT_NOT_FOUND);

    const mintMvkAndTransferParams : mintMvkAndTransferType = record [
        to_  = Tezos.get_self_address();
        amt  = claimAmount;
    ];

    const mintMvkAndTransferOperation : operation = Tezos.transaction(
        mintMvkAndTransferParams, 
        0tez, 
        sendMintMvkAndTransferOperationToTreasury(treasuryAddress)
    );

} with mintMvkAndTransferOperation



// helper function to transfer from Treasury
function transferFromTreasuryOperation(const transferAmount : nat; const s : doormanStorageType) : operation is 
block {

    // Get Farm Treasury Contract Address from the General Contracts Map on the Governance Contract
    const treasuryAddress : address = getContractAddressFromGovernanceContract("farmTreasury", s.governanceAddress, error_FARM_TREASURY_CONTRACT_NOT_FOUND);

    const transferFromTreasuryParams : transferActionType = list [
        record [
            to_   = Tezos.get_self_address();
            token = (Fa2 (record [
                tokenContractAddress  = s.mvkTokenAddress;
                tokenId               = 0n;
            ]) : tokenType);
            amount = transferAmount;
        ]
    ];

    const transferFromTreasuryOperation : operation = Tezos.transaction(
        transferFromTreasuryParams,
        0tez,
        sendTransferOperationToTreasury(treasuryAddress)
    );

} with transferFromTreasuryOperation



// helper function to migrate funds
function migrateFundsOperation(const destinationAddress : address; const s : doormanStorageType) : operation is 
block {

    // Get Doorman MVK balance from MVK Token Contract - equivalent to total staked MVK supply
    const balanceView : option (nat) = Tezos.call_view ("get_balance", (Tezos.get_self_address(), 0n), s.mvkTokenAddress);
    const doormanBalance: nat = case balanceView of [
            Some (value) -> value
        |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
    ];

    // Create a transfer to transfer all funds to an upgraded Doorman Contract
    const transferParameters: fa2TransferType = list[
        record [
            from_= Tezos.get_self_address();
            txs  = list [
                record [
                    to_        = destinationAddress;
                    token_id   = 0n;
                    amount     = doormanBalance;
                ]
            ]
        ]
    ];

    const migrateFundsOperation: operation = Tezos.transaction(
        transferParameters,
        0tez,
        getTransferEntrypointFromTokenAddress(s.mvkTokenAddress)
    );

} with migrateFundsOperation

// ------------------------------------------------------------------------------
// Operations Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get mvk total supply 
function getMvkTotalSupply(const s : doormanStorageType) : nat is 
block {

    const mvkTotalSupplyView : option (nat) = Tezos.call_view ("total_supply", 0n, s.mvkTokenAddress);
    const mvkTotalSupply: nat = case mvkTotalSupplyView of [
            Some (value) -> value
        |   None         -> (failwith (error_GET_TOTAL_SUPPLY_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
    ];

} with mvkTotalSupply 



// helper function to get staked mvk total supply (equivalent to balance of the Doorman contract on the MVK Token contract)
function getStakedMvkTotalSupply(const s : doormanStorageType) : nat is 
block {

    const getBalanceView : option (nat) = Tezos.call_view ("get_balance", (Tezos.get_self_address(), 0n), s.mvkTokenAddress);
    const stakedMvkTotalSupply: nat = case getBalanceView of [
            Some (value) -> value
        |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
    ];

} with stakedMvkTotalSupply 



// helper function to get mvk maximum total supply 
function getMvkMaximumTotalSupply(const s : doormanStorageType) : nat is 
block {

    const getMaximumSupplyView : option (nat) = Tezos.call_view ("getMaximumSupply", unit, s.mvkTokenAddress);
    const mvkMaximumSupply : (nat) = case getMaximumSupplyView of [
            Some (_totalSupply) -> _totalSupply
        |   None                -> (failwith (error_GET_MAXIMUM_SUPPLY_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
    ];

} with mvkMaximumSupply 



// helper function to get or create userStakeBalanceRecord
function getOrCreateUserStakeBalanceRecord(const userAddress : address; const s : doormanStorageType) : userStakeBalanceRecordType is 
block {

    const userStakeBalanceRecord : userStakeBalanceRecordType = case s.userStakeBalanceLedger[userAddress] of [
            Some(_val) -> _val
        |   None -> record[
                balance                        = 0n;
                totalExitFeeRewardsClaimed     = 0n;
                totalSatelliteRewardsClaimed   = 0n;
                totalFarmRewardsClaimed        = 0n;
                participationFeesPerShare      = s.accumulatedFeesPerShare;
            ]
    ];

} with userStakeBalanceRecord



// helper function to get userStakeBalanceRecord
function getUserStakeBalanceRecord(const userAddress : address; const s : doormanStorageType) : userStakeBalanceRecordType is 
block {

    const userStakeBalanceRecord: userStakeBalanceRecordType = case s.userStakeBalanceLedger[userAddress] of [
            Some(_val) -> _val
        |   None       -> failwith(error_USER_STAKE_RECORD_NOT_FOUND)
    ];

} with userStakeBalanceRecord



// helper function to calculate exit fee rewards
function calculateExitFeeRewards(const userStakeBalanceRecord : userStakeBalanceRecordType; const s : doormanStorageType) : nat is
block {

    // Calculate what fees the user missed since his/her last claim
    const currentFeesPerShare : nat = abs(s.accumulatedFeesPerShare - userStakeBalanceRecord.participationFeesPerShare);

    // Calculate the user reward based on his sMVK
    const exitFeeRewards : nat = (currentFeesPerShare * userStakeBalanceRecord.balance) / fixedPointAccuracy;

} with exitFeeRewards 



// helper function to increment accumulated fees per share
function incrementAccumulatedFeesPerShare(const paidFee : nat; const unstakeAmount : nat; const stakedMvkTotalSupply : nat; var s : doormanStorageType) : doormanStorageType is 
block {

    // calculate staked total without unstakeamount
    const stakedTotalWithoutUnstake : nat = abs(stakedMvkTotalSupply - unstakeAmount);

    if stakedTotalWithoutUnstake > 0n then s.accumulatedFeesPerShare := s.accumulatedFeesPerShare + (paidFee / stakedTotalWithoutUnstake)
    else skip;

} with s 



// helper function to calculate exit fee
function calculateExitFee(const s : doormanStorageType) : nat is 
block {

    // get MVK and staked MVK total supply
    const mvkTotalSupply        : nat = getMvkTotalSupply(s);
    const stakedMvkTotalSupply  : nat = getStakedMvkTotalSupply(s);

    // Calculate MVK Loyalty Index
    const mvkLoyaltyIndex : nat = (stakedMvkTotalSupply * 100n * fixedPointAccuracy) / mvkTotalSupply;
    
    // Calculate Exit Fee
    const exitFeeWithoutFloatingPoint : nat = abs((300_000n * fixedPointAccuracy - 5_250n * mvkLoyaltyIndex) * fixedPointAccuracy + (25n * mvkLoyaltyIndex * mvkLoyaltyIndex));
    const exitFee                     : nat = exitFeeWithoutFloatingPoint / (10_000n * fixedPointAccuracy);

} with exitFee



// helper function to check user has satellite rewards (bool)
function checkUserHasSatelliteRewards(const userAddress : address; const s : doormanStorageType) : bool is 
block {

    // Get Delegation Contract address from the General Contracts Map on the Governance Contract
    const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    // Call the %getSatelliteRewardsOpt view on the Delegation Contract
    const satelliteRewardsOptView : option (option(satelliteRewardsType)) = Tezos.call_view ("getSatelliteRewardsOpt", userAddress, delegationAddress);

    // Check if user has any satellite rewards
    const userHasSatelliteRewards : bool = case satelliteRewardsOptView of [
            Some (_optionView) -> case _optionView of [
                    Some(_rewardsRecord)      -> True
                |   None                      -> False
            ]
        |   None      -> failwith (error_GET_SATELLITE_REWARDS_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
    ];

} with userHasSatelliteRewards



// helper function to get user / satellite rewards record
function getUserRewardsRecord(const userAddress : address; const s : doormanStorageType) : satelliteRewardsType is 
block {

    // Get Delegation Contract address from the General Contracts Map on the Governance Contract
    const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    // Call the %getSatelliteRewardsOpt view on the Delegation Contract
    const satelliteRewardsOptView : option (option(satelliteRewardsType)) = Tezos.call_view ("getSatelliteRewardsOpt", userAddress, delegationAddress);

    const satelliteRewardsOpt : option(satelliteRewardsType) = case satelliteRewardsOptView of [
            Some (value) -> value
        |   None         -> failwith (error_GET_SATELLITE_REWARDS_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
    ];

    const userRewardsRecord : satelliteRewardsType = case satelliteRewardsOpt of [
            Some (_record)  -> _record
        |   None            -> failwith (error_SATELLITE_REWARDS_NOT_FOUND)
    ];
        
} with userRewardsRecord

// ------------------------------------------------------------------------------
// Contract Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Compound Helper Functions Begin
// ------------------------------------------------------------------------------

(*  compoundUserRewards helper function *)
function compoundUserRewards(const userAddress : address; var s : doormanStorageType) : doormanStorageType is 
block{ 
    
    // Get the user's stake balance record
    var userStakeBalanceRecord : userStakeBalanceRecordType := getOrCreateUserStakeBalanceRecord(userAddress, s);

    // Check if the user has more than 0 staked MVK. If he/she hasn't, he cannot earn rewards
    if userStakeBalanceRecord.balance > 0n then {

        // Check if user has any satellite rewards
        const userHasSatelliteRewards : bool = checkUserHasSatelliteRewards(userAddress, s);

        // If user has never delegated or registered as a satellite, no reward is calculated
        var satelliteUnpaidRewards : nat := 0n;
        if userHasSatelliteRewards then
        block{

            // get user satellite rewards record
            const userRewardsRecord : satelliteRewardsType = getUserRewardsRecord(userAddress, s);

            // get satellite reference rewards record
            const satelliteReferenceAddress : address = userRewardsRecord.satelliteReferenceAddress;
            const satelliteReferenceRewardsRecord : satelliteRewardsType = getUserRewardsRecord(satelliteReferenceAddress, s);

            // calculate increment rewards based on difference between satellite's accumulated rewards per share and user's participations rewards per share
            const rewardsRatio      : nat = abs(satelliteReferenceRewardsRecord.satelliteAccumulatedRewardsPerShare - userRewardsRecord.participationRewardsPerShare);
            const incrementRewards  : nat = userStakeBalanceRecord.balance * rewardsRatio;

            // update user's unpaid rewards
            satelliteUnpaidRewards := userRewardsRecord.unpaid + (incrementRewards / fixedPointAccuracy);
            
        }
        else skip;

        // -- Exit fee rewards -- //

        // Calculate user rewards
        const exitFeeRewards : nat = calculateExitFeeRewards(userStakeBalanceRecord, s);

        // Update the user balance
        userStakeBalanceRecord.totalExitFeeRewardsClaimed    := userStakeBalanceRecord.totalExitFeeRewardsClaimed + exitFeeRewards;
        userStakeBalanceRecord.totalSatelliteRewardsClaimed  := userStakeBalanceRecord.totalSatelliteRewardsClaimed + satelliteUnpaidRewards;
        userStakeBalanceRecord.balance                       := userStakeBalanceRecord.balance + exitFeeRewards + satelliteUnpaidRewards;
        s.unclaimedRewards                                   := abs(s.unclaimedRewards - exitFeeRewards);

    }
    else skip;

    // Set the user's participationFeesPerShare to the current accumulatedFeesPerShare
    userStakeBalanceRecord.participationFeesPerShare  := s.accumulatedFeesPerShare;
    
    // Update storage: user stake balance ledger
    s.userStakeBalanceLedger[userAddress]  := userStakeBalanceRecord;

} with (s)

// ------------------------------------------------------------------------------
// Compound Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const doormanLambdaAction : doormanLambdaActionType; var s : doormanStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(doormanUnpackLambdaFunctionType)) of [
            Some(f) -> f(doormanLambdaAction, s)
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