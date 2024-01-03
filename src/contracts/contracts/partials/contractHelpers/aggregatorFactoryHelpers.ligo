// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Admin, Governance Satellite Contract
function verifySenderIsAdminOrGovernanceSatelliteContract(var s : aggregatorFactoryStorageType) : unit is
block{

    const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[s.admin; governanceSatelliteAddress], error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED)

} with unit



// Allowed Senders: Tracked Aggregator
function verifySenderIsTrackedAggregators(const s : aggregatorFactoryStorageType) : unit is
block {

    verifySenderIsAllowed(s.trackedAggregators, error_SENDER_IS_NOT_TRACKED_AGGREGATOR)

} with unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get distributeReward entrypoint in delegation contract
function getDistributeRewardInDelegationEntrypoint(const contractAddress : address) : contract(distributeRewardStakedMvnType) is
    case (Tezos.get_entrypoint_opt(
        "%distributeReward",
        contractAddress) : option(contract(distributeRewardStakedMvnType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_DISTRIBUTE_REWARD_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(distributeRewardStakedMvnType))
        ];



// helper function to get setAggregatorReference entrypoint in governanceSatellite contract
function getSetAggregatorReferenceInGovernanceSatelliteEntrypoint(const contractAddress : address) : contract(setAggregatorReferenceType) is
    case (Tezos.get_entrypoint_opt(
        "%setAggregatorReference",
        contractAddress) : option(contract(setAggregatorReferenceType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_AGGREGATOR_REFERENCE_ENTRYPOINT_IN_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND) : contract(setAggregatorReferenceType))
        ];  

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Operation Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to update general contracts on the Governance contract
function updateGeneralContractsOperation(const contractName : string; const contractAddress : address; const s : aggregatorFactoryStorageType) : operation is 
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



// helper function to set aggregator reference on the Governance Satellite contract
function setAggregatorReferenceOperation(const aggregatorName : string; const aggregatorAddress : address; const s : aggregatorFactoryStorageType) : operation is 
block {

    // Get Governance Satellite Contract Address from the General Contracts Map on the Governance Contract
    const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);

    // Set Aggregator Reference operation to Governance Satellite Contract
    const setAggregatorReferenceParams : setAggregatorReferenceType = record [
        aggregatorAddress   = aggregatorAddress;
        oldName             = aggregatorName;
        newName             = aggregatorName;
    ];

    // Create and send setAggregatorReference operation to the Governance Contract
    const setAggregatorReferenceOperation : operation = Tezos.transaction(
        setAggregatorReferenceParams,
        0tez,
        getSetAggregatorReferenceInGovernanceSatelliteEntrypoint(governanceSatelliteAddress)
    );

} with setAggregatorReferenceOperation



// helper function to distribute reward xtz
function distributeRewardXtzOperation(const recipient : address; const rewardAmount : nat; const s : aggregatorFactoryStorageType) : operation is 
block {

    // Get Aggregator Treasury Contract Address from the General Contracts Map on the Governance Contract
    const treasuryAddress : address = getContractAddressFromGovernanceContract("aggregatorTreasury", s.governanceAddress, error_TREASURY_CONTRACT_NOT_FOUND);

    // set token type to Tez
    const tokenTransferType : tokenType = Tez;
    
    // Create operation to transfer XTZ reward from Aggregator Treasury to oracle recipient (satellite)
    const distributeRewardXtzParams : transferActionType = list[
        record [
            to_        = recipient;
            token      = tokenTransferType;
            amount     = rewardAmount;
        ]
    ];

    const distributeRewardXtzOperation : operation = Tezos.transaction(
        distributeRewardXtzParams, 
        0tez, 
        sendTransferOperationToTreasury(treasuryAddress)
    );

} with distributeRewardXtzOperation



// helper function to distribute reward staked MVN
function distributeRewardStakedMvnOperation(const eligibleSatellites : set(address); const rewardAmount : nat; const s : aggregatorFactoryStorageType) : operation is 
block {

    // Get Delegation Contract Address from the General Contracts Map on the Governance Contract
    const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    // Create operation to distribute staked MVN reward to oracle recipient through the %distributeReward entrypoint on the Delegation Contract
    const rewardParams : distributeRewardStakedMvnType = record [
        eligibleSatellites   = eligibleSatellites;
        totalStakedMvnReward = rewardAmount;
    ];

    const distributeRewardStakedMvnOperation : operation = Tezos.transaction(
        rewardParams,
        0tez,
        getDistributeRewardInDelegationEntrypoint(delegationAddress)
    );

} with distributeRewardStakedMvnOperation

// ------------------------------------------------------------------------------
// Operation Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get aggregator's name
function getAggregatorName(const aggregatorAddress : address) : string is
block {

    const aggregatorNameView : option(string) = Tezos.call_view ("getName", unit, aggregatorAddress);
    const aggregatorName : string = case aggregatorNameView of [
                Some (_name)    -> _name
            |   None            -> failwith (error_GET_NAME_VIEW_IN_AGGREGATOR_CONTRACT_NOT_FOUND)
    ];

} with aggregatorName



// helper funtion to prepare new aggregator storage
function prepareAggregatorStorage(const createAggregatorParams : createAggregatorParamsType; const s : aggregatorFactoryStorageType) : aggregatorStorageType is 
block {

    const lastCompletedData = record[
        round                     = 0n;
        epoch                     = 0n;
        data                      = 0n;
        percentOracleResponse     = 0n;
        lastUpdatedAt             = Tezos.get_now();
    ];
    const oracleRewardXtz        : oracleRewardXtzType        = Big_map.empty;
    const oracleRewardStakedMvn  : oracleRewardStakedMvnType  = Big_map.empty;

    // Get Governance Satellite Contract Address from the General Contracts Map on the Governance Contract
    const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);

    // Add Aggregator Factory Contract and Governance Satellite Contract to Whitelisted Contracts Map on the new Aggregator Contract
    const aggregatorWhitelistContracts : whitelistContractsType = big_map[
        (Tezos.get_self_address())   -> unit;
        (governanceSatelliteAddress) -> unit;
    ];
    
    const aggregatorGeneralContracts : generalContractsType = big_map[];

    const aggregatorLambdaLedger : lambdaLedgerType = s.aggregatorLambdaLedger;

    const aggregatorBreakGlassConfig : aggregatorBreakGlassConfigType = record[
        updateDataIsPaused                  = False;
        withdrawRewardXtzIsPaused           = False;
        withdrawRewardStakedMvnIsPaused     = False;
    ];

    // Prepare Aggregator Metadata
    const aggregatorMetadata: metadataType = Big_map.literal (list [
        ("", ("74657a6f732d73746f726167653a64617461" : bytes));
        ("data", createAggregatorParams.metadata);
    ]);

    // Validate name input does not exceed max length
    const aggregatorName : string = createAggregatorParams.name;
    validateStringLength(aggregatorName, s.config.aggregatorNameMaxLength, error_WRONG_INPUT_PROVIDED);

    // Originate an aggregator
    const originatedAggregatorStorageType : aggregatorStorageType = record [

        admin                     = s.admin;                         
        metadata                  = aggregatorMetadata;
        name                      = aggregatorName;
        config                    = createAggregatorParams.aggregatorConfig;
        breakGlassConfig          = aggregatorBreakGlassConfig;

        mvnTokenAddress           = s.mvnTokenAddress;
        governanceAddress         = s.governanceAddress;

        whitelistContracts        = aggregatorWhitelistContracts;      
        generalContracts          = aggregatorGeneralContracts;

        oracleLedger              = createAggregatorParams.oracleLedger;
        
        lastCompletedData         = lastCompletedData;
                            
        oracleRewardXtz           = oracleRewardXtz;
        oracleRewardStakedMvn     = oracleRewardStakedMvn;      

        lambdaLedger              = aggregatorLambdaLedger;
    ];

} with originatedAggregatorStorageType 



// helper function to track an aggregator 
function trackAggregator(const aggregatorAddress : address; const s : aggregatorFactoryStorageType) : set(address) is 
block {

    const trackedAggregators : set(address) = case Set.mem(aggregatorAddress, s.trackedAggregators) of [
            True  -> (failwith(error_AGGREGATOR_ALREADY_TRACKED) : set(address))
        |   False -> Set.add(aggregatorAddress, s.trackedAggregators)
    ];

} with trackedAggregators



// helper function to untrack an aggregator 
function untrackAggregator(const aggregatorAddress : address; const s : aggregatorFactoryStorageType) : set(address) is 
block {

    var trackedAggregators : set(address) := case Set.mem(aggregatorAddress, s.trackedAggregators) of [
            True  -> Set.remove(aggregatorAddress, s.trackedAggregators)
        |   False -> (failwith(error_AGGREGATOR_NOT_TRACKED) : set(address))
    ];

} with trackedAggregators

// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const aggregatorFactoryLambdaAction : aggregatorFactoryLambdaActionType; var s : aggregatorFactoryStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(aggregatorFactoryUnpackLambdaFunctionType)) of [
            Some(f) -> f(aggregatorFactoryLambdaAction, s)
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