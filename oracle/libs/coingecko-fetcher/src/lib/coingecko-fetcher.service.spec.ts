import { Test } from '@nestjs/testing';
import { CoingeckoFetcherService } from './coingecko-fetcher.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from './config.module';
import { CoingeckoFetcherConfig } from './coingecko-fetcher.config';

describe('CoingeckoFetcherService', () => {
  let service: CoingeckoFetcherService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CoingeckoFetcherService],
      imports: [HttpModule, ConfigModule.forConfig(CoingeckoFetcherConfig)],
    }).compile();

    service = module.get(CoingeckoFetcherService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
