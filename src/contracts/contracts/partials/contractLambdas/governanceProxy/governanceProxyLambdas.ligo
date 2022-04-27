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
      | UpdateContractMetadata (_v)            -> 3n
      | UpdateContractWhitelistMap (_v)        -> 4n
      | UpdateContractGeneralMap (_v)          -> 5n
      | UpdateContractWhitelistTokenMap (_v)   -> 6n
      
      (* Update Configs *)    
      | UpdateGovernanceConfig (_v)            -> 7n
      | UpdateDelegationConfig (_v)            -> 8n

      (* BreakGlass Control *)
      | UpdateWhitelistDevelopersSet (_v)      -> 9n

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

    checkSenderIsAdminOrSelf(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UpdateWhitelistDevelopersSet(developer) -> {

        // find and get updateConfig entrypoint of delegation contract
        const updateWhitelistDevelopersSetEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateWhitelistDevelopersSet",
            governanceAddress) : option(contract(address))) of [
                  Some(contr) -> contr
                | None        -> (failwith("updateWhitelistDevelopersSet entrypoint in Governance Contract not found") : contract(address))
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