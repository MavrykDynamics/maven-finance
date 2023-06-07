// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : treasuryStorageType) : address is
    s.admin



(* View: get name variable *)
[@view] function getName(const _ : unit; const s : treasuryStorageType) : string is
    s.name



(* View: get break glass config *)
[@view] function getBreakGlassConfig(const _ : unit; const s : treasuryStorageType) : treasuryBreakGlassConfigType is
    s.breakGlassConfig



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; const s : treasuryStorageType) : whitelistContractsType is
    s.whitelistContracts



(* View: get whitelist token contracts *)
[@view] function getWhitelistTokenContracts(const _ : unit; const s : treasuryStorageType) : whitelistTokenContractsType is
    s.whitelistTokenContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; const s : treasuryStorageType) : generalContractsType is
    s.generalContracts



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; const s : treasuryStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.lambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------