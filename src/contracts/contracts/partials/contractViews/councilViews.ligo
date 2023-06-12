// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : councilStorageType) : address is
    s.admin



(* View: get config *)
[@view] function getConfig(const _ : unit; const s : councilStorageType) : councilConfigType is
    s.config



(* View: get council member opt *)
[@view] function getCouncilMemberOpt(const councilMemberAddress : address; const s : councilStorageType) : option(councilMemberInfoType) is
    Big_map.find_opt(councilMemberAddress, s.councilMembers)



(* View: get whitelist contracts opt *)
[@view] function getWhitelistContractOpt(const contractAddress : address; const s : councilStorageType) : option(unit) is 
    Big_map.find_opt(contractAddress, s.whitelistContracts)



(* get: general contracts opt *)
[@view] function getGeneralContractOpt(const contractName : string; const s : councilStorageType) : option(address) is
    Big_map.find_opt(contractName, s.generalContracts)



(* View: get a council action opt *)
[@view] function getCouncilActionOpt(const actionId: nat; const s : councilStorageType) : option(councilActionRecordType) is
    Big_map.find_opt(actionId, s.councilActionsLedger)



(* View: get a council action signer opt *)
[@view] function getCouncilActionSignerOpt(const signerId: (nat * address); const s : councilStorageType) : option(unit) is
    Big_map.find_opt(signerId, s.councilActionsSigners)



(* View: get the action counter *)
[@view] function getActionCounter(const _ : unit; const s : councilStorageType) : nat is
    s.actionCounter



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName: string; const s : councilStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.lambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------

