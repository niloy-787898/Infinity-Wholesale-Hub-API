import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const PreOrderSchema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: false,
      },
      phone: {
        type: String,
        required: false,
      },
    },
    salesman: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
    },
    products: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: false,
        },
        soldQuantity: {
          type: Number,
          default: 0,
          required: true,
        },
        name: {
          type: String,
          required: false,
        },
        images: [String],
        salePrice: {
          type: Number,
          default: 0,
          required: true,
        },
      },
    ],
    soldDate: {
      type: Date,
      required: true,
    },
    soldDateString: {
      type: String,
      required: true,
    },

    referenceNo: {
      type: String,
      required: false,
    },
    discountType: {
      type: String,
      required: false,
    },
    discountAmount: {
      type: Number,
      default: 0,
      required: false,
    },
    advanceAmount: {
      type: Number,
      default: 0,
      required: false,
    },
    status: {
      type: String,
      required: false,
    },

    total: {
      type: Number,
      default: 0,
      required: true,
    },

    subTotal: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
