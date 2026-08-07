import { Injectable, Logger } from '@nestjs/common';

import {
  OptimizationAlgorithm,
  OptimizationRequest,
  OptimizationResult,
} from './optimization-manager';

import {
  ParameterOptimizer,
  ParameterSet,
} from './parameter-optimizer';

import { GridSearch } from './grid-search';
import { GeneticOptimizer } from './genetic-optimizer';
import { BayesianOptimizer } from './bayesian-optimizer';

export interface WalkForwardWindow {
  id: number;

  trainingStart: Date;

  trainingEnd: Date;

  testingStart: Date;

  testingEnd: Date;

  trainingBars: number;

  testingBars: number;
}

export interface WalkForwardWindowResult {
  windowId: number;

  bestParameters: ParameterSet;

  trainingScore: number;

  validationScore: number;

  efficiency: number;

  overfitScore: number;

  executionTimeMs: number;
}

export interface WalkForwardReport {
  totalWindows: number;

  averageTrainingScore: number;

  averageValidationScore: number;

  averageEfficiency: number;

  robustnessScore: number;

  consistencyScore: number;

  overfittingRisk: number;

  bestParameters: ParameterSet;

  windowResults: WalkForwardWindowResult[];
}

@Injectable()
export class WalkForwardOptimizer {
  private readonly logger = new Logger(
    WalkForwardOptimizer.name,
  );

  constructor(
    private readonly parameterOptimizer: ParameterOptimizer,
    private readonly gridSearch: GridSearch,
    private readonly geneticOptimizer: GeneticOptimizer,
    private readonly bayesianOptimizer: BayesianOptimizer,
  ) {}

  /**
   * Main Walk Forward Optimization entry point.
   */
  async optimize(
    request: OptimizationRequest,
  ): Promise<OptimizationResult> {
    const started = Date.now();

    this.logger.log(
      `Starting Walk Forward Optimization for strategy ${request.strategyId}`,
    );

    const windows =
      this.generateWindows(request);

    this.logger.log(
      `Generated ${windows.length} optimization windows.`,
    );

    const windowResults: WalkForwardWindowResult[] = [];

    for (const window of windows) {
      this.logger.debug(
        `Processing Window ${window.id}`,
      );

      const result =
        await this.processWindow(
          window,
          request,
        );

      windowResults.push(result);
    }

    const report =
      this.buildReport(windowResults);

    return {
      strategyId: request.strategyId,

      algorithm:
        OptimizationAlgorithm.WALK_FORWARD,

      bestParameters:
        report.bestParameters,

      objectiveScore:
        report.averageValidationScore,

      totalEvaluations:
        windowResults.length,

      completedAt: new Date(),

      executionTimeMs:
        Date.now() - started,

      metadata: report,
    };
  }

  /**
   * Creates rolling training
   * and testing windows.
   */
  private generateWindows(
    request: OptimizationRequest,
  ): WalkForwardWindow[] {
    const windows: WalkForwardWindow[] = [];

    const trainingBars = 1000;

    const testingBars = 200;

    const step = testingBars;

    const totalBars =
      request.walkForwardWindows
        ? trainingBars +
          request.walkForwardWindows *
            testingBars
        : 3000;

    let id = 1;

    for (
      let trainStart = 0;
      trainStart +
        trainingBars +
        testingBars <=
      totalBars;
      trainStart += step
    ) {
      const trainEnd =
        trainStart +
        trainingBars -
        1;

      const testStart =
        trainEnd + 1;

      const testEnd =
        testStart +
        testingBars -
        1;

      windows.push({
        id,

        trainingStart:
          this.barToDate(trainStart),

        trainingEnd:
          this.barToDate(trainEnd),

        testingStart:
          this.barToDate(testStart),

        testingEnd:
          this.barToDate(testEnd),

        trainingBars,

        testingBars,
      });

      id++;
    }

    return windows;
  }

  /**
   * Temporary conversion.
   *
   * Later replaced by
   * HistoricalDataService timestamps.
   */
  private barToDate(
    barIndex: number,
  ): Date {
    const base =
      new Date('2020-01-01T00:00:00Z');

    base.setMinutes(
      base.getMinutes() +
        barIndex,
    );

    return base;
  }

  /**
   * Executes one
   * Walk Forward window.
   */
  private async processWindow(
    window: WalkForwardWindow,
    request: OptimizationRequest,
  ): Promise<WalkForwardWindowResult> {
    const started = Date.now();

    let optimization: OptimizationResult;

    switch (request.algorithm) {
      case OptimizationAlgorithm.GRID_SEARCH:
        optimization =
          await this.gridSearch.optimize(
            request,
          );
        break;

      case OptimizationAlgorithm.GENETIC:
        optimization =
          await this.geneticOptimizer.optimize(
            request,
          );
        break;

      case OptimizationAlgorithm.BAYESIAN:
        optimization =
          await this.bayesianOptimizer.optimize(
            request,
          );
        break;

      default:
        optimization =
          await this.gridSearch.optimize(
            request,
          );
    }    const trainingScore =
      optimization.objectiveScore;

    const validationScore =
      await this.validateWindow(
        optimization.bestParameters,
        window,
        request,
      );

    const efficiency =
      this.calculateEfficiency(
        trainingScore,
        validationScore,
      );

    const overfitScore =
      this.calculateOverfitScore(
        trainingScore,
        validationScore,
      );

    return {
      windowId: window.id,

      bestParameters:
        optimization.bestParameters,

      trainingScore,

      validationScore,

      efficiency,

      overfitScore,

      executionTimeMs:
        Date.now() - started,
    };
  }

  /**
   * Executes the strategy on the
   * out-of-sample dataset.
   *
   * NOTE:
   * This is a temporary implementation.
   * It will later invoke:
   *
   * HistoricalDataService
   * ↓
   * MarketReplay
   * ↓
   * ExecutionSimulator
   * ↓
   * PortfolioSimulator
   * ↓
   * PerformanceAnalyzer
   */
  private async validateWindow(
    parameters: ParameterSet,
    window: WalkForwardWindow,
    request: OptimizationRequest,
  ): Promise<number> {
    return this.mockValidation(
      parameters,
    );
  }

  /**
   * Temporary validation engine.
   *
   * Will be replaced by the
   * Backtesting Engine.
   */
  private mockValidation(
    parameters: ParameterSet,
  ): number {
    let score = 0;

    for (const value of Object.values(
      parameters,
    )) {
      if (typeof value === 'number') {
        score += value;
      }

      if (typeof value === 'boolean') {
        score += value ? 1 : 0;
      }
    }

    const randomNoise =
      (Math.random() - 0.5) * 10;

    return score + randomNoise;
  }

  /**
   * Walk Forward Efficiency.
   *
   * 100%
   * means the strategy performs
   * equally well in training
   * and testing.
   */
  private calculateEfficiency(
    training: number,
    validation: number,
  ): number {
    if (training === 0) {
      return 0;
    }

    return (
      (validation / training) *
      100
    );
  }

  /**
   * Estimates the degree
   * of overfitting.
   */
  private calculateOverfitScore(
    training: number,
    validation: number,
  ): number {
    return Math.max(
      0,
      training - validation,
    );
  }

  /**
   * Produces the final
   * Walk Forward report.
   */
  private buildReport(
    results: WalkForwardWindowResult[],
  ): WalkForwardReport {
    const averageTrainingScore =
      results.reduce(
        (sum, result) =>
          sum + result.trainingScore,
        0,
      ) /
      Math.max(results.length, 1);

    const averageValidationScore =
      results.reduce(
        (sum, result) =>
          sum +
          result.validationScore,
        0,
      ) /
      Math.max(results.length, 1);

    const averageEfficiency =
      results.reduce(
        (sum, result) =>
          sum + result.efficiency,
        0,
      ) /
      Math.max(results.length, 1);

    const overfittingRisk =
      results.reduce(
        (sum, result) =>
          sum +
          result.overfitScore,
        0,
      ) /
      Math.max(results.length, 1);

    const robustnessScore =
      this.calculateRobustness(
        results,
      );

    const consistencyScore =
      this.calculateConsistency(
        results,
      );

    const bestResult =
      this.selectBestWindow(
        results,
      );

    return {
      totalWindows:
        results.length,

      averageTrainingScore,

      averageValidationScore,

      averageEfficiency,

      robustnessScore,

      consistencyScore,

      overfittingRisk,

      bestParameters:
        bestResult.bestParameters,

      windowResults: results,
    };
  }

  /**
   * Computes robustness
   * across all windows.
   */
  private calculateRobustness(
    results: WalkForwardWindowResult[],
  ): number {
    if (results.length === 0) {
      return 0;
    }

    const average =
      results.reduce(
        (sum, result) =>
          sum +
          result.validationScore,
        0,
      ) / results.length;

    const variance =
      results.reduce(
        (sum, result) => {
          return (
            sum +
            Math.pow(
              result.validationScore -
                average,
              2,
            )
          );
        },
        0,
      ) / results.length;

    const deviation =
      Math.sqrt(variance);

    return Math.max(
      0,
      100 - deviation,
    );
  }  /**
   * Calculates consistency across
   * all walk-forward windows.
   *
   * Higher consistency means
   * validation performance remains
   * stable throughout the entire
   * historical period.
   */
  private calculateConsistency(
    results: WalkForwardWindowResult[],
  ): number {
    if (results.length <= 1) {
      return 100;
    }

    const efficiencies = results.map(
      (result) => result.efficiency,
    );

    const average =
      efficiencies.reduce(
        (sum, value) => sum + value,
        0,
      ) / efficiencies.length;

    const variance =
      efficiencies.reduce(
        (sum, value) => {
          return (
            sum +
            Math.pow(
              value - average,
              2,
            )
          );
        },
        0,
      ) / efficiencies.length;

    const deviation =
      Math.sqrt(variance);

    return Math.max(
      0,
      100 - deviation,
    );
  }

  /**
   * Selects the best performing
   * validation window.
   */
  private selectBestWindow(
    results: WalkForwardWindowResult[],
  ): WalkForwardWindowResult {
    if (results.length === 0) {
      throw new Error(
        'No walk-forward results available.',
      );
    }

    return results.reduce(
      (
        best,
        current,
      ): WalkForwardWindowResult => {
        if (
          current.validationScore >
          best.validationScore
        ) {
          return current;
        }

        return best;
      },
      results[0],
    );
  }

  /**
   * Calculates the average
   * overfitting across all
   * optimization windows.
   */
  private calculateAverageOverfit(
    results: WalkForwardWindowResult[],
  ): number {
    if (results.length === 0) {
      return 0;
    }

    return (
      results.reduce(
        (sum, result) =>
          sum + result.overfitScore,
        0,
      ) / results.length
    );
  }

  /**
   * Calculates the average
   * validation score.
   */
  private calculateAverageValidation(
    results: WalkForwardWindowResult[],
  ): number {
    if (results.length === 0) {
      return 0;
    }

    return (
      results.reduce(
        (sum, result) =>
          sum +
          result.validationScore,
        0,
      ) / results.length
    );
  }

  /**
   * Calculates the average
   * training score.
   */
  private calculateAverageTraining(
    results: WalkForwardWindowResult[],
  ): number {
    if (results.length === 0) {
      return 0;
    }

    return (
      results.reduce(
        (sum, result) =>
          sum +
          result.trainingScore,
        0,
      ) / results.length
    );
  }

  /**
   * Calculates the average
   * walk-forward efficiency.
   */
  private calculateAverageEfficiency(
    results: WalkForwardWindowResult[],
  ): number {
    if (results.length === 0) {
      return 0;
    }

    return (
      results.reduce(
        (sum, result) =>
          sum +
          result.efficiency,
        0,
      ) / results.length
    );
  }
}
