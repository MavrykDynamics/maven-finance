function updateDoormanConfig(const executeAction : executeActionType; var s : governanceStorage) : return is 
block {

    checkSenderIsAdminOrSelf(s);

    var operations: list(operation) := nil;

    case executeAction of [
      
      UpdateDoormanConfig(params) -> {

        // find and get doorman contract address from the generalContracts big map
        const doormanAddress : address = case s.generalContracts["doorman"] of [
              Some(_address) -> _address
            | None -> failwith("Error. Doorman Contract is not found")
        ];

        // find and get updateConfig entrypoint of doorman contract
        const updateConfigEntrypoint = case (Tezos.get_entrypoint_opt(
            "%updateConfig",
            doormanAddress) : option(contract(nat * doormanUpdateConfigActionType))) of [
                  Some(contr) -> contr
                | None        -> (failwith("updateConfig entrypoint in Doorman Contract not found") : contract(nat * doormanUpdateConfigActionType))
            ];

        // assign params to constants for better code readability
        const updateConfigAction   = params.updateConfigAction;
        const updateConfigNewValue = params.updateConfigNewValue;

        // update doorman config operation
        const updateDoormanConfigOperation : operation = Tezos.transaction(
          (updateConfigNewValue, updateConfigAction),
          0tez, 
          updateConfigEntrypoint
        );

        operations := updateDoormanConfigOperation # operations;

        }
    | _ -> skip
    ]

} with (operations, s)

