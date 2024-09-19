// ------------------------------------------------------------------------------
// Storage Types
// ------------------------------------------------------------------------------


type userStakeBalanceRecordType is [@layout:comb] record[
    balance                                : nat;
    totalExitFeeRewardsClaimed             : nat;
    totalSatelliteRewardsClaimed           : nat;
    totalFarmRewardsClaimed                : nat;
    participationFeesPerShare              : nat;
]
type userStakeBalanceLedgerType is big_map(address, userStakeBalanceRecordType)

type doormanBreakGlassConfigType is [@layout:comb] record [
    
    stakeMvnIsPaused        : bool;
    unstakeMvnIsPaused      : bool;
    exitIsPaused            : bool;
    compoundIsPaused        : bool;
    farmClaimIsPaused       : bool;

    // vault entrypoints
    onVaultDepositStakeIsPaused    : bool;
    onVaultWithdrawStakeIsPaused   : bool;
    onVaultLiquidateStakeIsPaused  : bool;

]

type doormanConfigType is [@layout:comb] record [
    minMvnAmount     : nat;
    empty            : unit
];


// ------------------------------------------------------------------------------
// Action Types
// ------------------------------------------------------------------------------

type farmClaimDepositorType is (address * nat)
type farmClaimType is (set(farmClaimDepositorType) * bool) // Recipient address + Amount claimed + forceTransfer instead of mintOrTransfer

type doormanUpdateConfigNewValueType is nat
type doormanUpdateConfigActionType is 
        ConfigMinMvnAmount          of unit
    |   Empty                       of unit

type doormanUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue    : doormanUpdateConfigNewValueType; 
    updateConfigAction      : doormanUpdateConfigActionType;
]

type onVaultDepositStakeType is [@layout:comb] record [
    vaultOwner       : address;
    vaultAddress     : address;
    depositAmount    : nat;
]
type onVaultWithdrawStakeType is [@layout:comb] record [
    vaultOwner       : address;
    vaultAddress     : address;
    withdrawAmount   : nat;
]

type onVaultLiquidateStakeSingleType is [@layout:comb] record [
    vaultAddress      : address;
    liquidator        : address; 
    liquidatedAmount  : nat; 
]
type onVaultLiquidateStakeType is list(onVaultLiquidateStakeSingleType)

type doormanPausableEntrypointType is
        StakeMvn                      of bool
    |   UnstakeMvn                    of bool
    |   Exit                          of bool
    |   Compound                      of bool
    |   FarmClaim                     of bool
    |   OnVaultDepositStake           of bool
    |   OnVaultWithdrawStake          of bool
    |   OnVaultLiquidateStake         of bool

type doormanTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : doormanPausableEntrypointType;
    empty             : unit
];


// ------------------------------------------------------------------------------
// Lambda Action Types
// ------------------------------------------------------------------------------


type doormanLambdaActionType is 

        // Housekeeping Lambdas
        LambdaSetAdmin                    of address
    |   LambdaSetGovernance               of (address)
    |   LambdaUpdateMetadata              of updateMetadataType
    |   LambdaUpdateConfig                of doormanUpdateConfigParamsType
    |   LambdaUpdateWhitelistContracts    of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts      of updateGeneralContractsType
    |   LambdaMistakenTransfer            of transferActionType
    |   LambdaMigrateFunds                of (address)

        // Pause / Break Glass Lambdas
    |   LambdaPauseAll                    of (unit)
    |   LambdaUnpauseAll                  of (unit)
    |   LambdaTogglePauseEntrypoint       of doormanTogglePauseEntrypointType

        // Doorman Lambdas
    |   LambdaStakeMvn                    of (nat)
    |   LambdaUnstakeMvn                  of (nat)
    |   LambdaExit                        of (unit)
    |   LambdaCompound                    of set(address)
    |   LambdaFarmClaim                   of farmClaimType

        // Vault Lambdas
    |   LambdaOnVaultDepositStake         of onVaultDepositStakeType
    |   LambdaOnVaultWithdrawStake        of onVaultWithdrawStakeType
    |   LambdaOnVaultLiquidateStake       of onVaultLiquidateStakeType

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------


type doormanStorageType is [@layout:comb] record [
    admin                     : address;
    metadata                  : metadataType;
    config                    : doormanConfigType;

    mvnTokenAddress           : address;
    governanceAddress         : address;
    
    whitelistContracts        : whitelistContractsType;      // whitelist of contracts that can access restricted entrypoints
    generalContracts          : generalContractsType;
    
    breakGlassConfig          : doormanBreakGlassConfigType;
    
    userStakeBalanceLedger    : userStakeBalanceLedgerType;  // user staked balance ledger

    unclaimedRewards          : nat; // current exit fee pool rewards
    accumulatedFeesPerShare   : nat;

    lambdaLedger              : lambdaLedgerType;
]

