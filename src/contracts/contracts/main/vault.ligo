// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Methods and Types
// ------------------------------------------------------------------------------

// Shared Methods
#include "../partials/shared/sharedMethods.ligo"

// Transfer Methods
#include "../partials/shared/transferMethods.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Vault Types
#include "../partials/contractTypes/vaultTypes.ligo"

// Vault Controller Types
#include "../partials/contractTypes/vaultControllerTypes.ligo"

// ------------------------------------------------------------------------------

type vaultActionType is 

    |   VaultDelegateTezToBaker            of vaultDelegateTezToBakerType
    |   VaultDelegateMvkToSatellite        of satelliteAddressType
    |   VaultWithdraw                      of vaultWithdrawType
    |   VaultDeposit                       of vaultDepositType 
    |   VaultEditDepositor                 of editDepositorType
  

const noOperations : list (operation) = nil;
type vaultReturn is list (operation) * vaultStorageType

// vault contract methods lambdas
type vaultUnpackLambdaFunctionType is (vaultLambdaActionType * vaultStorageTypeType) -> return



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders: Admin
function checkSenderIsAdmin(const s : vaultStorageType) : unit is
    if Tezos.get_sender() =/= s.admin then failwith(error_ONLY_ADMINISTRATOR_ALLOWED)
    else unit



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if Tezos.get_amount() =/= 0tez then failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ)
    else unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Misc Helper Functions Begin
// ------------------------------------------------------------------------------

// helper functions - conversions
function mutezToNatural(const amt : tez) : nat is amt / 1mutez;
function naturalToMutez(const amt : nat) : tez is amt * 1mutez;
function ceildiv(const numerator : nat; const denominator : nat) is abs( (- numerator) / (int (denominator)) );

// ------------------------------------------------------------------------------
// Misc Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to %registerDeposit entrypoint in the vault controller
function registerDepositInVaultController(const contractAddress : address) : contract(vaultControllerDepositType) is
    case (Tezos.get_entrypoint_opt(
        "%registerDeposit",
        contractAddress) : option(contract(vaultControllerDepositType))) of [
                Some(contr) -> contr
            |   None -> (failwith("Error. RegisterDeposit entrypoint in contract not found") : contract(vaultControllerDepositType))
        ];



// helper function to %delegateToSatellite entrypoint in the delegation contract
function getDelegateToSatelliteEntrypoint(const contractAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%delegateToSatellite",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None -> (failwith("Error. delegateToSatellite entrypoint in contract not found") : contract(address))
        ]

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Helper Functions End
//
// ------------------------------------------------------------------------------




// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------




// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(* vaultWithdraw entrypoint *)
function vaultWithdraw(const vaultWithdrawParams : vaultWithdrawType; var s : vaultStorageType) : vaultReturn is 
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
            const getTokenRecordView : option (option(collateralTokenRecordType)) = Tezos.call_view ("getTokenRecordByAddressOpt", token, s.admin);
            const getCollateralTokenRecordOpt : option(collateralTokenRecordType) = case getTokenRecordView of [
                  Some (_opt)    -> _opt
                | None           -> failwith ("Error. getTokenRecordByAddressOpt not found in contract.")
            ];
            const _collateralTokenRecord : collateralTokenRecordType = case getCollateralTokenRecordOpt of [
                  Some(_record)  -> _record
                | None           -> failwith ("Error. Collateral Token Record not found.")
            ];

            const transferOperation : operation = transferFa12Token(from_, to_, amt, token)

        } with transferOperation

        | Fa2(token)  -> block{
            
            // check collateral token contract address exists in USDM Token controller collateral token ledger
            const getTokenRecordView : option (option(collateralTokenRecordType)) = Tezos.call_view ("getTokenRecordByAddressOpt", token.tokenContractAddress, s.admin);
            const getCollateralTokenRecordOpt : option(collateralTokenRecordType) = case getTokenRecordView of [
                  Some (_opt)    -> _opt
                | None           -> failwith ("Error. getTokenRecordByAddressOpt not found in contract.")
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



(* vaultDelegateTezToBaker entrypoint *)
function vaultDelegateTezToBaker(const vaultDelegateParams : vaultDelegateTezToBakerType; var s : vaultStorageType) : vaultReturn is 
block {
    
    // set new delegate only if sender is the vault owner
    if Tezos.get_sender() =/= s.handle.owner then failwith("Error. Only the owner can delegate.") 
    else skip; 

    // init operations
    var operations : list(operation) := nil;
    
    const delegateToTezBakerOperation : operation = Tezos.set_delegate(vaultDelegateParams);
    
    operations := delegateToTezBakerOperation # operations;

} with (operations, s)




(* vaultDelegateMvkToSatellite entrypoint *)
function vaultDelegateMvkToSatellite(const satelliteAddress : address; var s : vaultStorageType) : vaultReturn is 
block {
    
    // set new delegate only if sender is the vault owner
    if Tezos.get_sender() =/= s.handle.owner then failwith("Error. Only the owner can delegate.") 
    else skip; 
    
    // init operations
    var operations : list(operation) := nil;

    // get delegation contract address through on-chain view to USDM Token Controller 
    const getContractAddressView : option (option(address)) = Tezos.call_view ("getContractAddressOpt", "delegation", s.admin);
    const getDelegationAddressOpt : option(address) = case getContractAddressView of [
          Some (_opt)    -> _opt
        | None           -> failwith ("Error. getContractAddressOpt not found in USDM Token Controller.")
    ];
    const delegationAddress : address = case getDelegationAddressOpt of [
          Some(_address)  -> _address
        | None           -> failwith ("Error. Delegation contract address not found.")
    ];

    // create delegate to satellite operation
    const delegateToSatelliteOperation : operation = Tezos.transaction(
        satelliteAddress,
        0tez,
        getDelegateToSatelliteEntrypoint(delegationAddress)
    );

    operations := delegateToSatelliteOperation # operations;

} with (operations, s)



(* vaultDeposit entrypoint *)
function vaultDeposit(const vaultDepositParams : vaultDepositType; var s : vaultStorageType) : vaultReturn is 
block {

    // init operations
    var operations : list(operation) := nil;

    // check if sender is owner
    var isOwnerCheck : bool := False;
    if Tezos.get_sender() = s.handle.owner then isOwnerCheck := True else isOwnerCheck := False;

    // check if sender is a whitelisted depositor
    const isAbleToDeposit : bool = case s.depositors of [
        | Any -> True
        | Whitelist(_depositors) -> _depositors contains Tezos.get_sender()
    ];
    
    // check that sender is either the vault owner or a depositor
    if isOwnerCheck = True or isAbleToDeposit = True then block {

        // deposit operation
        const from_      : address    = Tezos.get_sender();
        const to_        : address    = Tezos.get_self_address();
        const amt        : nat        = vaultDepositParams.amt;
        const token      : tokenType  = vaultDepositParams.token;

        if to_ =/= s.admin then failwith("Error. Deposit address should be admin.") else skip;

        case token of [

            | Tez(_tez) -> block{

                // check if tezos amount sent is equal to amount specified
                if mutezToNatural(Tezos.amount) =/= amt then failwith("Error. Tezos amount is not equal to amount specified.") else skip;

                // transfer tez to vault
                const depositTezOperation : operation = transferTez( (Tezos.get_contract_with_error(to_, "Error. Unable to send tez to vault.") : contract(unit)), amt );
                operations := depositTezOperation # operations;

                // create register deposit params
                const registerDepositParams : registerDepositType = record [
                    handle          = s.handle;
                    amount          = mutezToNatural(Tezos.amount); 
                    tokenName       = "tez";
                ];
                
                // create register deposit operation
                const registerTezDepositOperation : operation = Tezos.transaction(
                    registerDepositParams,
                    0mutez,
                    registerDepositInTokenController(s.admin)
                );

                // register tez deposit in USDM Token Controller
                operations := registerTezDepositOperation # operations;

            } 
            | Fa12(token) -> block {

                checkNoAmount(Unit);

                // check collateral token contract address exists in USDM Token controller collateral token ledger
                const getTokenRecordView : option (option(collateralTokenRecordType)) = Tezos.call_view ("getTokenRecordByAddressOpt", token, s.admin);
                const getCollateralTokenRecordOpt : option(collateralTokenRecordType) = case getTokenRecordView of [
                      Some (_opt)    -> _opt
                    | None           -> failwith ("Error. getContractAddressOpt not found in contract.")
                ];
                const collateralTokenRecord : collateralTokenRecordType = case getCollateralTokenRecordOpt of [
                      Some(_record)  -> _record
                    | None           -> failwith ("Error. Collateral Token Record not found.")
                ];

                // transfer tokens to vault
                const depositTokenOperation : operation = transferFa12Token(from_, to_, amt, token);
                operations := depositTokenOperation # operations;

                // create register deposit params
                const registerDepositParams : registerDepositType = record [
                    handle          = s.handle;
                    amount          = amt; 
                    tokenName       = collateralTokenRecord.tokenName;
                ];
                
                // create register deposit operation
                const registerTokenDepositOperation : operation = Tezos.transaction(
                    registerDepositParams,
                    0mutez,
                    registerDepositInTokenController(s.admin)
                );

                // register token deposit in USDM Token Controller
                operations := registerTokenDepositOperation # operations;

            } 

            | Fa2(token)  -> block{

                checkNoAmount(Unit);
                
                // check collateral token contract address exists in USDM Token controller collateral token ledger
                const getTokenRecordView : option (option(collateralTokenRecordType)) = Tezos.call_view ("getTokenRecordByAddressOpt", token.tokenContractAddress, s.admin);
                const getCollateralTokenRecordOpt : option(collateralTokenRecordType) = case getTokenRecordView of [
                      Some (_opt)    -> _opt
                    | None           -> failwith ("Error. getTokenRecordByAddressOpt not found in contract.")
                ];
                const collateralTokenRecord : collateralTokenRecordType = case getCollateralTokenRecordOpt of [
                      Some(_record)  -> _record
                    | None           -> failwith ("Error. Collateral Token Record not found.")
                ];

                // transfer tokens to vault
                const depositTokenOperation : operation = transferFa2Token(from_, to_, amt, token.tokenId, token.tokenContractAddress);
                operations := depositTokenOperation # operations;

                // create register deposit params
                const registerDepositParams : registerDepositType = record [
                    handle          = s.handle;
                    amount          = amt; 
                    tokenName       = collateralTokenRecord.tokenName;
                ];
                
                // create register deposit operation
                const registerTokenDepositOperation : operation = Tezos.transaction(
                    registerDepositParams,
                    0mutez,
                    registerDepositInTokenController(s.admin)
                );

                // register token deposit in USDM Token Controller
                operations := registerTokenDepositOperation # operations;
            }
        ];

    } else failwith("Error. You need to be authorised to deposit into this vault.");

} with (operations, s)



(* vaultEditDepositor entrypoint *)
function vaultEditDepositor(const editDepositorParams : editDepositorType; var s : vaultStorageType) : vaultReturn is
block {

    // set new depositor only if sender is the vault owner
    if Tezos.get_sender() =/= s.handle.owner then failwith("Error. Only the owner can delegate.") 
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

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const vaultAction : vaultActionType; const s : vaultStorageType) : vaultReturn is 

    case vaultAction of [

        |   VaultDelegateTezToBaker(parameters)       -> vaultDelegateTezToBaker(parameters, s)
        |   VaultDelegateMvkToSatellite(parameters)   -> vaultDelegateMvkToSatellite(parameters, s)
        |   VaultWithdraw(parameters)                 -> vaultWithdraw(parameters, s)
        |   VaultDeposit(parameters)                  -> vaultDeposit(parameters, s)
        |   VaultEditDepositor(parameters)            -> vaultEditDepositor(parameters, s)

    ]