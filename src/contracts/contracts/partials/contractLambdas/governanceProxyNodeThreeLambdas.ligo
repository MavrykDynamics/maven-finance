// ------------------------------------------------------------------------------
//
// Governance Proxy Node Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType; var s : governanceProxyNodeStorageType) : return is
block {
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount  
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress); // verify that sender is admin or the Governance Contract address

    case governanceProxyNodeLambdaAction of [
        |   LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType; var s : governanceProxyNodeStorageType) : return is
block {
    
    verifyNoAmountSent(Unit); // entrypoint should not receive any tez amount  
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress); // verify that sender is admin or the Governance Contract address

    case governanceProxyNodeLambdaAction of [
        |   LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType; var s : governanceProxyNodeStorageType) : return is
block {

    verifyNoAmountSent(Unit);      // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin);  // verify that sender is admin
    
    case governanceProxyNodeLambdaAction of [
        |   LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType; var s : governanceProxyNodeStorageType) : return is
block {
    
    verifyNoAmountSent(Unit);      // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin);  // verify that sender is admin
    
    case governanceProxyNodeLambdaAction of [
        |   LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType; var s : governanceProxyNodeStorageType) : return is
block {

    verifyNoAmountSent(Unit);      // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin);  // verify that sender is admin
    
    case governanceProxyNodeLambdaAction of [
        |   LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        |   _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType; var s : governanceProxyNodeStorageType) : return is
block {

    verifyNoAmountSent(Unit);      // entrypoint should not receive any tez amount  
    verifySenderIsAdmin(s.admin);  // verify that sender is admin

    case governanceProxyNodeLambdaAction of [
        |   LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams) -> {
                s.whitelistTokenContracts := updateWhitelistTokenContractsMap(updateWhitelistTokenContractsParams, s.whitelistTokenContracts);
            }
        |   _ -> skip
    ];


} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const governanceProxyNodeLambdaAction : governanceProxyNodeLambdaActionType; var s : governanceProxyNodeStorageType) : return is
block {

    // Steps Overview:    
    // 1. Check that sender is admin or from the Governance Satellite Contract
    // 2. Create and execute transfer operations based on the params sent


    var operations : list(operation) := nil;

    case governanceProxyNodeLambdaAction of [
        |   LambdaMistakenTransfer(destinationParams) -> {

                // Verify that the sender is admin or the Governance Satellite Contract
                verifySenderIsAdminOrGovernanceSatelliteContract(s);

                // Create transfer operations (transferOperationFold in transferHelpers)
                operations := List.fold_right(transferOperationFold, destinationParams, operations)
                
            }
        |   _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// Housekeeping Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Basic Lambdas Begin
// ------------------------------------------------------------------------------

(* executeGovernanceLambdaProxy lambda *)
function executeGovernanceLambdaProxy(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    (* ids to match governanceLambdaIndex.json - id 0 is executeGovernanceLambdaProxy *)
    const id : nat = case executeAction of [
      
            (* Update Lambda Function *)
        |   UpdateProxyLambda (_v)                 -> 1n

            (* Farm Control *)
        |   CreateFarm (_v)                        -> 17n
        |   InitFarm (_v)                          -> 18n
        |   CloseFarm (_v)                         -> 19n

            (* Treasury Control *)
        |   CreateTreasury (_v)                    -> 20n
        |   TransferTreasury (_v)                  -> 21n
        |   MintMvkAndTransferTreasury (_v)        -> 22n
        |   UpdateMvkOperatorsTreasury (_v)        -> 23n
        |   StakeMvkTreasury (_v)                  -> 24n
        |   UnstakeMvkTreasury (_v)                -> 25n

            (* Aggregator Control *)
        |   CreateAggregator (_v)                  -> 26n

            (* MVK Token Control *)
        |   UpdateMvkInflationRate (_v)            -> 27n
        |   TriggerMvkInflation (_v)               -> 28n

            (* Vesting Control *)
        |   ManageVestee (_v)                      -> 31n

            (* Lending Controller *)
        |   SetLoanToken (_v)                      -> 32n
        |   SetCollateralToken (_v)                -> 33n
    ];

    // Get entrypoint lambda as bytes
    const lambdaBytes : bytes = case s.proxyLambdaLedger[id] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // Reference: type governanceProxyNodeProxyLambdaFunctionType is (executeActionType * governanceProxyNodeStorageType) -> return
    const res : return = case (Bytes.unpack(lambdaBytes) : option(governanceProxyNodeProxyLambdaFunctionType)) of [
        |   Some(f) -> f(executeAction, s)
        |   None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];
  
} with (res.0, s)



(* updateProxyLambda lambda *)
function updateProxyLambda(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is
block {
    
    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    case executeAction of [
        |   UpdateProxyLambda(params) -> {

                // Assign params to constants for better code readability
                const lambdaId     : nat   = params.id;
                const lambdaBytes  : bytes = params.func_bytes;

                // Allow override of lambdas
                s.proxyLambdaLedger[lambdaId] := lambdaBytes

            }
        |   _ -> skip
    ];

} with (noOperations, s)

// // ------------------------------------------------------------------------------
// // Basic Lambdas End
// // ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Gov Proxy Node Two Lambdas Begin
// ------------------------------------------------------------------------------

function createFarm(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   CreateFarm(createFarmParams) -> {

                // Find and get farmFactory contract address from the generalContracts map
                const farmFactoryAddress : address = getContractAddressFromGovernanceContract("farmFactory", s.governanceAddress, error_FARM_FACTORY_CONTRACT_NOT_FOUND);

                // Find and get createFarm entrypoint of farmFactory contract
                const createFarmEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%createFarm",
                    farmFactoryAddress) : option(contract(createFarmType))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_CREATE_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND) : contract(createFarmType))
                    ];

                // Create operation to create a farm
                const createFarmOperation : operation = Tezos.transaction(
                    (createFarmParams),
                    0tez, 
                    createFarmEntrypoint
                );

                operations := createFarmOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function initFarm(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   InitFarm(initFarmParams) -> {

                // assign params to constants for better code readability
                const targetFarmAddress       : address             = initFarmParams.targetFarmAddress;
                const farmInitConfig          : initFarmParamsType  = initFarmParams.farmConfig;

                // Find and get initFarm entrypoint of farm contract
                const initFarmEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%initFarm",
                    targetFarmAddress) : option(contract(initFarmParamsType))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_INIT_FARM_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND) : contract(initFarmParamsType))
                    ];

                // Create operation to init a farm
                const initFarmOperation : operation = Tezos.transaction(
                    (farmInitConfig),
                    0tez, 
                    initFarmEntrypoint
                );

                operations := initFarmOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function closeFarm(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   CloseFarm(farmAddress) -> {

                // Find and get closeFarm entrypoint of farm contract
                const closeFarmEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%closeFarm",
                    farmAddress) : option(contract(unit))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_CLOSE_FARM_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND) : contract(unit))
                    ];

                // Create operation to close a farm
                const closeFarmOperation : operation = Tezos.transaction(
                    (unit),
                    0tez, 
                    closeFarmEntrypoint
                );

                operations := closeFarmOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function createTreasury(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   CreateTreasury(createTreasuryParams) -> {

                // Find and get treasuryFactory contract address from the generalContracts map
                const treasuryFactoryAddress : address = getContractAddressFromGovernanceContract("treasuryFactory", s.governanceAddress, error_TREASURY_FACTORY_CONTRACT_NOT_FOUND);

                // Find and get createTreasury entrypoint of treasuryFactory contract
                const createTreasuryEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%createTreasury",
                    treasuryFactoryAddress) : option(contract(createTreasuryType))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_CREATE_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND) : contract(createTreasuryType))
                    ];

                // Create operation to create a new treasury
                const createTreasuryOperation : operation = Tezos.transaction(
                    (createTreasuryParams),
                    0tez, 
                    createTreasuryEntrypoint
                );

                operations := createTreasuryOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function transferTreasury(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   TransferTreasury(transferTreasuryParams) -> {

                // assign params to constants for better code readability
                const targetTreasuryAddress   : address               = transferTreasuryParams.targetTreasuryAddress;
                const treasuryTransfer        : transferActionType    = transferTreasuryParams.treasuryTransfer;


                // Find and get transfer entrypoint of treasury contract
                const transferEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%transfer",
                    targetTreasuryAddress) : option(contract(transferActionType))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(transferActionType))
                    ];

                // Create operation to make a transfer from a specified Treasury Contract
                const transferOperation : operation = Tezos.transaction(
                    (treasuryTransfer),
                    0tez, 
                    transferEntrypoint
                );

                operations := transferOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function updateMvkOperatorsTreasury(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   UpdateMvkOperatorsTreasury(updateMvkOperatorsTreasuryParams) -> {

                // assign params to constants for better code readability
                const targetTreasuryAddress   : address                  = updateMvkOperatorsTreasuryParams.targetTreasuryAddress;
                const updatedOperators        : updateOperatorsType    = updateMvkOperatorsTreasuryParams.treasuryUpdatedOperators;


                // Find and get update_operators entrypoint of treasury contract
                const updateEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%updateMvkOperators",
                    targetTreasuryAddress) : option(contract(updateOperatorsType))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_UPDATE_MVK_OPERATORS_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(updateOperatorsType))
                    ];

                // Create operation to update operators in a specified Treasury contract
                const updateOperation : operation = Tezos.transaction(
                    (updatedOperators),
                    0tez, 
                    updateEntrypoint
                );

                operations := updateOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function mintMvkAndTransferTreasury(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   MintMvkAndTransferTreasury(mintMvkAndTransferTreasuryParams) -> {

            // assign params to constants for better code readability
            const targetTreasuryAddress   : address                  = mintMvkAndTransferTreasuryParams.targetTreasuryAddress;
            const treasuryMint            : mintMvkAndTransferType   = mintMvkAndTransferTreasuryParams.treasuryMint;


            // Find and get mintMvkAndTransfer entrypoint of treasury contract
            const mintEntrypoint = case (Tezos.get_entrypoint_opt(
                "%mintMvkAndTransfer",
                targetTreasuryAddress) : option(contract(mintMvkAndTransferType))) of [
                        Some(contr) -> contr
                    |   None        -> (failwith(error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(mintMvkAndTransferType))
                ];

            // Create operation to mint MVK and transfer from a specified Treasury contract
            const mintOperation : operation = Tezos.transaction(
                (treasuryMint),
                0tez, 
                mintEntrypoint
            );

            operations := mintOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function stakeMvkTreasury(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   StakeMvkTreasury(stakeMvkTreasuryParams) -> {

                // assign params to constants for better code readability
                const targetTreasuryAddress   : address       = stakeMvkTreasuryParams.targetTreasuryAddress;
                const treasuryStake           : nat           = stakeMvkTreasuryParams.stakeAmount;

                // Find and get stake entrypoint of treasury contract
                const stakeEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%stakeMvk",
                    targetTreasuryAddress) : option(contract(nat))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_STAKE_MVK_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(nat))
                    ];

                // Create operation to stake MVK in a specified Treasury Contract
                const stakeOperation : operation = Tezos.transaction(
                    (treasuryStake),
                    0tez, 
                    stakeEntrypoint
                );

                operations := stakeOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function unstakeMvkTreasury(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   UnstakeMvkTreasury(unstakeMvkTreasuryParams) -> {

                // assign params to constants for better code readability
                const targetTreasuryAddress   : address       = unstakeMvkTreasuryParams.targetTreasuryAddress;
                const treasuryUnstake         : nat           = unstakeMvkTreasuryParams.unstakeAmount;


                // Find and get unstake entrypoint of treasury contract
                const unstakeEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%unstakeMvk",
                    targetTreasuryAddress) : option(contract(nat))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_UNSTAKE_MVK_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(nat))
                    ];

                // Create operation to unstake MVK in a specified Treasury Contract
                const unstakeOperation : operation = Tezos.transaction(
                    (treasuryUnstake),
                    0tez, 
                    unstakeEntrypoint
                );

                operations := unstakeOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function createAggregator(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   CreateAggregator(createAggregatorParams) -> {

                // Find and get aggregatorFactory contract address
                const aggregatorFactoryAddress : address = getContractAddressFromGovernanceContract("aggregatorFactory", s.governanceAddress, error_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND);

                // Find and get createAggregator entrypoint of aggregatorFactory contract
                const createAggregatorEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%createAggregator",
                    aggregatorFactoryAddress) : option(contract(createAggregatorParamsType))) of [
                            Some(contr) -> contr
                        |   None        -> (failwith(error_CREATE_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND) : contract(createAggregatorParamsType))
                    ];

                // Create operation to create a new aggregator
                const createAggregatorOperation : operation = Tezos.transaction(
                    (createAggregatorParams),
                    0tez, 
                    createAggregatorEntrypoint
                );

                operations := createAggregatorOperation # operations;

            }
        |   _ -> skip
    ]

} with (operations, s)



function trackContract(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   TrackContract(trackContractParams) -> {

                operations := case trackContractParams of [
                        TrackFarm (_v)          -> trackFarm(_v, operations, s)
                    |   TrackTreasury (_v)      -> trackTreasury(_v, operations, s)
                    |   TrackAggregator (_v)    -> trackAggregator(_v, operations, s)
                ]
            }
        |   _ -> skip
    ]

} with (operations, s)



function untrackContract(const executeAction : executeActionType; var s : governanceProxyNodeStorageType) : return is 
block {

    // verify that sender is admin or the Governance Contract address
    verifySenderIsAdminOrGovernance(s.admin, s.governanceAddress);

    var operations : list(operation) := nil;

    case executeAction of [
      
        |   UntrackContract(trackContractParams) -> {

                operations := case trackContractParams of [
                        UntrackFarm (_v)          -> untrackFarm(_v, operations, s)
                    |   UntrackTreasury (_v)      -> untrackTreasury(_v, operations, s)
                    |   UntrackAggregator (_v)    -> untrackAggregator(_v, operations, s)
                ]
            }
        |   _ -> skip
    ]

} with (operations, s)

// ------------------------------------------------------------------------------
// Gov Proxy Node Two Lambdas End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Governance Proxy Node Lambdas End
//
// ------------------------------------------------------------------------------