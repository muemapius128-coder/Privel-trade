import { Injectable } from '@nestjs/common';

import { TradeResult } from '../entities/trade-result.entity';

export enum MarketRegime {
  TRENDING = 'TRENDING',
  RANGING = 'RANGING',
  HIGH_VOLATILITY = 'HIGH_VOLATILITY',
  LOW_VOLATILITY = 'LOW_VOLATILITY',
}

export enum TradingSession {
  ASIAN = 'ASIAN',
  LONDON = 'LONDON',
  NEW_YORK = 'NEW_YORK',
  OVERLAP = 'OVERLAP',
}

export interface MarketAnalysisReport {
  totalTrades: number;

  regimePerformance: Record<string, number>;

  sessionPerformance: Record<string, number>;

  symbolPerformance: Record<string, number>;

  timeframePerformance: Record<string, number>;

  bestRegime: string | null;

  worstRegime: string | null;

  bestSession: string | null;

  worstSession: string | null;

  bestSymbol: string | null;

  bestTimeframe: string | null;

  recommendations: string[];
}

@Injectable()
export class MarketAnalyzer {
  analyze(trades: TradeResult[]): MarketAnalysisReport {
    const regimePerformance =
      this.aggregateByField(trades, 'marketRegime');

    const sessionPerformance =
      this.aggregateByField(trades, 'session');

    const symbolPerformance =
      this.aggregateByField(trades, 'symbol');

    const timeframePerformance =
      this.aggregateByField(trades, 'timeframe');

    return {
      totalTrades: trades.length,

      regimePerformance,

      sessionPerformance,

      symbolPerformance,

      timeframePerformance,

      bestRegime: this.best(regimePerformance),

      worstRegime: this.worst(regimePerformance),

      bestSession: this.best(sessionPerformance),

      worstSession: this.worst(sessionPerformance),

      bestSymbol: this.best(symbolPerformance),

      bestTimeframe: this.best(timeframePerformance),

      recommendations: this.buildRecommendations(
        regimePerformance,
        sessionPerformance,
      ),
    };
  }

  private aggregateByField(
    trades: TradeResult[],
    field: keyof TradeResult,
  ): Record<string, number> {
    const result: Record<string, number> = {};

    for (const trade of trades) {
      const key = String(
        (trade as any)[field] ?? 'UNKNOWN',
      );

      result[key] =
        (result[key] ?? 0) +
        Number(trade.netProfit);
    }

    return result;
  }

  private best(
    values: Record<string, number>,
  ): string | null {
    const entries = Object.entries(values);

    if (!entries.length) {
      return null;
    }

    return entries.sort(
      (a, b) => b[1] - a[1],
    )[0][0];
  }

  private worst(
    values: Record<string, number>,
  ): string | null {
    const entries = Object.entries(values);

    if (!entries.length) {
      return null;
    }

    return entries.sort(
      (a, b) => a[1] - b[1],
    )[0][0];
  }

  private buildRecommendations(
    regimes: Record<string, number>,
    sessions: Record<string, number>,
  ): string[] {
    const recommendations: string[] = [];

    const bestRegime = this.best(regimes);

    const bestSession = this.best(sessions);

    if (bestRegime) {
      recommendations.push(
        `Best performance occurs during ${bestRegime} market conditions.`,
      );
    }

    if (bestSession) {
      recommendations.push(
        `Highest profitability is achieved during the ${bestSession} trading session.`,
      );
    }

    const worstRegime = this.worst(regimes);

    if (worstRegime) {
      recommendations.push(
        `Consider reducing exposure during ${worstRegime} market conditions.`,
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Insufficient market data to generate recommendations.',
      );
    }

    return recommendations;
  }
}
