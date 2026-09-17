import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SalesModule } from './sales/sales.module';
import { InventoryModule } from './inventory/inventory.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL &&
      process.env.DATABASE_URL.startsWith('postgresql://')
        ? {
            url: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
          }
        : {
            host:
              process.env.DB_HOST ||
              'dpg-dam175tbedkc73a9khd0-a.oregon-postgres.render.com',
            port: Number(process.env.DB_PORT) || 5432,
            username: process.env.DB_USERNAME || 'ttintobar_db_user',
            password:
              process.env.DB_PASSWORD || 'KG7Aihep4ELTfvmX6LUSLbl0RrtjazTe',
            database: process.env.DB_NAME || 'ttintobar_db',
            ssl: { rejectUnauthorized: false },
          }),
      autoLoadEntities: true,
      synchronize: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),
    SalesModule,
    InventoryModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
