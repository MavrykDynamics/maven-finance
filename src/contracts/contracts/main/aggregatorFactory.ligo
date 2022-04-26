// ------------------------------------------------------------------------------
// Common Types
// ------------------------------------------------------------------------------


// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// Aggregator Types
#include "../partials/types/aggregatorTypes.ligo"

type trackedAggregatorsType is map (string * string, address);
type trackedSatelliteType is set (address);

type storage is record [
    admin: address;
    mvkTokenAddress: address;
    trackedAggregators: trackedAggregatorsType;
    trackedSatellite: trackedSatelliteType;
]

type createAggregatorParamsType is string * string * [@layout:comb] record[
  oracleAddresses: oracleAddressesType;
  mvkTokenAddress: address;
  aggregatorConfig: aggregatorConfigType;
  owner: ownerType;
];

type updateAggregatorConfigParamsType is record [
  satelliteAddress: address;
  aggregatorConfig: aggregatorConfigType;
];

type updateAggregatorOwnerParamsType is record [
  satelliteAddress: address;
  ownerAddress: address;
];

// ------------------------------------------------------------------------------

type aggregatorFactoryAction is
    | CreateAggregator of createAggregatorParamsType
    | AddSatellite of (address)
    | BanSatellite of (address)
    | UpdateAggregatorConfig of updateAggregatorConfigParamsType
    | UpdateAggregatorOwner of updateAggregatorOwnerParamsType

const noOperations : list (operation) = nil;
type return is list (operation) * storage;
type createAggregatorFuncType is (option(key_hash) * tez * aggregatorStorage) -> (operation * address);


[@view] function getAggregator (const pair : string*string ; const store: storage) : address is block {
  const aggregatorAddress : address = case store.trackedAggregators[pair] of [
    Some(_address) -> _address
    | None -> failwith("Error. Aggregator not found.")
  ];
} with (aggregatorAddress)


const createAggregatorFunc: createAggregatorFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../compiled/aggregator.tz"
        ;
          PAIR } |}
: createAggregatorFuncType)];

function checkSenderIsAdmin(const s: storage): unit is
  if Tezos.sender =/= s.admin then failwith("ONLY_ADMINISTRATOR_ALLOWED")
  else unit

function checkIfAddressContainInTrackedSatelliteSet(const satelliteAddress: address; const trackedSatellite: trackedSatelliteType): unit is
  if not (trackedSatellite contains satelliteAddress) then failwith("You can't perform things on a not registered satellite")
  else unit

function addOracleOperation(const aggregatorAddress: address; const satelliteAddress: address): operation is
block{
    const tokenContract: contract(address) =
        case (Tezos.get_entrypoint_opt("%addOracle", aggregatorAddress): option(contract(address))) of [
              Some (c) -> c
          |   None -> (failwith("addOracle entrypoint not found in agregator contract"): contract(address))
        ];
} with (Tezos.transaction(satelliteAddress, 0tez, tokenContract))

function removeOracleOperation(const aggregatorAddress: address; const satelliteAddress: address): operation is
block{
    const tokenContract: contract(address) =
        case (Tezos.get_entrypoint_opt("%removeOracle", aggregatorAddress): option(contract(address))) of [
              Some (c) -> c
          |   None -> (failwith("removeOracle entrypoint not found in agregator contract"): contract(address))
        ];
} with (Tezos.transaction(satelliteAddress, 0tez, tokenContract))

function updateAggregatorConfigOperation(const aggregatorAddress: address; const newAggregatorConfig: aggregatorConfigType): operation is
block{
    const tokenContract: contract(aggregatorConfigType) =
        case (Tezos.get_entrypoint_opt("%updateAggregatorConfig", aggregatorAddress): option(contract(aggregatorConfigType))) of [
              Some (c) -> c
          |   None -> (failwith("updateAggregatorConfig entrypoint not found in agregator contract"): contract(aggregatorConfigType))
        ];
} with (Tezos.transaction(newAggregatorConfig, 0tez, tokenContract))

function updateAggregatorOwnerOperation(const aggregatorAddress: address; const ownerAddress: address): operation is
block{
    const tokenContract: contract(address) =
        case (Tezos.get_entrypoint_opt("%updateOwner", aggregatorAddress): option(contract(address))) of [
              Some (c) -> c
          |   None -> (failwith("updateOwner entrypoint not found in agregator contract"): contract(address))
        ];
} with (Tezos.transaction(ownerAddress, 0tez, tokenContract))

function banSatellite(const satelliteAddress: address; var s: storage): return is
  block{
    checkSenderIsAdmin(s);
    checkIfAddressContainInTrackedSatelliteSet(satelliteAddress, s.trackedSatellite);
    const newSet: trackedSatelliteType = Set.remove (satelliteAddress, s.trackedSatellite);
    var operations : list(operation) := nil;
    for _key -> value in map s.trackedAggregators block {
        const operation = removeOracleOperation(value, satelliteAddress);
      operations := operation # operations;
    }
} with (operations,s with record[trackedSatellite = newSet])

function addSatellite(const satelliteAddress: address; var s: storage): return is
  block{
    checkSenderIsAdmin(s);
    const newSet: trackedSatelliteType = Set.add (satelliteAddress, s.trackedSatellite);
    var operations : list(operation) := nil;
    for _key -> value in map s.trackedAggregators block {
        const operation = addOracleOperation(value, satelliteAddress);
        operations := operation # operations;
    }
} with (operations,s with record[trackedSatellite = newSet])

function updateAggregatorConfig(const updateAggregatorConfigParams: updateAggregatorConfigParamsType; var s: storage): return is
  block{
    checkSenderIsAdmin(s);
    const operation = updateAggregatorConfigOperation(updateAggregatorConfigParams.satelliteAddress, updateAggregatorConfigParams.aggregatorConfig);
} with (list[operation],s)

function updateAggregatorOwner(const updateAggregatorOwnerParams: updateAggregatorOwnerParamsType; var s: storage): return is
  block{
    checkSenderIsAdmin(s);
    const operation = updateAggregatorOwnerOperation(updateAggregatorOwnerParams.satelliteAddress, updateAggregatorOwnerParams.ownerAddress);
} with (list[operation],s)

function createAggregator(const createAggregatorParams: createAggregatorParamsType; var s: storage): return is
block {
        checkSenderIsAdmin(s);

        // createAggregator parameters declaration
        const observationCommits: observationCommitsType = map[];
        const observationReveals: observationRevealsType = map[];
        const lastCompletedRoundPrice = record[
              round= 0n;
              price= 0n;
              percentOracleResponse= 0n;
          ];
        const oracleRewardsXTZ: oracleRewardsXTZType = map[];
        const oracleRewardsMVK: oracleRewardsMVKType = map[];
        const deviationTriggerInfos: deviationTriggerInfosType = record[
          oracleAddress=Tezos.sender;
          amount=0tez;
          roundPrice=0n;
        ];

        // new Aggregator Storage declaration
        const originatedAggregatorStorage: aggregatorStorage = record [
          oracleAddresses=createAggregatorParams.2.oracleAddresses;
          round=0n;
          deviationTriggerInfos= deviationTriggerInfos;
          lastCompletedRoundPrice=lastCompletedRoundPrice;
          owner=createAggregatorParams.2.owner;
          observationCommits=observationCommits;
          observationReveals=observationReveals;
          oracleRewardsXTZ=oracleRewardsXTZ;
          oracleRewardsMVK=oracleRewardsMVK;
          mvkTokenAddress=s.mvkTokenAddress;
          aggregatorConfig=createAggregatorParams.2.aggregatorConfig;
          switchBlock=0n;
        ];

        // contract origination
        const aggregatorOrigination: (operation * address) = createAggregatorFunc(
            (None: option(key_hash)),
            0tez,
            originatedAggregatorStorage
        );
        s.trackedAggregators := Map.add((createAggregatorParams.0, createAggregatorParams.1), aggregatorOrigination.1, s.trackedAggregators)
    } with(list[aggregatorOrigination.0], s)

function main (const action : aggregatorFactoryAction; const s : storage) : return is

    case action of [
      
      | CreateAggregator (parameters) -> createAggregator(parameters, s)
      | AddSatellite (parameters) -> addSatellite(parameters, s)
      | BanSatellite (parameters) -> banSatellite(parameters, s)
      | UpdateAggregatorConfig (parameters) -> updateAggregatorConfig(parameters, s)
      | UpdateAggregatorOwner (parameters) -> updateAggregatorOwner(parameters, s)
    ]
