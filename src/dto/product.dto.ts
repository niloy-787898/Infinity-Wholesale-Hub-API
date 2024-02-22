import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from './pagination.dto';

export class AddProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  category?: any;

  @IsOptional()
  subcategory?: any;

  @IsOptional()
  productId?: any;
  @IsOptional()
  sku?: any;
  @IsOptional()
  others?: any;
  @IsOptional()
  model?: any;

  @IsOptional()
  soldQuantity?: number;
  @IsNotEmpty()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @IsOptional()
  createdAtString?: string;

  @IsOptional()
  brand?: any;

  @IsOptional()
  unit?: any;
}

export class FilterCProductDto {
  @IsOptional()
  @IsString()
  name: string;
}

export class OptionProductDto {
  @IsOptional()
  @IsBoolean()
  deleteMany: boolean;
}

export class UpdateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  others: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  soldQuantity: number;

  @IsOptional()
  @IsString()
  model: string;

  @IsOptional()
  @IsString()
  productCode: string;

  @IsOptional()
  @IsNumber()
  salePrice: number;

  @IsOptional()
  @IsNumber()
  purchasePrice: number;

  @IsOptional()
  category?: any;

  @IsOptional()
  subcategory?: any;

  @IsOptional()
  productId?: any;

  @IsOptional()
  brand?: any;

  @IsOptional()
  unit?: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  ids: string[];
}

export class FilterAndPaginationProductDto {
  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterCProductDto)
  filter: FilterCProductDto;

  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination: PaginationDto;

  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  sort: object;

  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  select: any;
}
