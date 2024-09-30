import joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";

export const createCart = {
  body: joi
    .object({
      productId: generalFiled.id.required(),
      quantity: joi.number().integer().required(),
    })
    .required(),
  headers: generalFiled.headers.required().options({ allowUnknown: true }),
};

export const removeCart = {
  body: joi
    .object({
      productId: generalFiled.id.required(),
    })
    .required(),
  headers: generalFiled.headers.required().options({ allowUnknown: true }),
};

export const clearCart = {
  headers: generalFiled.headers.required().options({ allowUnknown: true }),
};

export const getCart = {
  headers: generalFiled.headers.required().options({ allowUnknown: true }),
};
