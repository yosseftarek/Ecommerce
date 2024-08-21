import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
    products: [
      {
        title: { type: String, required: true },
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        finalPrice: { type: Number, required: true },
      },
    ],
    subPrice: { type: Number, required: true },
    couponId: { type: mongoose.Types.ObjectId, ref: "coupon" },
    totalPrice: { type: Number, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    paymentMethod: { type: String, enum: ["card", "cash"], required: true },
    status: {
      type: String,
      enum: [
        "placed",
        "delivered",
        "waitPayment",
        "onWay",
        "cancelled",
        "rejected",
      ],
      default: "placed",
    },
    cancelledBy: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    reason: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const orderModel = mongoose.model("order", orderSchema);

export default orderModel;
