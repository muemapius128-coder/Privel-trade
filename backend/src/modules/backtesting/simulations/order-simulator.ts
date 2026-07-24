import { Injectable, Logger } from '@nestjs/common';

import {
  MarketCandle,
  TradeSignal,
  TradeDirection,
} from './execution-simulator';

export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  STOP = 'STOP',
  STOP_LIMIT = 'STOP_LIMIT',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export interface SimulatedOrder {
  id: string;

  symbol: string;

  timeframe: string;

  type: OrderType;

  direction: TradeDirection;

  quantity: number;

  requestedPrice: number;

  executedPrice?: number;

  stopLoss?: number;

  takeProfit?: number;

  status: OrderStatus;

  createdAt: Date;

  executedAt?: Date;
}

@Injectable()
export class OrderSimulator {
  private readonly logger = new Logger(OrderSimulator.name);

  private readonly spread = 0.0001;

  private readonly slippage = 0.0002;

  private readonly orders: SimulatedOrder[] = [];

  createOrder(
    signal: TradeSignal,
    symbol: string,
    timeframe: string,
    type: OrderType = OrderType.MARKET,
  ): SimulatedOrder {
    const order: SimulatedOrder = {
      id: crypto.randomUUID(),

      symbol,

      timeframe,

      type,

      direction: signal.direction,

      quantity: signal.quantity,

      requestedPrice: signal.entryPrice,

      stopLoss: signal.stopLoss,

      takeProfit: signal.takeProfit,

      status: OrderStatus.PENDING,

      createdAt: new Date(),
    };

    this.orders.push(order);

    return order;
  }

  processOrder(
    order: SimulatedOrder,
    candle: MarketCandle,
  ): SimulatedOrder {
    switch (order.type) {
      case OrderType.MARKET:
        return this.executeMarketOrder(order, candle);

      case OrderType.LIMIT:
        return this.executeLimitOrder(order, candle);

      case OrderType.STOP:
        return this.executeStopOrder(order, candle);

      case OrderType.STOP_LIMIT:
        return this.executeStopLimitOrder(order, candle);

      default:
        return order;
    }
  }

  private executeMarketOrder(
    order: SimulatedOrder,
    candle: MarketCandle,
  ): SimulatedOrder {
    order.executedPrice =
      candle.open + this.calculateExecutionAdjustment(order.direction);

    order.status = OrderStatus.FILLED;
    order.executedAt = candle.timestamp;

    return order;
  }

  private executeLimitOrder(
    order: SimulatedOrder,
    candle: MarketCandle,
  ): SimulatedOrder {
    const touched =
      candle.low <= order.requestedPrice &&
      candle.high >= order.requestedPrice;

    if (!touched) {
      return order;
    }

    order.executedPrice = order.requestedPrice;
    order.status = OrderStatus.FILLED;
    order.executedAt = candle.timestamp;

    return order;
  }

  private executeStopOrder(
    order: SimulatedOrder,
    candle: MarketCandle,
  ): SimulatedOrder {
    const triggered =
      candle.low <= order.requestedPrice &&
      candle.high >= order.requestedPrice;

    if (!triggered) {
      return order;
    }

    order.executedPrice =
      order.requestedPrice +
      this.calculateExecutionAdjustment(order.direction);

    order.status = OrderStatus.FILLED;
    order.executedAt = candle.timestamp;

    return order;
  }

  private executeStopLimitOrder(
    order: SimulatedOrder,
    candle: MarketCandle,
  ): SimulatedOrder {
    return this.executeLimitOrder(order, candle);
  }

  private calculateExecutionAdjustment(
    direction: TradeDirection,
  ): number {
    const adjustment = this.spread + this.slippage;

    return direction === TradeDirection.BUY
      ? adjustment
      : -adjustment;
  }

  cancelOrder(orderId: string): boolean {
    const order = this.orders.find(
      o => o.id === orderId,
    );

    if (!order) {
      return false;
    }

    order.status = OrderStatus.CANCELLED;

    return true;
  }

  getOrder(orderId: string): SimulatedOrder | undefined {
    return this.orders.find(
      o => o.id === orderId,
    );
  }

  getPendingOrders(): SimulatedOrder[] {
    return this.orders.filter(
      o => o.status === OrderStatus.PENDING,
    );
  }

  getFilledOrders(): SimulatedOrder[] {
    return this.orders.filter(
      o => o.status === OrderStatus.FILLED,
    );
  }

  clear(): void {
    this.orders.length = 0;

    this.logger.log('Order book cleared.');
  }
}
