// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin *)
[@view] function getAdmin(const _ : unit; var s : lendingControllerStorageType) : address is
    s.admin



(* View: get config *)
[@view] function getConfig(const _ : unit; var s : lendingControllerStorageType) : lendingControllerConfigType is
    s.config



(* View: get break glass config *)
[@view] function getBreakGlassConfig(const _ : unit; var s : lendingControllerStorageType) : lendingControllerBreakGlassConfigType is
    s.breakGlassConfig



(* View: get Governance address *)
[@view] function getGovernanceAddress(const _ : unit; var s : lendingControllerStorageType) : address is
    s.governanceAddress



(* View: get whitelist contracts opt *)
[@view] function getWhitelistContractOpt(const contractAddress : address; const s : lendingControllerStorageType) : option(unit) is 
    Big_map.find_opt(contractAddress, s.whitelistContracts)



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; var s : lendingControllerStorageType) : generalContractsType is
    s.generalContracts



(* View: get token in collateral token ledger *)
[@view] function getColTokenRecordByNameOpt(const tokenName : string; const s : lendingControllerStorageType) : option(collateralTokenRecordType) is
    Big_map.find_opt(tokenName, s.collateralTokenLedger)



(* View: get loan token record *)
[@view] function getLoanTokenRecordOpt(const tokenName : string; const s : lendingControllerStorageType) : option(loanTokenRecordType) is
    Big_map.find_opt(tokenName, s.loanTokenLedger)



(* View: get owned vaults by user *)
[@view] function getOwnedVaultsByUserOpt(const ownerAddress : address; const s : lendingControllerStorageType) : option(ownerVaultSetType) is
    Big_map.find_opt(ownerAddress, s.ownerLedger)



(* View: get vault by handle *)
[@view] function getVaultOpt(const vaultHandle : vaultHandleType; const s : lendingControllerStorageType) : option(vaultRecordType) is
    Big_map.find_opt(vaultHandle, s.vaults)



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; var s : lendingControllerStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.lambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------