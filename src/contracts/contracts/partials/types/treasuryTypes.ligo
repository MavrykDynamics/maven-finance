// Treasury Transfer Types
#include "../../partials/transferTypes.ligo"

type metadata is big_map (string, bytes);

type operator is address
type owner is address
type tokenId is nat;

type treasuryBreakGlassConfigType is [@layout:comb] record [
    transferIsPaused            : bool; 
    mintMvkAndTransferIsPaused  : bool;
    stakeMvkIsPaused            : bool;
    unstakeMvkIsPaused          : bool;
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
| LambdaUpdateName                     of (string)
| LambdaUpdateMetadata                 of updateMetadataType
| LambdaUpdateWhitelistContracts       of updateWhitelistContractsParams
| LambdaUpdateGeneralContracts         of updateGeneralContractsParams
| LambdaUpdateWhitelistTokens          of updateWhitelistTokenContractsParams

  // Pause / Break Glass Entrypoints
| LambdaPauseAll                       of (unit)
| LambdaUnpauseAll                     of (unit)
| LambdaTogglePauseTransfer            of (unit)
| LambdaTogglePauseMintTransfer        of (unit)
| LambdaTogglePauseStakeMvk            of (unit)
| LambdaTogglePauseUnstakeMvk          of (unit)

  // Treasury Entrypoints
| LambdaTransfer                       of transferActionType
| LambdaMintMvkAndTransfer             of mintMvkAndTransferType
| LambdaUpdateMvkOperators             of updateOperatorsParams
| LambdaStakeMvk                       of (nat)
| LambdaUnstakeMvk                     of (nat)

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type treasuryStorage is [@layout:comb] record [
    admin                      : address;
    metadata                   : metadata;
    name                       : string;
    
    mvkTokenAddress            : address;
    governanceAddress          : address;

    whitelistContracts         : whitelistContractsType;
    generalContracts           : generalContractsType;
    whitelistTokenContracts    : whitelistTokenContractsType;

    breakGlassConfig           : treasuryBreakGlassConfigType;

    lambdaLedger               : lambdaLedgerType;
]