type vaultWithdrawTezType is tez * contract(unit)
type vaultDelegateTezType is option(key_hash)

type registerTezDepositType is [@layout:comb] record [
    handle  : vaultHandleType; 
    amount  : tez;
]

type vaultTezStorage is record [
    admin                   : address;                      // vault admin contract
    handle                  : vaultHandleType;       // owner of the vault
    depositors              : depositorsType;               // users who can deposit into the vault    
    vaultCollateralType     : vaultCollateralType;          // vault collateral type
]

type vaultTezReturn is list (operation) * vaultTezStorage
