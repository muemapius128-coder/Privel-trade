import { Injectable, Logger } from '@nestjs/common';

import { MarketCandle } from './execution-simulator';

export interface ReplayOptions {
  speed?: number;
  startIndex?: number;
  endIndex?: number;
}

@Injectable()
export class MarketReplay {
  private readonly logger = new Logger(MarketReplay.name);

  private candles: MarketCandle[] = [];

  private currentIndex = 0;

  /**
   * Load historical candles
   */
  load(candles: MarketCandle[]): void {
    this.candles = [...candles];
    this.currentIndex = 0;

    this.logger.log(
      `${candles.length} historical candles loaded.`,
    );
  }

  /**
   * Replay one candle
   */
  next(): MarketCandle | null {
    if (this.currentIndex >= this.candles.length) {
      return null;
    }

    const candle = this.candles[this.currentIndex];

    this.currentIndex++;

    return candle;
  }

  /**
   * Replay all candles
   */
  replay(
    callback: (
      candle: MarketCandle,
      index: number,
    ) => void,
    options?: ReplayOptions,
  ): void {
    const start =
      options?.startIndex ?? 0;

    const end =
      options?.endIndex ??
      this.candles.length - 1;

    this.currentIndex = start;

    while (this.currentIndex <= end) {
      const candle = this.next();

      if (!candle) {
        break;
      }

      callback(
        candle,
        this.currentIndex - 1,
      );
    }

    this.logger.log('Replay completed.');
  }

  /**
   * Jump to a candle
   */
  seek(index: number): void {
    if (
      index < 0 ||
      index >= this.candles.length
    ) {
      throw new Error(
        'Invalid replay index.',
      );
    }

    this.currentIndex = index;
  }

  /**
   * Restart replay
   */
  reset(): void {
    this.currentIndex = 0;
  }

  /**
   * Current replay position
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Total candles
   */
  size(): number {
    return this.candles.length;
  }

  /**
   * Has replay finished?
   */
  isFinished(): boolean {
    return (
      this.currentIndex >= this.candles.length
    );
  }

  /**
   * Current candle
   */
  current(): MarketCandle | null {
    if (
      this.currentIndex >= this.candles.length
    ) {
      return null;
    }

    return this.candles[this.currentIndex];
  }

  /**
   * Previous candle
   */
  previous(): MarketCandle | null {
    if (this.currentIndex <= 1) {
      return null;
    }

    return this.candles[
      this.currentIndex - 2
    ];
  }

  /**
   * Remaining candles
   */
  remaining(): number {
    return (
      this.candles.length -
      this.currentIndex
    );
  }

  /**
   * Replay progress
   */
  progress(): number {
    if (this.candles.length === 0) {
      return 0;
    }

    return (
      (this.currentIndex /
        this.candles.length) *
      100
    );
  }
}
