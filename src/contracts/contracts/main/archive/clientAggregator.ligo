type lastCompletedDataReturnType is  [@layout:comb] record [
    round: nat;
    data: nat;
    percentOracleResponse: nat;
    decimals: nat;
    lastUpdatedAt: timestamp;  
];


const noOperations : list (operation) = nil;
type storage is record [
  lastdatas: lastCompletedDataReturnType;
]
type return is list (operation) * storage

type parameter is contract(lastCompletedDataReturnType)

type action is
  | GetData of address

(* Entry Points*)

function getData(const aggregatorAddress: address; const store: storage): return is
block {
  const data : option(lastCompletedDataReturnType) = Tezos.call_view ("lastCompletedRoundData", unit, aggregatorAddress);

  const unpacked = case data of [
      Some (p) -> p
    | None -> (failwith ("Oh no") : lastCompletedDataReturnType)
  ]

} with (noOperations, store with record[lastdatas=unpacked])

function main (const action : action; const storage : storage) : list(operation) * storage is
  case action of [
    | GetData (c) -> getData(c, storage)
  ];
