////
// TYPES INCLUDED
////
// Whitelist Contracts: whitelistContractsType, updateWhitelistContractsParams 
#include "../partials/whitelistContractsType.ligo"

// General Contracts: generalContractsType, updateGeneralContractsParams
#include "../partials/generalContractsType.ligo"

////
// COMMON TYPES
////
type delegator is address
type tokenBalance is nat

////
// MICHELSON FARM TYPES
////
type delegatorRecord is record[
    balance: tokenBalance;
    participationMVKPerShare: tokenBalance;
    unclaimedRewards: tokenBalance;
]
type claimedRewards is [@layout:comb] record[
    unpaid: tokenBalance;
    paid: tokenBalance;
]
type plannedRewards is [@layout:comb] record[
    totalBlocks: nat;
    rewardPerBlock: tokenBalance;
]
type lpStandard is
    Fa12 of unit
|   Fa2 of unit
type lpToken is record[
    tokenAddress: address;
    tokenId: nat;
    tokenStandard: lpStandard;
    tokenBalance: tokenBalance;
]

type farmStorage is record[
    admin                   : address;
    whitelistContracts      : whitelistContractsType;      // whitelist of contracts that can access restricted entrypoints
    generalContracts        : generalContractsType;

    lastBlockUpdate         : nat;
    accumulatedMVKPerShare  : tokenBalance;
    claimedRewards          : claimedRewards;
    plannedRewards          : plannedRewards;
    delegators              : big_map(delegator, delegatorRecord);
    lpToken                 : lpToken;
    open                    : bool;
    initBlock               : nat;
]

type farmStorageType is [@layout:comb] record[
    plannedRewards          : plannedRewards;
    lpToken                 : record[
        tokenAddress    : address;
        tokenId         : nat;
        tokenStandard   : lpStandard;
    ]
]

type createFarmFuncType is (option(key_hash) * tez * farmStorage) -> (operation * address)
const createFarmFunc : createFarmFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../compiled/farm.tz"
        ;
          PAIR } |}
 : createFarmFuncType)];

type initFarmParamsType is record[
    totalBlocks: nat;
    rewardPerBlock: nat;
]

////
// STORAGE
////
type storage is record[
    admin                   : address;
    whitelistContracts      : whitelistContractsType;      // whitelist of contracts that can access restricted entrypoints
    generalContracts        : generalContractsType;

    createdFarms            : set(address);
]

////
// RETURN TYPES
////
(* define return for readability *)
type return is list (operation) * storage
(* define noop for readability *)
const noOperations : list (operation) = nil;

////
// INPUTS
////

////
// ENTRYPOINTS
////
type action is
    CreateFarm of farmStorageType
|   CheckFarm of address
|   UntrackFarm of address

////
// HELPER FUNCTIONS
///
(* Checks functions *)
function checkNoAmount(const _p: unit): unit is
  if Tezos.amount =/= 0tez then failwith("THIS_ENTRYPOINT_SHOULD_NOT_RECEIVE_XTZ")
  else unit

function checkSenderIsAdmin(const s: storage): unit is
  if Tezos.sender =/= s.admin then failwith("ONLY_ADMINISTRATOR_ALLOWED")
  else unit

////
// ENTRYPOINTS FUNCTIONS
///
(* CreateFarm entrypoint *)
function createFarm (const farmStorage: farmStorageType; var s: storage): return is 
    block{
        // Check if Sender is admin
        checkSenderIsAdmin(s);

        // Add FarmFactory Address to generalContracts of created farm
        const farmGeneralContracts: generalContractsType = Map.update("factory", Some (Tezos.self_address), s.generalContracts);

        // Create needed records for farm contract
        const farmDelegators: big_map(delegator, delegatorRecord) = Big_map.empty;
        const farmClaimedRewards: claimedRewards = record[
            paid=0n;
            unpaid=0n;
        ];
        const farmPlannedRewards: plannedRewards = record[
            totalBlocks=farmStorage.plannedRewards.totalBlocks;
            rewardPerBlock=farmStorage.plannedRewards.rewardPerBlock;
        ];
        const farmLPToken: lpToken = record[
            tokenAddress=farmStorage.lpToken.tokenAddress;
            tokenId=farmStorage.lpToken.tokenId;
            tokenStandard=farmStorage.lpToken.tokenStandard;
            tokenBalance=0n;
        ];

        // Create a farm and auto init it?
        const originatedFarmStorage: farmStorage = record[
            admin                   = s.admin; // If governance is the admin, it makes sense that the factory passes its admin to the farm it creates
            whitelistContracts      = s.whitelistContracts;      // whitelist of contracts that can access restricted entrypoints
            generalContracts        = farmGeneralContracts;

            lastBlockUpdate         = Tezos.level;
            accumulatedMVKPerShare  = 0n;
            claimedRewards          = farmClaimedRewards;
            plannedRewards          = farmPlannedRewards;
            delegators              = farmDelegators;
            lpToken                 = farmLPToken;
            open                    = True ;
            initBlock               = Tezos.level;
        ];

        // Do we want to send tez to the farm contract?
        const farmOrigination: (operation * address) = createFarmFunc(
            (None : option(key_hash)), 
            0tez,
            originatedFarmStorage
        );

        s.createdFarms := Set.add(farmOrigination.1, s.createdFarms);

    } with(list[farmOrigination.0], s)

(* CheckFarm entrypoint *)
function checkFarm (const farmContract: address; const s: storage): return is 
    case Set.mem(farmContract, s.createdFarms) of
        True -> (noOperations, s)
    |   False -> failwith("The provided farm contract does not exist in the createdFarms big_map")
    end

(* UntrackFarm entrypoint *)
function untrackFarm (const farmContract: address; var s: storage): return is 
    block{
        // Check if Sender is admin
        checkSenderIsAdmin(s);

        s.createdFarms :=
            case Set.mem(farmContract, s.createdFarms) of
                True -> Set.remove(farmContract, s.createdFarms)
            |   False -> (failwith("The provided farm contract does not exist in the createdFarms big_map"): set(address))
            end;
    } with(noOperations, s)

(* Main entrypoint *)
function main (const action: action; var s: storage): return is
  block{
    // Check that sender didn't send Tezos while calling an entrypoint
    checkNoAmount(Unit);
  } with(
    case action of
        CreateFarm (params) -> createFarm(params, s)
    |   CheckFarm (params) -> checkFarm(params, s)
    |   UntrackFarm (params) -> untrackFarm(params, s)
    end
  )