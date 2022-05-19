// FA12 Transfer Types
#include "../../partials/functionalTypes/fa12TransferTypes.ligo"

// FA2 Transfer Types
#include "../../partials/functionalTypes/fa2TransferTypes.ligo"

// Treasury Transfer Types
#include "../../partials/functionalTypes/treasuryTransferTypes.ligo"

type metadata is big_map (string, bytes);

type operator is address
type owner is address
type tokenId is nat;

type treasuryBreakGlassConfigType is [@layout:comb] record [
    transferIsPaused            : bool; 
    mintMvkAndTransferIsPaused  : bool;
    stakeIsPaused               : bool;
    unstakeIsPaused             : bool;
]

type mintMvkAndTransferType is [@layout:comb] record [
    to_             : address;
    amt             : nat;
]

type updateSatelliteBalanceParams is (address)

type setLambdaType is [@layout:comb] record [
      name                  : string;
      func_bytes            : bytes;
]
type lambdaLedgerType is map(string, bytes)

type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]

type treasuryLambdaActionType is 

  // Housekeeping Entrypoints
| LambdaSetAdmin                       of (address)
| LambdaSetGovernance                  of (address)
| LambdaSetBaker                       of option(key_hash)
| LambdaUpdateMetadata                 of updateMetadataType
| LambdaUpdateWhitelistContracts       of updateWhitelistContractsParams
| LambdaUpdateGeneralContracts         of updateGeneralContractsParams
| LambdaUpdateWhitelistTokens          of updateWhitelistTokenContractsParams

  // Pause / Break Glass Entrypoints
| LambdaPauseAll                       of (unit)
| LambdaUnpauseAll                     of (unit)
| LambdaTogglePauseTransfer            of (unit)
| LambdaTogglePauseMintTransfer        of (unit)
| LambdaTogglePauseStake               of (unit)
| LambdaTogglePauseUnstake             of (unit)

  // Treasury Entrypoints
| LambdaTransfer                       of transferActionType
| LambdaMintMvkAndTransfer             of mintMvkAndTransferType
| LambdaUpdateOperators                of updateOperatorsParams
| LambdaStake                          of (nat)
| LambdaUnstake                        of (nat)

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type treasuryStorage is [@layout:comb] record [
    admin                      : address;
    mvkTokenAddress            : address;
    governanceAddress          : address;
    metadata                   : metadata;
    
    breakGlassConfig           : treasuryBreakGlassConfigType;

    whitelistContracts         : whitelistContractsType;
    whitelistTokenContracts    : whitelistTokenContractsType;
    generalContracts           : generalContractsType;

    lambdaLedger               : lambdaLedgerType;
]