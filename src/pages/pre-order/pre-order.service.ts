import { UniqueId } from 'src/interfaces/core/unique-id.interface';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from '../../shared/utils/utils.service';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { ErrorCodes } from '../../enum/error-code.enum';
import {
  AddSalesDto,
  FilterAndPaginationSalesDto,
  UpdateSalesDto,
} from '../../dto/sales.dto';
import { Sales } from 'src/interfaces/common/sales.interface';
import { Customer } from '../../interfaces/common/customer.interface';
import { Admin } from 'src/interfaces/admin/admin.interface';
import { PreOrder } from 'src/interfaces/common/pre-order.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class PreOrderService {
  private logger = new Logger(PreOrderService.name);

  constructor(
    @InjectModel('PreOrder')
    private readonly preorderModel: Model<PreOrder>,
    @InjectModel('Customer')
    private readonly customerModel: Model<Customer>,
    @InjectModel('UniqueId')
    private readonly uniqueIdModel: Model<UniqueId>,
    @InjectModel('Admin')
    private readonly adminModel: Model<Admin>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * ADD DATA
   * addSales()
   * insertManySales()
   */
  async addSales(
    addSalesDto: AddSalesDto,
    salesman: Admin,
  ): Promise<ResponsePayload> {
    try {
      let newCustomer: Customer;
      let saveData: any;

      const { soldDate } = addSalesDto;
      const { customer } = addSalesDto;
      const { products } = addSalesDto;
      const { discountAmount } = addSalesDto;
      const { total } = addSalesDto;
      const { subTotal } = addSalesDto;

      const incInvoiceId: any = await this.uniqueIdModel.findOneAndUpdate(
        {},
        { $inc: { invoiceNo: 1 } },
        { new: true, upsert: true },
      );
      const invoiceNo = this.padLeadingZeros(incInvoiceId.invoiceNo);

      if (customer.phone) {
        //find customerData with details
        const customerData: any = await this.customerModel.findOne({
          phone: customer.phone.toString(),
        });

        //find salesman details
        const salesManInfo = await this.adminModel.findOne({
          _id: salesman._id,
        });

        //If customer exists
        if (customerData?._id) {
          const mData = {
            ...addSalesDto,
            soldDate,
            ...{
              soldDateString: this.utilsService.getDateString(soldDate),
              salesman: {
                _id: salesManInfo._id,
                name: salesManInfo.name,
              },
              customer: customerData,
            },
            products: products,
            total,
            subTotal,
            discountAmount,
            invoiceNo,
          };

          const data = new this.preorderModel(mData);
          saveData = await data.save();
        }
        //If customer don't exists
        else {
          const data = new this.customerModel({
            ...customer,
          });
          newCustomer = await data.save();

          if (newCustomer._id) {
            const mData = {
              ...addSalesDto,
              soldDate,
              ...{
                soldDateString: this.utilsService.getDateString(soldDate),
                salesman: {
                  _id: salesManInfo._id,
                  name: salesManInfo.name,
                },
                customer: newCustomer,
              },
              products: products,
              total,
              subTotal,
              discountAmount,
              invoiceNo,
            };

            const data = new this.preorderModel(mData);
            saveData = await data.save();
          }
        }

        return {
          success: true,
          message: 'Success! Data Added.',
          data: {
            _id: saveData._id,
          },
        } as ResponsePayload;
      } else {
        //find salesman details
        const salesManInfo = await this.adminModel.findOne({
          _id: salesman._id,
        });

        const mData = {
          ...addSalesDto,
          soldDate,
          ...{
            soldDateString: this.utilsService.getDateString(soldDate),
            salesman: {
              _id: salesManInfo._id,
              name: salesManInfo.name,
            },
          },
          products: products,
          total,
          subTotal,
          discountAmount,
          invoiceNo,
        };

        const data = new this.preorderModel(mData);
        saveData = await data.save();

        return {
          success: true,
          message: 'Success! Data Added.',
          data: {
            _id: saveData._id,
          },
        } as ResponsePayload;
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * GET DATA
   * getAllSales()
   * getSalesById()
   * getCustomerSalesById()
   * getSalesmanSalesById()
   */
  async getAllSales(
    filterSalesDto: FilterAndPaginationSalesDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterSalesDto;
    const { pagination } = filterSalesDto;
    const { sort } = filterSalesDto;
    const { select } = filterSalesDto;

    // Essential Variables
    const aggregateStages = [];
    let mFilter = {};
    let mSort = {};
    let mSelect = {};
    let mPagination = {};

    // Match
    if (filter) {
      mFilter = { ...mFilter, ...filter };
    }
    if (searchQuery) {
      mFilter = {
        $and: [
          mFilter,
          {
            $or: [
              { invoiceNo: { $regex: searchQuery, $options: 'i' } },
              { 'customer.phone': { $regex: searchQuery, $options: 'i' } },
              { 'salesman.phone': { $regex: searchQuery, $options: 'i' } },
            ],
          },
        ],
      };
    }
    // Sort
    if (sort) {
      mSort = sort;
    } else {
      mSort = { createdAt: -1 };
    }

    // Select
    if (select) {
      mSelect = { ...select };
    } else {
      mSelect = { name: 1 };
    }

    // Finalize
    if (Object.keys(mFilter).length) {
      aggregateStages.push({ $match: mFilter });
    }

    if (Object.keys(mSort).length) {
      aggregateStages.push({ $sort: mSort });
    }

    if (!pagination) {
      aggregateStages.push({ $project: mSelect });
    }

    // Pagination
    if (pagination) {
      if (Object.keys(mSelect).length) {
        mPagination = {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [
              {
                $skip: pagination.pageSize * pagination.currentPage,
              } /* IF PAGE START FROM 0 OR (pagination.currentPage - 1) IF PAGE 1*/,
              { $limit: pagination.pageSize },
              { $project: mSelect },
            ],
          },
        };
      } else {
        mPagination = {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [
              {
                $skip: pagination.pageSize * pagination.currentPage,
              } /* IF PAGE START FROM 0 OR (pagination.currentPage - 1) IF PAGE 1*/,
              { $limit: pagination.pageSize },
            ],
          },
        };
      }

      aggregateStages.push(mPagination);

      aggregateStages.push({
        $project: {
          data: 1,
          count: { $arrayElemAt: ['$metadata.total', 0] },
        },
      });
    }

    try {
      const dataAggregates = await this.preorderModel.aggregate(
        aggregateStages,
      );
      if (pagination) {
        return {
          ...{ ...dataAggregates[0] },
          ...{ success: true, message: 'Success' },
        } as ResponsePayload;
      } else {
        return {
          data: dataAggregates,
          success: true,
          message: 'Success',
          count: dataAggregates.length,
        } as ResponsePayload;
      }
    } catch (err) {
      this.logger.error(err);
      if (err.code && err.code.toString() === ErrorCodes.PROJECTION_MISMATCH) {
        throw new BadRequestException('Error! Projection mismatch');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getSalesById(id: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.preorderModel.findById(id).select(select);
      console.log('data', data);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getSalesByDate(
    date: string,
    select?: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.preorderModel.find({ date: date });
      // console.log('data', data);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  async getCustomerSalesById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.preorderModel
        .find({ 'customer._id': id })
        .select(select);
      console.log('data', data);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getSalesmanSalesById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.preorderModel
        .find({ 'salesman._id': id })
        .select(select);
      console.log('data', data);
      return {
        success: true,
        message: 'Success',
        data,
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * UPDATE DATA
   * updateSalesById()
   * updateMultipleSalesById()
   */
  async updateSalesById(
    id: string,
    updateSalesDto: UpdateSalesDto,
  ): Promise<ResponsePayload> {
    try {
      // const finalData = { ...updateSalesDto };
      const { customer } = updateSalesDto;
      let customerData: Customer;
      const { soldDate } = updateSalesDto;

      if (customer && customer?._id) {
        customerData = await this.customerModel.findById(customer?._id);
      }

      if (customerData?._id) {
        const mData = {
          ...updateSalesDto,
          ...{
            soldDateString: this.utilsService.getDateString(soldDate),
            customer: customerData,
          },
        };
        await this.preorderModel.findByIdAndUpdate(id, {
          $set: mData,
        });
      } else {
        const mData = {
          ...updateSalesDto,
          ...{
            soldDateString: this.utilsService.getDateString(soldDate),
          },
        };
        await this.preorderModel.findByIdAndUpdate(id, {
          $set: mData,
        });
      }

      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async updateMultipleSalesById(
    ids: string[],
    updateSalesDto: UpdateSalesDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.preorderModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updateSalesDto },
      );

      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * DELETE DATA
   * deleteSalesById()
   * deleteMultipleSalesById()
   */
  async deleteSalesById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.preorderModel.findById(id);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
    if (!data) {
      throw new NotFoundException('No Data found!');
    }
    if (data.readOnly) {
      throw new NotFoundException('Sorry! Read only data can not be deleted');
    }
    try {
      await this.preorderModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleSalesById(
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.preorderModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * ADDITIONAL FUNCTIONS
   */
  padLeadingZeros(num) {
    return String(num).padStart(4, '0');
  }
}
