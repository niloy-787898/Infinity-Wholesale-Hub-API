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
  AddReturnSalesDto,
  FilterAndPaginationReturnSalesDto,
  UpdateReturnSalesDto,
} from '../../dto/return-sales.dto';
import { NewSalesReturn } from 'src/interfaces/common/new-sales-return.interface';
import { Customer } from '../../interfaces/common/customer.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class ReturnSalesService {
  private logger = new Logger(ReturnSalesService.name);

  constructor(
    @InjectModel('ReturnSales')
    private readonly ReturnSalesModel: Model<NewSalesReturn>,
    @InjectModel('Customer')
    private readonly customerModel: Model<Customer>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * ADD DATA
   * addReturnSales()
   * insertManyReturnSales()
   */
  async addReturnSales(
    addReturnSalesDto: AddReturnSalesDto,
  ): Promise<ResponsePayload> {
    try {
      const { date } = addReturnSalesDto;
      const { customer } = addReturnSalesDto;

      const customerData = await this.customerModel.findById(customer);

      const mData = {
        ...addReturnSalesDto,
        ...{
          date: this.utilsService.getDateString(date),
          // customer: {
          //   _id: customerData._id,
          //   name: customerData.name,
          // },
          customer: customerData,
        },
      };
      const data = new this.ReturnSalesModel(mData);
      const saveData = await data.save();

      return {
        success: true,
        message: 'Success! Data Added.',
        data: {
          _id: saveData._id,
        },
      } as ResponsePayload;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * GET DATA
   * getAllReturnSales()
   * getReturnSalesById()
   * getUserReturnSalesById()
   */
  async getAllReturnSales(
    filterReturnSalesDto: FilterAndPaginationReturnSalesDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterReturnSalesDto;
    const { pagination } = filterReturnSalesDto;
    const { sort } = filterReturnSalesDto;
    const { select } = filterReturnSalesDto;

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
      const dataAggregates = await this.ReturnSalesModel.aggregate(
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

  async getReturnSalesById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.ReturnSalesModel.findById(id).select(select);
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

  async getReturnSalesByDate(
    date: string,
    select?: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.ReturnSalesModel.find({ date: date });
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

  async getUserReturnSalesById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.ReturnSalesModel.findById(id).select(select);
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
   * updateReturnSalesById()
   * updateMultipleReturnSalesById()
   */
  async updateReturnSalesById(
    id: string,
    updateReturnSalesDto: UpdateReturnSalesDto,
  ): Promise<ResponsePayload> {
    try {
      // const finalData = { ...updateReturnSalesDto };
      const { customer } = updateReturnSalesDto;

      const { date } = updateReturnSalesDto;
      const customerData = await this.customerModel.findById(customer);

      const mData = {
        ...updateReturnSalesDto,
        ...{
          date: this.utilsService.getDateString(date),
          customer: customerData,
        },
      };

      await this.ReturnSalesModel.findByIdAndUpdate(id, {
        $set: mData,
      });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async updateMultipleReturnSalesById(
    ids: string[],
    updateReturnSalesDto: UpdateReturnSalesDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.ReturnSalesModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updateReturnSalesDto },
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
   * deleteReturnSalesById()
   * deleteMultipleReturnSalesById()
   */
  async deleteReturnSalesById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.ReturnSalesModel.findById(id);
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
      await this.ReturnSalesModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleReturnSalesById(
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.ReturnSalesModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
