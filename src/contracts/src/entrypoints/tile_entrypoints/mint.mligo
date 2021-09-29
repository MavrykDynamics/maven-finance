type mint_param = {
    tileId: nat;
    canvasId: string;
    x: int;
    y: int;
    l: int;
    image: string;
    owner: address;
    operator: address option;
    deadline: timestamp;
    tileWidth: nat;
    tileHeight: nat;
}
(**
Create a tile, and a token (they both have the same id), associate token to given owner, (and possibly setup an operator for this newly minted token).
Several checks are carried out: the token must be within the market range (width and height) and must be a new token (and not an already existing token).
@return storage with new token, and operators
*)
let mint (mint_param, store : mint_param * nft_token_storage) : (operation  list) * nft_token_storage =
    let token_id: token_id = mint_param.tileId in
    let create_token_with_operator (p, s : mint_param * nft_token_storage) : (operation  list) * nft_token_storage =
        let new_owners: owners = add_token_to_owner (token_id, p.owner, s.market.owners) in
        let ledger_with_minted_token = Big_map.add token_id p.owner s.ledger in
        let ledger_and_owners_are_consistent : bool = check_ownership_is_consistent_in_ledger_and_owners (({owner=p.owner; token_id=token_id} : ownership), ledger_with_minted_token, new_owners) in
        if ledger_and_owners_are_consistent then
            let new_tile = ({ tileId=token_id; canvasId=p.canvasId; x=p.x; y=p.y; l=p.l; image=p.image; isOwned=true; owner=p.owner; onSale=false ; price=(None:tez option); deadline=p.deadline; tileWidth=p.tileWidth; tileHeight=p.tileHeight }:tile) in
            let tiles_with_new_tile = Big_map.add token_id new_tile s.market.tiles in
            let tiles_ids_with_new_id = Set.add token_id s.market.tileIds in
            match mint_param.operator with
            | None -> ([] : operation list),  { s with ledger = ledger_with_minted_token; market = { s.market with tiles=tiles_with_new_tile; tileIds=tiles_ids_with_new_id; owners=new_owners; } }
            | Some(operator_address) ->
                let update : update_operator = Add_operator({ owner = p.owner; operator = operator_address; token_id = token_id; }) in
                let operators_with_minted_token_operator = update_operators (update, s.operators) in
                ([] : operation list),  { s with ledger = ledger_with_minted_token; operators = operators_with_minted_token_operator; market = { s.market with tiles=tiles_with_new_tile; tileIds=tiles_ids_with_new_id; owners=new_owners; } }
        else
            (failwith("Error: cannot mint this token") : (operation  list) * nft_token_storage)
    in
    let token_owner_option : address option = Big_map.find_opt token_id store.ledger in
    match token_owner_option with
    | Some(_ownr) -> (failwith("This non-fungible token already exists"): (operation  list) * nft_token_storage)
    | None -> create_token_with_operator (mint_param, store)
