// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Admin, Governance Satellite Contract
function verifySenderIsAdminOrGovernanceSatelliteContract(var s : farmFactoryStorageType) : unit is
block{

    const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[s.admin; governanceSatelliteAddress], error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED)

} with unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------

// Validate that farm has proper reward block settings (reward blocks is non-zero or farm is infinite)
function validateFarmRewardBlocks(const infinite : bool; const plannedRewardsTotalBlocks : nat) : unit is
block {

    if not infinite and plannedRewardsTotalBlocks = 0n then failwith(error_FARM_SHOULD_BE_INFINITE_OR_HAVE_A_DURATION) else skip;

} with unit



// helper funtion to prepare new farm storage
function prepareFarmStorage(const createFarmParams : createFarmType; const s : farmFactoryStorageType) : farmStorageType is 
block {

    // Get Council Address from the General Contracts Map on the Governance Contract
    const councilAddress : address = getContractAddressFromGovernanceContract("council", s.governanceAddress, error_COUNCIL_CONTRACT_NOT_FOUND);
    
    // Add FarmFactory Address and Council Address to whitelistContracts map of created Farm
    const farmWhitelistContract : whitelistContractsType = big_map[
        (Tezos.get_self_address())  -> unit;
        (councilAddress)            -> unit;
    ];
    
    // Init empty General Contracts map (local contract scope, to be used if necessary)
    const farmGeneralContracts : generalContractsType = map[];

    // Create needed records for Farm contract
    const farmClaimedRewards : claimedRewardsType = record[
        paid   = 0n;
        unpaid = 0n;
    ];
    const farmForceRewardFromTransfer : bool  = createFarmParams.forceRewardFromTransfer;
    const farmInfinite : bool                 = createFarmParams.infinite;
    const farmTotalRewards : nat              = createFarmParams.plannedRewards.totalBlocks * createFarmParams.plannedRewards.currentRewardPerBlock;
    
    // Init Farm's planned rewards
    const farmPlannedRewards : plannedRewardsType = record[
        totalBlocks             = createFarmParams.plannedRewards.totalBlocks;
        currentRewardPerBlock   = createFarmParams.plannedRewards.currentRewardPerBlock;
        totalRewards            = farmTotalRewards;
    ];

    // Init Farm's LP Token
    const farmLPToken : lpTokenType  = record[
        tokenAddress        = createFarmParams.lpToken.tokenAddress;
        tokenId             = createFarmParams.lpToken.tokenId;
        tokenStandard       = createFarmParams.lpToken.tokenStandard;
        tokenBalance        = 0n;
    ];

    // Init break glass config
    const farmBreakGlassConfig : farmBreakGlassConfigType = record[
        depositIsPaused     = False;
        withdrawIsPaused    = False;
        claimIsPaused       = False;
    ];

    // Init Farm config
    const farmConfig : farmConfigType = record[
        lpToken                     = farmLPToken;
        infinite                    = farmInfinite;
        forceRewardFromTransfer     = farmForceRewardFromTransfer;
        plannedRewards              = farmPlannedRewards;
    ];

    // Prepare Farm Metadata
    const farmMetadata: metadataType = Big_map.literal (list [
        ("", ("74657a6f732d73746f726167653a64617461": bytes));
        ("data", createFarmParams.metadata);
    ]); 
    const farmLambdaLedger : lambdaLedgerType = s.farmLambdaLedger;

    // Check whether the farm is infinite or its total blocks has been set
    validateFarmRewardBlocks(createFarmParams.infinite, createFarmParams.plannedRewards.totalBlocks);

    // Check farm name length
    validateStringLength(createFarmParams.name, s.config.farmNameMaxLength, error_WRONG_INPUT_PROVIDED);

    // Originate a farm 
    const originatedfarmStorageType : farmStorageType = record [

        admin                       = s.admin;                   // admin will be the Farm Factory admin (i.e. Governance Proxy contract)
        mvkTokenAddress             = s.mvkTokenAddress;
        governanceAddress           = s.governanceAddress;
        metadata                    = farmMetadata;

        name                        = createFarmParams.name;
        config                      = farmConfig;
        
        whitelistContracts          = farmWhitelistContract;      
        generalContracts            = farmGeneralContracts;

        breakGlassConfig            = farmBreakGlassConfig;

        lastBlockUpdate             = Tezos.get_level();
        accumulatedRewardsPerShare  = 0n;
        claimedRewards              = farmClaimedRewards;
        depositorLedger             = big_map[];
        open                        = True;
        init                        = True;
        initBlock                   = Tezos.get_level();

        minBlockTimeSnapshot        = Tezos.get_min_block_time();

        lambdaLedger                = farmLambdaLedger;
    ];

} with originatedfarmStorageType 



// helper funtion to prepare new farm mToken storage
function prepareFarmMTokenStorage(const createFarmMTokenParams : createFarmMTokenType; const s : farmFactoryStorageType) : farmMTokenStorageType is 
block {

    // Get Council Address from the General Contracts Map on the Governance Contract
    const councilAddress : address = getContractAddressFromGovernanceContract("council", s.governanceAddress, error_COUNCIL_CONTRACT_NOT_FOUND);
    
    // Add FarmFactory Address and Council Address to whitelistContracts map of created Farm
    const farmWhitelistContract : whitelistContractsType = big_map[
        (Tezos.get_self_address())  -> unit;
        (councilAddress)            -> unit
    ];
    
    // Init empty General Contracts map (local contract scope, to be used if necessary)
    const farmGeneralContracts : generalContractsType = map[];

    // Create needed records for Farm contract
    const farmClaimedRewards : claimedRewardsType = record[
        paid   = 0n;
        unpaid = 0n;
    ];
    const farmForceRewardFromTransfer : bool  = createFarmMTokenParams.forceRewardFromTransfer;
    const farmInfinite : bool                 = createFarmMTokenParams.infinite;
    const farmTotalRewards : nat              = createFarmMTokenParams.plannedRewards.totalBlocks * createFarmMTokenParams.plannedRewards.currentRewardPerBlock;
    
    // Init Farm's planned rewards
    const farmPlannedRewards : plannedRewardsType = record[
        totalBlocks             = createFarmMTokenParams.plannedRewards.totalBlocks;
        currentRewardPerBlock   = createFarmMTokenParams.plannedRewards.currentRewardPerBlock;
        totalRewards            = farmTotalRewards;
    ];

    // Init Farm's LP Token
    const farmLPToken : lpTokenType  = record[
        tokenAddress        = createFarmMTokenParams.lpToken.tokenAddress;
        tokenId             = createFarmMTokenParams.lpToken.tokenId;
        tokenStandard       = createFarmMTokenParams.lpToken.tokenStandard;
        tokenBalance        = 0n;
    ];

    // Init break glass config
    const farmBreakGlassConfig : farmBreakGlassConfigType = record[
        depositIsPaused     = False;
        withdrawIsPaused    = False;
        claimIsPaused       = False;
    ];

    // Init Farm config
    const farmMTokenConfig : farmMTokenConfigType = record[
        lpToken                     = farmLPToken;
        loanToken                   = createFarmMTokenParams.loanToken;
        infinite                    = farmInfinite;
        forceRewardFromTransfer     = farmForceRewardFromTransfer;
        plannedRewards              = farmPlannedRewards;
    ];

    // Prepare Farm Metadata
    const farmMetadata: metadataType = Big_map.literal (list [
        ("", ("74657a6f732d73746f726167653a64617461": bytes));
        ("data", createFarmMTokenParams.metadata);
    ]); 
    const farmLambdaLedger : lambdaLedgerType = s.mFarmLambdaLedger;

    // Check whether the farm is infinite or its total blocks has been set
    validateFarmRewardBlocks(createFarmMTokenParams.infinite, createFarmMTokenParams.plannedRewards.totalBlocks);

    // Check farm name length
    validateStringLength(createFarmMTokenParams.name, s.config.farmNameMaxLength, error_WRONG_INPUT_PROVIDED);

    // Originate a farm 
    const originatedfarmStorageType : farmMTokenStorageType = record [

        admin                       = s.admin;                   // admin will be the Farm Factory admin (i.e. Governance Proxy contract)
        mvkTokenAddress             = s.mvkTokenAddress;
        governanceAddress           = s.governanceAddress;
        metadata                    = farmMetadata;

        name                        = createFarmMTokenParams.name;
        config                      = farmMTokenConfig;
        
        whitelistContracts          = farmWhitelistContract;      
        generalContracts            = farmGeneralContracts;

        breakGlassConfig            = farmBreakGlassConfig;

        lastBlockUpdate             = Tezos.get_level();
        accumulatedRewardsPerShare  = 0n;
        claimedRewards              = farmClaimedRewards;
        depositorLedger             = big_map[];
        open                        = True;
        init                        = True;
        initBlock                   = Tezos.get_level();

        minBlockTimeSnapshot        = Tezos.get_min_block_time();

        lambdaLedger                = farmLambdaLedger;
    ];

} with originatedfarmStorageType 



// helper function to update general contracts on the Governance contract
function updateGeneralContractsOperation(const contractName : string; const contractAddress : address; const s : farmFactoryStorageType) : operation is 
block {

    const updateGeneralMapRecord : updateGeneralContractsType = record [
        generalContractName    = contractName;
        generalContractAddress = contractAddress;
        updateType             = Update(unit);
    ];

    // Create and send updateGeneralContractsMap operation to the Governance Contract
    const updateGeneralContractsOperation : operation = Tezos.transaction(
        updateGeneralMapRecord,
        0tez, 
        getUpdateGeneralContractsEntrypoint(s.governanceAddress)
    );

} with updateGeneralContractsOperation



// helper function to track farm 
function trackFarm(const farmAddress : address; const s : farmFactoryStorageType) : set(address) is 
block {

    var trackedFarms : set(address) := case Set.mem(farmAddress, s.trackedFarms) of [
            True  -> (failwith(error_FARM_ALREADY_TRACKED) : set(address))
        |   False -> Set.add(farmAddress, s.trackedFarms)
    ];

} with trackedFarms



// helper function to untrack farm 
function untrackFarm(const farmAddress : address; const s : farmFactoryStorageType) : set(address) is 
block {

    var trackedFarms : set(address) := case Set.mem(farmAddress, s.trackedFarms) of [
            True  -> Set.remove(farmAddress, s.trackedFarms)
        |   False -> (failwith(error_FARM_NOT_TRACKED) : set(address))
    ];

} with trackedFarms

// ------------------------------------------------------------------------------
// General Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const farmFactoryLambdaAction : farmFactoryLambdaActionType; var s : farmFactoryStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(farmFactoryUnpackLambdaFunctionType)) of [
            Some(f) -> f(farmFactoryLambdaAction, s)
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
