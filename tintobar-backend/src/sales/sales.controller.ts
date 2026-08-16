import { Controller, Get, Post, Body } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // POST: http://localhost:3000/sales (Recibe una nueva venta)
  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  // GET: http://localhost:3000/sales (Devuelve todas las ventas)
  @Get()
  findAll() {
    return this.salesService.findAll();
  }
}
