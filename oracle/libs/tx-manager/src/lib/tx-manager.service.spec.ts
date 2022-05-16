import { Test, TestingModule } from '@nestjs/testing';
import { TxManagerService } from './tx-manager.service';

describe('TxManagerService', () => {
  let service: TxManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TxManagerService],
    }).compile();

    service = module.get<TxManagerService>(TxManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
