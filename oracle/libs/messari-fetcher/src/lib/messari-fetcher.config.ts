import { Property } from 'ts-convict';

export class MessariFetcherConfig {
  @Property({
    default: '',
    env: 'MESSARI_API_KEY',
    format: String,
  })
  public messariApiKey: string;
}
