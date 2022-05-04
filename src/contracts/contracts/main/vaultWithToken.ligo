#include "../partials/vault/vaultGeneralType.ligo"

#include "../partials/vault/vaultWithTokenType.ligo"

type vaultActionType is 
  | VaultDepositToken       of vaultDepositTokenType 
  | VaultEditTokenDepositor of editDepositorType
  | VaultWithdrawToken      of vaultWithdrawTokenType

const noOperations : list (operation) = nil;

function checkSenderIsAdmin(var s : vaultTokenStorage) : unit is
  if (Tezos.sender = s.admin) then unit
  else failwith("Error. Only the administrator can call this entrypoint.");

// helper function to get registerDeposit entrypoint
function getRegisterDepositEntrypointFromContractAddress(const contractAddress : address) : contract(registerTokenDepositType) is
  case (Tezos.get_entrypoint_opt(
      "%registerDeposit",
      contractAddress) : option(contract(registerTokenDepositType))) of [
    Some(contr) -> contr
  | None -> (failwith("Error. RegisterDeposit entrypoint in contract not found") : contract(registerTokenDepositType))
  ]

// helper function to transfer FA12 tokens
function transferFa12Token(const from_: address; const to_: address; const tokenAmount: tokenAmountType; const tokenContractAddress: address): operation is
    block{
        const transferParams: fa12TransferType = (from_,(to_,tokenAmount));

        const tokenContract: contract(fa12TransferType) =
            case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(fa12TransferType))) of [
                Some (c) -> c
            |   None -> (failwith("Error. Transfer entrypoint not found in FA12 Token contract"): contract(fa12TransferType))
            ]
    } with (Tezos.transaction(transferParams, 0tez, tokenContract))

// helper function to transfer FA2 tokens
function transferFa2Token(const from_: address; const to_: address; const tokenAmount: tokenAmountType; const tokenId: nat; const tokenContractAddress: address): operation is
block{
    const transferParams: fa2TransferType = list[
            record[
                from_ = from_;
                txs = list[
                    record[
                        to_      = to_;
                        token_id = tokenId;
                        amount   = tokenAmount;
                    ]
                ]
            ]
        ];

    const tokenContract: contract(fa2TransferType) =
        case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(fa2TransferType))) of [
            Some (c) -> c
        |   None -> (failwith("Error. Transfer entrypoint not found in FA2 Token contract"): contract(fa2TransferType))
        ];

} with (Tezos.transaction(transferParams, 0tez, tokenContract))

(* VaultWithdrawToken Entrypoint *)
function vaultWithdrawToken(const vaultWithdrawParams : vaultWithdrawTokenType; var s : vaultTokenStorage) : vaultTokenReturn is 
block {
    
    // check that sender is admin
    checkSenderIsAdmin(s);

    // init operations
    var operations : list(operation) := nil;

    // withdraw operation
    const from_  : address    = vaultWithdrawParams.from_;
    const to_    : address    = vaultWithdrawParams.to_;
    const amt    : nat        = vaultWithdrawParams.amt;
    const token  : tokenType  = vaultWithdrawParams.token;

    const withdrawOperation : operation = case token of [
        | Fa12(token) -> block {
            // check token contract address provided with collateral token address of vault
            if token =/= s.collateralTokenAddress then failwith("Error. Token address does not match collateral token address.") else skip;
            const transferOperation : operation = transferFa12Token(from_, to_, amt, token)
        } with transferOperation
        | Fa2(token)  -> block{
            // check token contract address provided with collateral token address of vault
            if token.tokenContractAddress =/= s.collateralTokenAddress then failwith("Error. Token address does not match collateral token address.") else skip;
            const transferOperation : operation = transferFa2Token(from_, to_, amt, token.tokenId, token.tokenContractAddress)
        } with transferOperation
    ];

    operations := withdrawOperation # operations;

} with (operations, s)


(* VaultDepositToken Entrypoint *)
function vaultDepositToken(const vaultDepositParams : vaultDepositTokenType; var s : vaultTokenStorage) : vaultTokenReturn is 
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

        // deposit operation
        const from_  : address    = vaultDepositParams.from_;
        const to_    : address    = vaultDepositParams.to_;
        const amt    : nat        = vaultDepositParams.amt;
        const token  : tokenType  = vaultDepositParams.token;

        if to_ =/= s.admin then failwith("Error. Deposit address should be admin.") else skip;

        const depositOperation : operation = case token of [
            | Fa12(token) -> block {
                // check token contract address provided with collateral token address of vault
                if token =/= s.collateralTokenAddress then failwith("Error. Token address does not match collateral token address.") else skip;
                const transferOperation : operation = transferFa12Token(from_, to_, amt, token)
            } with transferOperation
            | Fa2(token)  -> block{
                // check token contract address provided with collateral token address of vault
                if token.tokenContractAddress =/= s.collateralTokenAddress then failwith("Error. Token address does not match collateral token address.") else skip;
                const transferOperation : operation = transferFa2Token(from_, to_, amt, token.tokenId, token.tokenContractAddress)
            } with transferOperation
        ];

        // add depositOperation to list of operations to execute
        operations := depositOperation # operations;

    } else failwith("Error. You need to be authorised to deposit into this vault.");

} with (operations, s)

(* VaultEditTokenDepositor Entrypoint *)
function vaultEditTokenDepositor(const editDepositorParams : editDepositorType; var s : vaultTokenStorage) : vaultTokenReturn is
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

function main (const vaultAction : vaultActionType; const s : vaultTokenStorage) : vaultTokenReturn is 
    case vaultAction of [
        | VaultWithdrawToken(parameters)      -> vaultWithdrawToken(parameters, s)
        | VaultDepositToken(parameters)       -> vaultDepositToken(parameters, s)
        | VaultEditTokenDepositor(parameters) -> vaultEditTokenDepositor(parameters, s)
    ]