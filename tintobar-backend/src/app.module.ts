import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      // Si existe una variable de entorno URL (como la de Render), la usa; si no, usa localhost para desarrollo local
      url:
        process.env.DATABASE_URL ||
        'postgres://tintobar:tu_password@localhost:5432/tintobardb',
      autoLoadEntities: true,
      synchronize: true, // Esto crea la tabla 'sales' automáticamente la primera vez (ideal para este proyecto rápido)
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false, // Necesario para conexiones seguras en Render
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
