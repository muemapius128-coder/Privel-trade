import { Injectable } from '@nestjs/common';

import {
  TradeResult,
  TradeDirection,
} from '../entities/trade-result.entity';

export interface StrategyReport {
  totalTrades: number;

  longTrades: number;

  shortTrades: number;

  longWinRate: number;

  shortWinRate: number;

  averageHoldingTime: number;

  averageWinningTradeDuration: number;

  averageLosingTradeDuration: number;

  averageTradesPerDay: number;

  bestTradingHour: number | null;

  worstTradingHour: number | null;

  signalEfficiency: number;

  marketParticipation: number;

  recommendations: string[];
}

@Injectable()
export class StrategyAnalyzer {
  analyze(trades: TradeResult[]): StrategyReport {
    const totalTrades = trades.length;

    const longTrades = trades.filter(
      trade => trade.direction === TradeDirection.BUY,
    );

    const shortTrades = trades.filter(
      trade => trade.direction === TradeDirection.SELL,
    );

    const longWinRate = this.calculateWinRate(longTrades);

    const shortWinRate = this.calculateWinRate(shortTrades);

    const averageHoldingTime =
      this.averageDuration(trades);

    const averageWinningTradeDuration =
      this.averageDuration(
        trades.filter(t => t.netProfit > 0),
      );

    const averageLosingTradeDuration =
      this.averageDuration(
        trades.filter(t => t.netProfit < 0),
      );

    const averageTradesPerDay =
      this.calculateTradesPerDay(trades);

    const bestTradingHour =
      this.findBestTradingHour(trades);

    const worstTradingHour =
      this.findWorstTradingHour(trades);

    const signalEfficiency =
      this.calculateSignalEfficiency(trades);

    const marketParticipation =
      this.calculateMarketParticipation(trades);

    return {
      totalTrades,

      longTrades: longTrades.length,

      shortTrades: shortTrades.length,

      longWinRate,

      shortWinRate,

      averageHoldingTime,

      averageWinningTradeDuration,

      averageLosingTradeDuration,

      averageTradesPerDay,

      bestTradingHour,

      worstTradingHour,

      signalEfficiency,

      marketParticipation,

      recommendations:
        this.generateRecommendations(
          longWinRate,
          shortWinRate,
          signalEfficiency,
        ),
    };
  }

  private calculateWinRate(
    trades: TradeResult[],
  ): number {
    if (!trades.length) {
      return 0;
    }

    const winners = trades.filter(
      trade => trade.netProfit > 0,
    );

    return (
      (winners.length / trades.length) *
      100
    );
  }

  private averageDuration(
    trades: TradeResult[],
  ): number {
    if (!trades.length) {
      return 0;
    }

    const total = trades.reduce(
      (sum, trade) =>
        sum + trade.durationSeconds,
      0,
    );

    return total / trades.length;
  }

  private calculateTradesPerDay(
    trades: TradeResult[],
  ): number {
    if (!trades.length) {
      return 0;
    }

    const uniqueDays = new Set(
      trades.map(trade =>
        trade.openedAt
          .toISOString()
          .split('T')[0],
      ),
    );

    return (
      trades.length / uniqueDays.size
    );
  }

  private findBestTradingHour(
    trades: TradeResult[],
  ): number | null {
    return this.findBestHour(
      trades,
      true,
    );
  }

  private findWorstTradingHour(
    trades: TradeResult[],
  ): number | null {
    return this.findBestHour(
      trades,
      false,
    );
  }

  private findBestHour(
    trades: TradeResult[],
    highest: boolean,
  ): number | null {
    if (!trades.length) {
      return null;
    }

    const stats = new Map<number, number>();

    for (const trade of trades) {
      const hour =
        trade.openedAt.getUTCHours();

      const value =
        Number(trade.netProfit);

      stats.set(
        hour,
        (stats.get(hour) ?? 0) + value,
      );
    }

    const sorted =
      [...stats.entries()].sort(
        (a, b) =>
          highest
            ? b[1] - a[1]
            : a[1] - b[1],
      );

    return sorted.length
      ? sorted[0][0]
      : null;
  }

  private calculateSignalEfficiency(
    trades: TradeResult[],
  ): number {
    if (!trades.length) {
      return 0;
    }

    const winners = trades.filter(
      trade => trade.netProfit > 0,
    );

    return (
      (winners.length / trades.length) *
      100
    );
  }

  private calculateMarketParticipation(
    trades: TradeResult[],
  ): number {
    if (!trades.length) {
      return 0;
    }

    const totalSeconds =
      trades.reduce(
        (sum, trade) =>
          sum + trade.durationSeconds,
        0,
      );

    return totalSeconds / 86400;
  }

  private generateRecommendations(
    longWinRate: number,
    shortWinRate: number,
    signalEfficiency: number,
  ): string[] {
    const recommendations: string[] = [];

    if (longWinRate > shortWinRate) {
      recommendations.push(
        'Long positions currently outperform short positions.',
      );
    }

    if (shortWinRate > longWinRate) {
      recommendations.push(
        'Short positions currently outperform long positions.',
      );
    }

    if (signalEfficiency < 50) {
      recommendations.push(
        'Review entry conditions to improve signal quality.',
      );
    }

    if (signalEfficiency >= 70) {
      recommendations.push(
        'Signal quality is consistently strong.',
      );
    }

    return recommendations;
  }
}
