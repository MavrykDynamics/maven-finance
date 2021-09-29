type upvote_param = {
    tileId: nat;
}

let upvote (upvote_param, store : upvote_param * nft_token_storage) : (operation  list) * nft_token_storage =
    let token_id: token_id = upvote_param.tileId in
    let newUpvotes = Big_map.add token_id Tezos.sender store.market.upvotes in
    let newStorage : nft_token_storage = { store with market.upvotes=newUpvotes } in
    ([] : operation list), newStorage
