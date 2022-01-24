function updateGovernanceConfig(const executeAction : executeActionType; var s : storage) : return is 
block {

    var operations: list(operation) := nil;

    case executeAction of 
    | UpdateGovernanceConfig(params) -> {

        // find and get updateConfig entrypoint of governance contract
        const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateConfig",
            Tezos.self_address) : option(contract(unit * nat))) of
            Some(contr) -> contr
            | None -> (failwith("updateConfig entrypoint in Governance Contract not found") : contract(unit * nat))
        end;

        // assign params to constants for easier code readability
        // todo: test if unit configActionType must be set here, or if it's able to be passed through the lambda
        const updateConfigAction   = params.0;
        const updateConfigNewValue = params.1;

        // update governance config operation
        const updateGovernanceConfigOperation : operation = Tezos.transaction(
          (updateConfigAction, updateConfigNewValue),
          0tez, 
          updateConfigEntrypoint
          );

        operations := updateGovernanceConfigOperation # operations;

        }
    | _ -> skip
    end

} with (operations, s)

function updateDelegationConfig(const executeAction : executeActionType; var s : storage) : return is 
block {

    var operations: list(operation) := nil;

    case executeAction of 
    | UpdateDelegationConfig(params) -> {

        // find and get delegation contract address from the generalContracts big map
        const delegationAddress : address = case s.generalContracts["delegation"] of
            Some(_address) -> _address
            | None -> failwith("Error. Delegation Contract is not found")
        end;

        // find and get updateConfig entrypoint of delegation contract
        const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateConfig",
            delegationAddress) : option(contract(unit * nat))) of
            Some(contr) -> contr
            | None -> (failwith("updateConfig entrypoint in Delegation Contract not found") : contract(unit * nat))
        end;

        // assign params to constants for easier code readability
        // todo: test if unit configActionType must be set here, or if it's able to be passed through the lambda
        const updateConfigAction   = params.0;
        const updateConfigNewValue = params.1;

        // update delegation config operation
        const updateDelegationConfigOperation : operation = Tezos.transaction(
          (updateConfigAction, updateConfigNewValue),
          0tez, 
          updateConfigEntrypoint
          );

        operations := updateDelegationConfigOperation # operations;

        }
    | _ -> skip
    end

} with (operations, s)

