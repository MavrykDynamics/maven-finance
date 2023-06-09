// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : farmStorageType) : address is
    s.admin



(* View: get name variable *)
[@view] function getName(const _ : unit; const s : farmStorageType) : string is
    s.name



(*  View: get config *)
[@view] function getConfig(const _ : unit; const s: farmStorageType) : farmConfigType is
    s.config



(* View: get whitelist contracts opt *)
[@view] function getWhitelistContractOpt(const contractAddress : address; const s : farmStorageType) : option(unit) is 
    Big_map.find_opt(contractAddress, s.whitelistContracts)



(*  View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; const s: farmStorageType) : generalContractsType is
    s.generalContracts



(*  View: get break glass config *)
[@view] function getBreakGlassConfig(const _ : unit; const s: farmStorageType) : farmBreakGlassConfigType is
    s.breakGlassConfig



(*  View: get last block update *)
[@view] function getLastBlockUpdate(const _ : unit; const s: farmStorageType) : nat is
    s.lastBlockUpdate



(*  View: get last block update *)
[@view] function getAccumulatedRewardsPerShare(const _ : unit; const s: farmStorageType) : nat is
    s.accumulatedRewardsPerShare



(*  View: get claimed rewards *)
[@view] function getClaimedRewards(const _ : unit; const s: farmStorageType) : claimedRewardsType is
    s.claimedRewards



(*  View: get depositor *)
[@view] function getDepositorOpt(const depositorAddress: depositorType; const s: farmStorageType) : option(depositorRecordType) is
    Big_map.find_opt(depositorAddress, s.depositorLedger)



(*  View: get open *)
[@view] function getOpen(const _ : unit; const s: farmStorageType) : bool is
    s.open



(*  View: get init *)
[@view] function getInit(const _ : unit; const s: farmStorageType) : bool is
    s.init



(*  View: get init block *)
[@view] function getInitBlock(const _ : unit; const s: farmStorageType) : nat is
    s.initBlock



(*  View: get min block time snapshot *)
[@view] function getMinBlockTimeSnapshot(const _ : unit; const s: farmStorageType) : nat is
    s.minBlockTimeSnapshot



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; const s : farmStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.lambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------