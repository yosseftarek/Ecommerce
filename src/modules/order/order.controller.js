import Stripe from "stripe";
import cartModel from "../../../db/models/cart.model.js";
import couponModel from "../../../db/models/coupon.model.js";
import orderModel from "../../../db/models/order.model.js";
import productModel from "../../../db/models/product.model.js";
import { sendEmail } from "../../service/sendEmail.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import { payment } from "../../utils/payment.js";
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
    id: order._id,
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

  // const invoice = {
  //   shipping: {
  //     name: req.user.name,
  //     address: req.user.address,
  //     city: "Egypt",
  //     state: "cairo",
  //     country: "cairo",
  //     postal_code: 94111,
  //   },
  //   items: order.products,
  //   subtotal: order.subPrice,
  //   paid: order.totalPrice,
  //   invoice_nr: order._id,
  //   date: order.createdAt,
  //   coupon: req.body?.coupon?.amount || 0,
  // };

  // await createInvoice(invoice, "invoice.pdf");

  // await sendEmail(
  //   req.user.email,
  //   "Order placed",
  //   `Your order has been placed successfully`,
  //   [
  //     {
  //       path: "invoice.pdf",
  //       contentType: "application/pdf",
  //     },
  //     {
  //       path: "logo.jpg",
  //       contentType: "image/jpg",
  //     },
  //   ]);

  if (paymentMethod == "card") {
    const stripe = new Stripe(process.env.stripe_secret);
    if (req.body?.coupon) {
      const coupon = await stripe.coupons.create({
        percent_off: req.body.coupon.amount,
        duration: "once",
      });
      req.body.couponId = coupon.id;
    }
    const session = await payment({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      metadata: {
        orderId: order._id.toString(),
      },
      success_url: `${req.protocol}://${req.headers.host}/orders/success/${order._id}`,
      cancel_url: `${req.protocol}://${req.headers.host}/orders/cancel/${order._id}`,
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "egp",
            product_data: {
              name: product.title,
            },
            unit_amount: product.price * 100,
          },
          quantity: product.quantity,
        };
      }),
      discounts: req.body?.coupon ? [{ coupon: req.body.couponId }] : [],
    });
    res.status(201).json({ message: "done", url: session.url, session });
  }
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

//=============================== webhook =========================================
export const webhook = asyncHandler(async (req, res, next) => {
  const stripe = new Stripe(process.env.stripe_secret);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.endpointSecret
    );
  } catch (err) {
    res.status(400).send(`webhook error:${err.message}`);
    return;
  }

  if (event.type != "checkout.session.completed") {
    await orderModel.findOneAndUpdate(
      { _id: event.data.object.metadata.orderId },
      { status: "rejected" }
    );
    return res.status(400).json({ message: "fail" });
  }
  await orderModel.findOneAndUpdate(
    { _id: event.data.object.metadata.orderId },
    { status: "placed" }
  );
  res.status(200).json({ message: "done" });
});
