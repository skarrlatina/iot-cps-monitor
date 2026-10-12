import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemperatureSensor } from './entities/temperature-sensor.entity';
import { TemperatureAlertsService } from './temperature-alerts.service';
import { TemperatureSensorsController } from './temperature-sensors.controller';
import { TemperatureSensorsService } from './temperature-sensors.service';

@Module({
  imports: [TypeOrmModule.forFeature([TemperatureSensor])],
  controllers: [TemperatureSensorsController],
  providers: [TemperatureSensorsService, TemperatureAlertsService],
})
export class TemperatureSensorsModule {}
