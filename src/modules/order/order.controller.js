import cartModel from "../../../db/models/cart.model.js";
import couponModel from "../../../db/models/coupon.model.js";
import orderModel from "../../../db/models/order.model.js";
import productModel from "../../../db/models/product.model.js";
import { sendEmail } from "../../service/sendEmail.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import { createInvoice } from "../../utils/pdf.js";

//=============================== createorder =========================================
export const createOrder = asyncHandler(async (req, res, next) => {
  const { productId, quantity, couponCode, address, phone, paymentMethod } =
    req.body;

  if (couponCode) {
    const coupon = await couponModel.findOne({
      code: couponCode.toLowerCase(),
      usedBy: { $nin: [req.user._id] },
    });
    if (!coupon || coupon.toDate < Date.now()) {
      return next(
        new AppError(
          "invalid coupon code or coupon already used or expired",
          404
        )
      );
    }
    req.body.coupon = coupon;
  }

  let products = [];
  let flag = false;
  if (productId) {
    products = [{ productId, quantity }];
  } else {
    const cart = await cartModel.findOne({ user: req.user._id });
    if (!cart.products.length) {
      return next(new AppError("cart is empty please select products", 404));
    }
    products = cart.products;
    flag = true;
  }
  let finalProducts = [];
  let subPrice = 0;
  for (let product of products) {
    const checkProduct = await productModel.findOne({
      _id: product.productId,
      stock: { $gte: product.quantity },
    });
    if (!checkProduct) {
      return next(new AppError("product is not exist or out of stock", 404));
    }
    if (flag) {
      product = product.toObject();
    }
    product.title = checkProduct.title;
    product.price = checkProduct.price;
    product.finalPrice = checkProduct.subPrice * product.quantity;
    subPrice += product.finalPrice;
    finalProducts.push(product);
  }
  const order = await orderModel.create({
    user: req.user._id,
    products: finalProducts,
    subPrice,
    couponId: req.body?.coupon?._id,
    totalPrice: subPrice - subPrice * ((req.body?.coupon?.amount || 0) / 100),
    paymentMethod,
    status: paymentMethod == "cash" ? "placed" : "waitPayment",
    phone,
    address,
  });
  req.data = {
    model: orderModel,
    id:order._id,
  };
  if (req.body?.coupon) {
    await couponModel.updateOne(
      { _id: req.body?.coupon._id },
      { $push: { usedBy: req.user._id } }
    );
  }
  
  for (const product of order.products) {
    await productModel.updateOne(
      { _id: product.productId },
      {
        $inc: { stock: -product.quantity },
      }
    );
  }

  if (flag) {
    await cartModel.updateOne({ user: req.user._id }, { products: [] });
  }

  const invoice = {
    shipping: {
      name: req.user.name,
      address: req.user.address,
      city: "Egypt",
      state: "cairo",
      country: "cairo",
      postal_code: 94111,
    },
    items: order.products,
    subtotal: order.subPrice,
    paid: order.totalPrice,
    invoice_nr: order._id,
    date: order.createdAt,
    coupon: req.body?.coupon?.amount || 0,
  };

  await createInvoice(invoice, "invoice.pdf");

  await sendEmail(
    req.user.email,
    "Order placed",
    `Your order has been placed successfully`,
    [
      {
        path: "invoice.pdf",
        contentType: "application/pdf",
      },
      {
        path: "logo.jpg",
        contentType: "image/jpg",
      },
    ]
  );
  res.status(201).json({ message: "done", order });
});

//=============================== cancelorder =========================================
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await orderModel.findOne({ _id: id, user: req.user._id });
  if (!order) {
    return next(new AppError("order is not found", 404));
  }

  if (
    (order.paymentMethod === "cash" && order.status != "placed") ||
    (order.paymentMethod === "card" && order.status != "waitPayment")
  ) {
    return next(new AppError("You can not cancel this order", 404));
  }

  await orderModel.updateOne(
    { _id: id },
    {
      status: "cancelled",
      cancelledBy: req.user._id,
      reason,
    }
  );
  if (order?.couponId) {
    await couponModel.updateOne(
      { _id: order?.couponId },
      { $pull: { usedBy: req.user._id } }
    );
  }

  for (const product of order.products) {
    await productModel.updateOne(
      { _id: product.productId },
      {
        $inc: { stock: product.quantity },
      }
    );
  }
  res.json({ msg: "done" });
});
