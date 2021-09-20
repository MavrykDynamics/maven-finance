import { state } from "./types";

export function log(state: state): void {
    // log block height
    console.log('blockHeight is', state.blockHeight)
    
    // // log balance
    // state.storage.pools.forEach(pool => 
    //     console.log('balance', pool.balance)
    // );

    // log state for debug purposes
    console.log(state.storage.pools)
};
