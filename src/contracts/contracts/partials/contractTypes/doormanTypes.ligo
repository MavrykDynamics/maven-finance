type userStakeBalanceRecordType is [@layout:comb] record[
    balance                                : nat;
    totalExitFeeRewardsClaimed             : nat;
    totalSatelliteRewardsClaimed           : nat;
    totalFarmRewardsClaimed                : nat;
    participationFeesPerShare              : nat;
]
type userStakeBalanceLedgerType is big_map(address, userStakeBalanceRecordType)

type updateSatelliteBalanceType is (address)

type doormanBreakGlassConfigType is [@layout:comb] record [
    stakeIsPaused           : bool;
    unstakeIsPaused         : bool;
    compoundIsPaused        : bool;
    farmClaimIsPaused       : bool;
]

type farmClaimType is (address * nat * bool) // Recipient address + Amount claimes + forceTransfer instead of mintOrTransfer

type doormanConfigType is [@layout:comb] record [
    minMvkAmount     : nat;
    empty            : unit
];

type doormanUpdateConfigNewValueType is nat
type doormanUpdateConfigActionType is 
  ConfigMinMvkAmount          of unit
| Empty                       of unit
type doormanUpdateConfigParamsType is [@layout:comb] record [
  updateConfigNewValue: doormanUpdateConfigNewValueType; 
  updateConfigAction: doormanUpdateConfigActionType;
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
type doormanPausableEntrypointType is
  Stake             of bool
| Unstake           of bool
| Compound          of bool
| FarmClaim         of bool

type doormanTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : doormanPausableEntrypointType;
    empty             : unit
];

type doormanLambdaActionType is 

  // Housekeeping Lambdas
  LambdaSetAdmin                    of address
| LambdaSetGovernance               of (address)
| LambdaUpdateMetadata              of updateMetadataType
| LambdaUpdateConfig                of doormanUpdateConfigParamsType
| LambdaUpdateWhitelistContracts    of updateWhitelistContractsType
| LambdaUpdateGeneralContracts      of updateGeneralContractsType
| LambdaMistakenTransfer            of transferActionType
| LambdaMigrateFunds                of (address)

  // Pause / Break Glass Lambdas
| LambdaPauseAll                    of (unit)
| LambdaUnpauseAll                  of (unit)
| LambdaTogglePauseEntrypoint       of doormanTogglePauseEntrypointType

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

<<<<<<< HEAD:src/contracts/contracts/partials/types/doormanTypes.ligo
// type doormanActionType is 
//     SetAdmin    of address
//   | Stake       of nat


type doormanStorage is [@layout:comb] record [
=======
type doormanStorageType is [@layout:comb] record [
>>>>>>> 692fb711a00cb76e5adcc9aa4c017a1e3874efda:src/contracts/contracts/partials/contractTypes/doormanTypes.ligo
  admin                     : address;
  metadata                  : metadataType;
  config                    : doormanConfigType;

  mvkTokenAddress           : address;
  governanceAddress         : address;
  
  whitelistContracts        : whitelistContractsType;      // whitelist of contracts that can access restricted entrypoints
  generalContracts          : generalContractsType;
  
  breakGlassConfig          : doormanBreakGlassConfigType;
  
  userStakeBalanceLedger    : userStakeBalanceLedgerType;  // user staked balance ledger

  unclaimedRewards          : nat; // current exit fee pool rewards
  accumulatedFeesPerShare   : nat;

  lambdaLedger              : lambdaLedgerType;
]

