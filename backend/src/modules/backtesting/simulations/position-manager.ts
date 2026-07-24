import { Injectable, Logger } from '@nestjs/common';

import { MarketCandle } from './execution-simulator';
import { TradeDirection } from '../entities/trade-result.entity';

export interface Position {
  id: string;

  symbol: string;

  timeframe: string;

  direction: TradeDirection;

  quantity: number;

  entryPrice: number;

  currentPrice: number;

  stopLoss?: number;

  takeProfit?: number;

  trailingStop?: number;

  floatingPnL: number;

  openedAt: Date;

  closedAt?: Date;

  isClosed: boolean;
}

@Injectable()
export class PositionManager {
  private readonly logger = new Logger(PositionManager.name);

  private readonly positions: Position[] = [];

  open(position: Position): Position {
    this.positions.push(position);

    this.logger.log(
      `Opened ${position.direction} position ${position.id}`,
    );

    return position;
  }

  close(id: string): Position | undefined {
    const position = this.positions.find(
      p => p.id === id,
    );

    if (!position) {
      return undefined;
    }

    position.isClosed = true;
    position.closedAt = new Date();

    this.logger.log(
      `Closed position ${position.id}`,
    );

    return position;
  }

  update(candle: MarketCandle): void {
    this.positions
      .filter(position => !position.isClosed)
      .forEach(position => {
        position.currentPrice = candle.close;

        position.floatingPnL =
          this.calculatePnL(position);

        this.evaluateExit(position, candle);

        this.updateTrailingStop(position, candle);
      });
  }

  private calculatePnL(
    position: Position,
  ): number {
    if (
      position.direction ===
      TradeDirection.BUY
    ) {
      return (
        (position.currentPrice -
          position.entryPrice) *
        position.quantity
      );
    }

    return (
      (position.entryPrice -
        position.currentPrice) *
      position.quantity
    );
  }

  private evaluateExit(
    position: Position,
    candle: MarketCandle,
  ): void {
    if (position.isClosed) {
      return;
    }

    if (
      position.direction ===
      TradeDirection.BUY
    ) {
      if (
        position.stopLoss &&
        candle.low <= position.stopLoss
      ) {
        this.close(position.id);
        return;
      }

      if (
        position.takeProfit &&
        candle.high >= position.takeProfit
      ) {
        this.close(position.id);
      }

      return;
    }

    if (
      position.stopLoss &&
      candle.high >= position.stopLoss
    ) {
      this.close(position.id);
      return;
    }

    if (
      position.takeProfit &&
      candle.low <= position.takeProfit
    ) {
      this.close(position.id);
    }
  }

  private updateTrailingStop(
    position: Position,
    candle: MarketCandle,
  ): void {
    if (!position.trailingStop) {
      return;
    }

    if (
      position.direction ===
      TradeDirection.BUY
    ) {
      const newStop =
        candle.close -
        position.trailingStop;

      if (
        !position.stopLoss ||
        newStop > position.stopLoss
      ) {
        position.stopLoss = newStop;
      }

      return;
    }

    const newStop =
      candle.close +
      position.trailingStop;

    if (
      !position.stopLoss ||
      newStop < position.stopLoss
    ) {
      position.stopLoss = newStop;
    }
  }

  getOpenPositions(): Position[] {
    return this.positions.filter(
      p => !p.isClosed,
    );
  }

  getClosedPositions(): Position[] {
    return this.positions.filter(
      p => p.isClosed,
    );
  }

  getPosition(
    id: string,
  ): Position | undefined {
    return this.positions.find(
      p => p.id === id,
    );
  }

  clear(): void {
    this.positions.length = 0;

    this.logger.log(
      'Position manager reset.',
    );
  }
}
