// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; var s : vestingStorageType) : address is
    s.admin



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts(const _ : unit; var s : vestingStorageType) : whitelistContractsType is 
    s.whitelistContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; var s : vestingStorageType) : generalContractsType is 
    s.generalContracts



(* View: get total vested amount *)
[@view] function getTotalVestedAmount(const _ : unit; var s : vestingStorageType) : nat is 
    s.totalVestedAmount



(* View: get total vesting remainder of vestee *)
[@view] function getVesteeBalance(const vesteeAddress : address; var s : vestingStorageType) : nat is 
    case s.vesteeLedger[vesteeAddress] of [ 
            Some(_record) -> _record.totalRemainder
        |   None          -> failwith(error_VESTEE_NOT_FOUND)
    ];



(* View: get vestee record *)
[@view] function getVesteeOpt(const vesteeAddress : address; var s : vestingStorageType) : option(vesteeRecordType) is 
    Big_map.find_opt(vesteeAddress, s.vesteeLedger)



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; var s : vestingStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : vestingStorageType) : lambdaLedgerType is
    s.lambdaLedger

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------