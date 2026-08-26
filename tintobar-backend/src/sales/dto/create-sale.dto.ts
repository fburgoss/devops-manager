import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateSaleDto {
  @IsString({ message: 'El nombre del producto debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del producto es requerido' })
  name!: string;

  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  price!: number;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  quantity!: number;

  @IsNumber({}, { message: 'El total debe ser un número' })
  @IsOptional()
  total?: number;

  @IsString({ message: 'El tamaño debe ser texto' })
  @IsOptional()
  size?: string;
}
