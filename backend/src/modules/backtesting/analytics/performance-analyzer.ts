import { Injectable } from '@nestjs/common';

import { TradeResult } from '../entities/trade-result.entity';

export interface PerformanceReport {
  totalTrades: number;

  winningTrades: number;

  losingTrades: number;

  breakEvenTrades: number;

  grossProfit: number;

  grossLoss: number;

  netProfit: number;

  winRate: number;

  averageProfit: number;

  averageLoss: number;

  profitFactor: number;

  payoffRatio: number;

  expectancy: number;

  largestWinningTrade: number;

  largestLosingTrade: number;

  consecutiveWins: number;

  consecutiveLosses: number;
}

@Injectable()
export class PerformanceAnalyzer {
  analyze(trades: TradeResult[]): PerformanceReport {
    const totalTrades = trades.length;

    const winners = trades.filter(t => t.netProfit > 0);

    const losers = trades.filter(t => t.netProfit < 0);

    const breakEven = trades.filter(
      t => t.netProfit === 0,
    );

    const grossProfit = winners.reduce(
      (sum, trade) => sum + Number(trade.netProfit),
      0,
    );

    const grossLoss = Math.abs(
      losers.reduce(
        (sum, trade) => sum + Number(trade.netProfit),
        0,
      ),
    );

    const netProfit =
      grossProfit - grossLoss;

    const averageProfit =
      winners.length === 0
        ? 0
        : grossProfit / winners.length;

    const averageLoss =
      losers.length === 0
        ? 0
        : grossLoss / losers.length;

    const winRate =
      totalTrades === 0
        ? 0
        : (winners.length / totalTrades) * 100;

    const profitFactor =
      grossLoss === 0
        ? grossProfit
        : grossProfit / grossLoss;

    const payoffRatio =
      averageLoss === 0
        ? averageProfit
        : averageProfit / averageLoss;

    const expectancy =
      totalTrades === 0
        ? 0
        : netProfit / totalTrades;

    const largestWinningTrade =
      winners.length === 0
        ? 0
        : Math.max(
            ...winners.map(t => Number(t.netProfit)),
          );

    const largestLosingTrade =
      losers.length === 0
        ? 0
        : Math.min(
            ...losers.map(t => Number(t.netProfit)),
          );

    const {
      consecutiveWins,
      consecutiveLosses,
    } = this.calculateStreaks(trades);

    return {
      totalTrades,

      winningTrades: winners.length,

      losingTrades: losers.length,

      breakEvenTrades: breakEven.length,

      grossProfit,

      grossLoss,

      netProfit,

      winRate,

      averageProfit,

      averageLoss,

      profitFactor,

      payoffRatio,

      expectancy,

      largestWinningTrade,

      largestLosingTrade,

      consecutiveWins,

      consecutiveLosses,
    };
  }

  private calculateStreaks(
    trades: TradeResult[],
  ) {
    let currentWins = 0;

    let currentLosses = 0;

    let maxWins = 0;

    let maxLosses = 0;

    for (const trade of trades) {
      if (trade.netProfit > 0) {
        currentWins++;

        currentLosses = 0;
      } else if (trade.netProfit < 0) {
        currentLosses++;

        currentWins = 0;
      } else {
        currentWins = 0;
        currentLosses = 0;
      }

      maxWins = Math.max(
        maxWins,
        currentWins,
      );

      maxLosses = Math.max(
        maxLosses,
        currentLosses,
      );
    }

    return {
      consecutiveWins: maxWins,
      consecutiveLosses: maxLosses,
    };
  }
}
