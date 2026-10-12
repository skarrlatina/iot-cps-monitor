import { Body, Controller, Get, MessageEvent, Post, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CreateTemperatureSensorDto } from './dto/create-temperature-sensor.dto';
import { TemperatureAlertsService } from './temperature-alerts.service';
import { TemperatureSensorsService } from './temperature-sensors.service';

@Controller('temperature-sensors')
export class TemperatureSensorsController {
  constructor(
    private readonly temperatureSensorsService: TemperatureSensorsService,
    private readonly temperatureAlertsService: TemperatureAlertsService,
  ) {}

  @Post()
  create(@Body() createDto: CreateTemperatureSensorDto) {
    return this.temperatureSensorsService.create(createDto);
  }

  @Get()
  findLatest() {
    return this.temperatureSensorsService.findLatest(50);
  }

  @Sse('alerts')
  alerts(): Observable<MessageEvent> {
    return this.temperatureAlertsService.getAlertStream();
  }
}
