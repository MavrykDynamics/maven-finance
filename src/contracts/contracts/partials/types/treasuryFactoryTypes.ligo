////
// MICHELSON Treasury TYPES
////

type metadata is big_map (string, bytes);

type treasuryStorageType is [@layout:comb] record[
    admin                        : address;
    mvkTokenAddress              : address;
    metadata                     : metadata;

    breakGlassConfig             : treasuryBreakGlassConfigType;
    
    whitelistContracts           : whitelistContractsType;      
    whitelistTokenContracts      : whitelistTokenContractsType;      
    generalContracts             : generalContractsType;
]

type createTreasuryActionType is [@layout:comb] record[
    transferIsPaused            : bool; 
    mintMvkAndTransferIsPaused  : bool;
]

type createTreasuryFuncType is (option(key_hash) * tez * treasuryStorageType) -> (operation * address)
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