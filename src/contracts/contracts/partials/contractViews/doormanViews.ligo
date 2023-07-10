// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : doormanStorageType) : address is
    s.admin



(* View: get Governance address *)
[@view] function getGovernanceAddress(const _ : unit; const s : doormanStorageType) : address is
    s.governanceAddress



(*  View: get config *)
[@view] function getConfig(const _ : unit; const s : doormanStorageType) : doormanConfigType is
    s.config



(*  View: get break glass config *)
[@view] function getBreakGlassConfig(const _ : unit; const s : doormanStorageType) : doormanBreakGlassConfigType is
    s.breakGlassConfig



(* View: get whitelist contracts opt *)
[@view] function getWhitelistContractOpt(const contractAddress : address; const s : doormanStorageType) : option(unit) is 
    Big_map.find_opt(contractAddress, s.whitelistContracts)



(* get: general contracts opt *)
[@view] function getGeneralContractOpt(const contractName : string; const s : doormanStorageType) : option(address) is
    Big_map.find_opt(contractName, s.generalContracts)



(* View: get userStakeBalance *)
[@view] function getUserStakeBalanceOpt(const userAddress : address; const s : doormanStorageType) : option(userStakeBalanceRecordType) is
    Big_map.find_opt(userAddress, s.userStakeBalanceLedger)



(*  View: unclaimedRewards *)
[@view] function getUnclaimedRewards(const _ : unit; const s : doormanStorageType) : nat is
    s.unclaimedRewards



(*  View: accumulatedFeesPerShare *)
[@view] function getAccumulatedFeesPerShare(const _ : unit; const s : doormanStorageType) : nat is
    s.accumulatedFeesPerShare



(* View: stakedBalance *)
[@view] function getStakedBalance(const userAddress : address; const s : doormanStorageType) : nat is
    case s.userStakeBalanceLedger[userAddress] of [
            Some (_val) -> _val.balance
        |   None        -> 0n
    ]



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; const s : doormanStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.lambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------