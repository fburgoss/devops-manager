import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { MailService } from '../mail/mail.service';
import { Inventory } from '../inventory/entities/inventory.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly mailService: MailService,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const newSale = this.salesRepository.create({
      name: createSaleDto.name,
      price: createSaleDto.price,
      quantity: createSaleDto.quantity,
      total: createSaleDto.price * createSaleDto.quantity,
      size: createSaleDto.size,
    });
    const savedSale = await this.salesRepository.save(newSale);
    console.log('✅ Nueva venta guardada en la Base de Datos:', savedSale);

    try {
      const esMedioLitro = savedSale.size
        ? savedSale.size.toLowerCase().includes('medio') ||
          savedSale.size.includes('0.5')
        : Number(savedSale.price) === 4000;

      const sticker = await this.inventoryRepository.findOneBy({
        name: 'Stickers',
      });
      if (sticker) {
        sticker.quantity = Math.max(0, sticker.quantity - savedSale.quantity);
        await this.inventoryRepository.save(sticker);
      }

      if (esMedioLitro) {
        const vasoMedio = await this.inventoryRepository.findOneBy({
          name: 'Vasos 0.5L (Medio Litro)',
        });
        if (vasoMedio) {
          vasoMedio.quantity = Math.max(
            0,
            vasoMedio.quantity - savedSale.quantity,
          );
          await this.inventoryRepository.save(vasoMedio);
        }
      } else {
        const vasoLitro = await this.inventoryRepository.findOneBy({
          name: 'Vasos 1L (Litro)',
        });
        if (vasoLitro) {
          vasoLitro.quantity = Math.max(
            0,
            vasoLitro.quantity - savedSale.quantity,
          );
          await this.inventoryRepository.save(vasoLitro);
        }
      }
    } catch (error) {
      console.error('⚠️ Error al descontar inventario:', error);
    }

    return savedSale;
  }

  async findAll(): Promise<Sale[]> {
    return await this.salesRepository.find({
      where: { closed: false },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: number): Promise<void> {
    await this.salesRepository.delete(id);
  }

  async closeDay(): Promise<{ success: boolean; message: string }> {
    const activeSales = await this.salesRepository.find({
      where: { closed: false },
    });

    if (activeSales.length === 0) {
      throw new Error('No hay ventas activas para cerrar en este día.');
    }

    const totalSales = activeSales.reduce(
      (acc, sale) => acc + Number(sale.total),
      0,
    );
    // Sumamos la cantidad de cada registro en lugar de contar las filas
    const salesCount = activeSales.reduce(
      (acc, sale) => acc + Number(sale.quantity),
      0,
    );

    await this.mailService.sendReport(totalSales, salesCount);
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

    // 1. Declaramos la variable summary que faltaba
    const summary: any = {};

    closedSales.forEach((sale) => {
      if (!sale.createdAt) return;

      const date = new Date(sale.createdAt);
      if (isNaN(date.getTime())) return;

      const month = `${date.toLocaleString('es-ES', { month: 'long' }).toUpperCase()} ${date.getFullYear()}`;
      const week = `Semana ${Math.ceil(date.getDate() / 7)}`;

      if (!summary[month]) summary[month] = {};
      if (!summary[month][week]) {
        summary[month][week] = {
          weekTotal: 0,
          weekCount: 0,
          products: {},
          sizes: {},
          days: [],
        };
      }

      const weekData = summary[month][week];
      weekData.weekTotal += Number(sale.total);
      weekData.weekCount += Number(sale.quantity);

      if (!weekData.products[sale.name]) {
        weekData.products[sale.name] = { count: 0, total: 0 };
      }
      weekData.products[sale.name].count += sale.quantity;
      weekData.products[sale.name].total += Number(sale.total);

      const saleSize = sale.size || '1 Litro';
      if (!weekData.sizes[saleSize]) {
        weekData.sizes[saleSize] = 0;
      }
      weekData.sizes[saleSize] += sale.quantity;

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
}
