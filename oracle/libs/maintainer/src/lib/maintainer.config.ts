import { Property } from 'ts-convict';

export class MaintainerConfig {
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
    env: 'MAINTAINER_PKH',
    format: String,
  })
  public maintainerPkh: string;
}
