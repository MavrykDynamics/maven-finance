type storage is record [
    admin : address;    
    // vMvkTokenAddress: address;
    // mvkTokenAddress: address; 
    // tempTotalSupply: amt;
    // tempMvkTotalSupply: nat;    
    // tempVMvkTotalSupply: nat;   
    // userStakeRecord : userStakeRecords;
    // addressId : addressId;
    // lastUserId: nat;
    // votingContract : address;
]

const noOperations : list (operation) = nil;
type return is list (operation) * storage

type stakeAction is 
    SetAdmin of (address)