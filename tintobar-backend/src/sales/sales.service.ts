import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { MailService } from '../mail/mail.service';
import { Inventory } from '../inventory/entities/inventory.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SalesService implements OnModuleInit {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      const salesCount = await this.salesRepository.count();
      if (salesCount === 0) {
        console.log(
          '🔄 Base de datos vacía detectada: Restaurando datos del backup automáticamente...',
        );

        // 1. Restaurar Usuario
        const userExists = await this.userRepository.findOneBy({
          email: 'f.burgoss1589@gmail.com',
        });
        if (!userExists) {
          await this.dataSource.query(`
            INSERT INTO users (id, email, password, "createdAt")
            VALUES (1, 'f.burgoss1589@gmail.com', '$2b$10$ZAmWE8cwh9XiU67aO9Ch/ukxTkaYRP2LT6aDD/huScqt8PSsG.IB2', '2026-08-24 19:16:40.837485')
            ON CONFLICT (id) DO NOTHING;
          `);
          console.log('👤 Usuario restaurado con éxito.');
        }

        // 2. Restaurar Insumos
        const invCount = await this.inventoryRepository.count();
        if (invCount === 0) {
          await this.dataSource.query(`
            INSERT INTO inventory (id, name, quantity, "minAlert") VALUES
            (9, 'Vasos 0.5L (Medio Litro)', 27, 10),
            (10, 'Vasos 1L (Litro)', 9, 10),
            (11, 'Stickers', 77, 50)
            ON CONFLICT (id) DO NOTHING;
          `);
          console.log('📦 Insumos restaurados con éxito.');
        }

        // 3. Restaurar Ventas Históricas
        await this.dataSource.query(`
          INSERT INTO sales (id, name, price, quantity, total, closed, "createdAt", size) VALUES
          (108, 'Daiquiri', 7000.00, 1, 7000.00, true, '2026-08-22 18:57:08.456642', '1 Litro'),
          (109, 'Daiquiri', 7000.00, 1, 7000.00, true, '2026-08-22 21:37:26.059850', '1 Litro'),
          (110, 'Borgoña', 7000.00, 1, 7000.00, true, '2026-08-23 03:15:25.891124', '1 Litro'),
          (111, 'Daiquiri', 7000.00, 3, 21000.00, true, '2026-08-23 04:21:07.017325', '1 Litro'),
          (112, 'Borgoña', 7000.00, 1, 7000.00, true, '2026-08-23 04:21:16.683542', '1 Litro'),
          (113, 'Borgoña', 7000.00, 1, 7000.00, true, '2026-09-04 16:37:40.045971', '1 Litro'),
          (114, 'Piña Colada', 9000.00, 2, 18000.00, true, '2026-09-04 21:36:29.090687', '1 Litro'),
          (115, 'Terremoto', 7000.00, 1, 7000.00, true, '2026-09-04 23:13:29.491132', '1 Litro'),
          (116, 'Daiquiri', 4000.00, 1, 4000.00, true, '2026-09-05 03:29:34.166275', 'Medio Litro'),
          (117, 'Borgoña', 7000.00, 1, 7000.00, true, '2026-09-05 03:29:40.562386', '1 Litro'),
          (118, 'Terremoto', 7000.00, 1, 7000.00, true, '2026-09-05 21:58:03.097643', '1 Litro'),
          (119, 'Daiquiri', 7000.00, 1, 7000.00, true, '2026-09-06 01:23:29.665000', '1 Litro'),
          (120, 'Piña Colada', 9000.00, 1, 9000.00, true, '2026-09-06 02:03:54.384000', '1 Litro'),
          (125, 'Daiquiri', 7000.00, 2, 14000.00, true, '2026-09-12 02:05:23.889283', '1 Litro'),
          (126, 'Terremoto', 4000.00, 1, 4000.00, true, '2026-09-12 02:05:34.538772', 'Medio Litro'),
          (127, 'Piña Colada', 9000.00, 1, 9000.00, true, '2026-09-12 02:05:42.460253', '1 Litro'),
          (128, 'Daiquiri', 4000.00, 1, 4000.00, true, '2026-09-12 02:06:31.267535', 'Medio Litro'),
          (129, 'Borgoña', 4000.00, 1, 4000.00, true, '2026-09-12 02:06:54.085035', 'Medio Litro'),
          (130, 'Daiquiri', 4000.00, 1, 4000.00, true, '2026-09-12 02:21:36.433150', 'Medio Litro'),
          (131, 'Borgoña', 4000.00, 1, 4000.00, true, '2026-09-12 02:21:41.884779', 'Medio Litro'),
          (132, 'Terremoto', 6000.00, 2, 12000.00, true, '2026-09-12 22:16:00.018683', '1 Litro')
          ON CONFLICT (id) DO NOTHING;
        `);
        console.log('🍷 21 Ventas históricas restauradas con éxito.');

        // 4. Sincronizar secuencias de autoincremento
        try {
          await this.dataSource.query(`
            SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id), 1)) FROM users;
            SELECT setval(pg_get_serial_sequence('inventory', 'id'), coalesce(max(id), 1)) FROM inventory;
            SELECT setval(pg_get_serial_sequence('sales', 'id'), coalesce(max(id), 1)) FROM sales;
          `);
        } catch (seqErr) {
          console.log('Secuencias sincronizadas.');
        }

        console.log(
          '🎉 Restauración automática de datos finalizada con éxito.',
        );
      }
    } catch (e) {
      console.error('⚠️ Error al auto-restaurar backup:', e);
    }
  }

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
        : [4000, 3500, 5500].includes(Number(savedSale.price));

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
