import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { BacktestingRepository } from '../repositories/backtesting.repository';

import { CreateBacktestDto } from '../dto/create-backtest.dto';
import { RunBacktestDto } from '../dto/run-backtest.dto';

@Injectable()
export class BacktestingService {
  constructor(
    private readonly repository: BacktestingRepository,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                BACKTESTS                                   */
  /* -------------------------------------------------------------------------- */

  async create(dto: CreateBacktestDto) {
    return this.repository.createBacktest(dto);
  }

  async findAll() {
    return this.repository.findAllBacktests();
  }

  async findOne(id: string) {
    const backtest = await this.repository.findBacktestById(id);

    if (!backtest) {
      throw new NotFoundException(
        `Backtest ${id} not found`,
      );
    }

    return backtest;
  }

  async update(
    id: string,
    dto: CreateBacktestDto,
  ) {
    await this.findOne(id);

    await this.repository.updateBacktest(id, dto);

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.repository.deleteBacktest(id);

    return {
      success: true,
      message: 'Backtest deleted successfully.',
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                               EXECUTION                                    */
  /* -------------------------------------------------------------------------- */

  async run(dto: RunBacktestDto) {
    const backtest = await this.repository.findBacktestById(
      dto.backtestId,
    );

    if (!backtest) {
      throw new NotFoundException(
        'Backtest not found.',
      );
    }

    /*
      Simulation Engine will be integrated here.

      Future Flow:

      Historical Data
             ↓
      Strategy Runner
             ↓
      Simulation Engine
             ↓
      Analytics Engine
             ↓
      Performance Engine
             ↓
      Report Generator
    */

    const run = await this.repository.createRun({
      backtestId: backtest.id,
      strategyId: backtest.strategyId,
      symbol: backtest.symbol,
      timeframe: backtest.timeframe,
      startDate: backtest.startDate,
      endDate: backtest.endDate,
      initialCapital: backtest.initialCapital,
      status: 'PENDING',
    });

    return {
      message: 'Backtest queued successfully.',
      run,
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                                RESULTS                                     */
  /* -------------------------------------------------------------------------- */

  async getResults(runId: string) {
    const trades = await this.repository.findTrades(runId);

    const equityCurve =
      await this.repository.getEquityCurve(runId);

    const performance =
      await this.repository.getPerformance(runId);

    return {
      performance,
      equityCurve,
      trades,
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                                REPORTS                                     */
  /* -------------------------------------------------------------------------- */

  async generateReport(runId: string) {
    const results = await this.getResults(runId);

    return {
      reportGenerated: true,
      generatedAt: new Date(),
      results,
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                             OPTIMIZATION                                   */
  /* -------------------------------------------------------------------------- */

  async optimize(backtestId: string) {
    const backtest =
      await this.repository.findBacktestById(backtestId);

    if (!backtest) {
      throw new NotFoundException(
        'Backtest not found.',
      );
    }

    /*
      Bayesian Optimization
      Grid Search
      Genetic Algorithm

      Will be implemented here.
    */

    return {
      message: 'Optimization started.',
      backtestId,
    };
  }
}
