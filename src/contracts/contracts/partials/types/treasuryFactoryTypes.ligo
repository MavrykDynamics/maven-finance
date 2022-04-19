// ------------------------------------------------------------------------------
// Treasury Factory Types
// ------------------------------------------------------------------------------

type metadata is big_map (string, bytes);

type createTreasuryFuncType is (option(key_hash) * tez * treasuryStorage) -> (operation * address)
const createTreasuryFunc: createTreasuryFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../../compiled/treasury.tz"
        ;
          PAIR } |}
: createTreasuryFuncType)];

type treasuryFactoryBreakGlassConfigType is record [
    createTreasuryIsPaused     : bool;
    trackTreasuryIsPaused      : bool;
    untrackTreasuryIsPaused    : bool;
]


type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]

type treasuryFactoryLambdaActionType is 

    // Housekeeping Entrypoints
    LambdaSetAdmin                            of (address)
|   LambdaUpdateMetadata                      of updateMetadataType
|   LambdaUpdateWhitelistContracts            of updateWhitelistContractsParams
|   LambdaUpdateGeneralContracts              of updateGeneralContractsParams
|   LambdaUpdateWhitelistTokens               of updateWhitelistTokenContractsParams

    // Pause / Break Glass Entrypoints
|   LambdaPauseAll                            of (unit)
|   LambdaUnpauseAll                          of (unit)
|   LambdaTogglePauseCreateTreasury           of (unit)
|   LambdaToggleTrackTreasury                 of (unit)
|   LambdaToggleUntrackTreasury               of (unit)

    // Treasury Factory Entrypoints
|   LambdaCreateTreasury                      of string
|   LambdaTrackTreasury                       of address
|   LambdaUntrackTreasury                     of address

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type treasuryFactoryStorage is [@layout:comb] record[
    admin                      : address;
    mvkTokenAddress            : address;
    metadata                   : metadata;

    trackedTreasuries          : set(address);
    breakGlassConfig           : treasuryFactoryBreakGlassConfigType;

    whitelistContracts         : whitelistContractsType;      // whitelist of contracts that can access restricted entrypoints
    whitelistTokenContracts    : whitelistTokenContractsType;
    generalContracts           : generalContractsType;

    lambdaLedger               : lambdaLedgerType;
]