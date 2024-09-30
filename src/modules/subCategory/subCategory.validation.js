import joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";

export const createSubCategorySchema = {
  body: joi
    .object({
      name: joi.string().min(3).max(30).required(),
    })
    .required(),
  file: generalFiled.file.required(),
  headers: generalFiled.headers.required().options({ allowUnknown: true }),
  params: joi.object({
    categoryId: generalFiled.id.required(),
  }),
};

export const updateSubCategorySchema = {
  body: joi
    .object({
      name: joi.string().min(3).max(30),
    })
    .required(),
  file: generalFiled.file,
  headers: generalFiled.headers.required().options({ allowUnknown: true }),
};
