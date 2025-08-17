import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ThrottlerGuard, Throttle, SkipThrottle } from '@nestjs/throttler';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job, JobStatus } from './entities/job.entity';

@ApiTags('jobs')
@Controller('jobs')
@UseGuards(ThrottlerGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute for job creation
  @ApiOperation({ summary: 'Create a new job' })
  @ApiResponse({ status: 201, description: 'Job created successfully', type: Job })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  create(@Body() createJobDto: CreateJobDto): Promise<Job> {
    return this.jobsService.create(createJobDto);
  }

  @Get()
  @SkipThrottle() // Skip rate limiting for read operations
  @ApiOperation({ summary: 'Get all jobs' })
  @ApiResponse({ status: 200, description: 'List of all jobs', type: [Job] })
  findAll(): Promise<Job[]> {
    return this.jobsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active jobs' })
  @ApiResponse({ status: 200, description: 'List of active jobs', type: [Job] })
  findActive(): Promise<Job[]> {
    return this.jobsService.getActiveJobs();
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get jobs by status' })
  @ApiParam({ name: 'status', enum: JobStatus, description: 'Job status to filter by' })
  @ApiResponse({ status: 200, description: 'List of jobs with specified status', type: [Job] })
  findByStatus(@Param('status') status: JobStatus): Promise<Job[]> {
    return this.jobsService.getJobsByStatus(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job by ID' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job found', type: Job })
  @ApiResponse({ status: 404, description: 'Job not found' })
  findOne(@Param('id') id: string): Promise<Job> {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job updated successfully', type: Job })
  @ApiResponse({ status: 404, description: 'Job not found' })
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto): Promise<Job> {
    return this.jobsService.update(id, updateJobDto);
  }

  @Delete(':id')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 deletions per minute
  @ApiOperation({ summary: 'Delete a job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 204, description: 'Job deleted successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.jobsService.remove(id);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate a job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job activated successfully', type: Job })
  @ApiResponse({ status: 404, description: 'Job not found' })
  activate(@Param('id') id: string): Promise<Job> {
    return this.jobsService.activate(id);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job deactivated successfully', type: Job })
  @ApiResponse({ status: 404, description: 'Job not found' })
  deactivate(@Param('id') id: string): Promise<Job> {
    return this.jobsService.deactivate(id);
  }

  @Post(':id/execute')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 executions per minute
  @ApiOperation({ summary: 'Execute a job immediately' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job executed successfully', type: Job })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  execute(@Param('id') id: string): Promise<Job> {
    return this.jobsService.execute(id);
  }
}
