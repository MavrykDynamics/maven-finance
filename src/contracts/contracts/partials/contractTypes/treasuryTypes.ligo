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

type treasuryTogglePauseEntrypointType is
  ToggleTransfer                       of bool   
| ToggleMintMvkAndTransfer             of bool
| ToggleStakeMvk                       of bool
| ToggleUnstakeMvk                     of bool

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
| LambdaTogglePauseEntrypoint          of treasuryTogglePauseEntrypointType

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