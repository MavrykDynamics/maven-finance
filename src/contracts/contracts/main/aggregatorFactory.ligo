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

type createAggregatorParamsType is string * string * [@layout:comb] record[
  oracleAddresses: oracleAddressesType;
  mvkTokenAddress: address;
  aggregatorConfig: aggregatorConfigType;
  admin: adminType;
];

type updateAggregatorConfigParamsType is record [
  satelliteAddress: address;
  aggregatorConfig: aggregatorConfigType;
];

type updateAggregatorAdminParamsType is record [
  satelliteAddress: address;
  adminAddress: address;
];

type storage is record [
    admin: address;
    mvkTokenAddress: address;
    trackedAggregators: trackedAggregatorsType;
    trackedSatellite: trackedSatelliteType;
]

// ------------------------------------------------------------------------------

type aggregatorFactoryAction is
    | CreateAggregator            of createAggregatorParamsType
    | AddSatellite                of (address)
    | BanSatellite                of (address)
    | UpdateAggregatorConfig      of updateAggregatorConfigParamsType
    | UpdateAggregatorAdmin       of updateAggregatorAdminParamsType

const noOperations : list (operation) = nil;
type return is list (operation) * storage;
type createAggregatorFuncType is (option(key_hash) * tez * aggregatorStorage) -> (operation * address);


[@view] function getAggregator (const pair : string*string ; const store: storage) : address is block {
  const aggregatorAddress : address = case store.trackedAggregators[pair] of [
    Some(_address) -> _address
    | None -> failwith("Error. Aggregator not found.")
  ];
} with (aggregatorAddress)


// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

function checkSenderIsAdmin(const s: storage): unit is
  if Tezos.sender =/= s.admin then failwith("ONLY_ADMINISTRATOR_ALLOWED")
  else unit



function checkIfAddressContainInTrackedSatelliteSet(const satelliteAddress: address; const trackedSatellite: trackedSatelliteType): unit is
  if not (trackedSatellite contains satelliteAddress) then failwith("You can't perform things on a not registered satellite")
  else unit



const createAggregatorFunc: createAggregatorFuncType =
[%Michelson ( {| { UNPPAIIR ;
                  CREATE_CONTRACT
#include "../compiled/aggregator.tz"
        ;
          PAIR } |}
: createAggregatorFuncType)];



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



function updateAggregatorAdminOperation(const aggregatorAddress: address; const adminAddress: address): operation is
block{
    const tokenContract: contract(address) =
        case (Tezos.get_entrypoint_opt("%updateAdmin", aggregatorAddress): option(contract(address))) of [
              Some (c) -> c
          |   None -> (failwith("updateAdmin entrypoint not found in aggregator contract"): contract(address))
        ];
} with (Tezos.transaction(adminAddress, 0tez, tokenContract))


// ------------------------------------------------------------------------------
//
// Helper Functions End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------

(*  createAggregator entrypoint  *)
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

    const aggregatorLambdaLedger : big_map(string, bytes) = Big_map.empty;

    // new Aggregator Storage declaration
    const originatedAggregatorStorage : aggregatorStorage = record [

      admin                     = createAggregatorParams.2.admin;
      mvkTokenAddress           = s.mvkTokenAddress;
      config                    = createAggregatorParams.2.aggregatorConfig;

      round                     = 0n;
      switchBlock               = 0n;

      oracleAddresses           = createAggregatorParams.2.oracleAddresses;
      
      deviationTriggerInfos     = deviationTriggerInfos;
      lastCompletedRoundPrice   = lastCompletedRoundPrice;
      
      observationCommits        = observationCommits;
      observationReveals        = observationReveals;
      
      oracleRewardsXTZ          = oracleRewardsXTZ;
      oracleRewardsMVK          = oracleRewardsMVK;      

      lambdaLedger              = aggregatorLambdaLedger;
      
    ];

    // contract origination
    const aggregatorOrigination: (operation * address) = createAggregatorFunc(
        (None: option(key_hash)),
        0tez,
        originatedAggregatorStorage
    );
    s.trackedAggregators := Map.add((createAggregatorParams.0, createAggregatorParams.1), aggregatorOrigination.1, s.trackedAggregators)

} with(list[aggregatorOrigination.0], s)


(*  banSatellite entrypoint  *)
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



(*  addSatellite entrypoint  *)
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


(*  updateAggregatorConfig entrypoint  *)
function updateAggregatorConfig(const updateAggregatorConfigParams: updateAggregatorConfigParamsType; var s: storage): return is
block{
    
    checkSenderIsAdmin(s);
    const operation = updateAggregatorConfigOperation(updateAggregatorConfigParams.satelliteAddress, updateAggregatorConfigParams.aggregatorConfig);

} with (list[operation],s)


(*  updateAggregatorAdmin entrypoint  *)
function updateAggregatorAdmin(const updateAggregatorAdminParams: updateAggregatorAdminParamsType; var s: storage): return is
block{
    checkSenderIsAdmin(s);
    const operation = updateAggregatorAdminOperation(updateAggregatorAdminParams.satelliteAddress, updateAggregatorAdminParams.adminAddress);

} with (list[operation],s)


// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------



(* main entrypoint *)
function main (const action : aggregatorFactoryAction; const s : storage) : return is

    case action of [
      
      | CreateAggregator (parameters)         -> createAggregator(parameters, s)
      | AddSatellite (parameters)             -> addSatellite(parameters, s)
      | BanSatellite (parameters)             -> banSatellite(parameters, s)
      | UpdateAggregatorConfig (parameters)   -> updateAggregatorConfig(parameters, s)
      | UpdateAggregatorAdmin (parameters)    -> updateAggregatorAdmin(parameters, s)
    ]
