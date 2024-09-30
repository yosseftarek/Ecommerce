import { nanoid } from "nanoid";
import couponModel from "../../../db/models/coupon.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import slugify from "slugify";

//=============================== createCoupon =========================================
export const createCoupon = asyncHandler(async (req, res, next) => {
  const { code, amount, fromDate, toDate } = req.body;

  const couponExist = await couponModel.findOne({
    code: code.toLowerCase(),
  });
  couponExist && next(new AppError("coupon already exist", 409));

  const coupon = await couponModel.create({
    code,
    amount,
    fromDate,
    toDate,
    createdBy: req.user._id,
  });
  req.data = {
    model: couponModel,
    id:coupon._id,
  };
  res.status(201).json({ message: "done", coupon });
});

//=============================== updateCoupon =========================================
export const updateCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { code, amount, fromDate, toDate } = req.body;
  const couponExist=await couponModel.findById(id)
  if (!couponExist) {
    return next(new AppError("coupon is not exist", 409));
  }
  const coupon = await couponModel.findOneAndUpdate(
    { _id: id, createdBy: req.user._id },
    { code, amount, fromDate, toDate },
    { new: true }
  );
  req.data = {
    model: couponModel,
    id:coupon._id,
  };
  if (!coupon) {
    return next(new AppError("you do not have a permission", 409));
  }
  res.status(201).json({ message: "done", coupon });
});

//=============================== deleteCoupon =========================================
export const deleteCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await couponModel.findOneAndDelete({
    _id: id,
    createdBy: req.user._id,
  });
  req.data = {
    model: couponModel,
    id:coupon._id,
  };
  if (!coupon) {
    return next(new AppError("coupon is not exist or you do not have a permission", 409));
  }
  res.status(201).json({ message: "done", coupon });
});
