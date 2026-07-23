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

import { Backtest } from './backtest.entity';
import { Strategy } from './strategy.entity';

export enum BacktestRunStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity('backtest_runs')
export class BacktestRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Backtest, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'backtestId' })
  backtest: Backtest;

  @Index()
  @Column('uuid')
  backtestId: string;

  @ManyToOne(() => Strategy, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'strategyId' })
  strategy: Strategy;

  @Index()
  @Column('uuid')
  strategyId: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: BacktestRunStatus.PENDING,
  })
  status: BacktestRunStatus;

  @Column({
    length: 50,
  })
  symbol: string;

  @Column({
    length: 20,
  })
  timeframe: string;

  @Column({
    type: 'timestamp',
  })
  startDate: Date;

  @Column({
    type: 'timestamp',
  })
  endDate: Date;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  initialCapital: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  finalBalance: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  totalProfit: number;

  @Column({
    default: 0,
  })
  totalTrades: number;

  @Column({
    default: 0,
  })
  winningTrades: number;

  @Column({
    default: 0,
  })
  losingTrades: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  winRate: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  maxDrawdown: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
  })
  sharpeRatio: number;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  parameters: Record<string, any>;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata: Record<string, any>;

  @Column({
    type: 'text',
    nullable: true,
  })
  errorMessage?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  startedAt?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  completedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
