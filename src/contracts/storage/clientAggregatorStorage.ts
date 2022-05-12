import { BigNumber } from 'bignumber.js'
import { clientAggregatorStorageType } from '../test/types/clientAggregatorStorageType'

const lastCompletedRoundPrice = {
  round: new BigNumber(0),
  price: new BigNumber(0),
  percentOracleResponse: new BigNumber(0),
  decimals: new BigNumber(0),
  priceDateTime: new BigNumber(0)
}

export const clientAggregatorStorage: clientAggregatorStorageType = 
  lastCompletedRoundPrice;
