type mapLength is nat
type token_transfer_params_fa12 is michelson_pair(address, "from", michelson_pair(address, "to", nat, "value"), "")
type transfer_type_fa12 is TransferTypeFA12 of token_transfer_params_fa12

type stakeRecord is record [
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

type userStakeRecords is big_map (address, map (nat, map(nat, stakeRecord)))
type addressId is map (address, nat)

type storage is record [
    contract : address;
    admin : address;    
    userStakeRecords : userStakeRecords;
    addressId : addressId;
]

const noOperations : list (operation) = nil;
type return is list (operation) * storage;

type stakeAction is 
    | Stake of (nat)
    | Unstake of (nat)
    | ClaimReward of (unit)
