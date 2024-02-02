import { VendorModule } from './pages/vendor/vendor.module';
import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './pages/user/user.module';
import { AdminModule } from './pages/admin/admin.module';
import { UtilsModule } from './shared/utils/utils.module';
import { UploadModule } from './pages/upload/upload.module';
import { DbToolsModule } from './shared/db-tools/db-tools.module';
import { FileFolderModule } from './pages/galleries/file-folder/file-folder.module';
import { PromoOfferModule } from './pages/offers/promo-offer/promo-offer.module';
import { GalleryModule } from './pages/galleries/gallery/gallery.module';
import { JobSchedulerModule } from './shared/job-scheduler/job-scheduler.module';
import { DashboardModule } from './pages/dashboard/dashboard.module';
import { RegistrationModule } from './pages/registration/registration.module';
import { CategoryModule } from './pages/category/category.module';
import { BrandModule } from './pages/brand/brand.module';
import { SubCategoryModule } from './pages/sub-category/sub-category.module';
import { ProductModule } from './pages/product/product.module';
import { CustomerModule } from './pages/customer/customer.module';
import { SupplierModule } from './pages/supplier/supplier.module';
import { SalesModule } from './pages/sales/sales.module';
import { ReturnReturnSalesModule } from './pages/return-sales/return-sales.module';
import { ExpenseModule } from './pages/expense/expense.module';
import { UnitModule } from './pages/unit/unit.module';
import { SalesmanModule } from './pages/salesman/salesman.module';
import { PreOrderModule } from './pages/pre-order/pre-order.module';
import { TransactionsModule } from './pages/transactions/transactions.module';
import { ProductPurchaseModule } from './pages/product-purchase/product-purchase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    MongooseModule.forRoot(configuration().mongoCluster),
    CacheModule.register({ ttl: 200, max: 10, isGlobal: true }),
    AdminModule,
    UserModule,
    UtilsModule,
    DbToolsModule,
    UploadModule,
    FileFolderModule,
    GalleryModule,
    PromoOfferModule,
    JobSchedulerModule,
    DashboardModule,
    RegistrationModule,
    // new add
    CategoryModule,
    BrandModule,
    SubCategoryModule,
    ProductModule,
    CustomerModule,
    SupplierModule,
    SalesModule,
    ReturnReturnSalesModule,
    ExpenseModule,
    UnitModule,
    VendorModule,
    SalesmanModule,
    PreOrderModule,
    TransactionsModule,
    ProductPurchaseModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
