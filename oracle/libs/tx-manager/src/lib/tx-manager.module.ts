import { Module } from '@nestjs/common';
import { TxManagerService } from './tx-manager.service';
import { ConfigModule } from './config.module';
import { TxManagerConfig } from './tx-manager.config';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [ConfigModule.forConfig(TxManagerConfig), ScheduleModule.forRoot()],
  controllers: [],
  providers: [TxManagerService],
  exports: [TxManagerService],
})
export class TxManagerModule {}
