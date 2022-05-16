import { Test } from '@nestjs/testing';
import { MessariFetcherService } from './messari-fetcher.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from './config.module';
import { MessariFetcherConfig } from './messari-fetcher.config';

describe('MessariFetcherService', () => {
  let service: MessariFetcherService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MessariFetcherService],
      imports: [HttpModule, ConfigModule.forConfig(MessariFetcherConfig)],
    }).compile();

    service = module.get(MessariFetcherService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
