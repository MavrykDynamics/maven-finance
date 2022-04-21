(* CallGovernanceLambda Entrypoint *)
function callGovernanceLambdaProxy(const executeAction : executeActionType; var s : governanceStorage) : return is
  block {
    
    checkSenderIsAdminOrSelf(s);

    const governanceLambdaBytes : bytes = case s.governanceLambdaLedger[0n] of [
      | Some(_v) -> _v
      | None     -> failwith("Error. Call Governance Lambda not found.")
    ];

    // reference: type governanceLambdaFunctionType is (executeActionType * governanceStorage) -> return
    const res : return = case (Bytes.unpack(governanceLambdaBytes) : option(governanceProxyLambdaFunctionType)) of [
      | Some(f) -> f(executeAction, s)
      | None    -> failwith("Error. Unable to unpack CallGovernanceLambda.")
    ];
  
  } with (res.0, s)

(* SetupLambdaFunction Entrypoint *)
function setupLambdaFunction(const params : setupLambdaFunctionType; var s : governanceStorage) : return is
  block {

    checkSenderIsAdminOrSelf(s);

    // save lambda in governanceLambdaLedger
    case s.governanceLambdaLedger[params.id] of [
      Some(_) -> failwith("Error. Lambda already in Governance Lambda Ledger.")
    | None    -> s.governanceLambdaLedger[params.id] := params.func_bytes
    ];

  } with ((nil : list(operation)), s)

