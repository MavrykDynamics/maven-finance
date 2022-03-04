type editDepositorType is
  | AllowAny of bool
  | AllowAccount of bool * address

type depositorsType is
  | Any
  | Whitelist of set(address)

type vaultCollateralType is 
    | XTZ of unit 
    | FA2 of unit 
    | FA12 of unit 

type vaultHandleType is [@layout:comb] record [
    id      : nat ;
    owner   : address;
]