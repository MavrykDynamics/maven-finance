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
    
    checkSenderIsAdminOrSelfOrGovernance(s);

    (* ids to match governanceLambdaIndex.json - id 0 is executeGovernanceLambdaProxy *)
    const id : nat = case executeAction of [
      
      (* Update Lambda Function *)    
      | UpdateProxyLambda (_v)                 -> 1n

      (* General Controls *)    
      | SetContractAdmin (_v)                  -> 2n
      | SetContractGovernance (_v)             -> 3n
      | SetContractLambda (_v)                 -> 4n
      | UpdateContractMetadata (_v)            -> 5n
      | UpdateContractWhitelistMap (_v)        -> 6n
      | UpdateContractGeneralMap (_v)          -> 7n
      | UpdateContractWhitelistTokenMap (_v)   -> 8n
      
      (* Update Configs *)    
      | UpdateGovernanceConfig (_v)            -> 9n
      | UpdateDelegationConfig (_v)            -> 10n

      (* Governance Control *)
      | UpdateWhitelistDevelopersSet (_v)      -> 11n

      (* Farm Control *)
      | CreateFarm (_v)                        -> 12n
      | TrackFarm (_v)                         -> 13n
      | UntrackFarm (_v)                       -> 14n

      (* Treasury Control *)
      | CreateTreasury (_v)                    -> 15n
      | TrackTreasury (_v)                     -> 16n
      | UntrackTreasury (_v)                   -> 17n

      (* MVK Token Control *)
      | UpdateMvkInflationRate (_v)            -> 18n
      | TriggerMvkInflation (_v)               -> 19n
    ];

    const lambdaBytes : bytes = case s.proxyLambdaLedger[id] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. Governance Proxy Lambda not found.")
    ];

    // reference: type governanceProxyLambdaFunctionType is (executeActionType * governanceProxyStorage) -> return
    const res : return = case (Bytes.unpack(lambdaBytes) : option(governanceProxyLambdaFunctionType)) of [
      | Some(f) -> f(executeAction, s)
      | None    -> failwith("Error. Unable to unpack Governance Proxy Lambda.")
    ];
  
} with (res.0, s)



(* updateProxyLambda lambda *)
function updateProxyLambda(const executeAction : executeActionType; var s : governanceProxyStorage) : return is
block {
    
    checkSenderIsAdminOrSelfOrGovernance(s);

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
    
    checkSenderIsAdminOrSelfOrGovernance(s);

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
    
    checkSenderIsAdminOrSelfOrGovernance(s);

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
    
    checkSenderIsAdminOrSelfOrGovernance(s);

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



(* updateContractMetadata lambda *)
function updateContractMetadata(const executeAction : executeActionType; var s : governanceProxyStorage) : return is
block {
    
    checkSenderIsAdminOrSelfOrGovernance(s);

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
    
    checkSenderIsAdminOrSelfOrGovernance(s);

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
    
    checkSenderIsAdminOrSelfOrGovernance(s);

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
    
    checkSenderIsAdminOrSelfOrGovernance(s);

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

    checkSenderIsAdminOrSelfOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      UpdateGovernanceConfig(params) -> {

        // find and get updateConfig entrypoint of governance contract
        const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateConfig",
            s.governanceAddress) : option(contract(nat * governanceUpdateConfigActionType))) of [
                  Some(contr) -> contr
                | None        -> (failwith("updateConfig entrypoint in Governance Contract not found") : contract(nat * governanceUpdateConfigActionType))
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

    checkSenderIsAdminOrSelfOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UpdateDelegationConfig(params) -> {

        // find and get delegation contract address from the generalContracts big map
        const delegationAddress : address = case s.generalContracts["delegation"] of [
              Some(_address) -> _address
            | None           -> failwith("Error. Delegation Contract is not found")
        ];

        // find and get updateConfig entrypoint of delegation contract
        const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateConfig",
            delegationAddress) : option(contract(nat * delegationUpdateConfigActionType))) of [
                  Some(contr) -> contr
                | None        -> (failwith("updateConfig entrypoint in Delegation Contract not found") : contract(nat * delegationUpdateConfigActionType))
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



function updateWhitelistDevelopersSet(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrSelfOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UpdateWhitelistDevelopersSet(developer) -> {

        // find and get updateConfig entrypoint of delegation contract
        const updateWhitelistDevelopersSetEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateWhitelistDevelopers",
            s.governanceAddress) : option(contract(address))) of [
                  Some(contr) -> contr
                | None        -> (failwith("updateWhitelistDevelopers entrypoint in Governance Contract not found") : contract(address))
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



function createFarm(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrSelfOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      CreateFarm(createFarmParams) -> {

        // find and get farmFactory contract address from the generalContracts map
        const farmFactoryAddress : address = case s.generalContracts["farmFactory"] of [
              Some(_address) -> _address
            | None           -> failwith("Error. Farm Factory Contract is not found")
        ];

        // find and get createFarm entrypoint of farmFactory contract
        const createFarmEntrypoint = case (Tezos.get_entrypoint_opt(
            "%createFarm",
            farmFactoryAddress) : option(contract(createFarmType))) of [
                  Some(contr) -> contr
                | None        -> (failwith("createFarm entrypoint in Farm Factory Contract not found") : contract(createFarmType))
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

    checkSenderIsAdminOrSelfOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      TrackFarm(trackFarmParams) -> {

        // find and get farmFactory contract address from the generalContracts map
        const farmFactoryAddress : address = case s.generalContracts["farmFactory"] of [
              Some(_address) -> _address
            | None           -> failwith("Error. Farm Factory Contract is not found")
        ];

        // find and get trackFarm entrypoint of farmFactory contract
        const trackFarmEntrypoint = case (Tezos.get_entrypoint_opt(
            "%trackFarm",
            farmFactoryAddress) : option(contract(address))) of [
                  Some(contr) -> contr
                | None        -> (failwith("trackFarm entrypoint in Farm Factory Contract not found") : contract(address))
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

    checkSenderIsAdminOrSelfOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UntrackFarm(untrackFarmParams) -> {

        // find and get farmFactory contract address from the generalContracts map
        const farmFactoryAddress : address = case s.generalContracts["farmFactory"] of [
              Some(_address) -> _address
            | None           -> failwith("Error. Farm Factory Contract is not found")
        ];

        // find and get untrack entrypoint of farmFactory contract
        const untrackFarmEntrypoint = case (Tezos.get_entrypoint_opt(
            "%untrackFarm",
            farmFactoryAddress) : option(contract(address))) of [
                  Some(contr) -> contr
                | None        -> (failwith("untrackFarm entrypoint in Farm Factory Contract not found") : contract(address))
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



function createTreasury(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrSelfOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      CreateTreasury(createTreasuryParams) -> {

        // find and get treasuryFactory contract address from the generalContracts map
        const treasuryFactoryAddress : address = case s.generalContracts["treasuryFactory"] of [
              Some(_address) -> _address
            | None           -> failwith("Error. Treasury Factory Contract is not found")
        ];

        // find and get createTreasury entrypoint of treasuryFactory contract
        const createTreasuryEntrypoint = case (Tezos.get_entrypoint_opt(
            "%createTreasury",
            treasuryFactoryAddress) : option(contract(bytes))) of [
                  Some(contr) -> contr
                | None        -> (failwith("createTreasury entrypoint in Farm Factory Contract not found") : contract(bytes))
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

    checkSenderIsAdminOrSelfOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      TrackTreasury(trackTreasuryParams) -> {

        // find and get treasuryFactory contract address from the generalContracts map
        const treasuryFactoryAddress : address = case s.generalContracts["treasuryFactory"] of [
              Some(_address) -> _address
            | None           -> failwith("Error. Treasury Factory Contract is not found")
        ];

        // find and get trackTreasury entrypoint of treasuryFactory contract
        const trackTreasuryEntrypoint = case (Tezos.get_entrypoint_opt(
            "%trackTreasury",
            treasuryFactoryAddress) : option(contract(address))) of [
                  Some(contr) -> contr
                | None        -> (failwith("trackFarm entrypoint in Treasury Factory Contract not found") : contract(address))
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

    checkSenderIsAdminOrSelfOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UntrackTreasury(untrackTreasuryParams) -> {

        // find and get treasuryFactory contract address from the generalContracts map
        const treasuryFactoryAddress : address = case s.generalContracts["treasuryFactory"] of [
              Some(_address) -> _address
            | None           -> failwith("Error. Treasury Factory Contract is not found")
        ];

        // find and get untrackTreasury entrypoint of treasuryFactory contract
        const untrackTreasuryEntrypoint = case (Tezos.get_entrypoint_opt(
            "%untrackTreasury",
            treasuryFactoryAddress) : option(contract(address))) of [
                  Some(contr) -> contr
                | None        -> (failwith("untrackTreasury entrypoint in Treasury Factory Contract not found") : contract(address))
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



function updateMvkInflationRate(const executeAction : executeActionType; var s : governanceProxyStorage) : return is 
block {

    checkSenderIsAdminOrSelfOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UpdateMvkInflationRate(newInflationRate) -> {

        // find and get updateInflationRate entrypoint of MVK Token contract
        const updateInflationRateEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateInflationRate",
            s.mvkTokenAddress) : option(contract(nat))) of [
                  Some(contr) -> contr
                | None        -> (failwith("updateInflationRate entrypoint in MVK Token Contract not found") : contract(nat))
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

    checkSenderIsAdminOrSelfOrGovernance(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      TriggerMvkInflation(_parameter) -> {

        // find and get updateInflationRate entrypoint of MVK Token contract
        const triggerInflationEntrypoint = case (Tezos.get_entrypoint_opt(
            "%triggerInflation",
            s.mvkTokenAddress) : option(contract(unit))) of [
                  Some(contr) -> contr
                | None        -> (failwith("triggerInflation entrypoint in MVK Token Contract not found") : contract(unit))
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



// function updateDoormanConfig(const executeAction : executeActionType; var s : governanceStorage) : return is 
// block {

//     checkSenderIsAdminOrSelfOrGovernance(s);

//     var operations: list(operation) := nil;

//     case executeAction of [
      
//       UpdateDoormanConfig(params) -> {

//         // find and get doorman contract address from the generalContracts big map
//         const doormanAddress : address = case s.generalContracts["doorman"] of [
//               Some(_address) -> _address
//             | None -> failwith("Error. Doorman Contract is not found")
//         ];

//         // find and get updateConfig entrypoint of doorman contract
//         const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
//             "%updateConfig",
//             doormanAddress) : option(contract(nat * doormanUpdateConfigActionType))) of [
//                   Some(contr) -> contr
//                 | None        -> (failwith("updateConfig entrypoint in Doorman Contract not found") : contract(nat * doormanUpdateConfigActionType))
//             ];

//         // assign params to constants for better code readability
//         const updateConfigAction   = params.updateConfigAction;
//         const updateConfigNewValue = params.updateConfigNewValue;

//         // update doorman config operation
//         const updateDoormanConfigOperation : operation = Tezos.transaction(
//           (updateConfigNewValue, updateConfigAction),
//           0tez, 
//           updateConfigEntrypoint
//         );

//         operations := updateDoormanConfigOperation # operations;

//         }
//     | _ -> skip
//     ]

// } with (operations, s)

// ------------------------------------------------------------------------------
//
// Governance Proxy Lambdas End
//
// ------------------------------------------------------------------------------