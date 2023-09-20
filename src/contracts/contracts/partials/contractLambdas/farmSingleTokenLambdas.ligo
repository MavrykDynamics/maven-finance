// ------------------------------------------------------------------------------
//
// Farm Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(*  setAdmin lambda *)
function lambdaSetAdmin(const farmSingleTokenLambdaAction : farmSingleTokenLambdaActionType; var s : farmSingleTokenStorageType) : return is
block {

    checkSenderIsAllowed(s); 
    
    case farmSingleTokenLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        | _ -> skip
    ];
    
} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const farmSingleTokenLambdaAction : farmSingleTokenLambdaActionType; var s : farmSingleTokenStorageType) : return is
block {
    
    checkSenderIsAllowed(s);

    case farmSingleTokenLambdaAction of [
        | LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* settName lambda - update the metadata at a given key *)
function lambdaSetName(const farmSingleTokenLambdaAction : farmSingleTokenLambdaActionType; var s : farmSingleTokenStorageType) : return is
block {

    checkSenderIsAdmin(s);
    
    case farmSingleTokenLambdaAction of [
        | LambdaSetName(updatedName) -> {

                // Get farm factory address
                const generalContractsOptView : option (option(address)) = Mavryk.call_view ("getGeneralContractOpt", "farmFactory", s.governanceAddress);
                const farmFactoryAddress: address = case generalContractsOptView of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_FARM_FACTORY_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // Get the farm factory config
                const configView : option (farmFactoryConfigType) = Mavryk.call_view ("getConfig", unit, farmFactoryAddress);
                const farmFactoryConfig: farmFactoryConfigType = case configView of [
                    Some (_config) -> _config
                |   None -> failwith (error_GET_CONFIG_VIEW_IN_FARM_FACTORY_CONTRACT_NOT_FOUND)
                ];

                // Check get the name config param from the farm factory
                const farmNameMaxLength: nat    = farmFactoryConfig.farmNameMaxLength;

                // Validate inputs and update the name
                if String.length(updatedName) > farmNameMaxLength then failwith(error_WRONG_INPUT_PROVIDED) else s.name  := updatedName;
                
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const farmSingleTokenLambdaAction : farmSingleTokenLambdaActionType; var s : farmSingleTokenStorageType) : return is
block {
    
    checkSenderIsAdmin(s);
    
    case farmSingleTokenLambdaAction of [
        | LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateConfig lambda *)
function lambdaUpdateConfig(const farmSingleTokenLambdaAction : farmSingleTokenLambdaActionType; var s : farmSingleTokenStorageType) : return is 
block {

  checkSenderIsAdmin(s); 
  
  case farmSingleTokenLambdaAction of [
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

                        // update farmSingleTokenStorageType
                        s := updateFarm(s);

                        // Check new reward per block
                        const currentRewardPerBlock: nat = s.config.plannedRewards.currentRewardPerBlock;
                        if currentRewardPerBlock > updateConfigNewValue then failwith(error_CONFIG_VALUE_ERROR) else skip;

                        // Calculate new total rewards
                        const totalClaimedRewards: nat = s.claimedRewards.unpaid+s.claimedRewards.paid;
                        const remainingBlocks: nat = abs((s.initBlock + s.config.plannedRewards.totalBlocks) - s.lastBlockUpdate);
                        const newTotalRewards: nat = totalClaimedRewards + remainingBlocks * updateConfigNewValue;

                        // Update farmSingleTokenStorageType
                        s.config.plannedRewards.currentRewardPerBlock := updateConfigNewValue;
                        s.config.plannedRewards.totalRewards := newTotalRewards;
                    }
                ];

            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const farmSingleTokenLambdaAction : farmSingleTokenLambdaActionType; var s: farmSingleTokenStorageType): return is
block {
    
    checkSenderIsAdmin(s);
    
    case farmSingleTokenLambdaAction of [
        | LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const farmSingleTokenLambdaAction : farmSingleTokenLambdaActionType; var s: farmSingleTokenStorageType): return is
block {

    checkSenderIsAdmin(s);
    
    case farmSingleTokenLambdaAction of [
        | LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  mistaken lambda *)
function lambdaMistakenTransfer(const farmSingleTokenLambdaAction : farmSingleTokenLambdaActionType; var s: farmSingleTokenStorageType): return is
block {

    var operations : list(operation) := nil;

    case farmSingleTokenLambdaAction of [
        | LambdaMistakenTransfer(destinationParams) -> {

                // Check if the sender is the governanceSatellite contract
                checkSenderIsAdminOrGovernanceSatelliteContract(s);

                // Get LP Token address
                const lpTokenAddress: address  = s.config.lpToken.tokenAddress;

                // Create transfer operations
                function transferOperationFold(const transferParam: transferDestinationType; const operationList: list(operation)): list(operation) is
                  block{
                    // Check if token is not MVK (it would break SMVK) before creating the transfer operation
                    const transferTokenOperation : operation = case transferParam.token of [
                        | Tez         -> transferTez((Mavryk.get_contract_with_error(transferParam.to_, "Error. Contract not found at given address"): contract(unit)), transferParam.amount * 1mumav)
                        | Fa12(token) -> if token = lpTokenAddress then failwith(error_CANNOT_TRANSFER_LP_TOKEN_USING_MISTAKEN_TRANSFER) else transferFa12Token(Mavryk.get_self_address(), transferParam.to_, transferParam.amount, token)
                        | Fa2(token)  -> if token.tokenContractAddress = lpTokenAddress then failwith(error_CANNOT_TRANSFER_LP_TOKEN_USING_MISTAKEN_TRANSFER) else transferFa2Token(Mavryk.get_self_address(), transferParam.to_, transferParam.amount, token.tokenId, token.tokenContractAddress)
                    ];
                  } with(transferTokenOperation # operationList);
                
                operations  := List.fold_right(transferOperationFold, destinationParams, operations)
                
            }
        | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Farm Admin Lambdas End
// ------------------------------------------------------------------------------

(*  updateBlocksPerMinute lambda *)
function lambdaUpdateBlocksPerMinute(const farmSingleTokenLambdaAction : farmSingleTokenLambdaActionType; var s: farmSingleTokenStorageType) : return is
block {
    
    // check that source is admin or factory
    checkSenderIsCouncilOrFarmFactory(s);

    // check if farm has been initiated
    checkFarmIsInit(s);

    case farmSingleTokenLambdaAction of [
        | LambdaUpdateBlocksPerMinute(blocksPerMinute) -> {
                
                // update farmSingleTokenStorageType
                s := updateFarm(s);

                // Check new blocksPerMinute
                if blocksPerMinute > 0n then skip else failwith(error_INVALID_BLOCKS_PER_MINUTE);

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
                    
                    // Update farmSingleTokenStorageType
                    s.config.plannedRewards.totalBlocks := newTotalBlocks;
                };

                // Update farmSingleTokenStorageType
                s.config.blocksPerMinute := blocksPerMinute;
                s.config.plannedRewards.currentRewardPerBlock := (newcurrentRewardPerBlock/fixedPointAccuracy);

            }
        | _ -> skip
    ];

} with (noOperations, s)



(* initFarm lambda *)
function lambdaInitFarm(const farmSingleTokenLambdaAction : farmSingleTokenLambdaActionType; var s: farmSingleTokenStorageType): return is
block{

    checkSenderIsAdmin(s);

    case farmSingleTokenLambdaAction of [
        | LambdaInitFarm(initFarmParams) -> {
                
                // Check if farm is already open
                if s.open or s.init then failwith(error_FARM_ALREADY_OPEN) else skip;

                // Check if the blocks per minute is greater than 0
                if initFarmParams.blocksPerMinute <= 0n then failwith(error_INVALID_BLOCKS_PER_MINUTE) else skip;

                // Check wether the farm is infinite or its total blocks has been set
                if not initFarmParams.infinite and initFarmParams.totalBlocks = 0n then failwith(error_FARM_SHOULD_BE_INFINITE_OR_HAVE_A_DURATION) else skip;
                
                // Update farmSingleTokenStorageType
                s := updateFarm(s);
                s.initBlock := Mavryk.get_level();
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
function lambdaCloseFarm(const farmSingleTokenLambdaAction : farmSingleTokenLambdaActionType; var s: farmSingleTokenStorageType): return is
block{
    
    checkSenderIsAdmin(s);

    checkFarmIsOpen(s);

    case farmSingleTokenLambdaAction of [
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
function lambdaPauseAll(const farmSingleTokenLambdaAction : farmSingleTokenLambdaActionType; var s: farmSingleTokenStorageType) : return is
block {
    
    checkSenderIsGovernanceOrFactory(s);

    case farmSingleTokenLambdaAction of [
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
function lambdaUnpauseAll(const farmSingleTokenLambdaAction : farmSingleTokenLambdaActionType; var s : farmSingleTokenStorageType) : return is
block {

    checkSenderIsGovernanceOrFactory(s);

    case farmSingleTokenLambdaAction of [
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



(*  togglePauseEntrypoint lambda *)
function lambdaTogglePauseEntrypoint(const farmSingleTokenLambdaAction : farmSingleTokenLambdaActionType; var s : farmSingleTokenStorageType) : return is
block {

    checkSenderIsAdmin(s);

    case farmSingleTokenLambdaAction of [
        | LambdaTogglePauseEntrypoint(params) -> {

                case params.targetEntrypoint of [
                    Deposit (_v)       -> s.breakGlassConfig.depositIsPaused := _v
                |   Withdraw (_v)      -> s.breakGlassConfig.withdrawIsPaused := _v
                |   Claim (_v)         -> s.breakGlassConfig.claimIsPaused := _v
                ]
                
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
function lambdaDeposit(const farmSingleTokenLambdaAction : farmSingleTokenLambdaActionType; var s: farmSingleTokenStorageType) : return is
block{

    // break glass check
    checkDepositIsNotPaused(s);

    // Check if farm has started
    checkFarmIsInit(s);

    var operations : list(operation) := nil;

    case farmSingleTokenLambdaAction of [
        | LambdaDeposit(tokenAmount) -> {
                
                // Update pool farmSingleTokenStorageType
                s := updateFarm(s);

                // Check if farm is closed or not
                checkFarmIsOpen(s);

                // Depositor address
                const depositor     : depositorType = Mavryk.get_sender();

                // Check if sender as already a record
                const existingDepositor: bool = Big_map.mem(depositor, s.depositors);

                // Prepare new depositor record
                var depositorRecord: depositorRecordType := record[
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

                // Update depositors Big_map and farmTokenBalance
                s.config.lpToken.tokenBalance := s.config.lpToken.tokenBalance + tokenAmount;
                s.depositors := Big_map.update(depositor, Some (depositorRecord), s.depositors);

                // Transfer LP tokens from sender to farm balance in LP Contract (use Allowances)
                const transferOperation: operation = transferLP(depositor, Mavryk.get_self_address(), tokenAmount, s.config.lpToken.tokenId, s.config.lpToken.tokenStandard, s.config.lpToken.tokenAddress);

                operations := transferOperation # operations;

            }
        | _ -> skip
    ];

} with(operations, s)



(* withdraw lambda *)
function lambdaWithdraw(const farmSingleTokenLambdaAction : farmSingleTokenLambdaActionType; var s: farmSingleTokenStorageType) : return is
block{

    // break glass check
    checkWithdrawIsNotPaused(s);

    // Check if farm has started
    checkFarmIsInit(s);

    var operations : list(operation) := nil;

    case farmSingleTokenLambdaAction of [
        | LambdaWithdraw(tokenAmount) -> {
                
                // Update pool farmSingleTokenStorageType
                s := updateFarm(s);     

                const depositor: depositorType = Mavryk.get_sender();

                // Prepare to update user's unclaimedRewards if user already deposited tokens
                s := updateUnclaimedRewards(depositor, s);

                var depositorRecord: depositorRecordType := case getDepositorDeposit(depositor, s) of [
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
                    Mavryk.get_self_address(),
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
function lambdaClaim(const farmSingleTokenLambdaAction : farmSingleTokenLambdaActionType; var s: farmSingleTokenStorageType) : return is
block{

    // break glass check
    checkClaimIsNotPaused(s);

    // Check if farm has started
    checkFarmIsInit(s);

    var operations : list(operation) := nil;

    case farmSingleTokenLambdaAction of [
        | LambdaClaim(depositor) -> {
                
                // Update pool farmSingleTokenStorageType
                s := updateFarm(s);

                // Update user's unclaimed rewards
                s := updateUnclaimedRewards(depositor, s);

                // Check if sender as already a record
                var depositorRecord: depositorRecordType := case getDepositorDeposit(depositor, s) of [
                    Some (r)        -> r
                |   None            -> (failwith(error_DEPOSITOR_NOT_FOUND): depositorRecordType)
                ];

                const claimedRewards: tokenBalanceType = depositorRecord.unclaimedRewards;

                if claimedRewards = 0n then failwith(error_NO_FARM_REWARDS_TO_CLAIM) else skip;

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
