import joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";

export const createReview = {
  body: joi.object({
    comment: joi.string().required(),
    rate: joi.number().min(1).max(5).integer().required(),
  }),
  params: joi
    .object({
      productId: generalFiled.id.required(),
    })
    .required(),
  headers: generalFiled.headers.required().options({ allowUnknown: true }),
};

export const updateReview = {
  body: joi.object({
    comment: joi.string(),
    rate: joi.number().min(1).max(5).integer(),
  }),
  params: joi
    .object({
      id: generalFiled.id.required(),
      productId: generalFiled.id.required(),
    })
    .required(),
  headers: generalFiled.headers.required().options({ allowUnknown: true }),
};

export const deleteReview = {
  params: joi
    .object({
      id: generalFiled.id.required(),
      productId: generalFiled.id.required(),
    })
    .required(),
  header: generalFiled.headers.required(),
};
