let exec_update_operator (updates, updater, ops_storage : update_operator list * address * operator_storage) : operator_storage =
    let process_update = (fun (ops, update : operator_storage * update_operator) ->
      let _u = validate_update_operators_by_owner (update, updater) in
      update_operators (update, ops)
    ) in
    List.fold process_update updates ops_storage

(**
Update leger balances according to the specified transfers. Fails if any of the
permissions or constraints are violated.
@param txs transfers to be applied to the ledger
@param owner_validator function that validates of the tokens from the particular owner can be transferred.
 *)
let transfer (txs, owner_validator, ops_storage, ledger, owners, tiles, emitter
          : (transfer list) * operator_validator * operator_storage * ledger * owners * tiles * address option) : ledger * owners * tiles=
  let make_transfer = (fun (l, tx : (ledger * owners * tiles) * transfer) ->
    List.fold
      (fun (ll, dst : (ledger * owners * tiles) * transfer_destination) ->
        if dst.amount = 0n
        then ll
        else if dst.amount <> 1n
        then (failwith fa2_insufficient_balance : (ledger * owners * tiles))
        else
          let owner = Big_map.find_opt dst.token_id ll.0 in
          match owner with
          | None -> (failwith fa2_token_undefined : (ledger * owners * tiles))
          | Some o ->
            if o <> tx.from_
            then (failwith fa2_insufficient_balance : (ledger * owners * tiles))
            else
            let emmitter : address = match emitter with
            | Some e -> e
            | None -> Tezos.sender
            in
            let _u = owner_validator (o, emmitter, dst.token_id, ops_storage) in
            let ledger_with_transferred_token: ledger = Big_map.update dst.token_id (Some dst.to_) ll.0 in
            let new_owners: owners = transfer_token_in_owners (dst.token_id, o, dst.to_, ll.1) in
            let new_tiles = set_new_tile_owner(dst.token_id, dst.to_, ll.2) in
            (ledger_with_transferred_token, new_owners, new_tiles)
      ) tx.txs l
  )
  in
  let ledger_owner_and_tiles = (ledger, owners, tiles) in
  List.fold make_transfer txs ledger_owner_and_tiles