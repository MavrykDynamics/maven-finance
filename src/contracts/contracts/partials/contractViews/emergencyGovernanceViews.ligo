
// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; var s : emergencyGovernanceStorageType) : address is
    s.admin



(* View: config *)
[@view] function getConfig (const _ : unit; var s : emergencyGovernanceStorageType) : emergencyConfigType is
    s.config



(* View: get general contracts *)
[@view] function getGeneralContracts (const _ : unit; var s : emergencyGovernanceStorageType) : generalContractsType is
    s.generalContracts



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts (const _ : unit; const s : emergencyGovernanceStorageType) : whitelistContractsType is 
    s.whitelistContracts



(* View: get emergency governance *)
[@view] function getEmergencyGovernanceOpt (const recordId : nat; var s : emergencyGovernanceStorageType) : option(emergencyGovernanceRecordType) is
    Big_map.find_opt(recordId, s.emergencyGovernanceLedger)



(* View: get current emergency governance id *)
[@view] function getCurrentEmergencyGovernanceId (const _ : unit; var s : emergencyGovernanceStorageType) : nat is
    s.currentEmergencyGovernanceId



(* View: get next emergency governance id *)
[@view] function getNextEmergencyGovernanceId (const _ : unit; var s : emergencyGovernanceStorageType) : nat is
    s.nextEmergencyGovernanceId



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; var s : emergencyGovernanceStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : emergencyGovernanceStorageType) : lambdaLedgerType is
    s.lambdaLedger

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------