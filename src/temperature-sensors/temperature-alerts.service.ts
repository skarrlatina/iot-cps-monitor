import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { TemperatureSensor } from './entities/temperature-sensor.entity';

const CRITICAL_TEMPERATURE = -10;

@Injectable()
export class TemperatureAlertsService {
  private readonly alertSubject = new Subject<MessageEvent>();

  getAlertStream(): Observable<MessageEvent> {
    return this.alertSubject.asObservable();
  }

  checkAndEmitAlert(sensor: TemperatureSensor): void {
    if (sensor.value <= CRITICAL_TEMPERATURE) {
      this.alertSubject.next({
        data: {
          type: 'critical_temperature',
          message: `Critical temperature detected on sensor "${sensor.sensorName}"`,
          sensorId: sensor.id,
          sensorName: sensor.sensorName,
          value: sensor.value,
          unit: sensor.unit,
          timestamp: sensor.timestamp,
          createdAt: sensor.createdAt,
        },
      } as MessageEvent);
    }
  }
}
