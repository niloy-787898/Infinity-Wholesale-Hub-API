import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const SalesSchema = new mongoose.Schema(
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
      name: {
        type: String,
        required: false,
      },
      address: {
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
        sku: {
          type: String,
          required: false,
        },
        images: [String],
        salePrice: {
          type: Number,
          default: 0,
          required: true,
        },
        purchasePrice: {
          type: Number,
          default: 0,
          required: true,
        },
        model: {
          type: String,
        },
        others: {
          type: String,
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
    discountPercent: {
      type: Number,
      default: 0,
      required: false,
    },
    shippingCharge: {
      type: Number,
      default: 0,
      required: false,
    },
    status: {
      type: String,
      enum: ['Pending', 'Hold', 'Ready for Shipping', 'Completed', 'Canceled'],
      default: 'Pending',
    },
    totalPurchasePrice: {
      type: Number,
      default: 0,
      required: true,
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
    month: {
      type: Number,
      default: 0,
    },
    year: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
