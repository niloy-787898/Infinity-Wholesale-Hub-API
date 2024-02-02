import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { SalesSchema } from '../../schema/sales.schema';
import { CustomerSchema } from '../../schema/customer.schema';
import { UniqueIdSchema } from 'src/schema/unique-id.schema';
import { AdminSchema } from 'src/schema/admin.schema';
import { ReturnSalesSchema } from 'src/schema/sales-return.schema';
import { ProductSchema } from 'src/schema/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Sales', schema: SalesSchema },
      { name: 'ReturnSales', schema: ReturnSalesSchema },
      { name: 'Customer', schema: CustomerSchema },
      { name: 'UniqueId', schema: UniqueIdSchema },
      { name: 'Admin', schema: AdminSchema },
      { name: 'Product', schema: ProductSchema },
    ]),
  ],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule { }
