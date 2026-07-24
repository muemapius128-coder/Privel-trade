import { Injectable } from '@nestjs/common';

import { ExecutedTrade } from './execution-simulator';

export interface PortfolioState {
  balance: number;

  equity: number;

  unrealizedPnL: number;

  realizedPnL: number;

  marginUsed: number;

  freeMargin: number;

  drawdown: number;

  peakEquity: number;

  openPositions: number;

  closedTrades: number;
}

@Injectable()
export class PortfolioSimulator {
  private state: PortfolioState;

  constructor() {
    this.reset(10000);
  }

  /**
   * Initialize portfolio
   */
  reset(initialCapital: number): void {
    this.state = {
      balance: initialCapital,

      equity: initialCapital,

      unrealizedPnL: 0,

      realizedPnL: 0,

      marginUsed: 0,

      freeMargin: initialCapital,

      drawdown: 0,

      peakEquity: initialCapital,

      openPositions: 0,

      closedTrades: 0,
    };
  }

  /**
   * Apply completed trade
   */
  applyTrade(trade: ExecutedTrade): void {
    this.state.balance += trade.netProfit;

    this.state.realizedPnL += trade.netProfit;

    this.state.equity = this.state.balance;

    this.state.closedTrades++;

    if (this.state.equity > this.state.peakEquity) {
      this.state.peakEquity = this.state.equity;
    }

    this.state.drawdown =
      this.state.peakEquity - this.state.equity;

    this.state.freeMargin =
      this.state.equity - this.state.marginUsed;
  }

  /**
   * Reserve margin when opening a position
   */
  reserveMargin(amount: number): void {
    this.state.marginUsed += amount;

    this.state.freeMargin =
      this.state.equity - this.state.marginUsed;

    this.state.openPositions++;
  }

  /**
   * Release margin after closing a position
   */
  releaseMargin(amount: number): void {
    this.state.marginUsed -= amount;

    if (this.state.marginUsed < 0) {
      this.state.marginUsed = 0;
    }

    this.state.freeMargin =
      this.state.equity - this.state.marginUsed;

    if (this.state.openPositions > 0) {
      this.state.openPositions--;
    }
  }

  /**
   * Update floating P/L
   */
  updateUnrealizedPnL(value: number): void {
    this.state.unrealizedPnL = value;

    this.state.equity =
      this.state.balance + value;

    if (this.state.equity > this.state.peakEquity) {
      this.state.peakEquity = this.state.equity;
    }

    this.state.drawdown =
      this.state.peakEquity - this.state.equity;

    this.state.freeMargin =
      this.state.equity - this.state.marginUsed;
  }

  /**
   * Current portfolio state
   */
  getState(): PortfolioState {
    return { ...this.state };
  }

  /**
   * Account balance
   */
  getBalance(): number {
    return this.state.balance;
  }

  /**
   * Current equity
   */
  getEquity(): number {
    return this.state.equity;
  }

  /**
   * Current drawdown
   */
  getDrawdown(): number {
    return this.state.drawdown;
  }

  /**
   * Peak equity
   */
  getPeakEquity(): number {
    return this.state.peakEquity;
  }

  /**
   * Available margin
   */
  getFreeMargin(): number {
    return this.state.freeMargin;
  }
}
