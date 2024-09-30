import joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";

export const createWishList = {
  params: joi
    .object({
      productId: generalFiled.id.required(),
    })
    .required(),
  headers: generalFiled.headers.required().options({ allowUnknown: true }),
};
export const removeWishList = {
  params: joi
    .object({
      productId: generalFiled.id.required(),
    })
    .required(),
  headers: generalFiled.headers.required().options({ allowUnknown: true }),
};
