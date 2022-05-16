import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RequestRateUpdateService } from './requestRateUpdate.service';
import { ConfigModule } from './config.module';
import { AdminConfig } from './admin.config';
import { TxManagerModule } from '@mavryk-oracle-node/tx-manager';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forConfig(AdminConfig),
    TxManagerModule,
  ],
  controllers: [],
  providers: [RequestRateUpdateService],
  exports: [],
})
export class AdminModule {}
