(* CallGovernanceLambda lambda *)
function callGovernanceLambda(const executeAction : executeActionType; var s : storage) : return is
  block {
    
    checkSenderIsAdminOrSelf(s);

    (* ids to match governanceLambdaIndex.json - id 0 is callGovernanceLambda *)
    const id : nat = case executeAction of [
      
      (* Update Lambda Function *)    
      | UpdateLambdaFunction(_v)      -> 1n
      
      (* Update Configs *)    
      | UpdateGovernanceConfig(_v)    -> 2n
      | UpdateDelegationConfig(_v)    -> 3n

    ];

    const lambdaBytes : bytes = case s.governanceLambdaLedger[id] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. Governance Lambda not found.")
    ];

    // reference: type governanceLambdaFunctionType is (executeActionType * storage) -> return
    const res : return = case (Bytes.unpack(lambdaBytes) : option(governanceLambdaFunctionType)) of [
      | Some(f) -> f(executeAction, s)
      | None    -> failwith("Error. Unable to unpack Governance Lambda.")
    ];
  
  } with (res.0, s)

(* updateLambdaFunction lambda *)
function updateLambdaFunction(const executeAction : executeActionType; var s : storage) : return is
  block {
    
    checkSenderIsAdminOrSelf(s);

    case executeAction of [
      UpdateLambdaFunction(params) -> {

        // assign params to constants for better code readability
        const lambdaId    = params.id;
        const lambdaBytes = params.func_bytes;

        s.governanceLambdaLedger[lambdaId] := lambdaBytes

        }
    | _ -> skip
    ];

  } with (noOperations, s)

function updateGovernanceConfig(const executeAction : executeActionType; var s : storage) : return is 
block {

    checkSenderIsAdminOrSelf(s);

    var operations: list(operation) := nil;

    case executeAction of [
      UpdateGovernanceConfig(params) -> {

        // find and get updateConfig entrypoint of governance contract
        const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateConfig",
            Tezos.self_address) : option(contract(nat * updateGovernanceConfigActionType))) of [
            Some(contr) -> contr
            | None -> (failwith("updateConfig entrypoint in Governance Contract not found") : contract(nat * updateGovernanceConfigActionType))
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

function updateDelegationConfig(const executeAction : executeActionType; var s : storage) : return is 
block {

    checkSenderIsAdminOrSelf(s);

    var operations: list(operation) := nil;

    case executeAction of [
      UpdateDelegationConfig(params) -> {

        // find and get delegation contract address from the generalContracts big map
        const delegationAddress : address = case s.generalContracts["delegation"] of [
            Some(_address) -> _address
            | None -> failwith("Error. Delegation Contract is not found")
        ];

        // find and get updateConfig entrypoint of delegation contract
        const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateConfig",
            delegationAddress) : option(contract(nat * updateDelegationConfigActionType))) of [
            Some(contr) -> contr
            | None -> (failwith("updateConfig entrypoint in Delegation Contract not found") : contract(nat * updateDelegationConfigActionType))
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

