// (* CallGovernanceLambda Entrypoint *)
// function callGovernanceLambdaProxy(const executeAction : executeActionType; var s : storage) : return is
//   block {
    
//     checkSenderIsAdminOrSelf(s);

//     const governanceLambdaBytes : bytes = case s.governanceLambdaLedger[0n] of
//       | Some(_v) -> _v
//       | None     -> failwith("Error. Call Governance Lambda not found.")
//     end;

//     // reference: type governanceLambdaFunctionType is (executeActionType * storage) -> return
//     const res : return = case (Bytes.unpack(governanceLambdaBytes) : option(governanceLambdaFunctionType)) of
//       | Some(f) -> f(executeAction, s)
//       | None    -> failwith("Error. Unable to unpack CallGovernanceLambda.")
//     end;
  
//   } with (res.0, s)

// (* SetupLambdaFunction Entrypoint *)
// function setupLambdaFunction(const params : setupLambdaFunctionType; var s : storage) : return is
//   block {

//     checkSenderIsAdminOrSelf(s);

//     const max_index : nat = 6n;
//     assert_with_error(params.id <= max_index, "Error. Too many lambda functions found.");

//     // save lambda in governanceLambdaLedger
//     case s.governanceLambdaLedger[params.id] of
//       | Some(_) -> failwith("Error. Lambda already in Governance Lambda Ledger.")
//       | None    -> s.governanceLambdaLedger[params.id] := params.func_bytes
//     end;

//   } with ((nil : list(operation)), s)

