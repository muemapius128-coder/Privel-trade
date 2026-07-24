import { Injectable } from '@nestjs/common';

import { EquityCurve } from '../entities/equity-curve.entity';
import { TradeResult } from '../entities/trade-result.entity';

export interface PortfolioReport {
  initialCapital: number;

  finalCapital: number;

  totalReturn: number;

  totalReturnPercent: number;

  averageEquity: number;

  peakEquity: number;

  minimumEquity: number;

  capitalUtilization: number;

  averageMarginUsage: number;

  maximumMarginUsage: number;

  averageFreeMargin: number;

  portfolioTurnover: number;

  averageExposure: number;

  capitalEfficiency: number;

  recommendations: string[];
}

@Injectable()
export class PortfolioAnalyzer {
  analyze(
    equityCurve: EquityCurve[],
    trades: TradeResult[],
  ): PortfolioReport {
    if (!equityCurve.length) {
      return this.emptyReport();
    }

    const initialCapital = Number(
      equityCurve[0].balance,
    );

    const finalCapital = Number(
      equityCurve[equityCurve.length - 1].balance,
    );

    const totalReturn =
      finalCapital - initialCapital;

    const totalReturnPercent =
      initialCapital === 0
        ? 0
        : (totalReturn / initialCapital) * 100;

    const averageEquity =
      this.average(
        equityCurve.map(point =>
          Number(point.equity),
        ),
      );

    const peakEquity = Math.max(
      ...equityCurve.map(point =>
        Number(point.peakEquity),
      ),
    );

    const minimumEquity = Math.min(
      ...equityCurve.map(point =>
        Number(point.equity),
      ),
    );

    const averageMarginUsage =
      this.average(
        equityCurve.map(point =>
          Number(point.marginUsed),
        ),
      );

    const maximumMarginUsage = Math.max(
      ...equityCurve.map(point =>
        Number(point.marginUsed),
      ),
    );

    const averageFreeMargin =
      this.average(
        equityCurve.map(point =>
          Number(point.freeMargin),
        ),
      );

    const capitalUtilization =
      peakEquity === 0
        ? 0
        : (averageMarginUsage / peakEquity) * 100;

    const portfolioTurnover =
      trades.length === 0
        ? 0
        : trades.length /
          equityCurve.length;

    const averageExposure =
      this.average(
        equityCurve.map(point =>
          point.openPositions,
        ),
      );

    const capitalEfficiency =
      averageMarginUsage === 0
        ? 0
        : totalReturn /
          averageMarginUsage;

    return {
      initialCapital,

      finalCapital,

      totalReturn,

      totalReturnPercent,

      averageEquity,

      peakEquity,

      minimumEquity,

      capitalUtilization,

      averageMarginUsage,

      maximumMarginUsage,

      averageFreeMargin,

      portfolioTurnover,

      averageExposure,

      capitalEfficiency,

      recommendations:
        this.generateRecommendations(
          capitalUtilization,
          capitalEfficiency,
          averageExposure,
        ),
    };
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

  private generateRecommendations(
    utilization: number,
    efficiency: number,
    exposure: number,
  ): string[] {
    const recommendations: string[] = [];

    if (utilization < 30) {
      recommendations.push(
        'Capital utilization is low. Consider increasing position sizing or trading frequency.',
      );
    }

    if (utilization > 80) {
      recommendations.push(
        'Capital utilization is very high. Review leverage and risk exposure.',
      );
    }

    if (efficiency < 1) {
      recommendations.push(
        'Capital efficiency is below expectations. Consider optimizing trade selection.',
      );
    }

    if (exposure > 10) {
      recommendations.push(
        'Average portfolio exposure is high. Diversification and position limits should be reviewed.',
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Portfolio capital allocation appears balanced.',
      );
    }

    return recommendations;
  }

  private emptyReport(): PortfolioReport {
    return {
      initialCapital: 0,

      finalCapital: 0,

      totalReturn: 0,

      totalReturnPercent: 0,

      averageEquity: 0,

      peakEquity: 0,

      minimumEquity: 0,

      capitalUtilization: 0,

      averageMarginUsage: 0,

      maximumMarginUsage: 0,

      averageFreeMargin: 0,

      portfolioTurnover: 0,

      averageExposure: 0,

      capitalEfficiency: 0,

      recommendations: [],
    };
  }
}
