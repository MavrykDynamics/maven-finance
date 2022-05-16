import BigNumber from 'bignumber.js';

export interface PriceFetcher {
  getPrice([pair1, pair2]: [string, string]): Promise<BigNumber>;
}
