import { Injectable } from '@nestjs/common';

import { EquityCurve } from '../entities/equity-curve.entity';
import { TradeResult } from '../entities/trade-result.entity';

export interface RiskReport {
  maxDrawdown: number;

  averageDrawdown: number;

  relativeDrawdown: number;

  volatility: number;

  valueAtRisk: number;

  conditionalValueAtRisk: number;

  largestLoss: number;

  averageLoss: number;

  exposure: number;

  recoveryFactor: number;

  riskRewardRatio: number;
}

@Injectable()
export class RiskAnalyzer {
  analyze(
    trades: TradeResult[],
    equityCurve: EquityCurve[],
  ): RiskReport {
    const maxDrawdown =
      this.calculateMaxDrawdown(equityCurve);

    const averageDrawdown =
      this.calculateAverageDrawdown(equityCurve);

    const volatility =
      this.calculateVolatility(trades);

    const valueAtRisk =
      this.calculateVaR(trades);

    const conditionalValueAtRisk =
      this.calculateCVaR(
        trades,
        valueAtRisk,
      );

    const losses = trades.filter(
      trade => trade.netProfit < 0,
    );

    const largestLoss =
      losses.length === 0
        ? 0
        : Math.abs(
            Math.min(
              ...losses.map(t =>
                Number(t.netProfit),
              ),
            ),
          );

    const averageLoss =
      losses.length === 0
        ? 0
        : Math.abs(
            losses.reduce(
              (sum, trade) =>
                sum + Number(trade.netProfit),
              0,
            ) / losses.length,
          );

    const exposure =
      this.calculateExposure(trades);

    const recoveryFactor =
      maxDrawdown === 0
        ? 0
        : this.calculateNetProfit(trades) /
          maxDrawdown;

    const riskRewardRatio =
      averageLoss === 0
        ? 0
        : this.calculateAverageWinner(trades) /
          averageLoss;

    return {
      maxDrawdown,

      averageDrawdown,

      relativeDrawdown:
        this.calculateRelativeDrawdown(
          equityCurve,
        ),

      volatility,

      valueAtRisk,

      conditionalValueAtRisk,

      largestLoss,

      averageLoss,

      exposure,

      recoveryFactor,

      riskRewardRatio,
    };
  }

  private calculateMaxDrawdown(
    curve: EquityCurve[],
  ): number {
    if (!curve.length) return 0;

    return Math.max(
      ...curve.map(point =>
        Number(point.drawdown),
      ),
    );
  }

  private calculateAverageDrawdown(
    curve: EquityCurve[],
  ): number {
    if (!curve.length) return 0;

    return (
      curve.reduce(
        (sum, point) =>
          sum + Number(point.drawdown),
        0,
      ) / curve.length
    );
  }

  private calculateRelativeDrawdown(
    curve: EquityCurve[],
  ): number {
    if (!curve.length) return 0;

    const peak = Math.max(
      ...curve.map(point =>
        Number(point.peakEquity),
      ),
    );

    if (peak === 0) return 0;

    return (
      (this.calculateMaxDrawdown(curve) /
        peak) *
      100
    );
  }

  private calculateVolatility(
    trades: TradeResult[],
  ): number {
    if (!trades.length) return 0;

    const returns = trades.map(t =>
      Number(t.netProfit),
    );

    const mean =
      returns.reduce((a, b) => a + b, 0) /
      returns.length;

    const variance =
      returns.reduce(
        (sum, value) =>
          sum + Math.pow(value - mean, 2),
        0,
      ) / returns.length;

    return Math.sqrt(variance);
  }

  private calculateVaR(
    trades: TradeResult[],
  ): number {
    if (!trades.length) return 0;

    const sorted = trades
      .map(t => Number(t.netProfit))
      .sort((a, b) => a - b);

    const index = Math.floor(
      sorted.length * 0.05,
    );

    return Math.abs(sorted[index] ?? 0);
  }

  private calculateCVaR(
    trades: TradeResult[],
    var95: number,
  ): number {
    const tail = trades.filter(
      trade =>
        Math.abs(Number(trade.netProfit)) >=
          var95 && trade.netProfit < 0,
    );

    if (!tail.length) return 0;

    return Math.abs(
      tail.reduce(
        (sum, trade) =>
          sum + Number(trade.netProfit),
        0,
      ) / tail.length,
    );
  }

  private calculateExposure(
    trades: TradeResult[],
  ): number {
    if (!trades.length) return 0;

    const totalDuration =
      trades.reduce(
        (sum, trade) =>
          sum + trade.durationSeconds,
        0,
      );

    return totalDuration / trades.length;
  }

  private calculateNetProfit(
    trades: TradeResult[],
  ): number {
    return trades.reduce(
      (sum, trade) =>
        sum + Number(trade.netProfit),
      0,
    );
  }

  private calculateAverageWinner(
    trades: TradeResult[],
  ): number {
    const winners = trades.filter(
      trade => trade.netProfit > 0,
    );

    if (!winners.length) return 0;

    return (
      winners.reduce(
        (sum, trade) =>
          sum + Number(trade.netProfit),
        0,
      ) / winners.length
    );
  }
}
