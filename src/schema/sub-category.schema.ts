import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const SubCategorySchema = new mongoose.Schema(
  {
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
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: false,
    },
    description: {
      type: String,
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
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
