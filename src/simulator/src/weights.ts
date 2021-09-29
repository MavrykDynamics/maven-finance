import { state } from './types';

/**
 * To be called by anyone before purchasing tokens.
 */
export function pokeWeights(state: state): state {
    let newPoolsState = state.storage.pools.map(function(pool) {
        if(state.blockHeight <= pool.startBlock) {
            console.log("can't poke yet")
            return pool
        }
    
        let currentBlock;
        if(state.blockHeight > pool.endBlock) {
            currentBlock = pool.endBlock;
        } else {
            currentBlock = state.blockHeight;
        }
    
        const blockPeriod = pool.endBlock - pool.startBlock;
        const blocksElapsed = currentBlock - pool.startBlock;
        
        let weightDelta;
        let deltaPerBlock;
        let newWeight;
    
        // do nothing
        if(pool.endWeight == pool.startWeight) return pool;
    
        if(pool.endWeight < pool.startWeight) {
            // decreasing weights
            weightDelta = pool.startWeight - pool.endWeight;
            deltaPerBlock = weightDelta / blockPeriod;
            newWeight = pool.startWeight - deltaPerBlock * blocksElapsed;
        } else {
            //increasing weights
            weightDelta = pool.endWeight - pool.startWeight;
            deltaPerBlock = weightDelta / blockPeriod;
            newWeight = pool.startWeight + deltaPerBlock * blocksElapsed;
        }
        
        // update denorm weight
        pool.denorm = newWeight

        return pool;
    
        // Reset for manual weight updates, add, remove
        // if (state.blockHeight >= state.storage.pools.endBlock) {
        //     state.storage.pools.startBlock = 0;
        // }
    })
    state.storage.pools = newPoolsState;
    return state;
}

/**
 * Weight of an existing token can be updated by admin, however the admin will either
 * receive surplus tokens to keep the price OR
 * deposit tokens to keep the price.
 * 
 * Checks:
 * config.minWeight <= newWeight
 * config.maxWeight >= newWeight
 * config.minBalance <= newBalance
 * config.maxBalance >= newBalance
 */
// function updateWeight(newWeight, state) {
//     // TODO
//     return state
// }
