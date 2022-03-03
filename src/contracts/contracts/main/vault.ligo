
type tokenBalanceType   is nat;
type tokenAmountType    is nat;

type transferDestination is [@layout:comb] record[
  to_       : address;
  token_id  : nat;
  amount    : tokenAmountType;
]
type transfer is [@layout:comb] record[
  from_     : address;
  txs       : list(transferDestination);
]
type fa2TransferType  is list(transfer)
type fa12TransferType is michelson_pair(address, "from", michelson_pair(address, "to", nat, "value"), "")

type fa12TokenType       is address
type fa2TokenType        is [@layout:comb] record [
  tokenContractAddress    : address;
  tokenId                 : nat;
]

type tokenType       is
| Fa12                    of fa12TokenType   // address
| Fa2                     of fa2TokenType    // record [ tokenContractAddress : address; tokenId : nat; ]

type transferTokenType is [@layout:comb] record [
    from_           : address;
    to_             : address;
    amt             : nat;
    token           : tokenType;
]

type vaultWithdrawType is transferTokenType
type vaultDepositType  is transferTokenType

type editDepositorType is
  | AllowAny of bool
  | AllowAccount of bool * address

type vaultHandleType is [@layout:comb] record [
    id      : nat ;
    owner   : address;
]

type depositorsType is
  | Any
  | Whitelist of set(address)

type registerDepositType is [@layout:comb] record [
    handle  : vaultHandleType; 
    amount  : nat;
]

type vaultCollateralType is 
    | XTZ of unit 
    | FA2 of unit 
    | FA12 of unit 

type vaultStorage is record [
    admin                   : address;              // vault admin contract
    handle                  : vaultHandleType;      // owner of the vault
    depositors              : depositorsType;       // users who can deposit into the vault    
    collateralTokenAddress  : address;              // token contract address of collateral 
    vaultCollateralType     : vaultCollateralType;  // vault collateral type
]

type vaultReturn is list (operation) * vaultStorage

type vaultActionType is 
  | VaultDeposit       of vaultDepositType 
  | VaultEditDepositor of editDepositorType
  | VaultWithdraw      of vaultWithdrawType

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

// helper function to transfer FA12 tokens
function transferFa12Token(const from_: address; const to_: address; const tokenAmount: tokenAmountType; const tokenContractAddress: address): operation is
    block{
        const transferParams: fa12TransferType = (from_,(to_,tokenAmount));

        const tokenContract: contract(fa12TransferType) =
            case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(fa12TransferType))) of
                Some (c) -> c
            |   None -> (failwith("Error. Transfer entrypoint not found in FA12 Token contract"): contract(fa12TransferType))
            end;
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
        case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(fa2TransferType))) of
            Some (c) -> c
        |   None -> (failwith("Error. Transfer entrypoint not found in FA2 Token contract"): contract(fa2TransferType))
        end;

} with (Tezos.transaction(transferParams, 0tez, tokenContract))

(* VaultWithdraw Entrypoint *)
function vaultWithdraw(const vaultWithdrawParams : transferTokenType; var s : vaultStorage) : vaultReturn is 
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

    const withdrawOperation : operation = case token of 
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
    end;

    operations := withdrawOperation # operations;

} with (operations, s)


(* VaultDeposit Entrypoint *)
function vaultDeposit(const vaultDepositParams : transferTokenType; var s : vaultStorage) : vaultReturn is 
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

        // deposit operation
        const from_  : address    = vaultDepositParams.from_;
        const to_    : address    = vaultDepositParams.to_;
        const amt    : nat        = vaultDepositParams.amt;
        const token  : tokenType  = vaultDepositParams.token;

        if to_ =/= s.admin then failwith("Error. Deposit address should be admin.") else skip;

        const depositOperation : operation = case token of 
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
        end;

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
        | VaultDeposit(parameters)       -> vaultDeposit(parameters, s)
        | VaultEditDepositor(parameters) -> vaultEditDepositor(parameters, s)
    end