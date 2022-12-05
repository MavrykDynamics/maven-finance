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



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts (const _ : unit; const s : treasuryFactoryStorageType) : whitelistContractsType is 
    s.whitelistContracts



(* View: get whitelist token contracts *)
[@view] function getWhitelistTokenContracts (const _ : unit; const s : treasuryFactoryStorageType) : whitelistTokenContractsType is 
    s.whitelistTokenContracts



(* View: get general contracts *)
[@view] function getGeneralContracts (const _ : unit; const s : treasuryFactoryStorageType) : generalContractsType is 
    s.generalContracts



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; const s : treasuryFactoryStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; const s : treasuryFactoryStorageType) : lambdaLedgerType is
    s.lambdaLedger



(* View: get a treasury lambda *)
[@view] function getTreasuryLambdaOpt(const lambdaName : string; const s : treasuryFactoryStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.treasuryLambdaLedger)



(* View: get the treasury lambda ledger *)
[@view] function getTreasuryLambdaLedger(const _ : unit; const s : treasuryFactoryStorageType) : lambdaLedgerType is
    s.treasuryLambdaLedger

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------