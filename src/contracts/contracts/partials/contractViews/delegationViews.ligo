// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : delegationStorageType) : address is
    s.admin



(* View: get Config *)
[@view] function getConfig(const _ : unit; const s : delegationStorageType) : delegationConfigType is
    s.config



(* View: get whitelist contracts opt *)
[@view] function getWhitelistContractOpt(const contractAddress : address; const s : delegationStorageType) : option(unit) is 
    Big_map.find_opt(contractAddress, s.whitelistContracts)



(* get: general contracts opt *)
[@view] function getGeneralContractOpt(const contractName : string; const s : delegationStorageType) : option(address) is
    Big_map.find_opt(contractName, s.generalContracts)



(* View: get break glass config *)
[@view] function getBreakGlassConfig(const _ : unit; const s : delegationStorageType) : delegationBreakGlassConfigType is
    s.breakGlassConfig



(* View: get Satellite Record *)
[@view] function getDelegateOpt(const delegateAddress : address; const s : delegationStorageType) : option(delegateRecordType) is
    Big_map.find_opt(delegateAddress, s.delegateLedger)



(* View: get Satellite Record *)
[@view] function getSatelliteOpt(const satelliteAddress : address; const s : delegationStorageType) : option(satelliteRecordType) is
    Big_map.find_opt(satelliteAddress, s.satelliteLedger)



(* View: get User reward *)
[@view] function getSatelliteRewardsOpt(const userAddress : address; const s : delegationStorageType) : option(satelliteRewardsType) is
    Big_map.find_opt(userAddress, s.satelliteRewardsLedger)



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; const s : delegationStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.lambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------