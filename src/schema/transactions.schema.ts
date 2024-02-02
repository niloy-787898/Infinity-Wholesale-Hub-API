import * as mongoose from 'mongoose';

export const TransactionsSchema = new mongoose.Schema(
  {
    dueAmount: {
      type: Number,
      required: false,
    },
    paidAmount: {
      type: Number,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    vendor: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
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

    images: [String],

    transactionDate: {
      type: Date,
      required: false,
    },
    transactionDateString: {
      type: String,
      required: false,
    },
  },

  {
    versionKey: false,
    timestamps: true,
  },
);
