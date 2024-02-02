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
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from './pagination.dto';

export class AddPreOrderDto {
  @IsNotEmpty()
  customer: any;

  @IsNotEmpty()
  products: any;

  @IsNotEmpty()
  @IsDateString()
  soldDate: Date;

  @IsNotEmpty()
  @IsNumber()
  discountAmount: number;

  @IsNotEmpty()
  @IsNumber()
  subTotal: number;

  @IsNotEmpty()
  @IsNumber()
  total: number;
}

export class FilterPreOrderDto {
  @IsOptional()
  @IsString()
  customer: string;
}

export class OptionPreOrderDto {
  @IsOptional()
  @IsBoolean()
  deleteMany: boolean;
}

export class UpdatePreOrderDto {
  @IsOptional()
  customer: any;

  @IsDateString()
  soldDate: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  ids: string[];
}

export class FilterAndPaginationPreOrderDto {
  @IsOptional()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterPreOrderDto)
  filter: FilterPreOrderDto;

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
