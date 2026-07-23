export interface IBacktest {
  id: string;

  name: string;

  strategyId: string;

  symbol: string;

  timeframe: string;

  startDate: Date;

  endDate: Date;

  initialCapital: number;
}
