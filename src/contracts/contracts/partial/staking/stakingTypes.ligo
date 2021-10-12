type stakeFlex is record [
    time : timestamp;
    amount : nat;
    reward : nat;
    rate : nat
]

type stakeLock is record [
    time : timestamp;
    period : int;
    rate : nat;
    amount : nat
]
type stakingOption is record [
    minStake : nat;
    maxStake : nat;
    stakingPeriod : int;
    rate : nat
]
type stakeLockParam is record [
    pack : nat; 
    am : nat
]
type getRewardParam is record [
    start : timestamp;
    stop : timestamp;
    amount : nat;
    rate : nat
]
type unstakeLockParam is record [
    pack : nat;
    index : nat
]
type createStakingOptionParam is record [
    pack : stakingOption;
    id : nat
]
type mapLength is nat
type token_transfer_params_fa12 is michelson_pair(address, "from", michelson_pair(address, "to", nat, "value"), "")
type transfer_type_fa12 is TransferTypeFA12 of token_transfer_params_fa12
type userStakeFlexPacks is big_map (nat, map (address, stakeFlex))
type userStakeLockPacks is big_map (address, map (nat, map(nat, stakeLock)))
type options is map (nat, stakingOption)
type addressID is map (address, nat)
type storage is record [
    contract : address;
    admin : address;
    reserve : address;
    userStakeFlexPack : userStakeFlexPacks;
    userStakeLockPack : userStakeLockPacks;
    stakingOptions : options;
    votingContract : address;
    addressId : addressID;
    maxValuesNb : nat;
    stakeFlexLength : nat;
]
const noOperations : list (operation) = nil;
type return is list (operation) * storage;

type stakeAction is 
    | StakeFlexed of (nat)
    | StakeLocked of stakeLockParam
    | CreateStakingOpt of createStakingOptionParam
    | UnstakeLocked of unstakeLockParam
    | UnstakeFlexed of (nat)
    | ClaimRewardFlexed of (unit)
    | SetMaxValue of (nat)
    | SetContract of (address)
    | SetReserve of (address)
