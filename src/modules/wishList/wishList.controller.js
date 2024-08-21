import productModel from "../../../db/models/product.model.js";
import wishListModel from "../../../db/models/wishList.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";

//=============================== createWishList =========================================
export const createWishList = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const product = await productModel.findById({ _id: productId });
  if (!product) {
    return next(new AppError("product is not exist", 404));
  }

  const wishList = await wishListModel.findOne({ user: req.user._id });
  if (!wishList) {
    const newWishList = await wishListModel.create({
      user: req.user._id,
      products: [productId],
    });
    return res.status(201).json({ message: "done", wishList: newWishList });
  }
  const newWishList = await wishListModel.findOneAndUpdate(
    { user: req.user._id },
    { $addToSet: { products: productId } }, //check if it is already exist so it will not push it
    { new: true }
  );
  res.status(201).json({ message: "done", newWishList });
});

//=============================== removeWishList =========================================
export const removeWishList = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const product = await productModel.findById({ _id: productId });
  if (!product) {
    return next(new AppError("product is not exist", 404));
  }
  const wishList = await wishListModel.findOne({ user: req.user._id });
  if (wishList) {
    if (wishList.products.includes(productId)) {
      await wishListModel.findOneAndUpdate(
        { user: req.user._id },
        { $pull: { products: productId } },
        { new: true }
      );
    } else return next(new AppError("product is not in wishList", 404));
  }

  res.status(201).json({ message: "done" });
});
