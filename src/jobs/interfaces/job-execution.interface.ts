import { Job } from '../entities/job.entity';

export interface IJobExecutionService {
  execute(id: string): Promise<Job>;
  activate(id: string): Promise<Job>;
  deactivate(id: string): Promise<Job>;
  executeJob(job: Job): Promise<void>;
}
