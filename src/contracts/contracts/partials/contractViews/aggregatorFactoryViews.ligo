// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : aggregatorFactoryStorageType) : address is
    s.admin



(* View: get config *)
[@view] function getConfig(const _ : unit; const s : aggregatorFactoryStorageType) : aggregatorFactoryConfigType is
    s.config



(* View: get Governance address *)
[@view] function getGovernanceAddress(const _ : unit; const s : aggregatorFactoryStorageType) : address is
    s.governanceAddress



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; const s : aggregatorFactoryStorageType) : whitelistContractsType is
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; const s : aggregatorFactoryStorageType) : generalContractsType is
    s.generalContracts



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