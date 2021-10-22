type action is
| Increment of (int)
| Decrement of (int)
| Reset of (unit)

type storage is address

type return is list (operation) * storage

function main (const action : action; const storage : storage): return is
  block {
    const counter : contract (action) =
      case (Tezos.get_contract_opt (storage) : option (contract (action))) of
        Some (contract) -> contract
      | None -> (failwith ("Contract not found.") : contract (action))
      end;

    const operationProxy : operation = Tezos.transaction (action, 0tez, counter);
    const operations : list (operation) = list [operationProxy]
  } with (operations, storage)
