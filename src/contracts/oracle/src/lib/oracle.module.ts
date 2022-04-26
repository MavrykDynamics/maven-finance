import { Module } from '@nestjs/common';
import { SetObservationService } from './set-observation.service';
import { ScheduleModule } from '@nestjs/schedule';
import { OracleConfig } from './oracle.config';
import { ConfigModule } from './config.module';
import { PriceService } from './price.service';
import { MessariFetcherModule } from '@mavryk-oracle-node/messari-fetcher';
import { CoingeckoFetcherModule } from '@mavryk-oracle-node/coingecko-fetcher';
import { WithdrawService } from './withdraw.service';
import { TxManagerModule } from '@mavryk-oracle-node/tx-manager';
import { DeviationTriggerService } from './deviation-trigger.service';
import { CommonService } from './common.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forConfig(OracleConfig),
    MessariFetcherModule,
    CoingeckoFetcherModule,
    TxManagerModule,
  ],
  controllers: [],
  providers: [
    SetObservationService,
    PriceService,
    WithdrawService,
    DeviationTriggerService,
    CommonService,
  ],
  exports: [],
})
export class OracleModule {}
