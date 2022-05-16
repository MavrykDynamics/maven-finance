import { Property } from 'ts-convict';

export class CoingeckoFetcherConfig {
  @Property({
    default: '',
    env: 'COINGECKO_API_KEY',
    format: String,
  })
  public coingeckoApiKey: string;
}
