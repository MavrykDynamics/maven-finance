// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : aggregatorStorageType) : address is
    s.admin



(* View: get name variable *)
[@view] function getName(const _ : unit; const s : aggregatorStorageType) : string is
    s.name


(* View: get config *)
[@view] function getConfig(const _ : unit; const s : aggregatorStorageType) : aggregatorConfigType is
    s.config



(*  View: get break glass config *)
[@view] function getBreakGlassConfig(const _ : unit; const s: aggregatorStorageType) : aggregatorBreakGlassConfigType is
    s.breakGlassConfig



(* View: get Governance address *)
[@view] function getGovernanceAddress(const _ : unit; const s : aggregatorStorageType) : address is
    s.governanceAddress



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; const s : aggregatorStorageType) : whitelistContractsType is
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; const s : aggregatorStorageType) : generalContractsType is
    s.generalContracts



(* View: get oracle ledger *)
[@view] function getOracleLedger(const _ : unit; const s : aggregatorStorageType) : oracleLedgerType is
    s.oracleLedger


(* View: get oracle reward staked MVK *)
[@view] function getOracleRewardStakedMvk(const _ : unit; const s : aggregatorStorageType) : oracleRewardStakedMvkType is
    s.oracleRewardStakedMvk



(* View: get oracle reward xtz *)
[@view] function getOracleRewardXtz(const _ : unit; const s : aggregatorStorageType) : oracleRewardXtzType is
    s.oracleRewardXtz



(* View: get last completed data *)
[@view] function getlastCompletedData (const _ : unit ; const s : aggregatorStorageType) : lastCompletedDataReturnType is block {
    const withDecimal : lastCompletedDataReturnType = record [
        data                  = s.lastCompletedData.data;
        percentOracleResponse = s.lastCompletedData.percentOracleResponse;
        round                 = s.lastCompletedData.round;
        epoch                 = s.lastCompletedData.epoch;
        decimals              = s.config.decimals;
        lastUpdatedAt         = s.lastCompletedData.lastUpdatedAt;
    ]
} with (withDecimal)



(* View: get decimals *)
[@view] function getDecimals (const _ : unit ; const s : aggregatorStorageType) : nat is s.config.decimals;



(* View: get name *)
[@view] function getContractName (const _ : unit ; const s : aggregatorStorageType) : string is s.name;



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; const s : aggregatorStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.lambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------