
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check API health' })
  checkHealth() {
    return {
      status: 'ok',
      message: 'FoodOrder API is running',
      application: 'FoodOrder',
      architecture: 'Multi-Restaurant',
      timestamp: new Date().toISOString(),
    };
  }
}
