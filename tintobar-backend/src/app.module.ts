import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'dpg-da1hn2lbedkc73d0jfq0-a',
      port: 5432,
      username: 'tintobar',
      password: 'wSambBrapTpFtw5WIpVKROH9pv6bQoJq',
      database: 'tintobardb',
      autoLoadEntities: true,
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
