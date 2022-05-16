type lastCompletedRoundPriceReturnType is
  record [
    round: int;
    price: int;
    percentOracleResponse: nat;
    decimals: int;
    priceDateTime: timestamp;
  ];


const noOperations : list (operation) = nil;
type storage is record [
  address: address;
  lastprices: lastCompletedRoundPriceReturnType;
]
type return is list (operation) * storage

type parameter is contract(lastCompletedRoundPriceReturnType)

type action is
  | GetPrice of unit

(* Entry Points*)

function getPrice(const _ : unit; const store: storage): return is
block {
  const price : option(lastCompletedRoundPriceReturnType) = Tezos.call_view ("lastCompletedRoundPrice", unit, store.address);

  const unpacked = case price of [
      Some (p) -> p
    | None -> (failwith ("No round here") : lastCompletedRoundPriceReturnType)
  ]

} with (noOperations, store with record[lastprices=unpacked])

function main (const action : action; const storage : storage) : list(operation) * storage is
  case action of [
    | GetPrice (c) -> getPrice(c, storage)
  ];
