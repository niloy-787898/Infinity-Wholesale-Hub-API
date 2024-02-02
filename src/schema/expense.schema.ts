import * as mongoose from 'mongoose';

export const ExpenseSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: false,
    },
    dateString: {
      type: String,
      required: false,
    },
    dueAmount: {
      type: Number,
      required: false,
    },
    paidAmount: {
      type: Number,
      required: false,
    },
    expenseFor: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },

    images: [String],
  },

  {
    versionKey: false,
    timestamps: true,
  },
);
