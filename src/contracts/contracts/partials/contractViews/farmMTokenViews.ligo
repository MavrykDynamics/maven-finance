// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : farmMTokenStorageType) : address is
    s.admin



(* View: get name variable *)
[@view] function getName(const _ : unit; const s : farmMTokenStorageType) : string is
    s.name



(*  View: get config *)
[@view] function getConfig(const _ : unit; const s: farmMTokenStorageType) : farmMTokenConfigType is
    s.config



(* View: get whitelist contracts opt *)
[@view] function getWhitelistContractOpt(const contractAddress : address; const s : farmMTokenStorageType) : option(unit) is 
    Big_map.find_opt(contractAddress, s.whitelistContracts)



(* get: general contracts opt *)
[@view] function getGeneralContractOpt(const contractName : string; const s : farmMTokenStorageType) : option(address) is
    Big_map.find_opt(contractName, s.generalContracts)



(*  View: get break glass config *)
[@view] function getBreakGlassConfig(const _ : unit; const s: farmMTokenStorageType) : farmBreakGlassConfigType is
    s.breakGlassConfig



(*  View: get last block update *)
[@view] function getLastBlockUpdate(const _ : unit; const s: farmMTokenStorageType) : nat is
    s.lastBlockUpdate



(*  View: get last block update *)
[@view] function getAccumulatedRewardsPerShare(const _ : unit; const s: farmMTokenStorageType) : nat is
    s.accumulatedRewardsPerShare



(*  View: get claimed rewards *)
[@view] function getClaimedRewards(const _ : unit; const s: farmMTokenStorageType) : claimedRewardsType is
    s.claimedRewards



(*  View: get depositor *)
[@view] function getDepositorOpt(const depositorAddress: depositorType; const s: farmMTokenStorageType) : option(depositorRecordType) is
    Big_map.find_opt(depositorAddress, s.depositorLedger)



(*  View: get open *)
[@view] function getOpen(const _ : unit; const s: farmMTokenStorageType) : bool is
    s.open



(*  View: get init *)
[@view] function getInit(const _ : unit; const s: farmMTokenStorageType) : bool is
    s.init



(*  View: get init block *)
[@view] function getInitBlock(const _ : unit; const s: farmMTokenStorageType) : nat is
    s.initBlock



(*  View: get min block time snapshot *)
[@view] function getMinBlockTimeSnapshot(const _ : unit; const s: farmMTokenStorageType) : nat is
    s.minBlockTimeSnapshot



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; const s : farmMTokenStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.lambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------