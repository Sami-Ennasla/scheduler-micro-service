import { Job, JobStatus } from '../entities/job.entity';
import { CreateJobDto } from '../dto/create-job.dto';
import { UpdateJobDto } from '../dto/update-job.dto';

export interface IJobRepository {
  create(createJobDto: CreateJobDto): Promise<Job>;
  findAll(): Promise<Job[]>;
  findOne(id: string): Promise<Job>;
  update(id: string, updateJobDto: UpdateJobDto): Promise<Job>;
  remove(id: string): Promise<void>;
  getActiveJobs(): Promise<Job[]>;
  getJobsByStatus(status: JobStatus): Promise<Job[]>;
  save(job: Job): Promise<Job>;
}
