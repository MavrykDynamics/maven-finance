type token_transfer_params_fa12 is michelson_pair(address, "from", michelson_pair(address, "to", nat, "value"), "")
type transfer_type_fa12 is TransferTypeFA12 of token_transfer_params_fa12


type addressId is map (address, nat)

type burn_token_params is michelson_pair(address, "from", nat, "value"), "")
type burn_token is BurnToken of burn_token_params

type mint_token_params is michelson_pair(address, "to", nat, "value"), "")
type mint_token is MintToken of mint_token_params

type request is record
  callback : contract(nat)
end

type get_total_supply_params is contract(amt)
type get_total_supply is GetTotalSupply of get_total_supply_params

type stakeRecord is record [
    time : timestamp;
    amount : nat;
    // operation_type : string; - add operation type for stake/unstake?
]
type userStakeRecords is big_map (nat, map (address, stakeRecord))

type storage is record [
    admin : address;    
    vmvkTokenAddress: address;
    mvkTokenAddress: address; 
    mvkTotalSupply: nat;
    vmvkTotalSupply: nat;
    userStakeRecord : userStakeRecords;
    addressId : addressId;
    votingContract : address; // may change
    r̶e̶w̶a̶r̶d̶R̶e̶c̶o̶r̶d̶:̶ r̶e̶w̶a̶r̶d̶R̶e̶c̶o̶r̶d̶s̶;̶ /̶/̶ m̶a̶y̶ c̶h̶a̶n̶g̶e̶
    lastUserId: nat;
]

const noOperations : list (operation) = nil;
type return is list (operation) * storage;

type stakeAction is 
    | Stake of (nat)
    | Unstake of (nat)
    |̶ C̶l̶a̶i̶m̶R̶e̶w̶a̶r̶d̶ o̶f̶ (̶u̶n̶i̶t̶)̶


// rewards - may be moved to separate module
type rewardRecords is big_map (nat, map(address, rewardRecord))
type rewardRecord is record [
    time: timestamp;
    amount: nat; 
]
type getRewardParam is record [
    start : timestamp;
    stop : timestamp;
    amount : nat;
]