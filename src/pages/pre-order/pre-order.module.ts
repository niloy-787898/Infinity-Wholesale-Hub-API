import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesSchema } from '../../schema/sales.schema';
import { CustomerSchema } from '../../schema/customer.schema';
import { UniqueIdSchema } from 'src/schema/unique-id.schema';
import { AdminSchema } from 'src/schema/admin.schema';
import { PreOrderService } from './pre-order.service';
import { PreorderController } from './pre-order.controller';
import { PreOrderSchema } from 'src/schema/pre-order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PreOrder', schema: PreOrderSchema },
      { name: 'Customer', schema: CustomerSchema },
      { name: 'UniqueId', schema: UniqueIdSchema },
      { name: 'Admin', schema: AdminSchema },
    ]),
  ],
  controllers: [PreorderController],
  providers: [PreOrderService],
})
export class PreOrderModule {}
