// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

type depositorType is address;

type depositorRecordType is [@layout:comb] record[
    balance                         : tokenBalanceType;
    participationRewardsPerShare    : nat;
    unclaimedRewards                : tokenBalanceType;
    claimedRewards                  : tokenBalanceType;
]

type claimedRewardsType is [@layout:comb] record[
    unpaid: tokenBalanceType;
    paid: tokenBalanceType;
]

type plannedRewardsType is [@layout:comb] record[
    totalBlocks : nat;
    currentRewardPerBlock : tokenBalanceType;
    totalRewards : tokenBalanceType;
]

type lpStandardType is
    Fa12 of unit
|   Fa2 of unit

type lpTokenType is [@layout:comb] record[
    tokenAddress: address;
    tokenId: nat;
    tokenStandard: lpStandardType;
    tokenBalance: tokenBalanceType;
]

type farmBreakGlassConfigType is [@layout:comb] record [
    depositIsPaused         : bool;
    withdrawIsPaused        : bool;
    claimIsPaused           : bool;
]

type farmConfigType is record [
    lpToken                     : lpTokenType;
    infinite                    : bool;
    forceRewardFromTransfer     : bool;
    blocksPerMinute             : nat;
    plannedRewards              : plannedRewardsType;
]

// ------------------------------------------------------------------------------
// Inputs
// ------------------------------------------------------------------------------

(* initFarm entrypoint inputs *)
type initFarmParamsType is [@layout:comb] record[
    totalBlocks: nat;
    currentRewardPerBlock: nat;
    blocksPerMinute: nat;
    forceRewardFromTransfer: bool;
    infinite: bool;
]

(* updateConfig entrypoint inputs *)
type farmUpdateConfigNewValueType is nat
type farmUpdateConfigActionType is 
    ConfigForceRewardFromTransfer of unit
|   ConfigRewardPerBlock of unit
type farmUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue: farmUpdateConfigNewValueType; 
    updateConfigAction: farmUpdateConfigActionType;
]

type farmPausableEntrypointType is
    Deposit     of bool
|   Withdraw    of bool
|   Claim       of bool

type farmTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : farmPausableEntrypointType;
    empty             : unit
];

type farmLambdaActionType is 

        // Housekeeping Entrypoints
        LambdaSetAdmin                    of (address)
    |   LambdaSetGovernance               of (address)
    |   LambdaSetName                     of (string)
    |   LambdaUpdateMetadata              of updateMetadataType
    |   LambdaUpdateConfig                of farmUpdateConfigParamsType
    |   LambdaUpdateWhitelistContracts    of updateWhitelistContractsType
    |   LambdaUpdateGeneralContracts      of updateGeneralContractsType
    |   LambdaMistakenTransfer            of transferActionType

        // Farm Admin Entrypoints
    |   LambdaUpdateBlocksPerMinute       of (nat)
    |   LambdaInitFarm                    of initFarmParamsType
    |   LambdaCloseFarm                   of (unit)

        // Pause / Break Glass Entrypoints
    |   LambdaPauseAll                    of (unit)
    |   LambdaUnpauseAll                  of (unit)
    |   LambdaTogglePauseEntrypoint       of farmTogglePauseEntrypointType

        // Farm Entrypoints
    |   LambdaDeposit                     of nat
    |   LambdaWithdraw                    of nat
    |   LambdaClaim                       of address

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type farmStorageType is [@layout:comb] record[
    admin                       : address;
    metadata                    : metadataType;
    name                        : string;
    config                      : farmConfigType;

    mvkTokenAddress             : address;
    governanceAddress           : address;

    whitelistContracts          : whitelistContractsType;      
    generalContracts            : generalContractsType;

    breakGlassConfig            : farmBreakGlassConfigType;

    lastBlockUpdate             : nat;
    accumulatedRewardsPerShare  : tokenBalanceType;
    claimedRewards              : claimedRewardsType;
    depositors                  : big_map(depositorType, depositorRecordType);
    open                        : bool;
    init                        : bool;
    initBlock                   : nat;

    lambdaLedger                : lambdaLedgerType;
]
