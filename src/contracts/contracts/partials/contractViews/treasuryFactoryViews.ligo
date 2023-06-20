// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : treasuryFactoryStorageType) : address is
    s.admin



(* View: checkTreasuryExists *)
[@view] function checkTreasuryExists (const treasuryContract : address; const s : treasuryFactoryStorageType) : bool is 
    Set.mem(treasuryContract, s.trackedTreasuries)



(* View: get config *)
[@view] function getConfig (const _ : unit; const s : treasuryFactoryStorageType) : treasuryFactoryConfigType is 
    s.config



(* View: get tracked treasuries *)
[@view] function getTrackedTreasuries (const _ : unit; const s : treasuryFactoryStorageType) : set(address) is 
    s.trackedTreasuries



(* View: get break glass config *)
[@view] function getBreakGlassConfig (const _ : unit; const s : treasuryFactoryStorageType) : treasuryFactoryBreakGlassConfigType is 
    s.breakGlassConfig



(* View: get whitelist contracts opt *)
[@view] function getWhitelistContractOpt(const contractAddress : address; const s : treasuryFactoryStorageType) : option(unit) is 
    Big_map.find_opt(contractAddress, s.whitelistContracts)



(* View: get whitelist token contracts *)
[@view] function getWhitelistTokenContractOpt(const contractAddress : address; const s : treasuryFactoryStorageType) : option(unit) is
    Big_map.find_opt(contractAddress, s.whitelistTokenContracts)



(* get: general contracts opt *)
[@view] function getGeneralContractOpt(const contractName : string; const s : treasuryFactoryStorageType) : option(address) is
    Big_map.find_opt(contractName, s.generalContracts)



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; const s : treasuryFactoryStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.lambdaLedger)



(* View: get a treasury lambda *)
[@view] function getTreasuryLambdaOpt(const lambdaName : string; const s : treasuryFactoryStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.treasuryLambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------