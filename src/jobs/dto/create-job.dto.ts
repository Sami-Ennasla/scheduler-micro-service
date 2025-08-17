import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { JobType } from '../entities/job.entity';

export class CreateJobDto {
  @ApiProperty({ description: 'Name of the job', example: 'Daily Backup' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of the job', example: 'Perform daily database backup', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Cron expression for scheduling', example: '0 2 * * *' })
  @IsString()
  @IsNotEmpty()
  cronExpression: string;

  @ApiProperty({ description: 'Type of job to execute', enum: JobType, example: JobType.HTTP_REQUEST })
  @IsEnum(JobType)
  type: JobType;

  @ApiProperty({ description: 'Job configuration data', example: { url: 'https://api.example.com/backup', method: 'POST' } })
  @IsObject()
  config: Record<string, any>;

  @ApiProperty({ description: 'Whether the job is active', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Maximum retry attempts', example: 3, required: false })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  maxRetries?: number;
}
