import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum StrategyType {
  MANUAL = 'MANUAL',
  AI_GENERATED = 'AI_GENERATED',
  TEMPLATE = 'TEMPLATE',
}

export enum StrategyStatus {
  DRAFT = 'DRAFT',
  TESTING = 'TESTING',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

@Entity('strategies')
export class Strategy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({
    length: 150,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({
    unique: true,
    length: 50,
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: StrategyType.MANUAL,
  })
  type: StrategyType;

  @Column({
    type: 'varchar',
    length: 20,
    default: StrategyStatus.DRAFT,
  })
  status: StrategyStatus;

  @Column({
    length: 30,
  })
  version: string;

  @Column({
    length: 30,
  })
  assetClass: string;

  @Column({
    length: 30,
  })
  market: string;

  @Column({
    length: 30,
  })
  timeframe: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  parameters: Record<string, any>;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  indicators: Record<string, any>;

  @Column({
    type: 'text',
    nullable: true,
  })
  entryRules?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  exitRules?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  riskRules?: string;

  @Column({
    default: false,
  })
  isOptimized: boolean;

  @Column({
    default: false,
  })
  isPublished: boolean;

  @Column({
    nullable: true,
  })
  createdBy?: string;

  @Column({
    nullable: true,
  })
  approvedBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
