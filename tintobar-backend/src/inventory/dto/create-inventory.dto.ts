import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';

export class CreateInventoryDto {
  @IsString({ message: 'El nombre del insumo debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del insumo es requerido' })
  name!: string;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  quantity!: number;

  @IsInt({ message: 'La alerta mínima debe ser un número entero' })
  @Min(0, { message: 'La alerta mínima no puede ser negativa' })
  @IsOptional()
  minAlert?: number;
}
