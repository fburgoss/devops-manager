import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string; // Ej: "Vasos 1.5L" o "Stickers"

  @Column('int')
  quantity!: number; // Cantidad actual en stock

  @Column('int', { default: 5 })
  minAlert!: number; // Nivel mínimo para avisarte que te queda poco
}
