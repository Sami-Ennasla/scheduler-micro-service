import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';


export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum JobType {
  HTTP_REQUEST = 'http_request',
  FUNCTION_CALL = 'function_call',
  EMAIL = 'email',
  NOTIFICATION = 'notification',
}

@Entity()
export class Job {
  @ApiProperty({ description: 'Unique identifier for the job' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Name of the job' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Description of the job' })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({ description: 'Cron expression for job scheduling' })
  @Column()
  cronExpression: string;

  @ApiProperty({ description: 'Type of job to execute' })
  @Column({
    type: 'enum',
    enum: JobType,
    default: JobType.HTTP_REQUEST,
  })
  type: JobType;

  @ApiProperty({ description: 'Job configuration data' })
  @Column('text')
  config: string; 

  @ApiProperty({ description: 'Current status of the job' })
  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.PENDING,
  })
  status: JobStatus;

  @ApiProperty({ description: 'Whether the job is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Last execution time' })
  @Column({ nullable: true })
  lastExecutedAt?: Date;

  @ApiProperty({ description: 'Next scheduled execution time' })
  @Column({ nullable: true })
  nextExecutionAt?: Date;

  @ApiProperty({ description: 'Number of successful executions' })
  @Column({ default: 0 })
  successCount: number;

  @ApiProperty({ description: 'Number of failed executions' })
  @Column({ default: 0 })
  failureCount: number;

  @ApiProperty({ description: 'Last error message if any' })
  @Column({ nullable: true })
  lastError?: string;

  @ApiProperty({ description: 'Maximum retry attempts' })
  @Column({ default: 3 })
  maxRetries: number;

  @ApiProperty({ description: 'Current retry attempt' })
  @Column({ default: 0 })
  retryCount: number;

  @ApiProperty({ description: 'Job creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Job last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
