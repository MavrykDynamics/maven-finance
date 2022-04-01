type userStakeBalanceRecordType is record[
    balance                                : nat;
    participationFeesPerShare              : nat;
    // emergencyGovernanceLastVotedTimestamp  : timestamp;
]
type userStakeBalanceLedgerType is big_map(address, userStakeBalanceRecordType)

type updateSatelliteBalanceParams is (address * nat * nat)

type doormanBreakGlassConfigType is record [
    stakeIsPaused           : bool;
    unstakeIsPaused         : bool;
    compoundIsPaused        : bool;
]

const fixedPointAccuracy: nat = 1_000_000_000_000_000_000_000_000_000_000_000_000n // 10^36

type getSatelliteBalanceType is (address * string * string * string * nat * contract(string * string * string * nat * nat)) // name, description, image, satellite fee
type satelliteInfoType is (string * string * string * nat * nat) // name, description, image, satellite fee, sMVK balance

type farmClaimType is (address * nat * bool) // Recipient address + Amount claimes + forceTransfer instead of mintOrTransfer

type stakeType is 
  StakeAction of unit
| UnstakeAction of unit

type metadata is big_map (string, bytes);
