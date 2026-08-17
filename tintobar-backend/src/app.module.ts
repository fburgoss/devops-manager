import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url:
        process.env.DATABASE_URL ||
        'postgres://tintobar:wSambBrapTpFtw5WIpVKROH9pv6bQoJq@dpg-da1hn2lbedkc73d0jfq0-a/tintobardb',
      autoLoadEntities: true,
      synchronize: true,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
