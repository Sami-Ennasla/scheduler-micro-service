import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CronExpression } from '@nestjs/schedule';

// TODO: Add retry mechanism with exponential backoff
// TODO: Consider using Bull queue for better job management  
// TODO: Add job execution logging to separate table
// FIXME: Need to handle timezone properly for cron expressions

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
  ) {}

  async create(createJobDto: CreateJobDto): Promise<Job> {
    // Validate cron expression - this is a bit basic but works for now
    if (!this.isValidCronExpression(createJobDto.cronExpression)) {
      throw new BadRequestException('Invalid cron expression');
    }

    const job = this.jobsRepository.create({
      ...createJobDto,
      config: JSON.stringify(createJobDto.config),
      nextExecutionAt: this.getNextExecutionTime(createJobDto.cronExpression),
    });

    return this.jobsRepository.save(job);
  }

  async findAll(): Promise<Job[]> {
    // TODO: Add pagination support
    return this.jobsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobsRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto): Promise<Job> {
    const job = await this.findOne(id);

    if (updateJobDto.cronExpression && !this.isValidCronExpression(updateJobDto.cronExpression)) {
      throw new BadRequestException('Invalid cron expression');
    }

    const updateData: any = { ...updateJobDto };
    if (updateJobDto.config) {
      updateData.config = JSON.stringify(updateJobDto.config);
    }
    if (updateJobDto.cronExpression) {
      updateData.nextExecutionAt = this.getNextExecutionTime(updateJobDto.cronExpression);
    }

    await this.jobsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const job = await this.findOne(id);
    await this.jobsRepository.remove(job);
  }

  async activate(id: string): Promise<Job> {
    const job = await this.findOne(id);
    job.isActive = true;
    job.status = JobStatus.PENDING;
    return this.jobsRepository.save(job);
  }

  async deactivate(id: string): Promise<Job> {
    const job = await this.findOne(id);
    job.isActive = false;
    job.status = JobStatus.CANCELLED;
    return this.jobsRepository.save(job);
  }

  async execute(id: string): Promise<Job> {
    const job = await this.findOne(id);
    job.status = JobStatus.RUNNING;
    job.lastExecutedAt = new Date();
    await this.jobsRepository.save(job);

    try {
      await this.executeJob(job);
      job.status = JobStatus.COMPLETED;
      job.successCount += 1;
      job.retryCount = 0;
    } catch (error) {
      console.log('Error caught in execute:', error);
      console.log('Error type:', typeof error);
      console.log('Error constructor:', error.constructor.name);
      console.log('Error message:', error.message);
      console.log('Error message type:', typeof error.message);
      console.log('Error stack:', error.stack);
      
      job.status = JobStatus.FAILED;
      job.failureCount += 1;
      
      // Improved error message handling with more debugging
      let errorMessage: string;
      try {
        if (typeof error.message === 'string') {
          errorMessage = error.message;
        } else if (error.message && typeof error.message === 'object') {
          // Handle circular references in objects
          const seen = new WeakSet();
          errorMessage = JSON.stringify(error.message, (key, value) => {
            if (typeof value === 'object' && value !== null) {
              if (seen.has(value)) {
                return '[Circular Reference]';
              }
              seen.add(value);
            }
            return value;
          });
        } else if (error.message) {
          errorMessage = String(error.message);
        } else {
          errorMessage = error.toString();
        }
      } catch (serializeError) {
        console.log('Error serializing error message:', serializeError);
        errorMessage = `Error serialization failed: ${serializeError.message}`;
      }
      
      console.log('Final error message to save:', errorMessage);
      job.lastError = errorMessage;
      
      if (job.retryCount < job.maxRetries) {
        job.retryCount += 1;
        job.status = JobStatus.PENDING;
      }
    }

    job.nextExecutionAt = this.getNextExecutionTime(job.cronExpression);
    console.log('About to save job:', {
      id: job.id,
      status: job.status,
      lastError: job.lastError,
      config: typeof job.config
    });
    return this.jobsRepository.save(job);
  }

  async getActiveJobs(): Promise<Job[]> {
    return this.jobsRepository.find({
      where: { isActive: true },
      order: { nextExecutionAt: 'ASC' },
    });
  }

  async getJobsByStatus(status: JobStatus): Promise<Job[]> {
    return this.jobsRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  private async executeJob(job: Job): Promise<void> {
    // Handle config - it might already be an object or a JSON string
    let config: any;
    
    if (typeof job.config === 'string') {
      try {
        config = JSON.parse(job.config);
      } catch (parseError) {
        throw new Error(`Failed to parse job config: ${parseError.message}. Config: ${job.config}`);
      }
    } else if (typeof job.config === 'object' && job.config !== null) {
      config = job.config;
    } else {
      throw new Error(`Invalid job config type: ${typeof job.config}`);
    }
    
    switch (job.type) {
      case 'http_request':
        await this.executeHttpRequest(config);
        break;
      case 'function_call':
        await this.executeFunctionCall(config);
        break;
      case 'email':
        await this.executeEmailJob(config);
        break;
      case 'notification':
        await this.executeNotificationJob(config);
        break;
      default:
        throw new Error(`Unsupported job type: ${job.type}`);
    }
  }

  private async executeHttpRequest(config: any): Promise<void> {
    // FIXME: Should import axios at the top, this is lazy loading
    const axios = require('axios');
    const { url, method = 'GET', headers = {}, data = null, timeout = 30000 } = config;
    
    console.log(`Making HTTP request to: ${url}`);
    
    // TODO: Add proper error handling and retry logic
    await axios({
      method,
      url,
      headers,
      data,
      timeout,
    });
  }

  private async executeFunctionCall(config: any): Promise<void> {
    // This would typically involve calling a registered function
    // For now, we'll just log the function call
    // TODO: Implement actual function execution
    console.log(`Executing function: ${config.functionName}`);
    console.log(`Parameters:`, config.parameters);
    
    // HACK: Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async executeEmailJob(config: any): Promise<void> {
    // This would typically involve sending an email
    console.log(`Sending email to: ${config.to}`);
    console.log(`Email config:`, JSON.stringify(config));
  }

  private async executeNotificationJob(config: any): Promise<void> {
    // This would typically involve sending a notification
    console.log(`Sending notification: ${config.message}`);
    console.log(`Notification config:`, JSON.stringify(config));
  }

  private isValidCronExpression(cronExpression: string): boolean {
    try {
      // Basic cron validation - you might want to use a more robust library
      const parts = cronExpression.split(' ');
      if (parts.length !== 5) return false;
      
      // Add more validation as needed
      return true;
    } catch {
      return false;
    }
  }

  private getNextExecutionTime(cronExpression: string): Date {
    // This is a simplified implementation
    // In production, you'd want to use a proper cron library
    const now = new Date();
    const next = new Date(now.getTime() + 60000); // Add 1 minute for demo
    return next;
  }
}
