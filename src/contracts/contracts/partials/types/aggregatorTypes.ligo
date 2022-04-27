type adminType is address;
type maintainerType is address;


type observationCommitsType    is map (address, bytes);
type observationRevealsType    is map (address, nat);

type pivotedObservationsType   is map (nat, nat);
type oracleAddressesType       is map (address, bool);
type oracleRewardsMVKType      is map (address, nat);
type oracleRewardsXTZType      is map (address, nat);

type deviationTriggerInfosType is  [@layout:comb] record [
    oracleAddress: address;
    amount: tez;
    roundPrice: nat;
];

type lastCompletedRoundPriceType is  [@layout:comb] record [
    round: nat;
    price: nat;
    percentOracleResponse: nat;
];

type lastCompletedRoundPriceReturnType is  [@layout:comb] record [
    round: nat;
    price: nat;
    percentOracleResponse: nat;
    decimals: nat;
];

type setObservationCommitType is  [@layout:comb] record [
    roundId: nat;
    sign: bytes;
];

type setObservationRevealType is  [@layout:comb] record [
    roundId: nat;
    priceSalted: nat * string;
];

type aggregatorConfigType is [@layout:comb] record [
    decimals: nat;
    maintainer: maintainerType;
    minimalTezosAmountDeviationTrigger: nat;
    perthousandDeviationTrigger: nat;
    percentOracleThreshold: nat;
    rewardAmountMVK: nat;
    rewardAmountXTZ: nat;
    numberBlocksDelay: nat;
];



type isWhiteListedContractParams is address;
type addOracleParams is address;
type removeOracleParams is address;
type requestRateUpdateParams is unit;
type requestRateUpdateDeviationParams is setObservationCommitType;
type setObservationCommitParams is setObservationCommitType;
type setObservationRevealParams is setObservationRevealType;
type updateConfigParams is aggregatorConfigType;
type setAdminParams is address;
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

type lambdaLedgerType is big_map(string, bytes)

type aggregatorLambdaActionType is 

    // Housekeeping Entrypoints
  | LambdaSetAdmin                      of setAdminParams
  | LambdaUpdateConfig                  of updateConfigParams
  | LambdaAddOracle                     of addOracleParams
  | LambdaRemoveOracle                  of address

    // Oracle Entrypoints
  | LambdaRequestRateUpdate             of requestRateUpdateParams
  | LambdaRequestRateUpdDeviation       of requestRateUpdateDeviationParams
  | LambdaSetObservationCommit          of setObservationCommitParams
  | LambdaSetObservationReveal          of setObservationRevealParams
  
    // Reward Entrypoints
  | LambdaWithdrawRewardXTZ             of withdrawRewardXTZParams
  | LambdaWithdrawRewardMVK             of withdrawRewardMVKParams

// ------------------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------------------

type aggregatorStorage is [@layout:comb] record [
    
    admin                     : adminType;
    mvkTokenAddress           : address;
    config                    : aggregatorConfigType;

    round                     : nat;
    switchBlock               : nat;

    oracleAddresses           : oracleAddressesType;
    
    deviationTriggerInfos     : deviationTriggerInfosType;
    lastCompletedRoundPrice   : lastCompletedRoundPriceType;

    observationCommits        : observationCommitsType;
    observationReveals        : observationRevealsType;

    oracleRewardsMVK          : oracleRewardsMVKType;
    oracleRewardsXTZ          : oracleRewardsXTZType;
    
    lambdaLedger              : lambdaLedgerType;
];