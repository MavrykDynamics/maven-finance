// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get vault handle *)
[@view] function getVaultHandle(const _ : unit; var s : vaultStorageType) : vaultHandleType is
    s.handle



(* View: get vault name *)
[@view] function getVaultName(const _ : unit; var s : vaultStorageType) : string is
    s.name



(* View: get vault depositors *)
[@view] function getVaultDepositors(const _ : unit; var s : vaultStorageType) : depositorsType is
    s.depositors

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------
