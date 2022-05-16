import { Property } from 'ts-convict';

export class TxManagerConfig {
  @Property({
    default: '',
    env: 'RPC_URL',
    format: String,
  })
  public rpcUrl: string;

  @Property({
    default: '',
    env: 'SIGNER_URL',
    format: String,
  })
  public signerUrl: string;

  @Property({
    default: 5,
    env: 'CONFIRMATION_POLLING_INTERVAL_SECOND',
    format: Number,
  })
  confirmationPollingIntervalSecond: number;
}
