import { Injectable } from '@nestjs/common';

import { EquityCurve } from '../entities/equity-curve.entity';

export interface EquityReport {
  startingBalance: number;

  endingBalance: number;

  highestEquity: number;

  lowestEquity: number;

  netGrowth: number;

  growthPercentage: number;

  maximumDrawdown: number;

  averageDrawdown: number;

  longestDrawdownDuration: number;

  recoveryPeriods: number;

  averageRecoveryTime: number;

  equityVolatility: number;

  smoothnessScore: number;
}

@Injectable()
export class EquityAnalyzer {
  analyze(curve: EquityCurve[]): EquityReport {
    if (!curve.length) {
      return {
        startingBalance: 0,
        endingBalance: 0,
        highestEquity: 0,
        lowestEquity: 0,
        netGrowth: 0,
        growthPercentage: 0,
        maximumDrawdown: 0,
        averageDrawdown: 0,
        longestDrawdownDuration: 0,
        recoveryPeriods: 0,
        averageRecoveryTime: 0,
        equityVolatility: 0,
        smoothnessScore: 0,
      };
    }

    const balances = curve.map(c => Number(c.balance));
    const equities = curve.map(c => Number(c.equity));
    const drawdowns = curve.map(c => Number(c.drawdown));

    const startingBalance = balances[0];
    const endingBalance = balances[balances.length - 1];

    const highestEquity = Math.max(...equities);
    const lowestEquity = Math.min(...equities);

    const netGrowth = endingBalance - startingBalance;

    const growthPercentage =
      startingBalance === 0
        ? 0
        : (netGrowth / startingBalance) * 100;

    const maximumDrawdown = Math.max(...drawdowns);

    const averageDrawdown =
      drawdowns.reduce((a, b) => a + b, 0) /
      drawdowns.length;

    const longestDrawdownDuration =
      this.calculateLongestDrawdown(drawdowns);

    const recovery =
      this.calculateRecovery(drawdowns);

    const equityVolatility =
      this.calculateVolatility(equities);

    const smoothnessScore =
      this.calculateSmoothness(equities);

    return {
      startingBalance,

      endingBalance,

      highestEquity,

      lowestEquity,

      netGrowth,

      growthPercentage,

      maximumDrawdown,

      averageDrawdown,

      longestDrawdownDuration,

      recoveryPeriods: recovery.periods,

      averageRecoveryTime: recovery.averageRecovery,

      equityVolatility,

      smoothnessScore,
    };
  }

  private calculateLongestDrawdown(
    drawdowns: number[],
  ): number {
    let current = 0;
    let longest = 0;

    for (const drawdown of drawdowns) {
      if (drawdown > 0) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    }

    return longest;
  }

  private calculateRecovery(
    drawdowns: number[],
  ) {
    let periods = 0;
    let totalRecovery = 0;
    let current = 0;

    for (const drawdown of drawdowns) {
      if (drawdown > 0) {
        current++;
      } else {
        if (current > 0) {
          periods++;
          totalRecovery += current;
          current = 0;
        }
      }
    }

    return {
      periods,
      averageRecovery:
        periods === 0
          ? 0
          : totalRecovery / periods,
    };
  }

  private calculateVolatility(
    values: number[],
  ): number {
    const mean =
      values.reduce((a, b) => a + b, 0) /
      values.length;

    const variance =
      values.reduce(
        (sum, value) =>
          sum + Math.pow(value - mean, 2),
        0,
      ) / values.length;

    return Math.sqrt(variance);
  }

  private calculateSmoothness(
    values: number[],
  ): number {
    if (values.length < 2) {
      return 100;
    }

    let totalMovement = 0;

    for (let i = 1; i < values.length; i++) {
      totalMovement += Math.abs(
        values[i] - values[i - 1],
      );
    }

    const directMovement = Math.abs(
      values[values.length - 1] - values[0],
    );

    if (totalMovement === 0) {
      return 100;
    }

    return (
      (directMovement / totalMovement) * 100
    );
  }
}
