import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  async findAll() {
    return await this.inventoryRepository.find();
  }

  async create(data: { name: string; quantity: number; minAlert?: number }) {
    const item = this.inventoryRepository.create(data);
    return await this.inventoryRepository.save(item);
  }

  async updateStock(id: number, quantity: number) {
    await this.inventoryRepository.update(id, { quantity });
    return await this.inventoryRepository.findOneBy({ id });
  }
}
