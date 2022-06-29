type lastCompletedRoundPriceReturnType is  [@layout:comb] record [
    round: nat;
    price: nat;
    percentOracleResponse: nat;
    decimals: nat;
    priceDateTime: timestamp;  
];


const noOperations : list (operation) = nil;
type storage is record [
  lastprices: lastCompletedRoundPriceReturnType;
]
type return is list (operation) * storage

type parameter is contract(lastCompletedRoundPriceReturnType)

type action is
  | GetPrice of address

(* Entry Points*)

function getPrice(const aggregatorAddress: address; const store: storage): return is
block {
  const price : option(lastCompletedRoundPriceReturnType) = Tezos.call_view ("lastCompletedRoundPrice", unit, aggregatorAddress);

  const unpacked = case price of [
      Some (p) -> p
    | None -> (failwith ("Oh no") : lastCompletedRoundPriceReturnType)
  ]

} with (noOperations, store with record[lastprices=unpacked])

function main (const action : action; const storage : storage) : list(operation) * storage is
  case action of [
    | GetPrice (c) -> getPrice(c, storage)
  ];
