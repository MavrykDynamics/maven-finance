// ------------------------------------------------------------------------------
//
// Governance Proxy Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Basic Lambdas Begin
// ------------------------------------------------------------------------------

(* executeGovernanceLambdaProxy lambda *)
function executeGovernanceLambdaProxy(const executeAction : executeActionType; var s : governanceProxyStorage) : return is
block {
    
    checkSenderIsAdminOrGovernance(s);

    (* ids to match governanceLambdaIndex.json - id 0 is executeGovernanceLambdaProxy *)
    const id : nat = case executeAction of [
      
      (* Update Lambda Function *)    
      | UpdateProxyLambda (_v)                 -> 1n

      (* General Controls *)    
      | SetContractAdmin (_v)                  -> 2n
      | SetContractGovernance (_v)             -> 3n
      | SetContractLambda (_v)                 -> 4n
      | SetFactoryProductLambda (_v)           -> 5n
      | UpdateContractMetadata (_v)            -> 6n
      | UpdateContractWhitelistMap (_v)        -> 7n
      | UpdateContractGeneralMap (_v)          -> 8n
      | UpdateContractWhitelistTokenMap (_v)   -> 9n
      
      (* Update Configs *)    
      | UpdateGovernanceConfig (_v)            -> 10n
      | UpdateDelegationConfig (_v)            -> 11n
      | UpdateEmergencyConfig (_v)             -> 12n
      | UpdateBreakGlassConfig (_v)            -> 13n
      | UpdateCouncilConfig (_v)               -> 14n
      | UpdateFarmConfig (_v)                  -> 15n
      | UpdateDoormanMinMvkAmount (_v)         -> 16n

      (* Governance Control *)
      | UpdateWhitelistDevelopersSet (_v)      -> 17n
      | SetGovernanceProxy (_v)                -> 18n

      (* Farm Control *)
      | CreateFarm (_v)                        -> 19n
      | TrackFarm (_v)                         -> 20n
      | UntrackFarm (_v)                       -> 21n
      | InitFarm (_v)                          -> 22n
      | CloseFarm (_v)                         -> 23n

      (* Treasury Control *)
      | CreateTreasury (_v)                    -> 24n
      | TrackTreasury (_v)                     -> 25n
      | UntrackTreasury (_v)                   -> 26n
      | TransferTreasury (_v)                  -> 27n
      | MintMvkAndTransferTreasury (_v)        -> 28n

      (* MVK Token Control *)
      | UpdateMvkInflationRate (_v)            -> 29n
      | TriggerMvkInflation (_v)               -> 30n
    ];

    const lambdaBytes : bytes = case s.proxyLambdaLedger[id] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // reference: type governanceProxyLambdaFunctionType is (executeActionType * governanceProxyStorage) -> return
    const res : return = case (Bytes.unpack(lambdaBytes) : option(governanceProxyLambdaFunctionType)) of [
      | Some(f) -> f(executeAction, s)
      | None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];
  
} with (res.0, s)



(* updateProxyLambda lambda *)
function updateProxyLambda(const executeAction : executeActionType; var s : governanceProxyStorage) : return is
block {
    
    checkSenderIsAdminOrGovernance(s);

    case executeAction of [
        UpdateProxyLambda(params) -> {

            // assign params to constants for better code readability
            const lambdaId     : nat   = params.id;
            const lambdaBytes  : bytes = params.func_bytes;

            // allow override
            s.proxyLambdaLedger[lambdaId] := lambdaBytes

          }

      | _ -> skip
    ];

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Basic Lambdas End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Control Lambdas Begin
// ------------------------------------------------------------------------------

(* setContractAdmin lambda *)
function setContractAdmin(const executeAction : executeActionType; var s : governanceProxyStorage) : return is
block {
    
    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
        SetContractAdmin(setContractAdminParams) -> {

            // assign params to constants for better code readability
            const targetContractAddress  : address   = setContractAdminParams.targetContractAddress;
            const newAdminAddress        : address   = setContractAdminParams.newAdminAddress;

            // set new admin operation
            const setNewAdminOperation : operation = Tezos.transaction(
              newAdminAddress,
              0tez, 
              getSetAdminEntrypoint(targetContractAddress)
            );

            operations := setNewAdminOperation # operations;

          }

      | _ -> skip
    ];

} with (operations, s)



(* setContractGovernance lambda *)
function setContractGovernance(const executeAction : executeActionType; var s : governanceProxyStorage) : return is
block {
    
    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
        SetContractGovernance(setContractGovernanceParams) -> {

            // assign params to constants for better code readability
            const targetContractAddress  : address   = setContractGovernanceParams.targetContractAddress;
            const newGovernanceAddress   : address   = setContractGovernanceParams.newGovernanceAddress;

            // set new governance operation
            const setNewGovernanceOperation : operation = Tezos.transaction(
              newGovernanceAddress,
              0tez, 
              getSetGovernanceEntrypoint(targetContractAddress)
            );

            operations := setNewGovernanceOperation # operations;

          }

      | _ -> skip
    ];

} with (operations, s)



(* setContractLambda lambda *)
function setContractLambda(const executeAction : executeActionType; var s : governanceProxyStorage) : return is
block {
    
    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
        SetContractLambda(setContractLambdaParams) -> {

            // assign params to constants for better code readability
            const targetContractAddress   : address   = setContractLambdaParams.targetContractAddress;
            const targetLambdaName        : string    = setContractLambdaParams.name;
            const lambdaBytes             : bytes     = setContractLambdaParams.func_bytes;

            // Create setLambdaParam
            const setLambdaParams: setLambdaType      = record[
              name        = targetLambdaName;
              func_bytes  = lambdaBytes
            ];

            // set lambda operation
            const setLambdaOperation : operation = Tezos.transaction(
              setLambdaParams,
              0tez, 
              getSetLambdaEntrypoint(targetContractAddress)
            );

            operations := setLambdaOperation # operations;

          }

      | _ -> skip
    ];

} with (operations, s)



(* setFactoryProductLambda lambda *)
function setFactoryProductLambda(const executeAction : executeActionType; var s : governanceProxyStorage) : return is
block {
    
    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
        SetFactoryProductLambda(setContractLambdaParams) -> {

            // assign params to constants for better code readability
            const targetContractAddress   : address   = setContractLambdaParams.targetContractAddress;
            const targetLambdaName        : string    = setContractLambdaParams.name;
            const lambdaBytes             : bytes     = setContractLambdaParams.func_bytes;

            // Create setLambdaParam
            const setLambdaParams: setLambdaType      = record[
              name        = targetLambdaName;
              func_bytes  = lambdaBytes
            ];

            // set lambda operation
            const setLambdaOperation : operation = Tezos.transaction(
              setLambdaParams,
              0tez, 
              getSetProductLambdaEntrypoint(targetContractAddress)
            );

            operations := setLambdaOperation # operations;

          }

      | _ -> skip
    ];

} with (operations, s)



(* updateContractMetadata lambda *)
function updateContractMetadata(const executeAction : executeActionType; var s : governanceProxyStorage) : return is
block {
    
    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
        UpdateContractMetadata(updateContractMetadataParams) -> {

            // assign params to constants for better code readability
            const targetContractAddress  : address   = updateContractMetadataParams.targetContractAddress;
            const metadataKey            : string    = updateContractMetadataParams.metadataKey;
            const metadataHash           : bytes     = updateContractMetadataParams.metadataHash;

            const updateMetadataRecord : updateMetadataType = record [
                metadataKey  = metadataKey;
                metadataHash = metadataHash;
            ];

            // updateContractMetadata operation
            const updateContractMetadataOperation : operation = Tezos.transaction(
              updateMetadataRecord,
              0tez, 
              getUpdateMetadataEntrypoint(targetContractAddress)
            );

            operations := updateContractMetadataOperation # operations;

          }

      | _ -> skip
    ];

} with (operations, s)



(* updateContractWhitelistMap lambda *)
function updateContractWhitelistMap(const executeAction : executeActionType; var s : governanceProxyStorage) : return is
block {
    
    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
        UpdateContractWhitelistMap(updateContractWhitelistMapParams) -> {

            // assign params to constants for better code readability
            const targetContractAddress     : address   = updateContractWhitelistMapParams.targetContractAddress;
            const whitelistContractName     : string    = updateContractWhitelistMapParams.whitelistContractName;
            const whitelistContractAddress  : address   = updateContractWhitelistMapParams.whitelistContractAddress;

            const updateWhitelistMapRecord : updateWhitelistContractsParams = record [
                whitelistContractName    = whitelistContractName;
                whitelistContractAddress = whitelistContractAddress;
            ];

            // updateContractWhitelistMap operation
            const updateContractWhitelistMapOperation : operation = Tezos.transaction(
              updateWhitelistMapRecord,
              0tez, 
              getUpdateWhitelistContractsEntrypoint(targetContractAddress)
            );

            operations := updateContractWhitelistMapOperation # operations;

          }

      | _ -> skip
    ];

} with (operations, s)



(* updateContractGeneralMap lambda *)
function updateContractGeneralMap(const executeAction : executeActionType; var s : governanceProxyStorage) : return is
block {
    
    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
        UpdateContractGeneralMap(updateContractGeneralMapParams) -> {

            // assign params to constants for better code readability
            const targetContractAddress     : address   = updateContractGeneralMapParams.targetContractAddress;
            const generalContractName       : string    = updateContractGeneralMapParams.generalContractName;
            const generalContractAddress    : address   = updateContractGeneralMapParams.generalContractAddress;

            const updateGeneralMapRecord : updateGeneralContractsParams = record [
                generalContractName    = generalContractName;
                generalContractAddress = generalContractAddress;
            ];

            // updateContractGeneralMap operation
            const updateContractGeneralMapOperation : operation = Tezos.transaction(
              updateGeneralMapRecord,
              0tez, 
              getUpdateGeneralContractsEntrypoint(targetContractAddress)
            );

            operations := updateContractGeneralMapOperation # operations;

          }

      | _ -> skip
    ];

} with (operations, s)



(* updateContractWhitelistTokenMap lambda *)
function updateContractWhitelistTokenMap(const executeAction : executeActionType; var s : governanceProxyStorage) : return is
block {
    
    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
        UpdateContractWhitelistTokenMap(updateContractWhitelistTokenMapParams) -> {

            // assign params to constants for better code readability
            const targetContractAddress     : address   = updateContractWhitelistTokenMapParams.targetContractAddress;
            const tokenContractName         : string    = updateContractWhitelistTokenMapParams.tokenContractName;
            const tokenContractAddress      : address   = updateContractWhitelistTokenMapParams.tokenContractAddress;

            const updateWhitelistTokenMapRecord : updateWhitelistTokenContractsParams = record [
                tokenContractName    = tokenContractName;
                tokenContractAddress = tokenContractAddress;
            ];

            // updateContractWhitelistTokenMap operation
            const updateContractWhitelistTokenMapOperation : operation = Tezos.transaction(
              updateWhitelistTokenMapRecord,
              0tez, 
              getUpdateWhitelistTokenContractsEntrypoint(targetContractAddress)
            );

            operations := updateContractWhitelistTokenMapOperation # operations;

          }

      | _ -> skip
    ];

} with (operations, s)

// ------------------------------------------------------------------------------
// General Control Lambdas End
// ------------------------------------------------------------------------------


function updateGovernanceConfig(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      UpdateGovernanceConfig(params) -> {

        // find and get updateConfig entrypoint of governance contract
        const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateConfig",
            s.governanceAddress) : option(contract(nat * governanceUpdateConfigActionType))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(nat * governanceUpdateConfigActionType))
            ];

        // assign params to constants for better code readability
        const updateConfigAction   = params.updateConfigAction;
        const updateConfigNewValue = params.updateConfigNewValue;

        // update governance config operation
        const updateGovernanceConfigOperation : operation = Tezos.transaction(
          (updateConfigNewValue, updateConfigAction),
          0tez, 
          updateConfigEntrypoint
          );

        operations := updateGovernanceConfigOperation # operations;

        }
    | _ -> skip
    ]

} with (operations, s)



function updateDelegationConfig(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UpdateDelegationConfig(params) -> {

        // find and get delegation contract address from the generalContracts big map
        const delegationAddress : address = case s.generalContracts["delegation"] of [
              Some(_address) -> _address
            | None           -> failwith(error_DELEGATION_CONTRACT_NOT_FOUND)
        ];

        // find and get updateConfig entrypoint of delegation contract
        const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateConfig",
            delegationAddress) : option(contract(nat * delegationUpdateConfigActionType))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_DELEGATION_CONTRACT_NOT_FOUND) : contract(nat * delegationUpdateConfigActionType))
            ];

        // assign params to constants for better code readability
        const updateConfigAction   = params.updateConfigAction;
        const updateConfigNewValue = params.updateConfigNewValue;

        // update delegation config operation
        const updateDelegationConfigOperation : operation = Tezos.transaction(
          (updateConfigNewValue, updateConfigAction),
          0tez, 
          updateConfigEntrypoint
          );

        operations := updateDelegationConfigOperation # operations;

        }
    | _ -> skip
    ]

} with (operations, s)



function updateEmergencyConfig(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UpdateEmergencyConfig(params) -> {

        // find and get emergency governance contract address from the generalContracts big map
        const emergencyAddress : address = case s.generalContracts["emergencyGovernance"] of [
              Some(_address) -> _address
            | None           -> failwith(error_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND)
        ];

        // find and get updateConfig entrypoint of emergency governance contract
        const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateConfig",
            emergencyAddress) : option(contract(nat * emergencyUpdateConfigActionType))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(nat * emergencyUpdateConfigActionType))
            ];

        // assign params to constants for better code readability
        const updateConfigAction   = params.updateConfigAction;
        const updateConfigNewValue = params.updateConfigNewValue;

        // update emergency governance config operation
        const updateEmergencyConfigOperation : operation = Tezos.transaction(
          (updateConfigNewValue, updateConfigAction),
          0tez, 
          updateConfigEntrypoint
          );

        operations := updateEmergencyConfigOperation # operations;

        }
    | _ -> skip
    ]

} with (operations, s)



function updateCouncilConfig(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UpdateCouncilConfig(params) -> {

        // find and get council contract address from the generalContracts big map
        const councilAddress : address = case s.generalContracts["council"] of [
              Some(_address) -> _address
            | None           -> failwith(error_COUNCIL_CONTRACT_NOT_FOUND)
        ];

        // find and get updateConfig entrypoint of council contract
        const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateConfig",
            councilAddress) : option(contract(nat * councilUpdateConfigActionType))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_COUNCIL_CONTRACT_NOT_FOUND) : contract(nat * councilUpdateConfigActionType))
            ];

        // assign params to constants for better code readability
        const updateConfigAction   = params.updateConfigAction;
        const updateConfigNewValue = params.updateConfigNewValue;

        // update council config operation
        const updateCouncilConfigOperation : operation = Tezos.transaction(
          (updateConfigNewValue, updateConfigAction),
          0tez, 
          updateConfigEntrypoint
          );

        operations := updateCouncilConfigOperation # operations;

        }
    | _ -> skip
    ]

} with (operations, s)



function updateFarmConfig(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UpdateFarmConfig(params) -> {

        // assign params to constants for better code readability
        const farmAddress           = params.targetFarmAddress;
        const updateConfigAction    = params.farmConfig.updateConfigAction;
        const updateConfigNewValue  = params.farmConfig.updateConfigNewValue;

        // find and get updateConfig entrypoint of farm contract
        const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateConfig",
            farmAddress) : option(contract(nat * farmUpdateConfigActionType))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND) : contract(nat * farmUpdateConfigActionType))
            ];

        // update farm config operation
        const updateFarmConfigOperation : operation = Tezos.transaction(
          (updateConfigNewValue, updateConfigAction),
          0tez, 
          updateConfigEntrypoint
          );

        operations := updateFarmConfigOperation # operations;

        }
    | _ -> skip
    ]

} with (operations, s)



function updateBreakGlassConfig(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UpdateBreakGlassConfig(params) -> {

        // find and get break glass contract address from the generalContracts big map
        const breakGlassAddress : address = case s.generalContracts["breakGlass"] of [
              Some(_address) -> _address
            | None           -> failwith(error_BREAK_GLASS_CONTRACT_NOT_FOUND)
        ];

        // find and get updateConfig entrypoint of break glass contract
        const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateConfig",
            breakGlassAddress) : option(contract(nat * breakGlassUpdateConfigActionType))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_BREAK_GLASS_CONTRACT_NOT_FOUND) : contract(nat * breakGlassUpdateConfigActionType))
            ];

        // assign params to constants for better code readability
        const updateConfigAction   = params.updateConfigAction;
        const updateConfigNewValue = params.updateConfigNewValue;

        // update break glass config operation
        const updateBreakGlassConfigOperation : operation = Tezos.transaction(
          (updateConfigNewValue, updateConfigAction),
          0tez, 
          updateConfigEntrypoint
          );

        operations := updateBreakGlassConfigOperation # operations;

        }
    | _ -> skip
    ]

} with (operations, s)



function updateDoormanMinMvkAmount(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UpdateDoormanMinMvkAmount(newMinMvkAmount) -> {

        // find and get doorman contract address from the generalContracts map
        const doormanAddress : address = case s.generalContracts["doorman"] of [
              Some(_address) -> _address
            | None           -> failwith(error_DOORMAN_CONTRACT_NOT_FOUND)
        ];

        // find and get updateConfig entrypoint of farm contract
        const updateMinMvkAmountEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateMinMvkAmount",
            doormanAddress) : option(contract(nat))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_UPDATE_MIN_MVK_AMOUNT_ENTRYPOINT_IN_DOORMAN_CONTRACT_NOT_FOUND) : contract(nat))
            ];

        // update farm config operation
        const updateDoormanConfigOperation : operation = Tezos.transaction(
          (newMinMvkAmount),
          0tez, 
          updateMinMvkAmountEntrypoint
          );

        operations := updateDoormanConfigOperation # operations;

        }
    | _ -> skip
    ]

} with (operations, s)



function updateWhitelistDevelopersSet(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UpdateWhitelistDevelopersSet(developer) -> {

        // find and get updateConfig entrypoint of delegation contract
        const updateWhitelistDevelopersSetEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateWhitelistDevelopers",
            s.governanceAddress) : option(contract(address))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_UPDATE_WHITELIST_DEVELOPERS_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(address))
            ];

        // update delegation config operation
        const updateWhitelistDevelopersSetOperation : operation = Tezos.transaction(
          (developer),
          0tez, 
          updateWhitelistDevelopersSetEntrypoint
          );

        operations := updateWhitelistDevelopersSetOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



function setGovernanceProxy(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      SetGovernanceProxy(newGovernanceProxyAddress) -> {

        // find and get setGovernanceProxy entrypoint of governance contract
        const setGovernanceProxyEntrypoint = case (Tezos.get_entrypoint_opt(
            "%setGovernanceProxy",
            s.governanceAddress) : option(contract(address))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_SET_GOVERNANCE_PROXY_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(address))
            ];

        // set governance proxy operation
        const setGovernanceProxyOperation : operation = Tezos.transaction(
          (newGovernanceProxyAddress),
          0tez, 
          setGovernanceProxyEntrypoint
          );

        operations := setGovernanceProxyOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



function createFarm(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      CreateFarm(createFarmParams) -> {

        // find and get farmFactory contract address from the generalContracts map
        const farmFactoryAddress : address = case s.generalContracts["farmFactory"] of [
              Some(_address) -> _address
            | None           -> failwith(error_FARM_FACTORY_CONTRACT_NOT_FOUND)
        ];

        // find and get createFarm entrypoint of farmFactory contract
        const createFarmEntrypoint = case (Tezos.get_entrypoint_opt(
            "%createFarm",
            farmFactoryAddress) : option(contract(createFarmType))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_CREATE_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND) : contract(createFarmType))
            ];

        // create a farm
        const createFarmOperation : operation = Tezos.transaction(
          (createFarmParams),
          0tez, 
          createFarmEntrypoint
          );

        operations := createFarmOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



function trackFarm(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      TrackFarm(trackFarmParams) -> {

        // find and get farmFactory contract address from the generalContracts map
        const farmFactoryAddress : address = case s.generalContracts["farmFactory"] of [
              Some(_address) -> _address
            | None           -> failwith(error_FARM_FACTORY_CONTRACT_NOT_FOUND)
        ];

        // find and get trackFarm entrypoint of farmFactory contract
        const trackFarmEntrypoint = case (Tezos.get_entrypoint_opt(
            "%trackFarm",
            farmFactoryAddress) : option(contract(address))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_TRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND) : contract(address))
            ];

        // track a farm
        const trackFarmOperation : operation = Tezos.transaction(
          (trackFarmParams),
          0tez, 
          trackFarmEntrypoint
          );

        operations := trackFarmOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



function untrackFarm(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UntrackFarm(untrackFarmParams) -> {

        // find and get farmFactory contract address from the generalContracts map
        const farmFactoryAddress : address = case s.generalContracts["farmFactory"] of [
              Some(_address) -> _address
            | None           -> failwith(error_FARM_FACTORY_CONTRACT_NOT_FOUND)
        ];

        // find and get untrack entrypoint of farmFactory contract
        const untrackFarmEntrypoint = case (Tezos.get_entrypoint_opt(
            "%untrackFarm",
            farmFactoryAddress) : option(contract(address))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_UNTRACK_FARM_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND) : contract(address))
            ];

        // untrack a farm
        const untrackFarmOperation : operation = Tezos.transaction(
          (untrackFarmParams),
          0tez, 
          untrackFarmEntrypoint
          );

        operations := untrackFarmOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



function initFarm(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      InitFarm(initFarmParams) -> {

        // assign params to constants for better code readability
        const targetFarmAddress       : address             = initFarmParams.targetFarmAddress;
        const farmInitConfig          : initFarmParamsType  = initFarmParams.farmConfig;

        // find and get initFarm entrypoint of farm contract
        const initFarmEntrypoint = case (Tezos.get_entrypoint_opt(
            "%initFarm",
            targetFarmAddress) : option(contract(initFarmParamsType))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_INIT_FARM_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND) : contract(initFarmParamsType))
            ];

        // init a farm
        const initFarmOperation : operation = Tezos.transaction(
          (farmInitConfig),
          0tez, 
          initFarmEntrypoint
          );

        operations := initFarmOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



function closeFarm(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      CloseFarm(farmAddress) -> {

        // find and get closeFarm entrypoint of farm contract
        const closeFarmEntrypoint = case (Tezos.get_entrypoint_opt(
            "%closeFarm",
            farmAddress) : option(contract(unit))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_CLOSE_FARM_ENTRYPOINT_IN_FARM_CONTRACT_NOT_FOUND) : contract(unit))
            ];

        // close a farm
        const closeFarmOperation : operation = Tezos.transaction(
          (unit),
          0tez, 
          closeFarmEntrypoint
          );

        operations := closeFarmOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



function createTreasury(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      CreateTreasury(createTreasuryParams) -> {

        // find and get treasuryFactory contract address from the generalContracts map
        const treasuryFactoryAddress : address = case s.generalContracts["treasuryFactory"] of [
              Some(_address) -> _address
            | None           -> failwith(error_TREASURY_FACTORY_CONTRACT_NOT_FOUND)
        ];

        // find and get createTreasury entrypoint of treasuryFactory contract
        const createTreasuryEntrypoint = case (Tezos.get_entrypoint_opt(
            "%createTreasury",
            treasuryFactoryAddress) : option(contract(bytes))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_CREATE_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND) : contract(bytes))
            ];

        // create a new treasury
        const createTreasuryOperation : operation = Tezos.transaction(
          (createTreasuryParams),
          0tez, 
          createTreasuryEntrypoint
          );

        operations := createTreasuryOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



function trackTreasury(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      TrackTreasury(trackTreasuryParams) -> {

        // find and get treasuryFactory contract address from the generalContracts map
        const treasuryFactoryAddress : address = case s.generalContracts["treasuryFactory"] of [
              Some(_address) -> _address
            | None           -> failwith(error_TREASURY_FACTORY_CONTRACT_NOT_FOUND)
        ];

        // find and get trackTreasury entrypoint of treasuryFactory contract
        const trackTreasuryEntrypoint = case (Tezos.get_entrypoint_opt(
            "%trackTreasury",
            treasuryFactoryAddress) : option(contract(address))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_TRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND) : contract(address))
            ];

        // track a treasury
        const trackTreasuryOperation : operation = Tezos.transaction(
          (trackTreasuryParams),
          0tez, 
          trackTreasuryEntrypoint
          );

        operations := trackTreasuryOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



function untrackTreasury(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UntrackTreasury(untrackTreasuryParams) -> {

        // find and get treasuryFactory contract address from the generalContracts map
        const treasuryFactoryAddress : address = case s.generalContracts["treasuryFactory"] of [
              Some(_address) -> _address
            | None           -> failwith(error_TREASURY_FACTORY_CONTRACT_NOT_FOUND)
        ];

        // find and get untrackTreasury entrypoint of treasuryFactory contract
        const untrackTreasuryEntrypoint = case (Tezos.get_entrypoint_opt(
            "%untrackTreasury",
            treasuryFactoryAddress) : option(contract(address))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_UNTRACK_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND) : contract(address))
            ];

        // untrack a treasury
        const untrackTreasuryOperation : operation = Tezos.transaction(
          (untrackTreasuryParams),
          0tez, 
          untrackTreasuryEntrypoint
          );

        operations := untrackTreasuryOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



function transferTreasury(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      TransferTreasury(transferTreasuryParams) -> {

        // assign params to constants for better code readability
        const targetTreasuryAddress   : address               = transferTreasuryParams.targetTreasuryAddress;
        const treasuryTransfer        : transferActionType    = transferTreasuryParams.treasuryTransfer;


        // find and get transfer entrypoint of treasury contract
        const transferEntrypoint = case (Tezos.get_entrypoint_opt(
            "%transfer",
            targetTreasuryAddress) : option(contract(transferActionType))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(transferActionType))
            ];

        // transfer operation
        const transferOperation : operation = Tezos.transaction(
          (treasuryTransfer),
          0tez, 
          transferEntrypoint
          );

        operations := transferOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



function mintMvkAndTransferTreasury(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      MintMvkAndTransferTreasury(mintMvkAndTransferTreasuryParams) -> {

        // assign params to constants for better code readability
        const targetTreasuryAddress   : address                  = mintMvkAndTransferTreasuryParams.targetTreasuryAddress;
        const treasuryMint            : mintMvkAndTransferType   = mintMvkAndTransferTreasuryParams.treasuryMint;


        // find and get mintMvkAndTransfer entrypoint of treasury contract
        const mintEntrypoint = case (Tezos.get_entrypoint_opt(
            "%mintMvkAndTransfer",
            targetTreasuryAddress) : option(contract(mintMvkAndTransferType))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(mintMvkAndTransferType))
            ];

        // mint MVK and transfer operation
        const mintOperation : operation = Tezos.transaction(
          (treasuryMint),
          0tez, 
          mintEntrypoint
          );

        operations := mintOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



function updateMvkInflationRate(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UpdateMvkInflationRate(newInflationRate) -> {

        // find and get updateInflationRate entrypoint of MVK Token contract
        const updateInflationRateEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateInflationRate",
            s.mvkTokenAddress) : option(contract(nat))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_UPDATE_INFLATION_RATE_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : contract(nat))
            ];

        // untrack a treasury
        const updateInflationRateOperation : operation = Tezos.transaction(
          (newInflationRate),
          0tez, 
          updateInflationRateEntrypoint
          );

        operations := updateInflationRateOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



function triggerMvkInflation(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      TriggerMvkInflation(_parameter) -> {

        // find and get updateInflationRate entrypoint of MVK Token contract
        const triggerInflationEntrypoint = case (Tezos.get_entrypoint_opt(
            "%triggerInflation",
            s.mvkTokenAddress) : option(contract(unit))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_TRIGGER_INFLATION_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : contract(unit))
            ];

        // untrack a treasury
        const triggerInflationOperation : operation = Tezos.transaction(
          (unit),
          0tez, 
          triggerInflationEntrypoint
          );

        operations := triggerInflationOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



// ------------------------------------------------------------------------------
//
// Governance Proxy Lambdas End
//
// ------------------------------------------------------------------------------