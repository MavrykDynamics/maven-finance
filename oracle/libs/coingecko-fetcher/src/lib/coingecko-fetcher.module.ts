import { Module } from '@nestjs/common';
import { CoingeckoFetcherService } from './coingecko-fetcher.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from './config.module';
import { CoingeckoFetcherConfig } from './coingecko-fetcher.config';

@Module({
  imports: [HttpModule, ConfigModule.forConfig(CoingeckoFetcherConfig)],
  controllers: [],
  providers: [CoingeckoFetcherService],
  exports: [CoingeckoFetcherService],
})
export class CoingeckoFetcherModule {}
