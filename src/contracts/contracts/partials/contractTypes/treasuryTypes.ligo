// Treasury Transfer Types
#include "../../partials/shared/transferTypes.ligo"

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

type treasuryLambdaActionType is 

  // Housekeeping Entrypoints
| LambdaSetAdmin                       of (address)
| LambdaSetGovernance                  of (address)
| LambdaSetBaker                       of option(key_hash)
| LambdaSetName                        of (string)
| LambdaUpdateMetadata                 of updateMetadataType
| LambdaUpdateWhitelistContracts       of updateWhitelistContractsType
| LambdaUpdateGeneralContracts         of updateGeneralContractsType
| LambdaUpdateWhitelistTokens          of updateWhitelistTokenContractsType

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
| LambdaUpdateMvkOperators             of updateOperatorsType
| LambdaStakeMvk                       of (nat)
| LambdaUnstakeMvk                     of (nat)

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type treasuryStorageType is [@layout:comb] record [
    admin                      : address;
    metadata                   : metadataType;
    name                       : string;
    
    mvkTokenAddress            : address;
    governanceAddress          : address;

    whitelistContracts         : whitelistContractsType;
    generalContracts           : generalContractsType;
    whitelistTokenContracts    : whitelistTokenContractsType;

    breakGlassConfig           : treasuryBreakGlassConfigType;

    lambdaLedger               : lambdaLedgerType;
]