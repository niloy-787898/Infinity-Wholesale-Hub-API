import * as mongoose from 'mongoose';

export const UniqueIdSchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      required: false,
    },
    invoiceNo: {
      type: Number,
      required: false,
    },
  },
  {
    versionKey: false,
    timestamps: false,
  },
);
