(* CallGovernanceLambda Entrypoint *)
function callGovernanceLambda(const executeAction : executeActionType; var s : storage) : return is
  block {
    
    checkSenderIsAdminOrSelf(s);

    const id : nat = case executeAction of
      (* Update Configs *)
      | UpdateGovernanceConfig(_v)    -> 0n
      | UpdateDelegationConfig(_v)    -> 1n
    end;

    const lambdaBytes : bytes = case s.governanceLambdaLedger[id] of
      | Some(_v) -> _v
      | None    -> failwith("Error. Governance Lambda not found.")
    end;

    // reference: type governanceLambdaFunctionType is (executeActionType * storage) -> return
    const res : return = case (Bytes.unpack(lambdaBytes) : option(governanceLambdaFunctionType)) of
      | Some(f) -> f(executeAction, s)
      | None    -> failwith("Error. Unable to unpack Governance Lambda.")
    end;

    // s := res.1;
  
  } with (res.0, s)

(* SetupLambdaFunction Entrypoint *)
function setupLambdaFunction(const params : setupLambdaFunctionType; var s : storage) : return is
  block {

    checkSenderIsAdminOrSelf(s);

    // assert_with_error(params.idx <= dex_core_methods_max_index, DexCore.err_high_func_index);
    assert_with_error(params.id <= 3n, "Error. Too many lambda functions found.");

    case s.governanceLambdaLedger[params.id] of
      | Some(_) -> failwith("Error. Lambda already in Governance Lambda Ledger.")
      | None    -> s.governanceLambdaLedger[params.id] := params.func_bytes
    end;

  } with ((nil : list(operation)), s)

