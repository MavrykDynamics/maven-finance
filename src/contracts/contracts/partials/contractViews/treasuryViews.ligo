// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; var s : treasuryStorageType) : address is
    s.admin



(* View: get name variable *)
[@view] function getName(const _ : unit; var s : treasuryStorageType) : string is
    s.name



(* View: get break glass config *)
[@view] function getBreakGlassConfig(const _ : unit; var s : treasuryStorageType) : treasuryBreakGlassConfigType is
    s.breakGlassConfig



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; var s : treasuryStorageType) : whitelistContractsType is
    s.whitelistContracts



(* View: get whitelist token contracts *)
[@view] function getWhitelistTokenContracts(const _ : unit; var s : treasuryStorageType) : whitelistTokenContractsType is
    s.whitelistTokenContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; var s : treasuryStorageType) : generalContractsType is
    s.generalContracts



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; var s : treasuryStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : treasuryStorageType) : lambdaLedgerType is
    s.lambdaLedger

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------