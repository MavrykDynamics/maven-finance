// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; var s : breakGlassStorageType) : address is
    s.admin



(* View: get Glass broken variable *)
[@view] function getGlassBroken(const _ : unit; var s : breakGlassStorageType) : bool is
    s.glassBroken



(* View: get config *)
[@view] function getConfig(const _ : unit; var s : breakGlassStorageType) : breakGlassConfigType is
    s.config



(* View: get council members *)
[@view] function getCouncilMembers(const _ : unit; var s : breakGlassStorageType) : councilMembersType is
    s.councilMembers



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; var s : breakGlassStorageType) : whitelistContractsType is
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; var s : breakGlassStorageType) : generalContractsType is
    s.generalContracts



(* View: get an action *)
[@view] function getActionOpt(const actionId: nat; var s : breakGlassStorageType) : option(councilActionRecordType) is
    Big_map.find_opt(actionId, s.actionsLedger)



(* View: get the action counter *)
[@view] function getActionCounter(const _ : unit; var s : breakGlassStorageType) : nat is
    s.actionCounter



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : breakGlassStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : breakGlassStorageType) : lambdaLedgerType is
    s.lambdaLedger

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------