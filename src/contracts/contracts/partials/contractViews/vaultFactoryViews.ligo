// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; var s : vaultFactoryStorageType) : address is
    s.admin


(* View: get governance address *)
[@view] function getGovernanceAddress(const _ : unit; var s : vaultFactoryStorageType) : address is
    s.governanceAddress


(* View: get config *)
[@view] function getConfig (const _ : unit; const s : vaultFactoryStorageType) : vaultFactoryConfigType is 
    s.config



(* View: get break glass config *)
[@view] function getBreakGlassConfig (const _ : unit; const s : vaultFactoryStorageType) : vaultFactoryBreakGlassConfigType is 
    s.breakGlassConfig



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts (const _ : unit; const s : vaultFactoryStorageType) : whitelistContractsType is 
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts (const _ : unit; const s : vaultFactoryStorageType) : generalContractsType is 
    s.generalContracts



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; var s : vaultFactoryStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.lambdaLedger)



(* View: get a vault lambda *)
[@view] function getVaultLambdaOpt(const lambdaName : string; var s : vaultFactoryStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.vaultLambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------