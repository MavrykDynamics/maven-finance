// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------

type depositor is address
type tokenBalance is nat

type depositorRecord is [@layout:comb] record[
    balance                         : tokenBalance;
    participationRewardsPerShare    : nat;
    unclaimedRewards                : tokenBalance;
    claimedRewards                  : tokenBalance;
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

// ------------------------------------------------------------------------------
// Inputs
// ------------------------------------------------------------------------------

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


type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]

type farmLambdaActionType is 

  // Housekeeping Entrypoints
    LambdaSetAdmin                    of (address)
|   LambdaSetGovernance               of (address)
|   LambdaUpdateMetadata              of updateMetadataType
|   LambdaUpdateConfig                of farmUpdateConfigParamsType
|   LambdaUpdateWhitelistContracts    of updateWhitelistContractsParams
|   LambdaUpdateGeneralContracts      of updateGeneralContractsParams

    // Farm Admin Entrypoints
|   LambdaUpdateBlocksPerMinute       of (nat)
|   LambdaInitFarm                    of initFarmParamsType
|   LambdaCloseFarm                   of (unit)

    // Pause / Break Glass Entrypoints
|   LambdaPauseAll                    of (unit)
|   LambdaUnpauseAll                  of (unit)
|   LambdaTogglePauseDeposit          of (unit)
|   LambdaTogglePauseWithdraw         of (unit)
|   LambdaTogglePauseClaim            of (unit)

    // Farm Entrypoints
|   LambdaDeposit                     of nat
|   LambdaWithdraw                    of nat
|   LambdaClaim                       of address

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type farmStorage is [@layout:comb] record[
    admin                   : address;
    metadata                : metadata;
    name                    : string;
    config                  : farmConfigType;

    mvkTokenAddress         : address;
    governanceAddress       : address;

    whitelistContracts      : whitelistContractsType;      
    generalContracts        : generalContractsType;

    breakGlassConfig        : farmBreakGlassConfigType;

    lastBlockUpdate         : nat;
    accumulatedRewardsPerShare  : tokenBalance;
    claimedRewards          : claimedRewards;
    depositors              : big_map(depositor, depositorRecord);
    open                    : bool;
    init                    : bool;
    initBlock               : nat;

    lambdaLedger            : lambdaLedgerType;
]
