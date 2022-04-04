////
// MICHELSON Treasury TYPES
////

type metadata is big_map (string, bytes);

type createTreasuryActionType is [@layout:comb] record[
    transferIsPaused            : bool; 
    mintMvkAndTransferIsPaused  : bool;
]

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

////
// STORAGE
////
type treasuryFactoryStorage is [@layout:comb] record[
    admin                      : address;
    mvkTokenAddress            : address;
    metadata                   : metadata;

    trackedTreasuries          : set(address);
    breakGlassConfig           : treasuryFactoryBreakGlassConfigType;

    whitelistContracts         : whitelistContractsType;      // whitelist of contracts that can access restricted entrypoints
    whitelistTokenContracts    : whitelistTokenContractsType;
    generalContracts           : generalContractsType;
]