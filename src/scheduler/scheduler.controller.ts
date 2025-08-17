import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThrottlerGuard, SkipThrottle } from '@nestjs/throttler';
import { SchedulerService } from './scheduler.service';

@ApiTags('scheduler')
@Controller('scheduler')
@UseGuards(ThrottlerGuard)
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Get('status')
  @SkipThrottle() // Skip rate limiting for status checks
  @ApiOperation({ summary: 'Get scheduler status and statistics' })
  @ApiResponse({ status: 200, description: 'Scheduler status retrieved successfully' })
  getStatus() {
    return this.schedulerService.getSchedulerStatus();
  }
}
