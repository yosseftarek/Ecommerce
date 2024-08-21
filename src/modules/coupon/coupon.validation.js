import joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";

export const createCoupon = {
  body: joi
    .object({
      code: joi.string().min(3).max(30).required(),
      amount: joi.number().min(1).max(100).integer().required(),
      fromDate: joi.date()
        .required()
        .custom((value, helpers) => {
          if (value < Date.now()) {
            return helpers.message('"fromDate" must be today or a future date');
          }
          return value;
        }),
      toDate: joi.date().greater(joi.ref("fromDate")).required(),
    })
    .required(),
  header: generalFiled.headers.required(),
};

export const updateCoupon = {
  body: joi.object({
    code: joi.string().min(3).max(30),
    amount: joi.number().min(1).max(100).integer(),
    fromDate: joi.date().greater(Date.now()),
    toDate: joi.date().greater(joi.ref("fromDate")),
  }),
  header: generalFiled.headers.required(),
};
