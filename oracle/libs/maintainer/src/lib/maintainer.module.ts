import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RequestRateUpdateService } from './requestRateUpdate.service';
import { ConfigModule } from './config.module';
import { MaintainerConfig } from './maintainer.config';
import { TxManagerModule } from '@mavryk-oracle-node/tx-manager';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forConfig(MaintainerConfig),
    TxManagerModule,
  ],
  controllers: [],
  providers: [RequestRateUpdateService],
  exports: [],
})
export class MaintainerModule {}
