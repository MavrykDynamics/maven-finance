type observationCommitsType is map (address, bytes);
type observationRevealsType is map (address, nat);
type pivotedObservationsType is map (nat, nat);
type oracleAddressesType is map (address, bool);
type oracleRewardsMVKType is map (address, nat);
type oracleRewardsXTZType is map (address, nat);
type deviationTriggerInfosType is
  record [
    oracleAddress: address;
    amount: tez;
    roundPrice: nat;
  ];

type lastCompletedRoundPriceType is
  record [
    round: nat;
    price: nat;
    percentOracleResponse: nat;
    priceDateTime: timestamp;
  ];
type lastCompletedRoundPriceReturnType is
  record [
    round: nat;
    price: nat;
    percentOracleResponse: nat;
    decimals: nat;
    priceDateTime: timestamp;
  ];
type setObservationCommitType is 
  record [
    roundId: nat;
    sign: bytes;
  ];
type setObservationRevealType is 
  record [
    roundId: nat;
    priceSalted: nat * string;
  ];
type ownerType is address;
type maintainerType is address;
type aggregatorConfigType is
  record [
    decimals: nat;
    maintainer: maintainerType;
    minimalTezosAmountDeviationTrigger: nat;
    perthousandDeviationTrigger: nat;
    percentOracleThreshold: nat;
    rewardAmountMVK: nat;
    rewardAmountXTZ: nat;
    numberBlocksDelay: nat;
  ];
type aggregatorStorage is
  record [
    oracleAddresses: oracleAddressesType;
    oracleRewardsMVK: oracleRewardsMVKType;
    oracleRewardsXTZ: oracleRewardsXTZType;
    mvkTokenAddress: address;
    round: nat;
    deviationTriggerInfos: deviationTriggerInfosType;
    lastCompletedRoundPrice: lastCompletedRoundPriceType;
    observationCommits: observationCommitsType;
    observationReveals: observationRevealsType;
    owner: ownerType;
    aggregatorConfig: aggregatorConfigType;
    switchBlock: nat;
  ];

const noOperations : list (operation) = nil;
type isWhiteListedContractParams is address;
type addOracleParams is address;
type removeOracleParams is address;
type requestRateUpdateParams is unit;
type requestRateUpdateDeviationParams is setObservationCommitType;
type setObservationCommitParams is setObservationCommitType;
type setObservationRevealParams is setObservationRevealType;
type updateAggregatorConfigParams is aggregatorConfigType;
type updateOwnerParams is address;
type withdrawRewardXTZParams is address;
type withdrawRewardMVKParams is address;
type defaultParams is unit;

type transferDestination is [@layout:comb] record[
  to_: address;
  token_id: nat;
  amount: nat;
];
type transfer is [@layout:comb] record[
  from_: address;
  txs: list(transferDestination);
];
type newTransferType is list(transfer);
type satelliteRecordType is [@layout:comb] record [
    status                : nat;        // active: 1; inactive: 0; 
    stakedMvkBalance      : nat;        // bondAmount -> staked MVK Balance
    satelliteFee          : nat;        // fee that satellite charges to delegates ? to be clarified in terms of satellite distribution
    totalDelegatedAmount  : nat;        // record of total delegated amount from delegates
    
    name                  : string;     // string for name
    description           : string;     // string for description
    image                 : string;     // ipfs hash
    website               : string;     // satellite website if it has one
    
    registeredDateTime    : timestamp;  
]