import { Injectable, Logger } from '@nestjs/common';

import {
  OptimizationAlgorithm,
  OptimizationRequest,
  OptimizationResult,
} from './optimization-manager';

import {
  ParameterDefinition,
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
   * Entry point for Walk Forward Optimization
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

    const windowResults: WalkForwardWindowResult[] = [];

    for (const window of windows) {
      this.logger.debug(
        `Processing window ${window.id}`,
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
   * Generates rolling training/testing windows.
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
          testingBars *
            request.walkForwardWindows
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
          this.barToDate(
            trainStart,
          ),

        trainingEnd:
          this.barToDate(
            trainEnd,
          ),

        testingStart:
          this.barToDate(
            testStart,
          ),

        testingEnd:
          this.barToDate(
            testEnd,
          ),

        trainingBars,

        testingBars,
      });

      id++;
    }

    this.logger.log(
      `Generated ${windows.length} walk-forward windows.`,
    );

    return windows;
  }

  /**
   * Converts a historical bar index into a Date.
   */
  private barToDate(
    barIndex: number,
  ): Date {
    const base = new Date(
      '2020-01-01T00:00:00Z',
    );

    base.setMinutes(
      base.getMinutes() +
        barIndex,
    );

    return base;
  }

  /**
   * Executes optimization +
   * out-of-sample validation.
   */
  private async processWindow(
    window: WalkForwardWindow,
    request: OptimizationRequest,
  ): Promise<WalkForwardWindowResult> {
    throw new Error(
      'processWindow() not implemented.',
    );
  }

  /**
   * Produces the final report.
   */
  private buildReport(
    results: WalkForwardWindowResult[],
  ): WalkForwardReport {
    throw new Error(
      'buildReport() not implemented.',
    );
  }
}
