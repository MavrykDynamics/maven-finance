
type editDepositorType is
  | AllowAny of bool
  | AllowAccount of bool * address

type vaultWithdrawType is tez * contract(unit)
type vaultDelegateType is option(key_hash)

type vaultHandleType is [@layout:comb] record [
    id      : nat ;
    owner   : address;
]

type depositorsType is
  | Any
  | Whitelist of set(address)

type registerDepositType is [@layout:comb] record [
    handle  : vaultHandleType; 
    amount  : tez;
]

type vaultCollateralType is 
    | XTZ of unit 
    | FA2 of unit 
    | FA12 of unit 

type vaultStorage is record [
    admin                   : address;              // vault admin contract
    handle                  : vaultHandleType;      // owner of the vault
    depositors              : depositorsType;       // users who can deposit into the vault    
    vaultCollateralType     : vaultCollateralType;  // vault collateral type
]

type vaultReturn is list (operation) * vaultStorage

type vaultActionType is 
  | VaultWithdraw      of vaultWithdrawType
  | VaultDelegate      of vaultDelegateType
  | [@annot:default] VaultDeposit
  | VaultEditDepositor of editDepositorType
  

const noOperations : list (operation) = nil;

function checkSenderIsAdmin(var s : vaultStorage) : unit is
  if (Tezos.sender = s.admin) then unit
  else failwith("Error. Only the administrator can call this entrypoint.");

// helper function to get registerDeposit entrypoint
function getRegisterDepositEntrypointFromContractAddress(const contractAddress : address) : contract(registerDepositType) is
  case (Tezos.get_entrypoint_opt(
      "%registerDeposit",
      contractAddress) : option(contract(registerDepositType))) of
    Some(contr) -> contr
  | None -> (failwith("Error. RegisterDeposit entrypoint in contract not found") : contract(registerDepositType))
  end;

(* VaultWithdraw Entrypoint *)
function vaultWithdraw(const vaultWithdrawParams : vaultWithdrawType; var s : vaultStorage) : vaultReturn is 
block {
    
    // check that sender is admin
    checkSenderIsAdmin(s);

    // withdraw operation
    const operation = Tezos.transaction(unit, vaultWithdrawParams.0, vaultWithdrawParams.1);

} with (list[operation], s)

(* VaultDelegate (to tez baker) Entrypoint *)
function vaultDelegate(const vaultDelegateParams : vaultDelegateType; var s : vaultStorage) : vaultReturn is 
block {
    
    // set new delegate only if sender is the vault owner
    if Tezos.sender =/= s.handle.owner then failwith("Error. Only the owner can delegate.") 
    else skip; 
    
    const delegateOperation : operation = Tezos.set_delegate(vaultDelegateParams);

} with (list[delegateOperation], s)

(* VaultDeposit Entrypoint *)
function vaultDeposit(var s : vaultStorage) : vaultReturn is 
block {

    // init operations
    var operations : list(operation) := nil;

    // check if sender is owner
    var isOwnerCheck : bool := False;
    if Tezos.sender = s.handle.owner then isOwnerCheck := True else isOwnerCheck := False;

    // check if sender is a whitelisted depositor
    const isAbleToDeposit : bool = case s.depositors of
        | Any -> True
        | Whitelist(_depositors) -> _depositors contains Tezos.sender
    end;
    
    // check that sender is either the vault owner or a depositor
    if isOwnerCheck = True or isAbleToDeposit = True then block {

        // create deposit params
        const depositParams : registerDepositType = record [
            amount = Tezos.amount; 
            handle = s.handle;
        ];
        
        // create deposit operation
        const depositOperation : operation = Tezos.transaction(
            depositParams,
            0mutez,
            getRegisterDepositEntrypointFromContractAddress(s.admin)
        );

        // add depositOperation to list of operations to execute
        operations := depositOperation # operations;

    } else failwith("Error. You need to be authorised to deposit into this vault.");

} with (operations, s)

(* VaultEditDepositor Entrypoint *)
function vaultEditDepositor(const editDepositorParams : editDepositorType; var s : vaultStorage) : vaultReturn is
block {

    // set new depositor only if sender is the vault owner
    if Tezos.sender =/= s.handle.owner then failwith("Error. Only the owner can delegate.") 
    else block {

        // if AllowAny and is true, then value is Any; if AllowAny and is false, then reset Whitelist to empty address set
        // if AllowAccount and bool is true, then add account to Whitelist set; else remove account from Whitelist set
        const emptyWhitelistSet : set(address) = set[];
        const depositors : depositorsType = case editDepositorParams of 
            | AllowAny(_allow) -> if _allow then Any else Whitelist(emptyWhitelistSet)
            | AllowAccount(_account) -> block {
                const editDepositors : depositorsType = case s.depositors of 
                    | Any -> failwith("Error. Set any off first")
                    | Whitelist(_depositors) -> Whitelist(if _account.0 then Set.add(_account.1, _depositors) else Set.remove(_account.1, _depositors))  
                end;
            } with editDepositors
        end;
        
        // update depositors
        s.depositors := depositors;

    };

} with (noOperations, s)

function main (const vaultAction : vaultActionType; const s : vaultStorage) : vaultReturn is 
    case vaultAction of
        | VaultWithdraw(parameters)      -> vaultWithdraw(parameters, s)
        | VaultDelegate(parameters)      -> vaultDelegate(parameters, s)
        | VaultDeposit(_parameters)      -> vaultDeposit(s)
        | VaultEditDepositor(parameters) -> vaultEditDepositor(parameters, s)
    end