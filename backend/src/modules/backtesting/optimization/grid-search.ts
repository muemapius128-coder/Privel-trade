import { Injectable, Logger } from '@nestjs/common';

import {
  OptimizationRequest,
  OptimizationResult,
  OptimizationAlgorithm,
} from './optimization-manager';

import {
  ParameterOptimizer,
  ParameterDefinition,
  ParameterSet,
} from './parameter-optimizer';

@Injectable()
export class GridSearch {
  private readonly logger = new Logger(GridSearch.name);

  constructor(
    private readonly parameterOptimizer: ParameterOptimizer,
  ) {}

  async optimize(
    request: OptimizationRequest,
  ): Promise<OptimizationResult> {
    const started = Date.now();

    this.logger.log(
      `Starting Grid Search for strategy ${request.strategyId}`,
    );

    const definitions =
      request.parameterRanges as ParameterDefinition[];

    const candidates =
      this.parameterOptimizer.generate(definitions);

    this.logger.log(
      `${candidates.length} parameter combinations generated.`,
    );

    let bestParameters: ParameterSet = {};

    let bestScore = Number.NEGATIVE_INFINITY;

    let evaluations = 0;

    for (const parameters of candidates) {
      evaluations++;

      const score =
        await this.evaluateParameters(
          parameters,
          request,
        );

      if (score > bestScore) {
        bestScore = score;
        bestParameters = parameters;
      }
    }

    const executionTime =
      Date.now() - started;

    this.logger.log(
      `Grid Search completed after ${evaluations} evaluations.`,
    );

    return {
      strategyId: request.strategyId,

      algorithm:
        OptimizationAlgorithm.GRID_SEARCH,

      bestParameters,

      objectiveScore: bestScore,

      totalEvaluations: evaluations,

      completedAt: new Date(),

      executionTimeMs: executionTime,

      metadata: {
        evaluatedCandidates:
          candidates.length,

        objective: request.objective,
      },
    };
  }

  /**
   * Evaluate one parameter combination.
   *
   * This is currently a placeholder.
   *
   * Later this method will:
   *
   * Parameter Set
   *       ↓
   * Backtesting Engine
   *       ↓
   * Analytics Engine
   *       ↓
   * Fitness Score
   */
  private async evaluateParameters(
    parameters: ParameterSet,
    request: OptimizationRequest,
  ): Promise<number> {
    /**
     * TODO
     *
     * Replace this implementation by:
     *
     * BacktestingService.run()
     *
     * Then:
     *
     * PerformanceAnalyzer
     * RiskAnalyzer
     * AIAnalyzer
     *
     * Finally return the selected objective score.
     */

    return this.mockObjective(parameters);
  }

  /**
   * Temporary mock scoring.
   *
   * Remove after Backtesting Engine integration.
   */
  private mockObjective(
    parameters: ParameterSet,
  ): number {
    let score = 0;

    for (const value of Object.values(parameters)) {
      if (typeof value === 'number') {
        score += value;
      }

      if (typeof value === 'boolean') {
        score += value ? 1 : 0;
      }
    }

    score += Math.random();

    return score;
  }
}
