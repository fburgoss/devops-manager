import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { MailService } from '../mail/mail.service';

@Controller('sales')
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly mailService: MailService,
  ) {}

  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesService.remove(+id);
  }

  @Post('close-day')
  async closeDay() {
    try {
      // Llamamos al método completo del servicio que calcula, envía el correo y archiva las ventas
      const result = await this.salesService.closeDay();
      return result;
    } catch (error: any) {
      console.error(error);
      return {
        success: false,
        message: error.message || 'Error al realizar el cierre',
      };
    }
  }
}
