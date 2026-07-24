import { Injectable } from '@nestjs/common';

import {
  TradeResult,
  TradeDirection,
} from '../entities/trade-result.entity';

export interface TradeAnalysisReport {
  totalTrades: number;

  averageTradeProfit: number;

  averageWinningTrade: number;

  averageLosingTrade: number;

  medianTradeProfit: number;

  longestWinningStreak: number;

  longestLosingStreak: number;

  buyTrades: number;

  sellTrades: number;

  averageBuyProfit: number;

  averageSellProfit: number;

  averageTradeDuration: number;

  shortestTradeDuration: number;

  longestTradeDuration: number;

  profitableTradePercentage: number;

  recommendations: string[];
}

@Injectable()
export class TradeAnalyzer {
  analyze(trades: TradeResult[]): TradeAnalysisReport {
    if (!trades.length) {
      return this.emptyReport();
    }

    const winners = trades.filter(
      trade => Number(trade.netProfit) > 0,
    );

    const losers = trades.filter(
      trade => Number(trade.netProfit) < 0,
    );

    const buyTrades = trades.filter(
      trade => trade.direction === TradeDirection.BUY,
    );

    const sellTrades = trades.filter(
      trade => trade.direction === TradeDirection.SELL,
    );

    return {
      totalTrades: trades.length,

      averageTradeProfit:
        this.averageProfit(trades),

      averageWinningTrade:
        this.averageProfit(winners),

      averageLosingTrade:
        this.averageProfit(losers),

      medianTradeProfit:
        this.calculateMedian(trades),

      longestWinningStreak:
        this.calculateWinningStreak(trades),

      longestLosingStreak:
        this.calculateLosingStreak(trades),

      buyTrades: buyTrades.length,

      sellTrades: sellTrades.length,

      averageBuyProfit:
        this.averageProfit(buyTrades),

      averageSellProfit:
        this.averageProfit(sellTrades),

      averageTradeDuration:
        this.averageDuration(trades),

      shortestTradeDuration:
        Math.min(
          ...trades.map(
            trade => trade.durationSeconds,
          ),
        ),

      longestTradeDuration:
        Math.max(
          ...trades.map(
            trade => trade.durationSeconds,
          ),
        ),

      profitableTradePercentage:
        (winners.length / trades.length) * 100,

      recommendations:
        this.generateRecommendations(
          buyTrades,
          sellTrades,
          winners.length,
          trades.length,
        ),
    };
  }

  private averageProfit(
    trades: TradeResult[],
  ): number {
    if (!trades.length) {
      return 0;
    }

    return (
      trades.reduce(
        (sum, trade) =>
          sum + Number(trade.netProfit),
        0,
      ) / trades.length
    );
  }

  private averageDuration(
    trades: TradeResult[],
  ): number {
    if (!trades.length) {
      return 0;
    }

    return (
      trades.reduce(
        (sum, trade) =>
          sum + trade.durationSeconds,
        0,
      ) / trades.length
    );
  }

  private calculateMedian(
    trades: TradeResult[],
  ): number {
    const values = trades
      .map(trade => Number(trade.netProfit))
      .sort((a, b) => a - b);

    if (!values.length) {
      return 0;
    }

    const middle = Math.floor(values.length / 2);

    if (values.length % 2 === 0) {
      return (
        values[middle - 1] +
        values[middle]
      ) / 2;
    }

    return values[middle];
  }

  private calculateWinningStreak(
    trades: TradeResult[],
  ): number {
    let current = 0;
    let longest = 0;

    for (const trade of trades) {
      if (Number(trade.netProfit) > 0) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    }

    return longest;
  }

  private calculateLosingStreak(
    trades: TradeResult[],
  ): number {
    let current = 0;
    let longest = 0;

    for (const trade of trades) {
      if (Number(trade.netProfit) < 0) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    }

    return longest;
  }

  private generateRecommendations(
    buyTrades: TradeResult[],
    sellTrades: TradeResult[],
    winners: number,
    total: number,
  ): string[] {
    const recommendations: string[] = [];

    const averageBuy =
      this.averageProfit(buyTrades);

    const averageSell =
      this.averageProfit(sellTrades);

    if (averageBuy > averageSell) {
      recommendations.push(
        'BUY trades are outperforming SELL trades.'
      );
    }

    if (averageSell > averageBuy) {
      recommendations.push(
        'SELL trades are outperforming BUY trades.'
      );
    }

    if ((winners / total) * 100 < 50) {
      recommendations.push(
        'Consider refining entry and exit rules to improve win rate.'
      );
    }

    if ((winners / total) * 100 >= 70) {
      recommendations.push(
        'Trade execution quality is consistently strong.'
      );
    }

    return recommendations;
  }

  private emptyReport(): TradeAnalysisReport {
    return {
      totalTrades: 0,
      averageTradeProfit: 0,
      averageWinningTrade: 0,
      averageLosingTrade: 0,
      medianTradeProfit: 0,
      longestWinningStreak: 0,
      longestLosingStreak: 0,
      buyTrades: 0,
      sellTrades: 0,
      averageBuyProfit: 0,
      averageSellProfit: 0,
      averageTradeDuration: 0,
      shortestTradeDuration: 0,
      longestTradeDuration: 0,
      profitableTradePercentage: 0,
      recommendations: [],
    };
  }
}
