import { state } from './types';

export function increaseBlockHeight(state: state, blockHeight?: number): state {
    if(blockHeight) {
        state.blockHeight += blockHeight
    } else {
        state.blockHeight += 1;
    }

    return state
};

export function getBalance(poolIndex: number, state: state): number {
    return state.storage.pools[poolIndex].balance
};

export function getWeight(poolIndex: number, state: state): number {
    return state.storage.pools[poolIndex].denorm
};
