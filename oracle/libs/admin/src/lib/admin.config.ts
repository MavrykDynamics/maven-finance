import { Property } from 'ts-convict';

export class AdminConfig {
  @Property({
    default: '',
    env: 'AGGREGATOR_FACTORY_SMART_CONTRACT_ADDRESS',
    format: String,
  })
  public aggregatorFactorySmartContractAddress: string;

  @Property({
    default: 60,
    env: 'ROUND_DURATION_MINUTES',
    format: Number,
  })
  public roundDurationMinutes: number;

  @Property({
    default: '',
    env: 'RPC_URL',
    format: String,
  })
  public rpcUrl: string;

  @Property({
    default: '',
    env: 'ADMIN_PKH',
    format: String,
  })
  public adminPkh: string;
}
