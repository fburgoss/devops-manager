import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    private readonly mailService: MailService, // Inyectamos el servicio de correo
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const newSale = this.salesRepository.create(createSaleDto);
    const savedSale = await this.salesRepository.save(newSale);
    console.log('✅ Nueva venta guardada en la Base de Datos:', savedSale);
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

    // Objeto para agrupar por Mes -> Semana -> Días
    const monthsMap: {
      [monthName: string]: {
        [weekName: string]: {
          days: any[];
          weekTotal: number;
          weekCount: number;
        };
      };
    } = {};

    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    // Primero agrupamos por fecha exacta para sumar tragos diarios
    const dailyMap: {
      [dateStr: string]: {
        date: string;
        total: number;
        count: number;
        monthIndex: number;
        year: number;
      };
    } = {};

    closedSales.forEach((sale) => {
      const dateObj = new Date(sale.createdAt);
      const dateStr = dateObj.toISOString().split('T')[0];

      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = {
          date: dateStr,
          total: 0,
          count: 0,
          monthIndex: dateObj.getMonth(),
          year: dateObj.getFullYear(),
        };
      }
      dailyMap[dateStr].total += Number(sale.total);
      dailyMap[dateStr].count += Number(sale.quantity);
    });

    // Luego organizamos por Mes y calculamos la semana del mes
    Object.values(dailyMap).forEach((dayData) => {
      const d = new Date(dayData.date);
      const monthName = `${monthNames[dayData.monthIndex]} ${dayData.year}`;

      // Cálculo simple de la semana del mes basada en el número del día
      const dayOfMonth = d.getDate();
      const weekNumber = Math.ceil(dayOfMonth / 7);
      const weekKey = `Semana ${weekNumber}`;

      if (!monthsMap[monthName]) {
        monthsMap[monthName] = {};
      }
      if (!monthsMap[monthName][weekKey]) {
        monthsMap[monthName][weekKey] = {
          days: [],
          weekTotal: 0,
          weekCount: 0,
        };
      }

      monthsMap[monthName][weekKey].days.push(dayData);
      monthsMap[monthName][weekKey].weekTotal += dayData.total;
      monthsMap[monthName][weekKey].weekCount += dayData.count;
    });

    return monthsMap;
  }
}
