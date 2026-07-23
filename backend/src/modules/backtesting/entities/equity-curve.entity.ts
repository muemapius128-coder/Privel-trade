import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { BacktestRun } from './backtest-run.entity';

@Entity('equity_curves')
export class EquityCurve {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BacktestRun, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'backtestRunId' })
  backtestRun: BacktestRun;

  @Index()
  @Column('uuid')
  backtestRunId: string;

  @Column({
    type: 'timestamp',
  })
  timestamp: Date;

  @Column({
    length: 50,
  })
  symbol: string;

  @Column({
    length: 20,
  })
  timeframe: string;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  balance: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  equity: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  unrealizedPnL: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  realizedPnL: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  drawdown: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  peakEquity: number;

  @Column({
    default: 0,
  })
  openPositions: number;

  @Column({
    default: 0,
  })
  closedTrades: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  marginUsed: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  freeMargin: number;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
