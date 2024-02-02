import {
  BadRequestException,
  ConflictException,
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
  AddProductDto,
  FilterAndPaginationProductDto,
  UpdateProductDto,
} from '../../dto/product.dto';
import { Product } from 'src/interfaces/common/product.interface';
import { SubCategory } from '../../interfaces/common/sub-category.interface';
import { Brand } from '../../interfaces/common/brand.interface';
import { UniqueId } from 'src/interfaces/core/unique-id.interface';
import { Unit } from 'src/interfaces/common/unit.interface';
import { Category } from 'src/interfaces/common/category.interface';
import { ProductPurchase } from '../../interfaces/common/product-purchase.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class ProductService {
  private logger = new Logger(ProductService.name);

  constructor(
    @InjectModel('Product')
    private readonly productModel: Model<Product>,
    @InjectModel('Category')
    private readonly categoryModel: Model<Category>,
    @InjectModel('SubCategory')
    private readonly SubCategoryModel: Model<SubCategory>,
    @InjectModel('Brand')
    private readonly brandModel: Model<Brand>,
    @InjectModel('Unit')
    private readonly unitModel: Model<Unit>,
    @InjectModel('UniqueId')
    private readonly uniqueIdModel: Model<UniqueId>,
    @InjectModel('ProductPurchase')
    private readonly productPurchaseModel: Model<ProductPurchase>,

    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {}

  /**
   * ADD DATA
   * addProduct()
   * insertManyProduct()
   */
  async addProduct(addProductDto: AddProductDto): Promise<ResponsePayload> {
    try {
      const createdAtString = this.utilsService.getDateString(new Date());

      const incOrder = await this.uniqueIdModel.findOneAndUpdate(
        {},
        { $inc: { productId: 1 } },
        { new: true, upsert: true },
      );

      console.log(incOrder);

      const productIdUnique = this.utilsService.padLeadingZeros(
        incOrder.productId,
      );

      const dataExtra = {
        productId: productIdUnique,
        createdAtString: createdAtString,
        soldQuantity: 0,
      };

      const mData = {
        ...addProductDto,
        ...dataExtra,
      };

      const data = new this.productModel(mData);
      const saveData = await data.save();

      const purchaseData = {
        product: {
          _id: saveData._id,
          name: addProductDto.name || null,
          sku: addProductDto.sku || null,
          others: addProductDto.others || null,
          model: addProductDto.model || null,
          salePrice: addProductDto.salePrice || null,
          purchasePrice: addProductDto.purchasePrice || null,
        },
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        previousQuantity: 0,
        updatedQuantity: addProductDto.quantity,
        createdAtString: this.utilsService.getDateString(new Date()),
      };
      await new this.productPurchaseModel(purchaseData).save();

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

  async insertManyProduct(
    addProductsDto: AddProductDto[],
  ): Promise<ResponsePayload> {
    try {
      for (let i = 0; i < addProductsDto.length; i++) {
        addProductsDto[i].createdAtString = this.utilsService.getDateString(
          new Date(),
        );
        if (addProductsDto[i].category) {
          const category = await this.categoryModel.findOne({
            name: { $regex: addProductsDto[i].category, $options: 'i' },
          });

          if (category) {
            addProductsDto[i].category = {
              _id: category._id,
              name: category.name,
            };
          } else {
            const newCatSchema = new this.categoryModel({
              name: addProductsDto[i].category,
            });
            const newCat = await newCatSchema.save();
            addProductsDto[i].category = {
              _id: newCat._id,
              name: newCat.name,
            };
          }
        }

        const incOrder = await this.uniqueIdModel.findOneAndUpdate(
          {},
          { $inc: { productId: 1 } },
          { new: true, upsert: true },
        );
        addProductsDto[i].productId = this.utilsService.padLeadingZeros(
          incOrder.productId,
        );
        addProductsDto[i].soldQuantity = 0;
      }

      console.log('addProductsDto', addProductsDto.length);

      await this.productModel.insertMany(addProductsDto);

      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (error) {
      // console.log(error);
      if (error.code && error.code.toString() === ErrorCodes.UNIQUE_FIELD) {
        throw new ConflictException('Slug Must be Unique');
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  /**
   * GET DATA
   * getAllProducts()
   * getProductById()
   * getUserProductById()
   */
  async getAllProducts(
    filterProductDto: FilterAndPaginationProductDto,
    searchQuery?: string,
  ): Promise<ResponsePayload> {
    const { filter } = filterProductDto;
    const { pagination } = filterProductDto;
    const { sort } = filterProductDto;
    const { select } = filterProductDto;

    // Essential Variables
    const aggregateStages = [];
    let mFilter = {};
    let mSort = {};
    let mSelect = {};
    let mPagination = {};

    // Calculations
    const aggregateStagesCalculation = [];

    // Match
    if (filter) {
      if (filter['category._id']) {
        filter['category._id'] = new ObjectId(filter['category._id']);
      }

      if (filter['vendor._id']) {
        filter['vendor._id'] = new ObjectId(filter['vendor._id']);
      }

      if (filter['brand._id']) {
        filter['brand._id'] = new ObjectId(filter['brand._id']);
      }

      if (filter['unit._id']) {
        filter['unit._id'] = new ObjectId(filter['unit._id']);
      }

      mFilter = { ...mFilter, ...filter };

      // Calculations
      const group = {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          sumPurchasePrice: { $sum: '$purchasePrice' },
          sumSalePrice: { $sum: '$salePrice' },
          totalPurchasePrice: {
            $sum: {
              $multiply: ['$purchasePrice', '$quantity'],
            },
          },
          totalSalePrice: {
            $sum: {
              $multiply: ['$salePrice', '$quantity'],
            },
          },
        },
      };

      aggregateStagesCalculation.push({ $match: mFilter });
      aggregateStagesCalculation.push(group);
    } else {
      // Calculations
      const group = {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          sumPurchasePrice: { $sum: '$purchasePrice' },
          sumSalePrice: { $sum: '$salePrice' },
          totalPurchasePrice: {
            $sum: {
              $multiply: ['$purchasePrice', '$quantity'],
            },
          },
          totalSalePrice: {
            $sum: {
              $multiply: ['$salePrice', '$quantity'],
            },
          },
        },
      };
      aggregateStagesCalculation.push(group);
    }
    if (searchQuery) {
      mFilter = {
        $and: [
          mFilter,
          {
            $or: [
              { name: { $regex: searchQuery, $options: 'i' } },
              { sku: { $regex: searchQuery, $options: 'i' } },
              { model: { $regex: searchQuery, $options: 'i' } },
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
      const dataAggregates = await this.productModel.aggregate(aggregateStages);

      const calculateAggregates = await this.productModel.aggregate(
        aggregateStagesCalculation,
      );

      if (pagination) {
        return {
          ...{ ...dataAggregates[0] },
          ...{
            success: true,
            message: 'Success',
            calculation: calculateAggregates[0],
          },
        } as ResponsePayload;
      } else {
        return {
          data: dataAggregates,
          success: true,
          message: 'Success',
          count: dataAggregates.length,
          calculation: calculateAggregates[0],
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

  async getProductById(id: string, select: string): Promise<ResponsePayload> {
    try {
      const data = await this.productModel.findById(id).select(select);
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

  async getProductByName(
    name: string,
    select?: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.productModel.find({ name: name });
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

  async getUserProductById(
    id: string,
    select: string,
  ): Promise<ResponsePayload> {
    try {
      const data = await this.productModel.findById(id).select(select);
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
   * updateProductById()
   * updateMultipleProductById()
   */
  async updateProductById(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ResponsePayload> {
    try {
      // const finalData = { ...updateProductDto };
      const { category } = updateProductDto;
      const { subcategory } = updateProductDto;
      const { brand } = updateProductDto;
      const { unit } = updateProductDto;
      const categoryData = await this.categoryModel.findById(category);
      const subcategoryData = await this.SubCategoryModel.findById(subcategory);
      const brandData = await this.brandModel.findById(brand);
      const unitData = await this.unitModel.findById(unit);
      const createdAtString = this.utilsService.getDateString(new Date());
      const mData = {
        ...updateProductDto,
        ...{
          category: categoryData,
          subcategory: subcategoryData,
          brand: brandData,
          unit: unitData,
          createdAtString: createdAtString,
        },
      };

      // const data = new this.productModel(mData);
      const previousProductData: Product = await this.productModel.findById(id);
      await this.productModel.findByIdAndUpdate(id, {
        $set: mData,
      });

      const purchaseData = {
        product: {
          _id: id,
          name: updateProductDto.name,
          sku: updateProductDto.sku || null,
          others: updateProductDto.others || null,
          model: updateProductDto.model || null,
          salePrice: updateProductDto.salePrice || null,
          purchasePrice: updateProductDto.purchasePrice || null,
        },

        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        previousQuantity: previousProductData.quantity,
        updatedQuantity: updateProductDto.quantity,
        createdAtString: this.utilsService.getDateString(new Date()),
      };
      await new this.productPurchaseModel(purchaseData).save();

      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async updateMultipleProductById(
    ids: string[],
    updateProductDto: UpdateProductDto,
  ): Promise<ResponsePayload> {
    const mIds = ids.map((m) => new ObjectId(m));

    try {
      await this.productModel.updateMany(
        { _id: { $in: mIds } },
        { $set: updateProductDto },
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
   * deleteProductById()
   * deleteMultipleProductById()
   */
  async deleteProductById(
    id: string,
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    let data;
    try {
      data = await this.productModel.findById(id);
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
      await this.productModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMultipleProductById(
    ids: string[],
    checkUsage: boolean,
  ): Promise<ResponsePayload> {
    try {
      const mIds = ids.map((m) => new ObjectId(m));
      await this.productModel.deleteMany({ _id: mIds });
      return {
        success: true,
        message: 'Success',
      } as ResponsePayload;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
