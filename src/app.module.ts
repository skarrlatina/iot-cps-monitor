import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemperatureSensorsModule } from './temperature-sensors/temperature-sensors.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('DB_HOST');
        const isLocal = host === 'localhost' || host === '127.0.0.1';

        return {
          type: 'postgres' as const,
          host,
          port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true,
          // SSL required for Render PostgreSQL; disabled for local DB
          ssl: isLocal ? false : { rejectUnauthorized: false },
        };
      },
    }),
    TemperatureSensorsModule,
  ],
})
export class AppModule {}
