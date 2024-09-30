import joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";

export const createOrder = {
  body: joi
    .object({
      productId: generalFiled.id,
      quantity: joi.number().integer(),
      phone: joi.string().required(),
      address: joi.string().required(),
      couponCode: joi.string().min(3),
      paymentMethod: joi.string().valid("card", "cash").required(),
    })
    .required(),
  headers: generalFiled.headers.required().options({ allowUnknown: true }),
};

export const cancelOrder = {
  body: joi
    .object({
      reason: joi.string().min(3),
    })
    .required(),
  params: joi.object({
    id: generalFiled.id.required(),
  }),
  headers: generalFiled.headers.required().options({ allowUnknown: true }),
};
