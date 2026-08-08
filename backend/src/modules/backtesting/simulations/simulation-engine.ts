import {
  Injectable,
  Logger,
} from '@nestjs/common';

export type SimulationSide =
  | 'BUY'
  | 'SELL';

export type SimulationOrderType =
  | 'MARKET'
  | 'LIMIT'
  | 'STOP';

export type SimulationOrderStatus =
  | 'PENDING'
  | 'FILLED'
  | 'PARTIALLY_FILLED'
  | 'CANCELLED'
  | 'REJECTED';

export interface MarketBar {
  timestamp: Date;
  symbol: string;

  open: number;
  high: number;
  low: number;
  close: number;

  volume?: number;
}

export interface SimulationOrder {
  id: string;

  symbol: string;

  side: SimulationSide;

  type: SimulationOrderType;

  quantity: number;

  price?: number;

  stopPrice?: number;

  stopLoss?: number;

  takeProfit?: number;

  timestamp: Date;

  status: SimulationOrderStatus;
}

export interface SimulationFill {
  orderId: string;

  symbol: string;

  side: SimulationSide;

  quantity: number;

  price: number;

  timestamp: Date;

  commission: number;

  slippage: number;
}

export interface SimulationPosition {
  symbol: string;

  side: SimulationSide;

  quantity: number;

  averagePrice: number;

  realizedPnl: number;

  unrealizedPnl: number;

  openedAt: Date;

  updatedAt: Date;
}

export interface SimulationPortfolio {
  initialCapital: number;

  cash: number;

  equity: number;

  realizedPnl: number;

  unrealizedPnl: number;

  totalFees: number;

  positions: SimulationPosition[];

  peakEquity: number;

  maxDrawdown: number;
}

export interface SimulationConfig {
  initialCapital: number;

  commissionRate?: number;

  slippageRate?: number;

  allowShortSelling?: boolean;

  maxPositionSize?: number;

  rejectNegativePrices?: boolean;
}

export interface SimulationStrategyContext {
  bar: MarketBar;

  portfolio: SimulationPortfolio;

  positions: SimulationPosition[];

  orders: SimulationOrder[];
}

export interface SimulationStrategySignal {
  symbol: string;

  side: SimulationSide;

  quantity: number;

  orderType?: SimulationOrderType;

  price?: number;

  stopPrice?: number;

  stopLoss?: number;

  takeProfit?: number;
}

export interface SimulationResult {
  initialCapital: number;

  finalCapital: number;

  totalReturn: number;

  totalReturnPercent: number;

  realizedPnl: number;

  unrealizedPnl: number;

  totalFees: number;

  totalTrades: number;

  winningTrades: number;

  losingTrades: number;

  maxDrawdown: number;

  maxDrawdownPercent: number;

  equityCurve: Array<{
    timestamp: Date;
    equity: number;
  }>;

  fills: SimulationFill[];

  positions: SimulationPosition[];

  orders: SimulationOrder[];
}

export type StrategyEvaluator = (
  context: SimulationStrategyContext,
) =>
  | SimulationStrategySignal
  | SimulationStrategySignal[]
  | null
  | undefined;

@Injectable()
export class SimulationEngine {
  private readonly logger =
    new Logger(
      SimulationEngine.name,
    );

  private readonly defaultConfig: Required<
    SimulationConfig
  > = {
    initialCapital: 10000,

    commissionRate: 0.0005,

    slippageRate: 0.0001,

    allowShortSelling: true,

    maxPositionSize:
      Number.MAX_SAFE_INTEGER,

    rejectNegativePrices: true,
  };

  /**
   * Runs a complete historical
   * market simulation.
   */
  async run(
    bars: MarketBar[],
    strategy: StrategyEvaluator,
    config: SimulationConfig,
  ): Promise<SimulationResult> {
    const simulationConfig =
      this.normalizeConfig(
        config,
      );

    this.validateBars(
      bars,
      simulationConfig,
    );

    if (bars.length === 0) {
      return this.createEmptyResult(
        simulationConfig,
      );
    }

    const portfolio =
      this.createPortfolio(
        simulationConfig,
      );

    const orders: SimulationOrder[] =
      [];

    const fills: SimulationFill[] =
      [];

    const equityCurve: Array<{
      timestamp: Date;
      equity: number;
    }> = [];

    let orderSequence = 0;

    this.logger.log(
      `Starting simulation with ${bars.length} bars.`,
    );

    for (const bar of bars) {
      this.updatePortfolioMarketValue(
        portfolio,
        bar,
      );

      const context: SimulationStrategyContext =
        {
          bar,

          portfolio:
            this.clonePortfolio(
              portfolio,
            ),

          positions:
            portfolio.positions.map(
              (position) => ({
                ...position,
              }),
            ),

          orders:
            orders.filter(
              (order) =>
                order.status ===
                'PENDING',
            ),
        };

      const signals =
        await this.evaluateStrategy(
          strategy,
          context,
        );

      for (const signal of signals) {
        const order =
          this.createOrder(
            signal,
            bar,
            ++orderSequence,
            simulationConfig,
          );

        if (!order) {
          continue;
        }

        orders.push(order);

        const fill =
          this.executeOrder(
            order,
            bar,
            portfolio,
            simulationConfig,
          );

        if (fill) {
          fills.push(fill);
        }
      }

      this.updatePortfolioMarketValue(
        portfolio,
        bar,
      );

      equityCurve.push({
        timestamp:
          new Date(
            bar.timestamp,
          ),

        equity:
          portfolio.equity,
      });
    }

    const lastBar =
      bars[bars.length - 1];

    this.updatePortfolioMarketValue(
      portfolio,
      lastBar,
    );

    this.logger.log(
      `Simulation completed. Final equity: ${portfolio.equity.toFixed(2)}`,
    );

    return this.buildResult(
      portfolio,
      orders,
      fills,
      equityCurve,
    );
  }

  /**
   * Normalizes simulation configuration.
   */
  private normalizeConfig(
    config: SimulationConfig,
  ): Required<SimulationConfig> {
    return {
      ...this.defaultConfig,
      ...config,
    };
  }

  /**
   * Validates historical market data.
   */
  private validateBars(
    bars: MarketBar[],
    config: Required<SimulationConfig>,
  ): void {
    let previousTimestamp:
      | Date
      | undefined;

    for (const bar of bars) {
      if (!bar.symbol) {
        throw new Error(
          'Every market bar must have a symbol.',
        );
      }

      if (
        !Number.isFinite(
          bar.open,
        ) ||
        !Number.isFinite(
          bar.high,
        ) ||
        !Number.isFinite(
          bar.low,
        ) ||
        !Number.isFinite(
          bar.close,
        )
      ) {
        throw new Error(
          `Invalid OHLC values at ${bar.timestamp.toISOString()}.`,
        );
      }

      if (
        config.rejectNegativePrices &&
        (
          bar.open < 0 ||
          bar.high < 0 ||
          bar.low < 0 ||
          bar.close < 0
        )
      ) {
        throw new Error(
          `Negative market price at ${bar.timestamp.toISOString()}.`,
        );
      }

      if (
        bar.high <
        Math.max(
          bar.open,
          bar.close,
        )
      ) {
        throw new Error(
          `Invalid high price at ${bar.timestamp.toISOString()}.`,
        );
      }

      if (
        bar.low >
        Math.min(
          bar.open,
          bar.close,
        )
      ) {
        throw new Error(
          `Invalid low price at ${bar.timestamp.toISOString()}.`,
        );
      }

      const timestamp =
        new Date(
          bar.timestamp,
        );

      if (
        previousTimestamp &&
        timestamp <= previousTimestamp
      ) {
        throw new Error(
          'Market bars must be ordered chronologically.',
        );
      }

      previousTimestamp =
        timestamp;
    }
  }

  /**
   * Creates the initial portfolio.
   */
  private createPortfolio(
    config: Required<SimulationConfig>,
  ): SimulationPortfolio {
    return {
      initialCapital:
        config.initialCapital,

      cash:
        config.initialCapital,

      equity:
        config.initialCapital,

      realizedPnl: 0,

      unrealizedPnl: 0,

      totalFees: 0,

      positions: [],

      peakEquity:
        config.initialCapital,

      maxDrawdown: 0,
    };
  }

  /**
   * Evaluates the strategy for
   * the current market bar.
   */
  private async evaluateStrategy(
    strategy: StrategyEvaluator,
    context: SimulationStrategyContext,
  ): Promise<SimulationStrategySignal[]> {
    const result =
      await strategy(context);

    if (!result) {
      return [];
    }

    return Array.isArray(result)
      ? result
      : [result];
  }

  /**
   * Creates an order from a
   * strategy signal.
   */
  private createOrder(
    signal: SimulationStrategySignal,
    bar: MarketBar,
    sequence: number,
    config: Required<SimulationConfig>,
  ): SimulationOrder | null {
    if (
      !signal.symbol ||
      !signal.side ||
      !Number.isFinite(
        signal.quantity,
      ) ||
      signal.quantity <= 0
    ) {
      return null;
    }

    if (
      signal.quantity >
      config.maxPositionSize
    ) {
      return null;
    }

    return {
      id:
        `SIM-${Date.now()}-${sequence}`,

      symbol:
        signal.symbol,

      side:
        signal.side,

      type:
        signal.orderType ??
        'MARKET',

      quantity:
        signal.quantity,

      price:
        signal.price,

      stopPrice:
        signal.stopPrice,

      stopLoss:
        signal.stopLoss,

      takeProfit:
        signal.takeProfit,

      timestamp:
        new Date(
          bar.timestamp,
        ),

      status:
        'PENDING',
    };
  }
    /**
   * Executes an order against the
   * current market bar.
   */
  private executeOrder(
    order: SimulationOrder,
    bar: MarketBar,
    portfolio: SimulationPortfolio,
    config: Required<SimulationConfig>,
  ): SimulationFill | null {
    if (
      order.status !== 'PENDING'
    ) {
      return null;
    }

    if (
      order.side === 'SELL' &&
      !config.allowShortSelling
    ) {
      const position =
        this.findPosition(
          portfolio,
          order.symbol,
        );

      if (
        !position ||
        position.quantity < order.quantity
      ) {
        order.status = 'REJECTED';

        return null;
      }
    }

    const executionPrice =
      this.determineExecutionPrice(
        order,
        bar,
        config,
      );

    if (
      !Number.isFinite(
        executionPrice,
      ) ||
      executionPrice <= 0
    ) {
      order.status = 'REJECTED';

      return null;
    }

    const slippage =
      this.calculateSlippage(
        executionPrice,
        order.side,
        config,
      );

    const filledPrice =
      order.side === 'BUY'
        ? executionPrice + slippage
        : executionPrice - slippage;

    const notional =
      filledPrice *
      order.quantity;

    const commission =
      notional *
      config.commissionRate;

    const totalCost =
      order.side === 'BUY'
        ? notional + commission
        : commission;

    if (
      order.side === 'BUY' &&
      portfolio.cash < totalCost
    ) {
      order.status = 'REJECTED';

      return null;
    }

    if (
      order.side === 'SELL' &&
      !config.allowShortSelling
    ) {
      const position =
        this.findPosition(
          portfolio,
          order.symbol,
        );

      if (
        !position ||
        position.quantity <
          order.quantity
      ) {
        order.status = 'REJECTED';

        return null;
      }
    }

    const fill: SimulationFill = {
      orderId:
        order.id,

      symbol:
        order.symbol,

      side:
        order.side,

      quantity:
        order.quantity,

      price:
        filledPrice,

      timestamp:
        new Date(
          bar.timestamp,
        ),

      commission,

      slippage,
    };

    this.applyFill(
      portfolio,
      fill,
      config,
    );

    order.status = 'FILLED';

    return fill;
  }

  /**
   * Determines the execution price
   * according to order type.
   */
  private determineExecutionPrice(
    order: SimulationOrder,
    bar: MarketBar,
    config: Required<SimulationConfig>,
  ): number {
    switch (order.type) {
      case 'LIMIT':
        return this.executeLimitOrder(
          order,
          bar,
        );

      case 'STOP':
        return this.executeStopOrder(
          order,
          bar,
        );

      case 'MARKET':
      default:
        return bar.close;
    }
  }

  /**
   * Simulates limit order execution.
   */
  private executeLimitOrder(
    order: SimulationOrder,
    bar: MarketBar,
  ): number {
    if (
      order.price === undefined
    ) {
      return NaN;
    }

    const limitPrice =
      order.price;

    if (
      order.side === 'BUY'
    ) {
      if (
        bar.low <=
        limitPrice
      ) {
        return Math.min(
          limitPrice,
          bar.open,
        );
      }

      return NaN;
    }

    if (
      bar.high >=
      limitPrice
    ) {
      return Math.max(
        limitPrice,
        bar.open,
      );
    }

    return NaN;
  }

  /**
   * Simulates stop order execution.
   */
  private executeStopOrder(
    order: SimulationOrder,
    bar: MarketBar,
  ): number {
    if (
      order.stopPrice === undefined
    ) {
      return NaN;
    }

    const stopPrice =
      order.stopPrice;

    if (
      order.side === 'BUY'
    ) {
      if (
        bar.high >=
        stopPrice
      ) {
        return Math.max(
          stopPrice,
          bar.open,
        );
      }

      return NaN;
    }

    if (
      bar.low <=
      stopPrice
    ) {
      return Math.min(
        stopPrice,
        bar.open,
      );
    }

    return NaN;
  }

  /**
   * Calculates simulated slippage.
   */
  private calculateSlippage(
    price: number,
    side: SimulationSide,
    config: Required<SimulationConfig>,
  ): number {
    const slippage =
      price *
      config.slippageRate;

    return side === 'BUY'
      ? slippage
      : slippage;
  }

  /**
   * Applies a fill to the portfolio.
   */
  private applyFill(
    portfolio: SimulationPortfolio,
    fill: SimulationFill,
    config: Required<SimulationConfig>,
  ): void {
    const position =
      this.findPosition(
        portfolio,
        fill.symbol,
      );

    const notional =
      fill.price *
      fill.quantity;

    const totalFees =
      fill.commission;

    portfolio.totalFees +=
      totalFees;

    if (
      fill.side === 'BUY'
    ) {
      portfolio.cash -=
        notional +
        totalFees;
    } else {
      portfolio.cash +=
        notional -
        totalFees;
    }

    if (!position) {
      portfolio.positions.push({
        symbol:
          fill.symbol,

        side:
          fill.side,

        quantity:
          fill.quantity,

        averagePrice:
          fill.price,

        realizedPnl: 0,

        unrealizedPnl: 0,

        openedAt:
          new Date(
            fill.timestamp,
          ),

        updatedAt:
          new Date(
            fill.timestamp,
          ),
      });

      return;
    }

    if (
      position.side ===
      fill.side
    ) {
      const existingValue =
        position.averagePrice *
        position.quantity;

      const newValue =
        fill.price *
        fill.quantity;

      const totalQuantity =
        position.quantity +
        fill.quantity;

      position.averagePrice =
        (
          existingValue +
          newValue
        ) /
        totalQuantity;

      position.quantity =
        totalQuantity;

      position.updatedAt =
        new Date(
          fill.timestamp,
        );

      return;
    }

    this.reduceOrReversePosition(
      portfolio,
      position,
      fill,
    );
  }

  /**
   * Reduces or reverses an
   * existing position.
   */
  private reduceOrReversePosition(
    portfolio: SimulationPortfolio,
    position: SimulationPosition,
    fill: SimulationFill,
  ): void {
    const closingQuantity =
      Math.min(
        position.quantity,
        fill.quantity,
      );

    const pnlPerUnit =
      position.side === 'BUY'
        ? fill.price -
          position.averagePrice
        : position.averagePrice -
          fill.price;

    const realizedPnl =
      pnlPerUnit *
      closingQuantity;

    position.realizedPnl +=
      realizedPnl;

    portfolio.realizedPnl +=
      realizedPnl;

    position.quantity -=
      closingQuantity;

    position.updatedAt =
      new Date(
        fill.timestamp,
      );

    const remainingQuantity =
      fill.quantity -
      closingQuantity;

    if (
      position.quantity === 0
    ) {
      const index =
        portfolio.positions.indexOf(
          position,
        );

      if (index >= 0) {
        portfolio.positions.splice(
          index,
          1,
        );
      }
    }

    if (
      remainingQuantity > 0
    ) {
      portfolio.positions.push({
        symbol:
          fill.symbol,

        side:
          fill.side,

        quantity:
          remainingQuantity,

        averagePrice:
          fill.price,

        realizedPnl: 0,

        unrealizedPnl: 0,

        openedAt:
          new Date(
            fill.timestamp,
          ),

        updatedAt:
          new Date(
            fill.timestamp,
          ),
      });
    }
  }

  /**
   * Finds a position by symbol.
   */
  private findPosition(
    portfolio: SimulationPortfolio,
    symbol: string,
  ): SimulationPosition | undefined {
    return portfolio.positions.find(
      (position) =>
        position.symbol ===
        symbol,
    );
  }

  /**
   * Updates position and portfolio
   * valuation using the latest bar.
   */
  private updatePortfolioMarketValue(
    portfolio: SimulationPortfolio,
    bar: MarketBar,
  ): void {
    let unrealizedPnl = 0;

    for (
      const position of
      portfolio.positions
    ) {
      if (
        position.symbol !==
        bar.symbol
      ) {
        continue;
      }

      const price =
        bar.close;

      if (
        position.side ===
        'BUY'
      ) {
        position.unrealizedPnl =
          (
            price -
            position.averagePrice
          ) *
          position.quantity;
      } else {
        position.unrealizedPnl =
          (
            position.averagePrice -
            price
          ) *
          position.quantity;
      }

      position.updatedAt =
        new Date(
          bar.timestamp,
        );

      unrealizedPnl +=
        position.unrealizedPnl;
    }

    portfolio.unrealizedPnl =
      unrealizedPnl;

    portfolio.equity =
      portfolio.cash +
      this.calculatePositionMarketValue(
        portfolio,
        bar,
      );

    if (
      portfolio.equity >
      portfolio.peakEquity
    ) {
      portfolio.peakEquity =
        portfolio.equity;
    }

    const drawdown =
      portfolio.peakEquity -
      portfolio.equity;

    if (
      drawdown >
      portfolio.maxDrawdown
    ) {
      portfolio.maxDrawdown =
        drawdown;
    }
  }

  /**
   * Calculates the current
   * market value of positions.
   */
  private calculatePositionMarketValue(
    portfolio: SimulationPortfolio,
    bar: MarketBar,
  ): number {
    let marketValue = 0;

    for (
      const position of
      portfolio.positions
    ) {
      if (
        position.symbol !==
        bar.symbol
      ) {
        continue;
      }

      if (
        position.side ===
        'BUY'
      ) {
        marketValue +=
          position.quantity *
          bar.close;
      } else {
        marketValue +=
          position.quantity *
          (
            2 *
            position.averagePrice -
            bar.close
          );
      }
    }

    return marketValue;
  }
    /**
   * Creates a deep-enough copy of the
   * portfolio for strategy evaluation.
   */
  private clonePortfolio(
    portfolio: SimulationPortfolio,
  ): SimulationPortfolio {
    return {
      initialCapital:
        portfolio.initialCapital,

      cash:
        portfolio.cash,

      equity:
        portfolio.equity,

      realizedPnl:
        portfolio.realizedPnl,

      unrealizedPnl:
        portfolio.unrealizedPnl,

      totalFees:
        portfolio.totalFees,

      peakEquity:
        portfolio.peakEquity,

      maxDrawdown:
        portfolio.maxDrawdown,

      positions:
        portfolio.positions.map(
          (position) => ({
            ...position,

            openedAt:
              new Date(
                position.openedAt,
              ),

            updatedAt:
              new Date(
                position.updatedAt,
              ),
          }),
        ),
    };
  }

  /**
   * Builds the final simulation result.
   */
  private buildResult(
    portfolio: SimulationPortfolio,
    orders: SimulationOrder[],
    fills: SimulationFill[],
    equityCurve: Array<{
      timestamp: Date;
      equity: number;
    }>,
  ): SimulationResult {
    const finalCapital =
      portfolio.equity;

    const totalReturn =
      finalCapital -
      portfolio.initialCapital;

    const totalReturnPercent =
      portfolio.initialCapital === 0
        ? 0
        : (
            totalReturn /
            portfolio.initialCapital
          ) *
          100;

    let winningTrades = 0;

    let losingTrades = 0;

    for (
      const position of
      portfolio.positions
    ) {
      if (
        position.realizedPnl > 0
      ) {
        winningTrades++;
      } else if (
        position.realizedPnl < 0
      ) {
        losingTrades++;
      }
    }

    return {
      initialCapital:
        portfolio.initialCapital,

      finalCapital,

      totalReturn,

      totalReturnPercent,

      realizedPnl:
        portfolio.realizedPnl,

      unrealizedPnl:
        portfolio.unrealizedPnl,

      totalFees:
        portfolio.totalFees,

      totalTrades:
        fills.length,

      winningTrades,

      losingTrades,

      maxDrawdown:
        portfolio.maxDrawdown,

      maxDrawdownPercent:
        this.calculateDrawdownPercent(
          portfolio,
        ),

      equityCurve,

      fills,

      positions:
        portfolio.positions.map(
          (position) => ({
            ...position,
          }),
        ),

      orders:
        orders.map(
          (order) => ({
            ...order,
          }),
        ),
    };
  }

  /**
   * Calculates maximum drawdown
   * as a percentage of peak equity.
   */
  private calculateDrawdownPercent(
    portfolio: SimulationPortfolio,
  ): number {
    if (
      portfolio.peakEquity <= 0
    ) {
      return 0;
    }

    return (
      portfolio.maxDrawdown /
      portfolio.peakEquity
    ) *
    100;
  }

  /**
   * Creates an empty result when
   * no market bars are supplied.
   */
  private createEmptyResult(
    config: Required<SimulationConfig>,
  ): SimulationResult {
    return {
      initialCapital:
        config.initialCapital,

      finalCapital:
        config.initialCapital,

      totalReturn: 0,

      totalReturnPercent: 0,

      realizedPnl: 0,

      unrealizedPnl: 0,

      totalFees: 0,

      totalTrades: 0,

      winningTrades: 0,

      losingTrades: 0,

      maxDrawdown: 0,

      maxDrawdownPercent: 0,

      equityCurve: [],

      fills: [],

      positions: [],

      orders: [],
    };
  }
}
