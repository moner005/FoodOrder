import { Test, TestingModule } from '@nestjs/testing';
import { MealsService } from './meals.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('MealsService', () => {
  let service: MealsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MealsService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<MealsService>(MealsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
