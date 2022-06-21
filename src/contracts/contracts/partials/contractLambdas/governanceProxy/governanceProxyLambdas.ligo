// ------------------------------------------------------------------------------
//
// Governance Proxy Lambdas Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Lambdas Begin
// ------------------------------------------------------------------------------

(* setAdmin lambda *)
function lambdaSetAdmin(const governanceProxyLambdaAction : governanceProxyLambdaActionType; var s : governanceProxyStorage) : return is
block {
    
    checkNoAmount(Unit);   // entrypoint should not receive any tez amount  
    checkSenderIsAllowed(s); 

    case governanceProxyLambdaAction of [
        | LambdaSetAdmin(newAdminAddress) -> {
                s.admin := newAdminAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(*  setGovernance lambda *)
function lambdaSetGovernance(const governanceProxyLambdaAction : governanceProxyLambdaActionType; var s : governanceProxyStorage) : return is
block {
    
    checkSenderIsAllowed(s);

    case governanceProxyLambdaAction of [
        | LambdaSetGovernance(newGovernanceAddress) -> {
                s.governanceAddress := newGovernanceAddress;
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateMetadata lambda - update the metadata at a given key *)
function lambdaUpdateMetadata(const governanceProxyLambdaAction : governanceProxyLambdaActionType; var s : governanceProxyStorage) : return is
block {

    checkSenderIsAdmin(s);
    
    case governanceProxyLambdaAction of [
        | LambdaUpdateMetadata(updateMetadataParams) -> {
                
                const metadataKey   : string = updateMetadataParams.metadataKey;
                const metadataHash  : bytes  = updateMetadataParams.metadataHash;
                
                s.metadata  := Big_map.update(metadataKey, Some (metadataHash), s.metadata);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistContracts lambda *)
function lambdaUpdateWhitelistContracts(const governanceProxyLambdaAction : governanceProxyLambdaActionType; var s: governanceProxyStorage): return is
block {
    
    checkSenderIsAdmin(s);
    
    case governanceProxyLambdaAction of [
        | LambdaUpdateWhitelistContracts(updateWhitelistContractsParams) -> {
                s.whitelistContracts := updateWhitelistContractsMap(updateWhitelistContractsParams, s.whitelistContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateGeneralContracts lambda *)
function lambdaUpdateGeneralContracts(const governanceProxyLambdaAction : governanceProxyLambdaActionType; var s: governanceProxyStorage): return is
block {

    checkSenderIsAdmin(s);
    
    case governanceProxyLambdaAction of [
        | LambdaUpdateGeneralContracts(updateGeneralContractsParams) -> {
                s.generalContracts := updateGeneralContractsMap(updateGeneralContractsParams, s.generalContracts);
            }
        | _ -> skip
    ];

} with (noOperations, s)



(* updateWhitelistTokenContracts lambda *)
function lambdaUpdateWhitelistTokenContracts(const governanceProxyLambdaAction : governanceProxyLambdaActionType; var s: governanceProxyStorage): return is
block {

    checkSenderIsAdmin(s);

    case governanceProxyLambdaAction of [
        | LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams) -> {
                s.whitelistTokenContracts := updateWhitelistTokenContractsMap(updateWhitelistTokenContractsParams, s.whitelistTokenContracts);
            }
        | _ -> skip
    ];


} with (noOperations, s)



(*  mistakenTransfer lambda *)
function lambdaMistakenTransfer(const governanceProxyLambdaAction : governanceProxyLambdaActionType; var s: governanceProxyStorage): return is
block {

    var operations : list(operation) := nil;

    case governanceProxyLambdaAction of [
        | LambdaMistakenTransfer(destinationParams) -> {

                // Check if the sender is the governanceSatellite contract
                checkSenderIsAdminOrGovernanceSatelliteContract(s);

                // Create transfer operations
                function transferOperationFold(const transferParam: transferDestinationType; const operationList: list(operation)): list(operation) is
                  block{
                    // Check if token is not MVK (it would break SMVK) before creating the transfer operation
                    const transferTokenOperation : operation = case transferParam.token of [
                        | Tez         -> transferTez((Tezos.get_contract_with_error(transferParam.to_, "Error. Contract not found at given address"): contract(unit)), transferParam.amount * 1mutez)
                        | Fa12(token) -> transferFa12Token(Tezos.self_address, transferParam.to_, transferParam.amount, token)
                        | Fa2(token)  -> transferFa2Token(Tezos.self_address, transferParam.to_, transferParam.amount, token.tokenId, token.tokenContractAddress)
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
      | UpdateContractName (_v)                -> 10n
      
      (* Update Configs *)    
      | UpdateGovernanceConfig (_v)            -> 11n
      | UpdateGovernanceFinancialConfig (_v)   -> 12n
      | UpdateDelegationConfig (_v)            -> 13n
      | UpdateEmergencyConfig (_v)             -> 14n
      | UpdateBreakGlassConfig (_v)            -> 15n
      | UpdateCouncilConfig (_v)               -> 16n
      | UpdateFarmConfig (_v)                  -> 17n
      | UpdateFarmFactoryConfig (_v)           -> 18n
      | UpdateTreasuryFactoryConfig (_v)       -> 19n
      | UpdateDoormanMinMvkAmount (_v)         -> 20n

      (* Governance Control *)
      | UpdateWhitelistDevelopersSet (_v)      -> 21n
      | SetGovernanceProxy (_v)                -> 22n

      (* Farm Control *)
      | CreateFarm (_v)                        -> 23n
      | TrackFarm (_v)                         -> 24n
      | UntrackFarm (_v)                       -> 25n
      | InitFarm (_v)                          -> 26n
      | CloseFarm (_v)                         -> 27n

      (* Treasury Control *)
      | CreateTreasury (_v)                    -> 28n
      | TrackTreasury (_v)                     -> 29n
      | UntrackTreasury (_v)                   -> 30n
      | TransferTreasury (_v)                  -> 31n
      | MintMvkAndTransferTreasury (_v)        -> 32n
      | UpdateMvkOperatorsTreasury (_v)        -> 33n
      | StakeMvkTreasury (_v)                  -> 34n
      | UnstakeMvkTreasury (_v)                -> 35n

      (* Aggregator Control *)
      | CreateAggregator (_v)                  -> 35n
      | TrackAggregator (_v)                   -> 36n
      | UntrackAggregator (_v)                 -> 37n

      (* MVK Token Control *)
      | UpdateMvkInflationRate (_v)            -> 38n
      | TriggerMvkInflation (_v)               -> 39n

      (* Vesting Control *)
      | AddVestee (_v)                         -> 40n
      | RemoveVestee (_v)                      -> 41n
      | UpdateVestee (_v)                      -> 42n
      | ToggleVesteeLock (_v)                  -> 43n
    ];

    const lambdaBytes : bytes = case s.proxyLambdaLedger[id] of [
      | Some(_v) -> _v
      | None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // reference: type governanceProxyProxyLambdaFunctionType is (executeActionType * governanceProxyStorage) -> return
    const res : return = case (Bytes.unpack(lambdaBytes) : option(governanceProxyProxyLambdaFunctionType)) of [
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



(* updateContractName lambda *)
function updateContractName(const executeAction : executeActionType; var s : governanceProxyStorage) : return is
block {
    
    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
        UpdateContractName(updateContractNameParams) -> {

            // assign params to constants for better code readability
            const targetContractAddress     : address   = updateContractNameParams.targetContractAddress;
            const updatedName               : string    = updateContractNameParams.contractName;

            // updateName operation
            const updateNameOperation : operation = Tezos.transaction(
              updatedName,
              0tez, 
              getUpdateContractNameEntrypoint(targetContractAddress)
            );

            operations := updateNameOperation # operations;

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



function updateGovernanceFinancialConfig(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      UpdateGovernanceFinancialConfig(params) -> {

        // find and get governanceFinancial contract address from the generalContracts big map
        const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "governanceFinancial", s.governanceAddress);
        const governanceFinancialAddress: address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_GOVERNANCE_FINANCIAL_CONTRACT_NOT_FOUND)
                ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
        ];

        // find and get updateConfig entrypoint of governance contract
        const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateConfig",
            governanceFinancialAddress) : option(contract(nat * governanceFinancialUpdateConfigActionType))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(nat * governanceFinancialUpdateConfigActionType))
            ];

        // assign params to constants for better code readability
        const updateConfigAction   = params.updateConfigAction;
        const updateConfigNewValue = params.updateConfigNewValue;

        // update governance financial config operation
        const updateGovernanceFinancialConfigOperation : operation = Tezos.transaction(
          (updateConfigNewValue, updateConfigAction),
          0tez, 
          updateConfigEntrypoint
          );

        operations := updateGovernanceFinancialConfigOperation # operations;

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
        const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "delegation", s.governanceAddress);
        const delegationAddress: address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_DELEGATION_CONTRACT_NOT_FOUND)
                ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
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
        const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "emergencyGovernance", s.governanceAddress);
        const emergencyAddress: address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND)
                ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
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
        const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "council", s.governanceAddress);
        const councilAddress: address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_COUNCIL_CONTRACT_NOT_FOUND)
                ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
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



function updateFarmFactoryConfig(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UpdateFarmFactoryConfig(params) -> {

        // find and get farm factory contract address from the generalContracts big map
        const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "farmFactory", s.governanceAddress);
        const farmFactoryAddress: address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_FARM_FACTORY_CONTRACT_NOT_FOUND)
                ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
        ];

        // assign params to constants for better code readability
        const updateConfigAction    = params.updateConfigAction;
        const updateConfigNewValue  = params.updateConfigNewValue;

        // find and get updateConfig entrypoint of farm factory contract
        const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateConfig",
            farmFactoryAddress) : option(contract(nat * farmFactoryUpdateConfigActionType))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_FARM_FACTORY_CONTRACT_NOT_FOUND) : contract(nat * farmFactoryUpdateConfigActionType))
            ];

        // update farm factory config operation
        const updateFarmFactoryConfigOperation : operation = Tezos.transaction(
          (updateConfigNewValue, updateConfigAction),
          0tez, 
          updateConfigEntrypoint
          );

        operations := updateFarmFactoryConfigOperation # operations;

        }
    | _ -> skip
    ]

} with (operations, s)



function updateTreasuryFactoryConfig(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UpdateTreasuryFactoryConfig(params) -> {

        // find and get treasury factory contract address from the generalContracts big map
        const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "treasuryFactory", s.governanceAddress);
        const treasuryFactoryAddress: address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_TREASURY_FACTORY_CONTRACT_NOT_FOUND)
                ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
        ];

        // assign params to constants for better code readability
        const updateConfigAction    = params.updateConfigAction;
        const updateConfigNewValue  = params.updateConfigNewValue;

        // find and get updateConfig entrypoint of farm factory contract
        const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateConfig",
            treasuryFactoryAddress) : option(contract(nat * treasuryFactoryUpdateConfigActionType))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_UPDATE_CONFIG_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND) : contract(nat * treasuryFactoryUpdateConfigActionType))
            ];

        // update farm factory config operation
        const updateTreasuryFactoryConfigOperation : operation = Tezos.transaction(
          (updateConfigNewValue, updateConfigAction),
          0tez, 
          updateConfigEntrypoint
          );

        operations := updateTreasuryFactoryConfigOperation # operations;

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
        const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "breakGlass", s.governanceAddress);
        const breakGlassAddress: address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_BREAK_GLASS_CONTRACT_NOT_FOUND)
                ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
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
        const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "doorman", s.governanceAddress);
        const doormanAddress: address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_DOORMAN_CONTRACT_NOT_FOUND)
                ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
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
        const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "farmFactory", s.governanceAddress);
        const farmFactoryAddress: address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_FARM_FACTORY_CONTRACT_NOT_FOUND)
                ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
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
        const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "farmFactory", s.governanceAddress);
        const farmFactoryAddress: address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_FARM_FACTORY_CONTRACT_NOT_FOUND)
                ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
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
        const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "farmFactory", s.governanceAddress);
        const farmFactoryAddress: address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_FARM_FACTORY_CONTRACT_NOT_FOUND)
                ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
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
        const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "treasuryFactory", s.governanceAddress);
        const treasuryFactoryAddress: address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_TREASURY_FACTORY_CONTRACT_NOT_FOUND)
                ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
        ];

        // find and get createTreasury entrypoint of treasuryFactory contract
        const createTreasuryEntrypoint = case (Tezos.get_entrypoint_opt(
            "%createTreasury",
            treasuryFactoryAddress) : option(contract(createTreasuryType))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_CREATE_TREASURY_ENTRYPOINT_IN_TREASURY_FACTORY_CONTRACT_NOT_FOUND) : contract(createTreasuryType))
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
        const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "treasuryFactory", s.governanceAddress);
        const treasuryFactoryAddress: address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_TREASURY_FACTORY_CONTRACT_NOT_FOUND)
                ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
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
        const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "treasuryFactory", s.governanceAddress);
        const treasuryFactoryAddress: address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_TREASURY_FACTORY_CONTRACT_NOT_FOUND)
                ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
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



function updateMvkOperatorsTreasury(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UpdateMvkOperatorsTreasury(updateMvkOperatorsTreasuryParams) -> {

        // assign params to constants for better code readability
        const targetTreasuryAddress   : address                  = updateMvkOperatorsTreasuryParams.targetTreasuryAddress;
        const updatedOperators        : updateOperatorsParams    = updateMvkOperatorsTreasuryParams.treasuryUpdatedOperators;


        // find and get update_operators entrypoint of treasury contract
        const updateEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateMvkOperators",
            targetTreasuryAddress) : option(contract(updateOperatorsParams))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_UPDATE_MVK_OPERATORS_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(updateOperatorsParams))
            ];

        // update operators operation
        const updateOperation : operation = Tezos.transaction(
          (updatedOperators),
          0tez, 
          updateEntrypoint
          );

        operations := updateOperation # operations;

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



function stakeMvkTreasury(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      StakeMvkTreasury(stakeMvkTreasuryParams) -> {

        // assign params to constants for better code readability
        const targetTreasuryAddress   : address       = stakeMvkTreasuryParams.targetTreasuryAddress;
        const treasuryStake           : nat           = stakeMvkTreasuryParams.stakeAmount;


        // find and get stake entrypoint of treasury contract
        const stakeEntrypoint = case (Tezos.get_entrypoint_opt(
            "%stakeMvk",
            targetTreasuryAddress) : option(contract(nat))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_STAKE_MVK_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(nat))
            ];

        // stake MVK operation
        const stakeOperation : operation = Tezos.transaction(
          (treasuryStake),
          0tez, 
          stakeEntrypoint
          );

        operations := stakeOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



function unstakeMvkTreasury(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UnstakeMvkTreasury(unstakeMvkTreasuryParams) -> {

        // assign params to constants for better code readability
        const targetTreasuryAddress   : address       = unstakeMvkTreasuryParams.targetTreasuryAddress;
        const treasuryUnstake         : nat           = unstakeMvkTreasuryParams.unstakeAmount;


        // find and get unstake entrypoint of treasury contract
        const unstakeEntrypoint = case (Tezos.get_entrypoint_opt(
            "%unstakeMvk",
            targetTreasuryAddress) : option(contract(nat))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_UNSTAKE_MVK_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(nat))
            ];

        // unstake MVK operation
        const unstakeOperation : operation = Tezos.transaction(
          (treasuryUnstake),
          0tez, 
          unstakeEntrypoint
          );

        operations := unstakeOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



function createAggregator(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      CreateAggregator(createAggregatorParams) -> {

                // find and get aggregatorFactory contract address
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "aggregatorFactory", s.governanceAddress);
                const aggregatorFactoryAddress: address = case generalContractsOptView of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_TREASURY_FACTORY_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // find and get createAggregator entrypoint of aggregatorFactory contract
                const createAggregatorEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%createAggregator",
                    aggregatorFactoryAddress) : option(contract(createAggregatorParamsType))) of [
                          Some(contr) -> contr
                        | None        -> (failwith(error_CREATE_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND) : contract(createAggregatorParamsType))
                    ];

                // create a new aggregator
                const createAggregatorOperation : operation = Tezos.transaction(
                    (createAggregatorParams),
                    0tez, 
                    createAggregatorEntrypoint
                  );

                operations := createAggregatorOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



function trackAggregator(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      TrackAggregator(trackAggregatorParams) -> {

                // find and get aggregatorFactory contract address
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "aggregatorFactory", s.governanceAddress);
                const aggregatorFactoryAddress: address = case generalContractsOptView of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_TREASURY_FACTORY_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // find and get trackAggregator entrypoint of aggregatorFactory contract
                const trackAggregatorEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%trackAggregator",
                    aggregatorFactoryAddress) : option(contract(trackAggregatorParamsType))) of [
                          Some(contr) -> contr
                        | None        -> (failwith(error_TRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND) : contract(trackAggregatorParamsType))
                    ];

                // track aggregator
                const trackAggregatorOperation : operation = Tezos.transaction(
                    (trackAggregatorParams),
                    0tez, 
                    trackAggregatorEntrypoint
                  );

                operations := trackAggregatorOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



function untrackAggregator(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UntrackAggregator(untrackAggregatorParams) -> {

                // find and get aggregatorFactory contract address
                const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "aggregatorFactory", s.governanceAddress);
                const aggregatorFactoryAddress: address = case generalContractsOptView of [
                    Some (_optionContract) -> case _optionContract of [
                            Some (_contract)    -> _contract
                        |   None                -> failwith (error_TREASURY_FACTORY_CONTRACT_NOT_FOUND)
                        ]
                |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
                ];

                // find and get trackAggregator entrypoint of aggregatorFactory contract
                const untrackAggregatorEntrypoint = case (Tezos.get_entrypoint_opt(
                    "%untrackAggregator",
                    aggregatorFactoryAddress) : option(contract(untrackAggregatorParamsType))) of [
                          Some(contr) -> contr
                        | None        -> (failwith(error_UNTRACK_AGGREGATOR_ENTRYPOINT_IN_AGGREGATOR_FACTORY_CONTRACT_NOT_FOUND) : contract(untrackAggregatorParamsType))
                    ];

                // untrack aggregator
                const untrackAggregatorOperation : operation = Tezos.transaction(
                    (untrackAggregatorParams),
                    0tez, 
                    untrackAggregatorEntrypoint
                  );

                operations := untrackAggregatorOperation # operations;

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



function addVestee(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      AddVestee(addVesteeParams) -> {

        // find and get vesting contract address from the generalContracts map
        const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "vesting", s.governanceAddress);
        const vestingAddress: address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_VESTING_CONTRACT_NOT_FOUND)
                ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
        ];

        // find and get addVestee entrypoint of Vesting contract
        const addVesteeEntrypoint = case (Tezos.get_entrypoint_opt(
            "%addVestee",
            vestingAddress) : option(contract(addVesteeType))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_ADD_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(addVesteeType))
            ];

        // add a vestee
        const addVesteeOperation : operation = Tezos.transaction(
          (addVesteeParams),
          0tez, 
          addVesteeEntrypoint
          );

        operations := addVesteeOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



function removeVestee(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      RemoveVestee(vesteeAddress) -> {

        // find and get vesting contract address from the generalContracts map
        const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "vesting", s.governanceAddress);
        const vestingAddress: address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_VESTING_CONTRACT_NOT_FOUND)
                ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
        ];

        // find and get removeVestee entrypoint of Vesting contract
        const removeVesteeEntrypoint = case (Tezos.get_entrypoint_opt(
            "%removeVestee",
            vestingAddress) : option(contract(address))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_REMOVE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(address))
            ];

        // remove a vestee
        const removeVesteeOperation : operation = Tezos.transaction(
          (vesteeAddress),
          0tez, 
          removeVesteeEntrypoint
          );

        operations := removeVesteeOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



function updateVestee(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UpdateVestee(updateVesteeParams) -> {

        // find and get vesting contract address from the generalContracts map
        const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "vesting", s.governanceAddress);
        const vestingAddress: address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_VESTING_CONTRACT_NOT_FOUND)
                ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
        ];

        // find and get removeVestee entrypoint of Vesting contract
        const updateVesteeEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateVestee",
            vestingAddress) : option(contract(updateVesteeType))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_UPDATE_VESTEE_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(updateVesteeType))
            ];

        // update a vestee
        const updateVesteeOperation : operation = Tezos.transaction(
          (updateVesteeParams),
          0tez, 
          updateVesteeEntrypoint
          );

        operations := updateVesteeOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



function toggleVesteeLock(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      ToggleVesteeLock(vesteeAddress) -> {

        // find and get vesting contract address from the generalContracts map
        const generalContractsOptView : option (option(address)) = Tezos.call_view ("getGeneralContractOpt", "vesting", s.governanceAddress);
        const vestingAddress: address = case generalContractsOptView of [
            Some (_optionContract) -> case _optionContract of [
                    Some (_contract)    -> _contract
                |   None                -> failwith (error_VESTING_CONTRACT_NOT_FOUND)
                ]
        |   None -> failwith (error_GET_GENERAL_CONTRACT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
        ];

        // find and get removeVestee entrypoint of Vesting contract
        const toggleVesteeLockEntrypoint = case (Tezos.get_entrypoint_opt(
            "%toggleVesteeLock",
            vestingAddress) : option(contract(address))) of [
                  Some(contr) -> contr
                | None        -> (failwith(error_TOGGLE_VESTEE_LOCK_ENTRYPOINT_IN_VESTING_CONTRACT_NOT_FOUND) : contract(address))
            ];

        // lock or unlock a vestee
        const toggleVesteeLockOperation : operation = Tezos.transaction(
          (vesteeAddress),
          0tez, 
          toggleVesteeLockEntrypoint
          );

        operations := toggleVesteeLockOperation # operations;

        }
    | _ -> skip
    ]
} with (operations, s)



// ------------------------------------------------------------------------------
//
// Governance Proxy Lambdas End
//
// ------------------------------------------------------------------------------