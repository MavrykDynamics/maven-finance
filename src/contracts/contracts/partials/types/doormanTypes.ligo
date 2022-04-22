type userStakeBalanceRecordType is [@layout:comb] record[
    balance                                : nat;
    participationFeesPerShare              : nat;
]
type userStakeBalanceLedgerType is big_map(address, userStakeBalanceRecordType)

type updateSatelliteBalanceParams is (address)

type doormanBreakGlassConfigType is [@layout:comb] record [
    stakeIsPaused           : bool;
    unstakeIsPaused         : bool;
    compoundIsPaused        : bool;
]

type farmClaimType is (address * nat * bool) // Recipient address + Amount claimes + forceTransfer instead of mintOrTransfer

type stakeType is 
  StakeAction of unit
| UnstakeAction of unit

type metadata is big_map (string, bytes)

type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]

type doormanLambdaActionType is 

  // Housekeeping Lambdas
  LambdaSetAdmin                    of address
| LambdaUpdateMetadata              of updateMetadataType
| LambdaUpdateMinMvkAmount          of (nat)
| LambdaUpdateWhitelistContracts    of updateWhitelistContractsParams
| LambdaUpdateGeneralContracts      of updateGeneralContractsParams

  // Pause / Break Glass Lambdas
| LambdaPauseAll                    of (unit)
| LambdaUnpauseAll                  of (unit)
| LambdaTogglePauseStake            of (unit)
| LambdaTogglePauseUnstake          of (unit)
| LambdaTogglePauseCompound         of (unit)

  // Doorman Lambdas
| LambdaStake                       of (nat)
| LambdaUnstake                     of (nat)
| LambdaCompound                    of (unit)
| LambdaFarmClaim                   of farmClaimType

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

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

  lambdaLedger              : lambdaLedgerType;
]

