// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

type validationTransferType is record [
    from_       : address;
    to_         : address;
    token_id    : nat;
    amount      : nat;
]

type freezeRuleEngineStorageType is record [
    administrator       : address;
    frozen_accounts     : big_map(address, unit);
]

// ------------------------------------------------------------------------------

type action is

        Freeze_account        of address
    |   Unfreeze_account      of address
        
    
type return is list (operation) * freezeRuleEngineStorageType
const noOperations : list (operation) = nil;



function verifySenderIsAdmin(const s : freezeRuleEngineStorageType) : unit is 
block {

    if Tezos.get_sender() = s.administrator then skip else failwith(error_NOT_ADMIN);

} with unit



(* view_is_transfer_valid *)
[@view] function view_is_transfer_valid(const validation_transfer : validationTransferType; var s : freezeRuleEngineStorageType) : bool is
block {

    const from_is_frozen : bool = case s.frozen_accounts[validation_transfer.from_] of [
            Some (_v) -> True
        |   None      -> False
    ];

    const to_is_frozen : bool = case s.frozen_accounts[validation_transfer.to_] of [
            Some (_v) -> True
        |   None      -> False
    ];

    const is_transfer_valid : bool = if from_is_frozen = True or to_is_frozen = True then False else True;

} with is_transfer_valid



(* freeze_account entrypoint *)
function freeze_account(const account : address; const s : freezeRuleEngineStorageType) : return is
block{

    verifySenderIsAdmin(s);
    s.frozen_accounts[account] := unit;

} with (noOperations, s)



(* unfreeze_account entrypoint *)
function unfreeze_account(const account : address; const s : freezeRuleEngineStorageType) : return is
block{

    verifySenderIsAdmin(s);
    remove account from map s.frozen_accounts;

} with (noOperations, s)



(* main entrypoint *)
function main (const action : action; const s : freezeRuleEngineStorageType) : return is
case action of [

        Freeze_account (params)             -> freeze_account(params, s)
    |   Unfreeze_account (params)           -> unfreeze_account(params, s)
]
