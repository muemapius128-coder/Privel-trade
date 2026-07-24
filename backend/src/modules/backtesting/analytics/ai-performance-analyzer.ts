import { Injectable } from '@nestjs/common';

import { PerformanceReport } from './performance-analyzer';
import { RiskReport } from './risk-analyzer';
import { EquityReport } from './equity-analyzer';
import { StrategyReport } from './strategy-analyzer';
import { PortfolioReport } from './portfolio-analyzer';
import { MarketAnalysisReport } from './market-analyzer';
import { OptimizationReport } from './optimization-analyzer';

export interface AIAnalysisReport {
  strategyScore: number;

  confidenceScore: number;

  robustnessScore: number;

  deploymentRecommendation:
    | 'REJECT'
    | 'PAPER_TRADE'
    | 'LIVE'
    | 'OPTIMIZE';

  featureVector: Record<string, number>;

  detectedWeaknesses: string[];

  detectedStrengths: string[];

  learningObjectives: string[];

  aiSummary: string;
}

@Injectable()
export class AIPerformanceAnalyzer {
  analyze(
    performance: PerformanceReport,
    risk: RiskReport,
    equity: EquityReport,
    strategy: StrategyReport,
    portfolio: PortfolioReport,
    market: MarketAnalysisReport,
    optimization: OptimizationReport,
  ): AIAnalysisReport {
    const strategyScore =
      this.calculateStrategyScore(
        performance,
        risk,
        optimization,
      );

    const confidenceScore =
      this.calculateConfidence(
        performance,
        strategy,
      );

    const robustnessScore =
      optimization.robustnessScore;

    const deploymentRecommendation =
      this.deploymentDecision(
        strategyScore,
        confidenceScore,
        robustnessScore,
      );

    return {
      strategyScore,

      confidenceScore,

      robustnessScore,

      deploymentRecommendation,

      featureVector:
        this.buildFeatureVector(
          performance,
          risk,
          equity,
          strategy,
          portfolio,
          optimization,
        ),

      detectedWeaknesses:
        this.detectWeaknesses(
          performance,
          risk,
          strategy,
        ),

      detectedStrengths:
        this.detectStrengths(
          performance,
          risk,
          strategy,
        ),

      learningObjectives:
        this.learningObjectives(
          performance,
          risk,
          optimization,
        ),

      aiSummary:
        this.buildSummary(
          deploymentRecommendation,
          strategyScore,
        ),
    };
  }

  private calculateStrategyScore(
    performance: PerformanceReport,
    risk: RiskReport,
    optimization: OptimizationReport,
  ): number {
    let score = 0;

    score += performance.winRate * 0.25;

    score +=
      performance.profitFactor * 20;

    score +=
      optimization.robustnessScore * 0.30;

    score -=
      risk.relativeDrawdown * 0.20;

    return Math.max(
      0,
      Math.min(100, score),
    );
  }

  private calculateConfidence(
    performance: PerformanceReport,
    strategy: StrategyReport,
  ): number {
    return Math.max(
      0,
      Math.min(
        100,
        performance.winRate * 0.6 +
          strategy.signalEfficiency * 0.4,
      ),
    );
  }

  private deploymentDecision(
    strategyScore: number,
    confidence: number,
    robustness: number,
  ):
    | 'REJECT'
    | 'PAPER_TRADE'
    | 'LIVE'
    | 'OPTIMIZE' {
    if (
      strategyScore >= 85 &&
      confidence >= 80 &&
      robustness >= 80
    ) {
      return 'LIVE';
    }

    if (
      strategyScore >= 70 &&
      confidence >= 65
    ) {
      return 'PAPER_TRADE';
    }

    if (strategyScore >= 50) {
      return 'OPTIMIZE';
    }

    return 'REJECT';
  }

  private buildFeatureVector(
    performance: PerformanceReport,
    risk: RiskReport,
    equity: EquityReport,
    strategy: StrategyReport,
    portfolio: PortfolioReport,
    optimization: OptimizationReport,
  ): Record<string, number> {
    return {
      winRate: performance.winRate,

      profitFactor:
        performance.profitFactor,

      expectancy:
        performance.expectancy,

      maxDrawdown:
        risk.maxDrawdown,

      sharpeApprox:
        optimization.averageSharpeRatio,

      equityGrowth:
        equity.growthPercentage,

      capitalEfficiency:
        portfolio.capitalEfficiency,

      signalEfficiency:
        strategy.signalEfficiency,

      robustness:
        optimization.robustnessScore,

      overfittingRisk:
        optimization.overfittingRisk,
    };
  }

  private detectStrengths(
    performance: PerformanceReport,
    risk: RiskReport,
    strategy: StrategyReport,
  ): string[] {
    const strengths: string[] = [];

    if (performance.winRate > 65) {
      strengths.push(
        'High trade win rate.',
      );
    }

    if (performance.profitFactor > 2) {
      strengths.push(
        'Excellent profit factor.',
      );
    }

    if (risk.relativeDrawdown < 10) {
      strengths.push(
        'Low portfolio drawdown.',
      );
    }

    if (
      strategy.signalEfficiency > 75
    ) {
      strengths.push(
        'High-quality trade signals.',
      );
    }

    return strengths;
  }

  private detectWeaknesses(
    performance: PerformanceReport,
    risk: RiskReport,
    strategy: StrategyReport,
  ): string[] {
    const weaknesses: string[] = [];

    if (performance.winRate < 45) {
      weaknesses.push(
        'Low strategy win rate.',
      );
    }

    if (risk.relativeDrawdown > 20) {
      weaknesses.push(
        'Excessive drawdown.',
      );
    }

    if (
      strategy.signalEfficiency < 50
    ) {
      weaknesses.push(
        'Weak signal quality.',
      );
    }

    return weaknesses;
  }

  private learningObjectives(
    performance: PerformanceReport,
    risk: RiskReport,
    optimization: OptimizationReport,
  ): string[] {
    const objectives: string[] = [];

    if (performance.winRate < 60) {
      objectives.push(
        'Improve entry signal accuracy.',
      );
    }

    if (risk.relativeDrawdown > 15) {
      objectives.push(
        'Reduce drawdown through improved risk management.',
      );
    }

    if (
      optimization.overfittingRisk >
      50
    ) {
      objectives.push(
        'Reduce overfitting using walk-forward optimization.',
      );
    }

    return objectives;
  }

  private buildSummary(
    decision: string,
    score: number,
  ): string {
    return `Overall AI strategy score: ${score.toFixed(
      2,
    )}. Recommended action: ${decision}.`;
  }
}
