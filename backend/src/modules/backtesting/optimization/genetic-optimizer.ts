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

interface Individual {
  parameters: ParameterSet;
  fitness: number;
}

@Injectable()
export class GeneticOptimizer {
  private readonly logger = new Logger(
    GeneticOptimizer.name,
  );

  constructor(
    private readonly parameterOptimizer: ParameterOptimizer,
  ) {}

  async optimize(
    request: OptimizationRequest,
  ): Promise<OptimizationResult> {
    const started = Date.now();

    const definitions =
      request.parameterRanges as ParameterDefinition[];

    const populationSize =
      request.populationSize ?? 50;

    const generations =
      request.iterations ?? 100;

    let population = this.initializePopulation(
      definitions,
      populationSize,
    );

    let evaluations = 0;

    for (
      let generation = 0;
      generation < generations;
      generation++
    ) {
      for (const individual of population) {
        if (individual.fitness === Number.NEGATIVE_INFINITY) {
          individual.fitness =
            await this.evaluate(
              individual.parameters,
              request,
            );

          evaluations++;
        }
      }

      population.sort(
        (a, b) => b.fitness - a.fitness,
      );

      const eliteCount = Math.max(
        2,
        Math.floor(populationSize * 0.1),
      );

      const nextGeneration: Individual[] =
        population.slice(0, eliteCount);

      while (
        nextGeneration.length <
        populationSize
      ) {
        const parentA =
          this.selectParent(population);

        const parentB =
          this.selectParent(population);

        let child = this.crossover(
          parentA.parameters,
          parentB.parameters,
        );

        child = this.mutate(
          child,
          definitions,
        );

        nextGeneration.push({
          parameters: child,
          fitness: Number.NEGATIVE_INFINITY,
        });
      }

      population = nextGeneration;

      this.logger.debug(
        `Generation ${generation + 1}/${generations} completed.`,
      );
    }

    population.sort(
      (a, b) => b.fitness - a.fitness,
    );

    const best = population[0];

    return {
      strategyId: request.strategyId,

      algorithm:
        OptimizationAlgorithm.GENETIC,

      bestParameters: best.parameters,

      objectiveScore: best.fitness,

      totalEvaluations: evaluations,

      completedAt: new Date(),

      executionTimeMs:
        Date.now() - started,

      metadata: {
        populationSize,
        generations,
      },
    };
  }

  private initializePopulation(
    definitions: ParameterDefinition[],
    size: number,
  ): Individual[] {
    return this.parameterOptimizer
      .generateRandom(definitions, size)
      .map(parameters => ({
        parameters,
        fitness: Number.NEGATIVE_INFINITY,
      }));
  }

  private selectParent(
    population: Individual[],
  ): Individual {
    const tournamentSize = 3;

    const candidates: Individual[] = [];

    for (
      let i = 0;
      i < tournamentSize;
      i++
    ) {
      candidates.push(
        population[
          Math.floor(
            Math.random() *
              population.length,
          )
        ],
      );
    }

    candidates.sort(
      (a, b) => b.fitness - a.fitness,
    );

    return candidates[0];
  }

  private crossover(
    parentA: ParameterSet,
    parentB: ParameterSet,
  ): ParameterSet {
    const child: ParameterSet = {};

    const keys = Object.keys(parentA);

    for (const key of keys) {
      child[key] =
        Math.random() < 0.5
          ? parentA[key]
          : parentB[key];
    }

    return child;
  }

  private mutate(
    parameters: ParameterSet,
    definitions: ParameterDefinition[],
  ): ParameterSet {
    const mutationRate = 0.1;

    const mutated = {
      ...parameters,
    };

    for (const definition of definitions) {
      if (
        Math.random() <
        mutationRate
      ) {
        mutated[definition.name] =
          this.parameterOptimizer.generateRandom(
            [definition],
            1,
          )[0][definition.name];
      }
    }

    return mutated;
  }

  private async evaluate(
    parameters: ParameterSet,
    request: OptimizationRequest,
  ): Promise<number> {
    /**
     * TODO:
     * Replace this mock implementation by:
     *
     * BacktestingService.run()
     * Analytics Engine
     * AI Performance Analyzer
     */

    return this.mockFitness(parameters);
  }

  private mockFitness(
    parameters: ParameterSet,
  ): number {
    let fitness = 0;

    for (const value of Object.values(parameters)) {
      if (typeof value === 'number') {
        fitness += value;
      }

      if (typeof value === 'boolean') {
        fitness += value ? 1 : 0;
      }
    }

    return fitness + Math.random();
  }
}
