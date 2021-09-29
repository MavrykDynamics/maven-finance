type tile = {
    tileId: nat;
    canvasId: string;
    deadline: timestamp;
    tileWidth: nat;
    tileHeight: nat;
    x: int;
    y: int;
    l: int;
    image: string;
    isOwned: bool;
    owner: address;
    onSale: bool;
    price: tez option;
    // upvotes: address set;
    // downvotes: address set;
}

type sale = {
    token_id: token_id;
    price: tez;
}

type tiles = (nat, tile) big_map

type owners = (address, token_id set) big_map