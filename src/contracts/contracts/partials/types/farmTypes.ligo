
////
// COMMON TYPES
////
type delegator is address
type tokenBalance is nat

type delegatorRecord is [@layout:comb] record[
    balance: tokenBalance;
    participationMVKPerShare: tokenBalance;
    unclaimedRewards: tokenBalance;
]
type claimedRewards is [@layout:comb] record[
    unpaid: tokenBalance;
    paid: tokenBalance;
]
type plannedRewards is [@layout:comb] record[
    totalBlocks: nat;
    currentRewardPerBlock: tokenBalance;
    totalRewards: tokenBalance;
]
type lpStandard is
    Fa12 of unit
|   Fa2 of unit
type lpToken is [@layout:comb] record[
    tokenAddress: address;
    tokenId: nat;
    tokenStandard: lpStandard;
    tokenBalance: tokenBalance;
]

type farmBreakGlassConfigType is [@layout:comb] record [
    depositIsPaused         : bool;
    withdrawIsPaused        : bool;
    claimIsPaused           : bool;
]

type farmConfigType is record [
    lpToken                     : lpToken;
    infinite                    : bool;
    forceRewardFromTransfer     : bool;
    blocksPerMinute             : nat;
    plannedRewards              : plannedRewards;
]

type metadata is big_map (string, bytes);

////
// INPUTS
////
(* Transfer entrypoint inputs for FA12 and FA2 *)
type transferDestination is [@layout:comb] record[
  to_: address;
  token_id: nat;
  amount: tokenBalance;
]
type transfer is [@layout:comb] record[
  from_: address;
  txs: list(transferDestination);
]
type newTransferType is list(transfer)
type oldTransferType is michelson_pair(address, "from", michelson_pair(address, "to", nat, "value"), "")

(* initFarm entrypoint inputs *)
type initFarmParamsType is [@layout:comb] record[
    totalBlocks: nat;
    currentRewardPerBlock: nat;
    blocksPerMinute: nat;
    forceRewardFromTransfer: bool;
    infinite: bool;
]

(* doorman's farmClaim entrypoint inputs *)
type farmClaimType is (address * nat * bool) // Recipient address + Amount claimes + forceTransfer instead of mintOrTransfer

(* updateConfig entrypoint inputs *)
type farmUpdateConfigNewValueType is nat
type farmUpdateConfigActionType is 
  ConfigForceRewardFromTransfer of unit
| ConfigRewardPerBlock of unit
type farmUpdateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue: farmUpdateConfigNewValueType; 
  updateConfigAction: farmUpdateConfigActionType;
]