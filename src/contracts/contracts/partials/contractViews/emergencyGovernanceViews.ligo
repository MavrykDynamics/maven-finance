
// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : emergencyGovernanceStorageType) : address is
    s.admin



(* View: config *)
[@view] function getConfig (const _ : unit; const s : emergencyGovernanceStorageType) : emergencyConfigType is
    s.config



(* get: general contracts opt *)
[@view] function getGeneralContractOpt(const contractName : string; const s : emergencyGovernanceStorageType) : option(address) is
    Big_map.find_opt(contractName, s.generalContracts)



(* View: get whitelist contracts opt *)
[@view] function getWhitelistContractOpt(const contractAddress : address; const s : emergencyGovernanceStorageType) : option(unit) is 
    Big_map.find_opt(contractAddress, s.whitelistContracts)



(* View: get emergency governance *)
[@view] function getEmergencyGovernanceOpt (const recordId : nat; const s : emergencyGovernanceStorageType) : option(emergencyGovernanceRecordType) is
    Big_map.find_opt(recordId, s.emergencyGovernanceLedger)



(* View: get current emergency governance id *)
[@view] function getCurrentEmergencyGovernanceId (const _ : unit; const s : emergencyGovernanceStorageType) : nat is
    s.currentEmergencyGovernanceId



(* View: get next emergency governance id *)
[@view] function getNextEmergencyGovernanceId (const _ : unit; const s : emergencyGovernanceStorageType) : nat is
    s.nextEmergencyGovernanceId



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; const s : emergencyGovernanceStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.lambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------