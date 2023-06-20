// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; const s : vestingStorageType) : address is
    s.admin



(* View: get whitelist contracts opt *)
[@view] function getWhitelistContractOpt(const contractAddress : address; const s : vestingStorageType) : option(unit) is 
    Big_map.find_opt(contractAddress, s.whitelistContracts)



(* get: general contracts opt *)
[@view] function getGeneralContractOpt(const contractName : string; const s : vestingStorageType) : option(address) is
    Big_map.find_opt(contractName, s.generalContracts)



(* View: get total vested amount *)
[@view] function getTotalVestedAmount(const _ : unit; const s : vestingStorageType) : nat is 
    s.totalVestedAmount



(* View: get total vesting remainder of vestee *)
[@view] function getVesteeBalance(const vesteeAddress : address; const s : vestingStorageType) : nat is 
    case s.vesteeLedger[vesteeAddress] of [ 
            Some(_record) -> _record.totalRemainder
        |   None          -> failwith(error_VESTEE_NOT_FOUND)
    ];



(* View: get vestee record *)
[@view] function getVesteeOpt(const vesteeAddress : address; const s : vestingStorageType) : option(vesteeRecordType) is 
    Big_map.find_opt(vesteeAddress, s.vesteeLedger)



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; const s : vestingStorageType) : option(bytes) is
    Big_map.find_opt(lambdaName, s.lambdaLedger)

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------