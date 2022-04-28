import { Property } from 'ts-convict';
import { CronExpression } from '@nestjs/schedule';

export class OracleConfig {
  @Property({
    default: '',
    env: 'AGGREGATOR_FACTORY_SMART_CONTRACT_ADDRESS',
    format: String,
  })
  public aggregatorFactorySmartContractAddress: string;

  @Property({
    default: '',
    env: 'RPC_URL',
    format: String,
  })
  public rpcUrl: string;

  @Property({
    default: '',
    env: 'ORACLE_SECRET_KEY',
    format: String,
  })
  public oracleSecretKey: string;

  @Property({
    default: '',
    env: 'ORACLE_WITHDRAW_ADDRESS',
    format: String,
  })
  public oracleWithdrawAddress: string;

  @Property({
    default: CronExpression.EVERY_DAY_AT_MIDNIGHT,
    env: 'ORACLE_WITHDRAW_CRON_STRING',
    format: String,
  })
  public oracleWithdrawCronString: string;

  @Property({
    default: CronExpression.EVERY_30_SECONDS,
    env: 'DEVIATION_TRIGGER_CRON_STRING',
    format: String,
  })
  public deviationTriggerCronString: string;

  @Property({
    default: false,
    env: 'USE_FAKE_PRICES',
    format: Boolean,
  })
  public useFakePrices: boolean;

  @Property({
    default: true,
    env: 'WORK_AT_LOSS',
    format: Boolean,
  })
  public workAtLoss: boolean;

  @Property({
    default: true,
    env: 'WORK_WHEN_REWARD_POOL_LOW',
    format: Boolean,
  })
  public workWhenRewardPoolLow: boolean;

  @Property({
    default: '/tmp/database.db',
    env: 'COMMIT_DATA_DB_FILE',
    format: String,
  })
  public commitDataDbFile: string;
}
