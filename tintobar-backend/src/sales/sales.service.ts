import { Injectable } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  // Nuestra "base de datos" temporal en memoria
  private sales: any[] = [];

  create(createSaleDto: CreateSaleDto) {
    // Armamos el objeto de la venta agregándole un ID y la hora actual
    const newSale = {
      id: Date.now(),
      ...createSaleDto,
      timestamp: new Date().toLocaleTimeString(),
    };

    // Lo guardamos en nuestro arreglo
    this.sales.push(newSale);

    console.log('✅ Nueva venta recibida en Backend:', newSale);

    // Devolvemos la venta creada para que el frontend la vea
    return newSale;
  }

  findAll() {
    // Devuelve todo el historial de ventas
    return this.sales;
  }
}
