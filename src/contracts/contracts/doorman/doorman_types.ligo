type mapLength is nat
type token_transfer_params_fa12 is michelson_pair(address, "from", michelson_pair(address, "to", nat, "value"), "")
type transfer_type_fa12 is TransferTypeFA12 of token_transfer_params_fa12

type stake_record is record [
    time : timestamp;
    period : int;
    amount : nat;
    reward : nat;
]

type getRewardParam is record [
    start : timestamp;
    stop : timestamp;
    amount : nat;
]

type user_stake_records is big_map (address, map (nat, map(nat, stake_record)))
type address_id is map (address, nat)

type storage is record [
    contract : address;
    admin : address;    
    user_stake_records : user_stake_records;
    addressId : address_id;
]

const noOperations : list (operation) = nil;
type return is list (operation) * storage;

type stakeAction is 
    | Stake of (nat)
    | Unstake of (nat)
    | ClaimReward of (unit)
