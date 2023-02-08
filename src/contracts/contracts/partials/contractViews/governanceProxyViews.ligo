// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : governanceProxyStorageType) : address is
    s.admin



(* View: get whitelist contracts *)
// [@view] function getWhitelistContracts(const _ : unit; const s : governanceProxyStorageType) : whitelistContractsType is
//     s.whitelistContracts



// (* View: get general contracts *)
// [@view] function getGeneralContracts(const _ : unit; const s : governanceProxyStorageType) : generalContractsType is
//     s.generalContracts



// (* View: get whitelist token contracts *)
// [@view] function getWhitelistTokenContracts(const _ : unit; const s : governanceProxyStorageType) : whitelistTokenContractsType is
//     s.whitelistTokenContracts



(* View: get a proxy lambda *)
[@view] function getProxyLambdaOpt(const lambdaIndex : nat; const s : governanceProxyStorageType) : option(bytes) is
    Map.find_opt(lambdaIndex, s.proxyLambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------