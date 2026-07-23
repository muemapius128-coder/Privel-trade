import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { BacktestRun } from './backtest-run.entity';

export enum TradeDirection {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum TradeStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

@Entity('trade_results')
export class TradeResult {
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
    length: 50,
  })
  symbol: string;

  @Column({
    length: 20,
  })
  timeframe: string;

  @Column({
    type: 'varchar',
    length: 10,
  })
  direction: TradeDirection;

  @Column({
    type: 'varchar',
    length: 20,
    default: TradeStatus.CLOSED,
  })
  status: TradeStatus;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 8,
  })
  entryPrice: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 8,
    nullable: true,
  })
  exitPrice?: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 8,
  })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  grossProfit: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  netProfit: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  commission: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 8,
    default: 0,
  })
  slippage: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 8,
    nullable: true,
  })
  stopLoss?: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 8,
    nullable: true,
  })
  takeProfit?: number;

  @Column({
    type: 'int',
    default: 0,
  })
  durationSeconds: number;

  @Column({
    type: 'boolean',
    default: false,
  })
  isWinningTrade: boolean;

  @Column({
    type: 'timestamp',
  })
  openedAt: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  closedAt?: Date;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  indicators?: Record<string, any>;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
