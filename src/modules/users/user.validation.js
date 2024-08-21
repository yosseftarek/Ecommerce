import joi from "joi";

export const signup = {
  body: joi.object({
      name: joi
        .string()
        .pattern(/^[a-zA-Z\s]+$/)
        .min(3)
        .max(30)
        .required(),
      email: joi.string().email().required(),
      password: joi.string().required(),
      cPassword: joi.string().equal(joi.ref("password")).required(),
      phone: joi
        .string()
        .pattern(/^\d{10}$/)
        .required(),
      age: joi.number().integer().min(18).max(100).required(),
      address: joi.string().min(3).max(100).required(),
    })
    .required(),
};
export const forgetPassword = {
  body: joi
    .object({
      email: joi.string().email().required(),
    })
    .required(),
};

export const resetPassword = {
  body: joi
    .object({
      email: joi.string().email().required(),
      password: joi.string().required(),
      code: joi.string().min(5).max(5).required(),
    })
    .required(),
};
export const signin = {
  body: joi
    .object({
      email: joi.string().email().required(),
      password: joi.string().required(),
    })
    .required(),
};
