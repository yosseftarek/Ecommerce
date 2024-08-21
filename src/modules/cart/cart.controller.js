import { nanoid } from "nanoid";
import cartModel from "../../../db/models/cart.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import slugify from "slugify";
import productModel from "../../../db/models/product.model.js";

//=============================== createCart =========================================
export const createCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;

  const product = await productModel.findOne({
    _id: productId,
    // stock: { $gte: quantity },
  });
  if (!product) {
    return next(new AppError("product not exist", 404));
  }
  if (product.stock < quantity) {
    return next(new AppError("product is out of stock", 404));
  }
  const cartExist = await cartModel.findOne({ user: req.user._id });
  if (!cartExist) {
    const cart = await cartModel.create({
      user: req.user._id,
      products: [
        {
          productId,
          quantity,
        },
      ],
    });
    return res.status(201).json({ message: "done", cart });
  }

  //cart exits => add product
  let flag = false;
  for (const product of cartExist.products) {
    //check if product is exist in cart
    if (productId == product.productId) {
      product.quantity += quantity;
      flag = true;
    }
  }
  if (!flag) {
    cartExist.products.push({
      productId,
      quantity,
    });
  }
  await cartExist.save();
  req.data = {
    model: cartModel,
    id:cartExist._id,
  };
  return res.status(201).json({ message: "done", cart: cartExist });
});

//=============================== removeCart =========================================
export const removeCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;

  const cartExist = await cartModel.findOneAndUpdate(
    {
      user: req.user._id,
      //loop on products to ensure that the product is in cart
      "products.productId": productId,
    },
    {
      $pull: { products: { productId } },
    },
    { new: true }
  );
  req.data = {
    model: cartModel,
    id:cartExist._id,
  };
  res.status(201).json({ message: "done", cart: cartExist });
});

//=============================== clearCart =========================================
export const clearCart = asyncHandler(async (req, res, next) => {
  const cartExist = await cartModel.findOneAndUpdate(
    {
      user: req.user._id,
    },
    {
      products: [],
    },
    { new: true }
  );
  req.data = {
    model: cartModel,
    id:cartExist._id,
  };
  res.status(201).json({ message: "done", cart: cartExist });
});
