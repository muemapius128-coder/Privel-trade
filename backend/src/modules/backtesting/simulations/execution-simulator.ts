import { Injectable, Logger } from '@nestjs/common';

import { TradeDirection } from '../entities/trade-result.entity';

export interface MarketCandle {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TradeSignal {
  direction: TradeDirection;
  entryPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  quantity: number;
}

export interface ExecutedTrade {
  direction: TradeDirection;

  entryPrice: number;

  exitPrice: number;

  quantity: number;

  grossProfit: number;

  netProfit: number;

  commission: number;

  slippage: number;

  openedAt: Date;

  closedAt: Date;

  isWinningTrade: boolean;
}

@Injectable()
export class ExecutionSimulator {
  private readonly logger = new Logger(
    ExecutionSimulator.name,
  );

  /**
   * Commission percentage
   */
  private readonly commissionRate = 0.0005;

  /**
   * Slippage percentage
   */
  private readonly slippageRate = 0.0002;

  /**
   * Execute a simulated trade
   */
  executeTrade(
    signal: TradeSignal,
    exitPrice: number,
    exitTime: Date,
  ): ExecutedTrade {
    const commission =
      signal.entryPrice *
      signal.quantity *
      this.commissionRate;

    const slippage =
      signal.entryPrice *
      this.slippageRate;

    let grossProfit = 0;

    if (signal.direction === TradeDirection.BUY) {
      grossProfit =
        (exitPrice - signal.entryPrice) *
        signal.quantity;
    } else {
      grossProfit =
        (signal.entryPrice - exitPrice) *
        signal.quantity;
    }

    const netProfit =
      grossProfit -
      commission -
      slippage;

    return {
      direction: signal.direction,

      entryPrice: signal.entryPrice,

      exitPrice,

      quantity: signal.quantity,

      grossProfit,

      netProfit,

      commission,

      slippage,

      openedAt: new Date(),

      closedAt: exitTime,

      isWinningTrade: netProfit > 0,
    };
  }

  /**
   * Execute a strategy across historical candles.
   *
   * The strategy callback should return either:
   * - null (no trade)
   * - a TradeSignal
   */
  run(
    candles: MarketCandle[],
    strategy: (
      candle: MarketCandle,
      index: number,
    ) => TradeSignal | null,
  ): ExecutedTrade[] {
    const trades: ExecutedTrade[] = [];

    candles.forEach((candle, index) => {
      const signal = strategy(candle, index);

      if (!signal) {
        return;
      }

      /**
       * Temporary logic.
       *
       * Later the Position Manager
       * will decide when to exit.
       */
      const trade = this.executeTrade(
        signal,
        candle.close,
        candle.timestamp,
      );

      trades.push(trade);
    });

    this.logger.log(
      `${trades.length} simulated trades executed.`,
    );

    return trades;
  }
}
