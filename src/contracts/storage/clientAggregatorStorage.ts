import { BigNumber } from 'bignumber.js'
import { clientAggregatorStorageType } from '../test/types/clientAggregatorStorageType'

// Calculate one year from now
const currentTimestamp  = new Date();
const lastUpdatedAt     = Math.round(currentTimestamp.getTime() / 1000);

const lastCompletedData = {
    round                   : new BigNumber(0),
    data                    : new BigNumber(0),
    percentOracleResponse   : new BigNumber(0),
    decimals                : new BigNumber(0),
    lastUpdatedAt           : lastUpdatedAt.toString()
}

export const clientAggregatorStorage: clientAggregatorStorageType = 
    lastCompletedData;
