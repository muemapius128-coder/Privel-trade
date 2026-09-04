import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BacktestingController } from './controllers/backtesting.controller';
import { BacktestingService } from './services/backtesting.service';
import { BacktestingRepository } from './repositories/backtesting.repository';

import { Backtest } from './entities/backtest.entity';
import { BacktestRun } from './entities/backtest-run.entity';
import { Strategy } from './entities/entities/strategy.entity';  // ✅ Fixed path
import { TradeResult } from './entities/trade-result.entity';
import { EquityCurve } from './entities/equity-curve.entity';
import { PerformanceMetrics } from './entities/performance-metrics.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Backtest,
      BacktestRun,
      Strategy,
      TradeResult,
      EquityCurve,
      PerformanceMetrics,
    ]),
  ],
  controllers: [BacktestingController],
  providers: [BacktestingService, BacktestingRepository],
  exports: [BacktestingService, BacktestingRepository],
})
export class BacktestingModule {}
