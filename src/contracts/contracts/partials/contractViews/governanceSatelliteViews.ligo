// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin *)
[@view] function getAdmin(const _ : unit; var s : governanceSatelliteStorageType) : address is
    s.admin



(* View: get config *)
[@view] function getConfig(const _ : unit; var s : governanceSatelliteStorageType) : governanceSatelliteConfigType is
    s.config



(* View: get Governance address *)
[@view] function getGovernanceAddress(const _ : unit; var s : governanceSatelliteStorageType) : address is
    s.governanceAddress



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; var s : governanceSatelliteStorageType) : whitelistContractsType is
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; var s : governanceSatelliteStorageType) : generalContractsType is
    s.generalContracts



(* View: get a governance satellite action *)
[@view] function getGovernanceSatelliteActionOpt(const actionId : nat; var s : governanceSatelliteStorageType) : option(governanceSatelliteActionRecordType) is
    Big_map.find_opt(actionId, s.governanceSatelliteActionLedger)



(* View: get governance satellite counter *)
[@view] function getGovernanceSatelliteCounter(const _ : unit; var s : governanceSatelliteStorageType) : nat is
    s.governanceSatelliteCounter



(* View: get governance satellite voter *)
[@view] function getGovernanceSatelliteVoterOpt(const requestIdAndVoter : (actionIdType*address); var s : governanceSatelliteStorageType) : option(voteType) is
    Big_map.find_opt(requestIdAndVoter, s.governanceSatelliteVoters)



(* View: get action action initiator *)
[@view] function getActionsInitiatorOpt(const initiator : address; var s : governanceSatelliteStorageType) : option(set(actionIdType)) is
    Big_map.find_opt(initiator, s.actionsInitiators)



(* View: get an aggregator address *)
[@view] function getAggregatorOpt(const aggregatorName : string; var s : governanceSatelliteStorageType) : option(address) is
    Big_map.find_opt(aggregatorName, s.aggregatorLedger)



(* View: get a satellite oracle record *)
[@view] function getSatelliteOracleRecordOpt(const satelliteAddress : address; var s : governanceSatelliteStorageType) : option(subscribedAggregatorsType) is
    Big_map.find_opt(satelliteAddress, s.satelliteAggregatorLedger)



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; var s : governanceSatelliteStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : governanceSatelliteStorageType) : lambdaLedgerType is
    s.lambdaLedger

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------