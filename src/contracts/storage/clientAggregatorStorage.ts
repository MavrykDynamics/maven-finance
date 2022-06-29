import { BigNumber } from 'bignumber.js'
import { clientAggregatorStorageType } from '../test/types/clientAggregatorStorageType'

// Calculate one year from now
const currentTimestamp  = new Date();
const priceDateTime     = Math.round(currentTimestamp.getTime() / 1000);

const lastCompletedRoundPrice = {
  round: new BigNumber(0),
  price: new BigNumber(0),
  percentOracleResponse: new BigNumber(0),
  decimals: new BigNumber(0),
  priceDateTime: priceDateTime.toString()
}

export const clientAggregatorStorage: clientAggregatorStorageType = 
  lastCompletedRoundPrice;
