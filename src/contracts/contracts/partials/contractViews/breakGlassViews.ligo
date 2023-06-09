// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : breakGlassStorageType) : address is
    s.admin



(* View: get Glass broken variable *)
[@view] function getGlassBroken(const _ : unit; const s : breakGlassStorageType) : bool is
    s.glassBroken



(* View: get config *)
[@view] function getConfig(const _ : unit; const s : breakGlassStorageType) : breakGlassConfigType is
    s.config



(* View: get council member opt *)
[@view] function getCouncilMemberOpt(const councilMemberAddress : address; const s : breakGlassStorageType) : option(councilMemberInfoType) is
    Big_map.find_opt(councilMemberAddress, s.councilMembers)



(* View: get whitelist contracts opt *)
[@view] function getWhitelistContractOpt(const contractAddress : address; const s : breakGlassStorageType) : option(unit) is 
    Big_map.find_opt(contractAddress, s.whitelistContracts)



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; const s : breakGlassStorageType) : generalContractsType is
    s.generalContracts



(* View: get an action *)
[@view] function getActionOpt(const actionId: nat; const s : breakGlassStorageType) : option(councilActionRecordType) is
    Big_map.find_opt(actionId, s.actionsLedger)



(* View: get the action counter *)
[@view] function getActionCounter(const _ : unit; const s : breakGlassStorageType) : nat is
    s.actionCounter



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; const s : breakGlassStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.lambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------