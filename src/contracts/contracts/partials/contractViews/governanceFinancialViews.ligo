// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : governanceFinancialStorageType) : address is
    s.admin



(* View: get config *)
[@view] function getConfig(const _ : unit; const s : governanceFinancialStorageType) : governanceFinancialConfigType is
    s.config



(* View: get Governance address *)
[@view] function getGovernanceAddress(const _ : unit; const s : governanceFinancialStorageType) : address is
    s.governanceAddress



(* View: get whitelist token contracts *)
[@view] function getWhitelistTokenContractOpt(const contractAddress : address; const s : governanceFinancialStorageType) : option(unit) is
    Big_map.find_opt(contractAddress, s.whitelistTokenContracts)



(* get: general contracts opt *)
[@view] function getGeneralContractOpt(const contractName : string; const s : governanceFinancialStorageType) : option(address) is
    Big_map.find_opt(contractName, s.generalContracts)



(* View: get whitelist contracts opt *)
[@view] function getWhitelistContractOpt(const contractAddress : address; const s : governanceFinancialStorageType) : option(unit) is 
    Big_map.find_opt(contractAddress, s.whitelistContracts)



(* View: get a financial request *)
[@view] function getFinancialRequestOpt(const requestId : nat; const s : governanceFinancialStorageType) : option(financialRequestRecordType) is
    Big_map.find_opt(requestId, s.financialRequestLedger)



(* View: get financial request counter *)
[@view] function getFinancialRequestCounter(const _ : unit; const s : governanceFinancialStorageType) : nat is
    s.financialRequestCounter



(* View: get a financial request voter *)
[@view] function getFinancialRequestVoterOpt(const requestIdAndVoter : (actionIdType*address); const s : governanceFinancialStorageType) : option(voteType) is
    Big_map.find_opt(requestIdAndVoter, s.financialRequestVoters)



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; const s : governanceFinancialStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.lambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------
