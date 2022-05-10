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
]

type farmClaimType is (address * nat * bool) // Recipient address + Amount claimes + forceTransfer instead of mintOrTransfer

type setLambdaType is [@layout:comb] record [
      name                  : string;
      func_bytes            : bytes;
]
type lambdaLedgerType is big_map(string, bytes)

type stakeType is 
  StakeAction of unit
| UnstakeAction of unit

type metadata is big_map (string, bytes)

type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]


// vault and usdm types
type vaultHandleType is [@layout:comb] record [
    id      : nat ;
    owner   : address;
]
type tokenBalanceType            is nat;
type collateralNameType          is string;
type collateralBalanceLedgerType  is map(collateralNameType, tokenBalanceType) // to keep record of token collateral (tez/token)
type vaultType is [@layout:comb] record [
    address                     : address;
    collateralBalanceLedger     : collateralBalanceLedgerType;  // tez/token balance
    usdmOutstanding             : nat;                    
]
type vaultDepositStakedMvkType is [@layout:comb] record [
    vaultId          : nat;
    depositAmount    : nat;
]
type vaultWithdrawStakedMvkType is [@layout:comb] record [
    vaultId          : nat;
    withdrawAmount   : nat;
]
type vaultLiquidateStakedMvkType is [@layout:comb] record [
    liquidatedAmount  : nat; 
    vaultId           : nat;
    vaultOwner        : address; 
    liquidator        : address; 
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
| LambdaCompound                    of (address)
| LambdaFarmClaim                   of farmClaimType

  // Vault Lambdas
| LambdaVaultDepositStakedMvk       of vaultDepositStakedMvkType
| LambdaVaultWithdrawStakedMvk      of vaultWithdrawStakedMvkType
| LambdaVaultLiquidateStakedMvk     of vaultLiquidateStakedMvkType

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

// type doormanActionType is 
//     SetAdmin    of address
//   | Stake       of nat


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

