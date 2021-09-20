import { expect } from 'chai';

import { state, storage, pool } from '../src/types'; 
import { pokeWeights } from '../src/weights';
import { getBalance, getWeight, increaseBlockHeight } from '../src/helpers';
import { calcSpotPrice } from '../src/calcComparisons';
// import { log } from '../src/log';

let config = {
    minWeight: 1,
    maxWeight: 40,
    minBalance: 0,
    maxBalance: 40
};

describe('Prototype', () => { 
    let storage: storage;
    
    let state: state;

    before(() => {
        const MVK: pool = {
            startBlock: 0,
            endBlock: 8640,
            startWeight: 39,
            endWeight: 14,
            denorm: 39,
            balance: 30000000
        };

        const fMVK = {
            startBlock: 0,
            endBlock: 8640,
            startWeight: 1,
            endWeight: 26,
            denorm: 1,
            balance: 200000
        }
        
        storage: storage = {
           config: config,
           pools: [MVK, fMVK]
        }
        state = {
            storage: storage,
            blockHeight: 1
        }
    });

    beforeEach(() => {
        state = increaseBlockHeight(state, 8640);
    });

    it('calculates weight for height 8641', () => {        
        state = pokeWeights(state);
        
        expect(state.storage.pools[0].denorm).to.equal(14);
        expect(state.storage.pools[1].denorm).to.equal(26);
    });

    it('calculates the spot price', () => {
        state = pokeWeights(state);

        state.storage.pools[1].balance = 3681637.59;
        const tokenBalanceIn = getBalance(1, state);
        state.storage.pools[0].balance = 17625000;
        const tokenBalanceOut = getBalance(0, state);

        const tokenWeightIn = getWeight(1, state);
        const tokenWeightOut = getWeight(0, state);
        
        // for one MVK you get fMVK dollar equivalent ...
        const spotPrice = calcSpotPrice(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, 0);
    
        expect(spotPrice.toNumber()).to.equal(0.11247774415711947)
    });
});

