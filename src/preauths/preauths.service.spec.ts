import { Test, TestingModule } from '@nestjs/testing';
import { PreauthsService } from './preauths.service.js';

describe('PreauthsService', () => {
  let service: PreauthsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreauthsService],
    }).compile();

    service = module.get<PreauthsService>(PreauthsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
