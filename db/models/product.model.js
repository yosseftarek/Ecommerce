import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "name is required"],
      minLength: 3,
      maxLength: 30,
      lowercase: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      minLength: 3,
      maxLength: 60,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      minLength: 3,
      trim: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
    image: {
      secure_url: String,
      public_id: String,
    },
    coverImages: [
      {
        secure_url: String,
        public_id: String,
      },
    ],
    customId: {
      type: String,
    },
    price: {
      type: Number,
      default: 1,
      min: 1,
    },
    discount: {
      type: Number,
      required: true,
      min: 1,
      max:100,
    },
    stock: {
      type: Number,
      required: true,
      default: 1,
    },
    rateAvg: {
      type: Number,
      default: 0,
    },
    rateNum: {
      type: Number,
      default: 0,
    },
    subPrice: {
      type: Number,
      default: 1,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "category",
      required: true,
    },
    subCategory: {
      type: mongoose.Types.ObjectId,
      ref: "subCategory",
      required: true,
    },
    brand: {
      type: mongoose.Types.ObjectId,
      ref: "brand",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const productModel = mongoose.model("product", productSchema);

export default productModel;
