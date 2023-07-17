// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders : Admin, Governance Satellite Contract
function verifySenderIsAdminOrGovernanceSatelliteContract(var s : treasuryFactoryStorageType) : unit is
block{
  
    const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[s.admin; governanceSatelliteAddress], error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED)

} with unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
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

// helper funtion to get governance proxy address directly from the Governance Contract
function getGovernanceProxyAddress(const s : treasuryFactoryStorageType) : address is
block {

    const governanceProxyAddressView : option (address) = Tezos.call_view ("getGovernanceProxyAddress", unit, s.governanceAddress);
    const governanceProxyAddress : address = case governanceProxyAddressView of [
            Some (value) -> value
        |   None         -> failwith (error_GET_GOVERNANCE_PROXY_ADDRESS_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

} with governanceProxyAddress



// helper funtion to prepare new treasury storage
function prepareTreasuryStorage(const createTreasuryParams : createTreasuryType; const s : treasuryFactoryStorageType) : treasuryStorageType is 
block {

    // init variables
    const treasuryName  : string = createTreasuryParams.name;
    const metadata      : bytes  = createTreasuryParams.metadata;

    // Get Governance Proxy Contract address directly from the Governance Contract
    const governanceProxyAddress : address = getGovernanceProxyAddress(s);

    // Add TreasuryFactory Address and Governance Proxy Address to whitelistContracts of created treasury
    const treasuryWhitelistContracts : whitelistContractsType = big_map[
        (Tezos.get_self_address())  -> unit;
        (governanceProxyAddress)    -> unit;
    ];

    // Add whitelisted tokens (on Treasury Factory) to created treasury 
    const treasuryWhitelistTokenContracts : whitelistTokenContractsType = s.whitelistTokenContracts;

    // Init empty General Contracts map (local contract scope, to be used if necessary)
    const treasuryGeneralContracts : generalContractsType = big_map[];

    // Init break glass config
    const treasuryBreakGlassConfig: treasuryBreakGlassConfigType = record[
        transferIsPaused                = False;
        mintMvkAndTransferIsPaused      = False;
        stakeTokensIsPaused             = False;
        unstakeTokensIsPaused           = False;
        updateTokenOperatorsIsPaused    = False;
    ];

    // Prepare Treasury Metadata
    const treasuryMetadata: metadataType = Big_map.literal (list [
        ("", ("74657a6f732d73746f726167653a64617461": bytes));
        ("data", metadata)
    ]);

    // Init Treasury lambdas (stored on Treasury Factory)
    const treasuryLambdaLedger : lambdaLedgerType = s.treasuryLambdaLedger;

    // Prepare Treasury storage
    const newTreasuryStorage : treasuryStorageType = record [
        
        admin                     = s.admin;                         // admin will be the Treasury Factory admin (i.e. Governance Proxy contract)
        metadata                  = treasuryMetadata;
        name                      = treasuryName;

        mvkTokenAddress           = s.mvkTokenAddress;
        governanceAddress         = s.governanceAddress;

        whitelistContracts        = treasuryWhitelistContracts;      
        whitelistTokenContracts   = treasuryWhitelistTokenContracts;      
        generalContracts          = treasuryGeneralContracts;

        breakGlassConfig          = treasuryBreakGlassConfig;

        lambdaLedger              = treasuryLambdaLedger;
    ];

} with newTreasuryStorage



// helper function to update general contracts on the Governance contract
function updateGeneralContractsOperation(const contractName : string; const contractAddress : address; const s : treasuryFactoryStorageType) : operation is 
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



// helper function to track treasury 
function trackTreasury(const treasuryAddress : address; const s : treasuryFactoryStorageType) : set(address) is 
block {

    var trackedTreasuries : set(address) := case Set.mem(treasuryAddress, s.trackedTreasuries) of [
            True  -> (failwith(error_TREASURY_ALREADY_TRACKED) : set(address))
        |   False -> Set.add(treasuryAddress, s.trackedTreasuries)
    ];

} with trackedTreasuries



// helper function to untrack treasury 
function untrackTreasury(const treasuryAddress : address; const s : treasuryFactoryStorageType) : set(address) is 
block {

    var trackedTreasuries : set(address) := case Set.mem(treasuryAddress, s.trackedTreasuries) of [
            True  -> Set.remove(treasuryAddress, s.trackedTreasuries)
        |   False -> (failwith(error_TREASURY_NOT_TRACKED) : set(address))
    ];

} with trackedTreasuries

// ------------------------------------------------------------------------------
// General Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const treasuryFactoryLambdaAction : treasuryFactoryLambdaActionType; var s : treasuryFactoryStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(treasuryFactoryUnpackLambdaFunctionType)) of [
            Some(f) -> f(treasuryFactoryLambdaAction, s)
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