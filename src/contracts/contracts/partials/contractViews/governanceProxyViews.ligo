// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : governanceProxyStorageType) : address is
    s.admin



(* View: get Governance address *)
[@view] function getGovernanceAddress(const _ : unit; const s : governanceProxyStorageType) : address is
    s.governanceAddress

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------