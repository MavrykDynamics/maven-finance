type withdraw_param = sale

(**
Withdraw the tile on sale from the "on_sale" list and removes this contract as an operator for this token
A check is carried out: the tile must be on sale. Only the owner of the token can cancel the sale
@return storage with modified operators and on_sale lists
*)
let withdraw_from_sale (withdraw_param, storage : withdraw_param * nft_token_storage) : (operation  list) * nft_token_storage =
    if not is_owner(withdraw_param.token_id, Tezos.sender, storage.ledger)
    then (failwith("Only the owner of a tile can withdraw it from sale") : (operation  list) * nft_token_storage)
    else
        let token_on_sale : bool = Set.mem withdraw_param storage.market.sales in
        if token_on_sale then
            let operators_without_token_operator = exec_update_operator([Remove_operator({owner=Tezos.sender; operator=Tezos.self_address; token_id=withdraw_param.token_id})], Tezos.sender, storage.operators) in
            let sales_without_removed_tile = Set.remove withdraw_param storage.market.sales in
            let tiles_with_updated_tile: tiles =  set_tile_on_sale_flag(withdraw_param.token_id, false, storage.market.tiles) in
            ([] : operation list),  { storage with market = { storage.market with sales = sales_without_removed_tile; tiles = tiles_with_updated_tile }; operators = operators_without_token_operator }
        else
            (failwith("This tile is not on sale"): (operation  list) * nft_token_storage)

