import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Post()
  create(@Body() body: { name: string; quantity: number; minAlert?: number }) {
    return this.inventoryService.create(body);
  }

  @Patch(':id')
  updateStock(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.inventoryService.updateStock(+id, quantity);
  }
}
