// type token_transfer_params_fa12 is michelson_pair(address, "from", michelson_pair(address, "to", nat, "value"), "")
// type transfer_type_fa12 is TransferTypeFA12 of token_transfer_params_fa12

type amt is nat;

type addressId is map (address, nat)

type burn_token_params is michelson_pair(address, "from", nat, "value")
type burn_token is BurnToken of burn_token_params

type mint_token_params is michelson_pair(address, "to", nat, "value")
type mint_token is MintToken of mint_token_params

type request is record
  callback : contract(nat)
end

type get_total_supply_params is contract(amt)
type get_total_supply is GetTotalSupply of get_total_supply_params

type stakeRecord is record [
    time : timestamp;
    amount : nat;
    op_type : string; // stake / unstake 
]
type userStakeRecords is big_map (nat, map (address, stakeRecord))

type storage is record [
    admin : address;    
    vmvkTokenAddress: address;
    mvkTokenAddress: address; 
    tempTotalSupply: amt;
    tempMvkTotalSupply: nat;    
    tempVmvkTotalSupply: nat;   
    userStakeRecord : userStakeRecords;
    addressId : addressId;
    votingContract : address;
    lastUserId: nat;
]

const noOperations : list (operation) = nil;
type return is list (operation) * storage;

type stakeAction is 
    | Stake of (nat)
    | Unstake of (nat)