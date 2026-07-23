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

@Entity('performance_metrics')
export class PerformanceMetrics {
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
    default: 0,
  })
  breakEvenTrades: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 0,
  })
  winRate: number;

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
  grossLoss: number;

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
  averageProfit: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  averageLoss: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  largestWinningTrade: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  largestLosingTrade: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
  })
  profitFactor: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
  })
  expectancy: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
  })
  payoffRatio: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
  })
  sharpeRatio: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
  })
  sortinoRatio: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
  })
  calmarRatio: number;

  @Column({
    type: 'decimal',
    precision: 18,
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
  recoveryFactor: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 0,
  })
  returnOnInvestment: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 0,
  })
  annualizedReturn: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 0,
  })
  volatility: number;

  @Column({
    default: 0,
  })
  longestWinningStreak: number;

  @Column({
    default: 0,
  })
  longestLosingStreak: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
  })
  averageTradeDuration: number;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  monthlyReturns?: Record<string, any>;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  riskMetrics?: Record<string, any>;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  aiInsights?: Record<string, any>;

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
