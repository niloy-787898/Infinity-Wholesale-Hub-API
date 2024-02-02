import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from '../../shared/utils/utils.service';
import { User } from '../../interfaces/user/user.interface';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { Admin } from '../../interfaces/admin/admin.interface';
import { Sales } from '../../interfaces/common/sales.interface';
import { Expense } from 'src/interfaces/common/expense.interface';
import { Product } from 'src/interfaces/common/product.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class DashboardService {
  private logger = new Logger(DashboardService.name);

  constructor(
    @InjectModel('Admin')
    private readonly adminModel: Model<Admin>,
    @InjectModel('User')
    private readonly userModel: Model<User>,
    @InjectModel('Sales')
    private readonly salesModel: Model<Sales>,
    @InjectModel('Expense')
    private readonly expenseModel: Model<Expense>,
    @InjectModel('Product')
    private readonly productModel: Model<Product>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  async getSalesDashboard(admin?: any): Promise<ResponsePayload> {
    try {
      // const day7 = this.utilsService.getNextDateString(new Date(), -7);
      const today = this.utilsService.getDateString(new Date());

      // Calculations
      const aggregateStagesCalculation = [];
      const aggregateStagesCalculation2 = [];
      const aggregateStagesCalculation3 = [];

      if (admin.role === 'salesman') {
        aggregateStagesCalculation.push({
          $match: {
            soldDateString: today,
            'salesman._id': new ObjectId(admin._id),
          },
        });
      } else {
        aggregateStagesCalculation.push({
          $match: {
            soldDateString: today,
          },
        });
      }

      const group = {
        $group: {
          _id: null,
          totalSale: { $sum: '$total' },
          totalLoss: {
            $sum: {
              $subtract: ['$totalPurchasePrice', '$total'],
            },
          },
          totalProfit: {
            $sum: {
              $subtract: ['$total', '$totalPurchasePrice'],
            },
          },
        },
      };

      aggregateStagesCalculation.push(group);

      aggregateStagesCalculation2.push({
        $match: {
          dateString: today,
        },
      });

      aggregateStagesCalculation2.push({
        $group: {
          _id: null,
          totalExpense: { $sum: '$paidAmount' },
        },
      });

      aggregateStagesCalculation3.push({
        $match: {
          createdAtString: today,
        },
      });

      aggregateStagesCalculation3.push({
        $group: {
          _id: null,
          totalPurchase: { $sum: '$purchasePrice' },
        },
      });

      const calculateAggregates = await this.salesModel.aggregate(
        aggregateStagesCalculation,
      );

      const calculateAggregates2 = await this.expenseModel.aggregate(
        aggregateStagesCalculation2,
      );

      const calculateAggregates3 = await this.productModel.aggregate(
        aggregateStagesCalculation3,
      );

      return {
        success: true,
        message: 'Data Retrieve Success',
        data: {
          ...calculateAggregates[0],
          ...calculateAggregates2[0],
          ...calculateAggregates3[0],
        },
      } as ResponsePayload;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
