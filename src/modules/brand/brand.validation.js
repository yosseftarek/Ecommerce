import joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";

export const createBrand= {
  body: joi
    .object({
      name: joi.string().min(3).max(30).required(),
    })
    .required(),
  file: generalFiled.file.required(),
  header: generalFiled.headers.required(),
};

export const updateBrand= {
  body: joi
    .object({
      name: joi.string().min(3).max(30),
    })
    .required(),
  file: generalFiled.file,
  header: generalFiled.headers.required(),
};
