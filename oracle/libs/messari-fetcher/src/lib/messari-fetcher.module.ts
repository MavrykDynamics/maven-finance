import { Module } from '@nestjs/common';
import { MessariFetcherService } from './messari-fetcher.service';
import { HttpModule } from '@nestjs/axios';
import { MessariFetcherConfig } from './messari-fetcher.config';
import { ConfigModule } from './config.module';

@Module({
  imports: [HttpModule, ConfigModule.forConfig(MessariFetcherConfig)],
  controllers: [],
  providers: [MessariFetcherService],
  exports: [MessariFetcherService],
})
export class MessariFetcherModule {}
