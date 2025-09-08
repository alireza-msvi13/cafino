import { Controller, Get, Head, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Health Check')
export class AppController {
  @Get()
  @ApiOperation({
    summary: 'Server Health Check',
    description:
      'This endpoint can be used by monitoring services to verify that the API server is running and reachable.',
  })
  getHealth() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Welcome! Use /v1 for API endpoints.',
    };
  }

  @Head()
  @ApiOperation({
    summary: 'Server Health Check',
    description:
      'This endpoint can be used by monitoring services to verify that the API server is running and reachable.',
  })
  headHealth() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Welcome! Use /v1 for API endpoints.',
    };
  }
}
