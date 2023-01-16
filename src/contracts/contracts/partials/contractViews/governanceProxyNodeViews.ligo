// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : governanceProxyNodeStorageType) : address is
    s.admin



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; const s : governanceProxyNodeStorageType) : whitelistContractsType is
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; const s : governanceProxyNodeStorageType) : generalContractsType is
    s.generalContracts



(* View: get whitelist token contracts *)
[@view] function getWhitelistTokenContracts(const _ : unit; const s : governanceProxyNodeStorageType) : whitelistTokenContractsType is
    s.whitelistTokenContracts



(* View: get a proxy lambda *)
[@view] function getProxyLambdaOpt(const lambdaIndex : nat; const s : governanceProxyNodeStorageType) : option(bytes) is
    Big_map.find_opt(lambdaIndex, s.proxyLambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------