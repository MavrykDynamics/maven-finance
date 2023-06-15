// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin *)
[@view] function getAdmin(const _ : unit; const s : governanceSatelliteStorageType) : address is
    s.admin



(* View: get config *)
[@view] function getConfig(const _ : unit; const s : governanceSatelliteStorageType) : governanceSatelliteConfigType is
    s.config



(* View: get Governance address *)
[@view] function getGovernanceAddress(const _ : unit; const s : governanceSatelliteStorageType) : address is
    s.governanceAddress



(* View: get whitelist contracts opt *)
[@view] function getWhitelistContractOpt(const contractAddress : address; const s : governanceSatelliteStorageType) : option(unit) is 
    Big_map.find_opt(contractAddress, s.whitelistContracts)



(* get: general contracts opt *)
[@view] function getGeneralContractOpt(const contractName : string; const s : governanceSatelliteStorageType) : option(address) is
    Big_map.find_opt(contractName, s.generalContracts)



(* View: get a governance satellite action *)
[@view] function getGovernanceSatelliteActionOpt(const actionId : nat; const s : governanceSatelliteStorageType) : option(governanceSatelliteActionRecordType) is
    Big_map.find_opt(actionId, s.governanceSatelliteActionLedger)



(* View: get governance satellite counter *)
[@view] function getGovernanceSatelliteCounter(const _ : unit; const s : governanceSatelliteStorageType) : nat is
    s.governanceSatelliteCounter



(* View: get governance satellite voter *)
[@view] function getGovernanceSatelliteVoterOpt(const requestIdAndVoter : (actionIdType*address); const s : governanceSatelliteStorageType) : option(voteType) is
    Big_map.find_opt(requestIdAndVoter, s.governanceSatelliteVoters)



(* View: get satellite actions for specified governance cycle *)
[@view] function getSatelliteActionsOpt(const satelliteActionKey : (nat * address); const s : governanceSatelliteStorageType) : option(set(actionIdType)) is
    Big_map.find_opt(satelliteActionKey, s.satelliteActions)



(* View: get an aggregator address *)
[@view] function getAggregatorOpt(const aggregatorName : string; const s : governanceSatelliteStorageType) : option(address) is
    Big_map.find_opt(aggregatorName, s.aggregatorLedger)



(* View: get a satellite oracle record *)
[@view] function getSatelliteOracleRecordOpt(const satelliteAddress : address; const s : governanceSatelliteStorageType) : option(subscribedAggregatorsType) is
    Big_map.find_opt(satelliteAddress, s.satelliteAggregatorLedger)



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; const s : governanceSatelliteStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.lambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------