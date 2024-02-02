import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductPurchaseController } from './product-purchase.controller';
import { ProductPurchaseService } from './product-purchase.service';
import { ProductPurchaseSchema } from 'src/schema/product-purchase.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'ProductPurchase', schema: ProductPurchaseSchema },]),
  ],
  controllers: [ProductPurchaseController],
  providers: [ProductPurchaseService],
})
export class ProductPurchaseModule {}
