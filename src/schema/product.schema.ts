import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: true,
      unique: true,
    },
    admin: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        required: false,
      },
      username: {
        type: String,
        required: false,
      },
    },
    category: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
    },
    subcategory: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
    },
    brand: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Brand',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
    },
    unit: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Unit',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
    },
    sku: {
      type: String,
      required: false,
    },
    others: {
      type: String,
      required: false,
    },
    quantity: {
      type: Number,
      default: 0,
      required: false,
    },
    model: {
      type: String,
      required: false,
    },
    productCode: {
      type: String,
      required: false,
    },
    description: {
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
    status: {
      type: Boolean,
      required: false,
      default: true,
    },
    minQuantity: {
      type: Number,
      default: 0,
      required: false,
    },
    soldQuantity: {
      type: Number,
      default: 0,
      required: false,
    },
    createdAtString: {
      type: String,
      required: false,
    },
    updatedAtString: {
      type: String,
      required: false,
    },
    images: [String],
    vendor: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Vendor',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      phone: {
        type: String,
        required: false,
      },
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
