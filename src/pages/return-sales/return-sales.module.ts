import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReturnSalesService } from './return-sales.service';
import { ReturnSalesSchema } from '../../schema/sales-return.schema';
import { ReturnSalesController } from './return-sales.controller';
import { CustomerSchema } from '../../schema/customer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ReturnSales', schema: ReturnSalesSchema },
      { name: 'Customer', schema: CustomerSchema },
    ]),
  ],
  controllers: [ReturnSalesController],
  providers: [ReturnSalesService],
})
export class ReturnReturnSalesModule {}
