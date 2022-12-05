// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin *)
[@view] function getAdmin(const _ : unit; var s : vaultStorageType) : address is
    s.admin



(* View: get Governance address *)
[@view] function getGovernanceAddress(const _ : unit; var s : vaultStorageType) : address is
    s.governanceAddress



(* View: get vault handle *)
[@view] function getVaultHandle(const _ : unit; var s : vaultStorageType) : vaultHandleType is
    s.handle



(* View: get vault depositors *)
[@view] function getVaultDepositors(const _ : unit; var s : vaultStorageType) : depositorsType is
    s.depositors



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; var s : vaultStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : vaultStorageType) : lambdaLedgerType is
    s.lambdaLedger

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------
