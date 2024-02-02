import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const ProductPurchaseSchema = new mongoose.Schema(
  {
    product: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      sku: {
        type: String,
        required: false,
      },
      others: {
        type: String,
        required: false,
      },
      model: {
        type: String,
        required: false,
      },
      purchasePrice: {
        type: Number,
        default: 0,
        min: 1,
        required: false,
      },
      salePrice: {
        type: Number,
        default: 0,
        min: 1,
        required: false,
      },
    },
    previousQuantity: {
      type: Number,
      default: 0,
      required: false,
    },
    month: {
      type: Number,
    },
    year: {
      type: Number,
    },
    updatedQuantity: {
      type: Number,
      default: 0,
      required: false,
    },
    createdAtString: {
      type: String,
      required: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
