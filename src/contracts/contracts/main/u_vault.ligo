#include "../partials/vault/vaultType.ligo"

type collateralTokenRecordType is [@layout:comb] record [
    tokenName               : string;
    tokenContractAddress    : address;
    tokenType               : tokenType; // from vaultType.ligo partial - Tez, FA12, FA2
    decimals                : nat;
    oracleType              : string;    // "CFMM", "ORACLE" - use string instead of variant in case of future changes
    oracleAddress           : address;   // zeroAddress if no oracle
]

// helper functions - conversions
function mutezToNatural(const amt : tez) : nat is amt / 1mutez;
function naturalToMutez(const amt : nat) : tez is amt * 1mutez;
function ceildiv(const numerator : nat; const denominator : nat) is abs( (- numerator) / (int (denominator)) );

function transferTez(const to_ : contract(unit); const amt : nat) : operation is Tezos.transaction(unit, amt * 1mutez, to_)

// helper function to transfer FA12 tokens
function transferFa12Token(const from_: address; const to_: address; const tokenAmount: tokenAmountType; const tokenContractAddress: address): operation is
    block{
        const transferParams: fa12TransferType = (from_,(to_,tokenAmount));

        const tokenContract: contract(fa12TransferType) =
            case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress): option(contract(fa12TransferType))) of [
                Some (c) -> c
            |   None -> (failwith("Error. Transfer entrypoint not found in FA12 Token contract"): contract(fa12TransferType))
            ];
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



function checkSenderIsAdmin(var s : vaultStorage) : unit is
  if (Tezos.sender = s.admin) then unit
  else failwith("Error. Only the administrator can call this entrypoint.");

function checkNoAmount(const _p : unit) : unit is
  if (Tezos.amount = 0tez) then unit
  else failwith("Error. There should be no tez sent.");


// helper function to get registerDeposit entrypoint
function registerDepositInTokenController(const contractAddress : address) : contract(tokenControllerDepositType) is
  case (Tezos.get_entrypoint_opt(
      "%registerDeposit",
      contractAddress) : option(contract(tokenControllerDepositType))) of [
    Some(contr) -> contr
  | None -> (failwith("Error. RegisterDeposit entrypoint in contract not found") : contract(tokenControllerDepositType))
  ];



(* vaultWithdraw entrypoint *)
function vaultWithdraw(const vaultWithdrawParams : vaultWithdrawType; var s : vaultStorage) : vaultReturn is 
block {
    
    // check that sender is admin (token controller)
    checkSenderIsAdmin(s);

    // init operations
    var operations : list(operation) := nil;

    // withdraw operation
    const from_  : address    = vaultWithdrawParams.from_;
    const to_    : address    = vaultWithdrawParams.to_;
    const amt    : nat        = vaultWithdrawParams.amt;
    const token  : tokenType  = vaultWithdrawParams.token;

    const withdrawOperation : operation = case token of [
        | Tez(_tez) -> block {
            const transferOperation : operation = transferTez( (Tezos.get_contract_with_error(to_, "Error. Unable to send tez.") : contract(unit)), amt );
        } with transferOperation
        | Fa12(token) -> block {
            
            // check collateral token contract address exists in USDM Token controller collateral token ledger
            const getTokenRecordView : option (option(collateralTokenRecordType)) = Tezos.call_view ("viewGetTokenRecordByAddress", token, s.admin);
            const getCollateralTokenRecordOpt : option(collateralTokenRecordType) = case getTokenRecordView of [
                  Some (_opt)    -> _opt
                | None           -> failwith ("Error. viewGetTokenRecordByAddress not found in contract.")
            ];
            const _collateralTokenRecord : collateralTokenRecordType = case getCollateralTokenRecordOpt of [
                  Some(_record)  -> _record
                | None           -> failwith ("Error. Collateral Token Record not found.")
            ];

            const transferOperation : operation = transferFa12Token(from_, to_, amt, token)

        } with transferOperation

        | Fa2(token)  -> block{
            
            // check collateral token contract address exists in USDM Token controller collateral token ledger
            const getTokenRecordView : option (option(collateralTokenRecordType)) = Tezos.call_view ("viewGetTokenRecordByAddress", token.tokenContractAddress, s.admin);
            const getCollateralTokenRecordOpt : option(collateralTokenRecordType) = case getTokenRecordView of [
                  Some (_opt)    -> _opt
                | None           -> failwith ("Error. viewGetTokenRecordByAddress not found in contract.")
            ];
            const _collateralTokenRecord : collateralTokenRecordType = case getCollateralTokenRecordOpt of [
                  Some(_record)  -> _record
                | None           -> failwith ("Error. Collateral Token Record not found.")
            ];

            const transferOperation : operation = transferFa2Token(from_, to_, amt, token.tokenId, token.tokenContractAddress)

        } with transferOperation
    ];

    operations := withdrawOperation # operations;

} with (operations, s)



(* vaultDelegateTez (to baker) entrypoint *)
function vaultDelegateTez(const vaultDelegateParams : vaultDelegateTezType; var s : vaultStorage) : vaultReturn is 
block {
    
    // set new delegate only if sender is the vault owner
    if Tezos.sender =/= s.handle.owner then failwith("Error. Only the owner can delegate.") 
    else skip; 
    
    const delegateOperation : operation = Tezos.set_delegate(vaultDelegateParams);

} with (list[delegateOperation], s)



(* vaultDeposit entrypoint *)
function vaultDeposit(const vaultDepositParams : vaultDepositType; var s : vaultStorage) : vaultReturn is 
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
        const from_      : address    = vaultDepositParams.from_;
        const to_        : address    = vaultDepositParams.to_;
        const amt        : nat        = vaultDepositParams.amt;
        const token      : tokenType  = vaultDepositParams.token;

        if to_ =/= s.admin then failwith("Error. Deposit address should be admin.") else skip;

        const depositOperation : operation = case token of [
            | Tez(_tez) -> block{
                // check if tezos amount sent is equal to amount specified
                if mutezToNatural(Tezos.amount) =/= amt then failwith("Error. Tezos amount is not equal to amount specified.") else skip;
                const transferOperation : operation = transferTez( (Tezos.get_contract_with_error(to_, "Error. Unable to send tez.") : contract(unit)), amt );
            } with transferOperation
            | Fa12(token) -> block {

                checkNoAmount(Unit);

                // check collateral token contract address exists in USDM Token controller collateral token ledger
                const getTokenRecordView : option (option(collateralTokenRecordType)) = Tezos.call_view ("viewGetTokenRecordByAddress", token, s.admin);
                const getCollateralTokenRecordOpt : option(collateralTokenRecordType) = case getTokenRecordView of [
                      Some (_opt)    -> _opt
                    | None           -> failwith ("Error. viewGetTokenRecordByAddress not found in contract.")
                ];
                const _collateralTokenRecord : collateralTokenRecordType = case getCollateralTokenRecordOpt of [
                      Some(_record)  -> _record
                    | None           -> failwith ("Error. Collateral Token Record not found.")
                ];

                const transferOperation : operation = transferFa12Token(from_, to_, amt, token)

            } with transferOperation

            | Fa2(token)  -> block{

                checkNoAmount(Unit);
                
                // check collateral token contract address exists in USDM Token controller collateral token ledger
                const getTokenRecordView : option (option(collateralTokenRecordType)) = Tezos.call_view ("viewGetTokenRecordByAddress", token.tokenContractAddress, s.admin);
                const getCollateralTokenRecordOpt : option(collateralTokenRecordType) = case getTokenRecordView of [
                      Some (_opt)    -> _opt
                    | None           -> failwith ("Error. viewGetTokenRecordByAddress not found in contract.")
                ];
                const _collateralTokenRecord : collateralTokenRecordType = case getCollateralTokenRecordOpt of [
                      Some(_record)  -> _record
                    | None           -> failwith ("Error. Collateral Token Record not found.")
                ];

                const transferOperation : operation = transferFa2Token(from_, to_, amt, token.tokenId, token.tokenContractAddress)

            } with transferOperation
        ];

        // add depositOperation to list of operations to execute
        operations := depositOperation # operations;

        const registerDepositOperation : operation = case token of [
            | Tez(_tez) -> block {
                
                // create register deposit params
                const registerDepositParams : registerDepositType = record [
                    handle          = s.handle;
                    amount          = mutezToNatural(Tezos.amount); 
                    tokenName       = "tez";
                ];
                
                // create register deposit operation
                const registerDepositOperation : operation = Tezos.transaction(
                    registerDepositParams,
                    0mutez,
                    registerDepositInTokenController(s.admin)
                );

            } with registerDepositOperation
            | Fa12(token) -> block {

                // check collateral token contract address exists in USDM Token controller collateral token ledger
                const getTokenRecordView : option (option(collateralTokenRecordType)) = Tezos.call_view ("viewGetTokenRecordByAddress", token, s.admin);
                const getCollateralTokenRecordOpt : option(collateralTokenRecordType) = case getTokenRecordView of [
                      Some (_opt)    -> _opt
                    | None           -> failwith ("Error. viewGetTokenRecordByAddress not found in contract.")
                ];
                const collateralTokenRecord : collateralTokenRecordType = case getCollateralTokenRecordOpt of [
                      Some(_record)  -> _record
                    | None           -> failwith ("Error. Collateral Token Record not found.")
                ];

                // create register deposit params
                const registerDepositParams : registerDepositType = record [
                    handle          = s.handle;
                    amount          = amt; 
                    tokenName       = collateralTokenRecord.tokenName;
                ];
                
                // create register deposit operation
                const registerDepositOperation : operation = Tezos.transaction(
                    registerDepositParams,
                    0mutez,
                    registerDepositInTokenController(s.admin)
                );

            } with registerDepositOperation

            | Fa2(token)  -> block{
                
                // check collateral token contract address exists in USDM Token controller collateral token ledger
                const getTokenRecordView : option (option(collateralTokenRecordType)) = Tezos.call_view ("viewGetTokenRecordByAddress", token.tokenContractAddress, s.admin);
                const getCollateralTokenRecordOpt : option(collateralTokenRecordType) = case getTokenRecordView of [
                      Some (_opt)    -> _opt
                    | None           -> failwith ("Error. viewGetTokenRecordByAddress not found in contract.")
                ];
                const collateralTokenRecord : collateralTokenRecordType = case getCollateralTokenRecordOpt of [
                      Some(_record)  -> _record
                    | None           -> failwith ("Error. Collateral Token Record not found.")
                ];

                // create register deposit params
                const registerDepositParams : registerDepositType = record [
                    handle          = s.handle;
                    amount          = amt; 
                    tokenName       = collateralTokenRecord.tokenName;
                ];
                
                // create register deposit operation
                const registerDepositOperation : operation = Tezos.transaction(
                    registerDepositParams,
                    0mutez,
                    registerDepositInTokenController(s.admin)
                );

            } with registerDepositOperation
        ];

        // add registerDepositOperation to list of operations to execute
        operations := registerDepositOperation # operations;

    } else failwith("Error. You need to be authorised to deposit into this vault.");

} with (operations, s)



(* vaultEditDepositor entrypoint *)
function vaultEditDepositor(const editDepositorParams : editDepositorType; var s : vaultStorage) : vaultReturn is
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

function main (const vaultAction : vaultActionType; const s : vaultStorage) : vaultReturn is 
    case vaultAction of [
        | VaultDelegateTez(parameters)   -> vaultDelegateTez(parameters, s)
        | VaultWithdraw(parameters)      -> vaultWithdraw(parameters, s)
        | VaultDeposit(parameters)      -> vaultDeposit(parameters, s)
        | VaultEditDepositor(parameters) -> vaultEditDepositor(parameters, s)
    ]