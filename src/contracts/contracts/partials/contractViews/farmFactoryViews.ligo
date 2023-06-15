// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : farmFactoryStorageType) : address is
    s.admin



(* View: checkFarmExists *)
[@view] function checkFarmExists (const farmContract : address; const s: farmFactoryStorageType) : bool is 
    Set.mem(farmContract, s.trackedFarms)



(* View: get config *)
[@view] function getConfig (const _ : unit; const s : farmFactoryStorageType) : farmFactoryConfigType is 
    s.config



(* View: get break glass config *)
[@view] function getBreakGlassConfig (const _ : unit; const s : farmFactoryStorageType) : farmFactoryBreakGlassConfigType is 
    s.breakGlassConfig



(* View: get whitelist contracts opt *)
[@view] function getWhitelistContractOpt(const contractAddress : address; const s : farmFactoryStorageType) : option(unit) is 
    Big_map.find_opt(contractAddress, s.whitelistContracts)



(* get: general contracts opt *)
[@view] function getGeneralContractOpt(const contractName : string; const s : farmFactoryStorageType) : option(address) is
    Big_map.find_opt(contractName, s.generalContracts)



(* View: get tracked farms *)
[@view] function getTrackedFarms (const _ : unit; const s : farmFactoryStorageType) : set(address) is 
    s.trackedFarms



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; const s : farmFactoryStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.lambdaLedger)



(* View: get a farm lambda *)
[@view] function getFarmLambdaOpt(const lambdaName : string; const s : farmFactoryStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.farmLambdaLedger)



(* View: get a mfarm lambda *)
[@view] function getMFarmLambdaOpt(const lambdaName : string; const s : farmFactoryStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.mFarmLambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------