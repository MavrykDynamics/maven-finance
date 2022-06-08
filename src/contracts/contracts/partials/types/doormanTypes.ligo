type userStakeBalanceRecordType is [@layout:comb] record[
    balance                                : nat;
    totalExitFeeRewardsClaimed             : nat;
    totalSatelliteRewardsClaimed           : nat;
    totalFarmRewardsClaimed                : nat;
    participationFeesPerShare              : nat;
]
type userStakeBalanceLedgerType is big_map(address, userStakeBalanceRecordType)

type updateSatelliteBalanceParams is (address)

type doormanBreakGlassConfigType is [@layout:comb] record [
    stakeIsPaused           : bool;
    unstakeIsPaused         : bool;
    compoundIsPaused        : bool;
    farmClaimIsPaused       : bool;
]

type farmClaimType is (address * nat * bool) // Recipient address + Amount claimes + forceTransfer instead of mintOrTransfer

type metadata is big_map (string, bytes)

type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]

type doormanLambdaActionType is 

  // Housekeeping Lambdas
  LambdaSetAdmin                    of address
| LambdaSetGovernance               of (address)
| LambdaUpdateMetadata              of updateMetadataType
| LambdaUpdateMinMvkAmount          of (nat)
| LambdaUpdateWhitelistContracts    of updateWhitelistContractsParams
| LambdaUpdateGeneralContracts      of updateGeneralContractsParams
| LambdaMistakenTransfer            of transferActionType
| LambdaMigrateFunds                of (address)

  // Pause / Break Glass Lambdas
| LambdaPauseAll                    of (unit)
| LambdaUnpauseAll                  of (unit)
| LambdaTogglePauseStake            of (unit)
| LambdaTogglePauseUnstake          of (unit)
| LambdaTogglePauseCompound         of (unit)
| LambdaTogglePauseFarmClaim        of (unit)

  // Doorman Lambdas
| LambdaStake                       of (nat)
| LambdaUnstake                     of (nat)
| LambdaCompound                    of (address)
| LambdaFarmClaim                   of farmClaimType

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type doormanStorage is [@layout:comb] record [
  admin                     : address;
  mvkTokenAddress           : address;
  governanceAddress         : address;
  metadata                  : metadata;
  
  minMvkAmount              : nat;
  
  whitelistContracts        : whitelistContractsType;      // whitelist of contracts that can access restricted entrypoints
  generalContracts          : generalContractsType;
  
  breakGlassConfig          : doormanBreakGlassConfigType;
  
  userStakeBalanceLedger    : userStakeBalanceLedgerType;  // user staked balance ledger

  unclaimedRewards          : nat; // current exit fee pool rewards

  accumulatedFeesPerShare   : nat;

  lambdaLedger              : lambdaLedgerType;
]

