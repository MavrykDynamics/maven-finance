let get_tile_from_tiles(tokenId, tiles: token_id * tiles): tile =
    let tile : tile = match Big_map.find_opt tokenId tiles with
        | Some(found_tile) -> found_tile
        | None -> (failwith("This tile does not exist") : tile)
    in
    tile

let set_new_tile_owner(tokenId, newOwner, tiles: token_id * address * tiles ) : tiles =
    let tile : tile = get_tile_from_tiles(tokenId, tiles) in
    let updated_tile : tile = {tile with owner = newOwner} in
    let tiles_with_updated_tile: tiles = Big_map.update tokenId (Some(updated_tile)) tiles in
    tiles_with_updated_tile

let set_tile_on_sale_flag(tokenId, isOnSale, tiles: token_id * bool * tiles ) : tiles =
    let tile : tile = get_tile_from_tiles(tokenId, tiles) in
    let updated_tile : tile = {tile with onSale = isOnSale} in
    let tiles_with_updated_tile: tiles = Big_map.update tokenId (Some(updated_tile)) tiles in
    tiles_with_updated_tile

let set_tile_sale_flag_and_new_owner (tokenId, isOnSale, newOwner, tiles: token_id * bool * address * tiles ) : tiles =
    let tile : tile = get_tile_from_tiles(tokenId, tiles) in
    let updated_tile : tile = {tile with onSale = isOnSale; owner = newOwner} in
    let tiles_with_updated_tile: tiles = Big_map.update tokenId (Some(updated_tile)) tiles in
    tiles_with_updated_tile

let update_price_on_sale_flag_for_a_tile (tokenId, isOnSale, price, tiles: token_id * bool * tez * tiles ) : tiles =
    let tile : tile =  get_tile_from_tiles(tokenId, tiles) in
    let updated_tile : tile = {tile with onSale = isOnSale; price = Some(price)} in
    let tiles_with_updated_tile: tiles = Big_map.update tokenId (Some(updated_tile)) tiles in
    tiles_with_updated_tile