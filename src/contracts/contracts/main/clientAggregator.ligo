type lastCompletedPriceReturnType is  [@layout:comb] record [
    round: nat;
    price: nat;
    percentOracleResponse: nat;
    decimals: nat;
    priceDateTime: timestamp;  
];


const noOperations : list (operation) = nil;
type storage is record [
  lastprices: lastCompletedPriceReturnType;
]
type return is list (operation) * storage

type parameter is contract(lastCompletedPriceReturnType)

type action is
  | GetPrice of address

(* Entry Points*)

function getPrice(const aggregatorAddress: address; const store: storage): return is
block {
  const price : option(lastCompletedPriceReturnType) = Tezos.call_view ("lastCompletedRoundPrice", unit, aggregatorAddress);

  const unpacked = case price of [
      Some (p) -> p
    | None -> (failwith ("Oh no") : lastCompletedPriceReturnType)
  ]

} with (noOperations, store with record[lastprices=unpacked])

function main (const action : action; const storage : storage) : list(operation) * storage is
  case action of [
    | GetPrice (c) -> getPrice(c, storage)
  ];
