import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    // Creamos la instancia de la venta con los datos que llegan
    const newSale = this.salesRepository.create(createSaleDto);

    // La guardamos de forma persistente en PostgreSQL
    const savedSale = await this.salesRepository.save(newSale);

    console.log('✅ Nueva venta guardada en la Base de Datos:', savedSale);
    return savedSale;
  }

  async findAll(): Promise<Sale[]> {
    // Traemos todo el historial real desde la base de datos
    return await this.salesRepository.find();
  }

  async remove(id: number): Promise<void> {
    // Eliminamos la venta de la base de datos por su ID
    await this.salesRepository.delete(id);
  }
}
