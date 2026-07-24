import { Injectable } from '@nestjs/common';

export interface OptimizationResult {
  strategyId: string;

  parameterSet: Record<string, any>;

  netProfit: number;

  sharpeRatio: number;

  maxDrawdown: number;

  winRate: number;

  profitFactor: number;

  expectancy: number;

  recoveryFactor: number;

  stabilityScore: number;
}

export interface OptimizationReport {
  totalConfigurations: number;

  bestConfiguration: OptimizationResult | null;

  worstConfiguration: OptimizationResult | null;

  averageProfit: number;

  averageSharpeRatio: number;

  averageDrawdown: number;

  averageWinRate: number;

  overfittingRisk: number;

  robustnessScore: number;

  recommendedParameters: Record<string, any>;

  recommendations: string[];
}

@Injectable()
export class OptimizationAnalyzer {
  analyze(
    results: OptimizationResult[],
  ): OptimizationReport {
    if (!results.length) {
      return this.emptyReport();
    }

    const bestConfiguration =
      this.selectBestConfiguration(results);

    const worstConfiguration =
      this.selectWorstConfiguration(results);

    const averageProfit =
      this.average(results.map(r => r.netProfit));

    const averageSharpeRatio =
      this.average(results.map(r => r.sharpeRatio));

    const averageDrawdown =
      this.average(results.map(r => r.maxDrawdown));

    const averageWinRate =
      this.average(results.map(r => r.winRate));

    const overfittingRisk =
      this.calculateOverfittingRisk(results);

    const robustnessScore =
      this.calculateRobustness(results);

    return {
      totalConfigurations: results.length,

      bestConfiguration,

      worstConfiguration,

      averageProfit,

      averageSharpeRatio,

      averageDrawdown,

      averageWinRate,

      overfittingRisk,

      robustnessScore,

      recommendedParameters:
        bestConfiguration?.parameterSet ?? {},

      recommendations:
        this.generateRecommendations(
          overfittingRisk,
          robustnessScore,
          bestConfiguration,
        ),
    };
  }

  private selectBestConfiguration(
    results: OptimizationResult[],
  ): OptimizationResult {
    return [...results].sort(
      (a, b) => this.score(b) - this.score(a),
    )[0];
  }

  private selectWorstConfiguration(
    results: OptimizationResult[],
  ): OptimizationResult {
    return [...results].sort(
      (a, b) => this.score(a) - this.score(b),
    )[0];
  }

  private score(
    result: OptimizationResult,
  ): number {
    return (
      result.netProfit * 0.30 +
      result.sharpeRatio * 100 * 0.25 +
      result.profitFactor * 50 * 0.20 +
      result.recoveryFactor * 50 * 0.10 +
      result.winRate * 0.10 +
      result.stabilityScore * 0.05 -
      result.maxDrawdown * 0.20
    );
  }

  private average(
    values: number[],
  ): number {
    if (!values.length) {
      return 0;
    }

    return (
      values.reduce(
        (sum, value) => sum + value,
        0,
      ) / values.length
    );
  }

  private calculateOverfittingRisk(
    results: OptimizationResult[],
  ): number {
    if (results.length < 2) {
      return 0;
    }

    const profits = results.map(
      r => r.netProfit,
    );

    const max = Math.max(...profits);
    const min = Math.min(...profits);

    if (max === 0) {
      return 0;
    }

    return ((max - min) / max) * 100;
  }

  private calculateRobustness(
    results: OptimizationResult[],
  ): number {
    const averageStability =
      this.average(
        results.map(r => r.stabilityScore),
      );

    const averageSharpe =
      this.average(
        results.map(r => r.sharpeRatio),
      );

    return (
      averageStability * 0.6 +
      averageSharpe * 40 * 0.4
    );
  }

  private generateRecommendations(
    overfittingRisk: number,
    robustnessScore: number,
    best: OptimizationResult | null,
  ): string[] {
    const recommendations: string[] = [];

    if (best) {
      recommendations.push(
        `Deploy the parameter set from strategy ${best.strategyId} as the current baseline.`,
      );
    }

    if (overfittingRisk > 50) {
      recommendations.push(
        'High overfitting risk detected. Validate the strategy using walk-forward and out-of-sample testing.',
      );
    }

    if (robustnessScore < 60) {
      recommendations.push(
        'Robustness is below the preferred threshold. Consider simplifying the strategy or reducing parameter sensitivity.',
      );
    }

    if (
      overfittingRisk <= 50 &&
      robustnessScore >= 60
    ) {
      recommendations.push(
        'Optimization results appear stable and suitable for paper trading before live deployment.',
      );
    }

    return recommendations;
  }

  private emptyReport(): OptimizationReport {
    return {
      totalConfigurations: 0,

      bestConfiguration: null,

      worstConfiguration: null,

      averageProfit: 0,

      averageSharpeRatio: 0,

      averageDrawdown: 0,

      averageWinRate: 0,

      overfittingRisk: 0,

      robustnessScore: 0,

      recommendedParameters: {},

      recommendations: [],
    };
  }
}
