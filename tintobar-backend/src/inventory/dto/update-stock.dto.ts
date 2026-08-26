import { IsInt, Min } from 'class-validator';

export class UpdateStockDto {
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  quantity!: number;
}
