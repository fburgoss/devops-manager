import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { MailService } from '../mail/mail.service';
import { Inventory } from '../inventory/entities/inventory.entity'; // <--- Importado

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    @InjectRepository(Inventory) // <--- Inyectado aquí sin tocar lo demás
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly mailService: MailService,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const newSale = this.salesRepository.create(createSaleDto);
    const savedSale = await this.salesRepository.save(newSale);
    console.log('✅ Nueva venta guardada en la Base de Datos:', savedSale);

    // --- LÓGICA DE DESCUENTO AUTOMÁTICO DE STOCK ---
    try {
      const nombreVenta = savedSale.name.toLowerCase();

      // 1. ¡TODAS las ventas descuentan stickers automáticamente!
      const sticker = await this.inventoryRepository.findOneBy({
        name: 'Stickers',
      });
      if (sticker && sticker.quantity > 0) {
        sticker.quantity -= savedSale.quantity;
        await this.inventoryRepository.save(sticker);
        console.log('📉 Stock actualizado: Stickers restados.');
      }

      // 2. Si la venta incluye un vaso de litro o formato grande
      if (nombreVenta.includes('litro') || nombreVenta.includes('vaso')) {
        const vaso = await this.inventoryRepository.findOneBy({
          name: 'Vasos 1.5L',
        });
        if (vaso && vaso.quantity > 0) {
          vaso.quantity -= savedSale.quantity;
          await this.inventoryRepository.save(vaso);
          console.log('📉 Stock actualizado: Vasos 1.5L restados.');
        }
      }
    } catch (error) {
      console.error(
        '⚠️ Error al descontar el inventario automáticamente:',
        error,
      );
    }
    // --------------------------------------------------

    return savedSale;
  }

  async findAll(): Promise<Sale[]> {
    // CAMBIO CLAVE: Solo traemos las ventas que NO han sido cerradas (el día actual)
    return await this.salesRepository.find({
      where: { closed: false },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: number): Promise<void> {
    await this.salesRepository.delete(id);
  }

  // NUEVO MÉTODO: Cierra el día, envía el correo y marca las ventas como históricas
  async closeDay(): Promise<{ success: boolean; message: string }> {
    // 1. Buscamos solo las ventas activas del día actual
    const activeSales = await this.salesRepository.find({
      where: { closed: false },
    });

    if (activeSales.length === 0) {
      throw new Error('No hay ventas activas para cerrar en este día.');
    }

    // 2. Calculamos totales
    const totalSales = activeSales.reduce(
      (acc, sale) => acc + Number(sale.total),
      0,
    );
    const salesCount = activeSales.length;

    // 3. Enviamos el correo usando tu plantilla de Resend
    await this.mailService.sendReport(totalSales, salesCount);

    // 4. Marcamos las ventas como cerradas (NO se borran, pasan al historial permanente)
    await this.salesRepository.update({ closed: false }, { closed: true });

    return {
      success: true,
      message:
        'Cierre de día realizado, correo enviado y registros guardados en el historial.',
    };
  }

  async getHistorySummary() {
    const closedSales = await this.salesRepository.find({
      where: { closed: true },
      order: { createdAt: 'DESC' },
    });

    const summary: any = {};

    closedSales.forEach((sale) => {
      // Validamos que la fecha exista
      if (!sale.createdAt) return;

      const date = new Date(sale.createdAt);
      if (isNaN(date.getTime())) return; // Si la fecha es inválida, la ignoramos para que no caiga el servidor

      const month = `${date.toLocaleString('es-ES', { month: 'long' }).toUpperCase()} ${date.getFullYear()}`;
      const week = `Semana ${Math.ceil(date.getDate() / 7)}`;

      if (!summary[month]) summary[month] = {};
      if (!summary[month][week]) {
        summary[month][week] = {
          weekTotal: 0,
          weekCount: 0,
          products: {},
          days: [],
        };
      }

      const weekData = summary[month][week];
      weekData.weekTotal += Number(sale.total);
      weekData.weekCount += Number(sale.quantity);

      // Agrupamos por producto para los gráficos
      if (!weekData.products[sale.name]) {
        weekData.products[sale.name] = { count: 0, total: 0 };
      }
      weekData.products[sale.name].count += sale.quantity;
      weekData.products[sale.name].total += Number(sale.total);

      // Llenado de días seguro
      try {
        const dateString = date.toISOString().split('T')[0];
        let dayEntry = weekData.days.find((d: any) => d.date === dateString);

        if (!dayEntry) {
          dayEntry = { date: dateString, count: 0, total: 0 };
          weekData.days.push(dayEntry);
        }

        dayEntry.count += sale.quantity;
        dayEntry.total += Number(sale.total);
      } catch (e) {
        console.error('Error procesando fecha de venta:', e);
      }
    });

    return summary;
  }
  // Actualización forzada
}
