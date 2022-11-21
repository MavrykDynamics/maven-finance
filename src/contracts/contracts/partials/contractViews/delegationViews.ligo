// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; var s : delegationStorageType) : address is
    s.admin



(* View: get Config *)
[@view] function getConfig(const _ : unit; var s : delegationStorageType) : delegationConfigType is
    s.config



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; var s : delegationStorageType) : whitelistContractsType is
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; var s : delegationStorageType) : generalContractsType is
    s.generalContracts



(* View: get break glass config *)
[@view] function getBreakGlassConfig(const _ : unit; var s : delegationStorageType) : delegationBreakGlassConfigType is
    s.breakGlassConfig



(* View: get Satellite Record *)
[@view] function getDelegateOpt(const delegateAddress : address; var s : delegationStorageType) : option(delegateRecordType) is
    Big_map.find_opt(delegateAddress, s.delegateLedger)



(* View: get Satellite Record *)
[@view] function getSatelliteOpt(const satelliteAddress : address; var s : delegationStorageType) : option(satelliteRecordType) is
    Big_map.find_opt(satelliteAddress, s.satelliteLedger)



(* View: get User reward *)
[@view] function getSatelliteRewardsOpt(const userAddress : address; var s : delegationStorageType) : option(satelliteRewardsType) is
    Big_map.find_opt(userAddress, s.satelliteRewardsLedger)



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : delegationStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : delegationStorageType) : lambdaLedgerType is
    s.lambdaLedger

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------