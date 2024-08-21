import orderModel from "../../../db/models/order.model.js";
import productModel from "../../../db/models/product.model.js";
import reviewModel from "../../../db/models/review.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";

//=============================== createReview =========================================
export const createReview = asyncHandler(async (req, res, next) => {
  const { comment, rate } = req.body;
  const { productId } = req.params;

  //check if product exist
  const product = await productModel.findById(productId);
  if (!product) {
    return next(new AppError("product is not found", 404));
  }

  //check if review exist
  const reviewExist = await reviewModel.findOne({
    createdBy: req.user._id,
    productId,
  });
  if (reviewExist) {
    return next(new AppError("you are already reviewed", 404));
  }

  //check if order exist
  const order = await orderModel.findOne({
    user: req.user._id,
    status: "delivered",
    "products.productId": productId,
  });
  if (!order) {
    return next(new AppError("order is not found", 404));
  }

  const review = await reviewModel.create({
    comment,
    rate,
    productId,
    createdBy: req.user._id,
  });
  req.data = {
    model: reviewModel,
    id:review._id,
  };
  // const reviews = await reviewModel.find({ productId });
  // let sum = 0;
  // for (const review of reviews) {
  //   sum += review.rate;
  // }
  // product.rateAvg = sum / reviews.length;
  // product.rateNum+=1
  // await product.save();

  let sum = product.rateAvg * product.rateNum;
  sum += rate;

  product.rateNum += 1;
  product.rateAvg = sum / product.rateNum;

  product.save();

  res.status(201).json({ message: "done", review });
});

//=============================== updateReview =========================================
export const updateReview = asyncHandler(async (req, res, next) => {
  const { comment, rate } = req.body;
  const { productId, id } = req.params;

  //check if product exist
  const product = await productModel.findById(productId);
  if (!product) {
    return next(new AppError("product is not found", 404));
  }

  //check if review exist
  const reviewExist = await reviewModel.findOne({
    createdBy: req.user._id,
    productId,
  });
  if (reviewExist) {
    return next(new AppError("you didn't review on this product", 404));
  }

  const review = await reviewModel.findByIdAndUpdate( id ,
    {
      comment,
      rate,
    },
    { new: true }
  );
  req.data = {
    model: reviewModel,
    id:review._id,
  };
  res.status(201).json({ message: "done", review });
});

//=============================== deletereview =========================================
export const deleteReview = asyncHandler(async (req, res, next) => {
  const { id, productId } = req.params;

  // //check if review exist
  const review = await reviewModel.findOneAndDelete({
    createdBy: req.user._id,
    _id: id,
  });
  if (!review) {
    return next(new AppError("review is not exist", 404));
  }

  //check if product exist
  const product = await productModel.findById(productId);
  if (!product) {
    return next(new AppError("product is not found", 404));
  }
  let sum = product.rateAvg * product.rateNum;
  sum -= review.rate;

  product.rateNum -= 1;
  product.rateAvg = sum / product.rateNum;

  product.save();
  res.status(201).json({ message: "done", review });
});
