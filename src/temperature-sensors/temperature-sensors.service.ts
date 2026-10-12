import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTemperatureSensorDto } from './dto/create-temperature-sensor.dto';
import { TemperatureSensor } from './entities/temperature-sensor.entity';
import { TemperatureAlertsService } from './temperature-alerts.service';

@Injectable()
export class TemperatureSensorsService {
  constructor(
    @InjectRepository(TemperatureSensor)
    private readonly temperatureSensorRepository: Repository<TemperatureSensor>,
    private readonly temperatureAlertsService: TemperatureAlertsService,
  ) {}

  async create(
    createDto: CreateTemperatureSensorDto,
  ): Promise<TemperatureSensor> {
    const sensor = this.temperatureSensorRepository.create(createDto);
    const saved = await this.temperatureSensorRepository.save(sensor);

    this.temperatureAlertsService.checkAndEmitAlert(saved);

    return saved;
  }

  async findLatest(limit = 50): Promise<TemperatureSensor[]> {
    return this.temperatureSensorRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
