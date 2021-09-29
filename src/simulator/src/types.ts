type address = string;

type config = {
    minWeight: number,
    maxWeight: number,
    minBalance: number,
    maxBalance: number,
}

type token = (tokenId, tokenAddress);
// FA1.2 typetoken = tokenAddress;

export type pool = {
    startBlock: number,
    endBlock: number,
    startWeight: number,
    endWeight: number,
    denorm: number,
    balance: number
}

export type storage = {
    config: config,
    pools: Array<pool> //Big_map(token, pool)
}

export type state = {
    storage: storage,
    blockHeight,
}