import { Test, TestingModule } from '@nestjs/testing';
import { PreauthsController } from './preauths.controller.js';

describe('PreauthsController', () => {
  let controller: PreauthsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreauthsController],
    }).compile();

    controller = module.get<PreauthsController>(PreauthsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
