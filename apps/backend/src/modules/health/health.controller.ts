import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): ReturnType<HealthCheckService['check']> {
    return this.health.check([
      (): ReturnType<TypeOrmHealthIndicator['pingCheck']> =>
        this.db.pingCheck('database'),
      (): ReturnType<MemoryHealthIndicator['checkHeap']> =>
        this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
    ]);
  }
}
