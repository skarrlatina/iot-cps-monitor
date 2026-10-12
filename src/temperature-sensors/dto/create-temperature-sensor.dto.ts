import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTemperatureSensorDto {
  @IsString()
  @IsNotEmpty()
  sensorName!: string;

  @IsNumber()
  @IsNotEmpty()
  value!: number;

  @IsString()
  @IsNotEmpty()
  unit!: string;

  @IsOptional()
  timestamp?: Date;
}
