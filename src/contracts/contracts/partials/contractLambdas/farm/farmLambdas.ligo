// ------------------------------------------------------------------------------
//
// Farm Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block {

    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address 
    
    case farmLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];
    
} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block {
    
    checkSenderIsAllowed(s); // check that sender is admin or the Governance Contract address

    case farmLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* settName lambda - update the contract name *)
function lambdaSetName(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block {

    // Steps Overview:
    // 1. Check if sender is admin
    // 2. Get Farm Factory Contract address from the General Contracts Map on the Governance Contract
    // 3. Get the Farm Factory Contract Config
    // 4. Get the nameMaxLength parameter from the Farm Factory Contract Config
    // 5. Validate input (name does not exceed max length) and update the Farm Contract name

    checkSenderIsAdmin(s); // check that sender is admin (i.e. Governance Proxy Contract address)
    
    case farmLambdaAction of [
        |   LambdaSetName(updatedName) -> {

                // Get Farm Factory Contract address from the General Contracts Map on the Governance Contract
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "farmFactory", s.governanceAddress);
                const farmFactoryAddress : address = case generalContractsOptView of [
                        Some (_optionContract) -> case _optionContract of [
                                Some (_contract)    -> _contract
                            |   None                -> failwith (error_FARM_FACTORY_CONTRACT_NOT_FOUND)
                        ]
                    |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get the Farm Factory Contract Config
                const configView : option (farmFactoryConfigType) = Tezos.call_view ("getConfig", unit, farmFactoryAddress);
                const farmFactoryConfig: farmFactoryConfigType = case configView of [
                        Some (_config) -> _config
                    |   None -> failwith (error_GET_CONFIG_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND)
                ];

                // Get the farmNameMaxLength parameter from the Farm Factory Contract Config
                const farmNameMaxLength: nat    = farmFactoryConfig.farmNameMaxLength;

                // Validate input (name does not exceed max length) and update the Farm Contract name
                if String.length(updatedName) > farmNameMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else s.name  := updatedName;
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case farmLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateConfig lambda *)
function lambdaUpdateConfig(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is 
block {

  checkSenderIsAdmin(s); // check that sender is admin
  
  case farmLambdaAction of [
        |   LambdaUpdateConfig(updateConfigParams) -> {
                
                const updateConfigAction    : farmUpdateConfigActionType   = updateConfigParams.updateConfigAction;
                const updateConfigNewValue  : farmUpdateConfigNewValueType = updateConfigParams.updateConfigNewValue;

                case updateConfigAction of [
                    ConfigForceRewardFromTransfer (_v)  -> block {
                        
                        // Check that config's new value can only be 1n or 0n
                        if updateConfigNewValue =/= 1n and updateConfigNewValue =/= 0n then failwith(error_CONFIG_VALUE_ERROR) else skip;
                        s.config.forceRewardFromTransfer := updateConfigNewValue = 1n;

                    }
                |   ConfigRewardPerBlock (_v)          -> block {
                        
                        // Check if Farm has been initiated
                        checkFarmIsInit(s);

                        // Update Farm storage
                        s := updateFarm(s);

                        // Check that currentRewardPerBlock does not exceed new reward per block
                        const currentRewardPerBlock : nat = s.config.plannedRewards.currentRewardPerBlock;
                        if currentRewardPerBlock > updateConfigNewValue then failwith(error_CONFIG_VALUE_ERROR) else skip;

                        // Calculate new total rewards
                        const totalClaimedRewards : nat = s.claimedRewards.unpaid + s.claimedRewards.paid;
                        const remainingBlocks : nat = abs((s.initBlock + s.config.plannedRewards.totalBlocks) - s.lastBlockUpdate);
                        const newTotalRewards : nat = totalClaimedRewards + remainingBlocks * updateConfigNewValue;

                        // Update farm storage
                        s.config.plannedRewards.currentRewardPerBlock := updateConfigNewValue;
                        s.config.plannedRewards.totalRewards := newTotalRewards;
                    }
                ];

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block {
    
    checkSenderIsAdmin(s); // check that sender is admin
    
    case farmLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block {

    checkSenderIsAdmin(s); // check that sender is admin
    
    case farmLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  mistaken lambda *)
function lambdaMistakenTransfer(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Create and execute transfer operations based on the params sent


    var operations : list(operation) := nil;

    case farmLambdaAction of [
        |   LambdaMistakenTransfer(destinationParams) -> {

                // Check that sender is admin or the Governance Satellite Contract
                checkSenderIsAdminOrGovernanceSatelliteContract(s);

                // Get LP Token address
                const lpTokenAddress : address  = s.config.lpToken.tokenAddress;

                // Create transfer operations
                function transferOperationFold(const transferParam : transferDestinationType; const operationList : list(operation)) : list(operation) is
                  block{
                    // Check that token is not Farm's LP Token before creating the transfer operation
                    const transferTokenOperation : operation = case transferParam.token of [
                        |   Tez         -> transferTez((Tezos.get_contract_with_error(transferParam.to_, "Error. Contract not found at given address") : contract(unit)), transferParam.amount * 1mutez)
                        |   Fa12(token) -> if token = lpTokenAddress then failwith(error_CANNOT_TRANSFER_LP_TOKEN_USING_MISTAKEN_TRANSFER) else transferFa12Token(Tezos.get_self_address(), transferParam.to_, transferParam.amount, token)
                        |   Fa2(token)  -> if token.tokenContractAddress = lpTokenAddress then failwith(error_CANNOT_TRANSFER_LP_TOKEN_USING_MISTAKEN_TRANSFER) else transferFa2Token(Tezos.get_self_address(), transferParam.to_, transferParam.amount, token.tokenId, token.tokenContractAddress)
                    ];
                  } with(transferTokenOperation # operationList);
                
                operations  := List.fold_right(transferOperationFold, destinationParams, operations)
                
            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Farm Admin Lambdas End
// ------------------------------------------------------------------------------



(* initFarm lambda *)
function lambdaInitFarm(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block{

    // Steps Overview:
    // 1. Check that sender is admin
    // 2. Check if farm is already open
    // 3. Check that blocks per minute is greater than 0
    // 4. Check whether the farm is infinite or if its total blocks has been set
    // 5. Update Farm Storage and init Farm


    checkSenderIsAdmin(s); // check that sender is admin

    case farmLambdaAction of [
        |   LambdaInitFarm(initFarmParams) -> {
                
                // Check if farm is already open
                if s.open or s.init then failwith(error_FARM_ALREADY_OPEN) else skip;

                // Check whether the farm is infinite or if its total blocks has been set
                if not initFarmParams.infinite and initFarmParams.totalBlocks = 0n then failwith(error_FARM_SHOULD_BE_INFINITE_OR_HAVE_A_DURATION) else skip;
                
                // Update Farm Storage and init Farm
                s                                               := updateFarm(s);
                s.initBlock                                     := Tezos.get_level();
                s.config.infinite                               := initFarmParams.infinite;
                s.config.forceRewardFromTransfer                := initFarmParams.forceRewardFromTransfer;
                s.config.plannedRewards.currentRewardPerBlock   := initFarmParams.currentRewardPerBlock;
                s.config.plannedRewards.totalBlocks             := initFarmParams.totalBlocks;
                s.config.plannedRewards.totalRewards            := s.config.plannedRewards.currentRewardPerBlock * s.config.plannedRewards.totalBlocks;
                s.minBlockTimeSnapshot                          := 15n;
                s.open                                          := True ;
                s.init                                          := True ;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* closeFarm lambda *)
function lambdaCloseFarm(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block{
    
    // Steps Overview:
    // 1. Check that sender is admin
    // 2. Check that farm is open
    // 3. Update and close farm


    checkSenderIsAdmin(s);  // check that sender is admin
    checkFarmIsOpen(s);     // check that farm is open

    case farmLambdaAction of [
        |   LambdaCloseFarm(_parameters) -> {
                
                s := updateFarm(s);
                s.open := False ;
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Farm Admin Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas Begin
// ------------------------------------------------------------------------------

(*  pauseAll lambda *)
function lambdaPauseAll(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin, Governance Contract address or Treasury Factory Contract address
    // 2. Pause all main entrypoints in the Farm Contract
    

    // check that sender is admin, Governance Contract address or Treasury Factory Contract address
    checkSenderIsGovernanceOrFactory(s);

    case farmLambdaAction of [
        |   LambdaPauseAll(_parameters) -> {
                
                // set all pause configs to True
                if s.breakGlassConfig.depositIsPaused then skip
                else s.breakGlassConfig.depositIsPaused := True;

                if s.breakGlassConfig.withdrawIsPaused then skip
                else s.breakGlassConfig.withdrawIsPaused := True;

                if s.breakGlassConfig.claimIsPaused then skip
                else s.breakGlassConfig.claimIsPaused := True;

            }
        |   _ -> skip
    ];
    
} with (noOperations, s)



(*  unpauseAll lambda *)
function lambdaUnpauseAll(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin, Governance Contract address or Treasury Factory Contract address
    // 2. Unpause all main entrypoints in the Farm Contract


    // check that sender is admin, Governance Contract address or Treasury Factory Contract address
    checkSenderIsGovernanceOrFactory(s);

    case farmLambdaAction of [
        |   LambdaUnpauseAll(_parameters) -> {
                
                // set all pause configs to False
                if s.breakGlassConfig.depositIsPaused then s.breakGlassConfig.depositIsPaused := False
                else skip;

                if s.breakGlassConfig.withdrawIsPaused then s.breakGlassConfig.withdrawIsPaused := False
                else skip;

                if s.breakGlassConfig.claimIsPaused then s.breakGlassConfig.claimIsPaused := False
                else skip;

            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin
    // 2. Pause or unpause specified entrypoint


    checkSenderIsAdmin(s); // check that sender is admin

    case farmLambdaAction of [
        |   LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [
                        Deposit (_v)       -> s.breakGlassConfig.depositIsPaused    := _v
                    |   Withdraw (_v)      -> s.breakGlassConfig.withdrawIsPaused   := _v
                    |   Claim (_v)         -> s.breakGlassConfig.claimIsPaused      := _v
                ]
                
            }
        |   _ -> skip
    ];

} with (noOperations, s)



// ------------------------------------------------------------------------------
// Pause / Break Glass Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Farm Lambdas Begin
// ------------------------------------------------------------------------------

(* deposit lambda *)
function lambdaDeposit(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block{

    // Steps Overview:    
    // 1. Check that %deposit entrypoint is not paused (e.g. glass broken)
    // 2. Check if farm has started
    // 3. Update farm pool 
    // 4. Check if farm is closed 
    // 5. Check if sender is an existing depositor
    // 6. If sender is an existing depositor, update user's unclaimed rewards and update deposit record
    // 7. Update depositor token balance and depositor ledger
    // 8. Transfer LP tokens from sender to farm balance in LP Contract (use Allowances)


    // Check that %deposit entrypoint is not paused (e.g. glass broken)
    checkDepositIsNotPaused(s);

    // Check if farm has started
    checkFarmIsInit(s);

    var operations : list(operation) := nil;

    case farmLambdaAction of [
        |   LambdaDeposit(tokenAmount) -> {
                
                // Update pool farmStorageType
                s := updateFarm(s);

                // Check if farm is closed or not
                checkFarmIsOpen(s);

                // Init depositor address
                const depositor : depositorType = Tezos.get_sender();

                // Check if sender is an existing depositor
                const existingDepositor : bool = Big_map.mem(depositor, s.depositorLedger);

                // Prepare new depositor record
                var depositorRecord : depositorRecordType := record[
                    balance                     =0n;
                    participationRewardsPerShare    =s.accumulatedRewardsPerShare;
                    unclaimedRewards            =0n;
                    claimedRewards              =0n;
                ];

                // Get depositor deposit and perform a claim
                if existingDepositor then {
                    
                    // Update user's unclaimed rewards
                    s := updateUnclaimedRewards(depositor, s);

                    // Refresh depositor deposit with updated unclaimed rewards
                    depositorRecord :=  case getDepositorDeposit(depositor, s) of [
                            Some (_depositor)   -> _depositor
                        |   None                -> failwith(error_DEPOSITOR_NOT_FOUND)
                    ];
                    
                }
                else skip;

                // Update depositor token balance
                depositorRecord.balance := depositorRecord.balance + tokenAmount;

                // Update depositor ledger and farmTokenBalance
                s.config.lpToken.tokenBalance := s.config.lpToken.tokenBalance + tokenAmount;
                s.depositorLedger := Big_map.update(depositor, Some (depositorRecord), s.depositorLedger);

                // Transfer LP tokens from sender to farm balance in LP Contract (use Allowances)
                const transferOperation : operation = transferLP(
                    depositor,                      // from_
                    Tezos.get_self_address(),       // to_
                    tokenAmount,                    // tokenAmount
                    s.config.lpToken.tokenId,       // tokenId
                    s.config.lpToken.tokenStandard, // tokenStandard (i.e. FA2 or FA12)
                    s.config.lpToken.tokenAddress   // tokenContractAddress
                );

                operations := transferOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* withdraw lambda *)
function lambdaWithdraw(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block{

    // Steps Overview:    
    // 1. Check that %withdraw entrypoint is not paused (e.g. glass broken)
    // 2. Check if farm has started
    // 3. Update farm pool 
    // 4. Update user's unclaimedRewards if user already deposited tokens
    // 5. Check if the depositor has enough tokens to withdraw
    // 6. Check if the farm has enough tokens for withdrawal
    // 7. Transfer LP tokens to the user from the farm balance in the LP Contract


    // Check that %withdraw entrypoint is not paused (e.g. glass broken)
    checkWithdrawIsNotPaused(s);

    // Check if farm has started
    checkFarmIsInit(s);

    var operations : list(operation) := nil;

    case farmLambdaAction of [
        |   LambdaWithdraw(tokenAmount) -> {
                
                // Update pool farmStorageType
                s := updateFarm(s);     

                // Init depositor address
                const depositor : depositorType = Tezos.get_sender();

                // Update user's unclaimedRewards if user already deposited tokens
                s := updateUnclaimedRewards(depositor, s);

                // Get depositor record
                var depositorRecord : depositorRecordType := case getDepositorDeposit(depositor, s) of [
                        Some (d)    -> d
                    |   None        -> failwith(error_DEPOSITOR_NOT_FOUND)
                ];

                // Check if the depositor has enough tokens to withdraw
                if tokenAmount > depositorRecord.balance then failwith(error_WITHDRAWN_AMOUNT_TOO_HIGH) else skip;
                depositorRecord.balance := abs(depositorRecord.balance - tokenAmount);
                s.depositorLedger := Big_map.update(depositor, Some (depositorRecord), s.depositorLedger);

                // Check if the farm has enough tokens for withdrawal
                if tokenAmount > s.config.lpToken.tokenBalance then failwith(error_WITHDRAWN_AMOUNT_TOO_HIGH) else skip;
                s.config.lpToken.tokenBalance := abs(s.config.lpToken.tokenBalance - tokenAmount);
                
                // Transfer LP tokens to the user from the farm balance in the LP Contract
                const transferOperation : operation = transferLP(
                    Tezos.get_self_address(),       // from_
                    depositor,                      // to_
                    tokenAmount,                    // tokenAmount
                    s.config.lpToken.tokenId,       // tokenId
                    s.config.lpToken.tokenStandard, // tokenStandard (i.e. FA2 or FA12)
                    s.config.lpToken.tokenAddress   // tokenContractAddress
                );

                operations := transferOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)



(* claim lambda *)
function lambdaClaim(const farmLambdaAction : farmLambdaActionType; var s : farmStorageType) : return is
block{

    // Steps Overview:    
    // 1. Check that %claim entrypoint is not paused (e.g. glass broken)
    // 2. Check if farm has started
    // 3. Update farm pool 
    // 4. Update user's unclaimedRewards if user already deposited tokens
    // 5. Check if sender is an existing depositor
    // 6. Get depositor's unclaimed rewards and check that user has more than 0 rewards to claim
    // 7. Reset depositor's unclaimedRewards to 0, and update claimedRewards total
    // 8. Update storage with new depositor record
    // 9. Transfer staked MVK rewards to user through the %farmClaim entrypoint on the Doorman Contract

    
    // Check that %claim entrypoint is not paused (e.g. glass broken)
    checkClaimIsNotPaused(s);

    // Check if farm has started
    checkFarmIsInit(s);

    var operations : list(operation) := nil;

    case farmLambdaAction of [
        |   LambdaClaim(depositor) -> {
                
                // Update pool farmStorageType
                s := updateFarm(s);

                // Update user's unclaimed rewards
                s := updateUnclaimedRewards(depositor, s);

                // Check if sender is an existing depositor
                var depositorRecord : depositorRecordType := case getDepositorDeposit(depositor, s) of [
                        Some (r)        -> r
                    |   None            -> (failwith(error_DEPOSITOR_NOT_FOUND) : depositorRecordType)
                ];

                // Get depositor's unclaimed rewards
                const unclaimedRewards : tokenBalanceType = depositorRecord.unclaimedRewards;

                // Check that user has more than 0 rewards to claim
                if unclaimedRewards = 0n then failwith(error_NO_FARM_REWARDS_TO_CLAIM) else skip;

                // Reset depositor's unclaimedRewards to 0, and update claimedRewards total
                depositorRecord.claimedRewards      := depositorRecord.claimedRewards + depositorRecord.unclaimedRewards;
                depositorRecord.unclaimedRewards    := 0n;

                // Update storage with new depositor record
                s.depositorLedger := Big_map.update(depositor, Some (depositorRecord), s.depositorLedger);

                // Transfer staked MVK rewards to user through the %farmClaim entrypoint on the Doorman Contract
                const transferRewardOperation : operation = transferReward(depositor, unclaimedRewards, s);

                operations := transferRewardOperation # operations;

            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Farm Lambdas End
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
//
// Farm Lambdas End
//
// ------------------------------------------------------------------------------
