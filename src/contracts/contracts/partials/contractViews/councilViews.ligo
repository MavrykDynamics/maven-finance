// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; var s : councilStorageType) : address is
    s.admin



(* View: get config *)
[@view] function getConfig(const _ : unit; var s : councilStorageType) : councilConfigType is
    s.config



(* View: get council members *)
[@view] function getCouncilMembers(const _ : unit; var s : councilStorageType) : councilMembersType is
    s.councilMembers



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; var s : councilStorageType) : whitelistContractsType is
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; var s : councilStorageType) : generalContractsType is
    s.generalContracts    



(* View: get a council action *)
[@view] function getCouncilActionOpt(const actionId: nat; var s : councilStorageType) : option(councilActionRecordType) is
    Big_map.find_opt(actionId, s.councilActionsLedger)



(* View: get the action counter *)
[@view] function getActionCounter(const _ : unit; var s : councilStorageType) : nat is
    s.actionCounter



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : councilStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : councilStorageType) : lambdaLedgerType is
    s.lambdaLedger

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------

