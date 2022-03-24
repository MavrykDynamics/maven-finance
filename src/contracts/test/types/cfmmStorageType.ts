import { MichelsonMap, MichelsonMapKey } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'

export type cfmmStorageType = {

  admin : string,
  
  cashTokenAddress: string;
  cashTokenId: BigNumber;
  cashPool: BigNumber;

  lpTokenAddress: string;
  lpTokensTotal : BigNumber;
  pendingPoolUpdates: BigNumber;

  tokenName : string;
  tokenAddress : string;
  tokenPool: BigNumber;

  tokenId : BigNumber;

  lastOracleUpdate : Date;
  consumerEntrypoint : string;

  usdmTokenAddress : string;
    
}
