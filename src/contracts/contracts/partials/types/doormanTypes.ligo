type userStakeBalanceRecordType is record[
    balance                                : nat;
    participationFeesPerShare              : nat;
    // emergencyGovernanceLastVotedTimestamp  : timestamp;
]
type userStakeBalanceLedgerType is big_map(address, userStakeBalanceRecordType)

type updateSatelliteBalanceParams is (address)

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

type doormanStorage is [@layout:comb] record [
  admin                     : address;
  mvkTokenAddress           : address;
  metadata                  : metadata;
  
  minMvkAmount              : nat;
  
  whitelistContracts        : whitelistContractsType;      // whitelist of contracts that can access restricted entrypoints
  generalContracts          : generalContractsType;
  
  breakGlassConfig          : doormanBreakGlassConfigType;
  
  userStakeBalanceLedger    : userStakeBalanceLedgerType;  // user staked balance ledger

  stakedMvkTotalSupply      : nat; // current total staked MVK
  unclaimedRewards          : nat; // current exit fee pool rewards

  logExitFee                : nat; // to be removed after testing
  logFinalAmount            : nat; // to be removed after testing

  accumulatedFeesPerShare   : nat;
]