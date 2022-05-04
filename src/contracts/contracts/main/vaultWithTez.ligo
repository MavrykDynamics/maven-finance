
#include "../partials/vault/vaultGeneralType.ligo"

#include "../partials/vault/vaultWithTezType.ligo"

type vaultActionType is 
  | VaultWithdrawTez      of vaultWithdrawTezType
  | VaultDelegateTez      of vaultDelegateTezType
  | [@annot:default] VaultDepositTez
  | VaultEditTezDepositor of editDepositorType
  
const noOperations : list (operation) = nil;

function checkSenderIsAdmin(var s : vaultTezStorage) : unit is
  if (Tezos.sender = s.admin) then unit
  else failwith("Error. Only the administrator can call this entrypoint.");

// helper function to get registerDeposit entrypoint
function getRegisterDepositEntrypointFromContractAddress(const contractAddress : address) : contract(registerTezDepositType) is
  case (Tezos.get_entrypoint_opt(
      "%registerDeposit",
      contractAddress) : option(contract(registerTezDepositType))) of [
    Some(contr) -> contr
  | None -> (failwith("Error. RegisterDeposit entrypoint in contract not found") : contract(registerTezDepositType))
  ]

(* VaultWithdrawTez Entrypoint *)
function vaultWithdrawTez(const vaultWithdrawParams : vaultWithdrawTezType; var s : vaultTezStorage) : vaultTezReturn is 
block {
    
    // check that sender is admin
    checkSenderIsAdmin(s);

    // withdraw operation
    const operation = Tezos.transaction(unit, vaultWithdrawParams.0, vaultWithdrawParams.1);

} with (list[operation], s)

(* VaultDelegateTez (to tez baker) Entrypoint *)
function vaultDelegateTez(const vaultDelegateParams : vaultDelegateTezType; var s : vaultTezStorage) : vaultTezReturn is 
block {
    
    // set new delegate only if sender is the vault owner
    if Tezos.sender =/= s.handle.owner then failwith("Error. Only the owner can delegate.") 
    else skip; 
    
    const delegateOperation : operation = Tezos.set_delegate(vaultDelegateParams);

} with (list[delegateOperation], s)

(* VaultDepositTez Entrypoint *)
function vaultDepositTez(var s : vaultTezStorage) : vaultTezReturn is 
block {

    // init operations
    var operations : list(operation) := nil;

    // check if sender is owner
    var isOwnerCheck : bool := False;
    if Tezos.sender = s.handle.owner then isOwnerCheck := True else isOwnerCheck := False;

    // check if sender is a whitelisted depositor
    const isAbleToDeposit : bool = case s.depositors of [
        | Any -> True
        | Whitelist(_depositors) -> _depositors contains Tezos.sender
    ];
    
    // check that sender is either the vault owner or a depositor
    if isOwnerCheck = True or isAbleToDeposit = True then block {

        // create deposit params
        const depositParams : registerTezDepositType = record [
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

(* VaultEditTezDepositor Entrypoint *)
function vaultEditTezDepositor(const editDepositorParams : editDepositorType; var s : vaultTezStorage) : vaultTezReturn is
block {

    // set new depositor only if sender is the vault owner
    if Tezos.sender =/= s.handle.owner then failwith("Error. Only the owner can delegate.") 
    else block {

        // if AllowAny and is true, then value is Any; if AllowAny and is false, then reset Whitelist to empty address set
        // if AllowAccount and bool is true, then add account to Whitelist set; else remove account from Whitelist set
        const emptyWhitelistSet : set(address) = set[];
        const depositors : depositorsType = case editDepositorParams of [
            | AllowAny(_allow) -> if _allow then Any else Whitelist(emptyWhitelistSet)
            | AllowAccount(_account) -> block {
                const editDepositors : depositorsType = case s.depositors of [
                    | Any -> failwith("Error. Set any off first")
                    | Whitelist(_depositors) -> Whitelist(if _account.0 then Set.add(_account.1, _depositors) else Set.remove(_account.1, _depositors))  
                ];
            } with editDepositors
        ];
        
        // update depositors
        s.depositors := depositors;

    };

} with (noOperations, s)

function main (const vaultAction : vaultActionType; const s : vaultTezStorage) : vaultTezReturn is 
    case vaultAction of [
        | VaultWithdrawTez(parameters)      -> vaultWithdrawTez(parameters, s)
        | VaultDelegateTez(parameters)      -> vaultDelegateTez(parameters, s)
        | VaultDepositTez(_parameters)      -> vaultDepositTez(s)
        | VaultEditTezDepositor(parameters) -> vaultEditTezDepositor(parameters, s)
    ]