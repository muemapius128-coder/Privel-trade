import { Injectable, Logger } from '@nestjs/common';

import { ParameterOptimizer } from './parameter-optimizer';
import { GridSearch } from './grid-search';
import { GeneticOptimizer } from './genetic-optimizer';
import { BayesianOptimizer } from './bayesian-optimizer';
import { MonteCarloOptimizer } from './monte-carlo-optimizer';
import { WalkForwardOptimizer } from './walk-forward-optimizer';
import { RobustnessTester } from './robustness-tester';
import { ParameterValidator } from './parameter-validator';

export enum OptimizationAlgorithm {
  GRID_SEARCH = 'GRID_SEARCH',
  GENETIC = 'GENETIC',
  BAYESIAN = 'BAYESIAN',
  MONTE_CARLO = 'MONTE_CARLO',
  WALK_FORWARD = 'WALK_FORWARD',
}

export interface OptimizationRequest {
  strategyId: string;

  algorithm: OptimizationAlgorithm;

  parameterRanges: Record<string, any>;

  objective: string;

  iterations?: number;

  populationSize?: number;

  walkForwardWindows?: number;
}

export interface OptimizationResult {
  strategyId: string;

  algorithm: OptimizationAlgorithm;

  bestParameters: Record<string, any>;

  objectiveScore: number;

  completedAt: Date;

  totalEvaluations: number;

  executionTimeMs: number;

  metadata?: Record<string, any>;
}

@Injectable()
export class OptimizationManager {
  private readonly logger = new Logger(
    OptimizationManager.name,
  );

  constructor(
    private readonly parameterOptimizer: ParameterOptimizer,
    private readonly gridSearch: GridSearch,
    private readonly geneticOptimizer: GeneticOptimizer,
    private readonly bayesianOptimizer: BayesianOptimizer,
    private readonly monteCarloOptimizer: MonteCarloOptimizer,
    private readonly walkForwardOptimizer: WalkForwardOptimizer,
    private readonly robustnessTester: RobustnessTester,
    private readonly parameterValidator: ParameterValidator,
  ) {}

  async optimize(
    request: OptimizationRequest,
  ): Promise<OptimizationResult> {
    this.logger.log(
      `Starting optimization for strategy ${request.strategyId}`,
    );

    const started = Date.now();

    this.parameterValidator.validate(
      request.parameterRanges,
    );

    let result: OptimizationResult;

    switch (request.algorithm) {
      case OptimizationAlgorithm.GRID_SEARCH:
        result =
          await this.gridSearch.optimize(
            request,
          );
        break;

      case OptimizationAlgorithm.GENETIC:
        result =
          await this.geneticOptimizer.optimize(
            request,
          );
        break;

      case OptimizationAlgorithm.BAYESIAN:
        result =
          await this.bayesianOptimizer.optimize(
            request,
          );
        break;

      case OptimizationAlgorithm.MONTE_CARLO:
        result =
          await this.monteCarloOptimizer.optimize(
            request,
          );
        break;

      case OptimizationAlgorithm.WALK_FORWARD:
        result =
          await this.walkForwardOptimizer.optimize(
            request,
          );
        break;

      default:
        throw new Error(
          `Unsupported optimization algorithm: ${request.algorithm}`,
        );
    }

    const robustness =
      await this.robustnessTester.evaluate(
        result.bestParameters,
      );

    const executionTime =
      Date.now() - started;

    const finalResult: OptimizationResult = {
      ...result,

      executionTimeMs: executionTime,

      metadata: {
        ...(result.metadata ?? {}),
        robustness,
      },
    };

    this.logger.log(
      `Optimization completed in ${executionTime} ms`,
    );

    return finalResult;
  }

  async rankResults(
    results: OptimizationResult[],
  ): Promise<OptimizationResult[]> {
    return [...results].sort(
      (a, b) =>
        b.objectiveScore -
        a.objectiveScore,
    );
  }

  async validateParameters(
    parameters: Record<string, any>,
  ): Promise<boolean> {
    return this.parameterValidator.validate(
      parameters,
    );
  }

  async evaluateRobustness(
    parameters: Record<string, any>,
  ) {
    return this.robustnessTester.evaluate(
      parameters,
    );
  }

  async generateCandidates(
    ranges: Record<string, any>,
  ) {
    return this.parameterOptimizer.generate(
      ranges,
    );
  }
}
