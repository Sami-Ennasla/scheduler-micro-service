import { CreateJobDto } from '../dto/create-job.dto';
import { UpdateJobDto } from '../dto/update-job.dto';

export interface IJobValidationService {
  isValidCronExpression(cronExpression: string): boolean;
  validateCreateJob(createJobDto: CreateJobDto): void;
  validateUpdateJob(updateJobDto: UpdateJobDto): void;
  getNextExecutionTime(cronExpression: string): Date;
}
