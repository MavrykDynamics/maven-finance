// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : aggregatorFactoryStorageType) : address is
    s.admin


(* View: get Governance address *)
[@view] function getGovernanceAddress(const _ : unit; const s : aggregatorFactoryStorageType) : address is
    s.governanceAddress



(* View: get config *)
[@view] function getConfig(const _ : unit; const s : aggregatorFactoryStorageType) : aggregatorFactoryConfigType is
    s.config



(* View: get break glass config *)
[@view] function getBreakGlassConfig (const _ : unit; const s : aggregatorFactoryStorageType) : aggregatorFactoryBreakGlassConfigType is 
    s.breakGlassConfig



(* View: get whitelist contracts opt *)
[@view] function getWhitelistContractOpt(const contractAddress : address; const s : aggregatorFactoryStorageType) : option(unit) is 
    Big_map.find_opt(contractAddress, s.whitelistContracts)



(* get: general contracts opt *)
[@view] function getGeneralContractOpt(const contractName : string; const s : aggregatorFactoryStorageType) : option(address) is
    Big_map.find_opt(contractName, s.generalContracts)



(* View: checkAggregatorExists *)
[@view] function checkAggregatorExists (const aggregatorContract : address; const s : aggregatorFactoryStorageType) : bool is 
    Set.mem(aggregatorContract, s.trackedAggregators)



(* View: get tracked aggregators *)
[@view] function getTrackedAggregators(const _ : unit; const s : aggregatorFactoryStorageType) : set(address) is
    s.trackedAggregators



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; const s : aggregatorFactoryStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.lambdaLedger)



(* View: get an aggregator lambda *)
[@view] function getAggregatorLambdaOpt(const lambdaName: string; const s : aggregatorFactoryStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.aggregatorLambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------