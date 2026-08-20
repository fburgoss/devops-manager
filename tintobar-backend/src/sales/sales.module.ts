import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { Sale } from './entities/sale.entity';
import { MailModule } from '../mail/mail.module';
import { Inventory } from '../inventory/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Inventory]), MailModule],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
