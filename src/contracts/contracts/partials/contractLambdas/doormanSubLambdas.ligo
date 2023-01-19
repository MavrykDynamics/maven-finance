
// ------------------------------------------------------------------------------
//
// Doorman Sub Lambdas Begin
//
// ------------------------------------------------------------------------------

function _setAdmin(const newAdminAddress : address; var s : doormanStorageType) : return is
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    s.admin := newAdminAddress;

} with (noOperations, s)



function _setGovernance(const newGovernanceAddress : address; var s : doormanStorageType) : return is
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);
    
    s.governanceAddress := newGovernanceAddress;

} with (noOperations, s)



function _updateMetadata(const updateMetadataParams : updateMetadataType; var s : doormanStorageType) : return is
block {

    // verify that sender is admin (i.e. Governance Proxy Contract address)
    verifySenderIsAdmin(s.admin); 

    const metadataKey   : string = updateMetadataParams.metadataKey;
    const metadataHash  : bytes  = updateMetadataParams.metadataHash;
    
    s.metadata[metadataKey] := metadataHash;

} with (noOperations, s)



function _updateConfig(const updateConfigParams : doormanUpdateConfigParamsType; var s : doormanStorageType) : return is
block {

    // verify that sender is admin (i.e. Governance Proxy Contract address)
    verifySenderIsAdmin(s.admin); 

    const updateConfigAction    : doormanUpdateConfigActionType   = updateConfigParams.updateConfigAction;
    const updateConfigNewValue  : doormanUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

    case updateConfigAction of [
        |   ConfigMinMvkAmount (_v)  -> s.config.minMvkAmount         := updateConfigNewValue
        |   Empty (_v)               -> skip
    ];

} with (noOperations, s)



function _updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : doormanStorageType) : return is
block {

    // verify that sender is admin
    verifySenderIsAdmin(s.admin); 

    s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);

} with (noOperations, s)



function _updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : doormanStorageType) : return is
block {

    // verify that sender is admin
    verifySenderIsAdmin(s.admin); 

    s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);

} with (noOperations, s)



function _mistakenTransfer(const destinationParams : transferActionType; var s : doormanStorageType) : return is
block {

    var operations : list(operation) := nil;

    // Verify that the sender is admin or the Governance Satellite Contract
    verifySenderIsAdminOrGovernanceSatelliteContract(s);

    // Get MVK Token address
    const mvkTokenAddress : address  = s.mvkTokenAddress;

    // verify token is allowed to be transferred
    verifyTokenAllowedForOperationFold(mvkTokenAddress, destinationParams, error_CANNOT_TRANSFER_MVK_TOKEN_USING_MISTAKEN_TRANSFER);

    // Create transfer operations (transferOperationFold in transferHelpers)
    operations := List.fold_right(transferOperationFold, destinationParams, operations)

} with (operations, s)



function _migrateFunds(const destinationAddress : address; var s : doormanStorageType) : return is
block {

    verifyNoAmountSent(Unit);     // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin); // check that sender is admin 

    // Verify that all entrypoints are paused
    verifyAllEntrypointsPaused(s);

    var operations : list(operation) := nil;

    // Migrate funds operation to transfer all funds to an upgraded Doorman Contract
    const migrateFundsOperation : operation = migrateFundsOperation(destinationAddress, s);
    operations := migrateFundsOperation # operations;

} with (operations, s)



function _pauseAll(const _parameters : unit; var s : doormanStorageType) : return is
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    // set all pause configs to True
    s := pauseAllDoormanEntrypoints(s);

} with (noOperations, s)



function _unpauseAll(const _parameters : unit; var s : doormanStorageType) : return is
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    // set all pause configs to False
    s := unpauseAllDoormanEntrypoints(s);

} with (noOperations, s)



function _togglePauseEntrypoint(const params : doormanTogglePauseEntrypointType; var s : doormanStorageType) : return is
block {

    verifyNoAmountSent(Unit);     // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin); // check that sender is admin 

    case params.targetEntrypoint of [
            Stake (_v)                  -> s.breakGlassConfig.stakeIsPaused       := _v
        |   Unstake (_v)                -> s.breakGlassConfig.unstakeIsPaused     := _v
        |   Compound (_v)               -> s.breakGlassConfig.compoundIsPaused    := _v
        |   FarmClaim (_v)              -> s.breakGlassConfig.farmClaimIsPaused   := _v

            // Vault Entrypoints
        |   OnVaultDepositStake (_v)    -> s.breakGlassConfig.onVaultDepositStakeIsPaused    := _v
        |   OnVaultWithdrawStake (_v)   -> s.breakGlassConfig.onVaultWithdrawStakeIsPaused   := _v
        |   OnVaultLiquidateStake (_v)  -> s.breakGlassConfig.onVaultLiquidateStakeIsPaused  := _v
    ]
     
} with (noOperations, s)



function _stake(const stakeAmount : nat; var s : doormanStorageType) : return is
block {

    verifyEntrypointIsNotPaused(s.breakGlassConfig.stakeIsPaused, error_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    // Get params - userAddress
    const userAddress : address = Tezos.get_sender();
        
    // Compound user rewards
    s := compoundUserRewards(userAddress, s);

    // Verify that user is staking at least the min amount of MVK tokens required - note: amount should be converted on frontend to 10^9 decimals
    verifyMinMvkAmountReached(stakeAmount, s);

    // -------------------------------------------
    // Transfer MVK from user to the Doorman Contract
    // -------------------------------------------

    const transferOperation : operation = transferFa2Token(
        userAddress,                // from_
        Tezos.get_self_address(),   // to_
        stakeAmount,                // amount
        0n,                         // tokenId
        s.mvkTokenAddress           // tokenContractAddress
    );

    // -------------------------------------------
    // Update Delegation contract since user staked MVK balance has changed
    // -------------------------------------------

    // Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
    const delegationOnStakeChangeOperation : operation = delegationOnStakeChangeOperation(userAddress, s);                                
    operations := list [transferOperation; delegationOnStakeChangeOperation];

    // -------------------------------------------
    // Update Storage
    // -------------------------------------------

    var userStakeBalanceRecord : userStakeBalanceRecordType := getOrCreateUserStakeBalanceRecord(userAddress, s);
    userStakeBalanceRecord.balance  := userStakeBalanceRecord.balance + stakeAmount; 

    s.userStakeBalanceLedger[userAddress] := userStakeBalanceRecord;

} with (operations, s)



function _unstake(const unstakeAmount : nat; var s : doormanStorageType) : return is
block {

    verifyEntrypointIsNotPaused(s.breakGlassConfig.unstakeIsPaused, error_UNSTAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    // Get params - userAddress
    const userAddress : address = Tezos.get_sender();
    
    // Verify that user is unstaking at least the min amount of MVK tokens required - note: amount should be converted on frontend to 10^9 decimals
    verifyMinMvkAmountReached(unstakeAmount, s);

    // Compound user rewards
    s := compoundUserRewards(userAddress, s);

    // -------------------------------------------
    // Compute MLI (MVK Loyalty Index) and Exit Fee 
    // -------------------------------------------

    // Calculate Exit Fee
    const exitFee : nat = calculateExitFee(s);        

    // Calculate final unstake amount and increment unclaimed rewards
    const paidFee             : nat  = unstakeAmount * (exitFee / 100n);
    const finalUnstakeAmount  : nat  = abs(unstakeAmount - (paidFee / fixedPointAccuracy));
    s.unclaimedRewards               := s.unclaimedRewards + (paidFee / fixedPointAccuracy);

    // Verify unstake amount is less than staked total supply
    const stakedMvkTotalSupply : nat = getStakedMvkTotalSupply(s);
    verifyUnstakeAmountLessThanStakedTotalSupply(unstakeAmount, stakedMvkTotalSupply);

    // Update accumulated fees per share 
    s := incrementAccumulatedFeesPerShare(
        paidFee,
        unstakeAmount,
        stakedMvkTotalSupply,
        s 
    );

    // Get user's stake balance record
    var userStakeBalanceRecord : userStakeBalanceRecordType := getUserStakeBalanceRecord(userAddress, s);
    
    // Verify that unstake amount is not greater than user's staked MVK balance
    verifySufficientWithdrawalBalance(unstakeAmount, userStakeBalanceRecord);

    // Update user's stake balance record
    userStakeBalanceRecord.balance := abs(userStakeBalanceRecord.balance - unstakeAmount); 

    // -------------------------------------------
    // Transfer MVK Operation
    // -------------------------------------------

    const transferOperation : operation = transferFa2Token(
        Tezos.get_self_address(),   // from_
        userAddress,                // to_
        finalUnstakeAmount,         // amount
        0n,                         // tokenId
        s.mvkTokenAddress           // tokenContractAddress
    );

    // -------------------------------------------
    // Compound Exit Fee and Update Participation Fees Per Share
    // -------------------------------------------

    // Compound only the exit fee rewards
    // Check if the user has more than 0 MVK staked. If he/she hasn't, he cannot earn rewards
    if userStakeBalanceRecord.balance > 0n then {

        // Calculate user rewards
        const exitFeeRewards : nat = calculateExitFeeRewards(userStakeBalanceRecord, s);

        // Increase the user balance with exit fee rewards
        userStakeBalanceRecord.balance := userStakeBalanceRecord.balance + exitFeeRewards;

        // Update storage unclaimed rewards (decrement by exit fee rewards given to user)
        s.unclaimedRewards := abs(s.unclaimedRewards - exitFeeRewards);

    }
    else skip;
    
    // Set the user's new participationFeesPerShare to storage's accumulatedFeesPerShare
    userStakeBalanceRecord.participationFeesPerShare := s.accumulatedFeesPerShare;

    // Update user's stake balance record in storage
    s.userStakeBalanceLedger[userAddress] := userStakeBalanceRecord;

    // -------------------------------------------
    // Update Delegation contract since user staked MVK balance has changed
    // -------------------------------------------

    // Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
    const delegationOnStakeChangeOperation : operation = delegationOnStakeChangeOperation(userAddress, s);

    // Execute operations list
    operations := list[transferOperation; delegationOnStakeChangeOperation]

} with (operations, s)



function _compound(const userAddress : address; var s : doormanStorageType) : return is
block {

    verifyEntrypointIsNotPaused(s.breakGlassConfig.compoundIsPaused, error_COMPOUND_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    // Compound rewards
    s := compoundUserRewards(userAddress, s);

    // Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
    const delegationOnStakeChangeOperation : operation = delegationOnStakeChangeOperation(userAddress, s);
    operations := list [delegationOnStakeChangeOperation];

} with (operations, s)



function _farmClaim(const farmClaim : farmClaimType; var s : doormanStorageType) : return is
block {

    verifyEntrypointIsNotPaused(s.breakGlassConfig.farmClaimIsPaused, error_FARM_CLAIM_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    // Init parameter values from input
    const delegator      : address   = farmClaim.0;
    var claimAmount      : nat      := farmClaim.1;
    var transferAmount   : nat      := 0n;
    const forceTransfer  : bool      = farmClaim.2;

    // Get farm address
    const farmAddress : address = Tezos.get_sender();

    // ------------------------------------------------------------------
    // Validation Checks
    // ------------------------------------------------------------------

    // Verify farm exists (i.e. farm address is known to the farmFactory)
    verifyFarmExists(farmAddress, s);

    // ------------------------------------------------------------------
    // Compound and update user's staked balance record
    // ------------------------------------------------------------------

    // Compound user rewards
    s := compoundUserRewards(delegator, s);

    // Get user's staked balance record
    var userStakeBalanceRecord : userStakeBalanceRecordType := getOrCreateUserStakeBalanceRecord(delegator, s);

    // Update user's stake balance record
    userStakeBalanceRecord.balance                 := userStakeBalanceRecord.balance + claimAmount; 
    userStakeBalanceRecord.totalFarmRewardsClaimed := userStakeBalanceRecord.totalFarmRewardsClaimed + claimAmount;
    s.userStakeBalanceLedger[delegator] := userStakeBalanceRecord;

    // ------------------------------------------------------------------
    // Check if MVK Tokens should be minted or transferred from Treasury
    // ------------------------------------------------------------------

    // Check if MVK Force Transfer is enabled (no minting new MVK Tokens)
    if forceTransfer then {

        transferAmount   := claimAmount;
        claimAmount      := 0n;

    }
    else {

        // get MVK Total Supply, and MVK Maximum Total Supply
        const mvkTotalSupply    : nat = getMvkTotalSupply(s);
        const mvkMaximumSupply  : nat = getMvkMaximumTotalSupply(s);

        // Check if the desired minted amount will surpass the maximum total supply
        const tempTotalSupply : nat = mvkTotalSupply + claimAmount;
        if tempTotalSupply > mvkMaximumSupply then {
            
            transferAmount   := abs(tempTotalSupply - mvkMaximumSupply);
            claimAmount      := abs(claimAmount - transferAmount);

        } else skip;

    };

    // Mint MVK Tokens if claimAmount is greater than 0
    if claimAmount > 0n then {

        const mintMvkAndTransferOperation : operation = mintMvkAndTransferOperation(claimAmount, s);
        operations := mintMvkAndTransferOperation # operations;

    } else skip;

    // Transfer MVK Tokens from treasury if transferredToken is greater than 0
    if transferAmount > 0n then {
        
        const transferFromTreasuryOperation : operation = transferFromTreasuryOperation(transferAmount, s);
        operations := transferFromTreasuryOperation # operations;

    } else skip;

    // -------------------------------------------
    // Update Delegation contract since user staked MVK balance has changed
    // -------------------------------------------
    
    // Trigger on stake change for user on the Delegation Contract (e.g. if the user is a satellite or delegated to one)
    const delegationOnStakeChangeOperation : operation = delegationOnStakeChangeOperation(delegator, s);
    operations := delegationOnStakeChangeOperation # operations;

} with (operations, s)



function _onVaultDepositStake(const onVaultDepositStakeParams : onVaultDepositStakeType; var s : doormanStorageType) : return is
block {

    verifyEntrypointIsNotPaused(s.breakGlassConfig.onVaultDepositStakeIsPaused, error_ON_VAULT_DEPOSIT_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    // verify sender is Lending Controller 
    verifySenderIsLendingControllerContract(s);

    // init parameters
    const vaultOwner     : address  = onVaultDepositStakeParams.vaultOwner;
    const vaultAddress   : address  = onVaultDepositStakeParams.vaultAddress;
    const depositAmount  : nat      = onVaultDepositStakeParams.depositAmount;
    
    // Get Delegation Address from the General Contracts map on the Governance Contract
    const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    // Compound rewards for user and vault before any changes in balance takes place
    s := compoundUserRewards(vaultOwner, s);
    s := compoundUserRewards(vaultAddress, s);

    // check that user (vault owner) has a record in stake balance ledger and sufficient balance
    var userBalanceInStakeBalanceLedger : userStakeBalanceRecordType := case s.userStakeBalanceLedger[vaultOwner] of [
            Some(_v) -> _v
        |   None     -> failwith(error_USER_STAKE_RECORD_NOT_FOUND)
    ];

    // calculate new user staked balance
    const userStakedBalance : nat = userBalanceInStakeBalanceLedger.balance; 
    if depositAmount > userStakedBalance then failwith(error_NOT_ENOUGH_SMVK_BALANCE) else skip;
    const newUserStakedBalance : nat = abs(userStakedBalance - depositAmount);

    // find or create vault record in stake balance ledger
    var vaultStakeBalanceRecord : userStakeBalanceRecordType := case s.userStakeBalanceLedger[vaultAddress] of [
            Some(_val) -> _val
        |   None -> record[
                balance                        = 0n;
                totalExitFeeRewardsClaimed     = 0n;
                totalSatelliteRewardsClaimed   = 0n;
                totalFarmRewardsClaimed        = 0n;
                participationFeesPerShare      = s.accumulatedFeesPerShare;
            ]
    ];

    // update vault stake balance in stake balance ledger
    vaultStakeBalanceRecord.balance           := vaultStakeBalanceRecord.balance + depositAmount; 
    s.userStakeBalanceLedger[vaultAddress]    := vaultStakeBalanceRecord;

    // update user stake balance in stake balance ledger
    userBalanceInStakeBalanceLedger.balance   := newUserStakedBalance;
    s.userStakeBalanceLedger[vaultOwner]      := userBalanceInStakeBalanceLedger;

    // update satellite balance if user/vault is delegated to a satellite
    const ownerOnStakeChangeOperation : operation = Tezos.transaction((vaultOwner)  , 0tez, delegationOnStakeChange(delegationAddress));
    const vaultOnStakeChangeOperation : operation = Tezos.transaction((vaultAddress), 0tez, delegationOnStakeChange(delegationAddress));

    operations  := list [ownerOnStakeChangeOperation; vaultOnStakeChangeOperation];

} with (operations, s)



function _onVaultWithdrawStake(const onVaultWithdrawStakeParams : onVaultWithdrawStakeType; var s : doormanStorageType) : return is
block {

    verifyEntrypointIsNotPaused(s.breakGlassConfig.onVaultWithdrawStakeIsPaused, error_ON_VAULT_WITHDRAW_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    // verify sender is Lending Controller 
    verifySenderIsLendingControllerContract(s);

    // init parameters
    const vaultOwner      : address = onVaultWithdrawStakeParams.vaultOwner;
    const vaultAddress    : address = onVaultWithdrawStakeParams.vaultAddress;
    const withdrawAmount  : nat     = onVaultWithdrawStakeParams.withdrawAmount;

    // Get Delegation Address from the General Contracts map on the Governance Contract
    const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    // Compound rewards for user and vault before any changes in balance takes place
    s := compoundUserRewards(vaultOwner, s);
    s := compoundUserRewards(vaultAddress, s);

    // check that user (vault owner) has a record in stake balance ledger and sufficient balance
    var userBalanceInStakeBalanceLedger : userStakeBalanceRecordType := case s.userStakeBalanceLedger[vaultOwner] of [
            Some(_record) -> _record
        |   None          -> failwith(error_USER_STAKE_RECORD_NOT_FOUND)
    ];

    // find vault record in stake balance ledger
    var vaultStakeBalanceRecord : userStakeBalanceRecordType := case s.userStakeBalanceLedger[vaultAddress] of [
            Some(_record) -> _record
        |   None          -> failwith(error_USER_STAKE_RECORD_NOT_FOUND)
    ];

    // calculate new vault staked balance (check if vault has enough staked MVK to be withdrawn)
    const vaultStakedBalance : nat = vaultStakeBalanceRecord.balance; 
    if withdrawAmount > vaultStakedBalance then failwith(error_NOT_ENOUGH_SMVK_BALANCE) else skip;
    const newVaultStakedBalance : nat = abs(vaultStakedBalance - withdrawAmount);

    // update vault stake balance in stake balance ledger
    vaultStakeBalanceRecord.balance           := newVaultStakedBalance; 
    s.userStakeBalanceLedger[vaultAddress]    := vaultStakeBalanceRecord;

    // update user stake balance in stake balance ledger
    userBalanceInStakeBalanceLedger.balance   := userBalanceInStakeBalanceLedger.balance + withdrawAmount;
    s.userStakeBalanceLedger[vaultOwner]      := userBalanceInStakeBalanceLedger;

    // update satellite balance if user/vault is delegated to a satellite
    const ownerOnStakeChangeOperation : operation = Tezos.transaction((vaultOwner)  , 0tez, delegationOnStakeChange(delegationAddress));
    const vaultOnStakeChangeOperation : operation = Tezos.transaction((vaultAddress), 0tez, delegationOnStakeChange(delegationAddress));

    operations  := list [ownerOnStakeChangeOperation; vaultOnStakeChangeOperation]

} with (operations, s)



function _onVaultLiquidateStake(const onVaultLiquidateStakeParams : onVaultLiquidateStakeType; var s : doormanStorageType) : return is
block {

    verifyEntrypointIsNotPaused(s.breakGlassConfig.onVaultLiquidateStakeIsPaused, error_ON_VAULT_LIQUIDATE_STAKE_ENTRYPOINT_IN_DOORMAN_CONTRACT_PAUSED);

    var operations : list(operation) := nil;

    // verify sender is Lending Controller 
    verifySenderIsLendingControllerContract(s);

    // init parameters
    const vaultAddress      : address  = onVaultLiquidateStakeParams.vaultAddress;
    const liquidator        : address  = onVaultLiquidateStakeParams.liquidator;
    const liquidatedAmount  : nat      = onVaultLiquidateStakeParams.liquidatedAmount;

    // Get Delegation Address from the General Contracts map on the Governance Contract
    const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    // Compound rewards for liquidator, and vault before any changes in balance takes place
    s := compoundUserRewards(liquidator, s);
    s := compoundUserRewards(vaultAddress, s);

    // find vault record in stake balance ledger
    var vaultStakeBalanceRecord : userStakeBalanceRecordType := case s.userStakeBalanceLedger[vaultAddress] of [
            Some(_val)  -> _val
        |   None        -> failwith(error_VAULT_STAKE_RECORD_NOT_FOUND)
    ];

    // find or create liquidator record in stake balance ledger 
    var liquidatorStakeBalanceRecord : userStakeBalanceRecordType := case s.userStakeBalanceLedger[liquidator] of [
            Some(_v) -> _v
        |   None -> record[
                balance                        = 0n;
                totalExitFeeRewardsClaimed     = 0n;
                totalSatelliteRewardsClaimed   = 0n;
                totalFarmRewardsClaimed        = 0n;
                participationFeesPerShare      = s.accumulatedFeesPerShare;
            ]
    ];

    // calculate new vault staked balance (check if vault has enough staked MVK to be liquidated)
    const vaultStakedBalance : nat = vaultStakeBalanceRecord.balance; 
    if liquidatedAmount > vaultStakedBalance then failwith(error_NOT_ENOUGH_SMVK_BALANCE) else skip;
    const newVaultStakedBalance : nat = abs(vaultStakedBalance - liquidatedAmount);

    // update vault stake balance in stake balance ledger
    vaultStakeBalanceRecord.balance           := newVaultStakedBalance; 
    s.userStakeBalanceLedger[vaultAddress]    := vaultStakeBalanceRecord;

    // update liquidator stake balance in stake balance ledger
    liquidatorStakeBalanceRecord.balance      := liquidatorStakeBalanceRecord.balance + liquidatedAmount;
    s.userStakeBalanceLedger[liquidator]      := liquidatorStakeBalanceRecord;

    // update satellite balance if user/vault is delegated to a satellite
    const liquidatorOnStakeChangeOperation    : operation = Tezos.transaction((liquidator)  , 0tez, delegationOnStakeChange(delegationAddress));
    const vaultOnStakeChangeOperation         : operation = Tezos.transaction((vaultAddress), 0tez, delegationOnStakeChange(delegationAddress));

    operations  := list [liquidatorOnStakeChangeOperation; vaultOnStakeChangeOperation];

} with (operations, s)