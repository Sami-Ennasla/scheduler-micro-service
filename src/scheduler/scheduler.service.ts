import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobsService } from '../jobs/jobs.service';
import { Job, JobStatus } from '../jobs/entities/job.entity';


@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly jobsService: JobsService) {}

  @Cron(CronExpression.EVERY_MINUTE) // Reduced frequency to prevent overload
  async handleCron() {
    // TODO: Add performance monitoring
    this.logger.debug('Checking for jobs to execute...');
    await this.processScheduledJobs();
  }

  private async processScheduledJobs(): Promise<void> {
    try {
      const activeJobs = await this.jobsService.getActiveJobs();
      const now = new Date();
      
      // Limit concurrent job executions to prevent overload
      const maxConcurrentJobs = 5;
      let runningJobs = 0;

      for (const job of activeJobs) {
        if (runningJobs >= maxConcurrentJobs) {
          this.logger.warn('Maximum concurrent jobs reached, skipping remaining jobs');
          break;
        }
        
        if (this.shouldExecuteJob(job, now)) {
          this.logger.log(`Executing job: ${job.name} (ID: ${job.id})`);
          runningJobs++;
          await this.executeJob(job);
          runningJobs--;
        }
      }
    } catch (error) {
      this.logger.error('Error processing scheduled jobs:', error);
    }
  }

  private shouldExecuteJob(job: Job, now: Date): boolean {
    if (!job.isActive || job.status === JobStatus.RUNNING) {
      return false;
    }

    if (!job.nextExecutionAt) {
      return false;
    }

    // Prevent excessive retries - if job has failed too many times, skip it
    if (job.failureCount > 10) {
      this.logger.warn(`Job ${job.name} has failed ${job.failureCount} times, skipping execution`);
      return false;
    }

    return job.nextExecutionAt <= now;
  }

  private async executeJob(job: Job): Promise<void> {
    try {
      await this.jobsService.execute(job.id);
      this.logger.log(`Job ${job.name} executed successfully`);
    } catch (error) {
      this.logger.error(`Failed to execute job ${job.name}:`, error);
    }
  }

  async getSchedulerStatus(): Promise<{
    totalJobs: number;
    activeJobs: number;
    pendingJobs: number;
    runningJobs: number;
    completedJobs: number;
    failedJobs: number;
  }> {
    const allJobs = await this.jobsService.findAll();
    const activeJobs = await this.jobsService.getActiveJobs();
    const pendingJobs = await this.jobsService.getJobsByStatus(JobStatus.PENDING);
    const runningJobs = await this.jobsService.getJobsByStatus(JobStatus.RUNNING);
    const completedJobs = await this.jobsService.getJobsByStatus(JobStatus.COMPLETED);
    const failedJobs = await this.jobsService.getJobsByStatus(JobStatus.FAILED);

    return {
      totalJobs: allJobs.length,
      activeJobs: activeJobs.length,
      pendingJobs: pendingJobs.length,
      runningJobs: runningJobs.length,
      completedJobs: completedJobs.length,
      failedJobs: failedJobs.length,
    };
  }
}
