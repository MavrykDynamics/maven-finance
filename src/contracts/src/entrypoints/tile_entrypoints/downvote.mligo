type downvote_param = {
    tileId: nat;
}

let downvote (downvote_param, store : downvote_param * nft_token_storage) : (operation  list) * nft_token_storage =
    let token_id: token_id = downvote_param.tileId in
    let newDownvotes = Big_map.add token_id Tezos.sender store.market.downvotes in
    let newStorage : nft_token_storage = { store with market.downvotes=newDownvotes } in
    ([] : operation list), newStorage
