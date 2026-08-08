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
