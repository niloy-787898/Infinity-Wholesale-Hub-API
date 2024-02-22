import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  isString,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from './pagination.dto';
import { Product } from 'src/interfaces/common/product.interface';

export class AddSalesDto {
  @IsNotEmpty()
  customer: any;

  @IsOptional()
  @IsArray()
  products: Product[];

  @IsNotEmpty()
  @IsDateString()
  soldDate: Date;

  @IsNotEmpty()
  @IsNumber()
  discountAmount: number;

  @IsNotEmpty()
  @IsNumber()
  discountPercent: number;

  @IsNotEmpty()
  @IsNumber()
  shippingCharge: number;

  @IsNotEmpty()
  @IsNumber()
  subTotal: number;

  @IsNotEmpty()
  @IsNumber()
  total: number;

  @IsNotEmpty()
  @IsString()
  status: number;
}

export class FilterSalesDto {
  @IsOptional()
  @IsString()
  customer: string;
}

export class OptionSalesDto {
  @IsOptional()
  @IsBoolean()
  deleteMany: boolean;
}

export class UpdateSalesDto {
  @IsOptional()
  customer: any;

  @IsDateString()
  soldDate: Date;

  @IsString()
  invoiceNo: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsArray()
  products: Product[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  ids: string[];
}

export class FilterAndPaginationSalesDto {
  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterSalesDto)
  filter: FilterSalesDto;

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
