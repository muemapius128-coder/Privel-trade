import { Module } from '@nestjs/common';

import { BacktestingController } from './controllers/backtesting.controller';
import { BacktestingService } from './services/backtesting.service';
import { BacktestingRepository } from './repositories/backtesting.repository';

@Module({
  controllers: [BacktestingController],
  providers: [
    BacktestingService,
    BacktestingRepository,
  ],
  exports: [
    BacktestingService,
  ],
})
export class BacktestingModule {}
