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
  AddProductPurchaseDto,
  FilterAndPaginationProductPurchaseDto,
  UpdateProductPurchaseDto,
} from '../../dto/product-purchase.dto';
import { ProductPurchase } from 'src/interfaces/common/product-purchase.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class ProductPurchaseService {
  private logger = new Logger(ProductPurchaseService.name);

  constructor(
    @InjectModel('ProductPurchase')
    private readonly productPurchaseModel: Model<ProductPurchase>,
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * ADD DATA
   * addProductPurchase()
   * insertManyProductPurchase()
   */
  async addProductPurchase(
    addProductPurchaseDto: AddProductPurchaseDto,
  ): Promise<ResponsePayload> {
    try {
      const { date } = addProductPurchaseDto;
      const dateString = this.utilsService.getDateString(new Date());
      const mData = {
        ...addProductPurchaseDto,
        dateString,
      };
      const data = new this.productPurchaseModel(mData);
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
   * getAllProductPurchases()
   * getProductPurchaseById()
   * getUserProductPurchaseById()
   */
  async getAllProductPurchases(
    filterProductPurchaseDto: FilterAndPaginationProductPurchaseDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterProductPurchaseDto;
    const { pagination } = filterProductPurchaseDto;
    const { sort } = filterProductPurchaseDto;
    const { select } = filterProductPurchaseDto;

    // Essential Variables
    const aggregateStages = [];

    //calculations
    const aggregateStagesCalculation = [];
    let mFilter = {};
    let mSort = {};
    let mSelect = {};
    let mPagination = {};

    // Match
    if (filter) {
      mFilter = { ...mFilter, ...filter };

      if (searchQuery) {
        mFilter = { ...mFilter, ...{ name: new RegExp(searchQuery, 'i') } };
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
        const dataAggregates = await this.productPurchaseModel.aggregate(
          aggregateStages,
        );

        if (pagination) {
          return {
            ...{ ...dataAggregates[0] },
            ...{
              success: true,
              message: 'Success',
            },
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
        if (
          err.code &&
          err.code.toString() === ErrorCodes.PROJECTION_MISMATCH
        ) {
          throw new BadRequestException('Error! Projection mismatch');
        } else {
          throw new InternalServerErrorException();
        }
      }
    }
  }

  async getProductPurchaseById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.productPurchaseModel.findById(id).select(select);
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

  async getProductPurchaseByDate(
    date: string,
    select?: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.productPurchaseModel.find({ date: date });
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

  async getUserProductPurchaseById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.productPurchaseModel.findById(id).select(select);
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
   * updateProductPurchaseById()
   * updateMultipleProductPurchaseById()
   */
  async updateProductPurchaseById(
    id: string,
    updateProductPurchaseDto: UpdateProductPurchaseDto,
  ): Promise<ResponsePayload> {
    try {
      const finalData = { ...updateProductPurchaseDto };

      await this.productPurchaseModel.findByIdAndUpdate(id, {
        $set: finalData,
      });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async updateMultipleProductPurchaseById(
    ids: string[],
    updateProductPurchaseDto: UpdateProductPurchaseDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.productPurchaseModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updateProductPurchaseDto },
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
   * deleteProductPurchaseById()
   * deleteMultipleProductPurchaseById()
   */
  async deleteProductPurchaseById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.productPurchaseModel.findById(id);
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
      await this.productPurchaseModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleProductPurchaseById(
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.productPurchaseModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
