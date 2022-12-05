// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Admin, Governance Contract
function checkSenderIsAllowed(var s : farmFactoryStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);
        


// Allowed Senders: Admin
function checkSenderIsAdmin(const s : farmFactoryStorageType) : unit is
    if Tezos.get_sender() =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit



// Allowed Senders: Council Contract
function checkSenderIsCouncil(const s : farmFactoryStorageType) : unit is
block {

    const councilAddress : address = case s.whitelistContracts["council"] of [
            Some (_address) -> _address
        |   None            -> (failwith(error_COUNCIL_CONTRACT_NOT_FOUND) : address)
    ];

    if Tezos.get_sender() = councilAddress then skip
    else failwith(error_ONLY_COUNCIL_CONTRACT_ALLOWED);

} with (unit)



// Allowed Senders: Admin, Governance Satellite Contract
function checkSenderIsAdminOrGovernanceSatelliteContract(var s : farmFactoryStorageType) : unit is
block{

    if Tezos.get_sender() = s.admin then skip
    else {

        const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);

        if Tezos.get_sender() = governanceSatelliteAddress then skip
        else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED);
    }

} with unit



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if Tezos.get_amount() =/= 0tez then failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ)
    else unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check that the %createFarm entrypoint is not paused
function checkCreateFarmIsNotPaused(var s : farmFactoryStorageType) : unit is
    if s.breakGlassConfig.createFarmIsPaused then failwith(error_CREATE_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %trackFarm entrypoint is not paused
function checkTrackFarmIsNotPaused(var s : farmFactoryStorageType) : unit is
    if s.breakGlassConfig.trackFarmIsPaused then failwith(error_TRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED)
    else unit;



// helper function to check that the %untrackFarm entrypoint is not paused
function checkUntrackFarmIsNotPaused(var s : farmFactoryStorageType) : unit is
    if s.breakGlassConfig.untrackFarmIsPaused then failwith(error_UNTRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_PAUSED)
    else unit;

// ------------------------------------------------------------------------------
// Pause / Break Glass Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to %stake entrypoint on the Doorman contract
function getUpdateGeneralContractsEntrypoint(const contractAddress : address) : contract(updateGeneralContractsType) is
    case (Tezos.get_entrypoint_opt(
        "%updateGeneralContracts",
        contractAddress) : option(contract(updateGeneralContractsType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_NOT_FOUND) : contract(updateGeneralContractsType))
        ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------

// Validate that farm has proper reward block settings (reward blocks is non-zero or farm is infinite)
function validateFarmRewardBlocks(const createFarmParams : createFarmType) : unit is
block {

    if not createFarmParams.infinite and createFarmParams.plannedRewards.totalBlocks = 0n then failwith(error_FARM_SHOULD_BE_INFINITE_OR_HAVE_A_DURATION) else skip;

} with unit



// helper funtion to prepare new farm storage
function prepareFarmStorage(const createFarmParams : createFarmType; const s : farmFactoryStorageType) : farmStorageType is 
block {

    // Get Council Address from the General Contracts Map on the Governance Contract
    const councilAddress : address = getContractAddressFromGovernanceContract("council", s.governanceAddress, error_COUNCIL_CONTRACT_NOT_FOUND);
    
    // Add FarmFactory Address and Council Address to whitelistContracts map of created Farm
    const farmWhitelistContract : whitelistContractsType = map[
        ("farmFactory")  -> (Tezos.get_self_address() : address);
        ("council")      -> (councilAddress : address)
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
    validateFarmRewardBlocks(createFarmParams);

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
        open                        = True ;
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
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get lambda bytes
function getLambdaBytes(const lambdaKey : string; const s : farmFactoryStorageType) : bytes is 
block {
    
    // get lambda bytes from lambda ledger
    const lambdaBytes : bytes = case s.lambdaLedger[lambdaKey] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

} with lambdaBytes



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
