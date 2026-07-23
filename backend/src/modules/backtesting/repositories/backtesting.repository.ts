import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Backtest } from '../entities/backtest.entity';
import { BacktestRun } from '../entities/backtest-run.entity';
import { TradeResult } from '../entities/trade-result.entity';
import { EquityCurve } from '../entities/equity-curve.entity';
import { PerformanceMetrics } from '../entities/performance-metrics.entity';
import { Strategy } from '../entities/strategy.entity';

@Injectable()
export class BacktestingRepository {
  constructor(
    @InjectRepository(Backtest)
    private readonly backtestRepository: Repository<Backtest>,

    @InjectRepository(BacktestRun)
    private readonly backtestRunRepository: Repository<BacktestRun>,

    @InjectRepository(TradeResult)
    private readonly tradeResultRepository: Repository<TradeResult>,

    @InjectRepository(EquityCurve)
    private readonly equityCurveRepository: Repository<EquityCurve>,

    @InjectRepository(PerformanceMetrics)
    private readonly performanceRepository: Repository<PerformanceMetrics>,

    @InjectRepository(Strategy)
    private readonly strategyRepository: Repository<Strategy>,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                BACKTESTS                                   */
  /* -------------------------------------------------------------------------- */

  async createBacktest(backtest: Partial<Backtest>): Promise<Backtest> {
    const entity = this.backtestRepository.create(backtest);
    return this.backtestRepository.save(entity);
  }

  async updateBacktest(
    id: string,
    data: Partial<Backtest>,
  ): Promise<void> {
    await this.backtestRepository.update(id, data);
  }

  async deleteBacktest(id: string): Promise<void> {
    await this.backtestRepository.delete(id);
  }

  async findBacktestById(id: string): Promise<Backtest | null> {
    return this.backtestRepository.findOne({
      where: { id },
    });
  }

  async findAllBacktests(): Promise<Backtest[]> {
    return this.backtestRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                              STRATEGIES                                    */
  /* -------------------------------------------------------------------------- */

  async findStrategy(id: string): Promise<Strategy | null> {
    return this.strategyRepository.findOne({
      where: { id },
    });
  }

  async saveStrategy(strategy: Strategy): Promise<Strategy> {
    return this.strategyRepository.save(strategy);
  }

  /* -------------------------------------------------------------------------- */
  /*                              BACKTEST RUNS                                 */
  /* -------------------------------------------------------------------------- */

  async createRun(run: Partial<BacktestRun>): Promise<BacktestRun> {
    const entity = this.backtestRunRepository.create(run);
    return this.backtestRunRepository.save(entity);
  }

  async updateRun(
    id: string,
    data: Partial<BacktestRun>,
  ): Promise<void> {
    await this.backtestRunRepository.update(id, data);
  }

  async findRun(id: string): Promise<BacktestRun | null> {
    return this.backtestRunRepository.findOne({
      where: { id },
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                             TRADE RESULTS                                  */
  /* -------------------------------------------------------------------------- */

  async saveTrade(
    trade: Partial<TradeResult>,
  ): Promise<TradeResult> {
    const entity = this.tradeResultRepository.create(trade);
    return this.tradeResultRepository.save(entity);
  }

  async saveTrades(
    trades: Partial<TradeResult>[],
  ): Promise<TradeResult[]> {
    const entities = this.tradeResultRepository.create(trades);
    return this.tradeResultRepository.save(entities);
  }

  async findTrades(runId: string): Promise<TradeResult[]> {
    return this.tradeResultRepository.find({
      where: {
        backtestRunId: runId,
      },
      order: {
        openedAt: 'ASC',
      },
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                             EQUITY CURVE                                   */
  /* -------------------------------------------------------------------------- */

  async saveEquityPoint(
    point: Partial<EquityCurve>,
  ): Promise<EquityCurve> {
    const entity = this.equityCurveRepository.create(point);
    return this.equityCurveRepository.save(entity);
  }

  async saveEquityCurve(
    points: Partial<EquityCurve>[],
  ): Promise<EquityCurve[]> {
    const entities = this.equityCurveRepository.create(points);
    return this.equityCurveRepository.save(entities);
  }

  async getEquityCurve(
    runId: string,
  ): Promise<EquityCurve[]> {
    return this.equityCurveRepository.find({
      where: {
        backtestRunId: runId,
      },
      order: {
        timestamp: 'ASC',
      },
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                         PERFORMANCE METRICS                                */
  /* -------------------------------------------------------------------------- */

  async savePerformance(
    metrics: Partial<PerformanceMetrics>,
  ): Promise<PerformanceMetrics> {
    const entity = this.performanceRepository.create(metrics);
    return this.performanceRepository.save(entity);
  }

  async getPerformance(
    runId: string,
  ): Promise<PerformanceMetrics | null> {
    return this.performanceRepository.findOne({
      where: {
        backtestRunId: runId,
      },
    });
  }
}
